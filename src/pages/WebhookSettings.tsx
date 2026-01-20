import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaGithub, FaGitlab, FaCopy, FaCheck } from 'react-icons/fa';
import { IoLogoBitbucket } from 'react-icons/io';
import { VscAzureDevops } from 'react-icons/vsc';

export default function WebhookSettings() {
  const { orgSlug } = useParams();
  const [copied, setCopied] = useState<string | null>(null);
  
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const webhooks = [
    {
      platform: 'GitHub',
      icon: FaGithub,
      color: '#ffffff',
      url: `${backendUrl}/api/v1/webhooks/github`,
      events: ['push'],
      setup: [
        'Go to your repository Settings → Webhooks',
        'Click "Add webhook"',
        'Paste the Payload URL',
        'Content type: application/json',
        'Select "Just the push event"',
        'Click "Add webhook"'
      ]
    },
    {
      platform: 'GitLab',
      icon: FaGitlab,
      color: '#fc6d26',
      url: `${backendUrl}/api/v1/webhooks/gitlab`,
      events: ['Push events'],
      setup: [
        'Go to your project Settings → Webhooks',
        'Paste the URL',
        'Check "Push events"',
        'Click "Add webhook"'
      ]
    },
    {
      platform: 'Azure DevOps',
      icon: VscAzureDevops,
      color: '#0078D4',
      url: `${backendUrl}/api/v1/webhooks/azuredevops`,
      events: ['Code pushed'],
      setup: [
        'Go to Project Settings → Service Hooks',
        'Click "Create subscription"',
        'Select "Web Hooks"',
        'Trigger on: Code pushed',
        'Paste the URL',
        'Click "Finish"'
      ]
    },
    {
      platform: 'Bitbucket',
      icon: IoLogoBitbucket,
      color: '#2684FF',
      url: `${backendUrl}/api/v1/webhooks/bitbucket`,
      events: ['Repository push'],
      setup: [
        'Go to Repository Settings → Webhooks',
        'Click "Add webhook"',
        'Paste the URL',
        'Check "Repository push"',
        'Click "Save"'
      ]
    }
  ];

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
            Webhook Settings
          </h1>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Configure webhooks for real-time security scanning on every code push
          </p>
        </div>

        <div style={{
          background: '#0a0a0a',
          border: '1px solid #fec76f',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '13px', color: '#cccccc', lineHeight: '1.6' }}>
            <strong style={{ color: '#fec76f' }}>How it works:</strong> When you push code to your repository, 
            the webhook automatically triggers AIBOM generation and security scanning. Results appear in your 
            dashboard within minutes.
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {webhooks.map((webhook) => (
            <div
              key={webhook.platform}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <webhook.icon style={{ fontSize: '32px', color: webhook.color }} />
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                  {webhook.platform}
                </h2>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
                  Webhook URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={webhook.url}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(webhook.url, webhook.platform)}
                    style={{
                      padding: '10px 16px',
                      background: copied === webhook.platform ? '#10b981' : '#fec76f',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#0a0a0a',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied === webhook.platform ? (
                      <>
                        <FaCheck size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <FaCopy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '8px' }}>
                  Events
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      style={{
                        padding: '4px 12px',
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#cccccc'
                      }}
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#888888', marginBottom: '12px' }}>
                  Setup Instructions
                </label>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#cccccc', lineHeight: '1.8' }}>
                  {webhook.setup.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
