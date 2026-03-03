const cron = require("node-cron");
const pool = require("../db");
const axios = require("axios");

const getLivePrice = async (symbol) => {
  try {
    const res = await axios.get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    const price = res.data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ? Number(price) : null;
  } catch {
    return null;
  }
};

const updateAllPrices = async () => {
  console.log(`[${new Date().toLocaleString("en-IN")}] ⏳ Running daily price update...`);

  try {
    const result = await pool.query("SELECT id, symbol FROM assets WHERE symbol IS NOT NULL AND symbol != ''");
    const assets = result.rows;

    if (assets.length === 0) {
      console.log("No assets with symbols found. Skipping.");
      return;
    }

    let updated = 0, failed = 0;

    for (const asset of assets) {
      const price = await getLivePrice(asset.symbol);

      if (price) {
        await pool.query(
          "UPDATE assets SET current_price = $1, last_updated = NOW() WHERE id = $2",
          [price, asset.id]
        );
        console.log(`  ✅ ${asset.symbol} → ₹${price}`);
        updated++;
      } else {
        console.log(`  ❌ ${asset.symbol} → price fetch failed`);
        failed++;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`[Done] Updated: ${updated}, Failed: ${failed}`);
  } catch (err) {
    console.error("Price update job error:", err.message);
  }
};

// ─── Schedule ────────────────────────────────────────────────────────────────
// Cron format: second(optional) minute hour day month weekday
// Examples:
//   '45 15 * * 1-5'  → 3:45 PM, Mon–Fri (market close IST)
//   '30 9 * * 1-5'   → 9:30 AM, Mon–Fri (market open IST)
//   '0 0 * * *'      → midnight every day
//   '0 */6 * * *'    → every 6 hours

const CRON_SCHEDULE = "45 15 * * 1-5"; // ← Change this to your preferred time

cron.schedule(
  CRON_SCHEDULE,
  updateAllPrices,
  { timezone: "Asia/Kolkata" }  // IST timezone
);

console.log(`✅ Price updater scheduled: "${CRON_SCHEDULE}" (IST)`);

// Export so you can also trigger it manually via API
module.exports = { updateAllPrices };