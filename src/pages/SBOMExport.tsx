import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import './SBOMExport.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ExportFormat {
  id: string;
  name: string;
  spec_version: string;
  extension: string;
  content_type: string;
  description: string;
  compliance: string[];
  features: string[];
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

interface ExportPreview {
  aibom_id: number;
  project_name: string;
  format: string;
  filename: string;
  content_type: string;
  spec_version: string;
  component_summary: ComponentSummary;
  compliance_info: {
    us_executive_order: boolean;
    eu_ai_act: boolean;
    iso_27001: boolean;
  };
  available_formats: { id: string; name: string; extension: string }[];
}

const SBOMExport: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [formats, setFormats] = useState<ExportFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('cyclonedx-json');
  const [includeVulnerabilities, setIncludeVulnerabilities] = useState(true);
  const [projectVersion, setProjectVersion] = useState('1.0.0');
  const [error, setError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectSlug]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      let projectId = localStorage.getItem(`project_${projectSlug}_id`);

      if (!projectId) {
        const projectsRes = await axios.get(`${API_URL}/api/v1/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const project = projectsRes.data.find(
          (p: any) => p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
        );
        if (!project) {
          setError('Project not found');
          setLoading(false);
          return;
        }
        projectId = project.id.toString();
        localStorage.setItem(`project_${projectSlug}_id`, projectId);
      }

      // Fetch formats and preview in parallel
      const [formatsRes, previewRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/sbom/formats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/sbom/project/${projectId}/export/preview?format=${selectedFormat}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      ]);

      setFormats(formatsRes.data.formats || []);
      if (previewRes) {
        setPreview(previewRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch SBOM data:', err);
      if (err.response?.status === 404) {
        setError('No AIBOM found for this project. Please generate an AIBOM first.');
      } else {
        setError('Failed to load SBOM export data');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = async (format: string) => {
    try {
      const token = localStorage.getItem('token');
      const projectId = localStorage.getItem(`project_${projectSlug}_id`);
      if (!projectId) return;

      const res = await axios.get(
        `${API_URL}/api/v1/sbom/project/${projectId}/export/preview?format=${format}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreview(res.data);
    } catch (err) {
      console.error('Failed to update preview:', err);
    }
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    updatePreview(format);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const projectId = localStorage.getItem(`project_${projectSlug}_id`);

      const response = await axios.post(
        `${API_URL}/api/v1/sbom/project/${projectId}/export`,
        {
          format: selectedFormat,
          include_vulnerabilities: includeVulnerabilities,
          project_version: projectVersion
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Get filename from headers or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = preview?.filename || `sbom-export${getExtension(selectedFormat)}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) filename = match[1];
      }

      // Create download link
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

  const getExtension = (format: string): string => {
    const extensions: Record<string, string> = {
      'cyclonedx-json': '.json',
      'cyclonedx-xml': '.xml',
      'spdx-json': '.json',
      'spdx-tv': '.spdx'
    };
    return extensions[format] || '.json';
  };

  const getFormatIcon = (format: string): string => {
    if (format.includes('cyclonedx')) return '🔄';
    if (format.includes('spdx')) return '📋';
    return '📄';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="sbom-export-loading">Loading SBOM export options...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="sbom-export-container">
        <div className="sbom-export-header">
          <h1>SBOM Export</h1>
          <p>Export AI Bill of Materials in industry-standard formats for compliance</p>
        </div>

        {error && !preview && (
          <div className="sbom-export-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <>
            {/* Compliance Badges */}
            <div className="compliance-badges">
              <div className="compliance-badge">
                <span className="badge-icon">🇺🇸</span>
                <span className="badge-text">US Executive Order on AI</span>
                <span className="badge-status compliant">Compliant</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-icon">🇪🇺</span>
                <span className="badge-text">EU AI Act</span>
                <span className="badge-status compliant">Compliant</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">ISO 27001</span>
                <span className="badge-status compliant">Compliant</span>
              </div>
            </div>

            {/* Component Summary */}
            <div className="component-summary">
              <h3>Components to Export</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.total}</span>
                  <span className="summary-label">Total Components</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.frameworks}</span>
                  <span className="summary-label">ML Frameworks</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.dependencies}</span>
                  <span className="summary-label">Dependencies</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.models}</span>
                  <span className="summary-label">Models</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.datasets}</span>
                  <span className="summary-label">Datasets</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{preview.component_summary.cloud_resources}</span>
                  <span className="summary-label">Cloud Resources</span>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div className="format-selection">
              <h3>Select Export Format</h3>
              <div className="format-grid">
                {formats.map((format) => (
                  <div
                    key={format.id}
                    className={`format-card ${selectedFormat === format.id ? 'selected' : ''}`}
                    onClick={() => handleFormatChange(format.id)}
                  >
                    <div className="format-card-header">
                      <span className="format-icon">{getFormatIcon(format.id)}</span>
                      <span className="format-name">{format.name}</span>
                      <span className="format-version">v{format.spec_version}</span>
                    </div>
                    <p className="format-description">{format.description}</p>
                    <div className="format-features">
                      {format.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                    <div className="format-compliance">
                      {format.compliance.map((comp, idx) => (
                        <span key={idx} className="compliance-tag">{comp}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="export-options">
              <h3>Export Options</h3>
              <div className="options-grid">
                <div className="option-item">
                  <label className="option-label">
                    <input
                      type="checkbox"
                      checked={includeVulnerabilities}
                      onChange={(e) => setIncludeVulnerabilities(e.target.checked)}
                    />
                    <span>Include Vulnerability Data</span>
                  </label>
                  <p className="option-description">
                    Embed vulnerability findings from the latest scan into the SBOM
                  </p>
                </div>
                <div className="option-item">
                  <label className="option-label">Project Version</label>
                  <input
                    type="text"
                    className="version-input"
                    value={projectVersion}
                    onChange={(e) => setProjectVersion(e.target.value)}
                    placeholder="1.0.0"
                  />
                  <p className="option-description">
                    Version string to include in the SBOM metadata
                  </p>
                </div>
              </div>
            </div>

            {/* Export Preview */}
            <div className="export-preview">
              <h3>Export Preview</h3>
              <div className="preview-details">
                <div className="preview-item">
                  <span className="preview-label">Project</span>
                  <span className="preview-value">{preview.project_name}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Format</span>
                  <span className="preview-value">{selectedFormat}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Filename</span>
                  <code className="preview-filename">{preview.filename}</code>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Spec Version</span>
                  <span className="preview-value">{preview.spec_version}</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="export-actions">
              <button
                className="export-btn primary"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <span className="spinner"></span>
                    Generating SBOM...
                  </>
                ) : (
                  <>
                    <span className="export-icon">📥</span>
                    Export SBOM
                  </>
                )}
              </button>
            </div>

            {exportSuccess && (
              <div className="export-success">
                <span className="success-icon">✓</span>
                SBOM exported successfully! Check your downloads folder.
              </div>
            )}
          </>
        )}

        {/* Format Comparison */}
        <div className="format-comparison">
          <h3>Format Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>CycloneDX ML</th>
                <th>SPDX AI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ML Model Metadata</td>
                <td><span className="check">✓</span> Native Support</td>
                <td><span className="check">✓</span> Via Extensions</td>
              </tr>
              <tr>
                <td>Dataset Tracking</td>
                <td><span className="check">✓</span> Built-in</td>
                <td><span className="check">✓</span> As Packages</td>
              </tr>
              <tr>
                <td>Vulnerability Integration</td>
                <td><span className="check">✓</span> VEX Support</td>
                <td><span className="partial">~</span> Via Annotations</td>
              </tr>
              <tr>
                <td>License Compliance</td>
                <td><span className="check">✓</span> Supported</td>
                <td><span className="check">✓</span> Primary Focus</td>
              </tr>
              <tr>
                <td>US EO on AI</td>
                <td><span className="check">✓</span> Compliant</td>
                <td><span className="check">✓</span> Compliant</td>
              </tr>
              <tr>
                <td>EU AI Act</td>
                <td><span className="check">✓</span> Compliant</td>
                <td><span className="check">✓</span> Compliant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SBOMExport;
