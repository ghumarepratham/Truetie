import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CoupleDashboard = () => {
  const [data, setData] = useState({
    trust: null,
    rewards: [],
    checkin: null,
    loyalty: null,
    milestones: [],
    user: null,
    couple: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const quotes = [
    "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.",
    "A great relationship is about two things: First, appreciating the similarities, and second, respecting the differences.",
    "The best thing to hold onto in life is each other.",
    "Success in a relationship doesn't come from finding the perfect person, but by learning to see an imperfect person perfectly.",
    "Relationship is a journey, not a destination. Enjoy every step together."
  ];
  const [dailyQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [trustRes, rewardsRes, checkinRes, loyaltyRes, milestoneRes, userRes, coupleRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/trust-score/', { headers }).catch(() => ({ data: null })),
        axios.get('http://127.0.0.1:8000/api/rewards/available/', { headers }).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/checkins/status/', { headers }).catch(() => ({ data: null })),
        axios.get('http://127.0.0.1:8000/api/checkins/loyalty-score/', { headers }).catch(() => ({ data: null })),
        axios.get('http://127.0.0.1:8000/api/checkins/milestones/', { headers }).catch(() => ({ data: [] })),
        axios.get('http://127.0.0.1:8000/api/users/me/', { headers }).catch(() => ({ data: null })),
        axios.get('http://127.0.0.1:8000/api/couples/my-couple/', { headers }).catch(() => ({ data: null }))
      ]);

      setData({
        trust: trustRes.data,
        rewards: Array.isArray(rewardsRes.data) ? rewardsRes.data : [],
        checkin: checkinRes.data,
        loyalty: loyaltyRes.data,
        milestones: Array.isArray(milestoneRes.data) ? milestoneRes.data : [],
        user: userRes.data,
        couple: coupleRes.data
      });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="magical-loader">
      <div className="loader-inner">
        <div className="heart-orbit">
          <div className="orbiting-heart">❤️</div>
        </div>
        <p>Weaving your love story...</p>
      </div>
    </div>
  );

  const { trust, rewards, checkin, loyalty, milestones, user, couple } = data;
  const upcomingMilestone = milestones.find(m => !m.is_achieved);
  const eligibleRewardsCount = rewards.filter(r => !r.is_unlocked && !r.already_agreed).length;
  
  const partner = couple ? (couple.partner1.email === user?.email ? couple.partner2 : couple.partner1) : null;

  return (
    <div className="simple-dash-container">
      {/* 1. Minimalist Hero */}
      <section className="dash-hero">
        <div className="hero-top-info">
          <div className="couple-names-row">
            <h1>{user?.username}</h1>
            <div className="heart-separator">❤️</div>
            <h1>{partner?.username || 'Partner'}</h1>
          </div>
          <p className="hero-desc">Your shared journey of growth and trust</p>
        </div>
        
        <div className="hero-metrics-row">
          <div className="metric-card">
            <span className="m-val">{trust?.days_together || 0}</span>
            <span className="m-lbl">Days Together</span>
          </div>
          <div className="metric-card">
            <span className="m-val">🔥 {loyalty?.current_streak || 0}</span>
            <span className="m-lbl">Current Streak</span>
          </div>
          <div className="metric-card">
            <span className="m-val">🛡️ {trust?.tier}</span>
            <span className="m-lbl">Bond Tier</span>
          </div>
        </div>
      </section>

      <div className="dash-grid-wrapper">
        <div className="bento-grid-standard">
          {/* 2. Trust Score Card */}
          <div className="grid-card trust-card-simple">
            <div className="grid-card-header">
              <h3>Trust Level</h3>
              <Link to="/trust-score" className="card-link">Details</Link>
            </div>
            <div className="trust-simple-content">
              <div className="score-main">
                <span className="score-number">{trust?.score || 0}</span>
                <span className="score-unit">Points</span>
              </div>
              <div className="trust-progress-group">
                <div className="progress-bar-container">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (trust?.score % 100))}%` }}></div>
                </div>
                <div className="progress-footer">
                  <span>{trust?.tier}</span>
                  <span>{trust?.points_needed} to {trust?.next_tier}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Milestone Card */}
          <div className="grid-card milestone-card-simple">
            <div className="grid-card-header">
              <h3>Next Milestone</h3>
            </div>
            {upcomingMilestone ? (
              <div className="milestone-simple-body">
                <div className="days-left-circle">
                  <span className="days-count">{upcomingMilestone.days_remaining}</span>
                  <span className="days-text">Days</span>
                </div>
                <div className="milestone-text-info">
                  <h4>{upcomingMilestone.title}</h4>
                  <p>{upcomingMilestone.description || 'Special celebration ahead!'}</p>
                </div>
              </div>
            ) : (
              <div className="empty-card-state">
                <p>All milestones reached! Keep it up.</p>
              </div>
            )}
          </div>

          {/* 4. Rewards Card */}
          <div className="grid-card rewards-card-simple">
            <div className="grid-card-header">
              <h3>Rewards</h3>
              <Link to="/rewards" className="card-link">Claim</Link>
            </div>
            <div className="rewards-simple-body">
              <div className="reward-status-row">
                 <div className="reward-count-box">
                    <span className="r-num">{eligibleRewardsCount}</span>
                    <span className="r-label">Available</span>
                 </div>
                 <div className="reward-icon-large">🎁</div>
              </div>
              <p className="reward-status-hint">
                {eligibleRewardsCount > 0 ? "You have rewards waiting!" : "Keep building your score to unlock perks."}
              </p>
            </div>
          </div>

          {/* 5. Daily Spark Note */}
          <div className="grid-card spark-card-simple">
             <div className="spark-quote-box">
                <span className="quote-mark">“</span>
                <p className="quote-content">{dailyQuote}</p>
                <span className="quote-label-footer">Daily Spark</span>
             </div>
          </div>

          {/* 6. Relationship Timeline */}
          <div className="grid-card timeline-card-simple full-width-card">
            <div className="grid-card-header">
              <h3>Relationship Timeline</h3>
              <span className="start-date-info">Since {new Date(couple?.created_at).toLocaleDateString()}</span>
            </div>
            <div className="timeline-horizontal-path">
              <div className="path-line-background"></div>
              <div className="timeline-events-row">
                <div className="event-node">
                  <div className="node-marker start">🌱</div>
                  <span className="node-title">Started</span>
                </div>
                {milestones.filter(m => m.is_achieved).map((m, i) => (
                  <div key={i} className="event-node">
                    <div className="node-marker done">🏆</div>
                    <span className="node-title">{m.title}</span>
                  </div>
                ))}
                <div className="event-node current">
                  <div className="node-marker active">💖</div>
                  <span className="node-title">Today</span>
                </div>
                {upcomingMilestone && (
                  <div className="event-node future">
                    <div className="node-marker pending">🔒</div>
                    <span className="node-title">{upcomingMilestone.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .simple-dash-container {
          min-height: 100vh;
          background: #fcfcfc;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #2d3436;
          padding-bottom: 60px;
        }

        /* Hero Section */
        .dash-hero {
          background: white;
          padding: 60px 20px;
          text-align: center;
          border-bottom: 1px solid #f1f2f6;
          margin-bottom: 40px;
        }

        .couple-names-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 10px;
        }

        .couple-names-row h1 {
          font-size: 2.2rem;
          font-weight: 800;
          color: #2d3436;
          margin: 0;
        }

        .heart-separator { font-size: 1.5rem; }
        .hero-desc { color: #b2bec3; font-size: 1rem; margin-top: 5px; font-weight: 500; }

        .hero-metrics-row {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .metric-card {
          background: #f8f9fa;
          padding: 15px 30px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-width: 140px;
          border: 1px solid #f1f2f6;
        }

        .m-val { font-size: 1.8rem; font-weight: 800; color: #ff4d6d; }
        .m-lbl { font-size: 0.75rem; text-transform: uppercase; color: #b2bec3; font-weight: 700; margin-top: 4px; }

        /* Grid Layout */
        .dash-grid-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .bento-grid-standard {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(280px, auto);
          gap: 24px;
        }

        .grid-card {
          background: white;
          border: 1px solid #f1f2f6;
          border-radius: 24px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .grid-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .full-width-card { grid-column: span 3; }

        .grid-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .grid-card-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: #2d3436; }
        .card-link { font-size: 0.85rem; color: #ff4d6d; text-decoration: none; font-weight: 700; }

        /* Trust Card */
        .trust-simple-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .score-main { text-align: center; margin-bottom: 25px; }
        .score-number { font-size: 3rem; font-weight: 800; display: block; color: #2d3436; line-height: 1; }
        .score-unit { font-size: 0.8rem; text-transform: uppercase; color: #b2bec3; font-weight: 700; }

        .progress-bar-container { height: 10px; background: #f1f2f6; border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
        .progress-fill { height: 100%; background: #ff4d6d; border-radius: 5px; }
        .progress-footer { display: flex; justify-content: space-between; font-size: 0.8rem; color: #b2bec3; font-weight: 600; }

        /* Milestone Card */
        .milestone-simple-body { display: flex; align-items: center; gap: 20px; flex: 1; }
        .days-left-circle {
          width: 70px; height: 70px;
          border: 2px solid #ff4d6d;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .days-count { font-size: 1.5rem; font-weight: 800; color: #ff4d6d; line-height: 1; }
        .days-text { font-size: 0.6rem; text-transform: uppercase; font-weight: 700; color: #ff4d6d; }
        .milestone-text-info h4 { font-size: 1.1rem; margin: 0 0 5px; color: #2d3436; }
        .milestone-text-info p { font-size: 0.85rem; color: #b2bec3; margin: 0; line-height: 1.4; }

        /* Rewards Card */
        .rewards-simple-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .reward-status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .reward-count-box { display: flex; align-items: baseline; gap: 8px; }
        .r-num { font-size: 3rem; font-weight: 800; color: #2d3436; }
        .r-label { font-size: 0.9rem; color: #b2bec3; font-weight: 600; }
        .reward-icon-large { font-size: 3rem; }
        .reward-status-hint { font-size: 0.85rem; color: #b2bec3; margin: 0; }

        /* Spark Card */
        .spark-card-simple { background: #2d3436; color: white; border: none; }
        .spark-quote-box { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; }
        .quote-mark { font-size: 4rem; color: #ff4d6d; opacity: 0.4; position: absolute; top: -20px; left: -10px; font-family: serif; }
        .quote-content { font-size: 1.1rem; font-style: italic; line-height: 1.6; margin: 0 0 20px; z-index: 1; }
        .quote-label-footer { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: #ff4d6d; font-weight: 800; }

        /* Timeline Card */
        .timeline-horizontal-path { position: relative; padding: 40px 0; margin-top: 10px; }
        .path-line-background { position: absolute; top: 60px; left: 0; right: 0; height: 2px; background: #f1f2f6; z-index: 1; }
        .timeline-events-row { display: flex; justify-content: space-between; position: relative; z-index: 2; }
        .event-node { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100px; }
        .node-marker {
          width: 40px; height: 40px;
          background: white;
          border: 2px solid #f1f2f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: 0.3s;
        }
        .event-node.current .node-marker { border-color: #ff4d6d; transform: scale(1.2); box-shadow: 0 0 15px rgba(255, 77, 109, 0.2); }
        .node-marker.done { border-color: #ff4d6d; color: #ff4d6d; }
        .node-title { font-size: 0.85rem; font-weight: 700; color: #2d3436; text-align: center; }
        .start-date-info { font-size: 0.85rem; color: #b2bec3; font-weight: 600; }

        @media (max-width: 1000px) {
          .bento-grid-standard { grid-template-columns: repeat(2, 1fr); }
          .full-width-card { grid-column: span 2; }
        }

        @media (max-width: 768px) {
          .bento-grid-standard { grid-template-columns: 1fr; }
          .full-width-card { grid-column: span 1; }
          .couple-names-row h1 { font-size: 1.8rem; }
          .timeline-events-row { flex-direction: column; gap: 30px; align-items: flex-start; }
          .path-line-background { left: 20px; top: 0; bottom: 0; width: 2px; height: auto; }
          .event-node { flex-direction: row; width: auto; gap: 20px; }
        }
      `}</style>
    </div>
  );
};

export default CoupleDashboard;
