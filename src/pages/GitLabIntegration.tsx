import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaGitlab } from 'react-icons/fa';
import { IoCopyOutline } from 'react-icons/io5';
import { IoCheckmark } from 'react-icons/io5';

export default function GitLabIntegration() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [apiToken, setApiToken] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setApiToken(token || '');
  }, []);

  const pipelineTemplate = `# Nexula AI Security Scan - GitLab CI Pipeline
stages:
  - security

nexula_security_scan:
  stage: security
  image: curlimages/curl:latest
  variables:
    NEXULA_API_URL: "\${NEXULA_API_URL}"
    NEXULA_API_TOKEN: "\${NEXULA_API_TOKEN}"
    FAIL_ON_CRITICAL: "true"
    FAIL_ON_HIGH: "false"
    FAIL_ON_CERT_IN: "true"
  
  script:
    - echo "🔒 Starting Nexula AI Security Scan..."
    
    # Trigger scan
    - |
      SCAN_RESPONSE=$(curl -s -X POST "\${NEXULA_API_URL}/api/v1/cicd/gitlab/scan" \\
        -H "Authorization: Bearer \${NEXULA_API_TOKEN}" \\
        -H "Content-Type: application/json" \\
        -d "{
          \\"repository_url\\": \\"\${CI_PROJECT_URL}\\",
          \\"commit_sha\\": \\"\${CI_COMMIT_SHA}\\",
          \\"branch\\": \\"\${CI_COMMIT_REF_NAME}\\",
          \\"mr_number\\": \${CI_MERGE_REQUEST_IID:-null},
          \\"scan_type\\": \\"unified\\",
          \\"fail_on_critical\\": \${FAIL_ON_CRITICAL},
          \\"fail_on_high\\": \${FAIL_ON_HIGH},
          \\"fail_on_cert_in\\": \${FAIL_ON_CERT_IN}
        }")
    
    - SCAN_ID=$(echo $SCAN_RESPONSE | grep -o '"scan_id":[0-9]*' | grep -o '[0-9]*')
    - echo "📊 Scan ID: $SCAN_ID"
    
    # Poll for completion
    - |
      for i in {1..60}; do
        STATUS_RESPONSE=$(curl -s "\${NEXULA_API_URL}/api/v1/cicd/gitlab/scan/\${SCAN_ID}/status" \\
          -H "Authorization: Bearer \${NEXULA_API_TOKEN}")
        
        STATUS=$(echo $STATUS_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "⏳ Status: $STATUS (attempt $i/60)"
        
        if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
          break
        fi
        
        sleep 5
      done
    
    # Get results
    - |
      RESULTS=$(curl -s "\${NEXULA_API_URL}/api/v1/cicd/gitlab/scan/\${SCAN_ID}/results" \\
        -H "Authorization: Bearer \${NEXULA_API_TOKEN}")
    
    - echo "📋 Scan Results:"
    - echo $RESULTS | grep -o '"total_findings":[0-9]*' || true
    - echo $RESULTS | grep -o '"critical":[0-9]*' || true
    - echo $RESULTS | grep -o '"high":[0-9]*' || true
    
    # Check policy and fail if needed
    - |
      SHOULD_FAIL=$(echo $RESULTS | grep -o '"should_fail":[^,}]*' | cut -d':' -f2)
      if [ "$SHOULD_FAIL" = "true" ]; then
        echo "❌ Security policy violated!"
        exit 1
      fi
    
    - echo "✅ Security scan passed!"
  
  only:
    - merge_requests
    - main
    - master
  
  allow_failure: false`;

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
            <FaGitlab style={{ fontSize: '48px', color: '#fec76f' }} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                GitLab CI/CD
              </h1>
              <p style={{ fontSize: '14px', color: '#888888', margin: 0 }}>
                Automate security scanning in your GitLab pipelines
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
                Add GitLab CI/CD Variables
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '16px', lineHeight: '1.6' }}>
              Go to your GitLab project → <strong style={{ color: '#ffffff' }}>Settings</strong> → <strong style={{ color: '#ffffff' }}>CI/CD</strong> → <strong style={{ color: '#ffffff' }}>Variables</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '11px', color: '#666666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Variable Key
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
                  Variable Key
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
                <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px' }}>
                  ⚠️ Mark as "Protected" and "Masked"
                </div>
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
                Add Pipeline Configuration
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#888888', marginBottom: '16px', lineHeight: '1.6' }}>
              Create or update <code style={{ color: '#fec76f', background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px' }}>.gitlab-ci.yml</code> in your repository root
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
                {pipelineTemplate}
              </pre>
              <button
                onClick={() => copyToClipboard(pipelineTemplate, 'pipeline')}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '8px 16px',
                  background: copied === 'pipeline' ? '#22c55e' : '#fec76f',
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
                {copied === 'pipeline' ? <IoCheckmark size={16} /> : <IoCopyOutline size={16} />}
                {copied === 'pipeline' ? 'Copied' : 'Copy'}
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
                Push your code to GitLab and the pipeline will automatically trigger. Check the <strong style={{ color: '#ffffff' }}>CI/CD → Pipelines</strong> section to see scan results.
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
              <li>Every push/MR triggers automatic security scan</li>
              <li>Scan results posted as MR comment</li>
              <li>Pipeline fails if critical/high vulnerabilities found</li>
              <li>Prevents vulnerable code from being merged</li>
              <li>View detailed results in Nexula dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
