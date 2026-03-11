const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "foliox_secret";

module.exports = function requireAuth(req, res, next) {
  const header = req.headers["authorization"] || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthorized: no token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // userId = user_profile.id (integer, unique per Google account)
    req.userId = decoded.userId || decoded.id;
    if (!req.userId) return res.status(401).json({ error: "Unauthorized: invalid token" });
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: token expired or invalid" });
  }
};