import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDetails from './pages/UserDetails';
import CoupleManagement from './pages/CoupleManagement';
import DailyCheckIn from './pages/DailyCheckIn';
import TrustScore from './pages/TrustScore';
import Rewards from './pages/Rewards';
import Breakup from './pages/Breakup';
import CoupleDashboard from './pages/CoupleDashboard';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Listen for login/logout events
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" className="nav-logo">
        <span>💖</span> TrueTie
      </Link>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/checkin">Check-in</Link></li>
            <li><Link to="/trust-score">Trust</Link></li>
            <li><Link to="/rewards">Rewards</Link></li>
            <li><Link to="/profile">My Bond</Link></li>
            <li><Link to="/couple">Partner</Link></li>
            <li><Link to="/breakup">Breakup</Link></li>
            <li><button onClick={handleLogout} className="nav-logout-btn">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup" className="nav-cta">Get Started</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<UserDetails />} />
          <Route path="/couple" element={<CoupleManagement />} />
          <Route path="/checkin" element={<DailyCheckIn />} />
          <Route path="/trust-score" element={<TrustScore />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/breakup" element={<Breakup />} />
          <Route path="/dashboard" element={<CoupleDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
