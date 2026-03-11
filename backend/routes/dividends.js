const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

// Auto-create table with correct columns
pool.query(`
  CREATE TABLE IF NOT EXISTS dividends (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER,
    asset_name    TEXT,
    amount        NUMERIC(15,2),
    received_date DATE,
    notes         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

// Add notes column if missing (for older installs)
pool.query(`ALTER TABLE dividends ADD COLUMN IF NOT EXISTS notes TEXT`).catch(()=>{});
pool.query(`ALTER TABLE dividends ADD COLUMN IF NOT EXISTS asset_name TEXT`).catch(()=>{});

router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM dividends WHERE user_id=$1 ORDER BY received_date DESC",
      [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { asset_name, amount, received_date, notes } = req.body;
    if (!asset_name || !amount || !received_date)
      return res.status(400).json({ error: "asset_name, amount and received_date are required" });

    const r = await pool.query(
      `INSERT INTO dividends (user_id, asset_name, amount, received_date, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.userId, asset_name, amount, received_date, notes||""]
    );
    res.json(r.rows[0]);
  } catch (err) {
    console.error("Dividend error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await pool.query(
    "DELETE FROM dividends WHERE id=$1 AND user_id=$2",
    [req.params.id, req.userId]
  );
  res.json({ message: "Deleted" });
});

module.exports = router;