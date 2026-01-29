import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FaGithub } from 'react-icons/fa';
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

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);

      // Check if 2FA is required
      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setTwoFactorMethod(response.data.method);
        setTempToken(response.data.temp_token);
        if (response.data.method === 'email') {
          setSuccess('Verification code sent to your email');
        }
        setLoading(false);
        return;
      }

      // No 2FA, proceed with login
      await completeLogin(response.data.access_token);
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

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.verify2FALogin({
        email: formData.email,
        code: twoFactorCode,
        temp_token: tempToken
      });

      await completeLogin(response.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    setResendLoading(true);
    setError('');

    try {
      await authAPI.resend2FACode({
        email: formData.email,
        temp_token: tempToken
      });
      setSuccess('New verification code sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const completeLogin = async (accessToken: string) => {
    localStorage.setItem('token', accessToken);

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
  };

  const backToLogin = () => {
    setRequires2FA(false);
    setTwoFactorMethod(null);
    setTempToken('');
    setTwoFactorCode('');
    setError('');
    setSuccess('');
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      const response = await authAPI.getOAuthUrl(provider);
      // Store state for CSRF validation on callback
      sessionStorage.setItem('oauth_state', response.data.state);
      // Redirect to OAuth provider
      window.location.href = response.data.auth_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to connect to ${provider}`);
    }
  };

  // 2FA Verification Screen
  if (requires2FA) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Two-Factor Authentication</h1>
          <p className="subtitle">
            {twoFactorMethod === 'email'
              ? 'Enter the verification code sent to your email'
              : 'Enter the code from your authenticator app'}
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handle2FASubmit}>
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder={twoFactorMethod === 'email' ? '6-digit code' : 'Enter code'}
                maxLength={8}
                autoFocus
                required
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || twoFactorCode.length < 6}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {twoFactorMethod === 'email' && (
            <p className="auth-link" style={{ marginTop: '16px' }}>
              Didn't receive the code?{' '}
              <button
                onClick={handleResend2FA}
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fec76f',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {resendLoading ? 'Sending...' : 'Resend'}
              </button>
            </p>
          )}

          <p className="auth-link">
            <button
              onClick={backToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              ← Back to login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">
          {invitationToken ? 'Login to accept your workspace invitation' : 'Login to your Nexula AI account'}
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
          <span>or continue with email</span>
        </div>

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
