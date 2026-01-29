import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaMicrosoft, FaCheckCircle, FaSpinner, FaServer, FaProjectDiagram, FaDatabase, FaCogs } from 'react-icons/fa';
import api from '../services/api';

interface AzureMLResources {
  summary: {
    models: number;
    endpoints: number;
    compute: number;
    jobs: number;
    datasets: number;
    environments: number;
    components: number;
  };
  resources: {
    models: Array<{
      name: string;
      version: string;
      description: string;
      creation_time: string;
      type: string;
    }>;
    endpoints: Array<{
      name: string;
      provisioning_state: string;
      scoring_uri: string;
      kind: string;
    }>;
    compute: Array<{
      name: string;
      type: string;
      provisioning_state: string;
      size?: string;
    }>;
    jobs: Array<{
      name: string;
      display_name: string;
      status: string;
      creation_time: string;
    }>;
    datasets: Array<{
      name: string;
      version: string;
      type: string;
    }>;
    environments: Array<{
      name: string;
      version: string;
    }>;
    components: Array<{
      name: string;
      version: string;
    }>;
  };
}

export default function AzureMLIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState<AzureMLResources | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    integration_name: 'Azure Machine Learning',
    subscription_id: '',
    resource_group: '',
    workspace_name: '',
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
      const azureML = response.data.find((i: { integration_type: string }) => i.integration_type === 'azure_ml');
      if (azureML && azureML.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: azureML.integration_name,
          subscription_id: azureML.config.subscription_id || '',
          resource_group: azureML.config.resource_group || '',
          workspace_name: azureML.config.workspace_name || '',
          tenant_id: '••••••••',
          client_id: '••••••••',
          client_secret: '••••••••'
        });
      }
    } catch (err) {
      // Integration not connected
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/integrations/azure-ml', formData);
      setSuccess('Successfully connected to Azure Machine Learning');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to Azure ML');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');

    try {
      const response = await api.get('/integrations/azure-ml/discover');
      setResources(response.data);
      setSuccess('Successfully discovered Azure ML resources');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  const azureRegions = [
    { value: 'eastus', label: 'East US' },
    { value: 'eastus2', label: 'East US 2' },
    { value: 'westus', label: 'West US' },
    { value: 'westus2', label: 'West US 2' },
    { value: 'westeurope', label: 'West Europe' },
    { value: 'northeurope', label: 'North Europe' },
    { value: 'southeastasia', label: 'Southeast Asia' },
    { value: 'centralindia', label: 'Central India' }
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaMicrosoft style={{ fontSize: '32px', color: '#0078D4' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              Azure Machine Learning Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Discover and scan ML models, endpoints, compute resources, and jobs from Azure ML workspace
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
            {connected ? 'Connection Settings' : 'Connect Azure ML Workspace'}
          </h2>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
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
                    fontSize: '13px'
                  }}
                  required={!connected}
                  disabled={connected}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                  Resource Group
                </label>
                <input
                  type="text"
                  value={formData.resource_group}
                  onChange={(e) => setFormData({ ...formData, resource_group: e.target.value })}
                  placeholder="my-resource-group"
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
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Workspace Name
              </label>
              <input
                type="text"
                value={formData.workspace_name}
                onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                placeholder="my-ml-workspace"
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
                Tenant ID (Directory ID)
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
                  fontSize: '13px'
                }}
                required={!connected}
                disabled={connected}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                  Client ID (App ID)
                </label>
                <input
                  type="text"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  placeholder="Service principal app ID"
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                  Client Secret
                </label>
                <input
                  type="password"
                  value={formData.client_secret}
                  onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                  placeholder="Service principal password"
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
            </div>

            {!connected && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#666666' : '#0078D4',
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
                    Connect Azure ML
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Discover Resources */}
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
                Discover Resources
              </h2>
              <button
                onClick={handleDiscover}
                disabled={discovering}
                style={{
                  padding: '8px 16px',
                  background: discovering ? '#666666' : '#0078D4',
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
                  'Discover Now'
                )}
              </button>
            </div>

            {resources && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <ResourceCard icon={<FaProjectDiagram />} count={resources.summary.models} label="Models" color="#0078D4" />
                <ResourceCard icon={<FaServer />} count={resources.summary.endpoints} label="Endpoints" color="#00BCF2" />
                <ResourceCard icon={<FaCogs />} count={resources.summary.compute} label="Compute" color="#8661C5" />
                <ResourceCard icon={<FaDatabase />} count={resources.summary.jobs} label="Jobs" color="#FFB900" />
                <ResourceCard icon={<FaDatabase />} count={resources.summary.datasets} label="Datasets" color="#107C10" />
                <ResourceCard icon={<FaCogs />} count={resources.summary.environments} label="Environments" color="#D83B01" />
                <ResourceCard icon={<FaProjectDiagram />} count={resources.summary.components} label="Components" color="#5C2D91" />
              </div>
            )}
          </div>
        )}

        {/* Resources Details */}
        {resources && resources.resources && (
          <>
            {/* Models */}
            {resources.resources.models.length > 0 && (
              <ResourceSection
                title="Models"
                count={resources.resources.models.length}
                items={resources.resources.models.slice(0, 5)}
                renderItem={(model) => (
                  <div key={model.name} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888' }}>
                      Version: {model.version} | {model.description || 'No description'}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Endpoints */}
            {resources.resources.endpoints.length > 0 && (
              <ResourceSection
                title="Endpoints"
                count={resources.resources.endpoints.length}
                items={resources.resources.endpoints.slice(0, 5)}
                renderItem={(endpoint) => (
                  <div key={endpoint.name} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {endpoint.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        Type: {endpoint.kind}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: endpoint.provisioning_state === 'Succeeded' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                      color: endpoint.provisioning_state === 'Succeeded' ? '#28a745' : '#dc3545',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {endpoint.provisioning_state}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Compute */}
            {resources.resources.compute.length > 0 && (
              <ResourceSection
                title="Compute Resources"
                count={resources.resources.compute.length}
                items={resources.resources.compute.slice(0, 5)}
                renderItem={(compute) => (
                  <div key={compute.name} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {compute.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        Type: {compute.type} {compute.size && `| Size: ${compute.size}`}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: compute.provisioning_state === 'Succeeded' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                      color: compute.provisioning_state === 'Succeeded' ? '#28a745' : '#ffc107',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {compute.provisioning_state}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Jobs */}
            {resources.resources.jobs.length > 0 && (
              <ResourceSection
                title="Recent Jobs"
                count={resources.resources.jobs.length}
                items={resources.resources.jobs.slice(0, 5)}
                renderItem={(job) => (
                  <div key={job.name} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {job.display_name || job.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        {job.creation_time && new Date(job.creation_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: job.status === 'Completed' ? 'rgba(40, 167, 69, 0.1)' :
                        job.status === 'Running' ? 'rgba(0, 123, 255, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                      color: job.status === 'Completed' ? '#28a745' :
                        job.status === 'Running' ? '#007bff' : '#dc3545',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {job.status}
                    </div>
                  </div>
                )}
              />
            )}
          </>
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

function ResourceCard({ icon, count, label, color }: { icon: React.ReactNode; count: number; label: string; color: string }) {
  return (
    <div style={{
      background: '#1a1a1a',
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid #2a2a2a'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', color, marginBottom: '4px' }}>
        {count}
      </div>
      <div style={{ fontSize: '12px', color: '#888888' }}>{label}</div>
    </div>
  );
}

function ResourceSection<T>({ title, count, items, renderItem }: { title: string; count: number; items: T[]; renderItem: (item: T) => React.ReactNode }) {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '20px'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
        {title} ({count})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(renderItem)}
      </div>
    </div>
  );
}
