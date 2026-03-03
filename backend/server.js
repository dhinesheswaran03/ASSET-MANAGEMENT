const express = require("express");
const cors = require("cors");
const pool = require("./db");
const assetRoutes = require("./routes/assets");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/assets", assetRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Asset Management API Running 🚀",
      dbTime: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.get("/networth", async (req, res) => {
  try {
    const assets = await pool.query("SELECT COALESCE(SUM(value),0) AS total FROM assets");
    const liabilities = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM liabilities");

    const totalAssets = Number(assets.rows[0].total);
    const totalLiabilities = Number(liabilities.rows[0].total);

    res.json({
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const liabilityRoutes = require("./routes/liabilities");
app.use("/liabilities", liabilityRoutes);