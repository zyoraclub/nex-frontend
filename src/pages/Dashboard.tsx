import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { authAPI } from '../services/api';
import api from '../services/api';
import { FaProjectDiagram, FaShieldAlt, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import './Dashboard.css';

export default function Dashboard() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await authAPI.getMe();
        setOrgName(userResponse.data.organization_name);
        
        // Fetch analytics and IP in parallel
        const [analyticsResponse, ipResponse] = await Promise.all([
          api.get('/dashboard/analytics'),
          fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ ip: 'N/A' }))
        ]);
        
        setAnalytics(analyticsResponse.data);
        setIpAddress(ipResponse.ip);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    return colors[severity] || '#6b7280';
  };

  return (
    <DashboardLayout>
      <div className="welcome-card">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {orgName || 'User'}!</h1>
          <p className="welcome-description">
            Nexula One is your AI/ML supply chain security platform. 
            Scan, monitor, and secure your AI infrastructure with real-time vulnerability detection.
          </p>
          <div className="welcome-meta">
            <span className="ip-address">IP: {ipAddress || 'Loading...'}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">Loading analytics...</div>
      ) : analytics?.stats ? (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-card-1">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(254, 199, 111, 0.1)' }}>
                <FaProjectDiagram style={{ color: '#fec76f' }} size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.stats.total_projects || 0}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>

            <div className="stat-card stat-card-2">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <MdSecurity style={{ color: '#3b82f6' }} size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.stats.total_scans || 0}</div>
                <div className="stat-label">Total Scans</div>
              </div>
            </div>

            <div className="stat-card stat-card-3">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <FaExclamationTriangle style={{ color: '#ef4444' }} size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.stats.total_vulnerabilities || 0}</div>
                <div className="stat-label">Total Findings</div>
              </div>
            </div>

            <div className="stat-card stat-card-4">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                <FaShieldAlt style={{ color: '#dc2626' }} size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{analytics.stats.critical_vulnerabilities || 0}</div>
                <div className="stat-label">Critical Issues</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Projects</h2>
                <button onClick={() => navigate(`/${orgSlug}/projects`)} className="view-all-btn">
                  View All →
                </button>
              </div>
              <div className="projects-list">
                {(!analytics.recent_projects || analytics.recent_projects.length === 0) ? (
                  <div className="empty-state">No projects yet</div>
                ) : (
                  analytics.recent_projects.map((project: any, index: number) => (
                    <div 
                      key={project.id} 
                      className="project-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/${orgSlug}/projects/${project.id}/scans`)}
                    >
                      <div className="project-info">
                        <div className="project-name">{project.name}</div>
                        <div className="project-meta">
                          <span className="project-source">{project.source_type}</span>
                          <span className="project-date">{formatDate(project.created_at)}</span>
                        </div>
                      </div>
                      <div className="project-stats">
                        {project.total_findings > 0 && (
                          <div className="project-findings">
                            <span className="findings-count">{project.total_findings}</span>
                            {project.critical_count > 0 && (
                              <span className="critical-badge">{project.critical_count} critical</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="activities-list">
                {(!analytics.recent_activities || analytics.recent_activities.length === 0) ? (
                  <div className="empty-state">No recent activity</div>
                ) : (
                  analytics.recent_activities.map((activity: any, index: number) => (
                    <div 
                      key={activity.id} 
                      className="activity-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => navigate(`/${orgSlug}/projects/${activity.project_id}/scans/${activity.id}`)}
                    >
                      <div className="activity-icon">
                        <FaClock size={14} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {activity.scan_type.replace('_', ' ')} scan on {activity.project_name}
                        </div>
                        <div className="activity-meta">
                          <span className={`activity-status status-${activity.status}`}>
                            {activity.status}
                          </span>
                          <span className="activity-time">{formatDate(activity.created_at)}</span>
                        </div>
                      </div>
                      {activity.total_findings > 0 && (
                        <div className="activity-findings">
                          <span className="findings-badge">{activity.total_findings}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">Unable to load dashboard data. Please try again.</div>
      )}
    </DashboardLayout>
  );
}
