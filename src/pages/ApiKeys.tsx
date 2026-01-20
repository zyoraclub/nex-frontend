import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaKey, FaCopy, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  total_requests: number;
  created_at: string;
  expires_at: string | null;
}

export default function ApiKeys() {
  const { orgSlug } = useParams();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['full:access']);
  const [availableScopes, setAvailableScopes] = useState<any[]>([]);
  const [generatedKey, setGeneratedKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKeys();
    fetchScopes();
  }, []);

  const fetchScopes = async () => {
    try {
      const response = await api.get('/api-keys/scopes');
      setAvailableScopes(response.data.scopes || []);
    } catch (err) {
      console.error('Failed to fetch scopes');
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/api-keys');
      setApiKeys(response.data || []);
    } catch (err) {
      console.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || selectedScopes.length === 0) return;
    try {
      const response = await api.post('/api-keys', { 
        name: newKeyName,
        scopes: selectedScopes,
        rate_limit_per_minute: 60,
        rate_limit_per_hour: 1000
      });
      setGeneratedKey(response.data.key);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      alert('Failed to create API key');
    }
  };

  const toggleScope = (scope: string) => {
    if (scope === 'full:access') {
      setSelectedScopes(['full:access']);
    } else {
      const newScopes = selectedScopes.filter(s => s !== 'full:access');
      if (newScopes.includes(scope)) {
        setSelectedScopes(newScopes.filter(s => s !== scope));
      } else {
        setSelectedScopes([...newScopes, scope]);
      }
    }
  };

  const handleDeleteKey = async (id: number) => {
    if (!confirm('Delete this API key? Applications using it will lose access.')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      fetchApiKeys();
    } catch (err) {
      alert('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const toggleKeyVisibility = (id: number) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 16) return key;
    return key.substring(0, 8) + '•'.repeat(32) + key.substring(key.length - 8);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
            API Keys
          </h1>
          <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>
            Generate API keys to integrate Nexula into your applications
          </p>
        </div>

        <div style={{
          background: 'rgba(254, 199, 111, 0.1)',
          border: '1px solid rgba(254, 199, 111, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fec76f', margin: '0 0 8px 0' }}>
            🔐 API Integration
          </h3>
          <p style={{ fontSize: '13px', color: '#cccccc', margin: '0 0 12px 0' }}>
            Use API keys to programmatically trigger scans, fetch results, and manage projects from your applications.
          </p>
          <a 
            href="/api-docs" 
            target="_blank"
            style={{ fontSize: '13px', color: '#fec76f', textDecoration: 'underline' }}
          >
            View API Documentation →
          </a>
        </div>

        <button
          onClick={() => setShowNewKeyModal(true)}
          style={{
            padding: '12px 24px',
            background: '#fec76f',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaKey />
          Generate New API Key
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888888' }}>Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <FaKey style={{ fontSize: '48px', color: '#2a2a2a', marginBottom: '16px' }} />
            <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>
              No API keys yet. Generate one to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apiKeys.map((key) => (
              <div
                key={key.id}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                      {key.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#666666', margin: 0 }}>
                      Created {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                      {' • '}{key.total_requests} requests
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {key.scopes.map(scope => (
                        <span key={scope} style={{
                          padding: '2px 8px',
                          background: '#1a1a1a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#888888'
                        }}>
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: '1px solid #2a2a2a',
                      borderRadius: '6px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <FaTrash size={12} />
                    Delete
                  </button>
                </div>
                <div style={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <code style={{ flex: 1, fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>
                    {visibleKeys.has(key.id) ? key.key_prefix : maskKey(key.key_prefix)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(key.id)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#888888',
                      cursor: 'pointer'
                    }}
                  >
                    {visibleKeys.has(key.id) ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key_prefix)}
                    title="Copy key prefix (full key only shown once at creation)"
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#888888',
                      cursor: 'pointer'
                    }}
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Key Modal */}
        {showNewKeyModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%'
            }}>
              {generatedKey ? (
                <>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
                    API Key Generated
                  </h2>
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '6px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ fontSize: '13px', color: '#22c55e', margin: '0 0 12px 0', fontWeight: '600' }}>
                      ⚠️ Save this key now! You won't be able to see it again.
                    </p>
                    <div style={{
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <code style={{ flex: 1, fontSize: '12px', color: '#ffffff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {generatedKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedKey)}
                        style={{
                          padding: '6px 12px',
                          background: '#fec76f',
                          color: '#0a0a0a',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setGeneratedKey('');
                      setShowNewKeyModal(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#fec76f',
                      color: '#0a0a0a',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
                    Generate API Key
                  </h2>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '8px' }}>
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production API, CI/CD Pipeline"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#888888', marginBottom: '8px' }}>
                      Permissions
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {availableScopes.map(scope => (
                        <label key={scope.name} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          background: selectedScopes.includes(scope.name) ? '#1a1a1a' : 'transparent',
                          border: '1px solid #2a2a2a',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(scope.name)}
                            onChange={() => toggleScope(scope.name)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>
                              {scope.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#666666' }}>
                              {scope.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setShowNewKeyModal(false);
                        setNewKeyName('');
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: '1px solid #2a2a2a',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || selectedScopes.length === 0}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: (newKeyName.trim() && selectedScopes.length > 0) ? '#fec76f' : '#2a2a2a',
                        color: (newKeyName.trim() && selectedScopes.length > 0) ? '#0a0a0a' : '#666666',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: (newKeyName.trim() && selectedScopes.length > 0) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
