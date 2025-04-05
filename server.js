const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "0uM5OlGVHtRh5WFTse0PRvJwidvTnkoMg9Uh0G1F2HNcqhvS2RL8pEOTJkwQ8nP3vw/qSgWA6UrGelQt0HlKzw=="; // Change this to a secure secret key

// 📌 CORS Configuration
const corsOptions = {
  origin: "*",  // 🔹 Allow any frontend (change "*" to your frontend URL if needed)
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// 📌 Database Setup (SQLite for simplicity)
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        score INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
  }
});

// 📌 Signup Route
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], function (err) {
    if (err) return res.status(400).json({ error: "Email already exists" });
    res.json({ message: "User registered successfully", userId: this.lastID });
  });
});

// 📌 Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid email or password" });

    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  });
});

// 📌 Score Submission Route
app.post("/submit-score", (req, res) => {
  const { userId, score } = req.body;
  if (!userId || score == null) return res.status(400).json({ error: "Missing data" });

  db.run("INSERT INTO scores (user_id, score) VALUES (?, ?)", [userId, score], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Score saved successfully" });
  });
});

// 📌 Fetch Score History
app.get("/score-history/:userId", (req, res) => {
  const userId = req.params.userId;
  db.all("SELECT * FROM scores WHERE user_id = ? ORDER BY timestamp DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 📌 Forgot Password (Dummy Endpoint)
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // 🔹 Normally, send an email with a reset link
  res.json({ message: "Password reset link sent to email (dummy response)" });
});

// 📌 Server Start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Required for Vercel deployment
