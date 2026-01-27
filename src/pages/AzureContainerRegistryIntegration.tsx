import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { VscAzureDevops } from 'react-icons/vsc';
import { FaCheckCircle, FaSpinner, FaDocker } from 'react-icons/fa';
import api from '../services/api';

export default function AzureContainerRegistryIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    integration_name: 'Azure Container Registry',
    registry_name: '',
    subscription_id: '',
    tenant_id: '',
    client_id: '',
    client_secret: ''
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const acr = response.data.find(i => i.integration_type === 'azure_container_registry');
      if (acr && acr.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: acr.integration_name,
          registry_name: acr.config.registry_name,
          subscription_id: '••••••••',
          tenant_id: '••••••••',
          client_id: '••••••••',
          client_secret: '••••••••'
        });
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/integrations/azure-container-registry', formData);
      setSuccess('✓ Successfully connected to Azure Container Registry');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to Azure Container Registry');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverRepositories = async () => {
    setDiscovering(true);
    setError('');
    
    try {
      const response = await api.get('/integrations/azure-container-registry/repositories');
      setRepositories(response.data.repositories);
      setSuccess('✓ Successfully discovered ACR repositories');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to discover repositories');
    } finally {
      setDiscovering(false);
    }
  };

  const handleViewTags = async (repoName) => {
    setSelectedRepo(repoName);
    try {
      const response = await api.get(`/integrations/azure-container-registry/repositories/${repoName}/tags`);
      setTags(response.data.tags);
    } catch (err) {
      setError(`Failed to load tags for ${repoName}`);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <VscAzureDevops style={{ fontSize: '32px', color: '#0078D4' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              Azure Container Registry
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Manage and scan container images in Azure Container Registry
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: '6px',
            color: '#dc3545',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(40, 167, 69, 0.1)',
            border: '1px solid rgba(40, 167, 69, 0.3)',
            borderRadius: '6px',
            color: '#28a745',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        {/* Connection Form */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
            {connected ? 'Connection Settings' : 'Connect Azure Container Registry'}
          </h2>

          {!connected && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 120, 212, 0.1)', border: '1px solid rgba(0, 120, 212, 0.3)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#0078D4', margin: '0 0 8px 0', fontWeight: '600' }}>
                📝 How to get Service Principal credentials:
              </p>
              <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '11px', color: '#cccccc' }}>
                <li>Go to Azure Portal → Azure Active Directory → App registrations</li>
                <li>Create new app registration or use existing</li>
                <li>Copy Application (client) ID and Directory (tenant) ID</li>
                <li>Create client secret under Certificates & secrets</li>
                <li>Assign "AcrPull" role to service principal on ACR</li>
              </ol>
            </div>
          )}

          <form onSubmit={handleConnect}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Integration Name
              </label>
              <input
                type="text"
                value={formData.integration_name}
                onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Registry Name
              </label>
              <input
                type="text"
                value={formData.registry_name}
                onChange={(e) => setFormData({ ...formData, registry_name: e.target.value })}
                placeholder="myregistry (without .azurecr.io)"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Subscription ID
              </label>
              <input
                type="text"
                value={formData.subscription_id}
                onChange={(e) => setFormData({ ...formData, subscription_id: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Tenant ID
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Client ID (Application ID)
              </label>
              <input
                type="text"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Client Secret
              </label>
              <input
                type="password"
                value={formData.client_secret}
                onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                placeholder="Enter client secret"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            {!connected && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#666666' : '#fec76f',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Connect ACR
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Discover Repositories */}
        {connected && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Container Repositories
              </h2>
              <button
                onClick={handleDiscoverRepositories}
                disabled={discovering}
                style={{
                  padding: '8px 16px',
                  background: discovering ? '#666666' : '#fec76f',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: discovering ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {discovering ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Discovering...
                  </>
                ) : (
                  <>
                    <FaDocker />
                    Discover Repositories
                  </>
                )}
              </button>
            </div>

            {repositories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {repositories.map((repo, idx) => (
                  <div key={idx} style={{
                    background: '#1a1a1a',
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                          {repo.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888888', marginBottom: '8px' }}>
                          Registry: {repo.registry}.azurecr.io
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#888888' }}>
                          <span>🏷️ {repo.tag_count} tags</span>
                          <span>📅 Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                          {repo.can_read && <span style={{ color: '#28a745' }}>✓ Read</span>}
                          {repo.can_write && <span style={{ color: '#fec76f' }}>✓ Write</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewTags(repo.name)}
                        style={{
                          padding: '6px 12px',
                          background: '#2a2a2a',
                          color: '#fec76f',
                          border: '1px solid #3a3a3a',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        View Tags
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags List */}
        {selectedRepo && tags.length > 0 && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Tags in {selectedRepo}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tags.map((tag, idx) => (
                <div key={idx} style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {tag.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', fontFamily: 'monospace' }}>
                        {tag.digest.substring(0, 20)}...
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888888' }}>
                        <span>Size: {(tag.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Updated: {new Date(tag.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
