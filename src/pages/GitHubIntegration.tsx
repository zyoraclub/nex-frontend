import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { integrationAPI } from '../services/integrationAPI';
import type { Integration } from '../services/integrationAPI';
import { FaGithub } from 'react-icons/fa';
import { IoCheckmark } from 'react-icons/io5';
import api from '../services/api';
import './GitHubDetails.css';

interface OAuthConfig {
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  app_name: string;
  app_install_url: string;
}

export default function GitHubIntegration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [oauthConfig, setOauthConfig] = useState<OAuthConfig | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check for OAuth success callback
    const oauthSuccess = searchParams.get('oauth');
    const appInstalled = searchParams.get('app_installed');
    const installationId = searchParams.get('installation_id');

    if (oauthSuccess === 'success') {
      setMessage('GitHub connected successfully!');
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (appInstalled === 'true' && installationId) {
      setMessage(`GitHub App installed successfully! (Installation ID: ${installationId})`);
      window.history.replaceState({}, '', window.location.pathname);
    }

    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [integrationsRes, configRes] = await Promise.all([
        integrationAPI.list(),
        api.get('/github/oauth-config')
      ]);

      const githubIntegration = integrationsRes.data.find((i: Integration) => i.integration_type === 'github');
      setIntegration(githubIntegration || null);
      setOauthConfig(configRes.data);

      if (githubIntegration) {
        try {
          console.log('Fetching GitHub repos...');
          const reposRes = await integrationAPI.getGitHubRepos();
          console.log('GitHub repos response:', reposRes.data);
          setRepos(reposRes.data.repositories || []);

          // Check if there was an error (token expired, etc.)
          if (reposRes.data.error) {
            console.warn('GitHub API error:', reposRes.data.error);
            setMessageType('error');
            if (reposRes.data.token_status === 'invalid') {
              setMessage('GitHub token has expired. Please reconnect your GitHub account.');
            } else {
              setMessage(`Failed to fetch repos: ${reposRes.data.error}`);
            }
          }
        } catch (err) {
          console.error('Failed to fetch GitHub repos:', err);
          // Repos fetch failed, continue without repos
        }
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    if (!oauthConfig) return;

    // Use server-generated signed state for security
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.client_id}&redirect_uri=${encodeURIComponent(oauthConfig.redirect_uri)}&response_type=code&scope=${oauthConfig.scope}&state=${oauthConfig.state}`;
    window.location.href = authUrl;
  };

  const handleInstallApp = async () => {
    if (!oauthConfig) return;

    // Get fresh state for app installation
    try {
      const appConfigRes = await api.get('/github/app/config');
      window.location.href = appConfigRes.data.install_url;
    } catch {
      // Fallback to oauth config URL
      window.location.href = oauthConfig.app_install_url;
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect GitHub integration?')) return;
    try {
      await integrationAPI.delete(integration!.id);
      setIntegration(null);
      setRepos([]);
      setMessage('GitHub disconnected');
    } catch (err) {
      console.error('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="github-loading">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="github-header">
        <div className="github-title">
          <FaGithub size={32} style={{ color: '#ffffff' }} />
          <h1>GitHub Integration</h1>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          background: messageType === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${messageType === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
          borderRadius: '8px',
          color: messageType === 'error' ? '#ef4444' : '#22c55e',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {!integration ? (
        <div className="github-setup">
          <div className="setup-card">
            <button className="btn-oauth" onClick={handleOAuthConnect} type="button">
              <FaGithub size={16} />
              <span>Connect with GitHub</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="github-connected">
          <div className="connected-card">
            <div className="connected-info">
              <div className="connected-badge">
                <IoCheckmark size={12} />
                <span>Connected</span>
              </div>
              <span className="connected-name">{integration.integration_name}</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!integration.installation_id && (
                <button
                  onClick={handleInstallApp}
                  style={{
                    padding: '8px 16px',
                    background: '#fec76f',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Install GitHub App
                </button>
              )}
              {integration.installation_id && (
                <span style={{
                  padding: '8px 16px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  App Installed (ID: {integration.installation_id})
                </span>
              )}
              <button className="btn-disconnect-small" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          </div>

          <div className="repos-section">
            <h2>Repositories</h2>
            {repos.length === 0 ? (
              <div className="repos-empty">No repositories found</div>
            ) : (
              <div className="repos-grid">
                {repos.map((repo: any, index: number) => (
                  <div key={index} className="repo-card">
                    <div className="repo-header">
                      <h3>{repo.name}</h3>
                      <span className={`repo-badge ${repo.private ? 'private' : 'public'}`}>
                        {repo.private ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>
                    {repo.description && <p>{repo.description}</p>}
                    <div className="repo-meta">
                      {repo.language && <span className="repo-language">● {repo.language}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
