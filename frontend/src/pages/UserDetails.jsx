import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        if (token) {
          const response = await axios.get('http://127.0.0.1:8000/api/users/me/', { headers });
          setUser(response.data);

          // Fetch Trust Score (Tier system)
          try {
            const trustRes = await axios.get('http://127.0.0.1:8000/api/trust-score/', { headers });
            setTrust(trustRes.data);
          } catch (err) {
            console.log("No trust score found");
          }
        } else {
          // Mock data for preview
          setUser({
            username: 'LoveBird_24',
            email: 'romance@truetie.com',
            bio: 'Building a lifetime of memories together.',
            loyalty_score: 85,
            relationship_status: 'I',
            gender: 'F',
            anniversary_date: '2023-06-14'
          });
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const getStatusLabel = (s) => {
    const labels = { 'S': 'Single', 'I': 'In a Relationship', 'E': 'Engaged', 'M': 'Married' };
    return labels[s] || 'Private';
  };

  if (loading) return <div className="loading">Softening the mood...</div>;
  if (!user) return <div className="auth-card">Please login to see your bond.</div>;

  return (
    <div className="profile-page">
      <div className="profile-header auth-card">
        <div className="profile-avatar">
          {user.username[0].toUpperCase()}
        </div>
        <h2>@{user.username}</h2>
        <p className="profile-bio">{user.bio || 'Living, loving, and growing.'}</p>
        
        <div className="trust-meter-container">
          <div className="trust-header">
            <span>{trust ? `${trust.tier} Status` : 'My Loyalty'}</span>
            <span className="trust-value">{trust ? trust.score : user.loyalty_score} pts</span>
          </div>
          <div className="trust-bar-bg">
            <div 
              className={`trust-bar-fill ${trust ? trust.tier.toLowerCase() : ''}`} 
              style={{ width: `${Math.min(100, trust ? (trust.score % 300) / 3 : user.loyalty_score)}%` }}
            ></div>
          </div>
          <p className="trust-hint">
            {trust 
              ? `${trust.points_needed} points to reach ${trust.next_tier}` 
              : 'Maintain daily check-ins to boost your score!'}
          </p>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="detail-card auth-card">
          <h3>Relationship</h3>
          <div className="detail-item">
            <label>Status</label>
            <span>{getStatusLabel(user.relationship_status)}</span>
          </div>
          {user.anniversary_date && (
            <div className="detail-item">
              <label>Anniversary</label>
              <span>{new Date(user.anniversary_date).toLocaleDateString()}</span>
            </div>
          )}
          {trust && (
            <div className="detail-item" style={{marginTop: '10px'}}>
              <label>Trust Level</label>
              <span className={`tier-badge tier-${trust.tier.toLowerCase()}`}>{trust.tier}</span>
            </div>
          )}
        </div>

        <div className="detail-card auth-card">
          <h3>Personal</h3>
          <div className="detail-item">
            <label>Email</label>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <label>Gender</label>
            <span>{user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
