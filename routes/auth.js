const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed], (err) => {
    if (err) return res.status(500).send('Signup failed');
    res.send('Signup success');
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).send('Invalid email');
    const isMatch = await bcrypt.compare(password, results[0].password);
    if (!isMatch) return res.status(401).send('Wrong password');
    const token = jwt.sign({ email }, JWT_SECRET);
    res.json({ token });
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your password",
    html: `<a href="https://yourfrontend.com/reset-password?token=${token}">Click here to reset</a>`
  };

  transporter.sendMail(mailOptions, err => {
    if (err) return res.status(500).send("Email failed");
    res.send("Check your email to reset password");
  });
});

// Reset password (frontend should send token + new password)
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const { email } = jwt.verify(token, JWT_SECRET);
    const hashed = await bcrypt.hash(password, 10);
    db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email], err => {
      if (err) return res.status(500).send("Reset failed");
      res.send("Password updated");
    });
  } catch (e) {
    res.status(400).send("Invalid or expired token");
  }
});

module.exports = router;
