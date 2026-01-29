import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      // Check for OAuth success (token is now stored server-side)
      const oauthSuccess = searchParams.get('oauth');
      const installationId = searchParams.get('installation_id');
      const appInstalled = searchParams.get('app_installed');
      const error = searchParams.get('message');

      if (error) {
        setStatus(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/integrations'), 2000);
        return;
      }

      if (oauthSuccess === 'success') {
        setStatus('Connected successfully!');
        const orgSlug = localStorage.getItem('orgSlug') || 'org';
        setTimeout(() => navigate(`/${orgSlug}/integrations/github`), 1000);
        return;
      }

      if (appInstalled === 'true' && installationId) {
        setStatus('GitHub App installed successfully!');
        const orgSlug = localStorage.getItem('orgSlug') || 'org';
        setTimeout(() => navigate(`/${orgSlug}/integrations/github`), 1000);
        return;
      }

      // Legacy fallback: check for token in URL (deprecated - old flow)
      const token = searchParams.get('token');
      if (token) {
        // Old flow - redirect to new integration page
        setStatus('Redirecting...');
        const orgSlug = localStorage.getItem('orgSlug') || 'org';
        setTimeout(() => navigate(`/${orgSlug}/integrations/github?oauth=success`), 500);
        return;
      }

      // No valid callback params
      setStatus('Invalid callback. Redirecting...');
      setTimeout(() => navigate('/integrations'), 2000);
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000000',
      color: '#ffffff',
      fontSize: '16px',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTopColor: '#fec76f',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
      {status}
    </div>
  );
}
