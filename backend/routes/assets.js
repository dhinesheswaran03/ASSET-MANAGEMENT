const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all assets
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM assets ORDER BY id DESC");
  res.json(result.rows);
});

// POST new asset
router.post("/", async (req, res) => {
  try {

    console.log("Incoming asset:", req.body); // ✅ PUT IT HERE

    const { name, type, buy_price, quantity, current_price } = req.body;

    if (!name || !buy_price || !quantity || !current_price) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const invested = buy_price * quantity;
    const value = current_price * quantity;

    const result = await pool.query(
      `INSERT INTO assets 
       (name, type, buy_price, quantity, current_price, value)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        type || "Equity",
        buy_price,
        quantity,
        current_price,
        value
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE asset
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM assets WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

module.exports = router;