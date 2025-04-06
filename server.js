// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for your frontend
app.use(cors({
  origin: 'https://srm-gamma.vercel.app',
  credentials: true,
}));

app.use(express.json());

// ✅ Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// ➤ Signup API
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await axios.post(
      `${SUPABASE_URL}/auth/v1/signup`,
      { email, password },
      {
        headers: {
          apiKey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (error) return res.status(400).json({ error });
    res.status(200).json({ message: 'Signup successful', data });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// ➤ Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await axios.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
      {
        headers: {
          apiKey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (error) return res.status(401).json({ error });
    res.status(200).json({ message: 'Login successful', data });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// ➤ Forgot Password (trigger email)
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await axios.post(
      `${SUPABASE_URL}/auth/v1/recover`,
      { email },
      {
        headers: {
          apiKey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (error) return res.status(400).json({ error });
    res.status(200).json({ message: 'Reset email sent', data });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
});

// ➤ Root Test
app.get('/', (req, res) => {
  res.send('Backend is working with Supabase!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
