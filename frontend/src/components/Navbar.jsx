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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (userType === 'partner') {
        await axios.post(`${baseUrl}/api/auth/food-partner/logout`, {}, { withCredentials: true });
      } else {
        await axios.post(`${baseUrl}/api/auth/user/logout`, {}, { withCredentials: true });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 🟢 Clears all stored session items
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('partnerToken');
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
              {user.restaurantName || user.fullName || user.name || user.email}
            </span>

            {/* Links for Customer */}
            {userType !== 'partner' && (
              <Link to="/my-orders" className="nav-link-btn">
                🛍️ My Orders
              </Link>
            )}

            {/* 🟢 Links for Food Partner */}
            {userType === 'partner' && (
              <>
                {/* ➕ Direct button to create/upload new dish */}
                <Link to="/create-food" className="nav-link-btn partner">
                  ➕ Create Food
                </Link>

                {/* 📦 Link to partner incoming orders */}
                <Link to="/food-partner/orders" className="nav-link-btn partner">
                  📦 Orders
                </Link>
              </>
            )}

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