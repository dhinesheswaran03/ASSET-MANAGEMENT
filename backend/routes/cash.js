const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

// Auto-create table
pool.query(`
  CREATE TABLE IF NOT EXISTS cash_holdings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'liquid',
    amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_amount NUMERIC(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM cash_holdings WHERE user_id=$1 ORDER BY id DESC", [req.userId]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, category, amount, target_amount, notes } = req.body;
    const r = await pool.query(
      `INSERT INTO cash_holdings (user_id,name,category,amount,target_amount,notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.userId, name, category||"liquid", amount||0, target_amount||0, notes||""]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, category, amount, target_amount, notes } = req.body;
    const r = await pool.query(
      `UPDATE cash_holdings SET name=$1,category=$2,amount=$3,target_amount=$4,notes=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [name, category||"liquid", amount||0, target_amount||0, notes||"", req.params.id, req.userId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found or access denied" });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM cash_holdings WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
  res.json({ message: "Deleted" });
});

// GET /cash/summary — aggregated by category
router.get("/summary", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT category, SUM(amount) as total, SUM(target_amount) as target FROM cash_holdings WHERE user_id=$1 GROUP BY category",
      [req.userId]
    );
    const summary = { liquid:{total:0,target:0}, emergency:{total:0,target:0} };
    r.rows.forEach(row => {
      if (summary[row.category]) {
        summary[row.category].total  = Number(row.total);
        summary[row.category].target = Number(row.target);
      }
    });
    res.json(summary);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;