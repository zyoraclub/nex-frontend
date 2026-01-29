import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // Prevent double-call in React StrictMode (dev mode)
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`OAuth error: ${searchParams.get('error_description') || errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setLoading(false);
      return;
    }

    // CSRF Protection: Validate state parameter
    const storedState = sessionStorage.getItem('oauth_state');
    if (!state || state !== storedState) {
      setError('Security validation failed. Please try again.');
      setLoading(false);
      sessionStorage.removeItem('oauth_state');
      return;
    }
    // Clear stored state after validation
    sessionStorage.removeItem('oauth_state');

    try {
      // Call backend to exchange code for token
      const response = await authAPI.oauthCallback(provider!, code);
      const data = response.data;

      if (data.status === 'login') {
        // Existing user - log them in
        localStorage.setItem('token', data.access_token);

        // Check if profile is complete (same logic as Login.tsx)
        try {
          const userResponse = await authAPI.getMe();
          const org = userResponse.data.organization;
          const isProfileComplete = org?.mobile && org?.category && org?.domain && org?.country;

          if (!isProfileComplete) {
            navigate(`/${data.organization_slug}/profile?complete=true`);
          } else {
            navigate(`/${data.organization_slug}/dashboard`);
          }
        } catch {
          // If getMe fails, just go to dashboard
          navigate(`/${data.organization_slug}/dashboard`);
        }
      } else if (data.status === 'new_user') {
        // New user - redirect to complete registration
        // Store OAuth data temporarily
        localStorage.setItem('oauth_pending', JSON.stringify({
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          provider: data.provider,
          provider_id: data.provider_id
        }));
        navigate('/complete-registration');
      }
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setError(err.response?.data?.detail || 'Authentication failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="oauth-loading">
            <div className="spinner"></div>
            <h2>Authenticating...</h2>
            <p className="subtitle">Please wait while we verify your account</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Authentication Failed</h1>
        {error && <div className="error-message">{error}</div>}
        <button
          className="btn-primary"
          onClick={() => navigate('/login')}
          style={{ marginTop: '20px' }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
