import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaGoogle, FaCheckCircle, FaSpinner, FaDocker, FaBox } from 'react-icons/fa';
import api from '../services/api';

export default function GoogleArtifactRegistryIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    integration_name: 'Google Artifact Registry',
    project_id: '',
    service_account_json: '',
    location: 'us'
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const gar = response.data.find(i => i.integration_type === 'google_artifact_registry');
      if (gar && gar.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: gar.integration_name,
          project_id: gar.config.project_id,
          service_account_json: '••••••••',
          location: gar.config.location
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
      await api.post('/integrations/google-artifact-registry', formData);
      setSuccess('✓ Successfully connected to Google Artifact Registry');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to Google Artifact Registry');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverRepositories = async () => {
    setDiscovering(true);
    setError('');
    
    try {
      const response = await api.get('/integrations/google-artifact-registry/repositories');
      setRepositories(response.data.repositories);
      setSuccess('✓ Successfully discovered Artifact Registry repositories');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to discover repositories');
    } finally {
      setDiscovering(false);
    }
  };

  const handleViewPackages = async (repoName) => {
    setSelectedRepo(repoName);
    try {
      const response = await api.get(`/integrations/google-artifact-registry/repositories/${repoName}/packages`);
      setPackages(response.data.packages);
    } catch (err) {
      setError(`Failed to load packages for ${repoName}`);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaGoogle style={{ fontSize: '32px', color: '#4285F4' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              Google Artifact Registry
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Manage and scan container images in Google Cloud Artifact Registry
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
            {connected ? 'Connection Settings' : 'Connect Google Artifact Registry'}
          </h2>

          {!connected && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.3)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: '#4285F4', margin: '0 0 8px 0', fontWeight: '600' }}>
                📝 How to get Service Account JSON:
              </p>
              <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '11px', color: '#cccccc' }}>
                <li>Go to GCP Console → IAM & Admin → Service Accounts</li>
                <li>Create service account with "Artifact Registry Reader" role</li>
                <li>Create JSON key and paste the entire content below</li>
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
                GCP Project ID
              </label>
              <input
                type="text"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                placeholder="my-gcp-project"
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
                Service Account JSON
              </label>
              <textarea
                value={formData.service_account_json}
                onChange={(e) => setFormData({ ...formData, service_account_json: e.target.value })}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              >
                <option value="us">United States (us)</option>
                <option value="europe">Europe (europe)</option>
                <option value="asia">Asia (asia)</option>
                <option value="us-central1">US Central 1</option>
                <option value="us-east1">US East 1</option>
                <option value="us-west1">US West 1</option>
                <option value="europe-west1">Europe West 1</option>
                <option value="asia-southeast1">Asia Southeast 1</option>
              </select>
            </div>

            {!connected && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#666666' : '#4285F4',
                  color: '#ffffff',
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
                    Connect Artifact Registry
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
                Artifact Repositories
              </h2>
              <button
                onClick={handleDiscoverRepositories}
                disabled={discovering}
                style={{
                  padding: '8px 16px',
                  background: discovering ? '#666666' : '#4285F4',
                  color: '#ffffff',
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
                          Format: {repo.format} • Location: {repo.location}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#888888' }}>
                          <span>📦 {repo.package_count} packages</span>
                          <span>📅 Created: {new Date(repo.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewPackages(repo.name)}
                        style={{
                          padding: '6px 12px',
                          background: '#2a2a2a',
                          color: '#4285F4',
                          border: '1px solid #3a3a3a',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        View Packages
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Packages List */}
        {selectedRepo && packages.length > 0 && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Packages in {selectedRepo}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {packages.map((pkg, idx) => (
                <div key={idx} style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaBox style={{ color: '#4285F4' }} />
                        {pkg.name}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888888' }}>
                        <span>📌 {pkg.version_count} versions</span>
                        {pkg.latest_version && <span>Latest: {pkg.latest_version}</span>}
                        <span>Updated: {new Date(pkg.updated_at).toLocaleDateString()}</span>
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
