const express        = require("express");
const router         = express.Router();
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt            = require("jsonwebtoken");
const pool           = require("../db");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const JWT_SECRET   = process.env.JWT_SECRET   || "foliox_secret";

// ── Auto-create users table ───────────────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS user_profile (
    id           SERIAL PRIMARY KEY,
    google_id    TEXT UNIQUE,
    email        TEXT UNIQUE,
    name         TEXT,
    avatar       TEXT,
    phone        TEXT,
    is_onboarded BOOLEAN DEFAULT FALSE,
    networth_milestone NUMERIC DEFAULT 1000000,
    pl_alert_pct       NUMERIC DEFAULT 10,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error);

// ── Passport Google Strategy ──────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;              // unique per Google account
    const email    = profile.emails?.[0]?.value || "";
    const name     = profile.displayName || "Investor";
    const avatar   = profile.photos?.[0]?.value || "";

    let result = await pool.query(
      "SELECT * FROM user_profile WHERE google_id=$1", [googleId]
    );

    if (result.rows.length === 0) {
      // Check by email (existing account before google_id was stored)
      result = await pool.query(
        "SELECT * FROM user_profile WHERE email=$1", [email]
      );
      if (result.rows.length > 0) {
        // Link google_id to existing account
        await pool.query(
          "UPDATE user_profile SET google_id=$1, avatar=$2 WHERE email=$3",
          [googleId, avatar, email]
        );
      } else {
        // Brand new user
        result = await pool.query(
          `INSERT INTO user_profile (google_id, email, name, avatar, is_onboarded)
           VALUES ($1,$2,$3,$4,FALSE) RETURNING *`,
          [googleId, email, name, avatar]
        );
      }
      result = await pool.query("SELECT * FROM user_profile WHERE google_id=$1", [googleId]);
    } else {
      // Update name/avatar on every login
      await pool.query(
        "UPDATE user_profile SET avatar=$1, name=$2 WHERE google_id=$3",
        [avatar, name, googleId]
      );
      result = await pool.query("SELECT * FROM user_profile WHERE google_id=$1", [googleId]);
    }

    return done(null, result.rows[0]);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const r = await pool.query("SELECT * FROM user_profile WHERE id=$1", [id]);
    done(null, r.rows[0]);
  } catch (err) { done(err, null); }
});

// ── GET /auth/config — frontend fetches this to get client ID ─────────────
router.get("/config", (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// ── GET /auth/google — start OAuth redirect ───────────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ── GET /auth/google/callback ─────────────────────────────────────────────
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}?error=true` }),
  (req, res) => {
    // user_id for all data isolation = user_profile.id (DB primary key, unique per Google account)
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email, name: req.user.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    const onboarded = req.user.is_onboarded;
    res.redirect(`${FRONTEND_URL}?token=${token}&onboarded=${onboarded}`);
  }
);

// ── POST /auth/complete-onboarding ────────────────────────────────────────
router.post("/complete-onboarding", async (req, res) => {
  try {
    const { token, networth_milestone, pl_alert_pct, phone } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    await pool.query(
      `UPDATE user_profile SET is_onboarded=TRUE, phone=$1,
       networth_milestone=$2, pl_alert_pct=$3 WHERE id=$4`,
      [phone||null, networth_milestone||1000000, pl_alert_pct||10, decoded.userId]
    );
    res.json({ message: "Onboarding complete" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const token   = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, JWT_SECRET);
    const r       = await pool.query("SELECT * FROM user_profile WHERE id=$1", [decoded.userId]);
    if (!r.rows.length) return res.status(404).json({ error: "User not found" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ── POST /auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.logout?.(() => {});
  res.json({ message: "Logged out" });
});

module.exports = router;