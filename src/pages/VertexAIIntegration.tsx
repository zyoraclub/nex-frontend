import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaGoogle, FaCheckCircle, FaSpinner, FaServer, FaProjectDiagram, FaDatabase, FaCogs, FaRocket } from 'react-icons/fa';
import api from '../services/api';

interface VertexAIResources {
  summary: {
    models: number;
    endpoints: number;
    custom_jobs: number;
    automl_jobs: number;
    pipeline_jobs: number;
    datasets: number;
    feature_stores: number;
  };
  resources: {
    models: Array<{
      name: string;
      model_id: string;
      description: string;
      create_time: string;
      deployed_models: number;
    }>;
    endpoints: Array<{
      name: string;
      endpoint_id: string;
      deployed_models_count: number;
    }>;
    custom_jobs: Array<{
      name: string;
      state: string;
      create_time: string;
    }>;
    automl_jobs: Array<{
      name: string;
      state: string;
      create_time: string;
    }>;
    pipeline_jobs: Array<{
      name: string;
      state: string;
      create_time: string;
    }>;
    datasets: Array<{
      name: string;
      data_type: string;
      create_time: string;
    }>;
    feature_stores: Array<{
      name: string;
      featurestore_id: string;
    }>;
  };
}

export default function VertexAIIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState<VertexAIResources | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    integration_name: 'Google Vertex AI',
    project_id: '',
    service_account_json: '',
    location: 'us-central1'
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const vertexAI = response.data.find((i: { integration_type: string }) => i.integration_type === 'vertex_ai');
      if (vertexAI && vertexAI.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: vertexAI.integration_name,
          project_id: vertexAI.config.project_id || '',
          service_account_json: '••••••••',
          location: vertexAI.config.location || 'us-central1'
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
      await api.post('/integrations/vertex-ai', formData);
      setSuccess('Successfully connected to Vertex AI');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to Vertex AI');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');

    try {
      const response = await api.get('/integrations/vertex-ai/discover');
      setResources(response.data);
      setSuccess('Successfully discovered Vertex AI resources');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  const gcpLocations = [
    { value: 'us-central1', label: 'US Central (Iowa)' },
    { value: 'us-east1', label: 'US East (South Carolina)' },
    { value: 'us-east4', label: 'US East (N. Virginia)' },
    { value: 'us-west1', label: 'US West (Oregon)' },
    { value: 'us-west2', label: 'US West (Los Angeles)' },
    { value: 'us-west4', label: 'US West (Las Vegas)' },
    { value: 'europe-west1', label: 'Europe West (Belgium)' },
    { value: 'europe-west2', label: 'Europe West (London)' },
    { value: 'europe-west4', label: 'Europe West (Netherlands)' },
    { value: 'asia-east1', label: 'Asia East (Taiwan)' },
    { value: 'asia-northeast1', label: 'Asia Northeast (Tokyo)' },
    { value: 'asia-southeast1', label: 'Asia Southeast (Singapore)' }
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaGoogle style={{ fontSize: '32px', color: '#4285F4' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              Google Vertex AI Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Discover and scan ML models, endpoints, training jobs, and datasets from Google Cloud Vertex AI
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
            {connected ? 'Connection Settings' : 'Connect Vertex AI'}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                  Location / Region
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
                  disabled={connected}
                >
                  {gcpLocations.map((loc) => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                Service Account JSON Key
              </label>
              <textarea
                value={formData.service_account_json}
                onChange={(e) => setFormData({ ...formData, service_account_json: e.target.value })}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical'
                }}
                required={!connected}
                disabled={connected}
              />
              <p style={{ fontSize: '11px', color: '#666666', marginTop: '6px' }}>
                Paste the entire JSON content of your service account key file
              </p>
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
                    Connect Vertex AI
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
                  'Discover Now'
                )}
              </button>
            </div>

            {resources && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <ResourceCard icon={<FaProjectDiagram />} count={resources.summary.models} label="Models" color="#4285F4" />
                <ResourceCard icon={<FaServer />} count={resources.summary.endpoints} label="Endpoints" color="#34A853" />
                <ResourceCard icon={<FaRocket />} count={resources.summary.custom_jobs} label="Custom Jobs" color="#FBBC05" />
                <ResourceCard icon={<FaCogs />} count={resources.summary.automl_jobs} label="AutoML Jobs" color="#EA4335" />
                <ResourceCard icon={<FaProjectDiagram />} count={resources.summary.pipeline_jobs} label="Pipelines" color="#4285F4" />
                <ResourceCard icon={<FaDatabase />} count={resources.summary.datasets} label="Datasets" color="#34A853" />
                <ResourceCard icon={<FaDatabase />} count={resources.summary.feature_stores} label="Feature Stores" color="#9C27B0" />
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
                  <div key={model.model_id} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      {model.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888' }}>
                      Deployed: {model.deployed_models} endpoints | {model.description || 'No description'}
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
                  <div key={endpoint.endpoint_id} style={{
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
                        Deployed models: {endpoint.deployed_models_count}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: endpoint.deployed_models_count > 0 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                      color: endpoint.deployed_models_count > 0 ? '#28a745' : '#ffc107',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {endpoint.deployed_models_count > 0 ? 'Active' : 'Empty'}
                    </div>
                  </div>
                )}
              />
            )}

            {/* Custom Jobs */}
            {resources.resources.custom_jobs.length > 0 && (
              <ResourceSection
                title="Custom Training Jobs"
                count={resources.resources.custom_jobs.length}
                items={resources.resources.custom_jobs.slice(0, 5)}
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
                        {job.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        {job.create_time && new Date(job.create_time).toLocaleDateString()}
                      </div>
                    </div>
                    <JobStatusBadge state={job.state} />
                  </div>
                )}
              />
            )}

            {/* Pipeline Jobs */}
            {resources.resources.pipeline_jobs.length > 0 && (
              <ResourceSection
                title="Pipeline Jobs"
                count={resources.resources.pipeline_jobs.length}
                items={resources.resources.pipeline_jobs.slice(0, 5)}
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
                        {job.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        {job.create_time && new Date(job.create_time).toLocaleDateString()}
                      </div>
                    </div>
                    <JobStatusBadge state={job.state} />
                  </div>
                )}
              />
            )}

            {/* Datasets */}
            {resources.resources.datasets.length > 0 && (
              <ResourceSection
                title="Datasets"
                count={resources.resources.datasets.length}
                items={resources.resources.datasets.slice(0, 5)}
                renderItem={(dataset) => (
                  <div key={dataset.name} style={{
                    background: '#1a1a1a',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #2a2a2a'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      {dataset.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888' }}>
                      Type: {dataset.data_type} | {dataset.create_time && new Date(dataset.create_time).toLocaleDateString()}
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

function JobStatusBadge({ state }: { state: string }) {
  const getStatusStyle = (state: string) => {
    const normalizedState = state.toUpperCase();
    if (normalizedState.includes('SUCCEEDED') || normalizedState.includes('COMPLETED')) {
      return { background: 'rgba(40, 167, 69, 0.1)', color: '#28a745' };
    }
    if (normalizedState.includes('RUNNING') || normalizedState.includes('PENDING')) {
      return { background: 'rgba(0, 123, 255, 0.1)', color: '#007bff' };
    }
    if (normalizedState.includes('FAILED') || normalizedState.includes('ERROR')) {
      return { background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' };
    }
    return { background: 'rgba(108, 117, 125, 0.1)', color: '#6c757d' };
  };

  const style = getStatusStyle(state);

  return (
    <div style={{
      padding: '4px 8px',
      background: style.background,
      color: style.color,
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600'
    }}>
      {state.replace('JOB_STATE_', '').replace('PIPELINE_STATE_', '')}
    </div>
  );
}
