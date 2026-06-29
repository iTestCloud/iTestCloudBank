import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';

export default function Support({ user }) {
  const [category, setCategory] = useState('Account Issue');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState(5); // Range slider (1-10)
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          category,
          description,
          urgency: urgency > 7 ? 'Critical' : urgency > 4 ? 'Medium' : 'Low'
        })
      });

      if (response.ok) {
        setSuccess("Support ticket submitted successfully.");
        setDescription('');
        setUrgency(5);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      
      {/* Create Ticket */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Contact Support</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Reach out to our customer service desk.</p>
        </div>

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '13px', marginBottom: '20px' }} id="ticket-success-message">
            <CheckCircle2Icon />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="support-ticket-form">
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-category">Category</label>
            <select
              id="ticket-category"
              className="form-input form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Account Issue">Account Access / Profile Issue</option>
              <option value="Transaction Issue">Transaction Discrepancy</option>
              <option value="Loan Question">Loan Inquiries</option>
              <option value="Security Alert">Report Suspicious Activity</option>
            </select>
          </div>

          {/* Range Slider for UI automation testing */}
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-urgency">Urgency Priority: <span id="urgency-value" style={{ fontWeight: 'bold', color: 'var(--accent-secondary)' }}>{urgency}</span></label>
            <input
              type="range"
              id="ticket-urgency"
              min="1"
              max="10"
              className="form-input"
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              style={{ padding: '0', height: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Low (1)</span>
              <span>Medium (5)</span>
              <span>Critical (10)</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ticket-description">Describe the issue</label>
            <textarea
              id="ticket-description"
              className="form-input"
              rows="4"
              placeholder="Provide a detailed description of your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="ticket-submit-btn"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Support Ticket'}
            {!loading && <Send size={16} />}
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Support History</h3>

        {fetchLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }} id="no-tickets-message">
            No support tickets submitted yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} id="tickets-list">
            {tickets.map(t => (
              <div key={t.id} className="ticket-item" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>{t.category}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    background: t.urgency === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: t.urgency === 'Critical' ? 'var(--accent-error)' : 'var(--accent-secondary)'
                  }} className="ticket-urgency-tag">
                    {t.urgency}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', wordBreak: 'break-word' }}>{t.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>ID: {t.id}</span>
                  <span>Submitted: {t.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Small helper icon component to avoid extra imports
function CheckCircle2Icon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-success)' }}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
