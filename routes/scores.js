const express = require('express');
const db = require('../db');
const router = express.Router();

// Save score
router.post('/score', (req, res) => {
  const { email, subject, chapter, level, score } = req.body;
  db.query(
    'INSERT INTO scores (email, subject, chapter, level, score) VALUES (?, ?, ?, ?, ?)',
    [email, subject, chapter, level, score],
    (err) => {
      if (err) return res.status(500).send("Score save failed");
      res.send("Score saved");
    }
  );
});

// Get scores
router.get('/scores/:email', (req, res) => {
  const email = req.params.email;
  db.query('SELECT * FROM scores WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send("Error fetching scores");
    res.json(results);
  });
});

module.exports = router;
