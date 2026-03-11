const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth);

// Auto-create table
pool.query(`
  CREATE TABLE IF NOT EXISTS user_profile (
    user_id      TEXT PRIMARY KEY,
    name         TEXT,
    avatar       TEXT,
    email        TEXT,
    phone        TEXT,
    milestone    NUMERIC DEFAULT 1000000,
    pl_alert     NUMERIC DEFAULT 10,
    weekly_digest BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

// GET profile
router.get("/", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM user_profile WHERE user_id=$1", [req.userId]
    );
    res.json(r.rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — upsert profile
router.put("/", async (req, res) => {
  try {
    const { name, avatar, phone, milestone, pl_alert, weekly_digest } = req.body;
    const r = await pool.query(
      `INSERT INTO user_profile (user_id, name, avatar, phone, milestone, pl_alert, weekly_digest, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET name=$2, avatar=$3, phone=$4, milestone=$5, pl_alert=$6, weekly_digest=$7, updated_at=NOW()
       RETURNING *`,
      [req.userId, name, avatar, phone, milestone||1000000, pl_alert||10, weekly_digest??true]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;