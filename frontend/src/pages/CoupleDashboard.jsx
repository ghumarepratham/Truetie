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

      // Update local storage status if it changed
      if (userRes.data && userRes.data.relationship_status !== localStorage.getItem('relationship_status')) {
        localStorage.setItem('relationship_status', userRes.data.relationship_status);
        window.dispatchEvent(new Event('authChange'));
      }
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
  
  if (user?.relationship_status === 'S' || !couple || couple.status !== 'active') {
    return (
      <div className="single-dash-container">
        <div className="floating-elements">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`float-item item-${i}`}>❤️</div>
          ))}
        </div>
        
        <div className="single-dash-content">
          <div className="magic-seal">
            <div className="seal-inner">
              <span className="main-emoji">✨</span>
            </div>
            <div className="seal-orbit"></div>
          </div>
          
          <div className="text-reveal">
            <h1>The Canvas is Ready, {user?.username}</h1>
            <p className="subtitle">Every great love story starts with a single heartbeat. Your dashboard is waiting for its other half.</p>
          </div>

          <div className="feature-preview-grid">
            <div className="preview-item">
              <span className="p-icon">🔒</span>
              <span>Trust Meters</span>
            </div>
            <div className="preview-item">
              <span className="p-icon">🎁</span>
              <span>Mutual Rewards</span>
            </div>
            <div className="preview-item">
              <span className="p-icon">📅</span>
              <span>Love Milestones</span>
            </div>
          </div>

          <div className="single-actions-creative">
            <Link to="/couple" className="btn-magic-primary">
              <span className="btn-text">Find Your Partner</span>
              <span className="btn-glow"></span>
            </Link>
            <Link to="/profile" className="btn-magic-secondary">
              Complete Your Profile
            </Link>
          </div>

          <div className="quote-fade">
            "Love is not something you find. Love is something that finds you."
          </div>
        </div>

        <style jsx>{`
          .single-dash-container {
            min-height: 90vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #fff5f7 0%, #ffe0e6 100%);
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }

          .floating-elements {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }

          .float-item {
            position: absolute;
            opacity: 0.15;
            animation: float-around 20s linear infinite;
          }

          @keyframes float-around {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(100px, 100px) rotate(90deg); }
            50% { transform: translate(0, 200px) rotate(180deg); }
            75% { transform: translate(-100px, 100px) rotate(270deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
          }

          .item-0 { top: 10%; left: 10%; animation-delay: 0s; }
          .item-1 { top: 20%; right: 15%; animation-delay: -2s; font-size: 1.5rem; }
          .item-2 { bottom: 15%; left: 20%; animation-delay: -4s; }
          .item-3 { bottom: 10%; right: 10%; animation-delay: -6s; font-size: 2rem; }
          .item-4 { top: 40%; left: 5%; animation-delay: -8s; }
          .item-5 { top: 60%; right: 5%; animation-delay: -10s; }
          .item-6 { top: 5%; left: 50%; animation-delay: -12s; }
          .item-7 { bottom: 5%; right: 50%; animation-delay: -14s; }

          .single-dash-content {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            padding: 5rem 4rem;
            border-radius: 40px;
            box-shadow: 0 20px 50px rgba(255, 77, 109, 0.15);
            max-width: 700px;
            width: 100%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.5);
            z-index: 1;
            position: relative;
            animation: content-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          @keyframes content-pop {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          .magic-seal {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 2.5rem;
          }

          .seal-inner {
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 20px rgba(255, 77, 109, 0.2);
            position: relative;
            z-index: 2;
          }

          .main-emoji {
            font-size: 3rem;
            animation: pulse-emoji 2s infinite;
          }

          @keyframes pulse-emoji {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .seal-orbit {
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            border: 2px dashed #ff4d6d;
            border-radius: 50%;
            animation: rotate-orbit 10s linear infinite;
            opacity: 0.3;
          }

          @keyframes rotate-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          h1 {
            font-size: 2.8rem;
            color: #2d3436;
            margin-bottom: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #2d3436 0%, #ff4d6d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .subtitle {
            font-size: 1.2rem;
            color: #636e72;
            line-height: 1.6;
            margin-bottom: 3rem;
          }

          .feature-preview-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 3.5rem;
          }

          .preview-item {
            background: #fff0f3;
            padding: 1.5rem 1rem;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #ff4d6d;
            transition: all 0.3s;
          }

          .preview-item:hover {
            transform: translateY(-5px);
            background: #ff4d6d;
            color: white;
          }

          .p-icon { font-size: 1.5rem; }

          .single-actions-creative {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
          }

          .btn-magic-primary {
            background: #ff4d6d;
            color: white;
            padding: 1.2rem 3.5rem;
            border-radius: 50px;
            font-weight: 800;
            font-size: 1.1rem;
            text-decoration: none;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            box-shadow: 0 10px 20px rgba(255, 77, 109, 0.3);
          }

          .btn-magic-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255, 77, 109, 0.4);
          }

          .btn-magic-secondary {
            color: #b2bec3;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.95rem;
            transition: color 0.3s;
          }

          .btn-magic-secondary:hover {
            color: #ff4d6d;
          }

          .quote-fade {
            margin-top: 4rem;
            font-style: italic;
            color: #b2bec3;
            font-size: 0.9rem;
            opacity: 0.8;
          }
        `}</style>
      </div>
    );
  }

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
              <span className="start-date-info">Since {new Date(couple?.relationship_start).toLocaleDateString()}</span>
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
