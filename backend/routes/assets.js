const express  = require("express");
const router   = express.Router();
const pool     = require("../db");
const axios    = require("axios");
const multer   = require("multer");
const XLSX     = require("xlsx");
const requireAuth = require("../middleware/authMiddleware");
const upload   = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

const getLivePrice = async (symbol) => {
  try {
    const res = await axios.get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    const price = res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ? Number(price) : null;
  } catch { return null; }
};

const getYahooSymbol = (symbol, exchange) => {
  if (symbol.includes(".")) return symbol;
  if (exchange && exchange.toUpperCase().includes("BSE")) return `${symbol}.BO`;
  return `${symbol}.NS`;
};

const { getSector } = require("../utils/sectorMap");

// GET — only this user's assets
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets WHERE user_id=$1 ORDER BY id DESC", [req.userId]
    );
    const assets = result.rows;
    await Promise.all(assets.map(async (asset) => {
      if (asset.symbol) {
        const live = await getLivePrice(asset.symbol);
        asset.current_price = live || asset.current_price || asset.buy_price;
      } else {
        asset.current_price = asset.current_price || asset.buy_price;
      }
    }));
    res.json(assets);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST — create asset for this user
router.post("/", async (req, res) => {
  try {
    const { name, type, buy_price, quantity, symbol } = req.body;
    if (!name || !buy_price) return res.status(400).json({ error: "Missing fields" });
    const sector = getSector(type, name, symbol||"");
    const result = await pool.query(
      `INSERT INTO assets (name,type,buy_price,quantity,symbol,current_price,sector,user_id)
       VALUES ($1,$2,$3,$4,$5,$3,$6,$7) RETURNING *`,
      [name, type||"Equity", buy_price, quantity||1, symbol||null, sector, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// PUT — update only if owned by this user
router.put("/:id", async (req, res) => {
  try {
    const { name, type, buy_price, quantity, symbol } = req.body;
    const sector = getSector(type, name, symbol||"");
    const result = await pool.query(
      `UPDATE assets SET name=$1,type=$2,buy_price=$3,quantity=$4,symbol=$5,sector=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [name, type||"Equity", buy_price, quantity||1, symbol||null, sector, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found or access denied" });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE — only if owned by this user
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM assets WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
  res.json({ message: "Deleted" });
});

// POST update-prices
router.post("/update-prices", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets WHERE user_id=$1 AND symbol IS NOT NULL", [req.userId]
    );
    let updated = 0;
    await Promise.all(result.rows.map(async (a) => {
      const live = await getLivePrice(a.symbol);
      if (live) {
        await pool.query(
          "UPDATE assets SET current_price=$1,last_updated=NOW() WHERE id=$2 AND user_id=$3",
          [live, a.id, req.userId]
        );
        updated++;
      }
    }));
    res.json({ message: `Updated ${updated} prices` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH sector
router.patch("/:id/sector", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE assets SET sector=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
      [req.body.sector, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found or access denied" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH target
router.patch("/:id/target", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE assets SET target_pct=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
      [req.body.target_pct, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Not found or access denied" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST import-zerodha
router.post("/import-zerodha", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const workbook  = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames.includes("Equity") ? "Equity" : workbook.SheetNames[0];
    const allRows   = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header:1, defval:null });

    let headerRowIdx = -1, headers = [];
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i].map(v => (v ? String(v).trim() : ""));
      if (row.some(v => v === "Instrument" || v === "Symbol")) { headerRowIdx=i; headers=row; break; }
    }
    if (headerRowIdx === -1) return res.status(400).json({ error: "Could not find header row" });

    const col = (names) => {
      for (const n of names) {
        const idx = headers.findIndex(h => h.toLowerCase().includes(n.toLowerCase()));
        if (idx !== -1) return idx;
      }
      return -1;
    };
    const iSymbol=col(["Instrument","Symbol","Stock"]), iQty=col(["Qty.","Quantity","Qty"]);
    const iAvgCost=col(["Avg. cost","Avg Cost","Average Price","Buy Price"]);
    const iLTP=col(["LTP","Last Price","Current Price"]), iExchange=col(["Exchange","Exch"]);

    if (iSymbol===-1||iQty===-1||iAvgCost===-1) return res.status(400).json({ error:"Required columns not found" });

    let imported=0, skipped=0;
    for (const row of allRows.slice(headerRowIdx+1)) {
      const symbol = row[iSymbol] ? String(row[iSymbol]).trim() : null;
      const qty=Number(row[iQty]), avg=Number(row[iAvgCost]);
      const ltp=iLTP!==-1?Number(row[iLTP]):avg;
      const exchange=iExchange!==-1?String(row[iExchange]||"").trim():"NSE";
      if (!symbol||isNaN(qty)||qty===0||isNaN(avg)||avg===0) { skipped++; continue; }
      if (symbol.toLowerCase().includes("total")) { skipped++; continue; }
      const ySym = getYahooSymbol(symbol, exchange);
      const existing = await pool.query("SELECT id FROM assets WHERE symbol=$1 AND user_id=$2", [ySym, req.userId]);
      if (existing.rows.length>0) {
        await pool.query(`UPDATE assets SET buy_price=$1,quantity=$2,current_price=$3 WHERE symbol=$4 AND user_id=$5`,
          [avg, qty, ltp||avg, ySym, req.userId]);
      } else {
        await pool.query(`INSERT INTO assets (name,type,buy_price,quantity,symbol,current_price,sector,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [symbol,"Equity",avg,qty,ySym,ltp||avg,getSector("Equity",symbol,ySym),req.userId]);
      }
      imported++;
    }
    res.json({ imported, skipped, message: `Imported ${imported} holdings` });
  } catch (err) { console.error(err); res.status(500).json({ error: "Import failed: "+err.message }); }
});

module.exports = router;