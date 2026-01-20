import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaSlack, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../services/api';

export default function SlackIntegration() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/notifications/slack/status');
      setStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch Slack status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // OAuth flow - redirect to Slack OAuth
    const clientId = 'YOUR_SLACK_CLIENT_ID';
    const redirectUri = `${window.location.origin}/${orgSlug}/integrations/slack/callback`;
    const scope = 'incoming-webhook,chat:write';
    window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await api.post('/notifications/test', { integration_type: 'slack' });
      alert('Test notification sent! Check your Slack channel.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send test notification');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Slack?')) return;
    try {
      await api.delete('/notifications/slack');
      alert('Slack disconnected');
      fetchStatus();
    } catch (err) {
      alert('Failed to disconnect Slack');
    }
  };

  if (loading) {
    return <DashboardLayout><div style={{ padding: '20px' }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(`/${orgSlug}/integrations`)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888888',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Integrations
        </button>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <FaSlack style={{ fontSize: '48px', color: '#4A154B' }} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                Slack Integration
              </h1>
              <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>
                Get real-time security scan notifications in your Slack workspace
              </p>
            </div>
          </div>
        </div>

        {status?.status === 'connected' ? (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FaCheck style={{ color: '#22c55e', fontSize: '20px' }} />
                <span style={{ color: '#22c55e', fontSize: '16px', fontWeight: '600' }}>Connected</span>
              </div>
              <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
                Webhook: {status.webhook_url}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Notification Settings
              </h3>
              <div style={{ fontSize: '13px', color: '#888888', lineHeight: '1.6' }}>
                <p>✓ Scan completion notifications</p>
                <p>✓ Critical vulnerability alerts</p>
                <p>✓ High severity findings</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{
                  padding: '12px 24px',
                  background: '#fec76f',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {testing ? 'Sending...' : 'Send Test Notification'}
              </button>
              <button
                onClick={handleDisconnect}
                style={{
                  padding: '12px 24px',
                  background: '#1a1a1a',
                  color: '#ef4444',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '8px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>
              Connect Slack
            </h3>
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '24px', lineHeight: '1.6' }}>
              Connect your Slack workspace to receive real-time notifications about security scans, 
              vulnerabilities, and critical findings directly in your team's channel.
            </p>

            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                What you'll get:
              </h4>
              <ul style={{ fontSize: '13px', color: '#888888', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Instant scan completion notifications</li>
                <li>Critical and high severity vulnerability alerts</li>
                <li>Detailed finding summaries with links</li>
                <li>Customizable notification preferences</li>
              </ul>
            </div>

            <button
              onClick={handleConnect}
              style={{
                padding: '12px 24px',
                background: '#4A154B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaSlack />
              Connect with Slack
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
