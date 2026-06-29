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
import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

export default function TestingLab() {
  // Dynamic element state
  const [showDynamicText, setShowDynamicText] = useState(false);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [dynamicDelay, setDynamicDelay] = useState(3);
  
  // Disabled elements state
  const [inputsDisabled, setInputsDisabled] = useState(true);
  const [disabledText, setDisabledText] = useState('This text input is locked.');

  // Alert/Prompt output state
  const [promptResult, setPromptResult] = useState('');
  const [confirmResult, setConfirmResult] = useState('');

  // Shadow DOM ref
  const shadowHostRef = useRef(null);

  // Setup Shadow DOM component on load
  useEffect(() => {
    if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
      const shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });
      
      shadowRoot.innerHTML = `
        <style>
          .shadow-container {
            background: rgba(99, 102, 241, 0.08);
            border: 1.5px solid rgba(99, 102, 241, 0.3);
            border-radius: 8px;
            padding: 16px;
            color: #f8fafc;
            font-family: sans-serif;
          }
          h4 { color: #f59e0b; margin-top: 0; margin-bottom: 8px; }
          p { margin: 0 0 12px 0; font-size: 13px; color: #94a3b8; }
          button {
            background: #6366f1;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          button:hover { background: #4f46e5; }
          #shadow-click-status { color: #10b981; font-size: 12px; margin-top: 8px; display: none; }
        </style>
        <div class="shadow-container">
          <h4 id="shadow-title">Shadow DOM Feature Banner</h4>
          <p id="shadow-description">This card is rendered inside a Shadow Root. Automation tools need special selectors (like expand-shadow-root) to interact with this button.</p>
          <button id="shadow-action-btn">Click Inside Shadow DOM</button>
          <div id="shadow-click-status">Action Registered Successfully!</div>
        </div>
      `;

      const btn = shadowRoot.getElementById('shadow-action-btn');
      const status = shadowRoot.getElementById('shadow-click-status');
      btn.addEventListener('click', () => {
        status.style.display = 'block';
      });
    }
  }, []);

  // Trigger Dynamic Text simulation
  const handleTriggerDynamic = () => {
    setLoadingDynamic(true);
    setShowDynamicText(false);
    setTimeout(() => {
      setShowDynamicText(true);
      setLoadingDynamic(false);
    }, dynamicDelay * 1000);
  };

  // Browser Alerts
  const triggerAlert = () => {
    alert("This is a native browser alert dialogue!");
  };

  const triggerConfirm = () => {
    const val = confirm("Do you confirm this action?");
    setConfirmResult(val ? "Confirmed" : "Cancelled");
  };

  const triggerPrompt = () => {
    const name = prompt("Please enter your name for authentication:");
    setPromptResult(name ? `Authenticated as: ${name}` : "Prompt dismissed");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
      
      {/* 1. Alerts and Prompts */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Native Browser Alerts</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Practice automating native dialog windows.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-secondary" id="alert-btn" onClick={triggerAlert}>
            Trigger Alert Box
          </button>
          
          <div>
            <button className="btn btn-secondary" id="confirm-btn" onClick={triggerConfirm} style={{ width: '100%' }}>
              Trigger Confirm Box
            </button>
            {confirmResult && <div id="confirm-result" style={{ fontSize: '12px', marginTop: '6px', color: 'var(--accent-secondary)' }}>Result: {confirmResult}</div>}
          </div>

          <div>
            <button className="btn btn-secondary" id="prompt-btn" onClick={triggerPrompt} style={{ width: '100%' }}>
              Trigger Prompt Box
            </button>
            {promptResult && <div id="prompt-result" style={{ fontSize: '12px', marginTop: '6px', color: 'var(--accent-primary)' }}>{promptResult}</div>}
          </div>
        </div>
      </div>

      {/* 2. Disabled & Toggled Elements */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Disabled Elements</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Verify state properties of inputs and buttons.</p>

        <div className="form-group">
          <label className="checkbox-label" style={{ marginBottom: '12px' }}>
            <input
              type="checkbox"
              id="toggle-disabled-checkbox"
              className="checkbox-input"
              checked={!inputsDisabled}
              onChange={(e) => setInputsDisabled(!e.target.checked)}
            />
            <span>Enable Input and Button below</span>
          </label>
        </div>

        <div className="form-group">
          <input
            type="text"
            id="disabled-text-input"
            className="form-input"
            value={disabledText}
            onChange={(e) => setDisabledText(e.target.value)}
            disabled={inputsDisabled}
          />
        </div>

        <button className="btn btn-primary" id="disabled-action-btn" disabled={inputsDisabled} style={{ width: '100%' }}>
          Action Button
        </button>
      </div>

      {/* 3. Shadow DOM Elements */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Shadow DOM Component</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Practice finding elements within shadow trees.</p>
        
        {/* Host element for Shadow DOM */}
        <div id="shadow-root-host" ref={shadowHostRef}></div>
      </div>

      {/* 4. Dynamic Loading Element */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Dynamic Content Wait</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Practise custom element visibility waits.</p>

        <div className="form-group">
          <label className="form-label" htmlFor="dynamic-delay-select">Set visibility delay (seconds):</label>
          <select
            id="dynamic-delay-select"
            className="form-input form-select"
            value={dynamicDelay}
            onChange={(e) => setDynamicDelay(Number(e.target.value))}
            style={{ padding: '8px 12px' }}
          >
            <option value={1}>1 second</option>
            <option value={3}>3 seconds</option>
            <option value={5}>5 seconds</option>
            <option value={8}>8 seconds (Long wait)</option>
          </select>
        </div>

        <button 
          className="btn btn-secondary" 
          id="trigger-dynamic-btn" 
          onClick={handleTriggerDynamic}
          disabled={loadingDynamic}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          {loadingDynamic ? 'Loading Content...' : 'Load Dynamic Element'}
        </button>

        {loadingDynamic && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)' }} id="dynamic-spinner">
            <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Simulating API delay...</span>
          </div>
        )}

        {showDynamicText && (
          <div 
            id="dynamic-message" 
            style={{ 
              padding: '12px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1.5px solid var(--accent-success)', 
              color: 'var(--accent-success)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '13px', 
              fontWeight: '600',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            Success! The dynamic element rendered and is now visible.
          </div>
        )}
      </div>

      {/* 5. Select Multi-select & tooltips */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Multiple Options List</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Select multiple values concurrently.</p>

        <div className="form-group">
          <label className="form-label" htmlFor="multi-select-countries">Select your preferred transaction regions:</label>
          <select
            id="multi-select-countries"
            multiple
            className="form-input"
            style={{ height: '110px', padding: '8px' }}
          >
            <option value="US">United States (USD)</option>
            <option value="UK">United Kingdom (GBP)</option>
            <option value="EU">European Union (EUR)</option>
            <option value="JP">Japan (JPY)</option>
            <option value="CA">Canada (CAD)</option>
          </select>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
          </span>
        </div>

        {/* Hover/Tooltip Element */}
        <div style={{ marginTop: '20px' }}>
          <span className="tooltip-trigger" id="tooltip-demo" data-tooltip="This popup is activated via hover selector" style={{ color: 'var(--accent-primary)', fontSize: '14px', textDecoration: 'underline' }}>
            Hover here to display Tooltip
          </span>
        </div>
      </div>

      {/* 6. IFrame Testing Sandbox (100% width row) */}
      <div className="glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>IFrame Automation Sandbox</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          The portal below runs inside an `&lt;iframe&gt;` container. Practice switching frame focus in your Selenium/Playwright script.
        </p>

        <iframe
          src="/iframe-content"
          id="payment-gateway-iframe"
          title="Payment Gateway Sandbox"
          style={{ width: '100%', height: '350px', border: 'none', borderRadius: 'var(--radius-sm)' }}
        />
      </div>

    </div>
  );
}
