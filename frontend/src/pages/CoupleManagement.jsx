import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CoupleManagement = () => {
  const [couple, setCouple] = useState(null);
  const [user, setUser] = useState(null);
  const [invites, setInvites] = useState({ sent: [], received: [] });
  const [receiverEmail, setReceiverEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch User Info
      const userRes = await axios.get('http://127.0.0.1:8000/api/users/me/', { headers });
      setUser(userRes.data);

      // Fetch Couple Info
      try {
        const coupleRes = await axios.get('http://127.0.0.1:8000/api/couples/my-couple/', { headers });
        setCouple(coupleRes.data);
      } catch (err) {
        setCouple(null);
      }

      // Fetch Invites
      const invitesRes = await axios.get('http://127.0.0.1:8000/api/couples/my-invites/', { headers });
      setInvites(invitesRes.data);
    } catch (err) {
      console.error('Error fetching couple data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('http://127.0.0.1:8000/api/couples/invite/', { receiver_email: receiverEmail }, { headers });
      setMessage('Invite sent successfully!');
      setReceiverEmail('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.receiver_email?.[0] || err.response?.data?.error || 'Failed to send invite');
    }
  };

  const handleAcceptInvite = async (inviteToken) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/couples/accept/', { token: inviteToken }, { headers });
      setMessage('Invite accepted! You are now linked.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept invite');
    }
  };

  const handleRejectInvite = async (inviteToken) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/couples/reject/', { token: inviteToken }, { headers });
      setMessage('Invite rejected.');
      fetchData();
    } catch (err) {
      setError('Failed to reject invite');
    }
  };

  const handleBreakup = () => {
    navigate('/breakup');
  };

  if (loading) return <div className="loading">Checking your connection...</div>;
  if (!user && token) return <div className="loading">Loading user profile...</div>;

  return (
    <div className="couple-page">
      <div className="auth-header">
        <span className="auth-icon">💞</span>
        <h2>Relationship Management</h2>
        <p>Connect with your partner to start your journey together.</p>
      </div>

      {error && <div className="error-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{error}</div>}
      {message && <div className="success-message" style={{textAlign: 'center', marginBottom: '1rem'}}>{message}</div>}

      <div className="couple-grid">
        {/* Current Couple Status */}
        <div className="auth-card">
          <h3>My Bond</h3>
          {couple ? (
            <div className="couple-info">
              <div className="partner-details">
                <p><strong>Partner:</strong> {couple.partner1?.email === user?.email ? couple.partner2?.username : couple.partner1?.username}</p>
                <p><strong>Status:</strong> <span className="status-badge active">{couple.status}</span></p>
                <p><strong>Since:</strong> {new Date(couple.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={handleBreakup} className="btn-secondary breakup-btn">Break Relationship</button>
            </div>
          ) : (
            <div className="no-couple">
              <p>You are currently not linked to anyone.</p>
              <form onSubmit={handleSendInvite} className="invite-form">
                <div className="form-group">
                  <label>Invite Partner by Email</label>
                  <input 
                    type="email" 
                    placeholder="partner@example.com" 
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Send Invite</button>
              </form>
            </div>
          )}
        </div>

        {/* Invites Section */}
        <div className="auth-card">
          <h3>Pending Invites</h3>
          
          <div className="invite-section">
            <h4>Received</h4>
            {invites.received.length > 0 ? (
              invites.received.map(invite => (
                <div key={invite.id} className="invite-item">
                  <span>{invite.sender.email}</span>
                  <div className="invite-actions">
                    <button onClick={() => handleAcceptInvite(invite.token)} className="btn-small accept">Accept</button>
                    <button onClick={() => handleRejectInvite(invite.token)} className="btn-small reject">Reject</button>
                  </div>
                </div>
              ))
            ) : <p className="muted-text">No pending invites received.</p>}
          </div>

          <div className="invite-section" style={{marginTop: '2rem'}}>
            <h4>Sent</h4>
            {invites.sent.length > 0 ? (
              invites.sent.map(invite => (
                <div key={invite.id} className="invite-item">
                  <span>{invite.receiver_email}</span>
                  <span className="status-badge pending">Pending</span>
                </div>
              ))
            ) : <p className="muted-text">No pending invites sent.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoupleManagement;
