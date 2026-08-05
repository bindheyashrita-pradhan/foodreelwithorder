import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const savedUser = localStorage.getItem('user');
  const userType = localStorage.getItem('userType');
  const user = savedUser ? JSON.parse(savedUser) : null;

  const handleLogout = async () => {
    try {
      if (userType === 'partner') {
        await axios.get('http://localhost:3000/api/auth/food-partner/logout', { withCredentials: true });
      } else {
        await axios.get('http://localhost:3000/api/auth/user/logout', { withCredentials: true });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      navigate('/user/login');
    }
  };

  return (
    <header className="top-navbar">
      <div className="nav-brand">
        <Link to="/">🍕 FoodReel</Link>
      </div>

      <div className="nav-user-status">
        {user ? (
          <div className="user-info-group">
            <span className={`role-tag ${userType === 'partner' ? 'partner-tag' : 'user-tag'}`}>
              {userType === 'partner' ? 'Partner' : 'User'}
            </span>
            <span className="user-display-name">
              {user.fullName || user.name || user.email}
            </span>
            <button onClick={handleLogout} className="nav-logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-login-links">
            <Link to="/user/login" className="nav-link-btn">User Login</Link>
            <Link to="/food-partner/login" className="nav-link-btn partner">Partner Login</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;