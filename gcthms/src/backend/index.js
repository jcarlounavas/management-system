const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'gcthms'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// JWT secret (use env variable in real projects)
const SECRET_KEY = 'your_secret_key';

// 🔐 Register
app.post('/api/register', async (req, res) => {
  const { fullname, username, password } = req.body;
  if (!fullname || !username || !password) return res.status(400).json({ error: 'All fields are required' });

  const hashed = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO users (fullname, username, password_hash) VALUES (?, ?, ?)',
    [fullname, username, hashed],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already taken' });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Registered successfully' });
    }
  );
});

// 🔐 Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, name: user.fullname, username: user.username });
  });
});

app.listen(3000, () => console.log('🚀 Auth server running on http://localhost:3000'));
