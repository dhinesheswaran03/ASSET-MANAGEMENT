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
const { getSector, SECTOR_MAP } = require("../utils/sectorMap");

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
      sector = getSector(asset.type||"Equity", asset.name, asset.symbol||"");
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