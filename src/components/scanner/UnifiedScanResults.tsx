import { useState, useEffect } from 'react';
import { type ScannerRun, type ScannerFinding } from '../../services/scannerAPI';
import { scannerAPI } from '../../services/scannerAPI';
import { GrShieldSecurity, GrRobot, GrDocumentText, GrCube, GrSearch, GrStatusGood } from 'react-icons/gr';
import FindingDetailModal from './FindingDetailModal';
import './UnifiedScanResults.css';

interface UnifiedScanResultsProps {
  run: ScannerRun;
}

export default function UnifiedScanResults({ run }: UnifiedScanResultsProps) {
  const [findings, setFindings] = useState<ScannerFinding[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<string>('all');
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

  const orchestratorDecision = typeof run.orchestrator_decision === 'string' 
    ? JSON.parse(run.orchestrator_decision) 
    : (run.orchestrator_decision || {});
  const scannersRun = orchestratorDecision.scanners_to_run || [];
  const reasoning = orchestratorDecision.reasoning || {};
  const skipped = orchestratorDecision.skipped || [];
  const skipReasons = orchestratorDecision.skip_reasons || {};

  console.log('Orchestrator Decision:', orchestratorDecision);
  console.log('Scanners Run:', scannersRun);

  const scannerCategories = [
    { id: 'vulnerability', label: 'Vulnerability', icon: <GrShieldSecurity size={16} />, color: '#3b82f6' },
    { id: 'llm_rag', label: 'LLM/RAG', icon: <GrRobot size={16} />, color: '#8b5cf6' },
    { id: 'model_provenance', label: 'Model Provenance', icon: <GrDocumentText size={16} />, color: '#f59e0b' },
    { id: 'container', label: 'Container', icon: <GrCube size={16} />, color: '#06b6d4' },
    { id: 'sast', label: 'SAST', icon: <GrSearch size={16} />, color: '#10b981' }
  ];

  const filteredFindings = selectedScanner === 'all' 
    ? findings 
    : findings.filter(f => f.scanner_type === selectedScanner);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const getCategoryStats = (scannerType: string) => {
    const categoryFindings = findings.filter(f => f.scanner_type === scannerType);
    const critical = categoryFindings.filter(f => f.severity.toLowerCase() === 'critical').length;
    const high = categoryFindings.filter(f => f.severity.toLowerCase() === 'high').length;
    const medium = categoryFindings.filter(f => f.severity.toLowerCase() === 'medium').length;
    const low = categoryFindings.filter(f => f.severity.toLowerCase() === 'low').length;
    return { total: categoryFindings.length, critical, high, medium, low };
  };

  return (
    <div className="unified-scan-results">
      <div className="unified-header">
        <div>
          <h3>Unified Security Scan Results</h3>
          <p className="unified-subtitle">
            Intelligent orchestrator analyzed AIBOM and ran {scannersRun.length} relevant scanners
          </p>
        </div>
        <div className="unified-stats">
          <div className="stat-item">
            <span className="stat-label">Total Findings</span>
            <span className="stat-value">{run.total_findings}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Scanners Run</span>
            <span className="stat-value">{scannersRun.length}/5</span>
          </div>
        </div>
      </div>

      <div className="unified-content">
        <div className="scanner-sidebar">
          <div className="sidebar-header">
            <h4>Scanners</h4>
          </div>
          
          <button
            className={`scanner-category-btn ${selectedScanner === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedScanner('all')}
          >
            <span className="category-icon"><GrStatusGood size={16} /></span>
            <div className="category-info">
              <span className="category-label">All Findings</span>
              <span className="category-count">{findings.length}</span>
            </div>
          </button>

          {scannerCategories.map(category => {
            const stats = getCategoryStats(category.id);
            const wasRun = scannersRun.includes(category.id);
            const wasSkipped = skipped.includes(category.id);

            return (
              <div key={category.id} className="scanner-category-item">
                <button
                  className={`scanner-category-btn ${selectedScanner === category.id ? 'active' : ''} ${!wasRun ? 'disabled' : ''}`}
                  onClick={() => wasRun && setSelectedScanner(category.id)}
                  disabled={!wasRun}
                  style={{ borderLeft: `3px solid ${category.color}` }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-info">
                    <span className="category-label">{category.label}</span>
                    {wasRun && <span className="category-count">{stats.total}</span>}
                    {wasSkipped && <span className="category-skipped">Skipped</span>}
                  </div>
                </button>
                {wasRun && reasoning[category.id] && (
                  <div className="category-reason">
                    <span className="reason-icon">✓</span>
                    <span className="reason-text">{reasoning[category.id]}</span>
                  </div>
                )}
                {wasSkipped && skipReasons[category.id] && (
                  <div className="category-reason skipped">
                    <span className="reason-icon">⊘</span>
                    <span className="reason-text">{skipReasons[category.id]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="findings-panel">
          {loading ? (
            <div className="loading-state">Loading findings...</div>
          ) : filteredFindings.length === 0 ? (
            <div className="empty-findings">
              <p>No findings in this category</p>
            </div>
          ) : (
            <div className="findings-list">
              {filteredFindings.map(finding => (
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
                      {scannerCategories.find(c => c.id === finding.scanner_type)?.icon} 
                      <span style={{ marginLeft: '6px' }}>{finding.scanner_type}</span>
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
