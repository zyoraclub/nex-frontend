import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import './ModelDrift.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DriftSummary {
  total_models: number;
  models_monitored: number;
  models_with_drift: number;
  critical_alerts: number;
  high_alerts: number;
  avg_drift_score: number;
  avg_stability_score: number;
  backdoor_risk_models: number;
}

interface DriftRecord {
  id: number;
  overall_drift_score: number;
  output_drift_score: number;
  stability_score: number;
  backdoor_risk_score: number;
  finding_count: number;
  critical_count: number;
  high_count: number;
  created_at: string;
}

interface Alert {
  id: number;
  fingerprint_id: number;
  model_name: string | null;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  metric_value: number | null;
  threshold_value: number | null;
  status: string;
  created_at: string;
}

const ModelDrift: React.FC = () => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [summary, setSummary] = useState<DriftSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

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
          setLoading(false);
          return;
        }
        projectId = project.id.toString();
        localStorage.setItem(`project_${projectSlug}_id`, projectId);
      }

      const [summaryRes, alertsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/model-drift/projects/${projectId}/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/v1/model-drift/projects/${projectId}/alerts?limit=20`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSummary(summaryRes.data);
      setAlerts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch drift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/v1/model-drift/alerts/${alertId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlerts(alerts.map(a =>
        a.id === alertId ? { ...a, status } : a
      ));

      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status });
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      case 'low': return 'ℹ️';
      default: return '•';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'acknowledged': return 'status-acknowledged';
      case 'investigating': return 'status-investigating';
      case 'resolved': return 'status-resolved';
      case 'false_positive': return 'status-false-positive';
      default: return '';
    }
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1) + '%';
  };

  const getScoreClass = (score: number, inverted: boolean = false) => {
    const effectiveScore = inverted ? 1 - score : score;
    if (effectiveScore >= 0.5) return 'score-critical';
    if (effectiveScore >= 0.3) return 'score-high';
    if (effectiveScore >= 0.15) return 'score-medium';
    return 'score-low';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="drift-loading">Loading drift monitoring data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="drift-container">
        <div className="drift-header">
          <h1>Model Drift & Behavioral Monitoring</h1>
          <p>Detect unexpected model behavior changes and potential backdoor activations</p>
        </div>

        <div className="drift-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts {alerts.filter(a => a.status === 'open').length > 0 && (
              <span className="alert-badge">{alerts.filter(a => a.status === 'open').length}</span>
            )}
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'overview' && summary && (
          <div className="drift-overview">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-value">{summary.total_models}</div>
                <div className="stat-label">Total Models</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{summary.models_monitored}</div>
                <div className="stat-label">Monitored</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-value">{summary.models_with_drift}</div>
                <div className="stat-label">With Drift</div>
              </div>
              <div className="stat-card danger">
                <div className="stat-value">{summary.backdoor_risk_models}</div>
                <div className="stat-label">Backdoor Risk</div>
              </div>
            </div>

            <div className="overview-metrics">
              <div className="metric-card">
                <h3>Average Drift Score</h3>
                <div className={`metric-gauge ${getScoreClass(summary.avg_drift_score)}`}>
                  <div className="gauge-fill" style={{ width: formatScore(summary.avg_drift_score) }}></div>
                  <span className="gauge-value">{formatScore(summary.avg_drift_score)}</span>
                </div>
                <p className="metric-description">
                  {summary.avg_drift_score < 0.15 ? 'Models are stable' :
                   summary.avg_drift_score < 0.3 ? 'Minor drift detected' :
                   'Significant drift detected'}
                </p>
              </div>

              <div className="metric-card">
                <h3>Average Stability Score</h3>
                <div className={`metric-gauge ${getScoreClass(1 - summary.avg_stability_score)}`}>
                  <div className="gauge-fill" style={{ width: formatScore(summary.avg_stability_score) }}></div>
                  <span className="gauge-value">{formatScore(summary.avg_stability_score)}</span>
                </div>
                <p className="metric-description">
                  {summary.avg_stability_score >= 0.95 ? 'Highly stable inference' :
                   summary.avg_stability_score >= 0.85 ? 'Good stability' :
                   'Stability concerns detected'}
                </p>
              </div>
            </div>

            <div className="alert-summary">
              <h3>Alert Summary</h3>
              <div className="alert-counts">
                <div className="alert-count critical">
                  <span className="count">{summary.critical_alerts}</span>
                  <span className="label">Critical</span>
                </div>
                <div className="alert-count high">
                  <span className="count">{summary.high_alerts}</span>
                  <span className="label">High</span>
                </div>
              </div>
            </div>

            {summary.backdoor_risk_models > 0 && (
              <div className="backdoor-warning">
                <h3>⚠️ Backdoor Risk Detected</h3>
                <p>
                  {summary.backdoor_risk_models} model(s) showing patterns consistent with potential
                  backdoor activation. Immediate investigation recommended.
                </p>
                <button onClick={() => setActiveTab('alerts')}>View Alerts</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="drift-alerts">
            <div className="alerts-layout">
              <div className="alerts-list">
                <div className="alerts-header">
                  <h3>Behavioral Alerts</h3>
                  <span className="alert-filter">
                    Open ({alerts.filter(a => a.status === 'open').length})
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className="no-alerts">
                    No behavioral alerts. Models are operating normally.
                  </div>
                ) : (
                  <div className="alert-items">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`alert-item ${selectedAlert?.id === alert.id ? 'selected' : ''} ${alert.severity}`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="alert-item-header">
                          <span className={`severity-badge ${alert.severity}`}>
                            {getSeverityIcon(alert.severity)} {alert.severity}
                          </span>
                          <span className={`status-badge ${getStatusBadgeClass(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-model">
                          {alert.model_name || `Fingerprint #${alert.fingerprint_id}`}
                        </div>
                        <div className="alert-date">
                          {new Date(alert.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="alert-detail-panel">
                {selectedAlert ? (
                  <>
                    <div className="detail-header">
                      <h3>{selectedAlert.title}</h3>
                      <span className={`severity-badge large ${selectedAlert.severity}`}>
                        {getSeverityIcon(selectedAlert.severity)} {selectedAlert.severity}
                      </span>
                    </div>

                    <div className="detail-section">
                      <h4>Alert Details</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Type</span>
                          <span>{selectedAlert.alert_type}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Model</span>
                          <span>{selectedAlert.model_name || `Fingerprint #${selectedAlert.fingerprint_id}`}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status</span>
                          <span className={`status-badge ${getStatusBadgeClass(selectedAlert.status)}`}>
                            {selectedAlert.status}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Detected</span>
                          <span>{new Date(selectedAlert.created_at).toLocaleString()}</span>
                        </div>
                        {selectedAlert.metric_value !== null && (
                          <div className="detail-item">
                            <span className="detail-label">Metric Value</span>
                            <span>{formatScore(selectedAlert.metric_value)}</span>
                          </div>
                        )}
                        {selectedAlert.threshold_value !== null && (
                          <div className="detail-item">
                            <span className="detail-label">Threshold</span>
                            <span>{formatScore(selectedAlert.threshold_value)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedAlert.description && (
                      <div className="detail-section">
                        <h4>Description</h4>
                        <div className="description-box">
                          {selectedAlert.description}
                        </div>
                      </div>
                    )}

                    {selectedAlert.status === 'open' && (
                      <div className="alert-actions">
                        <button
                          className="action-btn acknowledge"
                          onClick={() => updateAlertStatus(selectedAlert.id, 'acknowledged')}
                        >
                          Acknowledge
                        </button>
                        <button
                          className="action-btn investigate"
                          onClick={() => updateAlertStatus(selectedAlert.id, 'investigating')}
                        >
                          Investigate
                        </button>
                      </div>
                    )}

                    {selectedAlert.status === 'investigating' && (
                      <div className="alert-actions">
                        <button
                          className="action-btn resolve"
                          onClick={() => updateAlertStatus(selectedAlert.id, 'resolved')}
                        >
                          Mark Resolved
                        </button>
                        <button
                          className="action-btn false-positive"
                          onClick={() => updateAlertStatus(selectedAlert.id, 'false_positive')}
                        >
                          False Positive
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-selection">
                    Select an alert to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="drift-history">
            <div className="history-header">
              <h3>Drift Analysis History</h3>
              <p>Track model behavior changes over time</p>
            </div>

            <div className="history-placeholder">
              <div className="placeholder-icon">📈</div>
              <p>Historical drift analysis will appear here once models are monitored.</p>
              <span>Configure fingerprinting and set up inference logging to enable drift detection.</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModelDrift;
