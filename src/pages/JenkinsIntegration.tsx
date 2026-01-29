import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaCheckCircle, FaSpinner, FaPlay, FaStop, FaServer, FaCog, FaClipboard, FaPlug } from 'react-icons/fa';
import { SiJenkins } from 'react-icons/si';
import api from '../services/api';

export default function JenkinsIntegration() {
  const { orgSlug } = useParams();
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(false);
  const [resources, setResources] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [pipelineConfig, setPipelineConfig] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [triggering, setTriggering] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    integration_name: 'Jenkins CI/CD',
    server_url: '',
    username: '',
    api_token: ''
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await api.get('/integrations/');
      const jenkins = response.data.find((i: any) => i.integration_type === 'jenkins');
      if (jenkins && jenkins.status === 'connected') {
        setConnected(true);
        setFormData({
          integration_name: jenkins.integration_name,
          server_url: jenkins.config.server_url,
          username: jenkins.config.username,
          api_token: '••••••••••••••••'
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
      await api.post('/integrations/jenkins', formData);
      setSuccess('Successfully connected to Jenkins');
      setConnected(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to Jenkins');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');

    try {
      const response = await api.get('/integrations/jenkins/discover');
      setResources(response.data);
      setSuccess('Successfully discovered Jenkins resources');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to discover resources');
    } finally {
      setDiscovering(false);
    }
  };

  const handleTriggerBuild = async (jobName: string) => {
    setTriggering(jobName);
    try {
      await api.post(`/integrations/jenkins/jobs/${encodeURIComponent(jobName)}/build`);
      setSuccess(`Build triggered for ${jobName}`);
      setTimeout(() => setSuccess(''), 3000);
      // Refresh jobs
      handleDiscover();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to trigger build');
    } finally {
      setTriggering(null);
    }
  };

  const handleGetPipelineConfig = async () => {
    try {
      const response = await api.get('/integrations/jenkins/pipeline-config?project_slug=my-project');
      setPipelineConfig(response.data.pipeline_config);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to get pipeline config');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'failed': return '#dc3545';
      case 'unstable': return '#ffc107';
      case 'running': return '#17a2b8';
      case 'disabled': return '#6c757d';
      default: return '#888888';
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

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <SiJenkins style={{ fontSize: '32px', color: '#D24939' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              Jenkins Integration
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Connect Jenkins to trigger security scans from your CI/CD pipelines
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
            background: 'rgba(210, 73, 57, 0.1)',
            border: '1px solid rgba(210, 73, 57, 0.3)',
            borderRadius: '6px',
            color: '#D24939',
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
              {connected ? 'Connection Settings' : 'Connect Jenkins'}
            </h2>
            {connected && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#D24939'
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
                  Jenkins Server URL <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="url"
                  value={formData.server_url}
                  onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                  placeholder="https://jenkins.example.com"
                  style={inputStyle}
                  required={!connected}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Username <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="jenkins-user"
                  style={inputStyle}
                  required={!connected}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  API Token <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.api_token}
                  onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                  placeholder="Enter your Jenkins API token"
                  style={inputStyle}
                  required={!connected}
                />
                <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>
                  Generate at Jenkins &gt; User &gt; Configure &gt; API Token
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: '#D24939',
                  color: '#ffffff',
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
                {loading ? <FaSpinner className="spin" /> : <SiJenkins />}
                {connected ? 'Update Connection' : 'Connect Jenkins'}
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
                      color: '#D24939',
                      border: '1px solid #D24939',
                      borderRadius: '6px',
                      cursor: discovering ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {discovering ? <FaSpinner className="spin" /> : <FaServer />}
                    Discover Resources
                  </button>

                  <button
                    type="button"
                    onClick={handleGetPipelineConfig}
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
                    <FaCog />
                    Get Pipeline Config
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Pipeline Configuration */}
        {pipelineConfig && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Jenkinsfile Configuration
              </h2>
              <button
                onClick={() => copyToClipboard(pipelineConfig)}
                style={{
                  padding: '8px 16px',
                  background: '#1a1a1a',
                  color: '#fec76f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaClipboard /> Copy
              </button>
            </div>
            <pre style={{
              background: '#0f0f0f',
              padding: '16px',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '12px',
              color: '#cccccc',
              margin: 0
            }}>
              {pipelineConfig}
            </pre>
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '8px' }}>Setup Instructions:</h4>
              <ol style={{ fontSize: '12px', color: '#888888', paddingLeft: '20px', margin: 0 }}>
                <li>Store your Nexula API key in Jenkins credentials as 'nexula-api-key'</li>
                <li>Add NEXULA_API_URL environment variable to your Jenkins configuration</li>
                <li>Copy the pipeline snippet to your Jenkinsfile</li>
                <li>Customize scan parameters as needed</li>
              </ol>
            </div>
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
              Jenkins Resources
            </h2>

            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {[
                { key: 'total_jobs', label: 'Total Jobs', color: '#D24939' },
                { key: 'pipelines', label: 'Pipelines', color: '#17a2b8' },
                { key: 'successful_jobs', label: 'Successful', color: '#28a745' },
                { key: 'failed_jobs', label: 'Failed', color: '#dc3545' },
                { key: 'running_jobs', label: 'Running', color: '#ffc107' },
                { key: 'nodes', label: 'Nodes', color: '#6f42c1' },
                { key: 'online_nodes', label: 'Online', color: '#20c997' },
                { key: 'queue_size', label: 'Queue', color: '#fd7e14' }
              ].map(({ key, label, color }) => (
                <div
                  key={key}
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #1a1a1a',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '700', color }}>
                    {resources.summary?.[key] || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888888' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['jobs', 'pipelines', 'nodes', 'queue', 'plugins'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === tab ? '#D24939' : 'transparent',
                    color: activeTab === tab ? '#ffffff' : '#888888',
                    border: activeTab === tab ? 'none' : '1px solid #2a2a2a',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activeTab === 'jobs' && resources.resources?.jobs && (
                <div>
                  {resources.resources.jobs.map((job: any, idx: number) => (
                    <div key={idx} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getStatusColor(job.status)
                          }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                              {job.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888888' }}>
                              {job.description || 'No description'}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: `${getStatusColor(job.status)}20`,
                            color: getStatusColor(job.status),
                            borderRadius: '4px',
                            fontSize: '11px',
                            textTransform: 'uppercase'
                          }}>
                            {job.status}
                          </span>
                          {job.buildable && job.status !== 'running' && (
                            <button
                              onClick={() => handleTriggerBuild(job.name)}
                              disabled={triggering === job.name}
                              style={{
                                padding: '6px 12px',
                                background: '#D24939',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: triggering === job.name ? 'not-allowed' : 'pointer',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {triggering === job.name ? <FaSpinner className="spin" /> : <FaPlay />}
                              Build
                            </button>
                          )}
                        </div>
                      </div>
                      {job.last_build && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1a1a1a' }}>
                          <span style={{ fontSize: '11px', color: '#666666' }}>
                            Last build: #{job.last_build.number} - {job.last_build.result || 'In Progress'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'pipelines' && resources.resources?.pipelines && (
                <div>
                  {resources.resources.pipelines.length > 0 ? (
                    resources.resources.pipelines.map((pipeline: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: getStatusColor(pipeline.status)
                          }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                              {pipeline.name}
                            </div>
                            <span style={{
                              padding: '2px 6px',
                              background: '#17a2b820',
                              color: '#17a2b8',
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}>
                              Pipeline
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
                      No Pipeline jobs found
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nodes' && resources.resources?.nodes && (
                <div>
                  {resources.resources.nodes.map((node: any, idx: number) => (
                    <div key={idx} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FaServer style={{ color: node.offline ? '#dc3545' : '#28a745' }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                              {node.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888888' }}>
                              {node.num_executors} executor(s)
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          background: node.offline ? '#dc354520' : '#28a74520',
                          color: node.offline ? '#dc3545' : '#28a745',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {node.offline ? 'Offline' : 'Online'}
                        </span>
                      </div>
                      {node.offline_reason && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#dc3545' }}>
                          Reason: {node.offline_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'queue' && resources.resources?.queue && (
                <div>
                  {resources.resources.queue.length > 0 ? (
                    resources.resources.queue.map((item: any, idx: number) => (
                      <div key={idx} style={cardStyle}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                          {item.task_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888888' }}>
                          {item.why || 'Waiting in queue'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {item.blocked && (
                            <span style={{ fontSize: '10px', color: '#dc3545' }}>Blocked</span>
                          )}
                          {item.stuck && (
                            <span style={{ fontSize: '10px', color: '#ffc107' }}>Stuck</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
                      Build queue is empty
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plugins' && resources.resources?.plugins && (
                <div>
                  <div style={{ marginBottom: '12px', fontSize: '12px', color: '#888888' }}>
                    {resources.resources.plugins.length} plugins installed
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                    {resources.resources.plugins.slice(0, 20).map((plugin: any, idx: number) => (
                      <div key={idx} style={{
                        ...cardStyle,
                        padding: '12px',
                        marginBottom: 0
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                              {plugin.short_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#666666' }}>
                              v{plugin.version}
                            </div>
                          </div>
                          {plugin.has_update && (
                            <span style={{
                              padding: '2px 6px',
                              background: '#ffc10720',
                              color: '#ffc107',
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}>
                              Update
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
            About Jenkins Integration
          </h3>
          <p style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>
            Integrate Nexula with your Jenkins CI/CD pipelines to automate security scanning.
            Trigger scans on every build, monitor job status, and fail builds when critical
            vulnerabilities are found.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
            <a
              href="https://www.jenkins.io/doc/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#D24939', fontSize: '13px', textDecoration: 'none' }}
            >
              Jenkins Documentation
            </a>
            <a
              href="https://www.jenkins.io/doc/book/pipeline/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#D24939', fontSize: '13px', textDecoration: 'none' }}
            >
              Pipeline Syntax
            </a>
            <a
              href="https://www.jenkins.io/doc/book/managing/api-token/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#D24939', fontSize: '13px', textDecoration: 'none' }}
            >
              API Token Setup
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
