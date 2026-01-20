import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import './Compliance.css';

interface ComplianceScore {
  framework: string;
  name: string;
  score: number;
  status: string;
  total_controls: number;
  compliant_controls: number;
}

interface ComplianceData {
  summary: {
    average_score: number;
    total_frameworks: number;
    compliant: number;
    partially_compliant: number;
    non_compliant: number;
  };
  frameworks: ComplianceScore[];
}

interface ProjectCompliance {
  project_id: number;
  project_name: string;
  average_score: number;
  total_findings: number;
  critical_count: number;
  last_scan: string;
}

export default function Compliance() {
  const { orgSlug } = useParams();
  const [data, setData] = useState<ComplianceData | null>(null);
  const [projects, setProjects] = useState<ProjectCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'projects'>('overview');

  useEffect(() => {
    fetchCompliance();
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchCompliance = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedProject 
        ? `${import.meta.env.VITE_API_URL}/api/v1/compliance/dashboard?project_id=${selectedProject}`
        : `${import.meta.env.VITE_API_URL}/api/v1/compliance/dashboard`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/compliance/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      console.log('Projects response:', result);
      setProjects(result.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 70) return '⚠️';
    return '❌';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredFrameworks = data?.frameworks.filter(f => 
    filterFramework === 'all' || f.framework === filterFramework
  ) || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="compliance-container">
          <div className="loading">Loading compliance data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="compliance-container">
        <div className="compliance-header">
          <div>
            <h1>Compliance Dashboard</h1>
            <p className="compliance-subtitle">Track compliance across security frameworks</p>
          </div>
          <div className="compliance-actions">
            <button 
              className={`view-mode-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'projects' ? 'active' : ''}`}
              onClick={() => setViewMode('projects')}
            >
              📁 Projects
            </button>
          </div>
        </div>

        {viewMode === 'overview' && (
          <>
            <div className="compliance-filters">
              <select 
                value={selectedProject || ''} 
                onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                ))}
              </select>
              <select 
                value={filterFramework} 
                onChange={(e) => setFilterFramework(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Frameworks</option>
                <option value="SOC2">SOC 2</option>
                <option value="ISO27001">ISO 27001</option>
                <option value="NIST">NIST</option>
                <option value="PCI-DSS">PCI-DSS</option>
                <option value="CERT-IN">CERT-In</option>
              </select>
            </div>

            {data && (
              <>
                <div className="compliance-summary">
                  <div className="summary-card">
                    <div className="summary-value">{data.summary.average_score}%</div>
                    <div className="summary-label">Average Compliance</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{data.summary.compliant}</div>
                    <div className="summary-label">Compliant</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{data.summary.partially_compliant}</div>
                    <div className="summary-label">Partially Compliant</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">{data.summary.non_compliant}</div>
                    <div className="summary-label">Non-Compliant</div>
                  </div>
                </div>

                <div className="frameworks-grid">
                  {filteredFrameworks.map((framework) => (
                    <div key={framework.framework} className="framework-card">
                      <div className="framework-header">
                        <h3>{framework.name}</h3>
                        <span className="framework-icon">{getStatusIcon(framework.score)}</span>
                      </div>
                      
                      <div className="framework-score">
                        <div className="score-circle" style={{ borderColor: getStatusColor(framework.score) }}>
                          <span className="score-value">{framework.score}%</span>
                        </div>
                      </div>

                      <div className="framework-status" style={{ color: getStatusColor(framework.score) }}>
                        {framework.status}
                      </div>

                      {framework.total_controls > 0 && (
                        <div className="framework-controls">
                          <div className="controls-bar">
                            <div 
                              className="controls-progress" 
                              style={{ 
                                width: `${(framework.compliant_controls / framework.total_controls) * 100}%`,
                                backgroundColor: getStatusColor(framework.score)
                              }}
                            />
                          </div>
                          <div className="controls-text">
                            {framework.compliant_controls.toFixed(2)}/{framework.total_controls} controls
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {viewMode === 'projects' && (
          <div className="projects-compliance">
            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects with scans</p>
                <span>Run scans on your projects to see compliance data</span>
              </div>
            ) : (
              <div className="projects-list">
                {projects.map((project) => (
                  <div key={project.project_id} className="project-compliance-card">
                    <div className="project-header">
                      <div>
                        <h3>{project.project_name}</h3>
                        <span className="project-meta">
                          Last scan: {formatDate(project.last_scan)}
                        </span>
                      </div>
                      <div className="project-score" style={{ color: getStatusColor(project.average_score) }}>
                        {project.average_score}%
                      </div>
                    </div>
                    <div className="project-stats">
                      <div className="stat-item">
                        <span className="stat-value">{project.total_findings}</span>
                        <span className="stat-label">findings</span>
                      </div>
                      {project.critical_count > 0 && (
                        <div className="stat-item critical">
                          <span className="stat-value">{project.critical_count}</span>
                          <span className="stat-label">critical</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedProject(project.project_id);
                        setViewMode('overview');
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
