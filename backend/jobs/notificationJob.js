const cron = require("node-cron");
const pool = require("../db");
const axios = require("axios");

// ── Live price fetcher ────────────────────────────────────────────────────
const getLivePrice = async (symbol) => {
  if (!symbol) return null;
  try {
    const res = await axios.get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    return res.data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
  } catch { return null; }
};

// ── Helper: create notification (no duplicates on same day) ───────────────
const createNotification = async (type, title, message) => {
  try {
    const existing = await pool.query(
      `SELECT id FROM notifications
       WHERE type=$1 AND title=$2 AND DATE(created_at) = CURRENT_DATE`,
      [type, title]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE notifications SET message=$1, is_read=FALSE
         WHERE type=$2 AND title=$3 AND DATE(created_at)=CURRENT_DATE`,
        [message, type, title]
      );
      console.log(`  🔄 Updated: ${title}`);
      return;
    }
    await pool.query(
      "INSERT INTO notifications (type, title, message) VALUES ($1,$2,$3)",
      [type, title, message]
    );
    console.log(`  ✅ Created: ${title}`);
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

// ── Main checks ───────────────────────────────────────────────────────────
const runNotificationChecks = async () => {
  console.log(`\n[${new Date().toLocaleString("en-IN")}] 🔔 Running notification checks...`);
  try {
    // Get profile
    let profileRes = await pool.query("SELECT * FROM user_profile LIMIT 1");
    if (profileRes.rows.length === 0) {
      await pool.query("INSERT INTO user_profile (name) VALUES ('Investor')");
      profileRes = await pool.query("SELECT * FROM user_profile LIMIT 1");
    }
    const p = profileRes.rows[0];
    const milestoneTarget = Number(p.networth_milestone) || 1000000;
    const plAlertPct      = Number(p.pl_alert_pct) || 5;

    // Get assets & liabilities
    const assetsRes = await pool.query("SELECT * FROM assets");
    const liabsRes  = await pool.query("SELECT * FROM liabilities");
    const assets    = assetsRes.rows;
    const liabs     = liabsRes.rows;

    // ✅ Fetch live prices for accurate calculation
    console.log(`  📡 Fetching live prices for ${assets.length} assets...`);
    const assetPrices = {};
    for (const asset of assets) {
      let price = null;
      if (asset.symbol) price = await getLivePrice(asset.symbol);
      // fallback: stored current_price → buy_price
      if (!price || price <= 0) price = Number(asset.current_price) || Number(asset.buy_price);
      assetPrices[asset.id] = price;
      await new Promise(r => setTimeout(r, 300)); // avoid rate limiting
    }

    // Calculate totals using live prices
    const totalAssets      = assets.reduce((s,a) => s + assetPrices[a.id] * Number(a.quantity), 0);
    const totalLiabilities = liabs.reduce((s,l) => s + Number(l.amount), 0);
    const netWorth         = totalAssets - totalLiabilities;
    const totalInvested    = assets.reduce((s,a) => s + Number(a.buy_price) * Number(a.quantity), 0);
    const totalPL          = totalAssets - totalInvested;
    const plPct            = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    console.log(`  📋 Settings  : milestone=₹${milestoneTarget}, pl_threshold=${plAlertPct}%`);
    console.log(`  💰 Portfolio : Net Worth=₹${netWorth.toFixed(0)}, Invested=₹${totalInvested.toFixed(0)}, P&L=${plPct.toFixed(2)}%`);

    // ── 1. Net Worth Milestone ─────────────────────────────────────────
    if (netWorth >= milestoneTarget) {
      const label = milestoneTarget >= 10000000 ? `₹${(milestoneTarget/10000000).toFixed(1)}Cr`
                  : milestoneTarget >= 100000   ? `₹${(milestoneTarget/100000).toFixed(0)}L`
                  : milestoneTarget >= 1000     ? `₹${(milestoneTarget/1000).toFixed(1)}K`
                  : `₹${milestoneTarget}`;
      await createNotification(
        "milestone",
        `🎯 Net Worth crossed ${label}!`,
        `Your net worth is ₹${netWorth.toFixed(0)}, crossing your ${label} milestone. Keep it up!`
      );
    } else {
      console.log(`  ⏭️  Milestone not reached (₹${netWorth.toFixed(0)} < ₹${milestoneTarget})`);
    }

    // ── 2. P&L Alert ──────────────────────────────────────────────────
    if (Math.abs(plPct) >= plAlertPct) {
      await createNotification(
        "pl_alert",
        `${plPct >= 0 ? "📈 Portfolio up" : "📉 Portfolio down"} ${Math.abs(plPct).toFixed(1)}%`,
        `Your portfolio has ${plPct >= 0 ? "gained" : "lost"} ${Math.abs(plPct).toFixed(1)}% ` +
        `(₹${Math.abs(totalPL).toFixed(0)}) from your invested amount of ₹${totalInvested.toFixed(0)}.`
      );
    } else {
      console.log(`  ⏭️  P&L ${plPct.toFixed(2)}% is below threshold ${plAlertPct}%`);
    }

    // ── 3. Allocation Drift ────────────────────────────────────────────
    for (const asset of assets) {
      const target = Number(asset.target_pct);
      if (!target || target === 0) continue;
      const actualVal = assetPrices[asset.id] * Number(asset.quantity);
      const actual    = totalAssets > 0 ? (actualVal / totalAssets) * 100 : 0;
      const drift     = actual - target;
      if (Math.abs(drift) > 5) {
        await createNotification(
          "drift",
          `⚠️ ${asset.name} allocation drift`,
          `${asset.name} is ${drift > 0 ? "over" : "under"} your target by ${Math.abs(drift).toFixed(1)}%. ` +
          `Target: ${target}% · Actual: ${actual.toFixed(1)}%. Consider rebalancing.`
        );
      }
    }

    console.log(`✅ Notification checks complete\n`);
  } catch (err) {
    console.error("❌ Notification job error:", err.message);
    console.error(err.stack);
  }
};

// ── Weekly Digest ─────────────────────────────────────────────────────────
const runWeeklyDigest = async () => {
  console.log(`[${new Date().toLocaleString("en-IN")}] 📋 Running weekly digest...`);
  try {
    const assetsRes = await pool.query("SELECT * FROM assets");
    const liabsRes  = await pool.query("SELECT * FROM liabilities");
    const divRes    = await pool.query(
      "SELECT COALESCE(SUM(amount),0) as total FROM dividends WHERE received_date >= NOW() - INTERVAL '7 days'"
    );

    const assets           = assetsRes.rows;
    const liabs            = liabsRes.rows;

    // Fetch live prices for weekly digest too
    const assetPrices = {};
    for (const asset of assets) {
      let price = null;
      if (asset.symbol) price = await getLivePrice(asset.symbol);
      if (!price || price <= 0) price = Number(asset.current_price) || Number(asset.buy_price);
      assetPrices[asset.id] = price;
      await new Promise(r => setTimeout(r, 300));
    }

    const totalAssets      = assets.reduce((s,a) => s + assetPrices[a.id] * Number(a.quantity), 0);
    const totalLiabilities = liabs.reduce((s,l) => s + Number(l.amount), 0);
    const netWorth         = totalAssets - totalLiabilities;
    const totalInvested    = assets.reduce((s,a) => s + Number(a.buy_price) * Number(a.quantity), 0);
    const totalPL          = totalAssets - totalInvested;
    const plPct            = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
    const weeklyDiv        = Number(divRes.rows[0]?.total || 0);

    // Top performer
    const sorted = [...assets].sort((a,b) => {
      const pa = (assetPrices[a.id] - Number(a.buy_price)) / (Number(a.buy_price) || 1);
      const pb = (assetPrices[b.id] - Number(b.buy_price)) / (Number(b.buy_price) || 1);
      return pb - pa;
    });
    const top    = sorted[0];
    const topPct = top
      ? ((assetPrices[top.id] - Number(top.buy_price)) / (Number(top.buy_price) || 1) * 100).toFixed(1)
      : 0;

    await pool.query(
      "INSERT INTO notifications (type, title, message) VALUES ($1,$2,$3)",
      [
        "weekly",
        "📋 Weekly Portfolio Summary",
        `Net Worth: ₹${netWorth.toFixed(0)} | ` +
        `P&L: ${plPct>=0?"+":""}${plPct.toFixed(1)}% (₹${totalPL.toFixed(0)}) | ` +
        `Holdings: ${assets.length} stocks | Liabilities: ₹${totalLiabilities.toFixed(0)}` +
        (weeklyDiv > 0 ? ` | Dividends this week: ₹${weeklyDiv.toFixed(0)}` : "") +
        (top ? ` | 🏆 Top: ${top.name} (${topPct}%)` : "")
      ]
    );
    console.log("✅ Weekly digest created");
  } catch (err) {
    console.error("Weekly digest error:", err.message);
  }
};

// ── Cron Schedules ────────────────────────────────────────────────────────
// Daily at 4:00 PM IST Mon–Fri (after market close)
cron.schedule("0 16 * * 1-5", runNotificationChecks, { timezone:"Asia/Kolkata" });
// Weekly digest every Monday at 9:00 AM IST
cron.schedule("0 9 * * 1", runWeeklyDigest, { timezone:"Asia/Kolkata" });

console.log("✅ Notification jobs scheduled (4PM daily + Monday 9AM digest)");

module.exports = { runNotificationChecks, runWeeklyDigest };