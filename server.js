const express = require("express");
const app = express();
app.use(express.json()); // 👈 necessary to parse JSON body
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Allow only your frontend domain
app.use(cors({
  origin: 'https://srm-gamma.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ MySQL (or Supabase SQL connection settings)
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g., 'db.supabase.com'
  user: process.env.DB_USER,       // your username
  password: process.env.DB_PASS,   // your password
  database: process.env.DB_NAME    // your database name
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to database');
  }
});

// ✅ Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("🔥 Signup Error:", error); // 👈 This will show up in Vercel logs
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', data: true });
  });
});

// ✅ Forgot password route (basic simulation)
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  // TODO: Send an email with reset link (use nodemailer later)
  res.json({ message: 'Reset email sent (simulated)', data: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
