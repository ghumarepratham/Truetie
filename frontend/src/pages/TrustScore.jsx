import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TrustScore = () => {
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchTrustData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/trust-score/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrust(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to fetch trust score details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrustData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/api/trust-score/refresh/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrust(response.data);
      setSuccess('Trust Analysis updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to refresh analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !trust) return (
    <div className="loading-container">
      <div className="heart-loader">💖</div>
      <p>Calculating your relationship strength...</p>
    </div>
  );

  if (localStorage.getItem('relationship_status') === 'S') {
    return (
      <div className="trust-container">
        <div className="trust-header-main">
          <h1>Trust Analysis</h1>
          <p>The health of your bond, measured in consistency and commitment.</p>
        </div>
        <div className="na-trust-card auth-card">
          <div className="na-icon">📊</div>
          <h3>Coming Soon to Your Love Story</h3>
          <p>Trust Analysis calculates scores based on mutual consistency, shared milestones, and relationship longevity.</p>
          <div className="na-features">
            <div className="na-feat">✨ 10pts per Mutual Check-in</div>
            <div className="na-feat">📅 2pts per Day Together</div>
            <div className="na-feat">🏆 10pts per Milestone</div>
          </div>
          <p className="na-footer-text">Find your partner to start building your score!</p>
          <button onClick={() => navigate('/couple')} className="btn-magic-primary">Find Your Partner</button>
        </div>
        <style jsx>{`
          .na-trust-card {
            text-align: center;
            padding: 4rem 2rem;
            max-width: 600px;
            margin: 0 auto;
            border: 2px dashed #ff8fa3;
          }
          .na-icon { font-size: 4rem; margin-bottom: 1.5rem; }
          .na-features {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 2rem 0;
            background: #fff0f3;
            padding: 1.5rem;
            border-radius: 16px;
            font-weight: 600;
            color: #ff4d6d;
          }
          .na-footer-text { margin-bottom: 2rem; font-style: italic; color: #636e72; }
          .btn-magic-primary {
            background: #ff4d6d;
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 50px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(255, 77, 109, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="trust-container">
      <div className="trust-header-main">
        <h1>Trust Analysis</h1>
        <p>The health of your bond, measured in consistency and commitment.</p>
      </div>

      {error && <div className="error-toast">{error}</div>}
      {success && <div className="success-toast">{success}</div>}

      {trust && (
        <div className="trust-grid-layout">
          {/* Left Column: Hero Score Card */}
          <div className="trust-hero-card">
            <div className={`tier-badge-large ${trust.tier.toLowerCase()}`}>
              <span className="tier-icon">
                {trust.tier === 'Platinum' ? '💎' : trust.tier === 'Gold' ? '🏆' : trust.tier === 'Silver' ? '🥈' : '🥉'}
              </span>
              {trust.tier} Tier
            </div>
            
            <div className="score-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className={`circle ${trust.tier.toLowerCase()}`}
                  strokeDasharray={`${Math.min(100, (trust.score % 300) / 3)}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">{trust.score}</text>
                <text x="18" y="24" className="score-sub">points</text>
              </svg>
            </div>

            <div className="progress-info">
              <div className="progress-header">
                <span>Next: <strong>{trust.next_tier}</strong></span>
                <span><strong>{trust.points_needed}</strong> points left</span>
              </div>
              <div className="progress-bar-container">
                <div className={`progress-bar-fill ${trust.tier.toLowerCase()}`} 
                  style={{ width: `${Math.min(100, (trust.score % 300) / 3)}%` }}>
                </div>
              </div>
            </div>

            <button onClick={handleRefresh} className="recalculate-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Recalculate Stats'}
            </button>
          </div>

          {/* Right Column: Detailed Stats */}
          <div className="trust-stats-grid">
            <div className="mini-card">
              <div className="mini-card-icon">📅</div>
              <div className="mini-card-data">
                <h3>{trust.days_together}</h3>
                <p>Days Together</p>
                <span className="point-add">+{trust.days_together * 2} pts</span>
              </div>
            </div>

            <div className="mini-card">
              <div className="mini-card-icon">🤝</div>
              <div className="mini-card-data">
                <h3>{trust.mutual_checkins}</h3>
                <p>Mutual Check-ins</p>
                <span className="point-add">+{trust.mutual_checkins * 10} pts</span>
              </div>
            </div>

            <div className="mini-card">
              <div className="mini-card-icon">🏆</div>
              <div className="mini-card-data">
                <h3>{trust.milestones_achieved}</h3>
                <p>Milestones</p>
                <span className="point-add">+{trust.milestones_achieved * 10} pts</span>
              </div>
            </div>

            <div className="mini-card penalty">
              <div className="mini-card-icon">⚠️</div>
              <div className="mini-card-data">
                <h3>{trust.missed_checkins}</h3>
                <p>Missed Days</p>
                <span className="point-sub">-{trust.missed_checkins * 5} pts</span>
              </div>
            </div>
          </div>

          {/* Formula Education Card */}
          <div className="formula-education-card">
            <div className="education-header">
              <h3>Trust Algorithm</h3>
              <span className="info-badge">How it works</span>
            </div>
            <div className="algorithm-steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h4>Consistency is Key</h4>
                  <p>Mutual check-ins are your biggest booster, adding <strong>10 points</strong> daily.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h4>Growth Rewards</h4>
                  <p>Every day linked adds <strong>2 points</strong>, and milestones add <strong>10 points</strong>.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h4>The Penalty</h4>
                  <p>Missing a mutual check-in deducts <strong>5 points</strong>. Stay consistent!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .trust-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
        }

        .trust-header-main {
          text-align: center;
          margin-bottom: 40px;
        }

        .trust-header-main h1 {
          font-size: 2.5rem;
          color: #2d3436;
          margin-bottom: 10px;
        }

        .trust-header-main p {
          color: #636e72;
          font-size: 1.1rem;
        }

        .trust-grid-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          grid-template-rows: auto auto;
          gap: 30px;
        }

        /* Hero Card Styling */
        .trust-hero-card {
          background: white;
          padding: 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          grid-row: span 2;
        }

        .score-circle {
          width: 250px;
          margin: 30px 0;
        }

        .circular-chart {
          display: block;
          margin: 10px auto;
          max-width: 100%;
          max-height: 250px;
        }

        .circle-bg {
          fill: none;
          stroke: #f1f2f6;
          stroke-width: 2.8;
        }

        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease;
        }

        .circle.bronze { stroke: #cd7f32; }
        .circle.silver { stroke: #bdc3c7; }
        .circle.gold { stroke: #f1c40f; }
        .circle.platinum { stroke: #3498db; }

        .percentage {
          fill: #2d3436;
          font-family: sans-serif;
          font-size: 8px;
          font-weight: 900;
          text-anchor: middle;
        }

        .score-sub {
          fill: #636e72;
          font-size: 3px;
          text-anchor: middle;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tier-badge-large {
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .tier-badge-large.bronze { background: #cd7f32; color: white; }
        .tier-badge-large.silver { background: #bdc3c7; color: white; }
        .tier-badge-large.gold { background: #f1c40f; color: white; }
        .tier-badge-large.platinum { background: #3498db; color: white; }

        .progress-info {
          width: 100%;
          margin: 20px 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 10px;
          color: #636e72;
        }

        .progress-bar-container {
          height: 10px;
          background: #f1f2f6;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 20px;
          transition: width 1s ease;
        }

        .progress-bar-fill.bronze { background: #cd7f32; }
        .progress-bar-fill.silver { background: #bdc3c7; }
        .progress-bar-fill.gold { background: #f1c40f; }
        .progress-bar-fill.platinum { background: #3498db; }

        .recalculate-btn {
          margin-top: auto;
          width: 100%;
          padding: 15px;
          border: 2px solid #eee;
          background: white;
          border-radius: 15px;
          font-weight: 700;
          color: #636e72;
          cursor: pointer;
          transition: all 0.3s;
        }

        .recalculate-btn:hover {
          background: #f1f2f6;
          border-color: #ddd;
        }

        /* Stats Grid Styling */
        .trust-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .mini-card {
          background: white;
          padding: 25px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.02);
          border: 1px solid #f8f9fa;
        }

        .mini-card-icon {
          font-size: 2rem;
          background: #f1f2f6;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
        }

        .mini-card-data h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #2d3436;
        }

        .mini-card-data p {
          margin: 0;
          color: #636e72;
          font-size: 0.9rem;
        }

        .point-add { color: #2ecc71; font-weight: 700; font-size: 0.8rem; }
        .point-sub { color: #e74c3c; font-weight: 700; font-size: 0.8rem; }

        /* Formula Card Styling */
        .formula-education-card {
          background: #2d3436;
          color: white;
          padding: 35px;
          border-radius: 25px;
        }

        .education-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .info-badge {
          background: rgba(255,255,255,0.1);
          padding: 5px 15px;
          border-radius: 50px;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .algorithm-steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step {
          display: flex;
          gap: 20px;
        }

        .step-num {
          background: var(--primary);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 5px 0;
          font-size: 1rem;
        }

        .step-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #b2bec3;
        }

        /* Toasts */
        .success-toast {
          background: #2ecc71;
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 900px) {
          .trust-grid-layout {
            grid-template-columns: 1fr;
          }
          .trust-hero-card {
            grid-row: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TrustScore;
