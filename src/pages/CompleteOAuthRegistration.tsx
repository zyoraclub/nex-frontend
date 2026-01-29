import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

interface OAuthPendingData {
  email: string;
  name: string;
  avatar_url: string;
  provider: string;
  provider_id: string;
}

export default function CompleteOAuthRegistration() {
  const navigate = useNavigate();
  const [oauthData, setOauthData] = useState<OAuthPendingData | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get pending OAuth data
    const pendingData = localStorage.getItem('oauth_pending');
    if (!pendingData) {
      navigate('/login');
      return;
    }

    try {
      const data = JSON.parse(pendingData);
      setOauthData(data);
      // Pre-fill organization name with user's name if available
      if (data.name) {
        setOrganizationName(`${data.name}'s Organization`);
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthData) return;

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.completeOAuthRegistration({
        organization_name: organizationName,
        email: oauthData.email,
        name: oauthData.name,
        avatar_url: oauthData.avatar_url,
        provider: oauthData.provider,
        provider_id: oauthData.provider_id
      });

      // Clear pending data
      localStorage.removeItem('oauth_pending');

      // Store token and redirect
      localStorage.setItem('token', response.data.access_token);
      navigate(`/${response.data.organization_slug}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!oauthData) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Complete Registration</h1>
        <p className="subtitle">One more step to set up your account</p>

        {/* User info from OAuth */}
        <div className="oauth-user-info">
          {oauthData.avatar_url && (
            <img
              src={oauthData.avatar_url}
              alt="Profile"
              className="oauth-avatar"
            />
          )}
          <div className="oauth-user-details">
            <span className="oauth-email">{oauthData.email}</span>
            <span className="oauth-provider">
              via {oauthData.provider === 'github' ? 'GitHub' : 'Google'}
            </span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Enter your organization name"
              required
              autoFocus
            />
            <span className="form-hint">
              This will be used for your dashboard URL
            </span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="auth-link">
          <button
            onClick={() => {
              localStorage.removeItem('oauth_pending');
              navigate('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Cancel and return to login
          </button>
        </p>
      </div>
    </div>
  );
}
