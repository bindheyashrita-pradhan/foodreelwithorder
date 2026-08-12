import React from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(
        `${baseUrl}/api/auth/user/login`,
        { email, password },
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

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New here? <a href="/user/register">Create account</a>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;