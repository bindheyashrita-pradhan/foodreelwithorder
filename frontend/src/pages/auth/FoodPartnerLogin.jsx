import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/food-partner/login`, {
        email,
        password
      }, { withCredentials: true });

      console.log("Login successful:", response.data);

      if (response.data.foodPartner) {
        localStorage.setItem('user', JSON.stringify(response.data.foodPartner));
        localStorage.setItem('userType', 'partner');
      }

      navigate("/create-food");
    } catch (error) {
      console.error("Partner login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <h1 id="partner-login-title" className="auth-title">Partner Sign In</h1>
          <p className="auth-subtitle">Access your partner dashboard.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button className="auth-submit" type="submit">Sign In as Partner</button>
        </form>
        <div className="auth-alt-action">
          New partner? <Link to="/food-partner/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;