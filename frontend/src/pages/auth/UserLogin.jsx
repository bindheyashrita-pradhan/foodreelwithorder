import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (loginEmail, loginPass) => {
    const targetEmail = loginEmail || email;
    const targetPass = loginPass || password;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(
        `${baseUrl}/api/auth/user/login`,
        { email: targetEmail, password: targetPass },
        { withCredentials: true }
      );

      if (res.data?.success || res.status === 200) {
        const user = res.data.user || res.data;
        const token = res.data.token || res.data.userToken || user?.token;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userType', 'user');
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('userToken', token);
        }

        navigate('/');
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  // 🟢 1-CLICK DEMO USER LOGIN
  const fillDemoUser = () => {
    // ⚠️ Replace with your testing user credentials if different
    const demoEmail = 'raj@gmail.com';
    const demoPass = '123456';
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLoginSubmit(demoEmail, demoPass);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in as a Customer to explore and place orders.</p>
        </header>

        {/* 🟢 1-CLICK DEMO USER LOGIN BUTTON */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={fillDemoUser}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            🚀 1-Click Demo Customer Login
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;