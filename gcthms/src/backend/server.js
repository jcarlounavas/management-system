const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads/profile_images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.query.user_id}${ext}`);
  },
});

const upload = multer({ storage });


// Register
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
//Log In
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

    // Fix: return user under "user" key
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

//Insert Summary
app.post('/api/summary', async (req, res) => {
  const {
    fileName,
    numberOfTransactions,
    transactions = [],
    user_id
  } = req.body;

  if (!fileName || numberOfTransactions == null || !user_id) {
    return res.status(400).json({ error: "Missing required summary fields" });
  }

  try {
    // Insert into summary
    const [result] = await db.query(
    `INSERT INTO summary (file_name, total_transaction, user_id)
    VALUES (?, ?, ?)`,
    [fileName, numberOfTransactions, user_id]
  );

    const summaryId = result.insertId;
    // Extract reference numbers from uploaded transactions by user_id
    const referenceNos = transactions.map(tx => tx.reference_no).filter(Boolean);

    let existingReferences = [];

    if (referenceNos.length > 0) {
      const [existing] = await db.query(
        `SELECT t.reference_no 
        FROM transactions t
        INNER JOIN summary s ON t.summary_id = s.id
        WHERE t.reference_no IN (?) AND s.user_id = ?`,
        [referenceNos, user_id]
      );

      existingReferences = existing.map(row => row.reference_no);
    }
    
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

    // Insert non-duplicate transactions
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

//User Profile
app.get('/api/users/profile', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, firstname, lastname, email, contact_number, image FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    if (user.image) {
  user.profile_image_url = `${req.protocol}://${req.get('host')}/uploads/profile_images/${user.image}`;
}

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ===== Update User Profile =====
app.put('/api/users/profile', upload.single('image'), async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  const { firstname, lastname, email, contact_number } = req.body;
  let profileImageFilename = null;

  if (req.file) {
    profileImageFilename = req.file.filename;
  }

  try {
    // Build dynamic update query
    const fields = [];
    const values = [];

    if (firstname) { fields.push('firstname = ?'); values.push(firstname); }
    if (lastname) { fields.push('lastname = ?'); values.push(lastname); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (contact_number) { fields.push('contact_number = ?'); values.push(contact_number); }
    if (profileImageFilename) { fields.push('image = ?'); values.push(profileImageFilename); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ===== Serve Uploaded Images =====
app.use('/uploads/profile_images', express.static(path.join(__dirname, 'uploads/profile_images')));




// GET: All Transactions (with date filtering)
app.get('/api/transactions', async (req, res) => {
  const { startDate, endDate, user_id } = req.query;

  try {
    if (!user_id) {
      return res.status(400).json({ error: 'Missing required user_id' });
    }

    let query = `
      SELECT 
        t.id,
        t.tx_date,
        t.description,
        t.reference_no,
        t.debit,
        t.credit,
        t.type,
        t.sender,
        COALESCE(sender_contact.name, t.sender) AS sender_name,
        t.receiver,
        COALESCE(receiver_contact.name, t.receiver) AS receiver_name,
        t.balance,
        t.summary_id,
        CASE 
          WHEN t.sender = sender_contact.contact_number THEN 'Sender'
          WHEN t.receiver = receiver_contact.contact_number THEN 'Receiver'
        END AS role,
        CONCAT(
          'Transfer from ',
          COALESCE(sender_contact.name, t.sender),
          ' to ',
          COALESCE(receiver_contact.name, t.receiver)
        ) AS description_with_names
      FROM transactions t
      JOIN summary s ON t.summary_id = s.id
      LEFT JOIN contacts sender_contact
        ON t.sender = sender_contact.contact_number AND sender_contact.user_id = s.user_id
      LEFT JOIN contacts receiver_contact
        ON t.receiver = receiver_contact.contact_number AND receiver_contact.user_id = s.user_id
      WHERE s.user_id = ?
    `;
    const params = [user_id];

    if (startDate && endDate) {
      query += ' AND t.tx_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY t.tx_date ASC, t.id ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Transactions fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//GET: Summary Transactions
app.get('/api/summary/all', async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        s.created_at,
        s.id AS summary_id,
        s.file_name,
        COUNT(t.id) AS totalTransactions,
        COALESCE(SUM(t.debit), 0) AS totalDebit,
        COALESCE(SUM(t.credit), 0) AS totalCredit
      FROM summary s
      LEFT JOIN transactions t ON s.id = t.summary_id
      WHERE s.user_id = ?
      GROUP BY s.id, s.file_name
      ORDER BY s.id DESC
    `, [user_id]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch summary list' });
  }
});



//GET: Total Summary Transactions (For Dashboard Display)
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

//GET: Total Summary Transactions (For Dashboard Display)
app.get('/api/summary/', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [summaries] = await db.query(`SELECT id, file_name FROM summary WHERE user_id = ? ORDER BY id DESC`, [user_id]);
    res.json(summaries);
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

//GET: Total Summary Transactions (For Dashboard Display)
app.get('/api/summary/count', async (req, res) => {
  const user_id = req.query.user_id;
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total_transactions FROM summary WHERE user_id = ?', [user_id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching summary count:', err);
    res.status(500).json({ error: 'Failed to fetch summary count' });
  }
});

//GET: Total Summary Transactions (For Dashboard Display) - Top Contacts
app.get('/api/summary/top-contacts', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        c.id AS contact_id,
        c.name AS contact_name,
        c.contact_number,
        COUNT(*) AS total_transactions,
        SUM(t.debit) AS total_debit,
        SUM(t.credit) AS total_credit
      FROM contacts c
      JOIN transactions t
        ON c.contact_number = t.sender OR c.contact_number = t.receiver
      WHERE c.user_id = ?
      GROUP BY c.id, c.name, c.contact_number
      ORDER BY total_transactions DESC
      LIMIT 3
    `, [user_id]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching top contacts:', err);
    res.status(500).json({ error: 'Failed to fetch top contacts' });
  }
});



// GET: Transactions by Summary ID
app.get('/api/summary/:id/transactions', async (req, res) => {
  const summaryId = req.params.id;

  if (!summaryId) {
    return res.status(400).json({ error: 'Missing summary ID' });
  }
  try {
    const [rows] = await db.query(
      `SELECT * FROM transactions WHERE summary_id = ?`,
      [summaryId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions by summary ID:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }

});

// Get specific summary details by ID
app.get('/api/summary/:id/details', async (req, res) => {
  const summaryId = req.params.id;

  try {
    // Get summary info
    const [summaries] = await db.query(
      `SELECT id AS summary_id, created_at, file_name
       FROM summary
       WHERE id = ?`,
      [summaryId]
    );

    if (summaries.length === 0) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    const summary = summaries[0];

    // Group transactions by description (instead of sender → receiver)
    const [descriptionSummaries] = await db.query(
      `SELECT 
         description,
         COUNT(*) AS count,
         SUM(debit) AS totalDebit,
         SUM(credit) AS totalCredit
       FROM transactions
       WHERE summary_id = ?
       GROUP BY description
       ORDER BY count DESC`,
      [summaryId]
    );

    // Get total transaction counts and amounts
    const [totals] = await db.query(
      `SELECT 
         COUNT(*) AS totalTransactions,
         SUM(debit) AS totalDebit,
         SUM(credit) AS totalCredit
       FROM transactions
       WHERE summary_id = ?`,
      [summaryId]
    );

    res.json({
      summary_id: summary.summary_id,
      created_at: summary.created_at,
      file_name: summary.file_name,
      descriptionSummaries, // replaces pairSummaries
      totalDebit: totals[0].totalDebit || 0,
      totalCredit: totals[0].totalCredit || 0,
      totalTransactions: totals[0].totalTransactions || 0,
    });
  } catch (error) {
    console.error('Error fetching summary by ID:', error);
    res.status(500).json({ error: 'Failed to fetch summary details' });
  }
});

//Inserting Contacts
app.post('/api/contacts', async (req, res) => {
  const { name, contactNumber, user_id } = req.body;

  // Validate input
  if (!name || !contactNumber || !user_id) {
    return res.status(400).json({ error: 'Name, contact number, and user_id are required' });
  }

  try {
    await db.query(
      `INSERT INTO contacts (name, contact_number, user_id) VALUES (?, ?, ?)`,
      [name, contactNumber, user_id]
    );

    res.status(201).json({ message: 'Contact saved successfully' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

//Extracting Contacts
app.get('/api/contacts', async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id in query' });
  }

  try {
    const [rows] = await db.query(
  `SELECT id, name, contact_number, created_at FROM contacts WHERE user_id = ? AND user_id IS NOT NULL ORDER BY created_at DESC`,
  [user_id]
);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

//Extracting Transactions of every contacts
app.get('/api/contacts/:id/transactions', async (req, res) => {
  const { id } = req.params;

  const transactionSql = `
    SELECT 
  t.*,
  c.id AS contact_id,
  c.name AS contact_name,
  CASE 
    WHEN t.sender = c.contact_number THEN 'Sender'
    WHEN t.receiver = c.contact_number THEN 'Receiver'
  END AS role,
  sender_contact.name AS sender_name,
  receiver_contact.name AS receiver_name,
  CONCAT(
    'Transfer from ',
    COALESCE(sender_contact.name, t.sender),
    ' to ',
    COALESCE(receiver_contact.name, t.receiver)
  ) AS description_with_names
FROM transactions t
LEFT JOIN contacts sender_contact
  ON t.sender = sender_contact.contact_number
LEFT JOIN contacts receiver_contact
  ON t.receiver = receiver_contact.contact_number
JOIN contacts c
  ON (c.contact_number = t.sender OR c.contact_number = t.receiver)
WHERE c.id = ?
ORDER BY t.tx_date ASC;

  `;

  const totalsSql = `
  SELECT 
    COALESCE(SUM(CASE WHEN t.receiver = c.contact_number THEN t.credit ELSE 0 END), 0) AS total_credit,
    COALESCE(SUM(CASE WHEN t.sender = c.contact_number THEN t.debit ELSE 0 END), 0) AS total_debit
  FROM transactions t
  JOIN contacts c 
    ON (t.sender = c.contact_number OR t.receiver = c.contact_number)
  WHERE c.id = ?
`;



  try {
    const [transactions] = await db.query(transactionSql, [id]);
    const [[totals]] = await db.query(totalsSql, [id]);

    res.json({
      transactions,
      totals,
    });
    console.log(totals);
    console.log(transactions);
  } catch (err) {
    console.error('Error fetching contact transactions:', err);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

//Deletion of Summary Transactions.
app.delete('/api/summary/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM summary WHERE id = ?', [id]);
    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
});

app.put('/api/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the salt rounds

    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// Inserting Account Numbers
app.post('/api/account-numbers', async (req, res) => {
  try {
    console.log('Received body:', req.body); // <-- log the body
    const { user_id, account_number } = req.body;

    if (!user_id || !account_number) {
      return res.status(400).json({ error: 'Missing user_id or account_number' });
    }

    await db.query(
      'INSERT INTO user_account_numbers (user_id, account_number) VALUES (?, ?)',
      [user_id, account_number]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error inserting account number:', err); // <-- log the actual error
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetching Account Numbers
app.get('/api/account-numbers', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

    const [rows] = await db.query(
      'SELECT account_number FROM user_account_numbers WHERE user_id = ?',
      [user_id]
    );

    res.json(rows); // returns array of { account_number: '...' }
  } catch (err) {
    console.error('Error fetching account numbers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Account Number
app.put('/api/account-numbers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { account_number } = req.body;

    if (!account_number) {
      return res.status(400).json({ error: 'Missing account number' });
    }

    // Optional: Basic format check (adjust to your rules)
    if (!/^\d{8,20}$/.test(account_number)) {
      return res.status(400).json({ error: 'Invalid account number format' });
    }

    const [result] = await db.query(
      'UPDATE user_account_numbers SET account_number = ? WHERE id = ?',
      [account_number, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account number not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating account number:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Start Server
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
