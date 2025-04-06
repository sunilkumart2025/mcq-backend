// server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors({
  origin: "https://srm-gamma.vercel.app", // your frontend domain
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "mcq_users"
});

db.connect((err) => {
  if (err) {
    console.error("DB Connection Error:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ✅ Create user table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )
`, (err) => {
  if (err) console.error("Table creation error:", err);
});

// ✅ Signup Route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and Password required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], (err) => {
      if (err) {
        return res.status(500).json({ message: "Signup failed" });
      }
      res.json({ message: "Signup successful" });
    });
  });
});

// ✅ Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Login failed" });
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful", user: results[0] });
  });
});

// ✅ Forgot Password Route (template - optional)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Send reset link via nodemailer (you need to configure SMTP)
  res.json({ message: "Reset password link sent (mock)" });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
