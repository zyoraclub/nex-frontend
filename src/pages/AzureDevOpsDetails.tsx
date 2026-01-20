import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { integrationAPI } from '../services/integrationAPI';
import type { Integration } from '../services/integrationAPI';
import { VscAzureDevops } from 'react-icons/vsc';
import { IoCheckmark } from 'react-icons/io5';
import './GitHubDetails.css';

export default function AzureDevOpsDetails() {
  const navigate = useNavigate();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [formData, setFormData] = useState({
    organization_url: '',
    personal_access_token: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const integrationsRes = await integrationAPI.list();
      const azureIntegration = integrationsRes.data.find((i: Integration) => i.integration_type === 'azuredevops');
      setIntegration(azureIntegration || null);

      if (azureIntegration) {
        const reposRes = await integrationAPI.getAzureDevOpsRepos();
        setRepos(reposRes.data.repositories || []);
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      await integrationAPI.connectAzureDevOps({
        integration_name: 'Azure DevOps',
        organization_url: formData.organization_url,
        personal_access_token: formData.personal_access_token,
        repositories: []
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to connect Azure DevOps');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Azure DevOps integration?')) return;
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
          <VscAzureDevops size={32} style={{ color: '#0078D4' }} />
          <h1>Azure DevOps Integration</h1>
        </div>
      </div>

      {!integration ? (
        <div className="github-setup">
          <div className="setup-card">
            <form onSubmit={handleConnect} style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cccccc' }}>
                  Organization URL
                </label>
                <input
                  type="url"
                  value={formData.organization_url}
                  onChange={(e) => setFormData({ ...formData, organization_url: e.target.value })}
                  placeholder="https://dev.azure.com/yourorg"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#cccccc' }}>
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={formData.personal_access_token}
                  onChange={(e) => setFormData({ ...formData, personal_access_token: e.target.value })}
                  placeholder="Enter your PAT"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#888888', marginTop: '6px' }}>
                  Required scopes: Code (Read), Project and Team (Read)
                </div>
              </div>
              <button
                type="submit"
                className="btn-oauth"
                disabled={connecting}
                style={{ width: '100%' }}
              >
                <VscAzureDevops size={16} />
                <span>{connecting ? 'Connecting...' : 'Connect Azure DevOps'}</span>
              </button>
            </form>
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
            <button className="btn-disconnect-small" onClick={handleDisconnect}>
              Disconnect
            </button>
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
                      <span className="repo-badge public">
                        📁 {repo.projectName}
                      </span>
                    </div>
                    <div className="repo-meta">
                      <span className="repo-language">● Azure Repos</span>
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
