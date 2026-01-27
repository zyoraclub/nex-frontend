import { useState, useEffect } from 'react';
import { GrShield, GrCheckmark, GrClose, GrAdd } from 'react-icons/gr';
import './ModelFingerprinting.css';

interface Fingerprint {
  id: number;
  model_name: string;
  fingerprint_hash: string;
  framework: string;
  framework_version: string;
  model_type: string;
  model_size_bytes: number;
  status: string;
  is_production: boolean;
  verification_count: number;
  last_verified_at: string | null;
  created_at: string;
  compliance_frameworks: string[];
}

interface ModelFingerprintingProps {
  projectId: number;
}

export function ModelFingerprinting({ projectId }: ModelFingerprintingProps) {
  const [fingerprints, setFingerprints] = useState<Fingerprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFingerprint, setSelectedFingerprint] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchFingerprints();
  }, [projectId]);

  const fetchFingerprints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/fingerprinting/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFingerprints(data.fingerprints || []);
      }
    } catch (err) {
      console.error('Failed to fetch fingerprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/fingerprinting/projects/${projectId}/auto-generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert(`✅ ${data.message}`);
          fetchFingerprints();
        } else {
          alert(`⚠️ ${data.message}`);
        }
      } else {
        alert('Failed to generate fingerprints');
      }
    } catch (err) {
      console.error('Failed to auto-generate:', err);
      alert('Error generating fingerprints');
    } finally {
      setGenerating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'revoked': return '#ef4444';
      case 'superseded': return '#f59e0b';
      default: return '#888888';
    }
  };

  if (loading) {
    return (
      <div className="fingerprinting-loading">
        <div className="loading-spinner"></div>
        <p>Loading fingerprints...</p>
      </div>
    );
  }

  return (
    <div className="fingerprinting-container">
      <div className="fingerprinting-header">
        <div>
          <h2>Model Fingerprinting</h2>
          <p className="fingerprinting-subtitle">
            Automatically generated from AIBOM scan results
          </p>
        </div>
        <button 
          className="btn-generate" 
          onClick={handleAutoGenerate}
          disabled={generating}
        >
          <GrAdd size={14} />
          <span>{generating ? 'Generating...' : 'Auto-Generate from AIBOM'}</span>
        </button>
      </div>

      {fingerprints.length === 0 ? (
        <div className="fingerprinting-empty">
          <GrShield size={48} color="#333333" />
          <p>No fingerprints generated yet</p>
          <span>Generate fingerprints automatically from your AIBOM scan</span>
          <button 
            className="btn-generate-empty" 
            onClick={handleAutoGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Auto-Generate from AIBOM'}
          </button>
        </div>
      ) : (
        <div className="fingerprints-grid">
          {fingerprints.map((fp) => (
            <div 
              key={fp.id} 
              className="fingerprint-card"
              onClick={() => setSelectedFingerprint(fp.id)}
            >
              <div className="fingerprint-card-header">
                <div className="fingerprint-icon">
                  <GrShield size={20} color="#fec76f" />
                </div>
                <div className="fingerprint-status">
                  <span 
                    className="status-dot" 
                    style={{ background: getStatusColor(fp.status) }}
                  ></span>
                  <span className="status-text">{fp.status}</span>
                </div>
              </div>

              <h3 className="fingerprint-name">{fp.model_name}</h3>
              
              <div className="fingerprint-hash">
                <span className="hash-label">Fingerprint</span>
                <code className="hash-value">{fp.fingerprint_hash.substring(0, 16)}...</code>
              </div>

              <div className="fingerprint-meta">
                <div className="meta-item">
                  <span className="meta-label">Framework</span>
                  <span className="meta-value">{fp.framework || 'Unknown'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Type</span>
                  <span className="meta-value">{fp.model_type || 'N/A'}</span>
                </div>
              </div>

              <div className="fingerprint-stats">
                <div className="stat-item">
                  <span className="stat-value">{fp.verification_count}</span>
                  <span className="stat-label">Verifications</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{formatDate(fp.last_verified_at)}</span>
                  <span className="stat-label">Last Verified</span>
                </div>
              </div>

              {fp.is_production && (
                <div className="production-badge">
                  <GrCheckmark size={12} />
                  <span>Production</span>
                </div>
              )}

              {fp.compliance_frameworks && fp.compliance_frameworks.length > 0 && (
                <div className="compliance-tags">
                  {fp.compliance_frameworks.map((framework, idx) => (
                    <span key={idx} className="compliance-tag">{framework}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedFingerprint && (
        <FingerprintDetails
          fingerprintId={selectedFingerprint}
          onClose={() => setSelectedFingerprint(null)}
          onRefresh={fetchFingerprints}
        />
      )}
    </div>
  );
}

// Fingerprint Details Modal Component
function FingerprintDetails({ fingerprintId, onClose, onRefresh }: any) {
  const [details, setDetails] = useState<any>(null);
  const [lineage, setLineage] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'lineage' | 'verifications'>('details');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    fetchLineage();
    fetchVerifications();
  }, [fingerprintId]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/fingerprinting/${fingerprintId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLineage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/fingerprinting/${fingerprintId}/lineage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLineage(data.lineage_chain || []);
      }
    } catch (err) {
      console.error('Failed to fetch lineage:', err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/fingerprinting/${fingerprintId}/verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    }
  };

  if (loading || !details) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fingerprint-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{details.model_name}</h2>
          <button className="btn-close" onClick={onClose}>
            <GrClose size={16} />
          </button>
        </div>

        <div className="details-tabs">
          <button 
            className={`details-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`details-tab ${activeTab === 'lineage' ? 'active' : ''}`}
            onClick={() => setActiveTab('lineage')}
          >
            Lineage ({lineage.length})
          </button>
          <button 
            className={`details-tab ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifications')}
          >
            Verifications ({verifications.length})
          </button>
        </div>

        <div className="details-content">
          {activeTab === 'details' && (
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Fingerprint Hash</span>
                <code className="detail-value hash">{details.fingerprint_hash}</code>
              </div>
              <div className="detail-item">
                <span className="detail-label">Algorithm</span>
                <span className="detail-value">{details.algorithm}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Framework</span>
                <span className="detail-value">{details.framework} {details.framework_version}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Model Type</span>
                <span className="detail-value">{details.model_type || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{details.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Production</span>
                <span className="detail-value">{details.is_production ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}

          {activeTab === 'lineage' && (
            <div className="lineage-list">
              {lineage.length === 0 ? (
                <div className="empty-state-small">No lineage entries</div>
              ) : (
                lineage.map((entry, idx) => (
                  <div key={entry.id} className="lineage-item">
                    <div className="lineage-icon">{idx + 1}</div>
                    <div className="lineage-content">
                      <div className="lineage-type">{entry.parent_type}</div>
                      <div className="lineage-name">{entry.parent_name}</div>
                      {entry.parent_fingerprint && (
                        <code className="lineage-hash">{entry.parent_fingerprint.substring(0, 16)}...</code>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="verifications-list">
              {verifications.length === 0 ? (
                <div className="empty-state-small">No verifications yet</div>
              ) : (
                verifications.map((v) => (
                  <div key={v.id} className={`verification-item ${v.verification_result}`}>
                    <div className="verification-header">
                      <span className={`verification-result ${v.verification_result}`}>
                        {v.verification_result === 'pass' ? <GrCheckmark size={14} /> : <GrClose size={14} />}
                        {v.verification_result}
                      </span>
                      <span className="verification-date">{new Date(v.verified_at).toLocaleString()}</span>
                    </div>
                    <div className="verification-meta">
                      <span>Type: {v.verification_type}</span>
                      {v.environment && <span>Env: {v.environment}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
