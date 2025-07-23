// src/backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // This is your promise-based pool

const app = express();
app.use(cors());
app.use(express.json());

// Optional: health check
app.get('/', (req, res) => {
  res.send('✅ Server is running...');
});

// ✅ Register endpoint with MySQL insert
app.post('/api/register', async (req, res) => {
  const { fullname, username, password } = req.body;

  if (!fullname || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if username already exists
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Insert new user
    await db.query(
  'INSERT INTO users (fullname, username, password_hash, created_at) VALUES (?, ?, ?, NOW())',
  [fullname, username, password]
);

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT fullname, username FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({
      message: 'Logged in successfully',
      user: users[0]
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Other endpoint example
app.post('/api/transactions', async (req, res) => {
  const transactions = req.body;

  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Invalid format: Expected an array of transactions' });
  }

  // Save logic...
  res.json({ message: 'Transactions received' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
