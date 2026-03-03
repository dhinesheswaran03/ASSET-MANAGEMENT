require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/assets", require("./routes/assets"));
app.use("/liabilities", require("./routes/liabilities"));

// ✅ ADD THESE TWO LINES
const { updateAllPrices } = require("./jobs/priceUpdater");
require("./jobs/priceUpdater"); // starts the cron schedule

// Manual trigger endpoint (call from frontend Refresh button)
app.post("/refresh-prices", async (req, res) => {
  await updateAllPrices();
  res.json({ message: "Prices refreshed!" });
});

// Net worth
app.get("/networth", async (req, res) => {
  try {
    const a = await pool.query("SELECT COALESCE(SUM(current_price * quantity),0) AS total FROM assets");
    const l = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM liabilities");
    const totalAssets = Number(a.rows[0].total);
    const totalLiabilities = Number(l.rows[0].total);
    res.json({ totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.json({ message: "Asset Management API 🚀" }));
app.listen(5000, () => console.log("Server running on port 5000"));

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