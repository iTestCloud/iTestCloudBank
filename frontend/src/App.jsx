import React, { useState, useEffect } from 'react';
import { Home, Send, Wallet, MessageSquare, ShieldAlert, User, LogOut, Sun, Moon } from 'lucide-react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import Loan from './components/Loan';
import Support from './components/Support';
import Profile from './components/Profile';
import TestingLab from './components/TestingLab';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login'); // login, signup, dashboard, transfer, loan, support, profile, lab
  const [theme, setTheme] = useState('dark');

  // Load user session from localStorage on start
  useEffect(() => {
    const savedSession = localStorage.getItem('itest_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Verify with server that user still exists
        fetchProfile(parsed.username);
      } catch (e) {
        localStorage.removeItem('itest_user_session');
      }
    }
  }, []);

  const fetchProfile = async (username) => {
    try {
      const res = await fetch(`/api/profile/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setCurrentView('dashboard');
      } else {
        localStorage.removeItem('itest_user_session');
      }
    } catch (e) {
      console.error("Error checking session", e);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('itest_user_session', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleRefreshUser = () => {
    if (user) {
      fetchProfile(user.username);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(prev => ({
      ...prev,
      ...updatedUser
    }));
    localStorage.setItem('itest_user_session', JSON.stringify({ ...user, ...updatedUser }));
  };

  const handleTransferSuccess = (newBalances) => {
    setUser(prev => ({
      ...prev,
      balances: newBalances
    }));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('itest_user_session');
    setCurrentView('login');
  };

  const handleDeleteAccount = () => {
    setUser(null);
    localStorage.removeItem('itest_user_session');
    setCurrentView('login');
    alert("Your account has been deleted permanently.");
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  // Nav helper
  const renderNavButton = (viewName, label, IconComponent) => {
    const isActive = currentView === viewName;
    return (
      <button
        onClick={() => setCurrentView(viewName)}
        className="btn"
        id={`nav-${viewName}-btn`}
        style={{
          background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
          border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          justifyContent: 'flex-start',
          padding: '8px 16px',
          width: '100%'
        }}
      >
        <IconComponent size={18} />
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
      </button>
    );
  };

  return (
    <div>
      {/* Global Header */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} id="app-logo">
          <span style={{ fontSize: '24px' }}>🏦</span>
          <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>iTestCloud <span style={{ color: 'var(--accent-primary)' }}>Bank</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            id="theme-toggle-btn"
            style={{ borderRadius: '50%', padding: '8px', width: '38px', height: '38px' }}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} id="user-profile-summary">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '600' }} id="user-display-name">{user.fullName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {user.username}</div>
              </div>
              <button 
                onClick={handleSignOut}
                className="btn btn-secondary"
                id="signout-btn"
                style={{ padding: '8px 12px', fontSize: '13px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-error)' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      {user ? (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
          {/* Sidebar Nav */}
          <aside className="glass-panel" style={{ width: '260px', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }} id="sidebar-nav">
            {renderNavButton('dashboard', 'Dashboard', Home)}
            {renderNavButton('transfer', 'Fund Transfer', Send)}
            {renderNavButton('loan', 'Apply for Loan', Wallet)}
            {renderNavButton('support', 'Support Ticket', MessageSquare)}
            {renderNavButton('lab', 'UI Testing Lab', ShieldAlert)}
            {renderNavButton('profile', 'Profile Settings', User)}
          </aside>

          {/* Core Content */}
          <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }} id="main-content-viewport">
            {currentView === 'dashboard' && <Dashboard user={user} onRefreshUser={handleRefreshUser} />}
            {currentView === 'transfer' && <Transfer user={user} onTransferSuccess={handleTransferSuccess} />}
            {currentView === 'loan' && <Loan user={user} />}
            {currentView === 'support' && <Support user={user} />}
            {currentView === 'lab' && <TestingLab />}
            {currentView === 'profile' && <Profile user={user} onProfileUpdate={handleProfileUpdate} onDeleteAccount={handleDeleteAccount} />}
          </main>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          {currentView === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onNavigateToSignup={() => setCurrentView('signup')} 
            />
          )}
          {currentView === 'signup' && (
            <Signup 
              onNavigateToLogin={() => setCurrentView('login')} 
            />
          )}
        </div>
      )}
    </div>
  );
}
