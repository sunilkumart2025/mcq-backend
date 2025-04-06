// server.js

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS config for GitHub Pages frontend
app.use(
  cors({
    origin: "https://srm-gamma.vercel.app", // ✅ your frontend URL here
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// PostgreSQL config for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Important for Supabase
  },
});

// Basic root route
app.get("/", (req, res) => {
  res.status(200).send("✅ MCQ Backend is running");
});

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [
      name,
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Signup successful." });
  } catch (err) {
    console.error("🔥 Signup error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Start server (needed only for local dev, not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
