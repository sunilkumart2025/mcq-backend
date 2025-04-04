require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
app.use(cors());
const { Pool } = require("pg");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Signup
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email.includes("@")) return res.status(400).json({ message: "Invalid email" });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", [email, hashedPassword]);
    res.json({ success: true, userId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: "Error: Email already registered" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.rows[0].password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token });
});

// Forgot Password (Send Email)
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

  await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [token, email]);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Reset Password",
    html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password.</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ message: "Email send failed" });
    res.json({ success: true, message: "Check your email for reset link" });
  });
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1, reset_token = NULL WHERE email = $2", [hashedPassword, email]);
    res.json({ success: true, message: "Password updated" });
  } catch {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// Save Score
app.post("/api/save-score", async (req, res) => {
  const { userId, subject, chapter, level, score, total } = req.body;
  await pool.query("INSERT INTO scores (user_id, subject, chapter, level, score, total) VALUES ($1, $2, $3, $4, $5, $6)", 
    [userId, subject, chapter, level, score, total]);
  res.json({ success: true });
});

// Get Score History
app.get("/api/score-history", async (req, res) => {
  const { userId } = req.query;
  const results = await pool.query("SELECT * FROM scores WHERE user_id = $1", [userId]);
  res.json(results.rows);
});

// Start Server
app.listen(3000, () => console.log("✅ Server running on port 3000"));
