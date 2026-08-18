import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';

const FoodPartnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (loginEmail, loginPass) => {
    const targetEmail = loginEmail || email;
    const targetPass = loginPass || password;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/food-partner/login`, {
        email: targetEmail,
        password: targetPass
      }, { withCredentials: true });

      if (response.data?.success || response.status === 200 || response.data.foodPartner) {
        const partner = response.data.foodPartner || response.data;
        const token = response.data.token || response.data.partnerToken || partner?.token;

        localStorage.setItem('user', JSON.stringify(partner));
        localStorage.setItem('userType', 'partner');
        
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('partnerToken', token);
        }

        navigate("/food-partner/orders");
      }
    } catch (error) {
      console.error("Partner login failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || 'Partner login failed');
    }
  };

  // 🟢 1-CLICK DEMO PARTNER LOGIN
  const fillDemoPartner = () => {
    // ⚠️ Replace with your testing partner credentials if different
    const demoPartnerEmail = 'yummyfoods@gmail.com';
    const demoPartnerPass = '123456';
    setEmail(demoPartnerEmail);
    setPassword(demoPartnerPass);
    handleLoginSubmit(demoPartnerEmail, demoPartnerPass);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <h1 id="partner-login-title" className="auth-title">Partner Sign In</h1>
          <p className="auth-subtitle">Access your restaurant partner dashboard.</p>
        </header>

        {/* 🟢 1-CLICK DEMO PARTNER LOGIN BUTTON */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={fillDemoPartner}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            🚀 1-Click Demo Partner Login
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="business@example.com" 
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
          <button className="auth-submit" type="submit">Sign In as Partner</button>
        </form>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;