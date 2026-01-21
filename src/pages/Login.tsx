import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.access_token);
      
      // If there's a pending invitation, redirect to accept it
      if (invitationToken) {
        setSuccess('✓ Login successful! Accepting invitation...');
        setTimeout(() => navigate(`/invite/${invitationToken}`), 1500);
        return;
      }
      
      // Get user info to check profile completion
      const userResponse = await authAPI.getMe();
      const orgSlug = userResponse.data.organization_slug;
      const org = userResponse.data.organization;
      
      // Check if profile is complete (required fields: mobile, category, domain, country)
      const isProfileComplete = org?.mobile && org?.category && org?.domain && org?.country;
      
      setSuccess('✓ Login successful! Redirecting...');
      if (!isProfileComplete) {
        setTimeout(() => navigate(`/${orgSlug}/profile?complete=true`), 1500);
      } else {
        setTimeout(() => navigate(`/${orgSlug}/dashboard`), 1500);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">
          {invitationToken ? 'Login to accept your workspace invitation' : 'Login to your Nexula AI account'}
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
