import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const UserDetails = () => {
  const location = useLocation();
  const targetUserId = location.state?.targetUserId;

  const [user, setUser] = useState(null);
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null); // 'header', 'relationship', 'personal'
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (token) {
        const url = targetUserId ? `http://127.0.0.1:8000/api/users/${targetUserId}/` : 'http://127.0.0.1:8000/api/users/me/';
        const response = await axios.get(url, { headers });
        setUser(response.data);
        setFormData({
          username: response.data.username || '',
          bio: response.data.bio || '',
          gender: response.data.gender || '',
          birth_date: response.data.birth_date || '',
          relationship_status: response.data.relationship_status || 'S',
          anniversary_date: response.data.anniversary_date || ''
        });

        // Only fetch trust score if it's the current user's profile
        if (!targetUserId) {
          try {
            const trustRes = await axios.get('http://127.0.0.1:8000/api/trust-score/', { headers });
            setTrust(trustRes.data);
          } catch (err) {
            console.log("No trust score found");
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [targetUserId]);

  const getStatusLabel = (s) => {
    const labels = { 'S': 'Single', 'I': 'In a Relationship', 'E': 'Engaged', 'M': 'Married' };
    return labels[s] || 'Private';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
           submitData.append(key, formData[key]);
        }
      });

      const response = await axios.patch('http://127.0.0.1:8000/api/users/me/', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data);
      localStorage.setItem('relationship_status', response.data.relationship_status);
      window.dispatchEvent(new Event('authChange'));
      setFormData({
        username: response.data.username || '',
        bio: response.data.bio || '',
        gender: response.data.gender || '',
        birth_date: response.data.birth_date || '',
        relationship_status: response.data.relationship_status || 'S',
        anniversary_date: response.data.anniversary_date || ''
      });
      setEditingSection(null);
      setPreviewImage(null);
      setUpdateSuccess('Profile updated successfully!');
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setPreviewImage(null);
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        gender: user.gender || '',
        birth_date: user.birth_date || '',
        relationship_status: user.relationship_status || 'S',
        anniversary_date: user.anniversary_date || ''
      });
    }
  };

  if (loading) return <div className="loading">Softening the mood...</div>;
  if (!user) return <div className="auth-card">Please login to see your bond.</div>;

  return (
    <div className="profile-page">
      <div className="profile-header auth-card">
        {updateError && <div className="error-message" style={{marginBottom: '1rem'}}>{updateError}</div>}
        {updateSuccess && <div className="success-message" style={{marginBottom: '1rem'}}>{updateSuccess}</div>}
        
        <div className="profile-avatar-container">
          <div className="profile-avatar">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="avatar-image" />
            ) : user.profile_picture ? (
              <img src={user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`} alt="Profile" className="avatar-image" />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} id="avatar-input" style={{display: 'none'}} />
          {!targetUserId && (
            <button className="avatar-edit-badge" onClick={() => document.getElementById('avatar-input').click()} title="Edit Photo">
              📷
            </button>
          )}
        </div>

        {editingSection === 'header' ? (
          <div className="inline-edit-form">
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="2" />
            </div>
            <div className="inline-actions">
              <button onClick={handleSave} className="btn-primary btn-xs">Save</button>
              <button onClick={cancelEdit} className="btn-secondary btn-xs">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2>@{user.username}</h2>
            <p className="profile-bio">{user.bio || 'Living, loving, and growing.'}</p>
            {!targetUserId && <button onClick={() => setEditingSection('header')} className="btn-secondary edit-btn">Edit Profile</button>}
          </>
        )}
        
        {previewImage && editingSection !== 'header' && !targetUserId && (
          <div className="avatar-save-prompt">
            <p>Save new profile photo?</p>
            <div className="inline-actions centered">
              <button onClick={handleSave} className="btn-primary btn-xs">Save Photo</button>
              <button onClick={cancelEdit} className="btn-secondary btn-xs">Cancel</button>
            </div>
          </div>
        )}

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
          <div className="card-header-with-edit">
            <h3>Relationship</h3>
            {editingSection === 'relationship' ? (
              <div className="inline-actions">
                <button onClick={handleSave} className="save-link-btn">Save</button>
                <button onClick={cancelEdit} className="cancel-link-btn">Cancel</button>
              </div>
            ) : (
              !targetUserId && <button onClick={() => setEditingSection('relationship')} className="edit-link-btn">Edit</button>
            )}
          </div>
          
          {editingSection === 'relationship' ? (
            <div className="inline-edit-fields">
              <div className="detail-item-edit">
                <label>Status</label>
                <select name="relationship_status" value={formData.relationship_status} onChange={handleInputChange}>
                  <option value="S">Single</option>
                  <option value="I">In a Relationship</option>
                  <option value="E">Engaged</option>
                  <option value="M">Married</option>
                </select>
              </div>
              <div className="detail-item-edit">
                <label>Anniversary</label>
                <input type="date" name="anniversary_date" value={formData.anniversary_date} onChange={handleInputChange} />
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
          
          {trust && (
            <div className="detail-item" style={{marginTop: '10px'}}>
              <label>Trust Level</label>
              <span className={`tier-badge tier-${trust.tier.toLowerCase()}`}>{trust.tier}</span>
            </div>
          )}
        </div>

        <div className="detail-card auth-card">
          <div className="card-header-with-edit">
            <h3>Personal</h3>
            {editingSection === 'personal' ? (
              <div className="inline-actions">
                <button onClick={handleSave} className="save-link-btn">Save</button>
                <button onClick={cancelEdit} className="cancel-link-btn">Cancel</button>
              </div>
            ) : (
              !targetUserId && <button onClick={() => setEditingSection('personal')} className="edit-link-btn">Edit</button>
            )}
          </div>

          {editingSection === 'personal' ? (
            <div className="inline-edit-fields">
              <div className="detail-item-edit">
                <label>Email</label>
                <input type="email" value={user.email} disabled className="disabled-input" title="Email cannot be changed" />
              </div>
              <div className="detail-item-edit">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div className="detail-item-edit">
                <label>Birth Date</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} />
              </div>
            </div>
          ) : (
            <>
              <div className="detail-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <span>{user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : user.gender === 'O' ? 'Other' : 'Not specified'}</span>
              </div>
              {user.birth_date && (
                <div className="detail-item">
                  <label>Birth Date</label>
                  <span>{new Date(user.birth_date).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .edit-profile-form {
          text-align: left;
          width: 100%;
        }
        .form-section {
          background: #fdfdfd;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #f1f1f1;
          margin-bottom: 1.5rem;
        }
        .form-section h4 {
          margin: 0 0 1rem 0;
          color: #ff4d6d;
          font-size: 1rem;
          border-bottom: 2px solid #fff0f3;
          padding-bottom: 5px;
        }
        .profile-avatar-edit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        .avatar-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #ff7675;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }
        .edit-btn {
          margin: 10px 0;
          padding: 5px 15px;
          font-size: 0.9rem;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        .profile-avatar-container {
          position: relative;
          width: 100px;
          margin: 0 auto 1.5rem;
        }
        .avatar-edit-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .avatar-edit-badge:hover {
          background: #f0f0f0;
          transform: scale(1.1);
        }
        .card-header-with-edit {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .card-header-with-edit h3 {
          margin: 0;
        }
        .edit-link-btn {
          background: none;
          border: none;
          color: #ff4d6d;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
          text-decoration: underline;
        }
        .edit-link-btn:hover {
          color: #ff758c;
        }
        .inline-actions {
          display: flex;
          gap: 10px;
        }
        .inline-actions.centered {
          justify-content: center;
          margin-top: 10px;
        }
        .btn-xs {
          padding: 4px 10px;
          font-size: 0.75rem;
          min-width: 60px;
        }
        .save-link-btn, .cancel-link-btn {
          background: none;
          border: none;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
        }
        .save-link-btn {
          color: #2ecc71;
        }
        .cancel-link-btn {
          color: #e74c3c;
        }
        .inline-edit-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .detail-item-edit {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .detail-item-edit label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .detail-item-edit input, .detail-item-edit select {
          padding: 5px 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          width: 60%;
        }
        .disabled-input {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        .inline-edit-form {
          max-width: 300px;
          margin: 0 auto;
          text-align: left;
        }
        .avatar-save-prompt {
          background: #fff0f3;
          padding: 10px;
          border-radius: 12px;
          margin: 15px 0;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .avatar-save-prompt p {
          margin: 0 0 5px 0;
          color: #ff4d6d;
        }
      `}</style>
    </div>
  );
};

export default UserDetails;
