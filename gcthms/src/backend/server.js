const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ Server is running...');
});

// Register endpoint
app.post('/register', async (req, res) => {
  const { fullname, username, password } = req.body;
  if (!fullname || !username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (fullname, username, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [fullname, username, hashedPassword]
    );
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT fullname, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    res.json({
      message: 'Logged in successfully',
      user: { fullname: user.fullname, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
