import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaDocker, FaRobot, FaSearch, FaCube, FaBook, FaCreditCard } from 'react-icons/fa';
import { SiNvidia } from 'react-icons/si';
import api from '../services/api';

export default function NVIDIANGCIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('containers');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    integration_name: 'NVIDIA NGC',
    api_key: '',
    org_name: '',
    team_name: ''
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const ngc = response.data.find((i: any) => i.integration_type === 'nvidia_ngc');
      if (ngc && ngc.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: ngc.integration_name,
          api_key: '••••••••••••••••',
          org_name: ngc.config.org_name || '',
          team_name: ngc.config.team_name || ''
        });
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/integrations/nvidia-ngc', formData);
      setSuccess('Successfully connected to NVIDIA NGC');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to NVIDIA NGC');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');

    try {
      const response = await api.get('/integrations/nvidia-ngc/discover');
      setResources(response.data);
      setSuccess('Successfully discovered NGC resources');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  const handleGetCredits = async () => {
    try {
      const response = await api.get('/integrations/nvidia-ngc/credits');
      setCredits(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get credits info');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');

    try {
      const response = await api.get(`/integrations/nvidia-ngc/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#cccccc',
    marginBottom: '6px'
  };

  const cardStyle = {
    background: '#0f0f0f',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    background: isActive ? '#76b900' : 'transparent',
    color: isActive ? '#000000' : '#888888',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s'
  });

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <SiNvidia style={{ fontSize: '32px', color: '#76b900' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              NVIDIA NGC Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Access GPU-optimized containers, pre-trained models, and NVIDIA NIM from NGC catalog
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
            background: 'rgba(118, 185, 0, 0.1)',
            border: '1px solid rgba(118, 185, 0, 0.3)',
            borderRadius: '6px',
            color: '#76b900',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              {connected ? 'Connection Settings' : 'Connect NVIDIA NGC'}
            </h2>
            {connected && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#76b900'
              }}>
                <FaCheckCircle /> Connected
              </span>
            )}
          </div>

          <form onSubmit={handleConnect}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Integration Name</label>
                <input
                  type="text"
                  value={formData.integration_name}
                  onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  NGC API Key <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="Enter your NGC API key"
                  style={inputStyle}
                  required={!connected}
                />
                <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>
                  Generate at <a href="https://ngc.nvidia.com/setup/api-key" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>ngc.nvidia.com</a>
                </p>
              </div>

              <div>
                <label style={labelStyle}>Organization Name (Optional)</label>
                <input
                  type="text"
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  placeholder="For enterprise accounts"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Team Name (Optional)</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  placeholder="For enterprise accounts"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: '#76b900',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? <FaSpinner className="spin" /> : <SiNvidia />}
                {connected ? 'Update Connection' : 'Connect NGC'}
              </button>

              {connected && (
                <>
                  <button
                    type="button"
                    onClick={handleDiscover}
                    disabled={discovering}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: '#76b900',
                      border: '1px solid #76b900',
                      borderRadius: '6px',
                      cursor: discovering ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {discovering ? <FaSpinner className="spin" /> : <FaSearch />}
                    Discover Resources
                  </button>

                  <button
                    type="button"
                    onClick={handleGetCredits}
                    style={{
                      padding: '10px 24px',
                      background: 'transparent',
                      color: '#fec76f',
                      border: '1px solid #fec76f',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaCreditCard />
                    GPU Credits
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* GPU Credits Info */}
        {credits && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaCreditCard style={{ color: '#fec76f' }} />
              GPU Cloud Credits & Entitlements
            </h2>

            {credits.entitlements && credits.entitlements.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                {credits.entitlements.map((entitlement: any, idx: number) => (
                  <div key={idx} style={cardStyle}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                      {entitlement.name || 'Entitlement'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888888' }}>
                      {entitlement.description || 'GPU access enabled'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666666' }}>
                <p>No active GPU credits or entitlements found.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Apply for GPU credits at <a href="https://www.nvidia.com/en-us/deep-learning-ai/startups/" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>NVIDIA Inception Program</a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        {connected && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Search NGC Catalog
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for containers, models, helm charts..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{
                  padding: '10px 24px',
                  background: '#76b900',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: searching ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {searching ? <FaSpinner className="spin" /> : <FaSearch />}
                Search
              </button>
            </div>

            {searchResults && searchResults.results && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#888888', marginBottom: '12px' }}>
                  Found {searchResults.total_count || searchResults.results.length} results
                </p>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.results.slice(0, 10).map((result: any, idx: number) => (
                    <div key={idx} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          background: '#1a1a1a',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: '#76b900',
                          textTransform: 'uppercase'
                        }}>
                          {result.resourceType || result.type || 'Resource'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                          {result.displayName || result.name}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>
                        {result.description?.slice(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resources Display */}
        {resources && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              NGC Resources
            </h2>

            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {[
                { key: 'containers', label: 'Containers', icon: FaDocker, color: '#2496ED' },
                { key: 'models', label: 'Models', icon: FaRobot, color: '#76b900' },
                { key: 'helm_charts', label: 'Helm Charts', icon: FaCube, color: '#0F1689' },
                { key: 'model_scripts', label: 'Scripts', icon: FaBook, color: '#fec76f' },
                { key: 'jupyter_notebooks', label: 'Notebooks', icon: FaBook, color: '#F37626' },
                { key: 'nvidia_nims', label: 'NVIDIA NIM', icon: SiNvidia, color: '#76b900' }
              ].map(({ key, label, icon: Icon, color }) => (
                <div
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    background: activeTab === key ? 'rgba(118, 185, 0, 0.1)' : '#0f0f0f',
                    border: `1px solid ${activeTab === key ? '#76b900' : '#1a1a1a'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ fontSize: '24px', color, marginBottom: '8px' }} />
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
                    {resources.summary?.[key] || resources.resources?.[key]?.length || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888888' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ marginTop: '20px' }}>
              {activeTab === 'containers' && resources.resources?.containers && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    GPU-Optimized Containers
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.containers.map((container: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <FaDocker style={{ color: '#2496ED' }} />
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                                {container.display_name || container.name}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                              {container.description}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                              <span style={{ fontSize: '11px', color: '#666666' }}>
                                Namespace: <span style={{ color: '#76b900' }}>{container.namespace}</span>
                              </span>
                              {container.latest_tag && (
                                <span style={{ fontSize: '11px', color: '#666666' }}>
                                  Tag: <span style={{ color: '#fec76f' }}>{container.latest_tag}</span>
                                </span>
                              )}
                              {container.pull_count > 0 && (
                                <span style={{ fontSize: '11px', color: '#666666' }}>
                                  Pulls: {container.pull_count.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'models' && resources.resources?.models && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    Pre-trained Models
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.models.map((model: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <FaRobot style={{ color: '#76b900' }} />
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                                {model.display_name || model.name}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                              {model.description}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                              {model.framework && (
                                <span style={{ fontSize: '11px', color: '#666666' }}>
                                  Framework: <span style={{ color: '#76b900' }}>{model.framework}</span>
                                </span>
                              )}
                              {model.application && (
                                <span style={{ fontSize: '11px', color: '#666666' }}>
                                  Application: <span style={{ color: '#fec76f' }}>{model.application}</span>
                                </span>
                              )}
                              {model.precision && model.precision.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#666666' }}>
                                  Precision: {model.precision.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'helm_charts' && resources.resources?.helm_charts && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    Helm Charts for Kubernetes
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.helm_charts.map((chart: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <FaCube style={{ color: '#0F1689' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                            {chart.display_name || chart.name}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                          {chart.description}
                        </p>
                        {chart.latest_version && (
                          <span style={{ fontSize: '11px', color: '#666666' }}>
                            Version: <span style={{ color: '#76b900' }}>{chart.latest_version}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'model_scripts' && resources.resources?.model_scripts && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    Model Scripts
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.model_scripts.map((script: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <FaBook style={{ color: '#fec76f' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                            {script.display_name || script.name}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                          {script.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'jupyter_notebooks' && resources.resources?.jupyter_notebooks && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    Jupyter Notebooks
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.jupyter_notebooks.map((notebook: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <FaBook style={{ color: '#F37626' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                            {notebook.display_name || notebook.name}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                          {notebook.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'nvidia_nims' && resources.resources?.nvidia_nims && (
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                    NVIDIA NIM (Inference Microservices)
                  </h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {resources.resources.nvidia_nims.length > 0 ? (
                      resources.resources.nvidia_nims.map((nim: any, idx: number) => (
                        <div key={idx} style={cardStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <SiNvidia style={{ color: '#76b900' }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                              {nim.display_name || nim.name}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#888888', margin: '4px 0' }}>
                            {nim.description}
                          </p>
                          {nim.latest_tag && (
                            <span style={{ fontSize: '11px', color: '#666666' }}>
                              Tag: <span style={{ color: '#fec76f' }}>{nim.latest_tag}</span>
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666666' }}>
                        <p>NVIDIA NIM requires enterprise access.</p>
                        <p style={{ fontSize: '12px', marginTop: '8px' }}>
                          Learn more at <a href="https://www.nvidia.com/en-us/ai/" target="_blank" rel="noopener noreferrer" style={{ color: '#76b900' }}>nvidia.com/ai</a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
            About NVIDIA NGC
          </h3>
          <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>
            NVIDIA NGC is a hub for GPU-optimized software, including AI frameworks, HPC applications,
            and pre-trained models. Access containers optimized for NVIDIA GPUs, deploy models with
            NVIDIA NIM, and leverage the latest in AI/ML tools.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://catalog.ngc.nvidia.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#76b900', fontSize: '13px', textDecoration: 'none' }}
            >
              NGC Catalog
            </a>
            <a
              href="https://docs.nvidia.com/ngc/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#76b900', fontSize: '13px', textDecoration: 'none' }}
            >
              Documentation
            </a>
            <a
              href="https://www.nvidia.com/en-us/deep-learning-ai/startups/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#76b900', fontSize: '13px', textDecoration: 'none' }}
            >
              NVIDIA Inception (Startups)
            </a>
            <a
              href="https://build.nvidia.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#76b900', fontSize: '13px', textDecoration: 'none' }}
            >
              NVIDIA Build
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
