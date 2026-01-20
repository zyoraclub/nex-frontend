import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SiHuggingface } from 'react-icons/si';
import { FaKey, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { integrationAPI, type HuggingFaceIntegrationCreate } from '../services/integrationAPI';

export default function HuggingFaceIntegration() {
  const { orgSlug } = useParams();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [integrationName, setIntegrationName] = useState('HuggingFace Integration');
  const [username, setUsername] = useState('');
  const [resources, setResources] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await integrationAPI.list();
      const hfIntegration = response.data.find((i: any) => i.integration_type === 'huggingface');
      if (hfIntegration && hfIntegration.status === 'connected') {
        setIsConnected(true);
        setUsername(hfIntegration.config?.username || '');
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      alert('Please enter your HuggingFace API token');
      return;
    }

    setConnecting(true);
    try {
      const data: HuggingFaceIntegrationCreate = {
        integration_name: integrationName,
        access_token: accessToken
      };
      
      const response = await integrationAPI.connectHuggingFace(data);
      setIsConnected(true);
      setUsername(response.data.config?.username || '');
      setAccessToken('');
      alert('HuggingFace connected successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to connect HuggingFace');
    } finally {
      setConnecting(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const response = await integrationAPI.getHuggingFaceResources();
      setResources(response.data.resources);
    } catch (error) {
      alert('Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <SiHuggingface style={{ fontSize: '48px', color: '#FFD21E' }} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', margin: 0 }}>
                HuggingFace Integration
              </h1>
              <p style={{ fontSize: '14px', color: '#888', margin: '4px 0 0 0' }}>
                Connect your HuggingFace account to scan models, datasets, and spaces
              </p>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '24px' }}>
              Connect HuggingFace
            </h2>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(254, 199, 111, 0.1)', border: '1px solid rgba(254, 199, 111, 0.3)', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fec76f', margin: '0 0 8px 0' }}>
                🔑 How to get your API token:
              </h3>
              <ol style={{ margin: '8px 0', paddingLeft: '20px', color: '#ccc', fontSize: '13px' }}>
                <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#fec76f' }}>HuggingFace Settings → Access Tokens</a></li>
                <li>Click "New token" and select "Read" access</li>
                <li>Copy the token and paste it below</li>
              </ol>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Integration Name
              </label>
              <input
                type="text"
                value={integrationName}
                onChange={(e) => setIntegrationName(e.target.value)}
                placeholder="e.g., My HuggingFace Account"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                <FaKey style={{ marginRight: '6px' }} />
                HuggingFace API Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting || !accessToken.trim()}
              style={{
                padding: '12px 24px',
                background: connecting || !accessToken.trim() ? '#2a2a2a' : '#fec76f',
                color: connecting || !accessToken.trim() ? '#666' : '#0a0a0a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: connecting || !accessToken.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <SiHuggingface />
              {connecting ? 'Connecting...' : 'Connect HuggingFace'}
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCheckCircle style={{ color: '#22c55e' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>
                      Connected as @{username}
                    </h2>
                  </div>
                  <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                    Your HuggingFace account is connected and ready to scan
                  </p>
                </div>
                <button
                  onClick={handleDiscover}
                  disabled={discovering}
                  style={{
                    padding: '10px 20px',
                    background: '#fec76f',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: discovering ? 'not-allowed' : 'pointer'
                  }}
                >
                  {discovering ? 'Discovering...' : 'Discover Resources'}
                </button>
              </div>
            </div>

            {resources && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Models</h3>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#fec76f', margin: 0 }}>
                    {resources.models?.length || 0}
                  </p>
                </div>
                <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Datasets</h3>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#fec76f', margin: 0 }}>
                    {resources.datasets?.length || 0}
                  </p>
                </div>
                <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Spaces</h3>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: '#fec76f', margin: 0 }}>
                    {resources.spaces?.length || 0}
                  </p>
                </div>
              </div>
            )}

            {resources && resources.models && resources.models.length > 0 && (
              <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Your Models</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {resources.models.slice(0, 10).map((model: any) => (
                    <div key={model.id} style={{ padding: '16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>
                            {model.id || model.modelId}
                          </h4>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
