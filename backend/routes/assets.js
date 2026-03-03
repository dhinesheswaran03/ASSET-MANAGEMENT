const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const multer = require("multer");
const XLSX = require("xlsx");
const upload = multer({ storage: multer.memoryStorage() });

// Use Alpha Vantage (free) or fallback to buy_price
const getLivePrice = async (symbol) => {
  try {
    // Option 1: Yahoo Finance (community proxy — more reliable)
    const res = await axios.get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    const price = res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ? Number(price) : null;
  } catch {
    return null;
  }
};

// GET all assets with live prices
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assets ORDER BY id DESC");
    const assets = result.rows;

    await Promise.all(
      assets.map(async (asset) => {
        if (asset.symbol) {
          const live = await getLivePrice(asset.symbol);
          if (live) asset.current_price = live;
          else asset.current_price = asset.current_price || asset.buy_price;
        } else {
          asset.current_price = asset.current_price || asset.buy_price;
        }
      })
    );

    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new asset
router.post("/", async (req, res) => {
  try {
    const { name, type, buy_price, quantity, symbol } = req.body;
    if (!name || !buy_price || !quantity)
      return res.status(400).json({ error: "Missing fields" });

    const result = await pool.query(
      `INSERT INTO assets (name, type, buy_price, quantity, symbol, current_price)
       VALUES ($1,$2,$3,$4,$5,$3) RETURNING *`,
      [name, type || "Equity", buy_price, quantity, symbol || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update asset
router.put("/:id", async (req, res) => {
  try {
    const { name, buy_price, quantity, symbol } = req.body;
    const result = await pool.query(
      `UPDATE assets SET name=$1, buy_price=$2, quantity=$3, symbol=$4 WHERE id=$5 RETURNING *`,
      [name, buy_price, quantity, symbol || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE asset
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM assets WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

// POST /assets/import-zerodha
router.post("/import-zerodha", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    // Try Equity sheet first, fallback to first sheet
    const sheetName = workbook.SheetNames.includes("Equity")
      ? "Equity"
      : workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // ── Find the header row ──────────────────────────────────────────────
    // Zerodha header contains "Instrument" and "Qty."
    let headerRowIdx = -1;
    let headers = [];

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i].map(v => (v ? String(v).trim() : ""));
      if (row.some(v => v === "Instrument" || v === "Symbol")) {
        headerRowIdx = i;
        headers = row;
        break;
      }
    }

    if (headerRowIdx === -1) {
      return res.status(400).json({ error: "Could not find header row. Is this a Zerodha holdings file?" });
    }

    // ── Map column names to indexes ──────────────────────────────────────
    const col = (names) => {
      for (const n of names) {
        const idx = headers.findIndex(h => h.toLowerCase().includes(n.toLowerCase()));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const iSymbol    = col(["Instrument", "Symbol", "Stock"]);
    const iQty       = col(["Qty.", "Quantity", "Qty"]);
    const iAvgCost   = col(["Avg. cost", "Avg Cost", "Average Price", "Buy Price"]);
    const iLTP       = col(["LTP", "Last Price", "Current Price", "Mkt Price"]);
    const iCurVal    = col(["Cur. val", "Current Value", "Mkt Value"]);

    if (iSymbol === -1 || iQty === -1 || iAvgCost === -1) {
      return res.status(400).json({ error: "Required columns not found (Instrument, Qty, Avg Cost)" });
    }

    // ── Process data rows ────────────────────────────────────────────────
    const dataRows = allRows.slice(headerRowIdx + 1);
    let imported = 0, skipped = 0;

    for (const row of dataRows) {
      const symbol = row[iSymbol] ? String(row[iSymbol]).trim() : null;
      const qty    = Number(row[iQty]);
      const avg    = Number(row[iAvgCost]);
      const ltp    = iLTP !== -1 ? Number(row[iLTP]) : avg;

      // Skip empty/summary rows
      if (!symbol || isNaN(qty) || qty === 0 || isNaN(avg) || avg === 0) {
        skipped++;
        continue;
      }

      // Skip total/summary rows
      if (symbol.toLowerCase().includes("total") || symbol.toLowerCase().includes("summary")) {
        skipped++;
        continue;
      }

      // Append .NS for NSE symbol (Yahoo Finance format)
      const yahooSymbol = symbol.includes(".") ? symbol : `${symbol}.NS`;

      // Check if asset already exists (by symbol)
      const existing = await pool.query(
        "SELECT id FROM assets WHERE symbol = $1",
        [yahooSymbol]
      );

      if (existing.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE assets SET buy_price=$1, quantity=$2, current_price=$3 WHERE symbol=$4`,
          [avg, qty, ltp || avg, yahooSymbol]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO assets (name, type, buy_price, quantity, symbol, current_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [symbol, "Equity", avg, qty, yahooSymbol, ltp || avg]
        );
      }

      imported++;
    }

    res.json({
      imported,
      skipped,
      message: `Successfully imported ${imported} holdings`
    });

  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({ error: "Import failed: " + err.message });
  }
});

module.exports = router;