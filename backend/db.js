const { Pool } = require("pg");

const pool = new Pool({
  user:     process.env.DB_USER     || "postgres",
  host:     process.env.DB_HOST     || "localhost",
  database: process.env.DB_NAME     || "assetdb",
  password: process.env.DB_PASSWORD || "postgres",
  port:     Number(process.env.DB_PORT) || 5432,
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err.message);
});

// Test connection on startup
pool.query("SELECT NOW()").then(() => {
  console.log("✅ PostgreSQL connected");
}).catch(err => {
  console.error("❌ PostgreSQL failed to connect:", err.message);
  console.error("   → Check: Is PostgreSQL running? Is DB_PASSWORD correct in .env?");
});

module.exports = pool;