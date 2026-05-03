import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', formData);
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      window.dispatchEvent(new Event('authChange'));
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card login-card animate-fade-in">
      <div className="auth-header">
        <div className="auth-icon">🔐</div>
        <h2>Welcome Back</h2>
        <p>Your journey of commitment continues here.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username or Email</label>
          <input 
            name="username" 
            type="text" 
            value={formData.username} 
            onChange={handleChange} 
            required 
            placeholder="Enter your username or email"
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            placeholder="••••••••"
          />
        </div>

        <div className="form-options">
          <label className="checkbox-container">
            <input type="checkbox" />
            <span className="checkmark"></span>
            Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In to TrueTie'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          New to TrueTie? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
