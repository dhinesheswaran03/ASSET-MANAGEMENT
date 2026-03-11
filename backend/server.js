require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const session  = require("express-session");
const passport = require("passport");
const pool     = require("./db");
const app      = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// ── Session (required for passport) ──────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "foliox_session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/auth",        require("./routes/auth"));       // public — has own passport setup
app.use("/assets",      require("./routes/assets"));     // protected via authMiddleware
app.use("/liabilities", require("./routes/liabilities"));
app.use("/dividends",   require("./routes/dividends"));
app.use("/analytics",   require("./routes/analytics"));
app.use("/advisor",     require("./routes/advisor"));
app.use("/cash",        require("./routes/cash"));
app.use("/profile",     require("./routes/profile"));

// ── Stock search (public) ─────────────────────────────────────────────────
const axios = require("axios");
app.get("/search-stocks", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const r = await axios.get(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&lang=en-IN&region=IN&quotesCount=8&newsCount=0`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    const quotes = r.data?.quotes || [];
    res.json(quotes.filter(q => q.symbol && q.shortname).map(q => ({
      symbol: q.symbol, name: q.shortname || q.longname || q.symbol,
      exchange: q.exchange, type: q.quoteType
    })));
  } catch { res.status(500).json([]); }
});

// ── Net worth (protected) ─────────────────────────────────────────────────
const requireAuth = require("./middleware/authMiddleware");
app.get("/networth", requireAuth, async (req, res) => {
  try {
    const a = await pool.query(
      "SELECT COALESCE(SUM(current_price*quantity),0) AS total FROM assets WHERE user_id=$1",
      [req.userId]
    );
    const l = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS total FROM liabilities WHERE user_id=$1",
      [req.userId]
    );
    const totalAssets      = Number(a.rows[0].total);
    const totalLiabilities = Number(l.rows[0].total);
    res.json({ totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok" }); }
  catch { res.status(500).json({ status: "db error" }); }
});

// ── Auto-migrate: add user_id to all tables ───────────────────────────────
async function runMigrations() {
  const tables = ["assets","liabilities","dividends","networth_history","cash_holdings","notifications"];
  for (const t of tables) {
    try {
      await pool.query(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS user_id INTEGER`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_${t}_user_id ON ${t}(user_id)`);
    } catch(e) { /* table may not exist yet */ }
  }
  console.log("✅ Migrations done");
}

// ── Start background jobs if they exist ───────────────────────────────────
try { require("./jobs/priceUpdater"); } catch(e) {}
try { require("./jobs/notificationJob"); } catch(e) {}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await runMigrations();
  console.log(`🚀 FolioX backend running on port ${PORT}`);
});