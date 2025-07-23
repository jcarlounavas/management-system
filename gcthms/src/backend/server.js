const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/transactions', async (req, res) => {
  console.log("Incoming req.body:", req.body);
  console.log("Type of req.body:", typeof req.body);

  const transactions = req.body;

  if (!Array.isArray(transactions)) {
    console.error("❌ Expected an array, but got:", typeof transactions);
    return res.status(400).json({ error: 'Invalid format: Expected an array of transactions' });
  }

});