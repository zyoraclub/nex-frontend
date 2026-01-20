import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaCodeBranch, FaCheckCircle, FaExclamationTriangle, FaEquals } from 'react-icons/fa';
import api from '../services/api';
import './ScanComparison.css';

export default function ScanComparison() {
  const { orgSlug, projectSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fixed');

  const scan1Id = searchParams.get('scan1');
  const scan2Id = searchParams.get('scan2');

  useEffect(() => {
    if (scan1Id && scan2Id) {
      fetchComparison();
    }
  }, [scan1Id, scan2Id]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/compare/${scan1Id}/${scan2Id}`);
      setComparison(response.data);
    } catch (err) {
      console.error('Failed to fetch comparison');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#3b82f6',
      info: '#6b7280'
    };
    return colors[severity?.toLowerCase()] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="comparison-loading">Loading comparison...</div>
      </DashboardLayout>
    );
  }

  if (!comparison) {
    return (
      <DashboardLayout>
        <div className="comparison-error">Failed to load comparison</div>
      </DashboardLayout>
    );
  }

  const { scan1, scan2, comparison: comp } = comparison;

  return (
    <DashboardLayout>
      <div className="comparison-header">
        <div className="comparison-title">
          <FaCodeBranch size={24} />
          <h1>Scan Comparison</h1>
        </div>
      </div>

      <div className="comparison-scans">
        <div className="scan-card">
          <div className="scan-label">Baseline Scan</div>
          <div className="scan-id">#{scan1.id}</div>
          <div className="scan-date">{formatDate(scan1.created_at)}</div>
          <div className="scan-findings">{scan1.total_findings} findings</div>
        </div>
        <div className="comparison-arrow">→</div>
        <div className="scan-card">
          <div className="scan-label">Current Scan</div>
          <div className="scan-id">#{scan2.id}</div>
          <div className="scan-date">{formatDate(scan2.created_at)}</div>
          <div className="scan-findings">{scan2.total_findings} findings</div>
        </div>
      </div>

      <div className="comparison-summary">
        <div className="summary-card fixed">
          <FaCheckCircle size={24} />
          <div className="summary-value">{comp.fixed.count}</div>
          <div className="summary-label">Fixed</div>
        </div>
        <div className="summary-card new">
          <FaExclamationTriangle size={24} />
          <div className="summary-value">{comp.new.count}</div>
          <div className="summary-label">New</div>
        </div>
        <div className="summary-card unchanged">
          <FaEquals size={24} />
          <div className="summary-value">{comp.unchanged.count}</div>
          <div className="summary-label">Unchanged</div>
        </div>
        <div className={`summary-card net ${comp.net_change <= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-value">{comp.net_change > 0 ? '+' : ''}{comp.net_change}</div>
          <div className="summary-label">Net Change</div>
          <div className="summary-percentage">
            {comp.improvement_percentage > 0 ? '+' : ''}{comp.improvement_percentage}%
          </div>
        </div>
      </div>

      <div className="comparison-tabs">
        <button 
          className={activeTab === 'fixed' ? 'active' : ''} 
          onClick={() => setActiveTab('fixed')}
        >
          Fixed ({comp.fixed.count})
        </button>
        <button 
          className={activeTab === 'new' ? 'active' : ''} 
          onClick={() => setActiveTab('new')}
        >
          New ({comp.new.count})
        </button>
        <button 
          className={activeTab === 'unchanged' ? 'active' : ''} 
          onClick={() => setActiveTab('unchanged')}
        >
          Unchanged ({comp.unchanged.count})
        </button>
      </div>

      <div className="comparison-content">
        {activeTab === 'fixed' && (
          <div className="findings-section">
            {comp.fixed.count === 0 ? (
              <div className="findings-empty">No fixed vulnerabilities</div>
            ) : (
              <>
                <div className="severity-summary">
                  {Object.entries(comp.fixed.severity_counts).map(([severity, count]: any) => (
                    count > 0 && (
                      <div key={severity} className="severity-badge" style={{ borderColor: getSeverityColor(severity) }}>
                        <span className="severity-name" style={{ color: getSeverityColor(severity) }}>
                          {severity}
                        </span>
                        <span className="severity-count">{count}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="findings-list">
                  {comp.fixed.findings.map((finding: any, index: number) => (
                    <div key={index} className="finding-item fixed" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="finding-icon">
                        <FaCheckCircle style={{ color: '#22c55e' }} />
                      </div>
                      <div className="finding-content">
                        <div className="finding-header">
                          <span className="finding-title">{finding.title}</span>
                          <span 
                            className="finding-severity" 
                            style={{ backgroundColor: `${getSeverityColor(finding.severity)}20`, color: getSeverityColor(finding.severity) }}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        {finding.description && (
                          <div className="finding-description">{finding.description}</div>
                        )}
                        {finding.file_path && (
                          <div className="finding-location">
                            {finding.file_path}{finding.line_start ? `:${finding.line_start}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <div className="findings-section">
            {comp.new.count === 0 ? (
              <div className="findings-empty">No new vulnerabilities</div>
            ) : (
              <>
                <div className="severity-summary">
                  {Object.entries(comp.new.severity_counts).map(([severity, count]: any) => (
                    count > 0 && (
                      <div key={severity} className="severity-badge" style={{ borderColor: getSeverityColor(severity) }}>
                        <span className="severity-name" style={{ color: getSeverityColor(severity) }}>
                          {severity}
                        </span>
                        <span className="severity-count">{count}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="findings-list">
                  {comp.new.findings.map((finding: any, index: number) => (
                    <div key={index} className="finding-item new" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="finding-icon">
                        <FaExclamationTriangle style={{ color: '#f59e0b' }} />
                      </div>
                      <div className="finding-content">
                        <div className="finding-header">
                          <span className="finding-title">{finding.title}</span>
                          <span 
                            className="finding-severity" 
                            style={{ backgroundColor: `${getSeverityColor(finding.severity)}20`, color: getSeverityColor(finding.severity) }}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        {finding.description && (
                          <div className="finding-description">{finding.description}</div>
                        )}
                        {finding.file_path && (
                          <div className="finding-location">
                            {finding.file_path}{finding.line_start ? `:${finding.line_start}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'unchanged' && (
          <div className="findings-section">
            {comp.unchanged.count === 0 ? (
              <div className="findings-empty">No unchanged vulnerabilities</div>
            ) : (
              <>
                <div className="severity-summary">
                  {Object.entries(comp.unchanged.severity_counts).map(([severity, count]: any) => (
                    count > 0 && (
                      <div key={severity} className="severity-badge" style={{ borderColor: getSeverityColor(severity) }}>
                        <span className="severity-name" style={{ color: getSeverityColor(severity) }}>
                          {severity}
                        </span>
                        <span className="severity-count">{count}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="findings-list">
                  {comp.unchanged.findings.map((finding: any, index: number) => (
                    <div key={index} className="finding-item unchanged" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="finding-icon">
                        <FaEquals style={{ color: '#888888' }} />
                      </div>
                      <div className="finding-content">
                        <div className="finding-header">
                          <span className="finding-title">{finding.title}</span>
                          <span 
                            className="finding-severity" 
                            style={{ backgroundColor: `${getSeverityColor(finding.severity)}20`, color: getSeverityColor(finding.severity) }}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        {finding.description && (
                          <div className="finding-description">{finding.description}</div>
                        )}
                        {finding.file_path && (
                          <div className="finding-location">
                            {finding.file_path}{finding.line_start ? `:${finding.line_start}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
