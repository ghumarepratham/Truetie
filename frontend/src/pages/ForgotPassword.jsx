import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/request-otp/', { email });
      console.log('Server response:', response.data);
      if (response.data.otp_debug) {
        setMessage(`OTP generated! Use this code: ${response.data.otp_debug}`);
      } else {
        setMessage(response.data.message || 'OTP sent to your email');
      }
      setStep(2);
    } catch (err) {
      console.error('OTP Request error:', err);
      // Detailed error breakdown
      if (!err.response) {
        setError('Network Error: Backend server is not responding at 127.0.0.1:8000');
      } else {
        const errorMessage = err.response.data?.error || err.response.data?.detail || JSON.stringify(err.response.data) || 'Something went wrong on the server.';
        setError(`Server Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/users/reset-password/', {
        email,
        otp,
        new_password: newPassword
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset Password error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Invalid OTP or expired. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card login-card animate-fade-in">
      <div className="auth-header">
        <div className="auth-icon">🔑</div>
        <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
        <p>{step === 1 ? 'Enter your email to receive a reset OTP.' : 'Enter the 6-digit OTP sent to your email.'}</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequestOTP}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <label>OTP Code</label>
            <input
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
              onInput={(e) => e.target.value = e.target.value.slice(0, 6)}
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting...' : 'Update Password'}
          </button>
        </form>
      )}

      <div className="auth-footer">
        <p>Remembered your password? <Link to="/login">Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
