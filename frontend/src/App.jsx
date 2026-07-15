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
  const [theme, setTheme] = useState('dark');
  const [loadingSession, setLoadingSession] = useState(!!localStorage.getItem('itest_user_session'));

  const [selectedAccountId, setSelectedAccountId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
  });

  const viewToPath = {
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
    transfer: '/transfer',
    loan: '/loan',
    support: '/support',
    lab: '/lab',
    profile: '/profile',
    account: '/account'
  };

  const pathToView = {
    '/login': 'login',
    '/signup': 'signup',
    '/dashboard': 'dashboard',
    '/transfer': 'transfer',
    '/loan': 'loan',
    '/support': 'support',
    '/lab': 'lab',
    '/profile': 'profile',
    '/account': 'account'
  };

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    const view = pathToView[path];
    if (view) {
      if (view === 'login' || view === 'signup') return view;
      const savedSession = localStorage.getItem('itest_user_session');
      return savedSession ? view : 'login';
    }
    const savedSession = localStorage.getItem('itest_user_session');
    return savedSession ? 'dashboard' : 'login';
  });

  const navigateView = (viewName) => {
    setCurrentView(viewName);
    if (viewName !== 'account') {
      setSelectedAccountId(null);
    }
    let path = viewToPath[viewName] || '/login';
    if (viewName === 'account' && selectedAccountId) {
      path = `/account?id=${selectedAccountId}`;
    }
    if (window.location.pathname !== path.split('?')[0]) {
      window.history.pushState(null, '', path);
    }
  };

  const onSelectAccount = (accId) => {
    if (accId) {
      setSelectedAccountId(accId);
      setCurrentView('account');
      const path = `/account?id=${accId}`;
      if (window.location.pathname !== '/account' || new URLSearchParams(window.location.search).get('id') !== accId) {
        window.history.pushState(null, '', path);
      }
    } else {
      setSelectedAccountId(null);
      setCurrentView('dashboard');
      if (window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/dashboard');
      }
    }
  };

  // Sync state on history back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const view = pathToView[path];
      if (view) {
        const savedSession = localStorage.getItem('itest_user_session');
        if (!savedSession && !['login', 'signup'].includes(view)) {
          setCurrentView('login');
          window.history.replaceState(null, '', '/login');
        } else {
          setCurrentView(view);
          if (view === 'account') {
            const params = new URLSearchParams(window.location.search);
            setSelectedAccountId(params.get('id') || null);
          } else {
            setSelectedAccountId(null);
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load user session from localStorage on start
  useEffect(() => {
    const savedSession = localStorage.getItem('itest_user_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        fetchProfile(parsed.username);
      } catch (e) {
        localStorage.removeItem('itest_user_session');
        setLoadingSession(false);
        navigateView('login');
      }
    } else {
      const path = window.location.pathname;
      const view = pathToView[path];
      if (view && ['login', 'signup'].includes(view)) {
        navigateView(view);
      } else {
        navigateView('login');
      }
    }
  }, []);

  const fetchProfile = async (username) => {
    try {
      const res = await fetch(`/api/profile/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const path = window.location.pathname;
        const view = pathToView[path];
        if (view && !['login', 'signup'].includes(view)) {
          if (view === 'account') {
            const params = new URLSearchParams(window.location.search);
            const accId = params.get('id');
            if (accId) {
              setSelectedAccountId(accId);
              setCurrentView('account');
              window.history.replaceState(null, '', `/account?id=${accId}`);
            } else {
              navigateView('dashboard');
            }
          } else {
            navigateView(view);
          }
        } else {
          navigateView('dashboard');
        }
      } else {
        localStorage.removeItem('itest_user_session');
        navigateView('login');
      }
    } catch (e) {
      console.error("Error checking session", e);
      navigateView('login');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('itest_user_session', JSON.stringify(userData));
    const path = window.location.pathname;
    const view = pathToView[path];
    if (view && !['login', 'signup'].includes(view)) {
      if (view === 'account') {
        const params = new URLSearchParams(window.location.search);
        const accId = params.get('id');
        if (accId) {
          setSelectedAccountId(accId);
          setCurrentView('account');
          window.history.replaceState(null, '', `/account?id=${accId}`);
        } else {
          navigateView('dashboard');
        }
      } else {
        navigateView(view);
      }
    } else {
      navigateView('dashboard');
    }
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

  const handleTransferSuccess = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('itest_user_session', JSON.stringify(updatedUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('itest_user_session');
    navigateView('login');
  };

  const handleDeleteAccount = () => {
    setUser(null);
    localStorage.removeItem('itest_user_session');
    navigateView('login');
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Nav helper
  const renderNavButton = (viewName, label, IconComponent) => {
    const isActive = currentView === viewName || (viewName === 'dashboard' && currentView === 'account');
    return (
      <button
        onClick={() => navigateView(viewName)}
        className="btn"
        id={`nav-${viewName}-btn`}
        title={isSidebarCollapsed ? label : undefined}
        style={{
          background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
          border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          padding: isSidebarCollapsed ? '8px' : '8px 16px',
          width: '100%',
          gap: isSidebarCollapsed ? '0' : '8px'
        }}
      >
        <IconComponent size={18} />
        {!isSidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>}
      </button>
    );
  };

  return (
    <div>
      {/* Global Header */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: user ? 'pointer' : 'default' }} 
          id="app-logo"
          onClick={() => user && navigateView('dashboard')}
        >
          <span style={{ fontSize: '24px' }}>🏦</span>
          <span id="app-title" style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>iTestCloud <span style={{ color: 'var(--accent-primary)' }}>Bank</span></span>
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
            {theme === 'dark' ? <Sun size={18} id="theme-toggle-icon" /> : <Moon size={18} id="theme-toggle-icon" />}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} id="user-profile-summary">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '600' }} id="user-display-name">{user.fullName}</div>
                <div id="user-id" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {user.username}</div>
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
          <aside 
            className="glass-panel" 
            style={{ 
              width: isSidebarCollapsed ? '70px' : '260px', 
              borderRadius: 0, 
              borderTop: 'none', 
              borderBottom: 'none', 
              borderLeft: 'none', 
              padding: '16px 10px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            id="sidebar-nav"
          >
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="btn btn-secondary"
              id="sidebar-toggle-btn"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                marginBottom: '12px',
                padding: '8px',
                justifyContent: 'center',
                width: '100%',
                border: '1px solid var(--border-color)',
                fontSize: '12px'
              }}
            >
              {isSidebarCollapsed ? '▶' : '◀'}
            </button>

            {renderNavButton('dashboard', 'Dashboard', Home)}
            {renderNavButton('transfer', 'Fund Transfer', Send)}
            {renderNavButton('loan', 'Apply for Loan', Wallet)}
            {renderNavButton('support', 'Support Ticket', MessageSquare)}
            {renderNavButton('lab', 'UI Testing Lab', ShieldAlert)}
            {renderNavButton('profile', 'Profile Settings', User)}
          </aside>

          {/* Core Content */}
          <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }} id="main-content-viewport">
            {(currentView === 'dashboard' || currentView === 'account') && (
              <Dashboard 
                user={user} 
                onRefreshUser={handleRefreshUser} 
                selectedAccountId={selectedAccountId}
                onSelectAccount={onSelectAccount}
              />
            )}
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
              onNavigateToSignup={() => navigateView('signup')} 
            />
          )}
          {currentView === 'signup' && (
            <Signup 
              onNavigateToLogin={() => navigateView('login')} 
            />
          )}
        </div>
      )}
    </div>
  );
}
