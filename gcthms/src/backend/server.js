// src/backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// ✅ Register route
app.post('/api/register', async (req, res) => {
  const { firstname, lastname, email, password, contact_number } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ? OR contact_number = ?',
      [email, contact_number]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or contact number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (firstname, lastname, email, contact_number, password) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, email, contact_number, hashedPassword]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
    
// ✅ Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Fix: return user under "user" key
    res.json({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        contact_number: user.contact_number
      },
      token: 'dummy-token-for-now' // optional
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// ✅ Upload Summary + Transactions
app.post('/api/summary', async (req, res) => {
  const { fileName, numberOfTransactions, transactions = [] } = req.body;

  if (!fileName || numberOfTransactions == null) {
    return res.status(400).json({ error: "Missing required summary fields" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO summary (file_name, total_transaction) VALUES (?, ?)`,
      [fileName, numberOfTransactions]
    );
    const summaryId = result.insertId;

    const validTransactions = [];
    const skippedTransactions = [];

    transactions.forEach((tx, index) => {
      if (tx.tx_date && tx.description && tx.reference_no) {
        validTransactions.push(tx);
      } else {
        skippedTransactions.push({ index, tx });
      }
    });

    if (skippedTransactions.length > 0) {
      console.warn("Skipped invalid transactions:", skippedTransactions.length);
      console.table(skippedTransactions.map(({ index, tx }) => ({
        index,
        tx_date: tx.tx_date,
        description: tx.description,
        reference_no: tx.reference_no,
      })));
    }

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
        summaryId,
      ]);

      await db.query(
        `INSERT INTO transactions
         (tx_date, description, reference_no, debit, credit, balance, type, sender, receiver, summary_id)
         VALUES ?`,
        [values]
      );
    }

    res.status(201).json({
      summaryId,
      message: "Summary and valid transactions saved.",
      inserted: validTransactions.length,
      skipped: skippedTransactions.length,
    });

  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to save summary and transactions" });
  }
});

// ✅ All transactions (with optional date filter)
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

// ✅ Summary overview
app.get('/api/summaries', async (req, res) => {
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
    res.json({ summaries });
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Totals by summary ID
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
    console.error('Error fetching totals:', err);
    res.status(500).json({ error: 'Failed to fetch totals' });
  }
});

// ✅ Summary list
app.get('/api/summary', async (req, res) => {
  try {
    const [summaries] = await db.query(`SELECT id, file_name FROM summary ORDER BY id DESC`);
    res.json(summaries);
  } catch (err) {
    console.error('Error fetching summary list:', err);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

// ✅ Count summaries
app.get('/api/summary/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_summaries FROM summary');
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching summary count:', err);
    res.status(500).json({ error: 'Failed to fetch summary count' });
  }
});

// ✅ Count transactions
app.get('/api/transactions/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_transactions FROM transactions');
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching transaction count:', err);
    res.status(500).json({ error: 'Failed to fetch transaction count' });
  }
});

// ✅ All individual transactions
app.get('/api/individuals', async (req, res) => {
  try {
    const [transactions] = await db.query('SELECT * FROM transactions');
    res.json(transactions);
  } catch (err) {
    console.error("❌ MySQL select error:", err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});