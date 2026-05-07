import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const DailyCheckIn = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Check-in Status
      const statusRes = await axios.get('http://127.0.0.1:8000/api/checkins/status/', { headers });
      setStatus(statusRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch check-in data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/checkins/today/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Daily check-in successful! Trust score updated.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) return <div className="loading">Loading...</div>;

  if (localStorage.getItem('relationship_status') === 'S') {
    return (
      <div className="checkin-container">
        <div className="checkin-card na-card">
          <div className="na-icon">🤝</div>
          <h2>Daily Connection</h2>
          <p className="checkin-subtitle">Build your bond, one day at a time.</p>
          <div className="na-content">
            <p>The daily check-in feature is designed for couples to nurture their commitment together.</p>
            <p>Once you've connected with a partner, you'll be able to share your daily check-ins here!</p>
          </div>
          <Link to="/couple" className="btn-magic-primary" style={{display: 'inline-block', textDecoration: 'none'}}>Find Your Partner</Link>
        </div>
        <style jsx>{`
          .na-card {
            border: 2px dashed #ff8fa3;
            background: rgba(255, 255, 255, 0.6);
          }
          .na-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .na-content {
            margin: 2rem 0;
            color: #636e72;
            font-style: italic;
          }
          .btn-magic-primary {
            background: #ff4d6d;
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-weight: 700;
            box-shadow: 0 10px 20px rgba(255, 77, 109, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h2>Daily Connection</h2>
        <p className="checkin-subtitle">Build your bond, one day at a time.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {status && (
          <div className="status-grid">
            <div className={`status-item ${status.partner1_checked_in ? 'completed' : 'pending'}`}>
              <div className="status-icon">{status.partner1_checked_in ? '✅' : '⏳'}</div>
              <div className="status-label">Partner 1</div>
              <div className="status-text">{status.partner1_checked_in ? 'Completed' : 'Waiting...'}</div>
            </div>
            <div className={`status-item ${status.partner2_checked_in ? 'completed' : 'pending'}`}>
              <div className="status-icon">{status.partner2_checked_in ? '✅' : '⏳'}</div>
              <div className="status-label">Partner 2</div>
              <div className="status-text">{status.partner2_checked_in ? 'Completed' : 'Waiting...'}</div>
            </div>
          </div>
        )}

        {!status?.mutual_confirmed && (
          <button 
            className="btn btn-primary checkin-btn" 
            onClick={handleCheckIn}
            disabled={loading || (status?.partner1_checked_in && status?.partner2_checked_in)}
          >
            {loading ? 'Processing...' : '💖 Check In Now'}
          </button>
        )}

        {status?.mutual_confirmed && (
          <div className="streak-bonus">
            🌟 Both of you checked in today! Your bond is growing stronger.
          </div>
        )}

        <div className="checkin-footer">
          <Link to="/trust-score" className="trust-link">View Trust Score Details →</Link>
        </div>
      </div>

      <style jsx>{`
        .checkin-container {
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          min-height: 70vh;
        }
        .checkin-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 600px;
          text-align: center;
        }
        h2 {
          color: #2d3436;
          margin-bottom: 8px;
          font-size: 2rem;
        }
        .checkin-subtitle {
          color: #636e72;
          margin-bottom: 32px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        .status-item {
          padding: 20px;
          border-radius: 16px;
          background: #f9f9f9;
          transition: all 0.3s ease;
        }
        .status-item.completed {
          background: #e3f9e5;
          border: 1px solid #71d07c;
        }
        .status-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .status-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #636e72;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .status-text {
          font-weight: 700;
          color: #2d3436;
        }
        .checkin-btn {
          width: 100%;
          padding: 16px;
          font-size: 1.1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff7675, #d63031);
          border: none;
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
          margin-bottom: 24px;
        }
        .checkin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .checkin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-message {
          background: #ffeaa7;
          color: #d63031;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .success-message {
          background: #55efc4;
          color: #00b894;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .streak-bonus {
          margin-bottom: 32px;
          padding: 16px;
          background: #fff9db;
          border-radius: 12px;
          color: #f0932b;
          font-weight: 600;
        }
        .checkin-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }
        .trust-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .trust-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default DailyCheckIn;
