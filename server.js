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
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(query, [email, password], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Signup failed' });
    }
    res.json({ message: 'Signup successful', data: true });
  });
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
