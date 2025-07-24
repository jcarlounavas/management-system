const express = require('express');
const cors = require('cors');
const db = require('./db'); // your promise-based mysql2 pool

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/transactions', async (req, res) => {
  console.log("📥 Incoming req.body:", req.body);
  const transactions = req.body;

  if (!Array.isArray(transactions)) {
    console.error("❌ Expected an array, but got:", typeof transactions);
    return res.status(400).json({ error: 'Invalid format: Expected an array of transactions' });
  }

  // Filter out transactions missing required fields
  const validTransactions = transactions.filter(tx =>
    tx.tx_date && tx.reference_no && tx.description
  );

  const skippedTransactions = transactions.filter(tx =>
    !tx.tx_date || !tx.reference_no || !tx.description
  );

  if (skippedTransactions.length > 0) {
    console.warn(`⚠️ Skipping ${skippedTransactions.length} invalid transaction(s):`, skippedTransactions);
  }

  if (validTransactions.length === 0) {
    return res.status(400).json({ error: 'No valid transactions to insert.' });
  }

  const values = validTransactions.map(tx => [
    tx.tx_date,
    tx.reference_no,
    tx.description,
    Number(tx.debit) || 0,
    Number(tx.credit) || 0,
    Number(tx.balance) || 0,
    tx.type,
    tx.sender,
    tx.receiver
  ]);

  const insertQuery = `
    INSERT INTO transactions 
    (tx_date, reference_no, description, debit, credit, balance, type, sender, receiver)
    VALUES ?
  `;

  try {
    const [result] = await db.query(insertQuery, [values]);
    console.log(`✅ Inserted ${result.affectedRows} transaction(s)`);
    res.status(200).json({ message: 'Transactions inserted successfully' });
  } catch (err) {
    console.error("❌ MySQL insert error:", err);
    res.status(500).json({ error: 'Failed to insert transactions' });
  }
});

app.get('/api/transactions', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let query = 'SELECT * FROM transactions';
    const params = [];

    if (startDate && endDate) {
      query += ' WHERE tx_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
