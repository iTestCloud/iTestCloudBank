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
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

const defaultData = {
  users: [],
  transfers: [],
  loans: [],
  tickets: []
};

// Initialize database file if it doesn't exist
function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
  } else {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      JSON.parse(data); // Validate JSON format
    } catch (e) {
      console.warn("Database file was corrupted, re-initializing...");
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf8');
    }
  }
}

function readDb() {
  initDb();
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  getUsers: () => readDb().users,
  saveUser: (user) => {
    const db = readDb();
    const existingIndex = db.users.findIndex(u => u.username === user.username);
    if (existingIndex > -1) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...user };
    } else {
      db.users.push(user);
    }
    writeDb(db);
    return user;
  },
  deleteUser: (username) => {
    const db = readDb();
    db.users = db.users.filter(u => u.username !== username);
    // clean up records associated with this user
    db.transfers = db.transfers.filter(t => t.username !== username);
    db.loans = db.loans.filter(l => l.username !== username);
    db.tickets = db.tickets.filter(t => t.username !== username);
    writeDb(db);
  },
  getTransfers: (username) => {
    const db = readDb();
    return db.transfers.filter(t => t.username === username);
  },
  saveTransfer: (transfer) => {
    const db = readDb();
    db.transfers.push(transfer);
    writeDb(db);
    return transfer;
  },
  getLoans: (username) => {
    const db = readDb();
    return db.loans.filter(l => l.username === username);
  },
  saveLoan: (loan) => {
    const db = readDb();
    db.loans.push(loan);
    writeDb(db);
    return loan;
  },
  getTickets: (username) => {
    const db = readDb();
    return db.tickets.filter(t => t.username === username);
  },
  saveTicket: (ticket) => {
    const db = readDb();
    db.tickets.push(ticket);
    writeDb(db);
    return ticket;
  }
};
