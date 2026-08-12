import React from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/user/login`, {
        email,
        password
      }, { withCredentials: true });

      console.log(response.data);

      // ==================== 🟢 IMPLEMENTATION START ====================
      // Check if the response was successful (either success property is true OR HTTP status is 200)
      if (response.data?.success || response.status === 200) {
        
        // Extract user data from response (handles both response.data.user or root response.data)
        const user = response.data.user || response.data;
        
        // Extract token from response (checks multiple possible key names)
        const token = response.data.token || response.data.userToken || user.token;

        // Save user object and user type in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userType', 'user');
        
        // Save the authentication token in localStorage if present
        if (token) {
          localStorage.setItem('token', token);
        }

        // Redirect user to the home page after successful login
        navigate('/');
      }
      // ==================== 🟢 IMPLEMENTATION END ======================

    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
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