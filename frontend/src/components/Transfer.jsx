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
import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Transfer({ user, onTransferSuccess }) {
  const [formData, setFormData] = useState({
    fromAccount: 'checking',
    toAccount: 'savings',
    payeeName: '',
    routingNumber: '',
    amount: '',
    description: ''
  });
  const [isExternal, setIsExternal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [delaySecs, setDelaySecs] = useState(0);

  // Safe fallback if user has no accounts list
  const activeAccounts = user.accounts || [
    { id: 'acc-checking', name: 'Checking Account', type: 'Checking', balance: user.balances?.checking || 0 },
    { id: 'acc-savings', name: 'Savings Account', type: 'Savings', balance: user.balances?.savings || 0 },
    { id: 'acc-creditcard', name: 'Credit Card', type: 'Credit Card', balance: user.balances?.creditCard || 0 }
  ];

  // Set default account IDs if not set or if they are outdated
  useState(() => {
    const firstAcc = activeAccounts[0]?.id || 'checking';
    const secondAcc = activeAccounts[1]?.id || activeAccounts[0]?.id || 'savings';
    setFormData(prev => ({
      ...prev,
      fromAccount: firstAcc,
      toAccount: secondAcc
    }));
  });

  const handleAccountTypeChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // If either from/to is external, show routing fields
      const external = updated.fromAccount === 'External' || updated.toAccount === 'External';
      setIsExternal(external);
      
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/transfer?delay=${delaySecs * 1000}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      setSuccess(`Successfully transferred $${parseFloat(formData.amount).toFixed(2)}!`);
      onTransferSuccess(data.user);
      setFormData({
        fromAccount: activeAccounts[0]?.id || 'checking',
        toAccount: activeAccounts[1]?.id || 'savings',
        payeeName: '',
        routingNumber: '',
        amount: '',
        description: ''
      });
      setIsExternal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', padding: '35px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Fund Transfer</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Move money between your accounts or send to third-party bank accounts.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-error)', fontSize: '14px', marginBottom: '20px' }} id="transfer-error-msg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '14px', marginBottom: '20px' }} id="transfer-success-msg">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="transfer-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="fromAccount">From Account</label>
            <select
              id="fromAccount"
              name="fromAccount"
              className="form-input form-select"
              value={formData.fromAccount}
              onChange={handleAccountTypeChange}
            >
              {activeAccounts.map(acc => (
                <option key={`from-${acc.id}`} value={acc.id}>
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
              <option value="External">External Bank (Deposit)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="toAccount">To Account</label>
            <select
              id="toAccount"
              name="toAccount"
              className="form-input form-select"
              value={formData.toAccount}
              onChange={handleAccountTypeChange}
            >
              {activeAccounts.map(acc => (
                <option key={`to-${acc.id}`} value={acc.id}>
                  {acc.name} (${acc.balance.toFixed(2)})
                </option>
              ))}
              <option value="External">External Bank (Withdrawal/Wire)</option>
            </select>
          </div>
        </div>

        {isExternal && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px dashed var(--border-color)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="payeeName">Payee Full Name</label>
              <input
                type="text"
                id="payeeName"
                name="payeeName"
                className="form-input"
                placeholder="Jane Doe"
                value={formData.payeeName}
                onChange={handleChange}
                required={isExternal}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="routingNumber">Routing / SWIFT Number</label>
              <input
                type="text"
                id="routingNumber"
                name="routingNumber"
                className="form-input"
                placeholder="021000021"
                value={formData.routingNumber}
                onChange={handleChange}
                required={isExternal}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Memo / Description</label>
          <input
            type="text"
            id="description"
            name="description"
            className="form-input"
            placeholder="Rent, utilities, grocery, transfer to self, etc."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Latency configuration to test automated test waits */}
        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <label className="form-label" htmlFor="transfer-delay" style={{ fontSize: '12px' }}>
            Simulate API delay (seconds)
          </label>
          <select
            id="transfer-delay"
            className="form-input form-select"
            value={delaySecs}
            onChange={(e) => setDelaySecs(Number(e.target.value))}
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <option value={0}>0 seconds (Instant)</option>
            <option value={1.5}>1.5 seconds</option>
            <option value={3}>3 seconds (Simulate Wire delay)</option>
            <option value={6}>6 seconds (Test driver timeouts)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="transfer-submit-btn"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Processing Transfer...' : 'Execute Transfer'}
          {!loading && <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
