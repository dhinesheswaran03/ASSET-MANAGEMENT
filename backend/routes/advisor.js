const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { GoogleGenAI } = require("@google/genai");

const ai    = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

// ── Build portfolio context for Gemini ────────────────────────────────────
const buildPortfolioContext = async () => {
  const assetsRes = await pool.query("SELECT * FROM assets ORDER BY current_price * quantity DESC");
  const liabsRes  = await pool.query("SELECT * FROM liabilities");
  const divsRes   = await pool.query("SELECT COALESCE(SUM(amount),0) as total FROM dividends");
  const histRes   = await pool.query(
    "SELECT * FROM networth_history ORDER BY recorded_at DESC LIMIT 10"
  );

  const assets           = assetsRes.rows;
  const liabs            = liabsRes.rows;
  const totalAssets      = assets.reduce((s,a) => s + Number(a.current_price)*Number(a.quantity), 0);
  const totalLiabilities = liabs.reduce((s,l) => s + Number(l.amount), 0);
  const netWorth         = totalAssets - totalLiabilities;
  const totalInvested    = assets.reduce((s,a) => s + Number(a.buy_price)*Number(a.quantity), 0);
  const totalPL          = totalAssets - totalInvested;
  const plPct            = totalInvested > 0 ? (totalPL/totalInvested)*100 : 0;

  // Sector breakdown
  const sectorMap = {};
  assets.forEach(a => {
    const sector = a.sector || "Unknown";
    const val    = Number(a.current_price) * Number(a.quantity);
    sectorMap[sector] = (sectorMap[sector] || 0) + val;
  });

  // Drift alerts
  const driftAlerts = assets
    .filter(a => Number(a.target_pct) > 0)
    .map(a => {
      const actual = totalAssets > 0
        ? (Number(a.current_price)*Number(a.quantity)/totalAssets)*100 : 0;
      const drift = actual - Number(a.target_pct);
      return { name:a.name, target:a.target_pct, actual:actual.toFixed(1), drift:drift.toFixed(1) };
    })
    .filter(a => Math.abs(a.drift) > 5);

  // Per-stock details
  const stockLines = assets.map(a => {
    const cv     = Number(a.current_price)*Number(a.quantity);
    const inv    = Number(a.buy_price)*Number(a.quantity);
    const pl     = cv - inv;
    const plP    = inv > 0 ? ((pl/inv)*100).toFixed(1) : "0";
    const allocP = totalAssets > 0 ? (cv/totalAssets*100).toFixed(1) : "0";
    return `• ${a.name} (${a.symbol||"-"}) | Sector: ${a.sector||"Unknown"} | ` +
           `Qty: ${a.quantity} | Buy: ₹${a.buy_price} | Now: ₹${a.current_price} | ` +
           `Value: ₹${cv.toFixed(0)} | P&L: ₹${pl.toFixed(0)} (${plP}%) | ` +
           `Allocation: ${allocP}%${Number(a.target_pct)>0?` | Target: ${a.target_pct}%`:""}`;
  }).join("\n");

  const sectorLines = Object.entries(sectorMap)
    .sort((a,b) => b[1]-a[1])
    .map(([s,v]) => `• ${s}: ₹${v.toFixed(0)} (${(v/totalAssets*100).toFixed(1)}%)`)
    .join("\n");

  const liabLines = liabs.length === 0 ? "None"
    : liabs.map(l => `• ${l.name}: ₹${l.amount} @ ${l.interest}% for ${l.tenure} yrs`).join("\n");

  const driftLines = driftAlerts.length === 0 ? "No significant drift"
    : driftAlerts.map(d =>
        `• ${d.name}: Target ${d.target}% → Actual ${d.actual}% (${Number(d.drift)>0?"+":""}${d.drift}%)`
      ).join("\n");

  const histLines = histRes.rows.length === 0 ? "No history yet"
    : histRes.rows.map(h =>
        `• ${new Date(h.recorded_at).toLocaleDateString("en-IN")}: ₹${Number(h.net_worth).toFixed(0)}`
      ).join("\n");

  return `
You are an expert Indian stock market portfolio advisor inside WealthTrack, a personal finance app.
You have full access to the user's live portfolio. Be specific, data-driven, and actionable.
Always reference actual numbers from the data. Be friendly but professional.
Use bullet points where helpful. Keep responses under 250 words unless the user asks for more detail.
Never say you don't have access to the portfolio — you have all the data below.
Always respond in plain text, avoid markdown headers or excessive formatting.

=== PORTFOLIO SUMMARY ===
Net Worth:         ₹${netWorth.toFixed(0)}
Total Assets:      ₹${totalAssets.toFixed(0)}
Total Invested:    ₹${totalInvested.toFixed(0)}
Total P&L:         ₹${totalPL.toFixed(0)} (${plPct.toFixed(1)}%)
Total Liabilities: ₹${totalLiabilities.toFixed(0)}
Total Dividends:   ₹${Number(divsRes.rows[0]?.total||0).toFixed(0)}
Number of stocks:  ${assets.length}

=== HOLDINGS (sorted by value) ===
${stockLines || "No holdings yet"}

=== SECTOR ALLOCATION ===
${sectorLines || "No sector data"}

=== LIABILITIES ===
${liabLines}

=== DRIFT ALERTS (>5% off target) ===
${driftLines}

=== NET WORTH HISTORY (recent) ===
${histLines}
`;
};

// ── POST /advisor/chat ────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const portfolioContext = await buildPortfolioContext();

    // ✅ New @google/genai SDK — build contents array directly
    const contents = [
      // Inject portfolio context as first exchange
      { role:"user",  parts:[{ text: "Here is my complete portfolio data:\n" + portfolioContext }] },
      { role:"model", parts:[{ text: "I have full access to your portfolio. I can see all your holdings, P&L, sector allocation, drift alerts, and net worth history. What would you like to know?" }] },
      // Append full conversation history
      ...messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    ];

    const response = await ai.models.generateContent({ model:MODEL, contents });
    const reply = response.candidates[0].content.parts[0].text;
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

    const prompt = portfolioContext + `

Based on this portfolio, give exactly 4 quick insights as pure JSON only.
No markdown, no backticks, no preamble — just raw JSON like this:
{
  "insights": [
    { "type": "positive", "title": "short title max 5 words", "message": "1-2 sentence insight with specific numbers from the portfolio" },
    { "type": "warning",  "title": "short title max 5 words", "message": "1-2 sentence insight with specific numbers from the portfolio" },
    { "type": "action",   "title": "short title max 5 words", "message": "1-2 sentence actionable suggestion with specific numbers" },
    { "type": "info",     "title": "short title max 5 words", "message": "1-2 sentence interesting observation with specific numbers" }
  ]
}`;

    // ✅ New @google/genai SDK
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role:"user", parts:[{ text: prompt }] }]
    });

    let text = response.candidates[0].content.parts[0].text.trim();

    // Strip markdown fences if Gemini adds them
    text = text.replace(/```json|```/g, "").trim();

    // Extract JSON if there's extra text around it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (err) {
    console.error("Quick insights error:", err.message);
    // Fallback so UI never breaks
    res.json({
      insights: [
        { type:"info",     title:"AI Advisor Ready",     message:"Your portfolio data is loaded. Ask me anything about your investments in the chat below!" },
        { type:"action",   title:"Try Asking",           message:"Click a suggested question or type your own to get personalised advice based on your actual holdings." },
        { type:"positive", title:"Free AI Analysis",     message:"Powered by Gemini — completely free with no usage limits for personal use." },
        { type:"info",     title:"Refresh For Insights", message:"Click Refresh above to generate real AI insights based on your current portfolio data." }
      ]
    });
  }
});

module.exports = router;