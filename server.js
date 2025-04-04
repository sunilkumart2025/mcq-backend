const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ CORS Configuration (Allow requests from frontend)
const corsOptions = {
  origin: "*", // Change to your frontend URL if needed
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Database Connection (Replace with your database details)
const db = mysql.createConnection({
  host: "your-database-host",
  user: "your-database-username",
  password: "your-database-password",
  database: "your-database-name",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// ✅ JWT Secret Key
const JWT_SECRET = "your_secret_key";

// 📌 **User Signup API**
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashedPassword],
    (err, result) => {
      if (err) return res.status(400).json({ error: "User already exists" });
      res.status(201).json({ message: "User created successfully" });
    }
  );
});

// 📌 **User Login API**
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token, email: user.email });
  });
});

// 📌 **Store MCQ Scores API**
app.post("/save-score", (req, res) => {
  const { email, subject, chapter, level, score } = req.body;

  db.query(
    "INSERT INTO scores (email, subject, chapter, level, score) VALUES (?, ?, ?, ?, ?)",
    [email, subject, chapter, level, score],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Score saved successfully" });
    }
  );
});

// 📌 **Retrieve Score History API**
app.get("/get-scores/:email", (req, res) => {
  const email = req.params.email;

  db.query("SELECT * FROM scores WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// 📌 **Forgot Password API (Send Reset Email)**
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  const resetLink = `https://your-frontend-url/reset-password.html?token=${token}`;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Click this link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ error: "Email not sent" });
    res.json({ message: "Password reset email sent" });
  });
});

// 📌 **Reset Password API**
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, decoded.email], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Password updated successfully" });
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

// ✅ **Run Server on Vercel**
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = app; // Required for Vercel deployment
