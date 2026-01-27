import { useState, useEffect } from 'react';
import api from '../services/api';
import './ReportViewer.css';

interface ReportData {
  scan_id: number;
  scan_type: string;
  scan_date: string;
  project_name: string;
  repository_name: string;
  organization_name: string;
  report_type: string;
  report_generated_at: string;
  summary: {
    total_findings: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Array<{
    id: number;
    severity: string;
    title: string;
    package_name: string;
    package_version: string;
    fixed_version: string;
    cve_id: string;
    description: string;
    remediation_steps: string;
  }>;
  compliance_status: string;
}

interface ReportViewerProps {
  scanId: number;
  reportType?: string;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' }
];

export default function ReportViewer({ scanId, reportType = 'cert_in', onClose }: ReportViewerProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [scanId, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/data/${scanId}?report_type=${reportType}`);
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    return colors[severity.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="report-viewer-overlay">
        <div className="report-viewer-modal">
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Loading report...
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="report-viewer-overlay">
        <div className="report-viewer-modal">
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Report not found
          </div>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-viewer-overlay" onClick={onClose}>
      <div className="report-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="report-header">
          <div>
            <h1>Security Compliance Report</h1>
            <p className="report-subtitle">{reportData.report_type.toUpperCase()} - {reportData.organization_name}</p>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Language Selector - Disabled for now */}
        {/* <div className="language-selector">
          <label>Language:</label>
          <select value="en" disabled>
            <option value="en">English</option>
          </select>
          <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>Multi-language support coming soon</span>
        </div> */}

        {/* Report Content */}
        <div className="report-content">
          {/* Metadata */}
          <div className="report-section">
            <h2>Report Information</h2>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">Scan ID:</span>
                <span className="value">{reportData.scan_id}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Project:</span>
                <span className="value">{reportData.project_name}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Scan Date:</span>
                <span className="value">{new Date(reportData.scan_date).toLocaleString()}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${reportData.compliance_status.toLowerCase()}`}>
                  {reportData.compliance_status}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="report-section">
            <h2>Executive Summary</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-number">{reportData.summary.total_findings}</div>
                <div className="summary-label">Total Findings</div>
              </div>
              <div className="summary-card critical">
                <div className="summary-number">{reportData.summary.critical}</div>
                <div className="summary-label">Critical</div>
              </div>
              <div className="summary-card high">
                <div className="summary-number">{reportData.summary.high}</div>
                <div className="summary-label">High</div>
              </div>
              <div className="summary-card medium">
                <div className="summary-number">{reportData.summary.medium}</div>
                <div className="summary-label">Medium</div>
              </div>
              <div className="summary-card low">
                <div className="summary-number">{reportData.summary.low}</div>
                <div className="summary-label">Low</div>
              </div>
            </div>
          </div>

          {/* Findings */}
          <div className="report-section">
            <h2>Detailed Findings ({reportData.findings.length})</h2>
            {reportData.findings.length === 0 ? (
              <div className="no-findings">
                ✓ No security vulnerabilities found
              </div>
            ) : (
              <div className="findings-list">
                {reportData.findings.map((finding, index) => (
                  <div key={finding.id} className="finding-card">
                    <div className="finding-header">
                      <span 
                        className="severity-badge" 
                        style={{ backgroundColor: getSeverityColor(finding.severity) }}
                      >
                        {finding.severity}
                      </span>
                      <span className="finding-number">#{index + 1}</span>
                    </div>
                    <h3 className="finding-title">{finding.title}</h3>
                    {finding.cve_id && (
                      <div className="cve-id">CVE: {finding.cve_id}</div>
                    )}
                    <div className="finding-details">
                      <div className="detail-row">
                        <span className="detail-label">Package:</span>
                        <span className="detail-value">{finding.package_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Current Version:</span>
                        <span className="detail-value">{finding.package_version || 'Unknown'}</span>
                      </div>
                      {finding.fixed_version && (
                        <div className="detail-row">
                          <span className="detail-label">Fixed Version:</span>
                          <span className="detail-value fix">{finding.fixed_version}</span>
                        </div>
                      )}
                    </div>
                    {finding.description && (
                      <div className="finding-description">
                        <strong>Description:</strong> {finding.description}
                      </div>
                    )}
                    {finding.remediation_steps && (
                      <div className="remediation">
                        <strong>Remediation:</strong> {finding.remediation_steps}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="report-footer">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button className="btn-primary">Export to PDF</button>
        </div>
      </div>
    </div>
  );
}
