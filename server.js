// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS FIX — very important!
app.use(cors({
  origin: 'https://srm-gamma.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors()); // Preflight request handling

app.use(express.json());

// ✅ Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// ✅ Signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data } = await axios.post(`${SUPABASE_URL}/auth/v1/signup`, {
      email, password
    }, {
      headers: {
        apiKey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.status(200).json({ message: 'Signup successful', data });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// ✅ Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data } = await axios.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      email, password
    }, {
      headers: {
        apiKey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.status(200).json({ message: 'Login successful', data });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// ✅ Forgot Password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data } = await axios.post(`${SUPABASE_URL}/auth/v1/recover`, {
      email
    }, {
      headers: {
        apiKey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.status(200).json({ message: 'Reset email sent', data });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
});

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Backend running fine.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
