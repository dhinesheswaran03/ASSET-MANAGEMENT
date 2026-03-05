const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const Groq    = require("groq-sdk");
const axios   = require("axios");

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// ── Fetch live price from Yahoo Finance ───────────────────────────────────
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

// ── Build portfolio context with LIVE prices ──────────────────────────────
const buildPortfolioContext = async () => {
  const assetsRes = await pool.query("SELECT * FROM assets ORDER BY id DESC");
  const liabsRes  = await pool.query("SELECT * FROM liabilities");
  const divsRes   = await pool.query("SELECT COALESCE(SUM(amount),0) as total FROM dividends");
  const histRes   = await pool.query(
    "SELECT * FROM networth_history ORDER BY recorded_at DESC LIMIT 10"
  );

  const assets = assetsRes.rows;

  // ✅ Fetch live prices — same as dashboard
  await Promise.all(
    assets.map(async (asset) => {
      if (asset.symbol) {
        const live = await getLivePrice(asset.symbol);
        asset.current_price = live || Number(asset.current_price) || Number(asset.buy_price);
      } else {
        asset.current_price = Number(asset.current_price) || Number(asset.buy_price);
      }
    })
  );

  const liabs            = liabsRes.rows;
  const totalAssets      = assets.reduce((s,a) => s + Number(a.current_price)*Number(a.quantity), 0);
  const totalLiabilities = liabs.reduce((s,l) => s + Number(l.amount), 0);
  const netWorth         = totalAssets - totalLiabilities;
  const totalInvested    = assets.reduce((s,a) => s + Number(a.buy_price)*Number(a.quantity), 0);
  const totalPL          = totalAssets - totalInvested;
  const plPct            = totalInvested > 0 ? (totalPL/totalInvested)*100 : 0;

  const sectorMap = {};
  assets.forEach(a => {
    const sector = a.sector || "Unknown";
    const val    = Number(a.current_price) * Number(a.quantity);
    sectorMap[sector] = (sectorMap[sector] || 0) + val;
  });

  const driftAlerts = assets
    .filter(a => Number(a.target_pct) > 0)
    .map(a => {
      const actual = totalAssets > 0
        ? (Number(a.current_price)*Number(a.quantity)/totalAssets)*100 : 0;
      const drift = actual - Number(a.target_pct);
      return { name:a.name, target:a.target_pct, actual:actual.toFixed(1), drift:drift.toFixed(1) };
    })
    .filter(a => Math.abs(a.drift) > 5);

  const stockLines = assets.map(a => {
    const cv     = Number(a.current_price)*Number(a.quantity);
    const inv    = Number(a.buy_price)*Number(a.quantity);
    const pl     = cv - inv;
    const plP    = inv > 0 ? ((pl/inv)*100).toFixed(1) : "0";
    const allocP = totalAssets > 0 ? (cv/totalAssets*100).toFixed(1) : "0";
    return `• ${a.name} (${a.symbol||"-"}) | Sector: ${a.sector||"Unknown"} | ` +
           `Qty: ${a.quantity} | Buy: Rs.${a.buy_price} | Now: Rs.${Number(a.current_price).toFixed(2)} | ` +
           `Value: Rs.${cv.toFixed(0)} | P&L: Rs.${pl.toFixed(0)} (${plP}%) | ` +
           `Allocation: ${allocP}%${Number(a.target_pct)>0?` | Target: ${a.target_pct}%`:""}`;
  }).join("\n");

  const sectorLines = Object.entries(sectorMap)
    .sort((a,b) => b[1]-a[1])
    .map(([s,v]) => `• ${s}: Rs.${v.toFixed(0)} (${(v/totalAssets*100).toFixed(1)}%)`)
    .join("\n");

  const liabLines = liabs.length === 0 ? "None"
    : liabs.map(l => `• ${l.name}: Rs.${l.amount} @ ${l.interest}% for ${l.tenure} yrs`).join("\n");

  const driftLines = driftAlerts.length === 0 ? "No significant drift"
    : driftAlerts.map(d =>
        `• ${d.name}: Target ${d.target}% -> Actual ${d.actual}% (${Number(d.drift)>0?"+":""}${d.drift}%)`
      ).join("\n");

  const histLines = histRes.rows.length === 0 ? "No history yet"
    : histRes.rows.map(h =>
        `• ${new Date(h.recorded_at).toLocaleDateString("en-IN")}: Rs.${Number(h.net_worth).toFixed(0)}`
      ).join("\n");

  return `You are an expert Indian stock market portfolio advisor inside WealthTrack, a personal finance app.
You have full access to the user's live portfolio with real-time prices. Be specific, data-driven, and actionable.
Always reference actual numbers from the data. Be friendly but professional.
Use bullet points where helpful. Keep responses under 250 words unless asked for more.
Never say you don't have access to the portfolio — you have all the data below.
Respond in plain text only, no markdown headers.

=== PORTFOLIO SUMMARY (LIVE PRICES) ===
Net Worth:          Rs.${netWorth.toFixed(0)}
Total Assets:       Rs.${totalAssets.toFixed(0)}
Total Invested:     Rs.${totalInvested.toFixed(0)}
Total P&L:          Rs.${totalPL.toFixed(0)} (${plPct.toFixed(1)}%)
Total Liabilities:  Rs.${totalLiabilities.toFixed(0)}
Total Dividends:    Rs.${Number(divsRes.rows[0]?.total||0).toFixed(0)}
Number of holdings: ${assets.length}

=== HOLDINGS (with live prices) ===
${stockLines || "No holdings yet"}

=== SECTOR ALLOCATION ===
${sectorLines || "No sector data"}

=== LIABILITIES ===
${liabLines}

=== DRIFT ALERTS (>5% off target) ===
${driftLines}

=== NET WORTH HISTORY (recent) ===
${histLines}`;
};

// ── POST /advisor/chat ────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const portfolioContext = await buildPortfolioContext();

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: portfolioContext },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I could not generate a response.";
    res.json({ reply });

  } catch (err) {
    console.error("Advisor chat error:", err.message);
    res.status(500).json({ error: "AI advisor unavailable. Please try again." });
  }
});

// ── GET /advisor/quick-insights ───────────────────────────────────────────
router.get("/quick-insights", async (req, res) => {
  try {
    const portfolioContext = await buildPortfolioContext();

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: portfolioContext },
        { role: "user", content: `Give exactly 4 quick insights about this portfolio as pure JSON only.
No markdown, no backticks, no preamble — just raw JSON:
{
  "insights": [
    { "type": "positive", "title": "short title max 5 words", "message": "1-2 sentence insight with specific numbers" },
    { "type": "warning",  "title": "short title max 5 words", "message": "1-2 sentence insight with specific numbers" },
    { "type": "action",   "title": "short title max 5 words", "message": "1-2 sentence actionable suggestion with numbers" },
    { "type": "info",     "title": "short title max 5 words", "message": "1-2 sentence interesting observation with numbers" }
  ]
}` }
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    let text = completion.choices[0]?.message?.content?.trim() || "";
    text = text.replace(/```json|```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (err) {
    console.error("Quick insights error:", err.message);
    res.json({
      insights: [
        { type:"info",     title:"AI Advisor Ready",     message:"Your portfolio data is loaded. Ask me anything about your investments in the chat below!" },
        { type:"action",   title:"Try Asking",           message:"Click a suggested question or type your own to get personalised advice based on your actual holdings." },
        { type:"positive", title:"Free AI Analysis",     message:"Powered by Groq LLaMA — completely free with 14,400 requests per day." },
        { type:"info",     title:"Refresh For Insights", message:"Click Refresh above to generate real AI insights based on your current portfolio data." }
      ]
    });
  }
});

module.exports = router;