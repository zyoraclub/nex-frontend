import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { integrationAPI } from '../services/integrationAPI';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const state = searchParams.get('state');
      const savedState = localStorage.getItem('github_oauth_state');

      if (!token || state !== savedState) {
        setStatus('Authentication failed');
        setTimeout(() => navigate('/integrations'), 2000);
        return;
      }

      try {
        await integrationAPI.connectGitHub({
          integration_name: 'GitHub OAuth',
          access_token: token,
          repositories: []
        });
        
        localStorage.removeItem('github_oauth_state');
        setStatus('Connected successfully!');
        const orgSlug = localStorage.getItem('orgSlug') || 'org';
        setTimeout(() => navigate(`/${orgSlug}/integrations/github`), 1000);
      } catch (err) {
        setStatus('Failed to save integration');
        setTimeout(() => navigate('/integrations'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#000000',
      color: '#ffffff',
      fontSize: '16px'
    }}>
      {status}
    </div>
  );
}
