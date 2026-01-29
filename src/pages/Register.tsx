import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaGithub } from 'react-icons/fa';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  const [formData, setFormData] = useState({
    organization_name: '',
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
      const response = await authAPI.register(formData);
      localStorage.setItem('email', formData.email);
      
      // Store invitation token if present
      if (invitationToken) {
        localStorage.setItem('pending_invitation', invitationToken);
      }
      
      setSuccess('✓ Account created! Check your email for OTP');
      setTimeout(() => navigate('/verify-otp'), 2000);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      const response = await authAPI.getOAuthUrl(provider);
      // Store state for CSRF validation on callback
      sessionStorage.setItem('oauth_state', response.data.state);
      window.location.href = response.data.auth_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to connect to ${provider}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">
          {invitationToken ? 'Register to accept your workspace invitation' : 'Start securing your AI/ML supply chain'}
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* OAuth Buttons */}
        <div className="oauth-buttons">
          <button
            type="button"
            className="oauth-btn github"
            onClick={() => handleOAuthLogin('github')}
            style={{ flex: 'none', width: '100%' }}
          >
            <FaGithub size={18} />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {!invitationToken && (
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                placeholder="Enter your organization name"
                required
              />
            </div>
          )}

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
              placeholder="Create a strong password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <a href={invitationToken ? `/login?invitation=${invitationToken}` : '/login'}>Login</a>
        </p>
      </div>
    </div>
  );
}
