// src/backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ✅ Register endpoint
app.post('/api/register', async (req, res) => {
  const { firstname, lastname, email, password, contact_number } = req.body;

  try {
    // Check if email or contact_number already exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ? OR contact_number = ?',
      [email, contact_number]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or contact number already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await db.query(
      'INSERT INTO users (firstname, lastname, email, contact_number, password) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, email, contact_number, hashedPassword]
    );

    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user info (excluding password)
    res.json({
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      contact_number: user.contact_number,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
