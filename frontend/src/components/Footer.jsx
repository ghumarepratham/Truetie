import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <Link to="/" className="footer-logo">
            <span>💖</span> TrueTie
          </Link>
          <p>Building stronger bonds, one check-in at a time. TrueTie is dedicated to relationship growth through commitment and trust.</p>
          <div className="social-icons">
            <span className="social-icon">📸</span>
            <span className="social-icon">🐦</span>
            <span className="social-icon">📘</span>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">My Bond</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Join Us</Link></li>
          </ul>
        </div>

        <div className="footer-section support">
          <h3>Support</h3>
          <ul>
            <li><Link to="/how-it-works">How it Works</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact Support</Link></li>
          </ul>
        </div>

        <div className="footer-section newsletter">
          <h3>Love Notes</h3>
          <p>Get tips on relationship growth delivered to your inbox.</p>
          <div className="footer-form">
            <input type="email" placeholder="you@example.com" />
            <button className="btn-footer">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TrueTie. All rights reserved. Made with 💖 for couples everywhere.</p>
      </div>
    </footer>
  );
};

export default Footer;
