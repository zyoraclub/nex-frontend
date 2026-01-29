import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import './SecurityGate.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

interface OverrideRequest {
  id: number;
  scan_id: number;
  commit_sha: string;
  pr_number: number | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: { id: number; email: string } | null;
  approved_by: { id: number; email: string } | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  project?: { id: number; name: string };
  scan?: {
    id: number;
    scan_type: string;
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    created_at: string;
  };
}

const SecurityGate: React.FC = () => {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
  const [policy, setPolicy] = useState<SecurityGatePolicy | null>(null);
  const [stats, setStats] = useState<GateStats | null>(null);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [overrides, setOverrides] = useState<OverrideRequest[]>([]);
  const [selectedOverride, setSelectedOverride] = useState<OverrideRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingOverride, setProcessingOverride] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'stats' | 'audit' | 'overrides'>('settings');

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
        const projectsRes = await axios.get(`${API_URL}/api/v1/projects`, {
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

      const [policyRes, statsRes, auditRes, overridesRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/security-gate/projects/${projectId}/policy`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/security-gate/projects/${projectId}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/security-gate/projects/${projectId}/audit?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/security-gate/projects/${projectId}/overrides`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPolicy(policyRes.data);
      setStats(statsRes.data);
      setAudits(auditRes.data.audits);
      setOverrides(overridesRes.data.overrides || []);
    } catch (error: any) {
      // Security gate data fetch failed - policy will be created on first update if 404
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
        `${API_URL}/api/v1/security-gate/projects/${projectId}/policy`,
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

  const fetchOverrideDetail = async (overrideId: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/v1/security-gate/overrides/${overrideId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOverride(res.data);
    } catch (error) {
      console.error('Failed to fetch override details:', error);
    }
  };

  const handleOverrideAction = async (overrideId: number, approved: boolean) => {
    setProcessingOverride(overrideId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/v1/security-gate/overrides/${overrideId}/approve`,
        { approved },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setOverrides(overrides.map(o =>
        o.id === overrideId
          ? { ...o, status: approved ? 'approved' : 'rejected' }
          : o
      ));

      if (selectedOverride?.id === overrideId) {
        setSelectedOverride({ ...selectedOverride, status: approved ? 'approved' : 'rejected' });
      }

      // Refresh stats
      fetchData();
    } catch (error) {
      console.error('Failed to process override:', error);
      alert('Failed to process override. Please try again.');
    } finally {
      setProcessingOverride(null);
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

  const getOverrideStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '•';
    }
  };

  const pendingCount = overrides.filter(o => o.status === 'pending').length;

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
        <button
          className={activeTab === 'overrides' ? 'active' : ''}
          onClick={() => setActiveTab('overrides')}
        >
          Overrides {pendingCount > 0 && <span className="override-badge">{pendingCount}</span>}
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

      {activeTab === 'overrides' && (
        <div className="security-gate-overrides">
          <div className="overrides-layout">
            <div className="overrides-list">
              <div className="overrides-header">
                <h3>Override Requests</h3>
                <div className="override-filters">
                  <span className={`filter-chip ${pendingCount > 0 ? 'active' : ''}`}>
                    Pending ({pendingCount})
                  </span>
                </div>
              </div>

              {overrides.length === 0 ? (
                <div className="no-overrides">
                  No override requests yet. Override requests will appear here when developers
                  request to bypass security gate blocks.
                </div>
              ) : (
                <div className="override-items">
                  {overrides.map((override) => (
                    <div
                      key={override.id}
                      className={`override-item ${selectedOverride?.id === override.id ? 'selected' : ''} ${override.status}`}
                      onClick={() => fetchOverrideDetail(override.id)}
                    >
                      <div className="override-item-header">
                        <span className={`override-status-badge ${override.status}`}>
                          {getOverrideStatusIcon(override.status)} {override.status}
                        </span>
                        <span className="override-date">
                          {new Date(override.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="override-item-info">
                        <code>{override.commit_sha?.substring(0, 7) || 'N/A'}</code>
                        {override.pr_number && <span className="pr-badge">PR #{override.pr_number}</span>}
                      </div>
                      <div className="override-requester">
                        Requested by: {override.requested_by?.email || 'Unknown'}
                      </div>
                      <div className="override-reason-preview">
                        {override.reason?.substring(0, 80)}{override.reason?.length > 80 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="override-detail-panel">
              {selectedOverride ? (
                <>
                  <div className="detail-header">
                    <h3>Override Request #{selectedOverride.id}</h3>
                    <span className={`override-status-badge large ${selectedOverride.status}`}>
                      {getOverrideStatusIcon(selectedOverride.status)} {selectedOverride.status}
                    </span>
                  </div>

                  <div className="detail-section">
                    <h4>Request Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Commit</span>
                        <code>{selectedOverride.commit_sha}</code>
                      </div>
                      {selectedOverride.pr_number && (
                        <div className="detail-item">
                          <span className="detail-label">PR Number</span>
                          <span>#{selectedOverride.pr_number}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Requested By</span>
                        <span>{selectedOverride.requested_by?.email || 'Unknown'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Requested At</span>
                        <span>{new Date(selectedOverride.created_at).toLocaleString()}</span>
                      </div>
                      {selectedOverride.approved_by && (
                        <>
                          <div className="detail-item">
                            <span className="detail-label">{selectedOverride.status === 'approved' ? 'Approved' : 'Rejected'} By</span>
                            <span>{selectedOverride.approved_by.email}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{selectedOverride.status === 'approved' ? 'Approved' : 'Rejected'} At</span>
                            <span>{selectedOverride.approved_at ? new Date(selectedOverride.approved_at).toLocaleString() : '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Reason for Override</h4>
                    <div className="reason-box">
                      {selectedOverride.reason}
                    </div>
                  </div>

                  {selectedOverride.scan && (
                    <div className="detail-section">
                      <h4>Scan Results</h4>
                      <div className="scan-summary">
                        <div className="scan-stat critical">
                          <span className="scan-stat-value">{selectedOverride.scan.critical_count}</span>
                          <span className="scan-stat-label">Critical</span>
                        </div>
                        <div className="scan-stat high">
                          <span className="scan-stat-value">{selectedOverride.scan.high_count}</span>
                          <span className="scan-stat-label">High</span>
                        </div>
                        <div className="scan-stat medium">
                          <span className="scan-stat-value">{selectedOverride.scan.medium_count}</span>
                          <span className="scan-stat-label">Medium</span>
                        </div>
                        <div className="scan-stat low">
                          <span className="scan-stat-value">{selectedOverride.scan.low_count}</span>
                          <span className="scan-stat-label">Low</span>
                        </div>
                      </div>
                      <div className="scan-type">
                        Scan Type: {selectedOverride.scan.scan_type} • Total Findings: {selectedOverride.scan.total_findings}
                      </div>
                    </div>
                  )}

                  {selectedOverride.status === 'pending' && (
                    <div className="override-actions">
                      <button
                        className="action-btn approve"
                        onClick={() => handleOverrideAction(selectedOverride.id, true)}
                        disabled={processingOverride === selectedOverride.id}
                      >
                        {processingOverride === selectedOverride.id ? 'Processing...' : '✓ Approve Override'}
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => handleOverrideAction(selectedOverride.id, false)}
                        disabled={processingOverride === selectedOverride.id}
                      >
                        {processingOverride === selectedOverride.id ? 'Processing...' : '✗ Reject Override'}
                      </button>
                    </div>
                  )}

                  {selectedOverride.status === 'approved' && (
                    <div className="override-result approved">
                      This override was approved. The security gate has been bypassed for this commit.
                    </div>
                  )}

                  {selectedOverride.status === 'rejected' && (
                    <div className="override-result rejected">
                      This override was rejected. The PR remains blocked.
                    </div>
                  )}
                </>
              ) : (
                <div className="no-selection">
                  Select an override request from the list to view details
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default SecurityGate;
