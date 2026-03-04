const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const pool = require("../db");

// ── Passport Google Strategy ──────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email    = profile.emails?.[0]?.value || "";
    const name     = profile.displayName || "Investor";
    const avatar   = profile.photos?.[0]?.value || "";

    // Check if user exists
    let result = await pool.query(
      "SELECT * FROM user_profile WHERE google_id=$1", [googleId]
    );

    if (result.rows.length === 0) {
      // Check by email
      result = await pool.query(
        "SELECT * FROM user_profile WHERE email=$1", [email]
      );
      if (result.rows.length > 0) {
        // Link Google ID to existing profile
        await pool.query(
          "UPDATE user_profile SET google_id=$1, avatar=$2 WHERE email=$3",
          [googleId, avatar, email]
        );
        result = await pool.query("SELECT * FROM user_profile WHERE email=$1", [email]);
      } else {
        // Create new user
        result = await pool.query(
          `INSERT INTO user_profile (name, email, google_id, avatar, is_onboarded)
           VALUES ($1,$2,$3,$4,FALSE) RETURNING *`,
          [name, email, googleId, avatar]
        );
      }
    } else {
      // Update avatar in case it changed
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
    const result = await pool.query("SELECT * FROM user_profile WHERE id=$1", [id]);
    done(null, result.rows[0]);
  } catch (err) { done(err, null); }
});

// ── Routes ────────────────────────────────────────────────────────────────

// Start Google OAuth
router.get("/google",
  passport.authenticate("google", { scope:["profile","email"] })
);

// Google callback
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login?error=true" }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // Redirect to frontend with token
    const isOnboarded = req.user.is_onboarded;
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&onboarded=${isOnboarded}`);
  }
);

// Complete onboarding
router.post("/complete-onboarding", async (req, res) => {
  try {
    const { token, networth_milestone, pl_alert_pct, phone } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await pool.query(
      `UPDATE user_profile SET is_onboarded=TRUE, phone=$1,
       networth_milestone=$2, pl_alert_pct=$3 WHERE id=$4`,
      [phone||null, networth_milestone||1000000, pl_alert_pct||5, decoded.id]
    );
    res.json({ message: "Onboarding complete" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Get current user from token
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT * FROM user_profile WHERE id=$1", [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout?.(() => {});
  res.json({ message: "Logged out" });
});

module.exports = router;