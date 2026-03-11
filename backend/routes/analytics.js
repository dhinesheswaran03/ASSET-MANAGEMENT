const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const axios   = require("axios");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

// ── GET /analytics/networth-history ──────────────────────────────────────
// Auto-fix networth_history table columns
pool.query(`
  CREATE TABLE IF NOT EXISTS networth_history (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER,
    net_worth         NUMERIC(15,2) DEFAULT 0,
    total_assets      NUMERIC(15,2) DEFAULT 0,
    total_liabilities NUMERIC(15,2) DEFAULT 0,
    total_invested    NUMERIC(15,2) DEFAULT 0,
    recorded_at       TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

// Add missing columns for older installs
pool.query(`ALTER TABLE networth_history ADD COLUMN IF NOT EXISTS total_liabilities NUMERIC(15,2) DEFAULT 0`).catch(()=>{});
pool.query(`ALTER TABLE networth_history ADD COLUMN IF NOT EXISTS total_invested NUMERIC(15,2) DEFAULT 0`).catch(()=>{});
pool.query(`ALTER TABLE networth_history ADD COLUMN IF NOT EXISTS total_assets NUMERIC(15,2) DEFAULT 0`).catch(()=>{});

router.get("/networth-history", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const r = await pool.query(
      `SELECT * FROM networth_history
       WHERE user_id=$1 AND recorded_at >= NOW() - INTERVAL '${days} days'
       ORDER BY recorded_at ASC`,
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /analytics/snapshot — save current networth ─────────────────────
router.post("/snapshot", async (req, res) => {
  try {
    const assetsR = await pool.query(
      "SELECT * FROM assets WHERE user_id=$1", [req.userId]
    );
    const liabsR = await pool.query(
      "SELECT * FROM liabilities WHERE user_id=$1", [req.userId]
    );

    // Fetch live prices
    const getLivePrice = async (symbol) => {
      try {
        const r = await axios.get(
          `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
          { headers:{"User-Agent":"Mozilla/5.0"}, timeout:5000 }
        );
        return r.data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
      } catch { return null; }
    };

    let totalAssets = 0, totalInvested = 0;
    for (const a of assetsR.rows) {
      let price = a.current_price || a.buy_price;
      if (a.symbol) { const live = await getLivePrice(a.symbol); if (live) price = live; }
      totalAssets   += price * Number(a.quantity);
      totalInvested += Number(a.buy_price) * Number(a.quantity);
    }
    const totalLiabilities = liabsR.rows.reduce((s,l) => s+Number(l.amount), 0);
    const netWorth = totalAssets - totalLiabilities;

    await pool.query(
      `INSERT INTO networth_history (user_id, net_worth, total_assets, total_liabilities, total_invested)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.userId, netWorth, totalAssets, totalLiabilities, totalInvested]
    );
    res.json({ message: "Snapshot saved", netWorth, totalAssets, totalLiabilities, totalInvested });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /analytics/auto-sector ───────────────────────────────────────────
const sectorMap = {
  // IT
  "TCS.NS":"IT","INFY.NS":"IT","HCLTECH.NS":"IT","WIPRO.NS":"IT","TECHM.NS":"IT",
  "LTIM.NS":"IT","MPHASIS.NS":"IT","COFORGE.NS":"IT","PERSISTENT.NS":"IT",
  "OFSS.NS":"IT","KPITTECH.NS":"IT","TATAELXSI.NS":"IT","HEXAWARE.NS":"IT",
  "NIITTECH.NS":"IT","MINDTREE.NS":"IT","LTTS.NS":"IT","CYIENT.NS":"IT",
  "SONATSOFTW.NS":"IT","MASTEK.NS":"IT","RAMSARUP.NS":"IT","ZENSARTECH.NS":"IT",
  // Banking
  "HDFCBANK.NS":"Banking","ICICIBANK.NS":"Banking","SBIN.NS":"Banking",
  "KOTAKBANK.NS":"Banking","AXISBANK.NS":"Banking","INDUSINDBK.NS":"Banking",
  "BANDHANBNK.NS":"Banking","FEDERALBNK.NS":"Banking","IDFCFIRSTB.NS":"Banking",
  "YESBANK.NS":"Banking","RBLBANK.NS":"Banking","CANBK.NS":"Banking",
  "BANKBARODA.NS":"Banking","PNB.NS":"Banking","UNIONBANK.NS":"Banking",
  "INDIANB.NS":"Banking","MAHABANK.NS":"Banking","CENTRALBK.NS":"Banking",
  "IOB.NS":"Banking","UCOBANK.NS":"Banking","KARURVYSYA.NS":"Banking",
  "DCBBANK.NS":"Banking","CSBBANK.NS":"Banking","NAINITAL-BANK.NS":"Banking",
  // Finance & NBFC
  "BAJFINANCE.NS":"Finance","BAJAJFINSV.NS":"Finance","HDFCLIFE.NS":"Finance",
  "SBILIFE.NS":"Finance","ICICIGI.NS":"Finance","ICICIPRULI.NS":"Finance",
  "CHOLAFIN.NS":"Finance","MUTHOOTFIN.NS":"Finance","MANAPPURAM.NS":"Finance",
  "SHRIRAMFIN.NS":"Finance","LICHSGFIN.NS":"Finance","PNBHOUSING.NS":"Finance",
  "CANFINHOME.NS":"Finance","GRUH.NS":"Finance","RECLTD.NS":"Finance",
  "PFC.NS":"Finance","IRFC.NS":"Finance","M&MFIN.NS":"Finance",
  // Energy & Oil
  "RELIANCE.NS":"Energy","ONGC.NS":"Energy","NTPC.NS":"Energy",
  "POWERGRID.NS":"Energy","COALINDIA.NS":"Energy","BPCL.NS":"Energy",
  "IOC.NS":"Energy","HINDPETRO.NS":"Energy","GAIL.NS":"Energy",
  "PETRONET.NS":"Energy","TATAPOWER.NS":"Energy","ADANIGREEN.NS":"Energy",
  "ADANITRANS.NS":"Energy","TORNTPOWER.NS":"Energy","CESC.NS":"Energy",
  "NHPC.NS":"Energy","SJVN.NS":"Energy","IREDA.NS":"Energy",
  // Auto
  "TATAMOTORS.NS":"Auto","M&M.NS":"Auto","BAJAJ-AUTO.NS":"Auto",
  "HEROMOTOCO.NS":"Auto","MARUTI.NS":"Auto","EICHERMOT.NS":"Auto",
  "ASHOKLEY.NS":"Auto","TVSMOTOR.NS":"Auto","MOTHERSON.NS":"Auto",
  "BOSCHLTD.NS":"Auto","EXIDEIND.NS":"Auto","AMARAJABAT.NS":"Auto",
  "MRF.NS":"Auto","CEATLTD.NS":"Auto","APOLLOTYRE.NS":"Auto",
  "BALKRISIND.NS":"Auto","SUNDRMFAST.NS":"Auto","SUPRAJIT.NS":"Auto",
  // FMCG
  "HINDUNILVR.NS":"FMCG","ITC.NS":"FMCG","NESTLEIND.NS":"FMCG",
  "BRITANNIA.NS":"FMCG","DABUR.NS":"FMCG","MARICO.NS":"FMCG",
  "GODREJCP.NS":"FMCG","COLPAL.NS":"FMCG","EMAMILTD.NS":"FMCG",
  "TATACONSUM.NS":"FMCG","VARUNBEV.NS":"FMCG","UBL.NS":"FMCG",
  "MCDOWELL-N.NS":"FMCG","RADICO.NS":"FMCG","VBLLTD.NS":"FMCG",
  "HATSUN.NS":"FMCG","HERITAGE.NS":"FMCG","VENKEYS.NS":"FMCG",
  // Pharma
  "SUNPHARMA.NS":"Pharma","DRREDDY.NS":"Pharma","CIPLA.NS":"Pharma",
  "DIVISLAB.NS":"Pharma","ZYDUSLIFE.NS":"Pharma","BIOCON.NS":"Pharma",
  "AUROPHARMA.NS":"Pharma","LUPIN.NS":"Pharma","TORNTPHARM.NS":"Pharma",
  "IPCALAB.NS":"Pharma","ALKEM.NS":"Pharma","ABBOTINDIA.NS":"Pharma",
  "PFIZER.NS":"Pharma","SANOFI.NS":"Pharma","GLAXO.NS":"Pharma",
  "GLENMARK.NS":"Pharma","NATCOPHARM.NS":"Pharma","GRANULES.NS":"Pharma",
  "LAURUSLABS.NS":"Pharma","APLLTD.NS":"Pharma","SOLARA.NS":"Pharma",
  // Infrastructure & Construction
  "LT.NS":"Infrastructure","ADANIENT.NS":"Infrastructure","ADANIPORTS.NS":"Infrastructure",
  "ULTRACEMCO.NS":"Infrastructure","AMBUJACEMENT.NS":"Infrastructure",
  "ACC.NS":"Infrastructure","SHREECEM.NS":"Infrastructure","RAMCOCEM.NS":"Infrastructure",
  "JKCEMENT.NS":"Infrastructure","HEIDELBERG.NS":"Infrastructure",
  "IRB.NS":"Infrastructure","KNR.NS":"Infrastructure","NBCC.NS":"Infrastructure",
  "RVNL.NS":"Infrastructure","IRCON.NS":"Infrastructure","ENGINERSIN.NS":"Infrastructure",
  "GMRINFRA.NS":"Infrastructure","GVK.NS":"Infrastructure",
  // Realty
  "DLF.NS":"Realty","GODREJPROP.NS":"Realty","OBEROIRLTY.NS":"Realty",
  "PRESTIGE.NS":"Realty","PHOENIXLTD.NS":"Realty","SOBHA.NS":"Realty",
  "BRIGADE.NS":"Realty","MAHLIFE.NS":"Realty","SUNTECK.NS":"Realty",
  // Metals & Mining
  "JSWSTEEL.NS":"Metals","TATASTEEL.NS":"Metals","HINDALCO.NS":"Metals",
  "VEDL.NS":"Metals","SAIL.NS":"Metals","NMDC.NS":"Metals",
  "NATIONALUM.NS":"Metals","HINDCOPPER.NS":"Metals","MOIL.NS":"Metals",
  "WELSPUNIND.NS":"Metals","RATNAMANI.NS":"Metals","APL.NS":"Metals",
  // Telecom
  "BHARTIARTL.NS":"Telecom","IDEA.NS":"Telecom","TTML.NS":"Telecom",
  "INDUSTOWER.NS":"Telecom","TEJASNET.NS":"Telecom","STLTECH.NS":"Telecom",
  // Consumer/Retail
  "TITAN.NS":"Consumer","ASIANPAINT.NS":"Consumer","BERGER.NS":"Consumer",
  "KANSAINER.NS":"Consumer","PIDILITIND.NS":"Consumer","HAVELLS.NS":"Consumer",
  "VOLTAS.NS":"Consumer","WHIRLPOOL.NS":"Consumer","BLUESTAR.NS":"Consumer",
  "CROMPTON.NS":"Consumer","ORIENTELEC.NS":"Consumer","SYMMANS.NS":"Consumer",
  "DMART.NS":"Consumer","TRENT.NS":"Consumer","SHOPERSTOP.NS":"Consumer",
  "ABFRL.NS":"Consumer","PAGEIND.NS":"Consumer","MANYAVAR.NS":"Consumer",
  // Healthcare
  "APOLLOHOSP.NS":"Healthcare","FORTIS.NS":"Healthcare","MAXHEALTH.NS":"Healthcare",
  "MEDANTA.NS":"Healthcare","NH.NS":"Healthcare","NARAYANHRU.NS":"Healthcare",
  "THYROCARE.NS":"Healthcare","METROPOLIS.NS":"Healthcare","DRLA.NS":"Healthcare",
  // Chemicals
  "PIDILITIND.NS":"Chemicals","AAPL.NS":"Chemicals","DEEPAKNTR.NS":"Chemicals",
  "NAVINFLUOR.NS":"Chemicals","FLUOROCHEM.NS":"Chemicals","CLEAN.NS":"Chemicals",
  "FINEORG.NS":"Chemicals","GALAXYSURF.NS":"Chemicals","ATUL.NS":"Chemicals",
  "VINATIORGA.NS":"Chemicals","BALAMINES.NS":"Chemicals","ALKYLAMINE.NS":"Chemicals",
  // Agri & Food
  "UPL.NS":"Agri","PIIND.NS":"Agri","RALLIS.NS":"Agri","DHANUKA.NS":"Agri",
  "BAYER.NS":"Agri","KAVERI.NS":"Agri","ZUARI.NS":"Agri","GNFC.NS":"Agri",
  // Index ETFs
  "NIFTYBEES.NS":"Index Fund","JUNIORBEES.NS":"Index Fund","BANKBEES.NS":"Index Fund",
  "GOLDBEES.NS":"Gold","SILVERBEES.NS":"Silver","LIQUIDBEES.NS":"Cash",
  // BSE variants
  "RELIANCE.BO":"Energy","TCS.BO":"IT","HDFCBANK.BO":"Banking","INFY.BO":"IT",
  "ICICIBANK.BO":"Banking","SBIN.BO":"Banking","WIPRO.BO":"IT","HCLTECH.BO":"IT",
  "AXISBANK.BO":"Banking","KOTAKBANK.BO":"Banking","TATAMOTORS.BO":"Auto",
  "MARUTI.BO":"Auto","SUNPHARMA.BO":"Pharma","BAJFINANCE.BO":"Finance",
};

// Smart sector guesser from company name keywords
const guessSectorFromName = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("bank") || n.includes("banking"))             return "Banking";
  if (n.includes("finance") || n.includes("finserv") || n.includes("nbfc") || n.includes("capital") || n.includes("credit") || n.includes("lending")) return "Finance";
  if (n.includes("pharma") || n.includes("drug") || n.includes("biocon") || n.includes("medic") || n.includes("lab") || n.includes("life science")) return "Pharma";
  if (n.includes("hospital") || n.includes("health") || n.includes("clinic") || n.includes("diagnostic")) return "Healthcare";
  if (n.includes("tech") || n.includes("infosy") || n.includes("software") || n.includes("digital") || n.includes("data") || n.includes("cyber") || n.includes("infra") && n.includes("it")) return "IT";
  if (n.includes("auto") || n.includes("motor") || n.includes("vehicle") || n.includes("tyre") || n.includes("ancillar")) return "Auto";
  if (n.includes("steel") || n.includes("metal") || n.includes("alumin") || n.includes("copper") || n.includes("zinc") || n.includes("iron") || n.includes("mining")) return "Metals";
  if (n.includes("cement") || n.includes("construction") || n.includes("infra") || n.includes("engineer") || n.includes("build") || n.includes("road") || n.includes("rail")) return "Infrastructure";
  if (n.includes("power") || n.includes("energy") || n.includes("oil") || n.includes("gas") || n.includes("petro") || n.includes("coal") || n.includes("solar") || n.includes("wind")) return "Energy";
  if (n.includes("telecom") || n.includes("airtel") || n.includes("jio") || n.includes("vodafone") || n.includes("tower")) return "Telecom";
  if (n.includes("fmcg") || n.includes("consumer") || n.includes("food") || n.includes("beverage") || n.includes("dairy") || n.includes("biscuit") || n.includes("soap") || n.includes("paint")) return "FMCG";
  if (n.includes("realty") || n.includes("real estate") || n.includes("property") || n.includes("housing") || n.includes("developer")) return "Realty";
  if (n.includes("chemical") || n.includes("agro") || n.includes("pesticide") || n.includes("fertilizer")) return "Chemicals";
  if (n.includes("retail") || n.includes("mart") || n.includes("fashion") || n.includes("apparel") || n.includes("jewel")) return "Consumer";
  if (n.includes("gold") || n.includes("sgb") || n.includes("sovereign gold")) return "Gold";
  if (n.includes("nifty") || n.includes("sensex") || n.includes("index") || n.includes("etf") || n.includes("bees")) return "Index Fund";
  if (n.includes("mutual fund") || n.includes("mf ") || n.includes(" mf") || n.includes("fund")) return "Mutual Fund";
  if (n.includes("fd") || n.includes("fixed deposit") || n.includes("recurring") || n.includes("bond") || n.includes("debenture")) return "Fixed Income";
  if (n.includes("cash") || n.includes("savings") || n.includes("liquid")) return "Cash";
  return null;
};

router.post("/auto-sector", async (req, res) => {
  try {
    const assets = await pool.query("SELECT id,name,symbol,type FROM assets WHERE user_id=$1", [req.userId]);
    let updated = 0;
    for (const asset of assets.rows) {
      let sector = null;
      if (asset.type==="Gold")        sector="Gold";
      else if (asset.type==="Cash")   sector="Cash";
      else if (asset.type==="FD")     sector="Fixed Income";
      else if (asset.type==="MutualFund") sector="Mutual Fund";
      else if (asset.type==="Other")  sector="Other";
      // Try exact symbol match
      if (!sector && asset.symbol) sector = sectorMap[asset.symbol] || null;
      // Try symbol without exchange suffix (e.g. "TCS" matches "TCS.NS")
      if (!sector && asset.symbol) {
        const base = asset.symbol.split(".")[0];
        const nsKey = base + ".NS", boKey = base + ".BO";
        sector = sectorMap[nsKey] || sectorMap[boKey] || null;
      }
      // Guess from name keywords
      if (!sector) sector = guessSectorFromName(asset.name);
      if (sector) {
        await pool.query("UPDATE assets SET sector=$1 WHERE id=$2 AND user_id=$3", [sector, asset.id, req.userId]);
        updated++;
      }
    }
    res.json({ message: `✅ Auto-assigned sectors for ${updated} assets` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /analytics/notifications ─────────────────────────────────────────
router.get("/notifications", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Marked read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/notifications/read-all", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE user_id=$1", [req.userId]);
    res.json({ message: "All marked read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

// ── GET /analytics/sector-data ────────────────────────────────────────────
router.get("/sector-data", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT sector, SUM(current_price * quantity) as value
       FROM assets WHERE user_id=$1 AND sector IS NOT NULL
       GROUP BY sector ORDER BY value DESC`,
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /analytics/dividend-data ──────────────────────────────────────────
router.get("/dividend-data", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM dividends WHERE user_id=$1 ORDER BY received_date DESC",
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /analytics/notifications/unread-count ─────────────────────────────
router.get("/notifications/unread-count", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id=$1 AND is_read=false",
      [req.userId]
    );
    res.json({ count: Number(r.rows[0].count) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /analytics/notifications ──────────────────────────────────────────
router.get("/notifications", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /analytics/notifications/:id/read ───────────────────────────────
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Marked read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /analytics/notifications/read-all ───────────────────────────────
router.patch("/notifications/read-all", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read=true WHERE user_id=$1", [req.userId]
    );
    res.json({ message: "All marked read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});