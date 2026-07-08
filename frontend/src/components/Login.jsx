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
import { LogIn, Key, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [delaySecs, setDelaySecs] = useState(0); // Test latency

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/login?delay=${delaySecs * 1000}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card glass-panel animate-fade-in" style={{ maxWidth: '450px', margin: '80px auto', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>iTestCloud Bank</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Automation Practice Portal</p>
      </div>

      {error && (
        <div id="login-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-error)', fontSize: '14px', marginBottom: '20px' }}>
          <AlertCircle size={18} id="login-error-icon" />
          <span id="login-error-msg">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} id="login-form">
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Latency configuration to test automated test waits */}
        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <label className="form-label" htmlFor="login-delay" style={{ fontSize: '12px' }}>
            Simulate Response Delay (seconds) - <em>useful for testing waits</em>
          </label>
          <select
            id="login-delay"
            className="form-input form-select"
            value={delaySecs}
            onChange={(e) => setDelaySecs(Number(e.target.value))}
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <option value={0}>0 seconds (Instant)</option>
            <option value={1}>1 second</option>
            <option value={2}>2 seconds</option>
            <option value={5}>5 seconds (Slow response)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="login-submit-btn"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Sign In'}
          {!loading && <LogIn size={18} />}
        </button>
      </form>

      <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <button
          onClick={onNavigateToSignup}
          className="btn btn-secondary"
          id="navigate-signup-btn"
          style={{ padding: '4px 8px', fontSize: '13px', marginLeft: '5px' }}
        >
          Sign Up
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <strong>Testing hint:</strong> Register a new account first, or use any previously registered username/password.
      </div>
    </div>
  );
}
