/*********************************************************************
 * Copyright (c) 2026 iTestCloud Project and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *********************************************************************/
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Setup directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage configuration for UI testing file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// Delay helper for UI testing latency simulation
const simulateDelay = (req, res, next) => {
  const delay = req.query.delay || req.body.delay || 0;
  if (delay > 0) {
    setTimeout(next, parseInt(delay, 10));
  } else {
    next();
  }
};

// 1. REGISTER
app.post('/api/register', (req, res) => {
  const { username, password, fullName, email, phone, gender, accountType } = req.body;
  
  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const existingUsers = db.getUsers();
  if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: "Username already exists." });
  }

  const newUser = {
    username,
    password, // Stored plain text for ease of reference in simple test automation script verification
    fullName,
    email,
    phone: phone || '',
    gender: gender || 'Other',
    accountType: accountType || 'Checking',
    joinDate: new Date().toLocaleDateString(),
    balances: {
      checking: 1500.00,
      savings: 10000.00,
      creditCard: -250.00
    }
  };

  db.saveUser(newUser);

  // Add initial mock transactions to make dashboard interactive immediately
  const initialTransactions = [
    {
      id: 'tx-1',
      username,
      fromAccount: 'External',
      toAccount: 'checking',
      payeeName: 'Initial Deposit',
      routingNumber: '000000000',
      amount: 1500.00,
      description: 'Account opening credit',
      date: new Date().toLocaleDateString(),
      status: 'Completed'
    },
    {
      id: 'tx-2',
      username,
      fromAccount: 'savings',
      toAccount: 'External',
      payeeName: 'Savings Transfer',
      routingNumber: '000000000',
      amount: 10000.00,
      description: 'Initial savings setup',
      date: new Date().toLocaleDateString(),
      status: 'Completed'
    }
  ];

  initialTransactions.forEach(tx => db.saveTransfer(tx));

  res.status(201).json({ message: "Registration successful", user: { username, fullName, email } });
});

// 2. LOGIN
app.post('/api/login', simulateDelay, (req, res) => {
  const { username, password } = req.body;
  const users = db.getUsers();
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // Omit password in response
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: "Login successful", user: userWithoutPassword });
});

// 3. GET PROFILE
app.get('/api/profile/:username', (req, res) => {
  const users = db.getUsers();
  const user = users.find(u => u.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// 4. UPDATE PROFILE
app.post('/api/profile/update', (req, res) => {
  const { username, fullName, email, phone, gender, accountType } = req.body;
  const users = db.getUsers();
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  const updatedUser = {
    ...users[userIndex],
    fullName: fullName || users[userIndex].fullName,
    email: email || users[userIndex].email,
    phone: phone || users[userIndex].phone,
    gender: gender || users[userIndex].gender,
    accountType: accountType || users[userIndex].accountType
  };

  db.saveUser(updatedUser);
  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json({ message: "Profile updated successfully", user: userWithoutPassword });
});

// 5. DELETE PROFILE / ACCOUNT
app.delete('/api/profile/delete/:username', (req, res) => {
  const { username } = req.params;
  const users = db.getUsers();
  if (!users.some(u => u.username === username)) {
    return res.status(404).json({ error: "User not found." });
  }
  db.deleteUser(username);
  res.json({ message: "Account deleted successfully." });
});

// 6. FUND TRANSFER (with optional custom latency and dynamic status checks)
app.post('/api/transfer', simulateDelay, (req, res) => {
  const { username, fromAccount, toAccount, payeeName, routingNumber, amount, description } = req.body;

  if (!username || !fromAccount || !toAccount || !amount) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  const users = db.getUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }

  // If transferring from internal account, check balance
  if (fromAccount !== 'External') {
    const balance = user.balances[fromAccount];
    if (balance === undefined || balance < amt) {
      return res.status(400).json({ error: `Insufficient funds in ${fromAccount} account.` });
    }
    // Deduct
    user.balances[fromAccount] -= amt;
  }

  // If transferring to internal account, add
  if (toAccount !== 'External') {
    user.balances[toAccount] += amt;
  }

  db.saveUser(user);

  const transfer = {
    id: `tx-${Date.now()}`,
    username,
    fromAccount,
    toAccount,
    payeeName: payeeName || 'Internal Transfer',
    routingNumber: routingNumber || '000000000',
    amount: amt,
    description: description || 'Transfer',
    date: new Date().toLocaleDateString(),
    status: 'Completed'
  };

  db.saveTransfer(transfer);
  res.json({ message: "Transfer successful", transfer, balances: user.balances });
});

// 7. GET TRANSACTION HISTORY
app.get('/api/transfers/:username', (req, res) => {
  res.json(db.getTransfers(req.params.username));
});

// 8. LOAN APPLICATION (with file attachment)
app.post('/api/loans/apply', upload.single('document'), simulateDelay, (req, res) => {
  const { username, amount, term, purpose } = req.body;

  if (!username || !amount || !term) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  const loan = {
    id: `loan-${Date.now()}`,
    username,
    amount: parseFloat(amount),
    term: parseInt(term, 10),
    purpose: purpose || 'General Personal Loan',
    status: 'Pending Review',
    docPath: req.file ? `/uploads/${req.file.filename}` : null,
    docName: req.file ? req.file.originalname : null,
    date: new Date().toLocaleDateString()
  };

  db.saveLoan(loan);
  res.json({ message: "Loan application received", loan });
});

// 9. GET LOANS
app.get('/api/loans/:username', (req, res) => {
  res.json(db.getLoans(req.params.username));
});

// 10. SUBMIT SUPPORT TICKET
app.post('/api/support/ticket', upload.single('attachment'), (req, res) => {
  const { username, category, description, urgency } = req.body;

  if (!username || !category || !description) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  const ticket = {
    id: `tkt-${Date.now()}`,
    username,
    category,
    description,
    urgency: urgency || 'Medium',
    attachmentPath: req.file ? `/uploads/${req.file.filename}` : null,
    attachmentName: req.file ? req.file.originalname : null,
    status: 'Open',
    date: new Date().toLocaleDateString()
  };

  db.saveTicket(ticket);
  res.json({ message: "Support ticket created successfully", ticket });
});

// 11. GET SUPPORT TICKETS
app.get('/api/support/tickets/:username', (req, res) => {
  res.json(db.getTickets(req.params.username));
});

// 12. DEMO IFRAME ROUTE
app.get('/iframe-content', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Secure Payment Portal</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #0f172a;
          color: #f8fafc;
          padding: 16px;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          box-sizing: border-box;
          border: 2px dashed #3b82f6;
          border-radius: 8px;
        }
        h3 { color: #f59e0b; margin-top: 0; }
        .form-group { margin-bottom: 12px; width: 100%; max-width: 280px; }
        label { display: block; font-size: 12px; margin-bottom: 4px; color: #94a3b8; }
        input {
          width: 100%;
          padding: 8px;
          background: #1e293b;
          border: 1px solid #475569;
          color: white;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 8px;
          width: 100%;
          max-width: 280px;
        }
        button:hover { background: #2563eb; }
        #success-msg { color: #10b981; font-weight: bold; margin-top: 10px; display: none; }
      </style>
    </head>
    <body>
      <h3>Secure Payment Gateway</h3>
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 12px;">This is simulated inside an iframe to practice frame-switching automation</p>
      
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input type="text" id="cardNumber" placeholder="4111 2222 3333 4444" />
      </div>
      <div class="form-group">
        <label for="cardExpiry">Expiry Date</label>
        <input type="text" id="cardExpiry" placeholder="12/28" />
      </div>
      
      <button id="submitPaymentBtn" onclick="pay()">Verify and Complete Payment</button>
      <div id="success-msg">Simulated Gateway payment authorized successfully!</div>

      <script>
        function pay() {
          const num = document.getElementById('cardNumber').value;
          if (!num) {
            alert('Please input a valid card number');
            return;
          }
          document.getElementById('submitPaymentBtn').style.display = 'none';
          document.getElementById('success-msg').style.display = 'block';
          // Send message to parent frame
          window.parent.postMessage({ type: 'PAYMENT_COMPLETE' }, '*');
        }
      </script>
    </body>
    </html>
  `);
});

// Serve frontend static build if built
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send("Backend server is running. Front-end is not compiled yet. Run frontend in dev mode or compile it first.");
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
