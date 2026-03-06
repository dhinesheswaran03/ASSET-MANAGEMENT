const express = require("express");
const router  = express.Router();
const pool    = require("../db");

// ── Ensure cash_holdings table exists ─────────────────────────────────────
const initTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cash_holdings (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(200) NOT NULL,
      category      VARCHAR(50)  NOT NULL DEFAULT 'liquid', -- 'liquid' | 'emergency'
      amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
      target_amount NUMERIC(15,2) DEFAULT 0,
      notes         TEXT,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    )
  `);
};
initTable().catch(console.error);

// GET all cash holdings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cash_holdings ORDER BY category, id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary
router.get("/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        category,
        COALESCE(SUM(amount),0)        AS total,
        COALESCE(SUM(target_amount),0) AS target
      FROM cash_holdings
      GROUP BY category
    `);
    const summary = { liquid:{ total:0, target:0 }, emergency:{ total:0, target:0 } };
    result.rows.forEach(r => {
      if (summary[r.category]) {
        summary[r.category].total  = Number(r.total);
        summary[r.category].target = Number(r.target);
      }
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add cash holding
router.post("/", async (req, res) => {
  try {
    const { name, category, amount, target_amount, notes } = req.body;
    if (!name || !amount) return res.status(400).json({ error: "Name and amount required" });
    const result = await pool.query(
      `INSERT INTO cash_holdings (name, category, amount, target_amount, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, category||"liquid", Number(amount), Number(target_amount)||0, notes||null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update cash holding
router.put("/:id", async (req, res) => {
  try {
    const { name, category, amount, target_amount, notes } = req.body;
    const result = await pool.query(
      `UPDATE cash_holdings SET name=$1, category=$2, amount=$3, target_amount=$4, notes=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [name, category||"liquid", Number(amount), Number(target_amount)||0, notes||null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cash_holdings WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;