import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth-shared.css';
import axios from 'axios';

const FoodPartnerRegister = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const businessName = e.target.businessName.value;
    const contactName = e.target.contactName.value;
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const address = e.target.address.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/food-partner/register`, {
        name: businessName,
        contactName,
        phone,
        email,
        password,
        address
      }, { withCredentials: true });

      console.log("Registration successful:", response.data);

      // Save partner session for Navbar
      if (response.data.foodPartner) {
        localStorage.setItem('user', JSON.stringify(response.data.foodPartner));
        localStorage.setItem('userType', 'partner');
      }

      navigate("/create-food"); // Redirect to create food page after registration
    } catch (error) {
      console.error("Partner registration failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-register-title">
        <header>
          <h1 id="partner-register-title" className="auth-title">Partner Sign Up</h1>
          <p className="auth-subtitle">Verify and register your food business.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="businessName">Business Name</label>
            <input id="businessName" name="businessName" placeholder="Tasty Bites" autoComplete="organization" required />
          </div>
          <div className="two-col">
            <div className="field-group">
              <label htmlFor="contactName">Contact Name</label>
              <input id="contactName" name="contactName" placeholder="Jane Doe" autoComplete="name" required />
            </div>
            <div className="field-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" placeholder="+1 555 123 4567" autoComplete="tel" required />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create password" autoComplete="new-password" required />
          </div>
          <div className="field-group">
            <label htmlFor="address">Physical Address</label>
            <input id="address" name="address" placeholder="123 Market Street, City" autoComplete="street-address" required />
            <p className="small-note">Full address helps customers locate your store.</p>
          </div>
          <button className="auth-submit" type="submit">Create Partner Account</button>
        </form>
        <div className="auth-alt-action">
          Already registered? <Link to="/food-partner/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerRegister;