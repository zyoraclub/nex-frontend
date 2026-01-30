import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaShieldAlt, FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import api from '../services/api';
import './ScanPolicies.css';

export default function ScanPolicies() {
  const { orgSlug, workspaceSlug } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    policy_name: '',
    description: '',
    // Core Scanners
    vulnerability_scanner_enabled: true,
    llm_rag_scanner_enabled: true,
    model_provenance_scanner_enabled: true,
    container_scanner_enabled: true,
    sast_scanner_enabled: true,
    model_poisoning_scanner_enabled: false,
    dataset_poisoning_scanner_enabled: false,
    // Advanced AI/ML Scanners
    ml_security_scanner_enabled: true,
    adversarial_robustness_scanner_enabled: false,
    zero_day_scanner_enabled: true,
    // Cloud ML Platform Scanners
    sagemaker_scanner_enabled: true,
    huggingface_scanner_enabled: true,
    // Notifications
    notify_on_critical: true,
    notify_on_high: true,
    notify_on_medium: false,
    notify_on_low: false,
    fail_on_critical: false,
    fail_on_high: false,
    max_critical_allowed: 0,
    max_high_allowed: 5,
    email_notifications: true,
    jira_auto_create: false,
    auto_scan_enabled: false,
    scan_frequency: 'manual',
    scan_time: '09:00',
    scan_day_of_week: 1
  });

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceSlug]);

  useEffect(() => {
    if (workspace) {
      fetchPolicies();
    }
  }, [workspace]);

  const fetchWorkspace = async () => {
    try {
      const response = await api.get('/workspaces/');
      const ws = response.data.find((w: any) => w.workspace_name.toLowerCase().replace(/\s+/g, '-') === workspaceSlug);
      setWorkspace(ws);
    } catch (err) {
      console.error('Failed to fetch workspace');
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await api.get(`/scan-policies/workspace/${workspace.id}`);
      setPolicies(response.data.policies);
    } catch (err) {
      console.error('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPolicy(null);
    setFormData({
      policy_name: '',
      description: '',
      // Core Scanners
      vulnerability_scanner_enabled: true,
      llm_rag_scanner_enabled: true,
      model_provenance_scanner_enabled: true,
      container_scanner_enabled: true,
      sast_scanner_enabled: true,
      model_poisoning_scanner_enabled: false,
      dataset_poisoning_scanner_enabled: false,
      // Advanced AI/ML Scanners
      ml_security_scanner_enabled: true,
      adversarial_robustness_scanner_enabled: false,
      zero_day_scanner_enabled: true,
      // Cloud ML Platform Scanners
      sagemaker_scanner_enabled: true,
      huggingface_scanner_enabled: true,
      // Notifications
      notify_on_critical: true,
      notify_on_high: true,
      notify_on_medium: false,
      notify_on_low: false,
      fail_on_critical: false,
      fail_on_high: false,
      max_critical_allowed: 0,
      max_high_allowed: 5,
      email_notifications: true,
      jira_auto_create: false,
      auto_scan_enabled: false,
      scan_frequency: 'manual',
      scan_time: '09:00',
      scan_day_of_week: 1
    });
    setShowModal(true);
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setFormData(policy);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await api.put(`/scan-policies/${editingPolicy.id}`, { ...formData, workspace_id: workspace.id });
      } else {
        await api.post('/scan-policies/', { ...formData, workspace_id: workspace.id });
      }
      setShowModal(false);
      fetchPolicies();
    } catch (err) {
      alert('Failed to save policy');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this policy?')) return;
    try {
      await api.delete(`/scan-policies/${id}`);
      fetchPolicies();
    } catch (err) {
      alert('Failed to delete policy');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.post(`/scan-policies/${id}/set-default`);
      fetchPolicies();
    } catch (err) {
      alert('Failed to set default policy');
    }
  };

  const handleCreateFromTemplate = async (template: string) => {
    try {
      await api.post(`/scan-policies/templates/${template}?workspace_id=${workspace.id}`);
      fetchPolicies();
    } catch (err) {
      alert('Failed to create from template');
    }
  };

  if (loading) {
    return <DashboardLayout><div className="policies-loading">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="policies-header">
        <div className="policies-title">
          <FaShieldAlt size={20} />
          <h1>Scan Policies</h1>
        </div>
        <button className="btn-create-policy" onClick={handleCreate}>
          <FaPlus size={14} />
          New Policy
        </button>
      </div>

      {policies.length === 0 && (
        <div className="policies-empty">
          <p>No policies yet. Create one or use a template:</p>
          <div className="template-buttons">
            <button onClick={() => handleCreateFromTemplate('production')}>Production Template</button>
            <button onClick={() => handleCreateFromTemplate('development')}>Development Template</button>
            <button onClick={() => handleCreateFromTemplate('compliance')}>Compliance Template</button>
            <button onClick={() => handleCreateFromTemplate('ml_focused')}>ML/AI Security Template</button>
          </div>
        </div>
      )}

      <div className="policies-grid">
        {policies.map((policy) => (
          <div key={policy.id} className={`policy-card ${policy.is_default ? 'default' : ''}`}>
            <div className="policy-card-header">
              <div>
                <h3>{policy.policy_name}</h3>
                {policy.is_default && <span className="default-badge"><FaStar size={10} /> Default</span>}
              </div>
              <div className="policy-actions">
                {!policy.is_default && (
                  <button onClick={() => handleSetDefault(policy.id)} title="Set as default">
                    <FaStar size={14} />
                  </button>
                )}
                <button onClick={() => handleEdit(policy)} title="Edit">
                  <FaEdit size={14} />
                </button>
                <button onClick={() => handleDelete(policy.id)} title="Delete">
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            {policy.description && <p className="policy-description">{policy.description}</p>}
            <div className="policy-stats">
              <div className="stat">
                <span className="stat-label">Scanners</span>
                <span className="stat-value">
                  {[policy.vulnerability_scanner_enabled, policy.llm_rag_scanner_enabled,
                    policy.model_provenance_scanner_enabled, policy.container_scanner_enabled,
                    policy.sast_scanner_enabled, policy.model_poisoning_scanner_enabled,
                    policy.dataset_poisoning_scanner_enabled, policy.ml_security_scanner_enabled,
                    policy.adversarial_robustness_scanner_enabled, policy.zero_day_scanner_enabled,
                    policy.sagemaker_scanner_enabled, policy.huggingface_scanner_enabled].filter(Boolean).length}/12
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Notifications</span>
                <span className="stat-value">{policy.email_notifications ? 'Email' : 'None'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Fail Build</span>
                <span className="stat-value">{policy.fail_on_critical || policy.fail_on_high ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPolicy ? 'Edit Policy' : 'New Policy'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-group">
                    <label>Policy Name</label>
                    <input
                      type="text"
                      value={formData.policy_name}
                      onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Scanner Configuration</h3>

                  <h4 style={{ fontSize: '13px', color: '#fec76f', marginBottom: '12px', marginTop: '16px' }}>Core Scanners</h4>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.vulnerability_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, vulnerability_scanner_enabled: e.target.checked })}
                      />
                      Vulnerability Scanner
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.llm_rag_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, llm_rag_scanner_enabled: e.target.checked })}
                      />
                      LLM RAG Scanner
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.model_provenance_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, model_provenance_scanner_enabled: e.target.checked })}
                      />
                      Model Provenance
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.container_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, container_scanner_enabled: e.target.checked })}
                      />
                      Container Scanner
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.sast_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, sast_scanner_enabled: e.target.checked })}
                      />
                      SAST Scanner
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.model_poisoning_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, model_poisoning_scanner_enabled: e.target.checked })}
                      />
                      Model Poisoning
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.dataset_poisoning_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, dataset_poisoning_scanner_enabled: e.target.checked })}
                      />
                      Dataset Poisoning
                    </label>
                  </div>

                  <h4 style={{ fontSize: '13px', color: '#fec76f', marginBottom: '12px', marginTop: '20px' }}>Advanced AI/ML Security</h4>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.ml_security_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, ml_security_scanner_enabled: e.target.checked })}
                      />
                      ML Security Scanner
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.adversarial_robustness_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, adversarial_robustness_scanner_enabled: e.target.checked })}
                      />
                      Adversarial Robustness
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.zero_day_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, zero_day_scanner_enabled: e.target.checked })}
                      />
                      Zero-Day Threat Detection
                    </label>
                  </div>

                  <h4 style={{ fontSize: '13px', color: '#fec76f', marginBottom: '12px', marginTop: '20px' }}>Cloud ML Platforms</h4>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.sagemaker_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, sagemaker_scanner_enabled: e.target.checked })}
                      />
                      AWS SageMaker
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.huggingface_scanner_enabled}
                        onChange={(e) => setFormData({ ...formData, huggingface_scanner_enabled: e.target.checked })}
                      />
                      HuggingFace Models
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Notification Thresholds</h3>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.notify_on_critical}
                        onChange={(e) => setFormData({ ...formData, notify_on_critical: e.target.checked })}
                      />
                      Notify on Critical
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.notify_on_high}
                        onChange={(e) => setFormData({ ...formData, notify_on_high: e.target.checked })}
                      />
                      Notify on High
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.notify_on_medium}
                        onChange={(e) => setFormData({ ...formData, notify_on_medium: e.target.checked })}
                      />
                      Notify on Medium
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.notify_on_low}
                        onChange={(e) => setFormData({ ...formData, notify_on_low: e.target.checked })}
                      />
                      Notify on Low
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Fail Conditions</h3>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.fail_on_critical}
                        onChange={(e) => setFormData({ ...formData, fail_on_critical: e.target.checked })}
                      />
                      Fail on Critical
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.fail_on_high}
                        onChange={(e) => setFormData({ ...formData, fail_on_high: e.target.checked })}
                      />
                      Fail on High
                    </label>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Max Critical Allowed</label>
                      <input
                        type="number"
                        value={formData.max_critical_allowed}
                        onChange={(e) => setFormData({ ...formData, max_critical_allowed: parseInt(e.target.value) })}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Max High Allowed</label>
                      <input
                        type="number"
                        value={formData.max_high_allowed}
                        onChange={(e) => setFormData({ ...formData, max_high_allowed: parseInt(e.target.value) })}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Notifications</h3>
                  <div className="checkbox-grid">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.email_notifications}
                        onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                      />
                      Email Notifications
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.jira_auto_create}
                        onChange={(e) => setFormData({ ...formData, jira_auto_create: e.target.checked })}
                      />
                      Auto-create Jira Tickets
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Scheduling</h3>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.auto_scan_enabled}
                      onChange={(e) => setFormData({ ...formData, auto_scan_enabled: e.target.checked })}
                    />
                    Enable Auto Scan
                  </label>
                  {formData.auto_scan_enabled && (
                    <>
                      <div className="form-group">
                        <label>Scan Frequency</label>
                        <select
                          value={formData.scan_frequency}
                          onChange={(e) => setFormData({ ...formData, scan_frequency: e.target.value })}
                        >
                          <option value="manual">Manual</option>
                          <option value="on_commit">On Commit</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      {formData.scan_frequency === 'daily' && (
                        <div className="form-group">
                          <label>Scan Time (24-hour format)</label>
                          <input
                            type="time"
                            value={formData.scan_time}
                            onChange={(e) => setFormData({ ...formData, scan_time: e.target.value })}
                          />
                          <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                            Scans will run daily at this time (e.g., 09:00 for 9 AM)
                          </small>
                        </div>
                      )}
                      {formData.scan_frequency === 'weekly' && (
                        <>
                          <div className="form-group">
                            <label>Day of Week</label>
                            <select
                              value={formData.scan_day_of_week}
                              onChange={(e) => setFormData({ ...formData, scan_day_of_week: parseInt(e.target.value) })}
                            >
                              <option value="0">Monday</option>
                              <option value="1">Tuesday</option>
                              <option value="2">Wednesday</option>
                              <option value="3">Thursday</option>
                              <option value="4">Friday</option>
                              <option value="5">Saturday</option>
                              <option value="6">Sunday</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Scan Time (24-hour format)</label>
                            <input
                              type="time"
                              value={formData.scan_time}
                              onChange={(e) => setFormData({ ...formData, scan_time: e.target.value })}
                            />
                            <small style={{ color: '#888', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                              Scans will run weekly on selected day at this time
                            </small>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPolicy ? 'Update' : 'Create'} Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
