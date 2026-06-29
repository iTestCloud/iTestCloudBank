import React, { useState } from 'react';
import { Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile({ user, onProfileUpdate, onDeleteAccount }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    gender: user.gender || 'Other',
    accountType: user.accountType || 'Checking'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess("Profile updated successfully!");
      onProfileUpdate(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/profile/delete/${user.username}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      onDeleteAccount();
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', padding: '35px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Profile & Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your account information and preferences.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-error)', fontSize: '14px', marginBottom: '20px' }} id="profile-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '14px', marginBottom: '20px' }} id="profile-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="profile-update-form">
        <div className="form-group">
          <label className="form-label" htmlFor="profile-fullName">Full Name</label>
          <input
            type="text"
            id="profile-fullName"
            name="fullName"
            className="form-input"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-email">Email Address</label>
            <input
              type="email"
              id="profile-email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-phone">Phone Number</label>
            <input
              type="tel"
              id="profile-phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-gender">Gender</label>
            <select
              id="profile-gender"
              name="gender"
              className="form-input form-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-accountType">Preferred Account Type</label>
            <select
              id="profile-accountType"
              name="accountType"
              className="form-input form-select"
              value={formData.accountType}
              onChange={handleChange}
            >
              <option value="Checking">Checking Account</option>
              <option value="Savings">Savings Account</option>
              <option value="Premium">Premium Account</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            id="profile-save-btn"
            style={{ flex: 1 }}
            disabled={loading}
          >
            <Save size={16} /> Save Profile Details
          </button>
        </div>
      </form>

      {/* Account Deletion Area (Permanent delete verification practice) */}
      <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-error)', marginBottom: '8px' }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '15px' }}>
          Deleting your account will erase all user profiles, transactional databases, and tickets from the system permanently.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            className="btn btn-secondary"
            id="request-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ borderColor: 'var(--accent-error)', color: 'var(--accent-error)' }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
        ) : (
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed var(--accent-error)', padding: '16px', borderRadius: 'var(--radius-sm)' }} id="delete-confirm-box">
            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Are you absolutely sure you want to delete this account?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary"
                id="confirm-delete-btn"
                onClick={handleDelete}
                style={{ background: 'var(--accent-error)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
              >
                Yes, delete my account
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                id="cancel-delete-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
