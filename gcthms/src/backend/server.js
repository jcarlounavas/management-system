const express = require('express');
const cors = require('cors');
const db = require('./db'); // Your pool is defined here
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// POST: Insert Summary
app.post('/api/summary', async (req, res) => {
  const {
    fileName,
    numberOfTransactions,
    transactions = [],
  } = req.body;

  if (!fileName || numberOfTransactions == null) {
    return res.status(400).json({ error: "Missing required summary fields" });
  }

  try {
    // STEP 1: Insert summary
    const [result] = await db.query(
      `INSERT INTO summary (file_name, total_transaction)
       VALUES (?, ?)`,
      [fileName, numberOfTransactions]
    );

    const summaryId = result.insertId;

    // STEP 2: If transactions exist, insert them
    if (Array.isArray(transactions) && transactions.length > 0) {
      const validTransactions = transactions.filter(
        (tx) =>
          tx.tx_date &&
          tx.description &&
          tx.reference_no
      );

      if (validTransactions.length > 0) {
        const values = validTransactions.map((tx) => [
          tx.tx_date,
          tx.description,
          tx.reference_no,
          tx.debit ?? 0,
          tx.credit ?? 0,
          tx.balance ?? 0,
          tx.type ?? '',
          tx.sender ?? '',
          tx.receiver ?? '',
          summaryId
        ]);

        await db.query(
          `INSERT INTO transactions
           (tx_date, description, reference_no, debit, credit, balance, type, sender, receiver, summary_id)
           VALUES ?`,
          [values]
        );
      }
    }

    res.status(201).json({ summaryId, message: "Summary and any valid transactions saved." });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to save summary and transactions" });
  }
});


// GET: All Transactions (optional date filtering)
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
    console.error('Transactions fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//GET Summary
app.get('/api/summary/:id/transactions', async (req, res) => {
  const summaryId = req.params.id;
  console.log('Incoming request for summary ID:', summaryId);

  if (!summaryId) {
    return res.status(400).json({ error: 'Missing summary ID' });
  }

  try {
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE summary_id = ? ORDER BY tx_date ASC',
      [summaryId]
    );

    console.log('Transactions fetched:', transactions);

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found for this summary ID' });
    }

    res.json(transactions);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});




// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
