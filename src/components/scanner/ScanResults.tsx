import { useState, useEffect } from 'react';
import { scannerAPI, type ScannerRun, type ScannerFinding } from '../../services/scannerAPI';
import { GrShieldSecurity, GrRobot, GrDocumentText, GrCube, GrSearch } from 'react-icons/gr';
import FindingDetailModal from './FindingDetailModal';
import './UnifiedScanResults.css';

interface ScanResultsProps {
  run: ScannerRun;
}

export default function ScanResults({ run }: ScanResultsProps) {
  const [findings, setFindings] = useState<ScannerFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinding, setSelectedFinding] = useState<ScannerFinding | null>(null);

  useEffect(() => {
    fetchFindings();
  }, [run.id]);

  const fetchFindings = async () => {
    try {
      const response = await scannerAPI.getFindings(run.id);
      setFindings(response.data);
    } catch (err) {
      console.error('Failed to fetch findings');
    } finally {
      setLoading(false);
    }
  };

  const getScannerInfo = () => {
    switch(run.scan_type) {
      case 'vulnerability': return { label: 'Vulnerability Scan', icon: <GrShieldSecurity size={16} />, color: '#3b82f6' };
      case 'llm_rag': return { label: 'LLM/RAG Security', icon: <GrRobot size={16} />, color: '#8b5cf6' };
      case 'model_provenance': return { label: 'Model Provenance', icon: <GrDocumentText size={16} />, color: '#f59e0b' };
      case 'container': return { label: 'Container Security', icon: <GrCube size={16} />, color: '#06b6d4' };
      case 'sast': return { label: 'SAST', icon: <GrSearch size={16} />, color: '#10b981' };
      default: return { label: 'Security Scan', icon: <GrShieldSecurity size={16} />, color: '#3b82f6' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const scannerInfo = getScannerInfo();

  return (
    <div className="unified-scan-results">
      <div className="unified-header">
        <div>
          <h3>{scannerInfo.label} Results</h3>
          <p className="unified-subtitle">
            Scanned project and found {run.total_findings} security findings
          </p>
        </div>
        <div className="unified-stats">
          <div className="stat-item">
            <span className="stat-label">Total Findings</span>
            <span className="stat-value">{run.total_findings}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{run.scan_duration_seconds}s</span>
          </div>
        </div>
      </div>

      <div className="unified-content">
        <div className="scanner-sidebar">
          <div className="sidebar-header">
            <h4>Scanner</h4>
          </div>
          
          <div className="scanner-category-item">
            <button
              className="scanner-category-btn active"
              style={{ borderLeft: `3px solid ${scannerInfo.color}` }}
            >
              <span className="category-icon">{scannerInfo.icon}</span>
              <div className="category-info">
                <span className="category-label">{scannerInfo.label}</span>
                <span className="category-count">{findings.length}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="findings-panel">
          {loading ? (
            <div className="loading-state">Loading findings...</div>
          ) : findings.length === 0 ? (
            <div className="empty-findings">
              <p>No findings detected</p>
            </div>
          ) : (
            <div className="findings-list">
              {findings.map(finding => (
                <div 
                  key={finding.id} 
                  className="finding-card"
                  onClick={() => setSelectedFinding(finding)}
                >
                  <div className="finding-header">
                    <div className="finding-title-row">
                      <span 
                        className="severity-badge"
                        style={{ background: getSeverityColor(finding.severity) }}
                      >
                        {finding.severity}
                      </span>
                      <h4>{finding.title}</h4>
                    </div>
                    <span className="scanner-type-badge">
                      {scannerInfo.icon} 
                      <span style={{ marginLeft: '6px' }}>{run.scan_type}</span>
                    </span>
                  </div>
                  
                  {finding.package_name && (
                    <div className="finding-package">
                      <strong>Package:</strong> {finding.package_name}
                      {finding.package_version && ` (${finding.package_version})`}
                    </div>
                  )}

                  {finding.description && (
                    <p className="finding-description">{finding.description}</p>
                  )}

                  {finding.cve_id && (
                    <div className="finding-meta">
                      <span><strong>CVE:</strong> {finding.cve_id}</span>
                      {finding.cvss_score && (
                        <span><strong>CVSS:</strong> {finding.cvss_score}</span>
                      )}
                    </div>
                  )}

                  {finding.ai_analysis && (
                    <div className="ai-analysis">
                      <strong>🤖 AI Analysis:</strong>
                      <p>{finding.ai_analysis}</p>
                    </div>
                  )}

                  {finding.remediation_steps && (
                    <div className="remediation">
                      <strong>🔧 Remediation:</strong>
                      <p>{finding.remediation_steps}</p>
                    </div>
                  )}

                  {finding.cert_in_advisory_id && (
                    <div className="cert-in-badge">
                      <span>🇮🇳 CERT-IN: {finding.cert_in_advisory_id}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          projectId={run.project_id}
          runId={run.id}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </div>
  );
}
