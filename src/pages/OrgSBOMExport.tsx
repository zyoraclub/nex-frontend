import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import './OrgSBOMExport.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProjectInfo {
  id: number;
  name: string;
  has_aibom: boolean;
}

interface ComponentSummary {
  total: number;
  frameworks: number;
  dependencies: number;
  models: number;
  datasets: number;
  scripts: number;
  infrastructure: number;
  cloud_resources: number;
}

interface OrgSummary {
  organization: { id: number; name: string };
  project_summary: {
    total_projects: number;
    projects_with_aibom: number;
    projects_without_aibom: number;
  };
  component_summary: ComponentSummary;
  vulnerability_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance_status: {
    us_executive_order: boolean;
    eu_ai_act: boolean;
    coverage_percentage: number;
  };
  exportable_projects: ProjectInfo[];
}

interface ComplianceReport {
  organization: { id: number; name: string };
  report_generated_at: string;
  overall_compliance: {
    sbom_coverage_percentage: number;
    average_ntia_score: number;
    us_executive_order_ready: boolean;
    eu_ai_act_ready: boolean;
    ntia_compliant: boolean;
  };
  requirements: {
    us_executive_order: { name: string; requirement: string; status: string; gap: string | null };
    eu_ai_act: { name: string; requirement: string; status: string; gap: string | null };
    ntia_sbom: { name: string; requirement: string; status: string; score: number };
  };
  project_details: any[];
  recommendations: any[];
}

const OrgSBOMExport: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<OrgSummary | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'export' | 'compliance'>('overview');

  // Export options
  const [selectedFormat, setSelectedFormat] = useState<string>('cyclonedx-json');
  const [exportType, setExportType] = useState<'individual' | 'combined'>('individual');
  const [includeVulnerabilities, setIncludeVulnerabilities] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orgSlug]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Get org ID from slug
      const orgsRes = await axios.get(`${API_URL}/api/v1/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const org = orgsRes.data.find(
        (o: any) => o.slug === orgSlug || o.name.toLowerCase().replace(/\s+/g, '-') === orgSlug
      );

      if (!org) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      // Fetch summary and compliance in parallel
      const [summaryRes, complianceRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/sbom/organization/${org.id}/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/sbom/organization/${org.id}/compliance-report`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data);
      setComplianceReport(complianceRes.data);

      // Select all exportable projects by default
      const exportable = summaryRes.data.exportable_projects
        .filter((p: ProjectInfo) => p.has_aibom)
        .map((p: ProjectInfo) => p.id);
      setSelectedProjects(exportable);

    } catch (err: any) {
      console.error('Failed to fetch org SBOM data:', err);
      setError('Failed to load organization SBOM data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && summary) {
      const exportable = summary.exportable_projects
        .filter(p => p.has_aibom)
        .map(p => p.id);
      setSelectedProjects(exportable);
    } else {
      setSelectedProjects([]);
    }
  };

  const handleProjectToggle = (projectId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
      setSelectAll(false);
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const handleExport = async () => {
    if (!summary || selectedProjects.length === 0) return;

    setExporting(true);
    setExportSuccess(false);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/api/v1/sbom/organization/${summary.organization.id}/export`,
        {
          format: selectedFormat,
          include_vulnerabilities: includeVulnerabilities,
          project_ids: selectAll ? null : selectedProjects,
          export_type: exportType
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Get filename from headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${summary.organization.name}_sbom_export.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) filename = match[1];
      }

      // Download file
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
    } catch (err: any) {
      console.error('Export failed:', err);
      setError('Failed to export SBOM. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="org-sbom-loading">Loading organization SBOM data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="org-sbom-container">
        <div className="org-sbom-header">
          <h1>Organization SBOM Export</h1>
          <p>Export AI Bills of Materials across all projects for enterprise compliance</p>
        </div>

        {error && (
          <div className="org-sbom-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {summary && (
          <>
            {/* Tabs */}
            <div className="org-sbom-tabs">
              <button
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={activeTab === 'export' ? 'active' : ''}
                onClick={() => setActiveTab('export')}
              >
                Export
              </button>
              <button
                className={activeTab === 'compliance' ? 'active' : ''}
                onClick={() => setActiveTab('compliance')}
              >
                Compliance Report
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                {/* Compliance Status Cards */}
                <div className="compliance-cards">
                  <div className={`compliance-card ${summary.compliance_status.us_executive_order ? 'compliant' : 'non-compliant'}`}>
                    <div className="card-icon">🇺🇸</div>
                    <div className="card-content">
                      <h4>US Executive Order on AI</h4>
                      <span className={`status ${summary.compliance_status.us_executive_order ? 'compliant' : 'non-compliant'}`}>
                        {summary.compliance_status.us_executive_order ? 'Compliant' : 'Action Required'}
                      </span>
                    </div>
                  </div>
                  <div className={`compliance-card ${summary.compliance_status.eu_ai_act ? 'compliant' : 'non-compliant'}`}>
                    <div className="card-icon">🇪🇺</div>
                    <div className="card-content">
                      <h4>EU AI Act</h4>
                      <span className={`status ${summary.compliance_status.eu_ai_act ? 'compliant' : 'non-compliant'}`}>
                        {summary.compliance_status.eu_ai_act ? 'Compliant' : 'Action Required'}
                      </span>
                    </div>
                  </div>
                  <div className="compliance-card coverage">
                    <div className="card-icon">📊</div>
                    <div className="card-content">
                      <h4>SBOM Coverage</h4>
                      <span className="coverage-value">{summary.compliance_status.coverage_percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="summary-section">
                  <h3>Project Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="value">{summary.project_summary.total_projects}</span>
                      <span className="label">Total Projects</span>
                    </div>
                    <div className="summary-item success">
                      <span className="value">{summary.project_summary.projects_with_aibom}</span>
                      <span className="label">With AIBOM</span>
                    </div>
                    <div className="summary-item warning">
                      <span className="value">{summary.project_summary.projects_without_aibom}</span>
                      <span className="label">Missing AIBOM</span>
                    </div>
                  </div>
                </div>

                {/* Component Summary */}
                <div className="summary-section">
                  <h3>Total Components Across Organization</h3>
                  <div className="component-grid">
                    <div className="component-item">
                      <span className="value">{summary.component_summary.total}</span>
                      <span className="label">Total</span>
                    </div>
                    <div className="component-item">
                      <span className="value">{summary.component_summary.frameworks}</span>
                      <span className="label">Frameworks</span>
                    </div>
                    <div className="component-item">
                      <span className="value">{summary.component_summary.dependencies}</span>
                      <span className="label">Dependencies</span>
                    </div>
                    <div className="component-item">
                      <span className="value">{summary.component_summary.models}</span>
                      <span className="label">Models</span>
                    </div>
                    <div className="component-item">
                      <span className="value">{summary.component_summary.datasets}</span>
                      <span className="label">Datasets</span>
                    </div>
                    <div className="component-item">
                      <span className="value">{summary.component_summary.cloud_resources}</span>
                      <span className="label">Cloud Resources</span>
                    </div>
                  </div>
                </div>

                {/* Vulnerability Summary */}
                <div className="summary-section">
                  <h3>Vulnerability Summary</h3>
                  <div className="vuln-grid">
                    <div className="vuln-item critical">
                      <span className="value">{summary.vulnerability_summary.critical}</span>
                      <span className="label">Critical</span>
                    </div>
                    <div className="vuln-item high">
                      <span className="value">{summary.vulnerability_summary.high}</span>
                      <span className="label">High</span>
                    </div>
                    <div className="vuln-item medium">
                      <span className="value">{summary.vulnerability_summary.medium}</span>
                      <span className="label">Medium</span>
                    </div>
                    <div className="vuln-item low">
                      <span className="value">{summary.vulnerability_summary.low}</span>
                      <span className="label">Low</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="tab-content">
                {/* Format Selection */}
                <div className="export-section">
                  <h3>Export Format</h3>
                  <div className="format-options">
                    {[
                      { id: 'cyclonedx-json', name: 'CycloneDX ML JSON', desc: 'Recommended for compliance' },
                      { id: 'cyclonedx-xml', name: 'CycloneDX ML XML', desc: 'Legacy system compatible' },
                      { id: 'spdx-json', name: 'SPDX AI JSON', desc: 'License compliance focus' },
                      { id: 'spdx-tv', name: 'SPDX Tag-Value', desc: 'Human readable' }
                    ].map(format => (
                      <label key={format.id} className={`format-option ${selectedFormat === format.id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="format"
                          value={format.id}
                          checked={selectedFormat === format.id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                        />
                        <div className="format-info">
                          <span className="format-name">{format.name}</span>
                          <span className="format-desc">{format.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Export Type */}
                <div className="export-section">
                  <h3>Export Type</h3>
                  <div className="type-options">
                    <label className={`type-option ${exportType === 'individual' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="exportType"
                        value="individual"
                        checked={exportType === 'individual'}
                        onChange={() => setExportType('individual')}
                      />
                      <div className="type-info">
                        <span className="type-name">Individual SBOMs (ZIP)</span>
                        <span className="type-desc">Separate SBOM file for each project, bundled in a ZIP archive</span>
                      </div>
                    </label>
                    <label className={`type-option ${exportType === 'combined' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="exportType"
                        value="combined"
                        checked={exportType === 'combined'}
                        onChange={() => setExportType('combined')}
                      />
                      <div className="type-info">
                        <span className="type-name">Combined SBOM</span>
                        <span className="type-desc">Single merged SBOM containing all selected projects</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Options */}
                <div className="export-section">
                  <h3>Options</h3>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={includeVulnerabilities}
                      onChange={(e) => setIncludeVulnerabilities(e.target.checked)}
                    />
                    <span>Include vulnerability data from latest scans</span>
                  </label>
                </div>

                {/* Project Selection */}
                <div className="export-section">
                  <h3>Select Projects</h3>
                  <label className="checkbox-option select-all">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Select all projects with AIBOM ({summary.project_summary.projects_with_aibom})</span>
                  </label>
                  <div className="project-list">
                    {summary.exportable_projects.map(project => (
                      <label
                        key={project.id}
                        className={`project-item ${!project.has_aibom ? 'disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleProjectToggle(project.id)}
                          disabled={!project.has_aibom}
                        />
                        <span className="project-name">{project.name}</span>
                        {!project.has_aibom && (
                          <span className="no-aibom-badge">No AIBOM</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Export Button */}
                <div className="export-actions">
                  <button
                    className="export-btn"
                    onClick={handleExport}
                    disabled={exporting || selectedProjects.length === 0}
                  >
                    {exporting ? (
                      <>
                        <span className="spinner"></span>
                        Generating Export...
                      </>
                    ) : (
                      <>
                        📥 Export {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>

                {exportSuccess && (
                  <div className="export-success">
                    <span className="success-icon">✓</span>
                    SBOM export completed successfully!
                  </div>
                )}
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && complianceReport && (
              <div className="tab-content">
                {/* Overall Status */}
                <div className="compliance-overview">
                  <div className="compliance-score">
                    <div className="score-circle">
                      <span className="score-value">{complianceReport.overall_compliance.sbom_coverage_percentage}%</span>
                      <span className="score-label">Coverage</span>
                    </div>
                    <div className="score-circle">
                      <span className="score-value">{complianceReport.overall_compliance.average_ntia_score}%</span>
                      <span className="score-label">NTIA Score</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Status */}
                <div className="requirements-section">
                  <h3>Compliance Requirements</h3>
                  <div className="requirements-list">
                    {Object.entries(complianceReport.requirements).map(([key, req]) => (
                      <div key={key} className={`requirement-item ${req.status}`}>
                        <div className="requirement-header">
                          <span className="requirement-name">{req.name}</span>
                          <span className={`requirement-status ${req.status}`}>
                            {req.status === 'compliant' ? '✓ Compliant' :
                             req.status === 'partial' ? '⚠ Partial' : '✕ Non-Compliant'}
                          </span>
                        </div>
                        <p className="requirement-desc">{req.requirement}</p>
                        {'gap' in req && req.gap && <p className="requirement-gap">{req.gap}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {complianceReport.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h3>Recommendations</h3>
                    <div className="recommendations-list">
                      {complianceReport.recommendations.map((rec, idx) => (
                        <div key={idx} className={`recommendation-item ${rec.priority}`}>
                          <div className="rec-header">
                            <span className={`priority-badge ${rec.priority}`}>{rec.priority}</span>
                            <span className="rec-title">{rec.title}</span>
                          </div>
                          <p className="rec-description">{rec.description}</p>
                          <p className="rec-action"><strong>Action:</strong> {rec.action}</p>
                          {rec.affected_projects && rec.affected_projects.length > 0 && (
                            <div className="affected-projects">
                              <span>Affected: </span>
                              {rec.affected_projects.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Details */}
                <div className="project-compliance-section">
                  <h3>Project Compliance Details</h3>
                  <table className="compliance-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>SBOM Status</th>
                        <th>NTIA Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceReport.project_details.map(project => (
                        <tr key={project.project_id}>
                          <td>{project.project_name}</td>
                          <td>
                            <span className={`status-badge ${project.has_sbom ? 'has-sbom' : 'no-sbom'}`}>
                              {project.has_sbom ? 'Has SBOM' : 'Missing'}
                            </span>
                          </td>
                          <td>
                            {project.has_sbom ? (
                              <span className={`score ${project.compliance_score >= 85 ? 'good' : 'needs-work'}`}>
                                {project.compliance_score}%
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrgSBOMExport;
