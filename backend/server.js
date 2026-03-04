require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const session    = require("express-session");
const passport   = require("passport");
const axios      = require("axios");
const pool       = require("./db");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── Session (required for passport) ──────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "wealthtrack_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/auth",          require("./routes/auth"));
app.use("/assets",        require("./routes/assets"));
app.use("/liabilities",   require("./routes/liabilities"));
app.use("/analytics",     require("./routes/analytics"));
app.use("/notifications", require("./routes/notifications"));

// Stock symbol search
app.get("/search-stocks", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const response = await axios.get(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&lang=en-IN&region=IN&quotesCount=8&newsCount=0`,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }
    );
    const quotes = response.data?.quotes || [];
    res.json(quotes.filter(q => q.symbol && q.shortname).map(q => ({
      symbol: q.symbol, name: q.shortname || q.longname || q.symbol,
      exchange: q.exchange, type: q.quoteType
    })));
  } catch { res.status(500).json([]); }
});

// Net worth
app.get("/networth", async (req, res) => {
  try {
    const a = await pool.query("SELECT COALESCE(SUM(current_price*quantity),0) AS total FROM assets");
    const l = await pool.query("SELECT COALESCE(SUM(amount),0) AS total FROM liabilities");
    const totalAssets = Number(a.rows[0].total);
    const totalLiabilities = Number(l.rows[0].total);
    res.json({ totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/", (req, res) => res.json({ message: "WealthTrack API 🚀" }));

require("./jobs/priceUpdater");
require("./jobs/notificationJob");

app.use("/advisor", require("./routes/advisor"));

app.listen(5000, () => console.log("✅ Server running on port 5000"));