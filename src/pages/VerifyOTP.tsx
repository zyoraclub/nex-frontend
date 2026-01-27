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
  const [resending, setResending] = useState(false);
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

  const handleResend = async () => {
    if (!email) {
      setError('Email not found. Please register again.');
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
      // Call resend OTP endpoint (we'll create this)
      await authAPI.resendOTP(email);
      setSuccess('✓ New OTP sent to your email!');
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
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
          Didn't receive code? <button 
            onClick={handleResend} 
            disabled={resending}
            style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
      </div>
    </div>
  );
}
