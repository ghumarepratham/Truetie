import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Rewards = () => {
  const [availableRewards, setAvailableRewards] = useState([]);
  const [myRewards, setMyRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch available rewards
      const availableRes = await axios.get('http://127.0.0.1:8000/api/rewards/available/', { headers });
      if (availableRes.data.message) {
        setMessage(availableRes.data.message);
        setAvailableRewards([]);
      } else {
        setAvailableRewards(availableRes.data);
      }

      // Fetch my unlocked rewards
      const myRewardsRes = await axios.get('http://127.0.0.1:8000/api/rewards/my-rewards/', { headers });
      setMyRewards(myRewardsRes.data);

    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch rewards.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAgree = async (rewardId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(`http://127.0.0.1:8000/api/rewards/agree/${rewardId}/`, {}, { headers });
      
      if (response.data.status === 'reward_unlocked') {
        alert('🎉 Reward Unlocked! Both you and your partner agreed.');
      } else {
        alert('👍 Agreement sent. Waiting for your partner to agree.');
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to agree to reward.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (coupleRewardId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post('http://127.0.0.1:8000/api/rewards/redeem/', { couple_reward_id: coupleRewardId }, { headers });
      alert('🎁 Reward redeemed successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to redeem reward.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && availableRewards.length === 0 && myRewards.length === 0) {
    return (
      <div className="loading-container">
        <div className="heart-loader">🎁</div>
        <p>Curating your exclusive rewards...</p>
      </div>
    );
  }

  if (localStorage.getItem('relationship_status') === 'S') {
    return (
      <div className="rewards-page">
        <div className="auth-header">
          <span className="auth-icon">🎁</span>
          <h2>Relationship Rewards</h2>
          <p>Unlock exclusive experiences and perks as your trust grows.</p>
        </div>
        <div className="na-rewards-card auth-card">
          <div className="na-icon">💎</div>
          <h3>Rewards Waiting to be Unlocked</h3>
          <p>From romantic date vouchers to shared digital badges, our reward system is built for two.</p>
          <div className="na-grid">
            <div className="na-item">🎖️ Exclusive Badges</div>
            <div className="na-item">🎫 Date Night Coupons</div>
            <div className="na-item">🧧 Special Vouchers</div>
          </div>
          <p className="na-hint">Start your journey with a partner to begin earning points!</p>
          <button onClick={() => navigate('/couple')} className="btn-magic-primary">Start Your Journey</button>
        </div>
        <style jsx>{`
          .na-rewards-card {
            text-align: center;
            padding: 4rem 2rem;
            max-width: 700px;
            margin: 0 auto;
            border: 2px dashed #ff8fa3;
          }
          .na-icon { font-size: 4rem; margin-bottom: 1.5rem; }
          .na-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 2.5rem 0;
          }
          .na-item {
            background: #fff0f3;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 700;
            color: #ff4d6d;
          }
          .na-hint { margin-bottom: 2rem; color: #636e72; font-style: italic; }
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
    <div className="rewards-page">
      <div className="auth-header">
        <span className="auth-icon">🎁</span>
        <h2>Relationship Rewards</h2>
        <p>Unlock exclusive experiences and perks as your trust grows.</p>
      </div>

      {error && <div className="error-message" style={{textAlign: 'center'}}>{error}</div>}
      
      {message ? (
        <div className="info-card auth-card">
          <p>{message}</p>
        </div>
      ) : (
        <div className="rewards-content">
          <section className="rewards-section">
            <h3>Available for Your Tier</h3>
            <div className="rewards-grid">
              {availableRewards.map(reward => (
                <div key={reward.id} className={`reward-card auth-card ${reward.is_unlocked ? 'unlocked' : ''}`}>
                  <div className={`reward-tier tier-${reward.tier_required.toLowerCase()}`}>
                    {reward.tier_required}
                  </div>
                  <div className="reward-icon">
                    {reward.reward_type === 'badge' ? '🎖️' : reward.reward_type === 'coupon' ? '🎫' : reward.reward_type === 'voucher' ? '🧧' : '✨'}
                  </div>
                  <h4>{reward.title}</h4>
                  <p>{reward.description}</p>
                  
                  {reward.is_unlocked ? (
                    <div className="status-tag unlocked">Already Unlocked</div>
                  ) : reward.is_redeemed ? (
                    <div className="status-tag redeemed">Redeemed</div>
                  ) : (
                    <button 
                      className={`unlock-btn ${reward.already_agreed ? 'agreed' : ''}`}
                      onClick={() => handleAgree(reward.id)}
                      disabled={loading || reward.already_agreed}
                    >
                      {reward.already_agreed ? 'Waiting for Partner...' : 'Agree to Unlock'}
                    </button>
                  )}
                </div>
              ))}
              {availableRewards.length === 0 && <p className="empty-msg">No rewards available at this time.</p>}
            </div>
          </section>

          <section className="rewards-section" style={{marginTop: '3rem'}}>
            <h3>Your Unlocked Treasures</h3>
            <div className="rewards-grid">
              {myRewards.map(cr => (
                <div key={cr.id} className={`reward-card auth-card unlocked ${cr.is_redeemed ? 'redeemed' : ''}`}>
                  <div className={`reward-tier tier-${cr.reward.tier_required.toLowerCase()}`}>
                    {cr.reward.tier_required}
                  </div>
                  <div className="reward-icon">
                    {cr.reward.reward_type === 'badge' ? '🎖️' : cr.reward.reward_type === 'coupon' ? '🎫' : cr.reward.reward_type === 'voucher' ? '🧧' : '✨'}
                  </div>
                  <h4>{cr.reward.title}</h4>
                  <p>{cr.reward.description}</p>
                  
                  {!cr.is_redeemed ? (
                    <button 
                      className="redeem-btn"
                      onClick={() => handleRedeem(cr.id)}
                      disabled={loading}
                    >
                      Redeem Now
                    </button>
                  ) : (
                    <div className="redeemed-info">
                      <div className="status-tag redeemed">Redeemed</div>
                      <small>on {new Date(cr.redeemed_at).toLocaleDateString()}</small>
                    </div>
                  )}
                </div>
              ))}
              {myRewards.length === 0 && <p className="empty-msg">No unlocked rewards yet. Start checking in daily!</p>}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .rewards-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        .rewards-section h3 {
          margin-bottom: 1.5rem;
          color: var(--text-main);
          font-size: 1.5rem;
          border-left: 4px solid var(--primary);
          padding-left: 15px;
        }
        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }
        .reward-card {
          position: relative;
          padding: 2rem;
          text-align: center;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .reward-card:hover {
          transform: translateY(-5px);
        }
        .reward-card.unlocked {
          border: 2px solid #55efc4;
          background: #f0fff4;
        }
        .reward-card.redeemed {
          opacity: 0.7;
          filter: grayscale(0.5);
        }
        .reward-tier {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .reward-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .reward-card h4 {
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        .reward-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        .unlock-btn, .redeem-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .unlock-btn {
          background: var(--primary);
          color: white;
        }
        .unlock-btn.agreed {
          background: #ffeaa7;
          color: #d35400;
          cursor: default;
        }
        .redeem-btn {
          background: #2ecc71;
          color: white;
        }
        .status-tag {
          padding: 8px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .status-tag.unlocked { color: #27ae60; background: #e3f9e5; }
        .status-tag.redeemed { color: #7f8c8d; background: #ecf0f1; }
        .empty-msg {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .redeemed-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .info-card {
          text-align: center;
          padding: 3rem;
          background: #fff9db;
          color: #d35400;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Rewards;
