import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SiHuggingface } from 'react-icons/si';
import { FaCheckCircle, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../services/api';

export default function HuggingFaceDetails() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState('');
  
  const [formData, setFormData] = useState({
    integration_name: 'HuggingFace',
    access_token: ''
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const hf = response.data.find(i => i.integration_type === 'huggingface');
      if (hf && hf.status === 'connected') {
        setConnected(true);
        setUsername(hf.config?.username || '');
        setFormData({
          integration_name: hf.integration_name,
          access_token: '••••••••••••••••'
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
      const response = await api.post('/integrations/huggingface', formData);
      setSuccess('✓ Successfully connected to HuggingFace');
      setConnected(true);
      setUsername(response.data.config?.username || '');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to HuggingFace');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');
    
    try {
      const response = await api.get('/integrations/huggingface/discover');
      setResources(response.data);
      setSuccess('✓ Successfully discovered HuggingFace resources');
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
            <SiHuggingface style={{ fontSize: '32px', color: '#FFD21E' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              HuggingFace Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Discover and scan models, datasets, and spaces from HuggingFace Hub
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
            {connected ? `Connected as @${username}` : 'Connect HuggingFace'}
          </h2>

          {!connected && (
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(254, 199, 111, 0.1)', border: '1px solid rgba(254, 199, 111, 0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fec76f', marginBottom: '8px' }}>
                🔑 How to get your API token:
              </div>
              <ol style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc', fontSize: '12px', lineHeight: '1.6' }}>
                <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#fec76f', textDecoration: 'underline' }}>HuggingFace Settings → Access Tokens</a></li>
                <li>Click "New token" and select "Read" access</li>
                <li>Copy the token and paste it below</li>
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
                disabled={connected}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#cccccc', marginBottom: '6px' }}>
                HuggingFace API Token
              </label>
              <input
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxx"
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
                    Connect HuggingFace
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
                    {resources.summary?.total_models || 0}
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
                    {resources.summary?.total_datasets || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Datasets</div>
                </div>

                <div style={{
                  background: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fec76f', marginBottom: '4px' }}>
                    {resources.summary?.total_spaces || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888888' }}>Spaces</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Models List */}
        {resources && resources.resources?.models && resources.resources.models.length > 0 && (
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
              {resources.resources.models.slice(0, 10).map((model, idx) => (
                <div key={idx} style={{
                  background: '#1a1a1a',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      {model.id || model.modelId}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', display: 'flex', gap: '12px' }}>
                      <span>↓ {model.downloads || 0} downloads</span>
                      <span>❤️ {model.likes || 0} likes</span>
                      {model.library_name && <span>📦 {model.library_name}</span>}
                    </div>
                  </div>
                  <a
                    href={`https://huggingface.co/${model.id || model.modelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#fec76f', fontSize: '14px' }}
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Datasets List */}
        {resources && resources.resources?.datasets && resources.resources.datasets.length > 0 && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Datasets ({resources.resources.datasets.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {resources.resources.datasets.slice(0, 10).map((dataset, idx) => (
                <div key={idx} style={{
                  background: '#1a1a1a',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #2a2a2a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                      {dataset.id || dataset.datasetId}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', display: 'flex', gap: '12px' }}>
                      <span>↓ {dataset.downloads || 0} downloads</span>
                      <span>❤️ {dataset.likes || 0} likes</span>
                    </div>
                  </div>
                  <a
                    href={`https://huggingface.co/datasets/${dataset.id || dataset.datasetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#fec76f', fontSize: '14px' }}
                  >
                    <FaExternalLinkAlt />
                  </a>
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
