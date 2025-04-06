const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://srm-gamma.vercel.app',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) return console.error('DB error:', err);
  console.log('MySQL connected');
});

// Example signup route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json({ message: 'Signup success' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
