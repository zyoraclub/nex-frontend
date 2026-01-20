import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { integrationAPI } from '../services/integrationAPI';
import type { Integration } from '../services/integrationAPI';
import { SiJira } from 'react-icons/si';
import { GrCheckmark } from 'react-icons/gr';
import api from '../services/api';
import './JiraIntegration.css';

export default function JiraIntegration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [autoCreate, setAutoCreate] = useState(true);
  const [severityThreshold, setSeverityThreshold] = useState('high');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'jira_connected') {
      fetchData();
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const integrationsRes = await integrationAPI.list();
      const jiraIntegration = integrationsRes.data.find((i: Integration) => i.integration_type === 'jira');
      setIntegration(jiraIntegration || null);

      if (jiraIntegration) {
        const token = localStorage.getItem('token');
        const projectsRes = await api.get('/jira/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(projectsRes.data.projects || []);
        
        if (jiraIntegration.config?.project_key) {
          setSelectedProject(jiraIntegration.config.project_key);
          setAutoCreate(jiraIntegration.config.auto_create_tickets ?? true);
          setSeverityThreshold(jiraIntegration.config.severity_threshold || 'high');
        }
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/jira/connect', {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = response.data.auth_url;
    } catch (err) {
      console.error('Failed to connect');
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedProject) {
      alert('Please select a Jira project');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await api.post('/integrations/jira', {
        project_key: selectedProject,
        auto_create_tickets: autoCreate,
        severity_threshold: severityThreshold
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Configuration saved successfully!');
    } catch (err) {
      console.error('Failed to save configuration');
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTicket = async () => {
    if (!selectedProject) {
      alert('Please select a Jira project first');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await api.post(`/jira/test-ticket?project_key=${selectedProject}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Test ticket created successfully! Check your Jira project.');
    } catch (err) {
      console.error('Failed to create test ticket');
      alert('Failed to create test ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="jira-loading">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="jira-header">
        <div className="jira-title">
          <SiJira size={32} />
          <h1>Jira Integration</h1>
        </div>
      </div>

      {!integration ? (
        <div className="jira-setup">
          <div className="setup-card">
            <button className="btn-oauth" onClick={handleConnect} type="button">
              <SiJira size={16} />
              <span>Connect with Jira</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="jira-connected">
          <div className="connected-card">
            <div className="connected-info">
              <div className="connected-badge">
                <GrCheckmark size={12} />
                <span>Connected</span>
              </div>
              <span className="connected-name">{integration.integration_name}</span>
            </div>
          </div>

          <div className="config-section">
            <h2>Configuration</h2>
            
            <div className="config-grid">
              <div className="config-item">
                <label>Jira Project</label>
                <select 
                  value={selectedProject} 
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="config-select"
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project.key} value={project.key}>
                      {project.name} ({project.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="config-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={autoCreate} 
                    onChange={(e) => setAutoCreate(e.target.checked)} 
                  />
                  <span>Automatically create tickets for vulnerabilities</span>
                </label>
              </div>

              <div className="config-item">
                <label>Minimum Severity Threshold</label>
                <select 
                  value={severityThreshold} 
                  onChange={(e) => setSeverityThreshold(e.target.value)}
                  disabled={!autoCreate}
                  className="config-select"
                >
                  <option value="critical">Critical only</option>
                  <option value="high">High and above</option>
                  <option value="medium">Medium and above</option>
                  <option value="low">Low and above</option>
                </select>
                <p className="config-hint">Only create tickets for findings at or above this severity level</p>
              </div>
            </div>

            <div className="button-group">
              <button 
                onClick={handleSaveConfig} 
                disabled={saving} 
                className="btn-save"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button 
                onClick={handleTestTicket} 
                disabled={saving || !selectedProject} 
                className="btn-test"
              >
                Create Test Ticket
              </button>
            </div>
          </div>

          <div className="info-section">
            <h4>How it works</h4>
            <ul>
              <li>When a security scan completes, Nexula AI analyzes all findings</li>
              <li>Vulnerabilities meeting your severity threshold are automatically converted to Jira tickets</li>
              <li>Each ticket includes severity level, description, and a direct link to the scan report</li>
              <li>Tickets are labeled with "security", "nexula-ai", and the severity level</li>
            </ul>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
