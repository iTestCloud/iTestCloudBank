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
import { ArrowUpRight, ArrowDownLeft, CreditCard, Search, ArrowUpDown, RefreshCw } from 'lucide-react';

export default function Dashboard({ user, onRefreshUser }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

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

  // Filter & Search Logic
  const filteredTx = transactions.filter(tx => {
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

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }} id="welcome-message">Welcome back, {user.fullName}!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Here's your account overview.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleRefresh} id="refresh-dashboard-btn" style={{ padding: '8px 12px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Balances Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }} id="balances-container">
        {/* Checking */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Checking Account</span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }} id="checking-balance">
            ${user.balances.checking.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-success)' }}>
            <ArrowDownLeft size={14} /> +3.2% vs last month
          </div>
        </div>

        {/* Savings */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Savings Account</span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-secondary)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }} id="savings-balance">
            ${user.balances.savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-success)' }}>
            <ArrowDownLeft size={14} /> +0.55% APY compounding
          </div>
        </div>

        {/* Credit Card */}
        <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>Credit Card Balance</span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }} id="creditcard-balance">
            ${user.balances.creditCard.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-error)' }}>
            <ArrowUpRight size={14} /> Payment due in 15 days
          </div>
        </div>
      </div>

      {/* Recent Transactions Section (sorting, filtering, pagination practice) */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Transactions</h3>
          
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
                    currentRows.map((tx) => (
                      <tr key={tx.id} className="tx-row">
                        <td>{tx.date}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{tx.payeeName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.description}</div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{tx.fromAccount}</td>
                        <td style={{ textTransform: 'capitalize' }}>{tx.toAccount}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: tx.fromAccount === 'External' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                          {tx.fromAccount === 'External' ? '+' : '-'}${tx.amount.toFixed(2)}
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
                    ))
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
    </div>
  );
}
