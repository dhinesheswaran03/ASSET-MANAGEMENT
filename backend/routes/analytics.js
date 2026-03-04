const express = require("express");
const router = express.Router();
const pool = require("../db");

// ── Net Worth History ─────────────────────────────────────────────────────

// Save snapshot (called by cron job daily)
router.post("/snapshot", async (req, res) => {
  try {
    const a = await pool.query("SELECT COALESCE(SUM(current_price * quantity),0) AS total FROM assets");
    const l = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM liabilities");
    const totalAssets = Number(a.rows[0].total);
    const totalLiabilities = Number(l.rows[0].total);
    const netWorth = totalAssets - totalLiabilities;

    // Avoid duplicate snapshots on same day
    const existing = await pool.query(
      "SELECT id FROM networth_history WHERE DATE(recorded_at) = CURRENT_DATE"
    );
    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE networth_history SET total_assets=$1, total_liabilities=$2, net_worth=$3 WHERE DATE(recorded_at)=CURRENT_DATE",
        [totalAssets, totalLiabilities, netWorth]
      );
    } else {
      await pool.query(
        "INSERT INTO networth_history (total_assets, total_liabilities, net_worth) VALUES ($1,$2,$3)",
        [totalAssets, totalLiabilities, netWorth]
      );
    }
    res.json({ message: "Snapshot saved", totalAssets, totalLiabilities, netWorth });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get history (last N days)
router.get("/history", async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const result = await pool.query(
      `SELECT * FROM networth_history
       WHERE recorded_at >= NOW() - INTERVAL '${days} days'
       ORDER BY recorded_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dividends ─────────────────────────────────────────────────────────────

router.get("/dividends", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, a.name as asset_name, a.symbol
       FROM dividends d
       JOIN assets a ON d.asset_id = a.id
       ORDER BY d.received_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/dividends", async (req, res) => {
  try {
    const { asset_id, amount, received_date, notes } = req.body;
    const result = await pool.query(
      "INSERT INTO dividends (asset_id, amount, received_date, notes) VALUES ($1,$2,$3,$4) RETURNING *",
      [asset_id, amount, received_date, notes || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/dividends/:id", async (req, res) => {
  await pool.query("DELETE FROM dividends WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

// ── Sector Allocation ─────────────────────────────────────────────────────

router.get("/sectors", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sector,
              SUM(current_price * quantity) AS value,
              COUNT(*) AS stock_count
       FROM assets
       GROUP BY sector
       ORDER BY value DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update sector for an asset
router.put("/sector/:id", async (req, res) => {
  try {
    const { sector } = req.body;
    await pool.query("UPDATE assets SET sector=$1 WHERE id=$2", [sector, req.params.id]);
    res.json({ message: "Sector updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Target Allocation ─────────────────────────────────────────────────────

router.put("/target/:id", async (req, res) => {
  try {
    const { target_pct } = req.body;
    await pool.query("UPDATE assets SET target_pct=$1 WHERE id=$2", [target_pct, req.params.id]);
    res.json({ message: "Target updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-assign sectors based on known NSE symbols
router.post("/auto-sector", async (req, res) => {
  try {
    const sectorMap = {
  // ── NSE (.NS) ─────────────────────────────────────────────────────────
  // IT
  "TCS.NS":"IT", "INFY.NS":"IT", "WIPRO.NS":"IT", "HCLTECH.NS":"IT",
  "TECHM.NS":"IT", "LTIM.NS":"IT", "COFORGE.NS":"IT", "MPHASIS.NS":"IT",
  "PERSISTENT.NS":"IT", "OFSS.NS":"IT", "TATATECH.NS":"IT", "VISESHINFO-Z.NS":"IT",

  // Banking
  "HDFCBANK.NS":"Banking", "ICICIBANK.NS":"Banking", "SBIN.NS":"Banking",
  "KOTAKBANK.NS":"Banking", "AXISBANK.NS":"Banking", "INDUSINDBK.NS":"Banking",
  "BANDHANBNK.NS":"Banking", "FEDERALBNK.NS":"Banking", "IDFCFIRSTB.NS":"Banking",
  "SOUTHBANK.NS":"Banking", "KTKBANK.NS":"Banking", "TMCV.NS":"Banking", "TMB.NS":"Banking",

  // Pharma
  "SUNPHARMA.NS":"Pharma", "DRREDDY.NS":"Pharma", "CIPLA.NS":"Pharma",
  "DIVISLAB.NS":"Pharma", "AUROPHARMA.NS":"Pharma", "NATCOPHARM.NS":"Pharma",
  "ZYDUSLIFE.NS":"Pharma", "JYOTHYLAB.NS":"Pharma", "PHARMABEES.NS":"Pharma",

  // Auto
  "MARUTI.NS":"Auto", "TATAMOTORS.NS":"Auto", "M&M.NS":"Auto",
  "BAJAJ-AUTO.NS":"Auto", "HEROMOTOCO.NS":"Auto", "EICHERMOT.NS":"Auto",

  // FMCG
  "HINDUNILVR.NS":"FMCG", "ITC.NS":"FMCG", "NESTLEIND.NS":"FMCG",
  "BRITANNIA.NS":"FMCG", "DABUR.NS":"FMCG", "MARICO.NS":"FMCG",
  "COLPAL.NS":"FMCG", "GODREJCP.NS":"FMCG",

  // Energy
  "RELIANCE.NS":"Energy", "ONGC.NS":"Energy", "BPCL.NS":"Energy",
  "IOC.NS":"Energy", "TATAPOWER.NS":"Energy", "ADANIGREEN.NS":"Energy",
  "OILIETF.NS":"Energy", "ARE&M.NS":"Energy",

  // Metals
  "TATASTEEL.NS":"Metals", "HINDALCO.NS":"Metals", "JSWSTEEL.NS":"Metals",
  "SAIL.NS":"Metals", "VEDL.NS":"Metals", "COALINDIA.NS":"Metals",

  // Finance
  "BAJFINANCE.NS":"Finance", "BAJAJFINSV.NS":"Finance", "MANAPPURAM.NS":"Finance",
  "MUTHOOTFIN.NS":"Finance", "CHOLAFIN.NS":"Finance", "POONAWALLA.NS":"Finance",
  "VIKASECO.NS":"Finance", "TMPV.NS":"Finance",

  // Realty
  "DLF.NS":"Realty", "GODREJPROP.NS":"Realty", "OBEROIRLTY.NS":"Realty", "PRESTIGE.NS":"Realty",

  // Infrastructure
  "LT.NS":"Infrastructure", "ADANIPORTS.NS":"Infrastructure",
  "GMRINFRA.NS":"Infrastructure", "LGEINDIA.NS":"Infrastructure",
  "PGINVIT-IV.NS":"Infrastructure",

  // Telecom
  "BHARTIARTL.NS":"Telecom", "IDEA.NS":"Telecom",

  // ── BSE (.BO) ─────────────────────────────────────────────────────────
  // IT
  "TCS.BO":"IT", "INFY.BO":"IT", "WIPRO.BO":"IT", "HCLTECH.BO":"IT",
  "TECHM.BO":"IT", "LTIM.BO":"IT", "COFORGE.BO":"IT", "MPHASIS.BO":"IT",
  "PERSISTENT.BO":"IT", "OFSS.BO":"IT", "TATATECH.BO":"IT",

  // Banking
  "HDFCBANK.BO":"Banking", "ICICIBANK.BO":"Banking", "SBIN.BO":"Banking",
  "KOTAKBANK.BO":"Banking", "AXISBANK.BO":"Banking", "INDUSINDBK.BO":"Banking",
  "BANDHANBNK.BO":"Banking", "FEDERALBNK.BO":"Banking", "IDFCFIRSTB.BO":"Banking",
  "SOUTHBANK.BO":"Banking", "KTKBANK.BO":"Banking", "TMB.BO":"Banking",

  // Pharma
  "SUNPHARMA.BO":"Pharma", "DRREDDY.BO":"Pharma", "CIPLA.BO":"Pharma",
  "DIVISLAB.BO":"Pharma", "AUROPHARMA.BO":"Pharma", "NATCOPHARM.BO":"Pharma",
  "ZYDUSLIFE.BO":"Pharma", "JYOTHYLAB.BO":"Pharma",

  // Auto
  "MARUTI.BO":"Auto", "TATAMOTORS.BO":"Auto", "M&M.BO":"Auto",
  "BAJAJ-AUTO.BO":"Auto", "HEROMOTOCO.BO":"Auto", "EICHERMOT.BO":"Auto",

  // FMCG
  "HINDUNILVR.BO":"FMCG", "ITC.BO":"FMCG", "NESTLEIND.BO":"FMCG",
  "BRITANNIA.BO":"FMCG", "DABUR.BO":"FMCG", "MARICO.BO":"FMCG",
  "COLPAL.BO":"FMCG", "GODREJCP.BO":"FMCG",

  // Energy
  "RELIANCE.BO":"Energy", "ONGC.BO":"Energy", "BPCL.BO":"Energy",
  "IOC.BO":"Energy", "TATAPOWER.BO":"Energy", "ADANIGREEN.BO":"Energy",

  // Metals
  "TATASTEEL.BO":"Metals", "HINDALCO.BO":"Metals", "JSWSTEEL.BO":"Metals",
  "SAIL.BO":"Metals", "VEDL.BO":"Metals", "COALINDIA.BO":"Metals",

  // Finance
  "BAJFINANCE.BO":"Finance", "BAJAJFINSV.BO":"Finance", "MANAPPURAM.BO":"Finance",
  "MUTHOOTFIN.BO":"Finance", "CHOLAFIN.BO":"Finance",

  // Realty
  "DLF.BO":"Realty", "GODREJPROP.BO":"Realty", "OBEROIRLTY.BO":"Realty", "PRESTIGE.BO":"Realty",

  // Infrastructure
  "LT.BO":"Infrastructure", "ADANIPORTS.BO":"Infrastructure", "LGEINDIA.BO":"Infrastructure",

  // Telecom
  "BHARTIARTL.BO":"Telecom", "IDEA.BO":"Telecom",
};

    const assets = await pool.query(
      "SELECT id, symbol FROM assets WHERE symbol IS NOT NULL AND symbol != ''"
    );

    let updated = 0;
    for (const asset of assets.rows) {
      const sector = sectorMap[asset.symbol];
      if (sector) {
        await pool.query(
          "UPDATE assets SET sector=$1 WHERE id=$2",
          [sector, asset.id]
        );
        updated++;
      }
    }

    res.json({ message: `Auto-assigned sectors for ${updated} stocks` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;