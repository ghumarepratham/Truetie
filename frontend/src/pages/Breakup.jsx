import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Breakup = () => {
  const [status, setStatus] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/couples/breakup/status/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleInitiate = async () => {
    if (!window.confirm('Are you sure you want to initiate a breakup? This is a serious step.')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/api/couples/breakup/initiate/', { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate breakup.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (requestId) => {
    if (!window.confirm('Confirming will end the relationship. You have 30 days to change your mind before all data is reset. Proceed?')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/couples/breakup/confirm/${requestId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Relationship ended. Your data is archived for 30 days.');
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm breakup.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/couples/breakup/cancel/${requestId}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Breakup request cancelled.');
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel request.');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/api/couples/reactivate/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(response.data.message);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reactivate.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !status) return <div className="loading">Checking relationship status...</div>;

  return (
    <div className="breakup-page">
      <div className="auth-header">
        <span className="auth-icon">💔</span>
        <h2>Relationship Status</h2>
        <p>Handle difficult moments with clarity and care.</p>
      </div>

      {error && <div className="error-message" style={{textAlign: 'center'}}>{error}</div>}
      {success && <div className="success-message" style={{textAlign: 'center'}}>{success}</div>}

      <div className="status-container">
        {status?.couple_status === 'active' && !status.pending_request && (
          <div className="auth-card initiate-section">
            <h3>Initiate Breakup</h3>
            <p>If you feel the relationship has reached its end, you can initiate a breakup here. Your partner will need to confirm it.</p>
            <textarea 
              placeholder="Reason (optional)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="reason-input"
            />
            <button onClick={handleInitiate} className="btn-danger" disabled={loading}>
              Initiate Breakup
            </button>
          </div>
        )}

        {status?.pending_request && (
          <div className="auth-card pending-section">
            <div className="warning-badge">⚠️ Breakup Pending</div>
            <p><strong>Initiated by:</strong> {status.pending_request.initiated_by_email}</p>
            {status.pending_request.reason && <p><strong>Reason:</strong> {status.pending_request.reason}</p>}
            <p>Waiting for the other partner to confirm.</p>
            
            <div className="action-buttons">
              <button onClick={() => handleCancel(status.pending_request.id)} className="btn-secondary">
                Cancel Request
              </button>
              {/* Only show confirm button if current user is NOT the initiator */}
              <button onClick={() => handleConfirm(status.pending_request.id)} className="btn-danger">
                Confirm Breakup
              </button>
            </div>
          </div>
        )}

        {status?.couple_status === 'broken' && status.archive && (
          <div className="auth-card archive-section">
            <div className="broken-badge">💔 Relationship Broken</div>
            <h3>Archive Period</h3>
            <p>Your relationship data is currently archived. You have <strong>{status.archive.days_remaining} days</strong> left to reactivate before all scores are permanently reset.</p>
            
            <div className="archive-stats">
              <div className="stat">
                <label>Final Loyalty</label>
                <span>{status.archive.final_loyalty_score}</span>
              </div>
              <div className="stat">
                <label>Final Tier</label>
                <span>{status.archive.final_trust_tier}</span>
              </div>
            </div>

            <button onClick={handleReactivate} className="btn-primary" style={{marginTop: '20px'}}>
              Reactivate Relationship
            </button>
          </div>
        )}

        {status?.couple_status === 'broken' && !status.archive && (
          <div className="auth-card reset-section">
            <h3>Relationship Ended</h3>
            <p>The relationship has been permanently reset. You are now unlinked.</p>
            <button onClick={() => navigate('/couple')} className="btn-primary">
              Find New Partner
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .breakup-page {
          max-width: 600px;
          margin: 0 auto;
        }
        .status-container {
          margin-top: 2rem;
        }
        .reason-input {
          width: 100%;
          min-height: 100px;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #ddd;
          margin: 1rem 0;
          font-family: inherit;
        }
        .btn-danger {
          background: #ff7675;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
        }
        .warning-badge, .broken-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        .warning-badge { background: #ffeaa7; color: #d35400; }
        .broken-badge { background: #fab1a0; color: #d63031; }
        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 1.5rem;
        }
        .archive-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 16px;
        }
        .stat label {
          display: block;
          font-size: 0.8rem;
          color: #636e72;
          margin-bottom: 5px;
        }
        .stat span {
          font-size: 1.2rem;
          font-weight: 800;
          color: #2d3436;
        }
      `}</style>
    </div>
  );
};

export default Breakup;
