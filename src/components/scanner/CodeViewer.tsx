import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { GrClose, GrStatusCritical, GrStatusGood, GrStatusWarning } from 'react-icons/gr';

interface CodeViewerProps {
  finding: any;
  onClose: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ finding, onClose }) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCode();
  }, [finding]);

  const fetchCode = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/code/fetch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          file_path: finding.file_path,
          project_id: finding.project_id
        })
      });
      const data = await response.json();
      setCode(data.content || '// Code not available');
    } catch (error) {
      setCode('// Error loading code');
    } finally {
      setLoading(false);
    }
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.py')) return 'python';
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.rb')) return 'ruby';
    if (filename.endsWith('.go')) return 'go';
    if (filename.endsWith('.rs')) return 'rust';
    return 'plaintext';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '1400px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GrStatusCritical style={{ color: getSeverityColor(finding.severity), fontSize: '20px' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{finding.title}</h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{finding.file_path}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: '24px',
            padding: '4px'
          }}>
            <GrClose />
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Code Editor */}
          <div style={{ flex: 1, borderRight: '1px solid #e5e7eb' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ) : (
              <Editor
                height="100%"
                language={getLanguage(finding.file_path || '')}
                value={code}
                theme="vs-light"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  wordWrap: 'on'
                }}
              />
            )}
          </div>

          {/* Annotations Panel */}
          <div style={{
            width: '400px',
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f9fafb'
          }}>
            {/* Severity Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px',
              backgroundColor: getSeverityColor(finding.severity) + '20',
              color: getSeverityColor(finding.severity)
            }}>
              <GrStatusCritical style={{ fontSize: '16px' }} />
              {finding.severity.toUpperCase()}
            </div>

            {/* Bug Description */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <GrStatusCritical style={{ fontSize: '20px', color: '#dc2626' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Security Issue</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                {finding.description}
              </p>
            </div>

            {/* Remediation Steps */}
            {finding.remediation_steps && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <GrStatusGood style={{ fontSize: '20px', color: '#16a34a' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>How to Fix</h3>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  {finding.remediation_steps}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {finding.ai_analysis && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <GrStatusWarning style={{ fontSize: '20px', color: '#3b82f6' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>AI Insights</h3>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.6',
                  backgroundColor: '#eff6ff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe'
                }}>
                  {finding.ai_analysis.split('\n').slice(0, 5).join('\n')}
                </div>
              </div>
            )}

            {/* Code Example */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <GrStatusGood style={{ fontSize: '20px', color: '#16a34a' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Suggested Fix</h3>
              </div>
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0'
              }}>
                <pre style={{
                  fontSize: '12px',
                  color: '#1f2937',
                  overflowX: 'auto',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  <code>{getFixExample(finding.scanner_type)}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getFixExample(scannerType: string): string {
  if (scannerType === 'sast') {
    return `# Before (Vulnerable)
api_key = "sk-1234567890"

# After (Secure)
import os
api_key = os.getenv("API_KEY")`;
  }
  return '// Fix example not available';
}
