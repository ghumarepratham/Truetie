import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    birth_date: '',
    gender: '',
    relationship_status: 'S',
    partner_email: '',
    anniversary_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean data: convert empty strings to null for optional fields
    const cleanedData = { ...formData };
    ['birth_date', 'anniversary_date', 'partner_email', 'gender'].forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      }
    });

    try {
      await axios.post('http://127.0.0.1:8000/api/users/register/', cleanedData);
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);
      if (error.response?.data) {
        // Flatten nested error objects from Django into a readable string
        const errors = error.response.data;
        const errorMessages = Object.keys(errors).map(key => {
          const message = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
          return `${key.replace('_', ' ')}: ${message}`;
        });
        setError(errorMessages.join(' | '));
      } else {
        setError('Registration failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card signup-card">
      <div className="auth-header">
        <h2>Start Your Journey</h2>
        <p>Join TrueTie and build a stronger connection together.</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="signup-grid">
        <div className="form-section">
          <h3>Account Info</h3>
          <div className="input-group">
            <label>Username</label>
            <input name="username" type="text" value={formData.username} onChange={handleChange} required placeholder="Choose a unique name" />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Strong password" />
          </div>
        </div>

        <div className="form-section">
          <h3>Personal Details</h3>
          <div className="input-row">
            <div className="input-group">
              <label>Birth Date</label>
              <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>About You</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Share a bit about yourself..." rows="3"></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Relationship Status</h3>
          <div className="input-group">
            <label>Current Status</label>
            <select name="relationship_status" value={formData.relationship_status} onChange={handleChange}>
              <option value="S">Single</option>
              <option value="I">In a Relationship</option>
              <option value="E">Engaged</option>
              <option value="M">Married</option>
            </select>
          </div>
          {formData.relationship_status !== 'S' && (
            <>
              <div className="input-group animate-fade-in">
                <label>Partner's Email (Optional)</label>
                <input name="partner_email" type="email" value={formData.partner_email} onChange={handleChange} placeholder="Invite your partner" />
              </div>
              <div className="input-group animate-fade-in">
                <label>Anniversary Date</label>
                <input name="anniversary_date" type="date" value={formData.anniversary_date} onChange={handleChange} />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create TrueTie Account'}
          </button>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
