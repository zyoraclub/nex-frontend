import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ApiDocumentation.css';
import { GrCopy, GrCheckmark, GrBook, GrCode, GrShield, GrCube } from 'react-icons/gr';

const API_BASE_URL = 'https://api.nexula.one';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? <GrCheckmark /> : <GrCopy />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
};

const ApiDocumentation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'getting-started' | 'cli' | 'scanners' | 'reports' | 'webhooks'>('getting-started');
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const section = searchParams.get('section');
    
    if (tab && ['getting-started', 'cli', 'scanners', 'reports', 'webhooks'].includes(tab)) {
      setActiveTab(tab as any);
    }
    
    if (section) {
      setTimeout(() => scrollToSection(section), 100);
    }
  }, [searchParams]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setSearchParams({ tab: activeTab, section: sectionId });
    }
  };

  const handleTabChange = (tab: 'getting-started' | 'cli' | 'scanners' | 'reports' | 'webhooks') => {
    setActiveTab(tab);
    setActiveSection('');
    setSearchParams({ tab });
  };

  const getSidebarSections = () => {
    switch (activeTab) {
      case 'getting-started':
        return [
          { id: 'generate-key', label: 'Generate API Key' },
          { id: 'authentication', label: 'Authentication' },
          { id: 'rate-limits', label: 'Rate Limits' },
          { id: 'response-format', label: 'Response Format' }
        ];
      case 'cli':
        return [
          { id: 'installation', label: 'Installation' },
          { id: 'cli-auth', label: 'Authentication' },
          { id: 'init-project', label: 'Initialize Project' },
          { id: 'generate-aibom', label: 'Generate AIBOM' },
          { id: 'run-scan', label: 'Run Security Scan' },
          { id: 'available-scanners', label: 'Available Scanners' },
          { id: 'jenkins-integration', label: 'Jenkins Integration' },
          { id: 'github-actions', label: 'GitHub Actions' },
          { id: 'gitlab-ci', label: 'GitLab CI' },
          { id: 'config-files', label: 'Configuration Files' },
          { id: 'workflow-example', label: 'Workflow Example' }
        ];
      case 'scanners':
        return [
          { id: 'unified-scanner', label: 'Unified Scanner' },
          { id: 'vulnerability-scanner', label: 'Vulnerability Scanner' },
          { id: 'sast-scanner', label: 'SAST Scanner' },
          { id: 'llm-scanner', label: 'LLM/RAG Scanner' },
          { id: 'container-scanner', label: 'Container Scanner' },
          { id: 'provenance-scanner', label: 'Model Provenance' },
          { id: 'scan-status', label: 'Get Scan Status' },
          { id: 'scan-results', label: 'Get Scan Results' }
        ];
      case 'reports':
        return [
          { id: 'dashboard-stats', label: 'Dashboard Statistics' },
          { id: 'compliance-frameworks', label: 'Compliance Frameworks' },
          { id: 'project-list', label: 'Project List' },
          { id: 'project-details', label: 'Project Details' },
          { id: 'aibom-endpoint', label: 'AI Bill of Materials' },
          { id: 'trend-analytics', label: 'Trend Analytics' }
        ];
      case 'webhooks':
        return [
          { id: 'create-webhook', label: 'Create Webhook' },
          { id: 'webhook-events', label: 'Webhook Events' },
          { id: 'webhook-payload', label: 'Webhook Payload' },
          { id: 'list-webhooks', label: 'List Webhooks' },
          { id: 'delete-webhook', label: 'Delete Webhook' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="api-documentation">
      <nav className="docs-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <img src="/images/logo/nexula.png" alt="Nexula" className="logo-image" />
          </div>
          <div className="navbar-menu">
            <a href="https://cloud.nexula.one/login" className="nav-link">Login</a>
            <a href="https://cloud.nexula.one/register" className="nav-link">Register</a>
            <a href="mailto:support@nexula.one" className="nav-link">Support</a>
          </div>
        </div>
      </nav>

      <div className="api-doc-header">
        <div className="api-doc-title">
          <GrBook className="title-icon" />
          <div>
            <h1>API Documentation</h1>
            <p>Complete guide to integrate Nexula AI into your workflow</p>
          </div>
        </div>
        <div className="api-base-url">
          <span className="label">Base URL:</span>
          <code>{API_BASE_URL}</code>
        </div>
      </div>

      <div className="api-doc-tabs">
        <button
          className={activeTab === 'getting-started' ? 'active' : ''}
          onClick={() => handleTabChange('getting-started')}
        >
          <GrShield /> Getting Started
        </button>
        <button
          className={activeTab === 'cli' ? 'active' : ''}
          onClick={() => handleTabChange('cli')}
        >
          <GrCode /> CLI
        </button>
        <button
          className={activeTab === 'scanners' ? 'active' : ''}
          onClick={() => handleTabChange('scanners')}
        >
          <GrCube /> Scanners
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => handleTabChange('reports')}
        >
          <GrCode /> Reports & Data
        </button>
        <button
          className={activeTab === 'webhooks' ? 'active' : ''}
          onClick={() => handleTabChange('webhooks')}
        >
          <GrBook /> Webhooks
        </button>
      </div>

      <div className="api-doc-body">
        <aside className="api-doc-sidebar">
          <div className="sidebar-title">Quick Navigation</div>
          <nav className="sidebar-nav">
            {getSidebarSections().map((section) => (
              <button
                key={section.id}
                className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="api-doc-content">
          {activeTab === 'getting-started' && (
            <div className="doc-section">
              <h2>Getting Started</h2>
              
              <div className="doc-card" id="generate-key">
                <h3>1. Generate API Key</h3>
              <p>Navigate to <strong>API Keys</strong> in the sidebar and click <strong>Generate New Key</strong>. Select the appropriate scopes for your use case:</p>
              <ul>
                <li><code>scan:read</code> - View scan results and findings</li>
                <li><code>scan:write</code> - Trigger scans</li>
                <li><code>project:read</code> - View projects and dashboard</li>
                <li><code>project:write</code> - Create/update projects</li>
                <li><code>aibom:read</code> - View AI Bill of Materials</li>
                <li><code>aibom:write</code> - Generate AIBOM reports</li>
                <li><code>full:access</code> - All permissions</li>
              </ul>
            </div>

              <div className="doc-card" id="authentication">
                <h3>2. Authentication</h3>
              <p>Include your API key in the <code>X-API-Key</code> header with every request:</p>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/dashboard/stats \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>

              <div className="doc-card" id="rate-limits">
                <h3>3. Rate Limits</h3>
              <div className="rate-limits">
                <div className="rate-limit-item">
                  <span className="limit-value">60</span>
                  <span className="limit-label">requests per minute</span>
                </div>
                <div className="rate-limit-item">
                  <span className="limit-value">1,000</span>
                  <span className="limit-label">requests per hour</span>
                </div>
              </div>
              <p>Rate limit headers are included in every response:</p>
              <CodeBlock language="http" code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1640000000`} />
            </div>

              <div className="doc-card" id="response-format">
                <h3>4. Response Format</h3>
              <p>All responses are in JSON format:</p>
              <CodeBlock language="json" code={`{
  "status": "success",
  "data": {
    "scan_id": 123,
    "status": "completed"
  }
}`} />
              <p>Error responses include details:</p>
              <CodeBlock language="json" code={`{
  "detail": "Invalid API key",
  "status_code": 401
}`} />
            </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="doc-section">
              <h2>Nexula CLI</h2>
              
              <div className="doc-card" id="installation">
                <h3>Installation</h3>
              <p>Install the Nexula CLI using pip:</p>
              <CodeBlock code={`pip install nexula-cli`} />
            </div>

              <div className="doc-card" id="cli-auth">
                <h3>Authentication</h3>
                <p>Login with your API key:</p>
              <CodeBlock code={`nexula auth login
# Enter API key when prompted`} />
              <p>Check authentication status:</p>
              <CodeBlock code={`nexula auth whoami`} />
              <p>Logout:</p>
              <CodeBlock code={`nexula auth logout`} />
            </div>

              <div className="doc-card" id="init-project">
                <h3>Initialize Project</h3>
              <p>Initialize Nexula in your AI/ML project directory:</p>
              <CodeBlock code={`cd /path/to/your/ai-project
nexula init`} />
              <p>This will create a <code>.nexula.yaml</code> config file with your workspace and project IDs.</p>
              <p>Create a new project:</p>
              <CodeBlock code={`nexula init --create`} />
              <p>Use specific workspace/project:</p>
              <CodeBlock code={`nexula init --workspace-id 1 --project-id 2`} />
            </div>

              <div className="doc-card" id="generate-aibom">
                <h3>Generate AIBOM</h3>
              <p>Generate AI Bill of Materials (discovers all AI/ML assets):</p>
              <CodeBlock code={`nexula aibom generate`} />
              <p>Generate from specific path:</p>
              <CodeBlock code={`nexula aibom generate --path /path/to/repo`} />
              <p>List AIBOMs:</p>
              <CodeBlock code={`nexula aibom list`} />
              <p>View AIBOM details:</p>
              <CodeBlock code={`nexula aibom view <aibom-id>`} />
            </div>

              <div className="doc-card" id="run-scan">
                <h3>Run Security Scan</h3>
              <p>Run comprehensive security scan:</p>
              <CodeBlock code={`nexula scan run --wait`} />
              <p>Run specific scanners:</p>
              <CodeBlock code={`nexula scan run --scanners sast --scanners cve --wait`} />
              <p>Check scan status:</p>
              <CodeBlock code={`nexula scan status <scan-id>`} />
              <p>View results (table format):</p>
              <CodeBlock code={`nexula scan results <scan-id>`} />
              <p>View results (JSON format):</p>
              <CodeBlock code={`nexula scan results <scan-id> --format json`} />
              <p>List all scans:</p>
              <CodeBlock code={`nexula scan list`} />
            </div>

              <div className="doc-card" id="available-scanners">
                <h3>Available Scanners</h3>
              <ul>
                <li><code>sast</code> - Static Application Security Testing</li>
                <li><code>cve</code> - CVE/Vulnerability Detection</li>
                <li><code>secrets</code> - Secrets Detection</li>
                <li><code>ml_poisoning</code> - ML Model Poisoning Detection</li>
                <li><code>dataset_poisoning</code> - Dataset Poisoning Detection</li>
                <li><code>llm_security</code> - LLM Security Analysis</li>
                <li><code>rag_security</code> - RAG Security Analysis</li>
                <li><code>model_provenance</code> - Model Provenance Verification</li>
                <li><code>container_registry</code> - Container Registry Security</li>
                <li><code>license</code> - License Compliance</li>
              </ul>
            </div>

              <div className="doc-card" id="jenkins-integration">
                <h3>CI/CD Integration - Jenkins</h3>
              <CodeBlock language="groovy" code={`pipeline {
    agent any
    
    environment {
        NEXULA_API_KEY = credentials('nexula-api-key')
    }
    
    stages {
        stage('Install Nexula CLI') {
            steps {
                sh 'pip install nexula-cli'
            }
        }
        
        stage('Authenticate') {
            steps {
                sh 'nexula auth login --api-key $NEXULA_API_KEY'
            }
        }
        
        stage('Initialize Project') {
            steps {
                sh 'nexula init --workspace-id 1 --project-id 1'
            }
        }
        
        stage('Generate AIBOM') {
            steps {
                sh 'nexula aibom generate'
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'nexula scan run --wait'
            }
        }
        
        stage('Check Results') {
            steps {
                script {
                    def results = sh(
                        script: 'nexula scan results --format json',
                        returnStdout: true
                    ).trim()
                    
                    def json = readJSON text: results
                    
                    if (json.critical_count > 0) {
                        error("Critical vulnerabilities found: \${json.critical_count}")
                    }
                }
            }
        }
    }
    
    post {
        failure {
            slackSend(
                color: 'danger',
                message: "Nexula Scan Failed: \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
            )
        }
    }
}`} />
            </div>

              <div className="doc-card" id="github-actions">
                <h3>CI/CD Integration - GitHub Actions</h3>
              <CodeBlock language="yaml" code={`name: Nexula Security Scan

on: [push, pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Nexula CLI
        run: pip install nexula-cli
      
      - name: Authenticate
        run: echo "\${{ secrets.NEXULA_API_KEY }}" | nexula auth login --api-key
      
      - name: Initialize Project
        run: nexula init --workspace-id 1 --project-id 1
      
      - name: Generate AIBOM
        run: nexula aibom generate
      
      - name: Run Security Scan
        run: nexula scan run --wait`} />
            </div>

              <div className="doc-card" id="gitlab-ci">
                <h3>CI/CD Integration - GitLab CI</h3>
              <CodeBlock language="yaml" code={`nexula-scan:
  image: python:3.11
  script:
    - pip install nexula-cli
    - echo "$NEXULA_API_KEY" | nexula auth login --api-key
    - nexula init --workspace-id 1 --project-id 1
    - nexula aibom generate
    - nexula scan run --wait
  only:
    - main
    - merge_requests`} />
            </div>

              <div className="doc-card" id="config-files">
                <h3>Configuration Files</h3>
              <p><strong>Global Config:</strong> <code>~/.nexula/config.yaml</code></p>
              <p>Stores API key and API URL with secure permissions (0600).</p>
              <p><strong>Project Config:</strong> <code>.nexula.yaml</code></p>
              <p>Stores workspace_id and project_id for the current project.</p>
            </div>

              <div className="doc-card" id="workflow-example">
                <h3>Complete Workflow Example</h3>
              <CodeBlock code={`# 1. Authenticate
nexula auth login

# 2. Initialize project
cd /path/to/your/ai-project
nexula init

# 3. Generate AIBOM
nexula aibom generate

# 4. Run security scan
nexula scan run --wait

# 5. View results
nexula scan list
nexula scan results <scan-id>`} />
            </div>
            </div>
          )}

          {activeTab === 'scanners' && (
            <div className="doc-section">
              <h2>Scanner Endpoints</h2>

              <div className="doc-card" id="unified-scanner">
                <h3>Unified Scanner</h3>
              <p>Comprehensive scan combining vulnerability detection, SAST, and ML security analysis.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/unified</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/unified \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "target": "https://github.com/org/repo",
    "branch": "main"
  }'`} />
              <h4>Response</h4>
              <CodeBlock language="json" code={`{
  "scan_id": 123,
  "status": "running",
  "project_id": 1,
  "scan_type": "unified",
  "created_at": "2024-01-15T10:30:00Z"
}`} />
            </div>

              <div className="doc-card" id="vulnerability-scanner">
                <h3>Vulnerability Scanner</h3>
              <p>Scan dependencies for known CVEs across 324,000+ vulnerabilities.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/vulnerability</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/vulnerability \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "target": "https://github.com/org/repo"
  }'`} />
            </div>

              <div className="doc-card" id="sast-scanner">
                <h3>SAST Scanner</h3>
              <p>Static application security testing for code vulnerabilities.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/sast</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/sast \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "target": "https://github.com/org/repo"
  }'`} />
            </div>

              <div className="doc-card" id="llm-scanner">
                <h3>LLM/RAG Scanner</h3>
              <p>Security analysis for AI models, prompt injection, and RAG systems.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/llm</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/llm \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "model_path": "models/gpt-model",
    "check_prompt_injection": true
  }'`} />
            </div>

              <div className="doc-card" id="container-scanner">
                <h3>Container Scanner</h3>
              <p>Scan Docker images and Kubernetes configurations for vulnerabilities.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/container</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/container \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "image": "myapp:latest"
  }'`} />
            </div>

              <div className="doc-card" id="provenance-scanner">
                <h3>Model Provenance Scanner</h3>
              <p>Verify AI model integrity and supply chain security.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/scanner/provenance</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/scanner/provenance \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "model_path": "models/bert-base"
  }'`} />
            </div>

              <div className="doc-card" id="scan-status">
                <h3>Get Scan Status</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/scanner/status/{'{scan_id}'}</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/scanner/status/123 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
              <h4>Response</h4>
              <CodeBlock language="json" code={`{
  "scan_id": 123,
  "status": "completed",
  "progress": 100,
  "findings_count": 42,
  "critical": 3,
  "high": 12,
  "medium": 18,
  "low": 9
}`} />
            </div>

              <div className="doc-card" id="scan-results">
                <h3>Get Scan Results</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/scanner/results/{'{scan_id}'}</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/scanner/results/123 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="doc-section">
              <h2>Reports & Data Endpoints</h2>

              <div className="doc-card" id="dashboard-stats">
                <h3>Dashboard Statistics</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/dashboard/stats</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/dashboard/stats \\
  -H "X-API-Key: nex_your_api_key_here"`} />
              <h4>Response</h4>
              <CodeBlock language="json" code={`{
  "total_scans": 1250,
  "active_projects": 45,
  "total_findings": 3420,
  "critical_findings": 89,
  "compliance_score": 87.5
}`} />
            </div>

              <div className="doc-card" id="compliance-frameworks">
                <h3>Compliance Frameworks</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/compliance/frameworks</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/compliance/frameworks \\
  -H "X-API-Key: nex_your_api_key_here"`} />
              <h4>Response</h4>
              <CodeBlock language="json" code={`{
  "frameworks": [
    {
      "name": "SOC2",
      "score": 92.5,
      "status": "compliant",
      "controls_passed": 37,
      "controls_total": 40
    }
  ]
}`} />
            </div>

              <div className="doc-card" id="project-list">
                <h3>Project List</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/projects</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/projects \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>

              <div className="doc-card" id="project-details">
                <h3>Project Details</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/projects/{'{project_id}'}</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/projects/1 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>

              <div className="doc-card" id="aibom-endpoint">
                <h3>AI Bill of Materials (AIBOM)</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/aibom/{'{project_id}'}</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/aibom/1 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
              <h4>Response</h4>
              <CodeBlock language="json" code={`{
  "project_id": 1,
  "models": [
    {
      "name": "bert-base-uncased",
      "version": "1.0.0",
      "source": "huggingface",
      "risk_score": 2.3
    }
  ],
  "dependencies": [...],
  "vulnerabilities": [...]
}`} />
            </div>

              <div className="doc-card" id="trend-analytics">
                <h3>Trend Analytics</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/trends</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/trends?days=30 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="doc-section">
              <h2>Webhooks</h2>

              <div className="doc-card" id="create-webhook">
                <h3>Create Webhook</h3>
              <p>Receive real-time notifications when scans complete or vulnerabilities are found.</p>
              <div className="endpoint-badge">
                <span className="method post">POST</span>
                <code>/api/v1/webhooks</code>
              </div>
              <CodeBlock code={`curl -X POST ${API_BASE_URL}/api/v1/webhooks \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["scan.completed", "vulnerability.found"],
    "secret": "your_webhook_secret"
  }'`} />
            </div>

              <div className="doc-card" id="webhook-events">
                <h3>Webhook Events</h3>
              <ul>
                <li><code>scan.started</code> - Scan initiated</li>
                <li><code>scan.completed</code> - Scan finished</li>
                <li><code>scan.failed</code> - Scan encountered error</li>
                <li><code>vulnerability.found</code> - New vulnerability detected</li>
                <li><code>compliance.updated</code> - Compliance score changed</li>
              </ul>
            </div>

              <div className="doc-card" id="webhook-payload">
                <h3>Webhook Payload</h3>
              <p>Example payload sent to your webhook URL:</p>
              <CodeBlock language="json" code={`{
  "event": "scan.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "scan_id": 123,
    "project_id": 1,
    "status": "completed",
    "findings_count": 42,
    "critical": 3,
    "high": 12,
    "medium": 18,
    "low": 9
  },
  "signature": "sha256=..."
}`} />
            </div>

              <div className="doc-card" id="list-webhooks">
                <h3>List Webhooks</h3>
              <div className="endpoint-badge">
                <span className="method get">GET</span>
                <code>/api/v1/webhooks</code>
              </div>
              <CodeBlock code={`curl ${API_BASE_URL}/api/v1/webhooks \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>

              <div className="doc-card" id="delete-webhook">
                <h3>Delete Webhook</h3>
              <div className="endpoint-badge">
                <span className="method delete">DELETE</span>
                <code>/api/v1/webhooks/{'{webhook_id}'}</code>
              </div>
              <CodeBlock code={`curl -X DELETE ${API_BASE_URL}/api/v1/webhooks/1 \\
  -H "X-API-Key: nex_your_api_key_here"`} />
            </div>
            </div>
          )}
        </div>
      </div>

      <div className="api-doc-footer">
        <div className="footer-section">
          <h4>Need Help?</h4>
          <p>Contact our support team at <a href="mailto:support@nexula.one">support@nexula.one</a></p>
        </div>
        <div className="footer-section">
          <h4>CI/CD Integration</h4>
          <p>Check out our <a href="https://github.com/nexula/examples" target="_blank" rel="noopener noreferrer">GitHub examples</a> for Jenkins, GitLab CI, and GitHub Actions.</p>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
