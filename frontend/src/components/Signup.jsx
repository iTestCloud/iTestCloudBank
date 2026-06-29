import React, { useState } from 'react';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup({ onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Other',
    accountType: 'Checking',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        onNavigateToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-card glass-panel animate-fade-in" style={{ maxWidth: '550px', margin: '40px auto', padding: '40px' }}>
      <button 
        onClick={onNavigateToLogin}
        className="btn btn-secondary"
        id="back-to-login-btn"
        style={{ marginBottom: '20px', padding: '6px 12px', fontSize: '13px' }}
      >
        <ArrowLeft size={16} /> Back to Login
      </button>

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)' }}>Create Bank Account</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Provide your information to sign up.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-error)', fontSize: '14px', marginBottom: '20px' }} id="signup-error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-success)', fontSize: '14px', marginBottom: '20px' }} id="signup-success-box">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="signup-form">
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-input"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="johndoe12"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="123-456-7890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="accountType">Initial Account Type</label>
            <select
              id="accountType"
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
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  className="radio-input"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                />
                Male
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  className="radio-input"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />
                Female
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  className="radio-input"
                  checked={formData.gender === 'Other'}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '10px' }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              className="checkbox-input"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <span>I agree to the Terms & Conditions and consent to testing.</span>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="signup-submit-btn"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
          {!loading && <UserPlus size={18} />}
        </button>
      </form>
    </div>
  );
}
