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
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Loan({ user }) {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('12');
  const [purpose, setPurpose] = useState('Personal');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const response = await fetch(`/api/loans/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setLoans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [user.username]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', user.username);
    formData.append('amount', amount);
    formData.append('term', term);
    formData.append('purpose', purpose);
    if (file) {
      formData.append('document', file);
    }

    try {
      const response = await fetch('/api/loans/apply', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit loan application');
      }

      setSuccess("Loan application submitted successfully!");
      setAmount('');
      setTerm('12');
      setPurpose('Personal');
      setFile(null);
      
      // Reset the file input element manually
      const fileInput = document.getElementById('document-upload');
      if (fileInput) fileInput.value = '';

      fetchLoans();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      
      {/* Application Form */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Apply for a Loan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Submit details and support documents for instant pre-approval review.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-error)', fontSize: '13px', marginBottom: '20px' }} id="loan-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '13px', marginBottom: '20px' }} id="loan-success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="loan-form" encType="multipart/form-data">
          <div className="form-group">
            <label className="form-label" htmlFor="loan-amount">Desired Loan Amount ($)</label>
            <input
              type="number"
              id="loan-amount"
              className="form-input"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="500"
              max="50000"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="loan-term">Loan Term (Months)</label>
            <select
              id="loan-term"
              className="form-input form-select"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
              <option value="36">36 Months (3 Years)</option>
              <option value="60">60 Months (5 Years)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="loan-purpose">Purpose of Loan</label>
            <select
              id="loan-purpose"
              className="form-input form-select"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="Personal">Personal / Debt Consolidation</option>
              <option value="Home">Home Improvement</option>
              <option value="Education">Education</option>
              <option value="Automobile">Auto Financing</option>
            </select>
          </div>

          {/* File Upload Element */}
          <div className="form-group">
            <label className="form-label" htmlFor="document-upload">Supporting Document (PDF, Image, Max 2MB)</label>
            <input
              type="file"
              id="document-upload"
              className="form-input"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ padding: '8px' }}
            />
            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: 'var(--accent-primary)' }} id="selected-file-indicator">
                <FileText size={14} />
                <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="loan-submit-btn"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Apply Now'}
            {!loading && <Upload size={16} />}
          </button>
        </form>
      </div>

      {/* Applications List */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Your Loan Statuses</h3>

        {fetchLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading loans...</p>
        ) : loans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }} id="no-loans-message">
            No active loan applications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} id="loans-list">
            {loans.map(loan => (
              <div key={loan.id} className="loan-item" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${loan.amount.toLocaleString()}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--accent-secondary)'
                  }} className="loan-status">
                    {loan.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div>Term: {loan.term} Months | Purpose: {loan.purpose}</div>
                  <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>Applied: {loan.date}</div>
                  {loan.docName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--accent-primary)' }} className="loan-document-link">
                      <FileText size={12} />
                      <span>Doc: {loan.docName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
