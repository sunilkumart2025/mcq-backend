require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

app.use(cors({
  origin: 'https://srm-gamma.vercel.app', // your frontend domain
  credentials: true
}));
app.use(express.json());

app.use('/', authRoutes);
app.use('/', scoreRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
