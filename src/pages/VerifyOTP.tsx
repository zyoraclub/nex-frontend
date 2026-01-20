import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const email = localStorage.getItem('email') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.verifyOTP({ email, otp });
      
      // Check for pending invitation
      const invitationToken = localStorage.getItem('pending_invitation');
      
      setSuccess('✓ Email verified successfully!');
      
      if (invitationToken) {
        localStorage.removeItem('pending_invitation');
        setTimeout(() => navigate(`/login?invitation=${invitationToken}`), 2000);
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Verify Email</h1>
        <p className="subtitle">Enter the 6-digit code sent to {email}</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="auth-link">
          Didn't receive code? <a href="/register">Resend</a>
        </p>
      </div>
    </div>
  );
}
