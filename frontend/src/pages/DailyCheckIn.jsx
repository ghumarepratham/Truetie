import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DailyCheckIn = () => {
  const [status, setStatus] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [milestones, setMilestones] = useState([]);
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
      const statusRes = await axios.get('http://localhost:8000/api/checkins/status/', { headers });
      setStatus(statusRes.data);

      // Fetch Loyalty Score Details
      try {
        const loyaltyRes = await axios.get('http://localhost:8000/api/checkins/loyalty-score/', { headers });
        setLoyalty(loyaltyRes.data);
      } catch (err) {
        console.error('Loyalty data fetch failed:', err);
      }

      // Fetch Milestones
      try {
        const milestoneRes = await axios.get('http://localhost:8000/api/checkins/milestones/', { headers });
        setMilestones(milestoneRes.data);
      } catch (err) {
        console.error('Milestones fetch failed:', err);
      }

    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch check-in data.');
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
      await axios.post('http://localhost:8000/api/checkins/today/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Daily check-in successful! +10 Loyalty Points.');
      fetchData();
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

        {loyalty && (
          <div className="loyalty-details">
            <div className="loyalty-header">
              <h3>Loyalty Stats</h3>
              <div className="score-badge">{loyalty.loyalty_score} Points</div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-val">{loyalty.days_together}</span>
                <span className="stat-label">Days Together</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{loyalty.current_streak}</span>
                <span className="stat-label">Current Streak</span>
              </div>
              <div className="stat-box">
                <span className="stat-val">{loyalty.mutual_checkins_count}</span>
                <span className="stat-label">Mutual Check-ins</span>
              </div>
              <div className="stat-box warning">
                <span className="stat-val">-{loyalty.missed_checkins_count * 5}</span>
                <span className="stat-label">Points Deducted</span>
              </div>
            </div>

            {loyalty.next_milestone && (
              <div className="next-milestone">
                <p>🚀 Next Milestone: <strong>{loyalty.next_milestone.title}</strong> in {loyalty.next_milestone.days_remaining} days!</p>
              </div>
            )}
          </div>
        )}

        {milestones.length > 0 && (
          <div className="milestones-section">
            <h3>Relationship Milestones</h3>
            <div className="milestone-list">
              {milestones.map(m => (
                <div key={m.id} className={`milestone-item ${m.is_achieved ? 'achieved' : 'locked'}`}>
                  <div className="milestone-icon">{m.is_achieved ? '🏆' : '🔒'}</div>
                  <div className="milestone-info">
                    <div className="milestone-title">{m.title}</div>
                    <div className="milestone-date">
                      {m.is_achieved ? `Achieved on ${new Date(m.achieved_at).toLocaleDateString()}` : `Expected ${new Date(m.milestone_date).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        
        .loyalty-details {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eee;
          text-align: left;
        }
        .loyalty-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .score-badge {
          background: #ffeaa7;
          color: #d35400;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .stat-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }
        .stat-box.warning {
          background: #fff5f5;
        }
        .stat-box.warning .stat-val {
          color: #fa5252;
        }
        .stat-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: #2d3436;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #636e72;
        }
        .next-milestone {
          margin-top: 24px;
          padding: 16px;
          background: #e3f2fd;
          border-radius: 12px;
          color: #1976d2;
          font-size: 0.9rem;
        }

        .milestones-section {
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid #eee;
          text-align: left;
        }
        .milestone-list {
          margin-top: 16px;
        }
        .milestone-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 12px;
          border-radius: 12px;
          background: #f9f9f9;
        }
        .milestone-item.achieved {
          background: #f0fff4;
          border: 1px solid #c6f6d5;
        }
        .milestone-icon {
          font-size: 24px;
          margin-right: 16px;
        }
        .milestone-title {
          font-weight: 700;
          color: #2d3436;
        }
        .milestone-date {
          font-size: 0.8rem;
          color: #636e72;
        }
        .locked {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default DailyCheckIn;
