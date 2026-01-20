import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaSlack, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { SiPagerduty } from 'react-icons/si';
import api from '../services/api';

export default function NotificationSettings() {
  const { orgSlug } = useParams();
  const [slackStatus, setSlackStatus] = useState<any>(null);
  const [pagerdutyStatus, setPagerdutyStatus] = useState<any>(null);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [pagerdutyKey, setPagerdutyKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const [slackRes, pagerdutyRes] = await Promise.all([
        api.get('/notifications/slack/status'),
        api.get('/notifications/pagerduty/status')
      ]);
      setSlackStatus(slackRes.data);
      setPagerdutyStatus(pagerdutyRes.data);
    } catch (err) {
      console.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  const handleSlackSave = async () => {
    if (!slackWebhook) return;
    setSaving(true);
    try {
      await api.post('/notifications/slack/configure', { webhook_url: slackWebhook });
      alert('Slack configured successfully!');
      setSlackWebhook('');
      fetchStatus();
    } catch (err) {
      alert('Failed to configure Slack');
    } finally {
      setSaving(false);
    }
  };

  const handlePagerDutySave = async () => {
    if (!pagerdutyKey) return;
    setSaving(true);
    try {
      await api.post('/notifications/pagerduty/configure', { integration_key: pagerdutyKey });
      alert('PagerDuty configured successfully!');
      setPagerdutyKey('');
      fetchStatus();
    } catch (err) {
      alert('Failed to configure PagerDuty');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (type: string) => {
    setTesting(type);
    try {
      await api.post('/notifications/test', { integration_type: type });
      alert(`Test ${type} notification sent! Check your ${type === 'slack' ? 'Slack channel' : 'PagerDuty'}.`);
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to send test ${type} notification`);
    } finally {
      setTesting(null);
    }
  };

  const handleDisconnect = async (type: string) => {
    if (!confirm(`Disconnect ${type}?`)) return;
    try {
      await api.delete(`/notifications/${type}`);
      alert(`${type} disconnected`);
      fetchStatus();
    } catch (err) {
      alert(`Failed to disconnect ${type}`);
    }
  };

  if (loading) {
    return <DashboardLayout><div style={{ padding: '20px' }}>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
            Notification Settings
          </h1>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Configure Slack and PagerDuty to receive scan alerts
          </p>
        </div>

        {/* Slack Configuration */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FaSlack style={{ fontSize: '32px', color: '#4A154B' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                Slack Notifications
              </h2>
              <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>
                Get scan results in your Slack channel
              </p>
            </div>
          </div>

          {slackStatus?.status === 'connected' ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaCheck style={{ color: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>Connected</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888888', margin: '0 0 12px 0' }}>
                Webhook: {slackStatus.webhook_url}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTest('slack')}
                  disabled={testing === 'slack'}
                  style={{
                    padding: '8px 16px',
                    background: '#fec76f',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {testing === 'slack' ? 'Sending...' : 'Send Test'}
                </button>
                <button
                  onClick={() => handleDisconnect('slack')}
                  style={{
                    padding: '8px 16px',
                    background: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
                  Slack Webhook URL
                </label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Create a webhook in Slack: Workspace Settings → Apps → Incoming Webhooks
                </small>
              </div>
              <button
                onClick={handleSlackSave}
                disabled={!slackWebhook || saving}
                style={{
                  padding: '10px 20px',
                  background: slackWebhook ? '#fec76f' : '#2a2a2a',
                  color: slackWebhook ? '#0a0a0a' : '#666666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: slackWebhook ? 'pointer' : 'not-allowed'
                }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </>
          )}
        </div>

        {/* PagerDuty Configuration */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <SiPagerduty style={{ fontSize: '32px', color: '#06AC38' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                PagerDuty Alerts
              </h2>
              <p style={{ fontSize: '12px', color: '#888888', margin: 0 }}>
                Get critical/high severity alerts in PagerDuty
              </p>
            </div>
          </div>

          {pagerdutyStatus?.status === 'connected' ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaCheck style={{ color: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>Connected</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888888', margin: '0 0 12px 0' }}>
                Integration Key: {pagerdutyStatus.integration_key}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTest('pagerduty')}
                  disabled={testing === 'pagerduty'}
                  style={{
                    padding: '8px 16px',
                    background: '#fec76f',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {testing === 'pagerduty' ? 'Sending...' : 'Send Test Alert'}
                </button>
                <button
                  onClick={() => handleDisconnect('pagerduty')}
                  style={{
                    padding: '8px 16px',
                    background: '#1a1a1a',
                    color: '#ffffff',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
                  PagerDuty Integration Key
                </label>
                <input
                  type="text"
                  value={pagerdutyKey}
                  onChange={(e) => setPagerdutyKey(e.target.value)}
                  placeholder="Enter your PagerDuty integration key"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Create an integration in PagerDuty: Services → Add Integration → Events API V2
                </small>
              </div>
              <button
                onClick={handlePagerDutySave}
                disabled={!pagerdutyKey || saving}
                style={{
                  padding: '10px 20px',
                  background: pagerdutyKey ? '#fec76f' : '#2a2a2a',
                  color: pagerdutyKey ? '#0a0a0a' : '#666666',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: pagerdutyKey ? 'pointer' : 'not-allowed'
                }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </>
          )}
        </div>

        <div style={{
          background: 'rgba(254, 199, 111, 0.1)',
          border: '1px solid rgba(254, 199, 111, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <FaBell style={{ color: '#fec76f', marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '13px', color: '#cccccc', margin: '0 0 8px 0', fontWeight: '600' }}>
                How Notifications Work
              </p>
              <ul style={{ fontSize: '12px', color: '#888888', margin: 0, paddingLeft: '20px' }}>
                <li>Email: Sent for all scans</li>
                <li>Slack: Sent for all scans (if configured)</li>
                <li>PagerDuty: Only sent for critical/high severity findings (if configured)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
