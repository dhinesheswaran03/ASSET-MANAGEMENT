const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET unread count
router.get("/unread-count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE is_read = FALSE"
    );
    res.json({ count: Number(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark one as read
router.put("/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=TRUE WHERE id=$1", [req.params.id]);
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put("/read-all", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=TRUE");
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all
router.delete("/clear-all", async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications");
    res.json({ message: "Cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET profile
router.get("/profile", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM user_profile LIMIT 1");
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO user_profile (name) VALUES ('Investor')");
      return res.json({ name:"Investor", currency:"INR", networth_milestone:1000000, pl_alert_pct:5 });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT profile
router.put("/profile", async (req, res) => {
  try {
    const { name, email, phone, networth_milestone, pl_alert_pct } = req.body;
    await pool.query(
      `UPDATE user_profile SET name=$1, email=$2, phone=$3,
       networth_milestone=$4, pl_alert_pct=$5`,
      [name, email||null, phone||null, networth_milestone||1000000, pl_alert_pct||5]
    );
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Run checks now
const { runNotificationChecks } = require("../jobs/notificationJob");

router.post("/run-checks", async (req, res) => {
  try {
    await runNotificationChecks();
    res.json({ message: "Checks complete" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;