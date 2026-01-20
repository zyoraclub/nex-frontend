import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import api from '../services/api';
import './InviteAccept.css';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      setStatus('loading');
      
      // Check if user is logged in
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        // Redirect to register with invitation token
        navigate(`/register?invitation=${token}`);
        return;
      }
      
      const response = await api.post(`/workspaces/invitations/${token}/accept`);
      setStatus('success');
      setMessage(response.data.message);
      setWorkspace(response.data.workspace);
      
      // Get org slug for redirect
      const meResponse = await api.get('/auth/me');
      const orgSlug = meResponse.data.organization_name.toLowerCase().replace(/\s+/g, '-');
      const workspaceSlug = response.data.workspace.name.toLowerCase().replace(/\s+/g, '-');
      
      setTimeout(() => {
        navigate(`/${orgSlug}/${workspaceSlug}/projects`);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Failed to accept invitation');
    }
  };

  return (
    <div className="invite-container">
      <div className="invite-card">
        {status === 'loading' && (
          <>
            <FaSpinner className="invite-icon spinning" size={48} />
            <h1>Processing Invitation...</h1>
            <p>Please wait while we add you to the workspace.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <FaCheckCircle className="invite-icon success" size={48} />
            <h1>Invitation Accepted!</h1>
            <p>{message}</p>
            {workspace && (
              <div className="workspace-info">
                You've been added to <strong>{workspace.name}</strong>
              </div>
            )}
            <p className="redirect-text">Redirecting to workspace...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <FaTimesCircle className="invite-icon error" size={48} />
            <h1>Invitation Failed</h1>
            <p>{message}</p>
            <button className="btn-login" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
