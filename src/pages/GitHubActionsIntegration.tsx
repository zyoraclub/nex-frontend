import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SiGithubactions } from 'react-icons/si';
import { IoCopyOutline } from 'react-icons/io5';
import { IoCheckmark } from 'react-icons/io5';

export default function GitHubActionsIntegration() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [apiToken, setApiToken] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setApiToken(token || '');
  }, []);

  const workflowTemplate = `name: Nexula AI Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger Nexula Scan
        run: |
          RESPONSE=$(curl -X POST "$\{{ secrets.NEXULA_API_URL }}/api/v1/cicd/github/scan" \\
            -H "Authorization: Bearer $\{{ secrets.NEXULA_API_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{"repo_url": "$\{{ github.repository }}", "branch": "$\{{ github.ref_name }}", "commit_sha": "$\{{ github.sha }}", "scan_type": "unified"}')
          echo "scan_id=$(echo $RESPONSE | jq -r '.scan_id')" >> $GITHUB_OUTPUT
        id: scan
      
      - name: Wait for completion
        run: |
          for i in {1..60}; do
            STATUS=$(curl -s "$\{{ secrets.NEXULA_API_URL }}/api/v1/cicd/github/scan/$\{{ steps.scan.outputs.scan_id }}/status" \\
              -H "Authorization: Bearer $\{{ secrets.NEXULA_API_TOKEN }}" | jq -r '.status')
            [ "$STATUS" = "completed" ] && break
            sleep 10
          done
      
      - name: Get results
        run: |
          RESULTS=$(curl -s "$\{{ secrets.NEXULA_API_URL }}/api/v1/cicd/github/scan/$\{{ steps.scan.outputs.scan_id }}/results" \\
            -H "Authorization: Bearer $\{{ secrets.NEXULA_API_TOKEN }}")
          POLICY_PASS=$(echo $RESULTS | jq -r '.policy_result.pass')
          [ "$POLICY_PASS" = "false" ] && exit 1 || exit 0`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate(`/${orgSlug}/integrations`)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888888',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Integrations
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <SiGithubactions style={{ fontSize: '48px', color: '#fec76f' }} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                GitHub Actions
              </h1>
              <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>
                Automate security scanning in your CI/CD pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Step 1 */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fec76f 0%, #ff9a3c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: '#0a0a0a'
              }}>
                1
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Copy Your API Token
              </h2>
            </div>
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <code style={{
                flex: 1,
                fontSize: '13px',
                color: '#fec76f',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {apiToken || 'Loading...'}
              </code>
              <button
                onClick={() => copyToClipboard(apiToken, 'token')}
                style={{
                  padding: '8px 16px',
                  background: copied === 'token' ? '#22c55e' : '#fec76f',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied === 'token' ? <IoCheckmark size={16} /> : <IoCopyOutline size={16} />}
                {copied === 'token' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fec76f 0%, #ff9a3c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: '#0a0a0a'
              }}>
                2
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Add GitHub Secrets
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '16px', lineHeight: '1.6' }}>
              Go to your GitHub repo → <strong style={{ color: '#ffffff' }}>Settings</strong> → <strong style={{ color: '#ffffff' }}>Secrets and variables</strong> → <strong style={{ color: '#ffffff' }}>Actions</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '11px', color: '#666666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Secret Name
                </div>
                <code style={{ fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' }}>
                  NEXULA_API_URL
                </code>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Value
                </div>
                <code style={{ fontSize: '13px', color: '#fec76f', fontFamily: 'monospace' }}>
                  {window.location.origin.replace('5173', '8000')}
                </code>
              </div>
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '11px', color: '#666666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Secret Name
                </div>
                <code style={{ fontSize: '14px', color: '#ffffff', fontFamily: 'monospace' }}>
                  NEXULA_API_TOKEN
                </code>
                <div style={{ fontSize: '11px', color: '#666666', marginTop: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Value
                </div>
                <code style={{ fontSize: '13px', color: '#fec76f', fontFamily: 'monospace' }}>
                  (Paste your API token from Step 1)
                </code>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fec76f 0%, #ff9a3c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: '#0a0a0a'
              }}>
                3
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                Add Workflow File
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '16px', lineHeight: '1.6' }}>
              Create <code style={{ color: '#fec76f', background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>.github/workflows/nexula-scan.yml</code> in your repository
            </p>
            <div style={{ position: 'relative' }}>
              <pre style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '20px',
                fontSize: '12px',
                color: '#cccccc',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: '400px',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {workflowTemplate}
              </pre>
              <button
                onClick={() => copyToClipboard(workflowTemplate, 'workflow')}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px 16px',
                  background: copied === 'workflow' ? '#22c55e' : '#fec76f',
                  color: '#0a0a0a',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied === 'workflow' ? <IoCheckmark size={16} /> : <IoCopyOutline size={16} />}
                {copied === 'workflow' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Success Message */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <span style={{ fontSize: '28px' }}>✅</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e', margin: '0 0 8px 0' }}>
                You're all set!
              </h3>
              <p style={{ fontSize: '13px', color: '#888888', margin: 0, lineHeight: '1.6' }}>
                Push your code to GitHub and the workflow will automatically trigger. Check the <strong style={{ color: '#ffffff' }}>Actions</strong> tab in your repository to see scan results.
              </p>
            </div>
          </div>

          {/* Features */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#3b82f6', margin: '0 0 16px 0' }}>
              💡 What happens next
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#888888', lineHeight: '2' }}>
              <li>Every push/PR triggers automatic security scan</li>
              <li>Scan results posted as PR comment</li>
              <li>Build fails if critical/high vulnerabilities found</li>
              <li>Prevents vulnerable code from being merged</li>
              <li>View detailed results in Nexula dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
