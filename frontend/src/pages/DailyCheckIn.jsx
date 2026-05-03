import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DailyCheckIn = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/checkins/status/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch check-in status.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/checkins/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Daily check-in successful! +10 Loyalty Points.');
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) return <div className="loading">Loading...</div>;

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h2>Daily Connection</h2>
        <p className="checkin-subtitle">Build your bond, one day at a time.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {status && (
          <div className="status-grid">
            <div className={`status-item ${status.user_checked_in ? 'completed' : 'pending'}`}>
              <div className="status-icon">{status.user_checked_in ? '✅' : '⏳'}</div>
              <div className="status-label">Your Check-in</div>
              <div className="status-text">{status.user_checked_in ? 'Completed' : 'Waiting for you'}</div>
            </div>
            <div className={`status-item ${status.partner_checked_in ? 'completed' : 'pending'}`}>
              <div className="status-icon">{status.partner_checked_in ? '✅' : '⏳'}</div>
              <div className="status-label">Partner's Check-in</div>
              <div className="status-text">{status.partner_checked_in ? 'Completed' : 'Waiting...'}</div>
            </div>
          </div>
        )}

        {!status?.user_checked_in && (
          <button 
            className="btn btn-primary checkin-btn" 
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? 'Processing...' : '💖 Check In Now'}
          </button>
        )}

        {status?.user_checked_in && status?.partner_checked_in && (
          <div className="streak-bonus">
            🌟 Both of you checked in today! Your bond is growing stronger.
          </div>
        )}

        {status?.user_checked_in && !status?.partner_checked_in && (
          <p className="wait-msg">Great job! Now waiting for your partner to complete their check-in.</p>
        )}
      </div>

      <style jsx>{`
        .checkin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          min-height: 70vh;
        }
        .checkin-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 500px;
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
          margin-top: 24px;
          padding: 16px;
          background: #fff9db;
          border-radius: 12px;
          color: #f0932b;
          font-weight: 600;
        }
        .wait-msg {
          margin-top: 20px;
          color: #636e72;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default DailyCheckIn;
