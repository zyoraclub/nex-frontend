import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaHistory, FaDownload, FaFilter } from 'react-icons/fa';
import api from '../services/api';
import './AuditLogs.css';

export default function AuditLogs() {
  const { orgSlug } = useParams();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    days: 7
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      params.append('days', filters.days.toString());
      
      const response = await api.get(`/audit-logs/?${params.toString()}`);
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/audit-logs/stats?days=${filters.days}`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/audit-logs/export?days=${filters.days}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export logs');
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('created')) return '➕';
    if (action.includes('updated')) return '✏️';
    if (action.includes('deleted')) return '🗑️';
    if (action.includes('scan')) return '🔍';
    if (action.includes('invited')) return '📧';
    return '📝';
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? '#22c55e' : '#ef4444';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && logs.length === 0) {
    return <DashboardLayout><div className="audit-loading">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="audit-header">
        <div className="audit-title">
          <FaHistory size={20} />
          <h1>Audit Logs</h1>
        </div>
        <button className="btn-export" onClick={handleExport}>
          <FaDownload size={14} />
          Export CSV
        </button>
      </div>

      {stats && (
        <div className="audit-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_events}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.failed_events}</div>
            <div className="stat-label">Failed Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.users?.length || 0}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      )}

      <div className="audit-filters">
        <div className="filter-group">
          <label>Time Period</label>
          <select value={filters.days} onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}>
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Resource Type</label>
          <select value={filters.resource_type} onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}>
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="project">Project</option>
            <option value="scan">Scan</option>
            <option value="workspace">Workspace</option>
            <option value="policy">Policy</option>
          </select>
        </div>
      </div>

      <div className="audit-timeline">
        {logs.length === 0 ? (
          <div className="audit-empty">No audit logs found for the selected period</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="audit-log-item">
              <div className="log-icon">{getActionIcon(log.action)}</div>
              <div className="log-content">
                <div className="log-header">
                  <span className="log-user">{log.user_email || 'System'}</span>
                  <span className="log-action">{log.action.replace(/\./g, ' ')}</span>
                  {log.resource_name && <span className="log-resource">"{log.resource_name}"</span>}
                </div>
                {log.description && <div className="log-description">{log.description}</div>}
                <div className="log-meta">
                  <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  {log.ip_address && <span className="log-ip">IP: {log.ip_address}</span>}
                  <span className="log-status" style={{ color: getStatusColor(log.status) }}>
                    {log.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
