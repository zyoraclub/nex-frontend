import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaAws, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

export default function AWSSageMakerIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    integration_name: 'AWS SageMaker',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    region: 'us-east-1',
    model_package_groups: []
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const sagemaker = response.data.find(i => i.integration_type === 'aws_sagemaker');
      if (sagemaker && sagemaker.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: sagemaker.integration_name,
          aws_access_key_id: '••••••••',
          aws_secret_access_key: '••••••••',
          region: sagemaker.config.region,
          model_package_groups: sagemaker.config.model_package_groups || []
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
      await api.post('/integrations/aws-sagemaker', formData);
      setSuccess('✓ Successfully connected to AWS SageMaker');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to AWS SageMaker');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');
    
    try {
      const response = await api.get('/integrations/aws-sagemaker/discover');
      setResources(response.data);
      setSuccess('✓ Successfully discovered SageMaker resources');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FaAws style={{ fontSize: '32px', color: '#FF9900' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              AWS SageMaker Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Discover and scan ML models, endpoints, and training jobs from AWS SageMaker
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
            {connected ? 'Connection Settings' : 'Connect AWS SageMaker'}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                AWS Access Key ID
              </label>
              <input
                type="text"
                value={formData.aws_access_key_id}
                onChange={(e) => setFormData({ ...formData, aws_access_key_id: e.target.value })}
                placeholder="AKIA..."
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
                AWS Secret Access Key
              </label>
              <input
                type="password"
                value={formData.aws_secret_access_key}
                onChange={(e) => setFormData({ ...formData, aws_secret_access_key: e.target.value })}
                placeholder="Enter secret key"
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                AWS Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
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
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-east-2">US East (Ohio)</option>
                <option value="us-west-1">US West (N. California)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">EU (Ireland)</option>
                <option value="eu-central-1">EU (Frankfurt)</option>
                <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
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
                    Connect SageMaker
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
                  'Discover Now'
                )}
              </button>
            </div>

            {resources && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fec76f', marginBottom: '4px' }}>
                    {resources.summary.models}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Models</div>
                </div>

                <div style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fec76f', marginBottom: '4px' }}>
                    {resources.summary.model_packages}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Model Packages</div>
                </div>

                <div style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fec76f', marginBottom: '4px' }}>
                    {resources.summary.endpoints}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Endpoints</div>
                </div>

                <div style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fec76f', marginBottom: '4px' }}>
                    {resources.summary.training_jobs}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Training Jobs</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources Details */}
        {resources && resources.resources && (
          <>
            {/* Models */}
            {resources.resources.models.length > 0 && (
              <div style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
                  Models ({resources.resources.models.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {resources.resources.models.slice(0, 5).map((model, idx) => (
                    <div key={idx} style={{
                      background: '#1a1a1a',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #2a2a2a'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                        {model.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888888' }}>
                        Created: {new Date(model.creation_time).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Endpoints */}
            {resources.resources.endpoints.length > 0 && (
              <div style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
                  Endpoints ({resources.resources.endpoints.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {resources.resources.endpoints.slice(0, 5).map((endpoint, idx) => (
                    <div key={idx} style={{
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
                          Created: {new Date(endpoint.creation_time).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        background: endpoint.status === 'InService' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                        color: endpoint.status === 'InService' ? '#28a745' : '#dc3545',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {endpoint.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
