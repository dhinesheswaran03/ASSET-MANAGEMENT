const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all liabilities
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM liabilities ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new liability
router.post("/", async (req, res) => {
  console.log(req.body);   // 👈 ADD THIS LINE
  const { name, amount, interest, tenure } = req.body;

  const result = await pool.query(
    `INSERT INTO liabilities (name, amount, interest, tenure)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, amount, interest, tenure]
  );

  res.json(result.rows[0]);
});

// DELETE liability
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM liabilities WHERE id = $1", [id]);
  res.json({ message: "Liability deleted" });
});

module.exports = router;