import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import './SecurityGate.css';

interface SecurityGatePolicy {
  id: number;
  project_id: number;
  enabled: boolean;
  block_on_critical: boolean;
  block_on_high: boolean;
  high_threshold: number;
  medium_threshold: number;
  allow_override: boolean;
  require_approval: boolean;
  auto_comment: boolean;
  notify_on_block: boolean;
  created_at: string;
  updated_at: string;
}

interface GateStats {
  total_scans: number;
  blocked: number;
  passed: number;
  warnings: number;
  overridden: number;
}

interface AuditEntry {
  id: number;
  event_type: string;
  commit_sha: string;
  pr_number: number | null;
  gate_status: string;
  critical_count: number;
  high_count: number;
  medium_count: number;
  created_at: string;
}

const SecurityGate: React.FC = () => {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
  const [policy, setPolicy] = useState<SecurityGatePolicy | null>(null);
  const [stats, setStats] = useState<GateStats | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'audit'>('settings');

  useEffect(() => {
    fetchData();
  }, [projectSlug]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      // Get project ID from localStorage or fetch from API
      let projectId = localStorage.getItem(`project_${projectSlug}_id`);
      
      if (!projectId) {
        // Fetch project to get ID
        const projectsRes = await axios.get('http://localhost:8000/api/v1/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const project = projectsRes.data.find(
          (p: any) => p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
        );
        if (!project) {
          console.error('Project not found');
          setLoading(false);
          return;
        }
        projectId = project.id.toString();
        localStorage.setItem(`project_${projectSlug}_id`, projectId);
      }

      const [policyRes, statsRes, auditRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/v1/security-gate/projects/${projectId}/policy`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/v1/security-gate/projects/${projectId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:8000/api/v1/security-gate/projects/${projectId}/audit?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPolicy(policyRes.data);
      setStats(statsRes.data);
      setAudits(auditRes.data.audits);
    } catch (error: any) {
      console.error('Failed to fetch security gate data:', error);
      if (error.response?.status === 404) {
        console.log('Security gate policy not found, will be created on first update');
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (updates: Partial<SecurityGatePolicy>) => {
    if (!policy) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      let projectId = localStorage.getItem(`project_${projectSlug}_id`);
      
      if (!projectId) {
        console.error('Project ID not found');
        return;
      }

      await axios.put(
        `http://localhost:8000/api/v1/security-gate/projects/${projectId}/policy`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPolicy({ ...policy, ...updates });
    } catch (error) {
      console.error('Failed to update policy:', error);
      alert('Failed to update policy. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'blocked': return '🚨';
      case 'passed': return '✅';
      case 'warning': return '⚠️';
      case 'overridden': return '🔓';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="security-gate-loading">Loading security gate settings...</div>
      </DashboardLayout>
    );
  }

  if (!policy) {
    return (
      <DashboardLayout>
        <div className="security-gate-error">Failed to load security gate policy</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="security-gate-container">
      <div className="security-gate-header">
        <h1>PR Security Gate</h1>
        <p>Automatically block PR merges when critical vulnerabilities are found</p>
      </div>

      <div className="security-gate-tabs">
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={activeTab === 'audit' ? 'active' : ''}
          onClick={() => setActiveTab('audit')}
        >
          Audit Log
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="security-gate-settings">
          <div className="setting-card">
            <div className="setting-header">
              <h3>Gate Status</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={policy.enabled}
                  onChange={(e) => updatePolicy({ enabled: e.target.checked })}
                  disabled={saving}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="setting-description">
              {policy.enabled ? 'Security gate is active and will block PRs' : 'Security gate is disabled'}
            </p>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <h3>Block on Critical Vulnerabilities</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={policy.block_on_critical}
                  onChange={(e) => updatePolicy({ block_on_critical: e.target.checked })}
                  disabled={saving || !policy.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="setting-description">
              Block PR merge if ANY critical severity vulnerabilities are found
            </p>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <h3>Block on High Vulnerabilities</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={policy.block_on_high}
                  onChange={(e) => updatePolicy({ block_on_high: e.target.checked })}
                  disabled={saving || !policy.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="setting-description">
              Block PR merge if high severity vulnerabilities exceed threshold
            </p>
            {policy.block_on_high && (
              <div className="threshold-input">
                <label>High Severity Threshold:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={policy.high_threshold}
                  onChange={(e) => updatePolicy({ high_threshold: parseInt(e.target.value) })}
                  disabled={saving}
                />
                <span>vulnerabilities</span>
              </div>
            )}
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <h3>Allow Override Requests</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={policy.allow_override}
                  onChange={(e) => updatePolicy({ allow_override: e.target.checked })}
                  disabled={saving || !policy.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="setting-description">
              Allow admins to request override for blocked PRs in urgent situations
            </p>
          </div>

          <div className="setting-card">
            <div className="setting-header">
              <h3>Auto-Comment on PRs</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={policy.auto_comment}
                  onChange={(e) => updatePolicy({ auto_comment: e.target.checked })}
                  disabled={saving || !policy.enabled}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="setting-description">
              Automatically post vulnerability summary as PR comment
            </p>
          </div>

          <div className="github-setup-card">
            <h3>📋 GitHub Setup Required</h3>
            <p>To enable PR merge blocking, configure GitHub Branch Protection:</p>
            <ol>
              <li>Go to your GitHub repo → <strong>Settings</strong> → <strong>Branches</strong></li>
              <li>Add rule for <code>main</code> branch</li>
              <li>Enable: <strong>"Require status checks to pass before merging"</strong></li>
              <li>Select: <code>nexula/security-gate</code></li>
              <li>Save changes</li>
            </ol>
            <p className="note">Without this setup, status checks are informational only and won't block merges.</p>
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="security-gate-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_scans}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-card blocked">
              <div className="stat-value">{stats.blocked}</div>
              <div className="stat-label">Blocked</div>
            </div>
            <div className="stat-card passed">
              <div className="stat-value">{stats.passed}</div>
              <div className="stat-label">Passed</div>
            </div>
            <div className="stat-card warnings">
              <div className="stat-value">{stats.warnings}</div>
              <div className="stat-label">Warnings</div>
            </div>
            <div className="stat-card overridden">
              <div className="stat-value">{stats.overridden}</div>
              <div className="stat-label">Overridden</div>
            </div>
          </div>

          {stats.total_scans > 0 && (
            <div className="stats-chart">
              <h3>Gate Effectiveness</h3>
              <div className="effectiveness-bar">
                <div
                  className="bar-segment blocked"
                  style={{ width: `${(stats.blocked / stats.total_scans) * 100}%` }}
                  title={`Blocked: ${stats.blocked}`}
                />
                <div
                  className="bar-segment passed"
                  style={{ width: `${(stats.passed / stats.total_scans) * 100}%` }}
                  title={`Passed: ${stats.passed}`}
                />
                <div
                  className="bar-segment warnings"
                  style={{ width: `${(stats.warnings / stats.total_scans) * 100}%` }}
                  title={`Warnings: ${stats.warnings}`}
                />
              </div>
              <div className="effectiveness-legend">
                <span><span className="legend-dot blocked"></span> Blocked ({Math.round((stats.blocked / stats.total_scans) * 100)}%)</span>
                <span><span className="legend-dot passed"></span> Passed ({Math.round((stats.passed / stats.total_scans) * 100)}%)</span>
                <span><span className="legend-dot warnings"></span> Warnings ({Math.round((stats.warnings / stats.total_scans) * 100)}%)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="security-gate-audit">
          <div className="audit-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Commit</th>
                  <th>PR</th>
                  <th>Critical</th>
                  <th>High</th>
                  <th>Medium</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.id}>
                    <td>
                      <span className={`audit-status ${audit.event_type}`}>
                        {getStatusIcon(audit.event_type)} {audit.event_type}
                      </span>
                    </td>
                    <td><code>{audit.commit_sha.substring(0, 7)}</code></td>
                    <td>{audit.pr_number ? `#${audit.pr_number}` : '-'}</td>
                    <td className="vuln-count critical">{audit.critical_count}</td>
                    <td className="vuln-count high">{audit.high_count}</td>
                    <td className="vuln-count medium">{audit.medium_count}</td>
                    <td>{new Date(audit.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {audits.length === 0 && (
              <div className="no-audits">No audit entries yet. Security gate events will appear here.</div>
            )}
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default SecurityGate;
