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
    // STEP 1: Insert into summary
    const [result] = await db.query(
      `INSERT INTO summary (file_name, total_transaction)
       VALUES (?, ?)`,
      [fileName, numberOfTransactions]
    );

    const summaryId = result.insertId;

    // STEP 2: Check for existing reference numbers
    const referenceNos = transactions.map(tx => tx.reference_no).filter(Boolean);
    let existingReferences = [];

    if (referenceNos.length > 0) {
      const [existing] = await db.query(
        `SELECT reference_no FROM transactions 
         WHERE reference_no IN (?)`,
        [referenceNos]
      );
      existingReferences = existing.map(row => row.reference_no);
    }

    // STEP 3: Prepare transactions (skip duplicates)
    const values = [];
    const skippedDuplicates = [];

    transactions.forEach(tx => {
      if (tx.reference_no && existingReferences.includes(tx.reference_no)) {
        skippedDuplicates.push(tx.reference_no);
      } else {
        values.push([
          tx.tx_date || null,
          tx.description || null,
          tx.reference_no || null,
          tx.debit ?? 0,
          tx.credit ?? 0,
          tx.balance ?? 0,
          tx.type || '',
          tx.sender || '',
          tx.receiver || '',
          summaryId
        ]);
      }
    });

    // STEP 4: Insert non-duplicate transactions
    if (values.length > 0) {
      await db.query(
        `INSERT INTO transactions
         (tx_date, description, reference_no, debit, credit, balance, type, sender, receiver, summary_id)
         VALUES ?`,
        [values]
      );
    }

    res.status(201).json({
      summaryId,
      message: "Data saved with duplicate reference checking",
      inserted: values.length,
      skippedDuplicates: skippedDuplicates.length,
      duplicateReferences: skippedDuplicates
    });

  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to save data" });
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
app.get('/summary/transactions', async (req, res) => {
  try {
    const [summaries] = await db.query(`
      SELECT 
        s.id AS summary_id,
        s.created_at,
        COUNT(t.id) AS transaction_count,
        IFNULL(SUM(t.debit), 0) AS totalDebit,
        IFNULL(SUM(t.credit), 0) AS totalCredit
      FROM summary s
      LEFT JOIN transactions t ON t.summary_id = s.id
      GROUP BY s.id
      ORDER BY s.id DESC
    `);

    res.json({ summaries }); // renamed from { summary } to { summaries }

  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/api/summary/:id/totals', async (req, res) => {
  const summaryId = req.params.id;

  if (!summaryId) {
    return res.status(400).json({ error: 'Missing summary ID' });
  }

  try {
    const [rows] = await db.query(
      `SELECT 
         SUM(debit) AS total_debit,
         SUM(credit) AS total_credit
       FROM transactions
       WHERE summary_id = ?`,
      [summaryId]
    );

    const totals = rows[0] || { total_debit: 0, total_credit: 0 };
    res.json(totals);
  } catch (err) {
    console.error('Error fetching totals by summary ID:', err);
    res.status(500).json({ error: 'Failed to fetch totals by summary ID' });
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const [summaries] = await db.query(`SELECT id, file_name FROM summary ORDER BY id DESC`);
    res.json(summaries);
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

app.get('/api/summary/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_transactions FROM summary');
    res.json(rows[0]);  // returns { total_summaries: N }
  } catch (err) {
    console.error('Error fetching summary count:', err);
    res.status(500).json({ error: 'Failed to fetch summary count' });
  }
});







// Start Server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
