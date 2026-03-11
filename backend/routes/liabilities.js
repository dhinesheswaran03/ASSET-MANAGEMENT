const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM liabilities WHERE user_id=$1 ORDER BY id DESC", [req.userId]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try {
    const { name, amount, interest, tenure } = req.body;
    const r = await pool.query(
      "INSERT INTO liabilities (name,amount,interest,tenure,user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, amount, interest||0, tenure||0, req.userId]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, amount, interest, tenure } = req.body;
    const r = await pool.query(
      "UPDATE liabilities SET name=$1,amount=$2,interest=$3,tenure=$4 WHERE id=$5 AND user_id=$6 RETURNING *",
      [name, amount, interest||0, tenure||0, req.params.id, req.userId]
    );
    if (!r.rows.length) return res.status(404).json({ error: "Not found or access denied" });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM liabilities WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
  res.json({ message: "Deleted" });
});

module.exports = router;