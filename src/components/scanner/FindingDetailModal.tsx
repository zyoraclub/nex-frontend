import { useState } from 'react';
import { GrClose, GrShieldSecurity, GrStatusWarning, GrStatusGood, GrCode } from 'react-icons/gr';
import ReactMarkdown from 'react-markdown';
import type { ScannerFinding } from '../../services/scannerAPI';
import { CodeViewer } from './CodeViewer';
import './FindingDetailModal.css';

interface FindingDetailModalProps {
  finding: ScannerFinding;
  onClose: () => void;
  projectId?: number;
  runId?: number;
}

export default function FindingDetailModal({ finding, onClose, projectId, runId }: FindingDetailModalProps) {
  const [creatingPR, setCreatingPR] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [existingPR, setExistingPR] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const handleCreatePR = async () => {
    if (!projectId || !runId) return;
    
    setCreatingPR(true);
    setPrError(null);
    
    try {
      // Fetch GitHub token from user's integrations
      const integrationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/integrations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!integrationsResponse.ok) {
        setPrError('Failed to fetch integrations');
        setCreatingPR(false);
        return;
      }
      
      const integrations = await integrationsResponse.json();
      const githubIntegration = integrations.find((i: any) => i.integration_type === 'github');
      
      if (!githubIntegration || !githubIntegration.config?.access_token) {
        setPrError('GitHub not connected. Please connect GitHub in Integrations.');
        setCreatingPR(false);
        return;
      }
      
      const token = githubIntegration.config.access_token;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/remediation/create-pr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          project_id: projectId,
          run_id: runId,
          github_token: token
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPrUrl(data.pr_url);
        if (data.already_exists) {
          setExistingPR(true);
        }
      } else {
        setPrError(data.error || 'Failed to create PR');
      }
    } catch (error) {
      setPrError('Network error. Please try again.');
    } finally {
      setCreatingPR(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '⚠️';
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const formatText = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, idx) => {
      // Check if it's a list item
      if (para.match(/^[\d\-\*•]/)) {
        const items = para.split('\n').filter(line => line.trim());
        return (
          <ul key={idx} className="formatted-list">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[\d\-\*•]\s*\.?\s*/, '')}</li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a bold header
      if (para.startsWith('**') && para.includes(':**')) {
        const [header, ...content] = para.split(':**');
        return (
          <div key={idx} className="formatted-section">
            <strong>{header.replace(/\*\*/g, '')}:</strong>
            <span>{content.join(':**')}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return <p key={idx} className="formatted-para">{para}</p>;
    });
  };

  return (
    <>
      {showCodeViewer && (
        <CodeViewer 
          finding={{ ...finding, project_id: projectId }} 
          onClose={() => setShowCodeViewer(false)} 
        />
      )}
      
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span 
              className="modal-severity-badge"
              style={{ background: getSeverityColor(finding.severity) }}
            >
              {getSeverityIcon(finding.severity)} {finding.severity}
            </span>
            <h2>{finding.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {finding.scanner_type === 'sast' && finding.package_name && (
              <button 
                className="btn-view-code"
                onClick={() => setShowCodeViewer(true)}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <GrCode size={16} /> View Code
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <GrClose size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Overview Section */}
          <div className="modal-section">
            <div className="section-header">
              <GrShieldSecurity size={16} />
              <h3>Overview</h3>
            </div>
            <div className="section-content">
              {finding.description && <p>{finding.description}</p>}
              
              {finding.package_name && (
                <div className="info-row">
                  <span className="info-label">Package:</span>
                  <span className="info-value">
                    {finding.package_name}
                    {finding.package_version && finding.package_version !== 'unknown' && ` (${finding.package_version})`}
                    {(!finding.package_version || finding.package_version === 'unknown') && ' (unspecified)'}
                  </span>
                </div>
              )}

              {finding.cve_id && (
                <div className="info-row">
                  <span className="info-label">CVE ID:</span>
                  <span className="info-value">{finding.cve_id}</span>
                </div>
              )}

              {finding.cvss_score && (
                <div className="info-row">
                  <span className="info-label">CVSS Score:</span>
                  <span className="info-value cvss-score">{finding.cvss_score}</span>
                </div>
              )}

              {finding.cwe_id && (
                <div className="info-row">
                  <span className="info-label">CWE ID:</span>
                  <span className="info-value">{finding.cwe_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Section */}
          {finding.ai_analysis && (
            <div className="modal-section">
              <div className="section-header">
                <GrStatusWarning size={16} />
                <h3>AI Security Analysis</h3>
              </div>
              <div className="section-content ai-analysis-content">
                <ReactMarkdown>{finding.ai_analysis}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Remediation Section */}
          {(finding.remediation_steps || finding.fixed_version) && (
            <div className="modal-section">
              <div className="section-header">
                <GrStatusGood size={16} />
                <h3>Remediation Steps</h3>
              </div>
              <div className="section-content remediation-content">
                {finding.remediation_steps && (
                  <ReactMarkdown>{finding.remediation_steps}</ReactMarkdown>
                )}
                
                {!finding.remediation_steps && finding.fixed_version && (
                  <p>Upgrade to the fixed version to resolve this vulnerability.</p>
                )}
                
                {finding.fixed_version && (
                  <div className="fixed-version-box">
                    <strong>Upgrade to:</strong> {finding.package_name}=={finding.fixed_version}
                  </div>
                )}
                
                {finding.fixed_version && projectId && runId && (
                  <div className="pr-action-section">
                    {!prUrl && !prError && (
                      <button 
                        className="btn-create-pr"
                        onClick={handleCreatePR}
                        disabled={creatingPR}
                      >
                        {creatingPR ? 'Creating PR...' : '🚀 Create Fix PR'}
                      </button>
                    )}
                    
                    {prUrl && (
                      <div className="pr-success">
                        {existingPR ? '✅ PR already exists: ' : '✅ PR created successfully! '}
                        <a href={prUrl} target="_blank" rel="noopener noreferrer">View PR</a>
                      </div>
                    )}
                    
                    {prError && (
                      <div className="pr-error">
                        ❌ {prError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Version Details */}
          {(finding.package_version || finding.fixed_version || finding.affected_component) && (
            <div className="modal-section">
              <div className="section-header">
                <h3>Version Details</h3>
              </div>
              <div className="section-content version-details">
                {finding.package_version && finding.package_version !== 'unknown' && (
                  <div className="version-row">
                    <span className="version-label">Current Version:</span>
                    <span className="version-value current">{finding.package_version}</span>
                  </div>
                )}
                {(!finding.package_version || finding.package_version === 'unknown') && (
                  <div className="version-row">
                    <span className="version-label">Current Version:</span>
                    <span className="version-value current">unspecified</span>
                  </div>
                )}
                {finding.fixed_version && (
                  <div className="version-row">
                    <span className="version-label">Fixed Version:</span>
                    <span className="version-value fixed">{finding.fixed_version}</span>
                  </div>
                )}
                {finding.affected_component && (
                  <div className="version-row">
                    <span className="version-label">Affected Component:</span>
                    <span className="version-value">{finding.affected_component}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CERT-IN Advisory */}
          {finding.cert_in_advisory_id && (
            <div className="modal-section cert-in-section">
              <div className="section-header">
                <h3>🇮🇳 CERT-IN Advisory</h3>
              </div>
              <div className="section-content">
                <div className="info-row">
                  <span className="info-label">Advisory ID:</span>
                  <span className="info-value">{finding.cert_in_advisory_id}</span>
                </div>
                {finding.cert_in_severity && (
                  <div className="info-row">
                    <span className="info-label">CERT-IN Severity:</span>
                    <span className="info-value">{finding.cert_in_severity}</span>
                  </div>
                )}
                {finding.cert_in_directive && (
                  <div className="cert-in-directive">
                    <strong>Directive:</strong>
                    <p>{finding.cert_in_directive}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
