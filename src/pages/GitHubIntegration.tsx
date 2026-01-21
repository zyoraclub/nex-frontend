import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { integrationAPI } from '../services/integrationAPI';
import type { Integration } from '../services/integrationAPI';
import { FaGithub } from 'react-icons/fa';
import { IoCheckmark } from 'react-icons/io5';
import api from '../services/api';
import './GitHubDetails.css';

export default function GitHubIntegration() {
  const navigate = useNavigate();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [oauthConfig, setOauthConfig] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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
        const reposRes = await integrationAPI.getGitHubRepos();
        setRepos(reposRes.data.repositories || []);
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthConnect = () => {
    if (!oauthConfig) return;
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('github_oauth_state', state);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.client_id}&redirect_uri=${oauthConfig.redirect_uri}&response_type=code&scope=${oauthConfig.scope}&state=${state}`;
    window.location.href = authUrl;
  };

  const handleInstallApp = () => {
    window.location.href = `https://github.com/apps/nexula-ai-security/installations/new`;
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect GitHub integration?')) return;
    try {
      await integrationAPI.delete(integration!.id);
      setIntegration(null);
      setRepos([]);
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
