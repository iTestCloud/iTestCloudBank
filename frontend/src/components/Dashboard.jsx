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
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Search, ArrowUpDown, RefreshCw, Plus, Trash2, X, Briefcase, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({ user, onRefreshUser }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Custom Account Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [createError, setCreateError] = useState('');

  // Selected/Opened Account Details State
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transfers/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user.username]);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleRefresh = () => {
    fetchTransactions();
    onRefreshUser();
  };

  // Create Custom Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newAccName.trim()) {
      setCreateError('Account Name is required.');
      return;
    }
    try {
      const res = await fetch('/api/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          name: newAccName,
          type: newAccType,
          initialBalance: parseFloat(newAccBalance) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }
      setShowCreateModal(false);
      setNewAccName('');
      setNewAccBalance('');
      onRefreshUser();
      fetchTransactions();
    } catch (err) {
      setCreateError(err.message);
    }
  };

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState(null);

  // Trigger modal confirmation instead of window.confirm
  const triggerDeleteConfirm = (accountId, event) => {
    event.stopPropagation();
    setDeletingAccountId(accountId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccountId) return;
    try {
      const res = await fetch(`/api/accounts/delete/${user.username}/${deletingAccountId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (selectedAccount && selectedAccount.id === deletingAccountId) {
          setSelectedAccount(null);
        }
        setShowDeleteModal(false);
        setDeletingAccountId(null);
        onRefreshUser();
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe fallback if user has no accounts list
  const activeAccounts = user.accounts || [
    { id: 'acc-checking', name: 'Checking Account', type: 'Checking', balance: user.balances.checking },
    { id: 'acc-savings', name: 'Savings Account', type: 'Savings', balance: user.balances.savings },
    { id: 'acc-creditcard', name: 'Credit Card', type: 'Credit Card', balance: user.balances.creditCard }
  ];

  // Helper colors for account card indicators
  const getAccountColors = (type) => {
    switch (type) {
      case 'Checking':
        return { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--accent-primary)', border: 'rgba(99, 102, 241, 0.2)' };
      case 'Savings':
        return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--accent-secondary)', border: 'rgba(245, 158, 11, 0.2)' };
      case 'Credit Card':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--accent-error)', border: 'rgba(239, 68, 68, 0.2)' };
      case 'Investment':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--accent-success)', border: 'rgba(16, 185, 129, 0.2)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', text: 'var(--text-secondary)', border: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  // Filter transactions:
  // If selectedAccount is active, only show transactions associated with its ID or Name (lowercase match)
  const getAccountFilteredTransactions = () => {
    if (!selectedAccount) return transactions;
    const nameLower = selectedAccount.name.toLowerCase();
    const idLower = selectedAccount.id.toLowerCase();
    return transactions.filter(tx => 
      tx.fromAccount.toLowerCase() === idLower ||
      tx.toAccount.toLowerCase() === idLower ||
      tx.fromAccount.toLowerCase() === nameLower ||
      tx.toAccount.toLowerCase() === nameLower ||
      (selectedAccount.id === 'acc-checking' && (tx.fromAccount.toLowerCase() === 'checking' || tx.toAccount.toLowerCase() === 'checking')) ||
      (selectedAccount.id === 'acc-savings' && (tx.fromAccount.toLowerCase() === 'savings' || tx.toAccount.toLowerCase() === 'savings')) ||
      (selectedAccount.id === 'acc-creditcard' && (tx.fromAccount.toLowerCase() === 'creditcard' || tx.toAccount.toLowerCase() === 'creditcard'))
    );
  };

  const accountTransactions = getAccountFilteredTransactions();

  // Filter & Search Logic
  const filteredTx = accountTransactions.filter(tx => {
    const term = searchTerm.toLowerCase();
    return (
      tx.payeeName.toLowerCase().includes(term) ||
      tx.description.toLowerCase().includes(term) ||
      tx.fromAccount.toLowerCase().includes(term) ||
      tx.toAccount.toLowerCase().includes(term) ||
      tx.status.toLowerCase().includes(term)
    );
  });

  // Sorting Logic
  const sortedTx = [...filteredTx].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }

    if (sortField === 'date') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTx.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedTx.length / rowsPerPage);

  // Dynamic Pie Chart Data
  const pieChartData = activeAccounts.map(acc => ({
    name: acc.name,
    value: Math.max(0, acc.balance) // handle negative credit balances gracefully in visualization
  })).filter(d => d.value > 0);

  const colorsPalette = ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-success)', 'var(--accent-error)', '#a855f7', '#06b6d4'];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }} id="welcome-message">
            {selectedAccount ? `Account details: ${selectedAccount.name}` : `Welcome back, ${user.fullName}!`}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {selectedAccount ? `Monitor transaction history and specifications for this account.` : `Here's your account overview.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedAccount && (
            <button className="btn btn-secondary" onClick={() => setSelectedAccount(null)} id="back-to-overview-btn" style={{ padding: '8px 12px' }}>
              <ArrowLeft size={16} /> Overview
            </button>
          )}
          {!selectedAccount && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="open-create-account-btn" style={{ padding: '8px 12px' }}>
              <Plus size={16} /> Create Account
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleRefresh} id="refresh-dashboard-btn" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Account Details Box (If opened) */}
      {selectedAccount && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px', borderLeft: `6px solid ${getAccountColors(selectedAccount.type).text}` }} id="opened-account-details">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span className="badge" style={{
                background: getAccountColors(selectedAccount.type).bg,
                color: getAccountColors(selectedAccount.type).text,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {selectedAccount.type}
              </span>
              <h3 style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px', color: 'var(--text-primary)' }} id="opened-account-balance">
                ${selectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '5px' }}>Account Reference ID: {selectedAccount.id}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: Active</p>
              <button 
                className="btn btn-secondary" 
                onClick={(e) => triggerDeleteConfirm(selectedAccount.id, e)} 
                style={{ borderColor: 'var(--accent-error)', color: 'var(--accent-error)', marginTop: '10px', padding: '6px 12px', fontSize: '12px' }}
                id="opened-delete-acc-btn"
              >
                <Trash2 size={14} /> Remove Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balances Cards */}
      {!selectedAccount && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }} id="balances-container">
          {activeAccounts.map((acc) => {
            const colors = getAccountColors(acc.type);
            return (
              <div 
                key={acc.id} 
                className="glass-panel" 
                style={{ padding: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer', border: `1px solid ${colors.border}` }} 
                id={`card-${acc.id}`}
                onClick={() => setSelectedAccount(acc)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>{acc.name}</span>
                  <div style={{ padding: '6px', borderRadius: '50%', background: colors.bg, color: colors.text }}>
                    <CreditCard size={20} />
                  </div>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: colors.text, fontWeight: '600' }}>{acc.type}</span>
                  <button 
                    onClick={(e) => triggerDeleteConfirm(acc.id, e)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Remove Account"
                    id={`delete-acc-${acc.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Section */}
      {!selectedAccount && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '40px' }} id="charts-container">
          {/* Balance Distribution Pie Chart */}
          <div className="glass-panel" style={{ padding: '24px' }} id="chart-pie-container">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }} id="chart-pie-title">Asset Allocation</h3>
            <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} id="asset-allocation-chart">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorsPalette[index % colorsPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No positive asset balances to display.</p>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '10px', fontSize: '12px' }} id="chart-pie-legend">
              {activeAccounts.map((acc, idx) => (
                <span key={acc.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colorsPalette[idx % colorsPalette.length] }}></span> 
                  {acc.name}
                </span>
              ))}
            </div>
          </div>

          {/* Transaction History Area Chart */}
          <div className="glass-panel" style={{ padding: '24px' }} id="chart-history-container">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }} id="chart-history-title">Transaction Activity</h3>
            <div style={{ width: '100%', height: '220px' }} id="transaction-activity-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    transactions.length > 0 
                      ? [...transactions].reverse().map(tx => ({ name: tx.date, Amount: tx.amount }))
                      : [
                          { name: 'Jan', Amount: 400 },
                          { name: 'Feb', Amount: 300 },
                          { name: 'Mar', Amount: 600 },
                          { name: 'Apr', Amount: 800 },
                          { name: 'May', Amount: 500 }
                        ]
                  }
                >
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="Amount" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions Section */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
            {selectedAccount ? `${selectedAccount.name} Transactions` : 'Recent Transactions'}
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                id="transaction-search"
                className="form-input"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '14px', width: '220px' }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }} id="tx-loading-spinner">
            <RefreshCw size={24} className="spin-animation" style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table" id="transactions-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('date')} id="th-date">
                      Date <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                    </th>
                    <th onClick={() => handleSort('payeeName')} id="th-payee">
                      Payee / Description <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                    </th>
                    <th onClick={() => handleSort('fromAccount')} id="th-source">
                      Source <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                    </th>
                    <th onClick={() => handleSort('toAccount')} id="th-dest">
                      Destination <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                    </th>
                    <th onClick={() => handleSort('amount')} id="th-amount" style={{ textAlign: 'right' }}>
                      Amount <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                    </th>
                    <th id="th-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }} id="no-tx-row">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((tx) => {
                      const isDeposit = tx.fromAccount === 'External' || (selectedAccount && tx.toAccount.toLowerCase() === selectedAccount.id.toLowerCase());
                      return (
                        <tr key={tx.id} className="tx-row">
                          <td>{tx.date}</td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{tx.payeeName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.description}</div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {activeAccounts.find(a => a.id === tx.fromAccount)?.name || tx.fromAccount}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {activeAccounts.find(a => a.id === tx.toAccount)?.name || tx.toAccount}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: isDeposit ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                            {isDeposit ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: tx.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: tx.status === 'Completed' ? 'var(--accent-success)' : 'var(--accent-secondary)'
                            }}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }} id="pagination-controls">
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, sortedTx.length)} of {sortedTx.length} records
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    id="prev-page-btn"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    id="next-page-btn"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Account Creation Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateModal(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Create New Account</h3>
            
            {createError && (
              <div style={{ color: 'var(--accent-error)', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-acc-name">Account Name</label>
                <input 
                  type="text" 
                  id="new-acc-name" 
                  className="form-input" 
                  placeholder="e.g. Vacation Savings"
                  value={newAccName} 
                  onChange={(e) => setNewAccName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-acc-type">Account Type</label>
                <select 
                  id="new-acc-type" 
                  className="form-input form-select" 
                  value={newAccType} 
                  onChange={(e) => setNewAccType(e.target.value)}
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-acc-balance">Initial Deposit ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id="new-acc-balance" 
                  className="form-input" 
                  placeholder="0.00"
                  value={newAccBalance} 
                  onChange={(e) => setNewAccBalance(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px', position: 'relative', textAlign: 'center' }}>
            <button 
              onClick={() => { setShowDeleteModal(false); setDeletingAccountId(null); }} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <div style={{ margin: '0 auto 15px auto', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>Remove Bank Account?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => { setShowDeleteModal(false); setDeletingAccountId(null); }}
                id="cancel-delete-account-btn"
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent-error) 0%, #b91c1c 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} 
                onClick={handleConfirmDelete}
                id="confirm-delete-account-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
