const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM liabilities ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, amount, interest, tenure } = req.body;
    const result = await pool.query(
      `INSERT INTO liabilities (name, amount, interest, tenure) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, amount, interest, tenure]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update liability  ← NEW
router.put("/:id", async (req, res) => {
  try {
    const { name, amount, interest, tenure } = req.body;
    const result = await pool.query(
      `UPDATE liabilities SET name=$1, amount=$2, interest=$3, tenure=$4 WHERE id=$5 RETURNING *`,
      [name, amount, interest, tenure, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM liabilities WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;