import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { workspaceAPI } from '../services/workspaceAPI';
import type { Workspace } from '../services/workspaceAPI';
import { GrAdd, GrEdit, GrTrash, GrClose } from 'react-icons/gr';
import './Workspace.css';

export default function Workspaces() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formData, setFormData] = useState({ workspace_name: '', details: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.list();
      setWorkspaces(response.data);
    } catch (err) {
      console.error('Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorkspace(null);
    setFormData({ workspace_name: '', details: '' });
    setShowModal(true);
  };

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setFormData({ workspace_name: workspace.workspace_name, details: workspace.details || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingWorkspace) {
        await workspaceAPI.update(editingWorkspace.id, formData);
      } else {
        await workspaceAPI.create(formData);
      }
      setShowModal(false);
      fetchWorkspaces();
    } catch (err) {
      console.error('Failed to save workspace');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this workspace?')) return;
    try {
      await workspaceAPI.delete(id);
      fetchWorkspaces();
    } catch (err) {
      console.error('Failed to delete workspace');
    }
  };

  const getWorkspaceSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <DashboardLayout>
      <div className="workspace-header">
        <h1>Workspaces</h1>
        <button className="btn-create" onClick={handleCreate}>
          <GrAdd size={14} />
          <span>New Workspace</span>
        </button>
      </div>

      {loading ? (
        <div className="workspace-loading">Loading...</div>
      ) : workspaces.length === 0 ? (
        <div className="workspace-empty">
          <p>No workspaces yet</p>
          <button className="btn-create" onClick={handleCreate}>
            <GrAdd size={14} />
            <span>Create First Workspace</span>
          </button>
        </div>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="workspace-card" onClick={() => navigate(`/${orgSlug}/${getWorkspaceSlug(workspace.workspace_name)}/projects`)} style={{ cursor: 'pointer' }}>
              <div className="workspace-card-header">
                <h3>{workspace.workspace_name}</h3>
                <div className="workspace-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(workspace)} title="Edit">
                    <GrEdit size={14} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(workspace.id)} title="Delete">
                    <GrTrash size={14} />
                  </button>
                </div>
              </div>
              {workspace.details && <p className="workspace-details">{workspace.details}</p>}
              <div className="workspace-meta">
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingWorkspace ? 'Edit Workspace' : 'New Workspace'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <GrClose size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Workspace Name</label>
                <input
                  type="text"
                  value={formData.workspace_name}
                  onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                  required
                  placeholder="Enter workspace name"
                />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Optional description"
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingWorkspace ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
