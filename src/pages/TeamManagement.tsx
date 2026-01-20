import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaUserPlus, FaUsers, FaEnvelope, FaTrash, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../services/api';
import './TeamManagement.css';

export default function TeamManagement() {
  const { orgSlug, workspaceSlug } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
    fetchMembers();
    fetchInvitations();
  }, [workspaceSlug]);

  const fetchWorkspace = async () => {
    try {
      const response = await api.get('/workspaces/');
      const ws = response.data.find((w: any) => w.workspace_name.toLowerCase().replace(/\s+/g, '-') === workspaceSlug);
      console.log('Found workspace:', ws);
      setWorkspace(ws);
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/workspaces/');
      const ws = response.data.find((w: any) => w.workspace_name.toLowerCase().replace(/\s+/g, '-') === workspaceSlug);
      if (ws) {
        const membersResponse = await api.get(`/workspaces/${ws.id}/members`);
        setMembers(membersResponse.data.members);
      }
    } catch (err) {
      console.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await api.get('/workspaces/');
      const ws = response.data.find((w: any) => w.workspace_name.toLowerCase().replace(/\s+/g, '-') === workspaceSlug);
      if (ws) {
        const invitationsResponse = await api.get(`/workspaces/${ws.id}/invitations`);
        setInvitations(invitationsResponse.data.invitations);
      }
    } catch (err) {
      console.error('Failed to fetch invitations');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !workspace) return;

    try {
      console.log('Sending invitation:', { workspace_id: workspace.id, email: inviteEmail, role: inviteRole });
      await api.post(`/workspaces/${workspace.id}/invite`, {
        email: inviteEmail,
        role: inviteRole
      });
      alert('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchInvitations();
    } catch (err: any) {
      console.error('Invitation error:', err);
      alert(err.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    try {
      await api.delete(`/workspaces/invitations/${invitationId}`);
      fetchInvitations();
    } catch (err) {
      alert('Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitationId: number) => {
    try {
      await api.post(`/workspaces/invitations/${invitationId}/resend`);
      alert('Invitation resent successfully!');
      fetchInvitations();
    } catch (err) {
      alert('Failed to resend invitation');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/workspaces/${workspace.id}/members/${memberId}`);
      fetchMembers();
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      await api.patch(`/workspaces/${workspace.id}/members/${memberId}/role`, { role: newRole });
      fetchMembers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FaClock style={{ color: '#f59e0b' }} />;
      case 'accepted': return <FaCheckCircle style={{ color: '#22c55e' }} />;
      case 'expired': return <FaTimesCircle style={{ color: '#ef4444' }} />;
      case 'cancelled': return <FaTimesCircle style={{ color: '#888888' }} />;
      default: return null;
    }
  };

  if (loading) {
    return <DashboardLayout><div className="team-loading">Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="team-header">
        <div className="team-title">
          <FaUsers size={20} />
          <h1>Team Management</h1>
        </div>
        <button className="btn-invite" onClick={() => setShowInviteModal(true)}>
          <FaUserPlus size={14} />
          Invite Member
        </button>
      </div>

      <div className="team-section">
        <div className="section-header">
          <h2>Members ({members.length})</h2>
        </div>
        <div className="members-list">
          {members.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-info">
                <div className="member-email">{member.email}</div>
                <div className="member-meta">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                  {member.added_by && ` • Added by ${member.added_by}`}
                </div>
              </div>
              <div className="member-actions">
                <select
                  value={member.role}
                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  className="role-select"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="team-section">
        <div className="section-header">
          <h2>Pending Invitations ({invitations.filter(i => i.status === 'pending').length})</h2>
        </div>
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="invitation-card">
              <div className="invitation-status">
                {getStatusIcon(invitation.status)}
              </div>
              <div className="invitation-info">
                <div className="invitation-email">{invitation.email}</div>
                <div className="invitation-meta">
                  {invitation.role} • Invited by {invitation.invited_by}
                  {invitation.status === 'pending' && invitation.expires_at && (
                    <> • Expires {new Date(invitation.expires_at).toLocaleDateString()}</>
                  )}
                </div>
              </div>
              <div className="invitation-status-badge" style={{
                background: invitation.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 
                           invitation.status === 'accepted' ? 'rgba(34, 197, 94, 0.2)' : 
                           'rgba(136, 136, 136, 0.2)',
                color: invitation.status === 'pending' ? '#f59e0b' : 
                       invitation.status === 'accepted' ? '#22c55e' : 
                       '#888888'
              }}>
                {invitation.status}
              </div>
              {invitation.status === 'pending' && (
                <>
                  <button
                    className="btn-resend"
                    onClick={() => handleResendInvitation(invitation.id)}
                  >
                    Resend
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="form-select"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="role-descriptions">
                <div className="role-desc">
                  <strong>Admin:</strong> Can manage projects, invite members, and configure settings
                </div>
                <div className="role-desc">
                  <strong>Member:</strong> Can create and manage projects
                </div>
                <div className="role-desc">
                  <strong>Viewer:</strong> Can view projects and scan results only
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleInvite}>
                <FaEnvelope size={14} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
