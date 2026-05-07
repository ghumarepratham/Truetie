import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isSingle, setIsSingle] = useState(localStorage.getItem('relationship_status') === 'S');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Listen for login/logout events
  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setUsername(localStorage.getItem('username') || '');
      setIsSingle(localStorage.getItem('relationship_status') === 'S');
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/users/search/?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async (e, receiverEmail) => {
    e.stopPropagation(); // Prevent navigating to profile when clicking invite
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/couples/invite/', { 
        receiver_email: receiverEmail 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Invite sent successfully to ${receiverEmail}!`);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send invite.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('relationship_status');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/" className="nav-logo">
        <span>💖</span> TrueTie
      </Link>
      
      {isAuthenticated && (
        <div className="nav-search-container">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(user => (
                <div key={user.id} className="search-result-item" onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  navigate('/profile', { state: { targetUserId: user.id } });
                }}>
                  <div className="result-avatar">
                    {user.profile_picture ? (
                      <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`} alt="" />
                    ) : user.username[0].toUpperCase()}
                  </div>
                  <div className="result-info">
                    <span className="result-username">@{user.username}</span>
                    <span className="result-bio">{user.bio?.substring(0, 30)}...</span>
                  </div>
                  {isSingle && (
                    <button 
                      className="nav-invite-btn"
                      onClick={(e) => handleSendInvite(e, user.email)}
                    >
                      Invite
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            {!isSingle && (
              <>
                <li><Link to="/checkin">Check-in</Link></li>
                <li><Link to="/trust-score">Trust</Link></li>
                <li><Link to="/rewards">Rewards</Link></li>
              </>
            )}
            <li><Link to="/couple">Partner</Link></li>
            {!isSingle && <li><Link to="/breakup">Status</Link></li>}
            <li><Link to="/profile">User Profile</Link></li>
          </>
        )}
      </ul>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="welcome-msg">Welcome, {username}</span>
            <button onClick={handleLogout} className="nav-logout-btn">Signout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-login-link">Signin</Link>
            <Link to="/signup" className="nav-cta">Signup</Link>
          </>
        )}
      </div>
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
