import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ApiDocumentation.css';
import { GrCopy, GrCheckmark, GrBook, GrCode, GrShield, GrCube, GrSearch, GrStatusGood, GrCircleAlert, GrTerminal, GrIntegration, GrConfigure, GrDownload, GrKey, GrLock, GrCloudComputer, GrCycle } from 'react-icons/gr';
import { FaPython, FaNodeJs } from 'react-icons/fa';
import { SiGo, SiCurl } from 'react-icons/si';

const API_BASE_URL = 'https://api.nexula.one';
const API_VERSION = 'v2.1.0';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

interface CodeSample {
  language: string;
  label: string;
  icon: React.ReactNode;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash', showLineNumbers = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? <GrCheckmark /> : <GrCopy />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        {showLineNumbers ? (
          <code>
            {lines.map((line, i) => (
              <div key={i} className="code-line">
                <span className="line-number">{i + 1}</span>
                <span className="line-content">{line}</span>
              </div>
            ))}
          </code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
};

const MultiLanguageCodeBlock: React.FC<{ samples: CodeSample[] }> = ({ samples }) => {
  const [activeLanguage, setActiveLanguage] = useState(samples[0]?.language || 'curl');
  const [copied, setCopied] = useState(false);

  const activeSample = samples.find(s => s.language === activeLanguage) || samples[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="multi-lang-code-block">
      <div className="lang-tabs">
        {samples.map(sample => (
          <button
            key={sample.language}
            className={`lang-tab ${activeLanguage === sample.language ? 'active' : ''}`}
            onClick={() => setActiveLanguage(sample.language)}
          >
            {sample.icon}
            <span>{sample.label}</span>
          </button>
        ))}
        <button className="copy-btn-float" onClick={handleCopy}>
          {copied ? <GrCheckmark /> : <GrCopy />}
        </button>
      </div>
      <pre className="multi-lang-pre">
        <code>{activeSample.code}</code>
      </pre>
    </div>
  );
};

const ApiDocumentation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'authentication' | 'endpoints' | 'sdks' | 'webhooks' | 'changelog'>('overview');
  const [activeSection, setActiveSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const tab = searchParams.get('tab');
    const section = searchParams.get('section');

    if (tab && ['overview', 'authentication', 'endpoints', 'sdks', 'webhooks', 'changelog'].includes(tab)) {
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

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setActiveSection('');
    setSearchParams({ tab });
  };

  const toggleSidebarSection = (section: string) => {
    setSidebarCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sidebarSections = {
    overview: [
      { id: 'introduction', label: 'Introduction', icon: <GrBook size={14} /> },
      { id: 'quick-start', label: 'Quick Start', icon: <GrTerminal size={14} /> },
      { id: 'base-url', label: 'Base URL & Versioning', icon: <GrCloudComputer size={14} /> },
      { id: 'response-format', label: 'Response Format', icon: <GrCode size={14} /> },
      { id: 'error-handling', label: 'Error Handling', icon: <GrCircleAlert size={14} /> },
      { id: 'rate-limits', label: 'Rate Limits', icon: <GrCycle size={14} /> },
      { id: 'pagination', label: 'Pagination', icon: <GrConfigure size={14} /> }
    ],
    authentication: [
      { id: 'api-keys', label: 'API Keys', icon: <GrKey size={14} /> },
      { id: 'oauth2', label: 'OAuth 2.0', icon: <GrLock size={14} /> },
      { id: 'scopes', label: 'Permission Scopes', icon: <GrShield size={14} /> },
      { id: 'token-management', label: 'Token Management', icon: <GrConfigure size={14} /> }
    ],
    endpoints: [
      {
        id: 'projects',
        label: 'Projects',
        icon: <GrCube size={14} />,
        children: [
          { id: 'list-projects', label: 'List Projects' },
          { id: 'get-project', label: 'Get Project' },
          { id: 'create-project', label: 'Create Project' },
          { id: 'update-project', label: 'Update Project' },
          { id: 'delete-project', label: 'Delete Project' }
        ]
      },
      {
        id: 'aibom',
        label: 'AI Bill of Materials',
        icon: <GrBook size={14} />,
        children: [
          { id: 'generate-aibom', label: 'Generate AIBOM' },
          { id: 'get-aibom', label: 'Get AIBOM' },
          { id: 'export-aibom', label: 'Export AIBOM' }
        ]
      },
      {
        id: 'scanners',
        label: 'Security Scanners',
        icon: <GrShield size={14} />,
        children: [
          { id: 'unified-scan', label: 'Unified Scan' },
          { id: 'vulnerability-scan', label: 'Vulnerability Scan' },
          { id: 'sast-scan', label: 'SAST Scan' },
          { id: 'llm-scan', label: 'LLM/RAG Scan' },
          { id: 'container-scan', label: 'Container Scan' },
          { id: 'scan-status', label: 'Scan Status' },
          { id: 'scan-results', label: 'Scan Results' }
        ]
      },
      {
        id: 'remediation',
        label: 'Remediation',
        icon: <GrIntegration size={14} />,
        children: [
          { id: 'get-suggestions', label: 'Get Suggestions' },
          { id: 'apply-fix', label: 'Apply Fix' },
          { id: 'preview-fix', label: 'Preview Fix' }
        ]
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: <GrStatusGood size={14} />,
        children: [
          { id: 'frameworks', label: 'Frameworks' },
          { id: 'reports', label: 'Reports' },
          { id: 'attestation', label: 'Attestation' }
        ]
      }
    ],
    sdks: [
      { id: 'cli-installation', label: 'CLI Installation', icon: <GrTerminal size={14} /> },
      { id: 'cli-commands', label: 'CLI Commands', icon: <GrCode size={14} /> },
      { id: 'python-sdk', label: 'Python SDK', icon: <GrCode size={14} /> },
      { id: 'node-sdk', label: 'Node.js SDK', icon: <GrCode size={14} /> },
      { id: 'go-sdk', label: 'Go SDK', icon: <GrCode size={14} /> },
      { id: 'cicd-integration', label: 'CI/CD Integration', icon: <GrIntegration size={14} /> }
    ],
    webhooks: [
      { id: 'webhook-setup', label: 'Setup Webhooks', icon: <GrIntegration size={14} /> },
      { id: 'webhook-events', label: 'Event Types', icon: <GrConfigure size={14} /> },
      { id: 'webhook-security', label: 'Security & Verification', icon: <GrLock size={14} /> },
      { id: 'webhook-payloads', label: 'Payload Reference', icon: <GrCode size={14} /> }
    ],
    changelog: [
      { id: 'v2-1-0', label: 'v2.1.0 (Latest)', icon: <GrStatusGood size={14} /> },
      { id: 'v2-0-0', label: 'v2.0.0', icon: <GrBook size={14} /> },
      { id: 'v1-5-0', label: 'v1.5.0', icon: <GrBook size={14} /> },
      { id: 'deprecations', label: 'Deprecations', icon: <GrCircleAlert size={14} /> }
    ]
  };

  const currentSections = sidebarSections[activeTab] || [];

  return (
    <div className="api-documentation">
      {/* Top Navigation Bar */}
      <nav className="docs-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="navbar-logo">
              <img src="/images/logo/nexula.png" alt="Nexula" className="logo-image" />
              <span className="docs-badge">API Docs</span>
            </div>
          </div>
          <div className="navbar-center">
            <div className="navbar-search">
              <GrSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-shortcut">⌘K</span>
            </div>
          </div>
          <div className="navbar-right">
            <div className="api-status">
              <span className="status-dot operational"></span>
              <span className="status-text">All Systems Operational</span>
            </div>
            <a href="https://cloud.nexula.one/login" className="nav-link">Dashboard</a>
            <a href="mailto:support@nexula.one" className="nav-link">Support</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="docs-hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="version-badge">
              <span className="version-label">API Version</span>
              <span className="version-number">{API_VERSION}</span>
              <span className="version-status">Stable</span>
            </div>
            <h1>Nexula API Documentation</h1>
            <p>Comprehensive API reference for integrating AI/ML security scanning into your workflow. Build secure AI applications with our enterprise-grade vulnerability detection.</p>
            <div className="hero-actions">
              <a href="#quick-start" className="hero-btn primary" onClick={() => scrollToSection('quick-start')}>
                <GrTerminal /> Quick Start Guide
              </a>
              <a href="#api-keys" className="hero-btn secondary" onClick={() => { handleTabChange('authentication'); setTimeout(() => scrollToSection('api-keys'), 100); }}>
                <GrKey /> Get API Key
              </a>
              <a href="https://github.com/nexula/nexula-cli" target="_blank" rel="noopener noreferrer" className="hero-btn outline">
                <GrDownload /> Download CLI
              </a>
            </div>
          </div>
          <div className="hero-code">
            <div className="hero-code-header">
              <span className="code-dot red"></span>
              <span className="code-dot yellow"></span>
              <span className="code-dot green"></span>
              <span className="code-title">Quick Example</span>
            </div>
            <pre className="hero-code-content">
              <code>{`# Install Nexula CLI
pip install nexula-cli

# Authenticate
nexula auth login

# Scan your AI project
nexula scan run --wait

# View results
nexula scan results`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="api-doc-tabs">
        <div className="tabs-container">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => handleTabChange('overview')}
          >
            <GrBook /> Overview
          </button>
          <button
            className={activeTab === 'authentication' ? 'active' : ''}
            onClick={() => handleTabChange('authentication')}
          >
            <GrKey /> Authentication
          </button>
          <button
            className={activeTab === 'endpoints' ? 'active' : ''}
            onClick={() => handleTabChange('endpoints')}
          >
            <GrCode /> API Reference
          </button>
          <button
            className={activeTab === 'sdks' ? 'active' : ''}
            onClick={() => handleTabChange('sdks')}
          >
            <GrTerminal /> SDKs & CLI
          </button>
          <button
            className={activeTab === 'webhooks' ? 'active' : ''}
            onClick={() => handleTabChange('webhooks')}
          >
            <GrIntegration /> Webhooks
          </button>
          <button
            className={activeTab === 'changelog' ? 'active' : ''}
            onClick={() => handleTabChange('changelog')}
          >
            <GrCycle /> Changelog
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="api-doc-body">
        {/* Sidebar Navigation */}
        <aside className="api-doc-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">On This Page</span>
          </div>
          <nav className="sidebar-nav">
            {currentSections.map((section: any) => (
              <div key={section.id} className="sidebar-section">
                {section.children ? (
                  <>
                    <button
                      className={`sidebar-link parent ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => toggleSidebarSection(section.id)}
                    >
                      {section.icon}
                      <span>{section.label}</span>
                      <span className={`collapse-icon ${sidebarCollapsed[section.id] ? 'collapsed' : ''}`}>▼</span>
                    </button>
                    {!sidebarCollapsed[section.id] && (
                      <div className="sidebar-children">
                        {section.children.map((child: any) => (
                          <button
                            key={child.id}
                            className={`sidebar-link child ${activeSection === child.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(child.id)}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="api-doc-content">
          {activeTab === 'overview' && (
            <div className="doc-section">
              <div className="doc-card" id="introduction">
                <div className="card-header">
                  <h2>Introduction</h2>
                  <span className="header-badge">Getting Started</span>
                </div>
                <p>
                  The Nexula API provides programmatic access to AI/ML security scanning, vulnerability detection,
                  and compliance management. Use our RESTful API to integrate security scanning into your development
                  workflow, CI/CD pipelines, and custom applications.
                </p>
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon"><GrShield /></div>
                    <h4>Security Scanning</h4>
                    <p>Scan AI/ML projects for vulnerabilities across 324,000+ CVEs</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><GrBook /></div>
                    <h4>AIBOM Generation</h4>
                    <p>Generate comprehensive AI Bill of Materials for compliance</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><GrIntegration /></div>
                    <h4>CI/CD Integration</h4>
                    <p>Seamless integration with Jenkins, GitHub Actions, GitLab CI</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><GrStatusGood /></div>
                    <h4>Compliance Reports</h4>
                    <p>SOC2, GDPR, HIPAA, and EU AI Act compliance tracking</p>
                  </div>
                </div>
              </div>

              <div className="doc-card" id="quick-start">
                <div className="card-header">
                  <h2>Quick Start</h2>
                  <span className="header-badge success">5 min setup</span>
                </div>
                <p>Get started with the Nexula API in minutes. Follow these steps to make your first API call.</p>

                <div className="steps-container">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Get Your API Key</h4>
                      <p>Generate an API key from the <a href="https://cloud.nexula.one/api-keys">API Keys</a> page in your dashboard.</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Make Your First Request</h4>
                      <p>Use your API key to authenticate and fetch your dashboard statistics:</p>
                      <MultiLanguageCodeBlock samples={[
                        {
                          language: 'curl',
                          label: 'cURL',
                          icon: <SiCurl size={14} />,
                          code: `curl -X GET "${API_BASE_URL}/api/v1/dashboard/stats" \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json"`
                        },
                        {
                          language: 'python',
                          label: 'Python',
                          icon: <FaPython size={14} />,
                          code: `import requests

response = requests.get(
    "${API_BASE_URL}/api/v1/dashboard/stats",
    headers={
        "X-API-Key": "nex_your_api_key_here",
        "Content-Type": "application/json"
    }
)

print(response.json())`
                        },
                        {
                          language: 'javascript',
                          label: 'Node.js',
                          icon: <FaNodeJs size={14} />,
                          code: `const response = await fetch(
  "${API_BASE_URL}/api/v1/dashboard/stats",
  {
    headers: {
      "X-API-Key": "nex_your_api_key_here",
      "Content-Type": "application/json"
    }
  }
);

const data = await response.json();
console.log(data);`
                        },
                        {
                          language: 'go',
                          label: 'Go',
                          icon: <SiGo size={14} />,
                          code: `req, _ := http.NewRequest("GET",
    "${API_BASE_URL}/api/v1/dashboard/stats", nil)
req.Header.Set("X-API-Key", "nex_your_api_key_here")
req.Header.Set("Content-Type", "application/json")

client := &http.Client{}
resp, _ := client.Do(req)
defer resp.Body.Close()

body, _ := io.ReadAll(resp.Body)
fmt.Println(string(body))`
                        }
                      ]} />
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Explore the API</h4>
                      <p>Check out the <a href="#" onClick={() => handleTabChange('endpoints')}>API Reference</a> for all available endpoints.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="doc-card" id="base-url">
                <div className="card-header">
                  <h2>Base URL & Versioning</h2>
                </div>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Production</span>
                    <code className="info-value">{API_BASE_URL}</code>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Sandbox</span>
                    <code className="info-value">https://sandbox.api.nexula.one</code>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Current Version</span>
                    <code className="info-value">v1 (included in path)</code>
                  </div>
                </div>
                <p className="note">All API endpoints are prefixed with <code>/api/v1</code>. When we release breaking changes, a new version will be introduced.</p>
              </div>

              <div className="doc-card" id="response-format">
                <div className="card-header">
                  <h2>Response Format</h2>
                </div>
                <p>All API responses are returned in JSON format with consistent structure:</p>

                <div className="response-tabs">
                  <div className="response-tab">
                    <h4><span className="status-badge success">Success Response</span></h4>
                    <CodeBlock language="json" code={`{
  "status": "success",
  "data": {
    "scan_id": 12345,
    "status": "completed",
    "findings_count": 42
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}`} />
                  </div>
                  <div className="response-tab">
                    <h4><span className="status-badge error">Error Response</span></h4>
                    <CodeBlock language="json" code={`{
  "status": "error",
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "details": {
      "key_prefix": "nex_abc..."
    }
  },
  "meta": {
    "request_id": "req_xyz789",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}`} />
                  </div>
                </div>
              </div>

              <div className="doc-card" id="error-handling">
                <div className="card-header">
                  <h2>Error Handling</h2>
                </div>
                <p>The API uses standard HTTP status codes to indicate success or failure:</p>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Status Code</th>
                      <th>Meaning</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code className="status-code success">200</code></td>
                      <td>OK</td>
                      <td>Request succeeded</td>
                    </tr>
                    <tr>
                      <td><code className="status-code success">201</code></td>
                      <td>Created</td>
                      <td>Resource created successfully</td>
                    </tr>
                    <tr>
                      <td><code className="status-code warning">400</code></td>
                      <td>Bad Request</td>
                      <td>Invalid request parameters</td>
                    </tr>
                    <tr>
                      <td><code className="status-code error">401</code></td>
                      <td>Unauthorized</td>
                      <td>Invalid or missing API key</td>
                    </tr>
                    <tr>
                      <td><code className="status-code error">403</code></td>
                      <td>Forbidden</td>
                      <td>Insufficient permissions</td>
                    </tr>
                    <tr>
                      <td><code className="status-code error">404</code></td>
                      <td>Not Found</td>
                      <td>Resource not found</td>
                    </tr>
                    <tr>
                      <td><code className="status-code warning">429</code></td>
                      <td>Too Many Requests</td>
                      <td>Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td><code className="status-code error">500</code></td>
                      <td>Server Error</td>
                      <td>Internal server error</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="doc-card" id="rate-limits">
                <div className="card-header">
                  <h2>Rate Limits</h2>
                </div>
                <p>API requests are rate limited to ensure fair usage and system stability:</p>
                <div className="rate-limits-grid">
                  <div className="rate-card">
                    <div className="rate-tier">Free</div>
                    <div className="rate-value">60</div>
                    <div className="rate-unit">requests/minute</div>
                    <div className="rate-daily">1,000/day</div>
                  </div>
                  <div className="rate-card highlighted">
                    <div className="rate-tier">Pro</div>
                    <div className="rate-value">300</div>
                    <div className="rate-unit">requests/minute</div>
                    <div className="rate-daily">50,000/day</div>
                  </div>
                  <div className="rate-card">
                    <div className="rate-tier">Enterprise</div>
                    <div className="rate-value">1,000</div>
                    <div className="rate-unit">requests/minute</div>
                    <div className="rate-daily">Unlimited</div>
                  </div>
                </div>
                <p>Rate limit headers are included in every response:</p>
                <CodeBlock language="http" code={`X-RateLimit-Limit: 300
X-RateLimit-Remaining: 298
X-RateLimit-Reset: 1705319400
X-RateLimit-Policy: 300;w=60`} />
              </div>

              <div className="doc-card" id="pagination">
                <div className="card-header">
                  <h2>Pagination</h2>
                </div>
                <p>List endpoints support cursor-based pagination for efficient data retrieval:</p>
                <CodeBlock code={`curl "${API_BASE_URL}/api/v1/projects?limit=20&cursor=eyJpZCI6MTIzfQ" \\
  -H "X-API-Key: nex_your_api_key_here"`} />
                <h4>Pagination Parameters</h4>
                <table className="api-table compact">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>limit</code></td>
                      <td>integer</td>
                      <td>Number of items to return (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                      <td><code>cursor</code></td>
                      <td>string</td>
                      <td>Cursor for pagination (from previous response)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'authentication' && (
            <div className="doc-section">
              <div className="doc-card" id="api-keys">
                <div className="card-header">
                  <h2>API Keys</h2>
                  <span className="header-badge">Recommended</span>
                </div>
                <p>API keys are the simplest way to authenticate with the Nexula API. Include your key in the <code>X-API-Key</code> header with every request.</p>

                <div className="alert-box info">
                  <GrCircleAlert />
                  <div>
                    <strong>Security Best Practice</strong>
                    <p>Never expose your API keys in client-side code or public repositories. Use environment variables to store keys securely.</p>
                  </div>
                </div>

                <h3>Generate an API Key</h3>
                <ol className="numbered-list">
                  <li>Navigate to <strong>Settings → API Keys</strong> in your dashboard</li>
                  <li>Click <strong>Generate New Key</strong></li>
                  <li>Select the appropriate permission scopes</li>
                  <li>Copy and securely store your key (it won't be shown again)</li>
                </ol>

                <h3>Using Your API Key</h3>
                <MultiLanguageCodeBlock samples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    icon: <SiCurl size={14} />,
                    code: `curl -X GET "${API_BASE_URL}/api/v1/projects" \\
  -H "X-API-Key: nex_live_abc123xyz789" \\
  -H "Content-Type: application/json"`
                  },
                  {
                    language: 'python',
                    label: 'Python',
                    icon: <FaPython size={14} />,
                    code: `import os
import requests

api_key = os.environ.get("NEXULA_API_KEY")

response = requests.get(
    "${API_BASE_URL}/api/v1/projects",
    headers={
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }
)`
                  },
                  {
                    language: 'javascript',
                    label: 'Node.js',
                    icon: <FaNodeJs size={14} />,
                    code: `const apiKey = process.env.NEXULA_API_KEY;

const response = await fetch(
  "${API_BASE_URL}/api/v1/projects",
  {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json"
    }
  }
);`
                  }
                ]} />

                <h3>API Key Format</h3>
                <table className="api-table compact">
                  <thead>
                    <tr>
                      <th>Prefix</th>
                      <th>Environment</th>
                      <th>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>nex_live_</code></td>
                      <td>Production</td>
                      <td><code>nex_live_abc123xyz789def456</code></td>
                    </tr>
                    <tr>
                      <td><code>nex_test_</code></td>
                      <td>Sandbox</td>
                      <td><code>nex_test_abc123xyz789def456</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="doc-card" id="oauth2">
                <div className="card-header">
                  <h2>OAuth 2.0</h2>
                  <span className="header-badge warning">Enterprise</span>
                </div>
                <p>For enterprise integrations, we support OAuth 2.0 with the Authorization Code flow.</p>

                <h3>OAuth Endpoints</h3>
                <div className="info-box">
                  <div className="info-row">
                    <span className="info-label">Authorization</span>
                    <code className="info-value">https://auth.nexula.one/oauth/authorize</code>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Token</span>
                    <code className="info-value">https://auth.nexula.one/oauth/token</code>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Revoke</span>
                    <code className="info-value">https://auth.nexula.one/oauth/revoke</code>
                  </div>
                </div>
              </div>

              <div className="doc-card" id="scopes">
                <div className="card-header">
                  <h2>Permission Scopes</h2>
                </div>
                <p>Control what your API key can access by selecting appropriate scopes:</p>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Scope</th>
                      <th>Description</th>
                      <th>Endpoints</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>project:read</code></td>
                      <td>View projects and dashboards</td>
                      <td>GET /projects, GET /dashboard</td>
                    </tr>
                    <tr>
                      <td><code>project:write</code></td>
                      <td>Create and update projects</td>
                      <td>POST /projects, PUT /projects</td>
                    </tr>
                    <tr>
                      <td><code>scan:read</code></td>
                      <td>View scan results and findings</td>
                      <td>GET /scans, GET /findings</td>
                    </tr>
                    <tr>
                      <td><code>scan:write</code></td>
                      <td>Trigger security scans</td>
                      <td>POST /scanner/*</td>
                    </tr>
                    <tr>
                      <td><code>aibom:read</code></td>
                      <td>View AI Bill of Materials</td>
                      <td>GET /aibom</td>
                    </tr>
                    <tr>
                      <td><code>aibom:write</code></td>
                      <td>Generate AIBOM reports</td>
                      <td>POST /aibom/generate</td>
                    </tr>
                    <tr>
                      <td><code>remediation:write</code></td>
                      <td>Apply security fixes</td>
                      <td>POST /remediation/*</td>
                    </tr>
                    <tr>
                      <td><code>full:access</code></td>
                      <td>All permissions</td>
                      <td>All endpoints</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="doc-card" id="token-management">
                <div className="card-header">
                  <h2>Token Management</h2>
                </div>
                <h3>Rotate API Keys</h3>
                <p>Regularly rotate your API keys to maintain security. You can have up to 5 active keys per organization.</p>

                <h3>Revoke a Key</h3>
                <CodeBlock code={`curl -X DELETE "${API_BASE_URL}/api/v1/api-keys/{key_id}" \\
  -H "X-API-Key: nex_your_api_key_here"`} />
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="doc-section">
              <div className="endpoint-intro">
                <h2>API Reference</h2>
                <p>Complete reference for all Nexula API endpoints. Each endpoint includes request/response examples in multiple languages.</p>
              </div>

              <div className="doc-card endpoint-card" id="list-projects">
                <div className="endpoint-header">
                  <span className="method-badge get">GET</span>
                  <code className="endpoint-path">/api/v1/projects</code>
                  <span className="scope-badge">project:read</span>
                </div>
                <p>Retrieve a list of all projects in your organization.</p>

                <h4>Query Parameters</h4>
                <table className="api-table compact">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>limit</code></td>
                      <td>integer</td>
                      <td>No</td>
                      <td>Number of results (default: 20, max: 100)</td>
                    </tr>
                    <tr>
                      <td><code>cursor</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Pagination cursor</td>
                    </tr>
                    <tr>
                      <td><code>status</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Filter by status: active, archived</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Example Request</h4>
                <MultiLanguageCodeBlock samples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    icon: <SiCurl size={14} />,
                    code: `curl -X GET "${API_BASE_URL}/api/v1/projects?limit=10" \\
  -H "X-API-Key: nex_your_api_key_here"`
                  },
                  {
                    language: 'python',
                    label: 'Python',
                    icon: <FaPython size={14} />,
                    code: `from nexula import NexulaClient

client = NexulaClient(api_key="nex_your_api_key_here")
projects = client.projects.list(limit=10)

for project in projects:
    print(f"{project.name}: {project.id}")`
                  },
                  {
                    language: 'javascript',
                    label: 'Node.js',
                    icon: <FaNodeJs size={14} />,
                    code: `import { NexulaClient } from '@nexula/sdk';

const client = new NexulaClient({
  apiKey: process.env.NEXULA_API_KEY
});

const projects = await client.projects.list({ limit: 10 });
console.log(projects);`
                  }
                ]} />

                <h4>Response</h4>
                <CodeBlock language="json" code={`{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "ml-recommendation-engine",
      "description": "ML-powered product recommendations",
      "repository_url": "https://github.com/org/ml-rec-engine",
      "created_at": "2026-01-10T08:00:00Z",
      "last_scan": "2026-01-15T10:30:00Z",
      "risk_score": 3.2
    }
  ],
  "meta": {
    "total": 45,
    "cursor": "eyJpZCI6NDV9",
    "has_more": true
  }
}`} />
              </div>

              <div className="doc-card endpoint-card" id="unified-scan">
                <div className="endpoint-header">
                  <span className="method-badge post">POST</span>
                  <code className="endpoint-path">/api/v1/scanner/unified</code>
                  <span className="scope-badge">scan:write</span>
                </div>
                <p>Run a comprehensive security scan combining vulnerability detection, SAST analysis, and ML-specific security checks.</p>

                <h4>Request Body</h4>
                <table className="api-table compact">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>project_id</code></td>
                      <td>integer</td>
                      <td>Yes</td>
                      <td>Target project ID</td>
                    </tr>
                    <tr>
                      <td><code>scanners</code></td>
                      <td>array</td>
                      <td>No</td>
                      <td>Specific scanners to run (default: all)</td>
                    </tr>
                    <tr>
                      <td><code>branch</code></td>
                      <td>string</td>
                      <td>No</td>
                      <td>Git branch to scan (default: main)</td>
                    </tr>
                    <tr>
                      <td><code>cert_in_enabled</code></td>
                      <td>boolean</td>
                      <td>No</td>
                      <td>Enable CERT-IN compliance checks</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Example Request</h4>
                <MultiLanguageCodeBlock samples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    icon: <SiCurl size={14} />,
                    code: `curl -X POST "${API_BASE_URL}/api/v1/scanner/unified" \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "scanners": ["vulnerability", "sast", "llm_security"],
    "branch": "main",
    "cert_in_enabled": true
  }'`
                  },
                  {
                    language: 'python',
                    label: 'Python',
                    icon: <FaPython size={14} />,
                    code: `from nexula import NexulaClient

client = NexulaClient(api_key="nex_your_api_key_here")

scan = client.scanner.unified(
    project_id=1,
    scanners=["vulnerability", "sast", "llm_security"],
    branch="main",
    cert_in_enabled=True
)

print(f"Scan started: {scan.id}")`
                  }
                ]} />

                <h4>Response</h4>
                <CodeBlock language="json" code={`{
  "status": "success",
  "data": {
    "scan_id": 12345,
    "status": "running",
    "project_id": 1,
    "scanners": ["vulnerability", "sast", "llm_security"],
    "estimated_duration_seconds": 120,
    "created_at": "2024-01-15T10:30:00Z"
  }
}`} />
              </div>

              <div className="doc-card endpoint-card" id="generate-aibom">
                <div className="endpoint-header">
                  <span className="method-badge post">POST</span>
                  <code className="endpoint-path">/api/v1/aibom/generate</code>
                  <span className="scope-badge">aibom:write</span>
                </div>
                <p>Generate an AI Bill of Materials (AIBOM) for a project, discovering all AI/ML assets including models, datasets, frameworks, and dependencies.</p>

                <h4>Request Body</h4>
                <table className="api-table compact">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>project_id</code></td>
                      <td>integer</td>
                      <td>Yes</td>
                      <td>Target project ID</td>
                    </tr>
                    <tr>
                      <td><code>deep_scan</code></td>
                      <td>boolean</td>
                      <td>No</td>
                      <td>Enable deep dependency analysis</td>
                    </tr>
                    <tr>
                      <td><code>include_cloud</code></td>
                      <td>boolean</td>
                      <td>No</td>
                      <td>Include cloud ML resources (SageMaker, etc.)</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Example Request</h4>
                <CodeBlock code={`curl -X POST "${API_BASE_URL}/api/v1/aibom/generate" \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": 1,
    "deep_scan": true,
    "include_cloud": true
  }'`} />
              </div>

              <div className="see-all-endpoints">
                <p>View all 30+ API endpoints in our complete reference.</p>
                <a href="https://api.nexula.one/docs" target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Open Full API Reference →
                </a>
              </div>
            </div>
          )}

          {activeTab === 'sdks' && (
            <div className="doc-section">
              <div className="doc-card" id="cli-installation">
                <div className="card-header">
                  <h2>Nexula CLI</h2>
                  <span className="header-badge">v2.1.0</span>
                </div>
                <p>The Nexula CLI is the fastest way to integrate security scanning into your workflow.</p>

                <h3>Installation</h3>
                <div className="install-options">
                  <div className="install-option">
                    <h4>pip (Python 3.8+)</h4>
                    <CodeBlock code="pip install nexula-cli" />
                  </div>
                  <div className="install-option">
                    <h4>Homebrew (macOS)</h4>
                    <CodeBlock code="brew install nexula/tap/nexula-cli" />
                  </div>
                  <div className="install-option">
                    <h4>Docker</h4>
                    <CodeBlock code="docker pull nexula/cli:latest" />
                  </div>
                </div>

                <h3>Quick Start</h3>
                <CodeBlock code={`# Authenticate with your API key
nexula auth login

# Initialize in your project
cd /path/to/your/ai-project
nexula init

# Generate AIBOM
nexula aibom generate

# Run security scan
nexula scan run --wait

# View results
nexula scan results`} />
              </div>

              <div className="doc-card" id="cli-commands">
                <div className="card-header">
                  <h2>CLI Commands Reference</h2>
                </div>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Command</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>nexula auth login</code></td>
                      <td>Authenticate with your API key</td>
                    </tr>
                    <tr>
                      <td><code>nexula auth whoami</code></td>
                      <td>Show current authenticated user</td>
                    </tr>
                    <tr>
                      <td><code>nexula init</code></td>
                      <td>Initialize Nexula in current project</td>
                    </tr>
                    <tr>
                      <td><code>nexula aibom generate</code></td>
                      <td>Generate AI Bill of Materials</td>
                    </tr>
                    <tr>
                      <td><code>nexula scan run [--wait]</code></td>
                      <td>Run security scan</td>
                    </tr>
                    <tr>
                      <td><code>nexula scan results [scan_id]</code></td>
                      <td>View scan results</td>
                    </tr>
                    <tr>
                      <td><code>nexula scan remediate [scan_id]</code></td>
                      <td>Interactive remediation wizard</td>
                    </tr>
                    <tr>
                      <td><code>nexula scan fix [finding_id]</code></td>
                      <td>Apply automated fix</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="doc-card" id="cicd-integration">
                <div className="card-header">
                  <h2>CI/CD Integration</h2>
                </div>

                <div className="cicd-tabs">
                  <h3>GitHub Actions</h3>
                  <CodeBlock language="yaml" showLineNumbers code={`name: Nexula Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Nexula CLI
        run: pip install nexula-cli

      - name: Run Security Scan
        env:
          NEXULA_API_KEY: \${{ secrets.NEXULA_API_KEY }}
        run: |
          nexula auth login --api-key \$NEXULA_API_KEY
          nexula init --workspace-id 1 --project-id 1
          nexula aibom generate
          nexula scan run --wait --fail-on critical`} />
                </div>

                <div className="cicd-tabs">
                  <h3>GitLab CI</h3>
                  <CodeBlock language="yaml" showLineNumbers code={`nexula-scan:
  image: python:3.11
  stage: security
  script:
    - pip install nexula-cli
    - nexula auth login --api-key \$NEXULA_API_KEY
    - nexula init --workspace-id 1 --project-id 1
    - nexula aibom generate
    - nexula scan run --wait --fail-on critical
  only:
    - main
    - merge_requests`} />
                </div>

                <div className="cicd-tabs">
                  <h3>Jenkins</h3>
                  <CodeBlock language="groovy" showLineNumbers code={`pipeline {
    agent any
    environment {
        NEXULA_API_KEY = credentials('nexula-api-key')
    }
    stages {
        stage('Security Scan') {
            steps {
                sh 'pip install nexula-cli'
                sh 'nexula auth login --api-key \$NEXULA_API_KEY'
                sh 'nexula init --workspace-id 1 --project-id 1'
                sh 'nexula aibom generate'
                sh 'nexula scan run --wait --fail-on critical'
            }
        }
    }
}`} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="doc-section">
              <div className="doc-card" id="webhook-setup">
                <div className="card-header">
                  <h2>Webhook Setup</h2>
                </div>
                <p>Webhooks allow you to receive real-time notifications when events occur in Nexula.</p>

                <h3>Create a Webhook</h3>
                <CodeBlock code={`curl -X POST "${API_BASE_URL}/api/v1/webhooks" \\
  -H "X-API-Key: nex_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks/nexula",
    "events": ["scan.completed", "vulnerability.critical"],
    "secret": "whsec_your_webhook_secret"
  }'`} />
              </div>

              <div className="doc-card" id="webhook-events">
                <div className="card-header">
                  <h2>Event Types</h2>
                </div>
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>scan.started</code></td>
                      <td>Security scan has been initiated</td>
                    </tr>
                    <tr>
                      <td><code>scan.completed</code></td>
                      <td>Security scan has finished</td>
                    </tr>
                    <tr>
                      <td><code>scan.failed</code></td>
                      <td>Security scan encountered an error</td>
                    </tr>
                    <tr>
                      <td><code>vulnerability.critical</code></td>
                      <td>Critical vulnerability detected</td>
                    </tr>
                    <tr>
                      <td><code>vulnerability.high</code></td>
                      <td>High severity vulnerability detected</td>
                    </tr>
                    <tr>
                      <td><code>aibom.generated</code></td>
                      <td>AIBOM generation completed</td>
                    </tr>
                    <tr>
                      <td><code>compliance.violation</code></td>
                      <td>Compliance violation detected</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="doc-card" id="webhook-security">
                <div className="card-header">
                  <h2>Security & Verification</h2>
                </div>
                <p>Verify webhook signatures to ensure requests are from Nexula:</p>
                <CodeBlock language="python" code={`import hmac
import hashlib

def verify_webhook(payload: bytes, signature: str, secret: str) -> bool:
    """Verify webhook signature"""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected}", signature)

# In your webhook handler:
signature = request.headers.get("X-Nexula-Signature")
is_valid = verify_webhook(request.body, signature, WEBHOOK_SECRET)`} />
              </div>

              <div className="doc-card" id="webhook-payloads">
                <div className="card-header">
                  <h2>Payload Reference</h2>
                </div>
                <h4>scan.completed</h4>
                <CodeBlock language="json" code={`{
  "event": "scan.completed",
  "timestamp": "2026-01-15T10:30:00Z",
  "data": {
    "scan_id": 12345,
    "project_id": 1,
    "project_name": "ml-recommendation-engine",
    "status": "completed",
    "duration_seconds": 145,
    "findings": {
      "critical": 2,
      "high": 5,
      "medium": 12,
      "low": 8
    }
  }
}`} />
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="doc-section">
              <div className="doc-card" id="v2-1-0">
                <div className="card-header">
                  <h2>v2.1.0</h2>
                  <span className="header-badge success">Latest</span>
                  <span className="release-date">January 2026</span>
                </div>
                <div className="changelog-content">
                  <h4>New Features</h4>
                  <ul>
                    <li><span className="changelog-tag new">New</span> Interactive remediation wizard in CLI</li>
                    <li><span className="changelog-tag new">New</span> CERT-IN compliance integration for India region</li>
                    <li><span className="changelog-tag new">New</span> Model Drift monitoring scanner</li>
                    <li><span className="changelog-tag new">New</span> Zero-day threat detection</li>
                  </ul>
                  <h4>Improvements</h4>
                  <ul>
                    <li><span className="changelog-tag improved">Improved</span> 60% faster vulnerability scanning</li>
                    <li><span className="changelog-tag improved">Improved</span> Enhanced AI analysis with Nexula-8B model</li>
                    <li><span className="changelog-tag improved">Improved</span> Better version detection from AIBOM</li>
                  </ul>
                  <h4>Bug Fixes</h4>
                  <ul>
                    <li><span className="changelog-tag fixed">Fixed</span> Rate limit headers now correctly reset</li>
                    <li><span className="changelog-tag fixed">Fixed</span> Pagination cursor handling for large datasets</li>
                  </ul>
                </div>
              </div>

              <div className="doc-card" id="v2-0-0">
                <div className="card-header">
                  <h2>v2.0.0</h2>
                  <span className="release-date">December 2025</span>
                </div>
                <div className="changelog-content">
                  <h4>Breaking Changes</h4>
                  <ul>
                    <li><span className="changelog-tag breaking">Breaking</span> API key prefix changed from <code>nex_</code> to <code>nex_live_</code></li>
                    <li><span className="changelog-tag breaking">Breaking</span> Response format updated with new <code>meta</code> field</li>
                  </ul>
                  <h4>New Features</h4>
                  <ul>
                    <li><span className="changelog-tag new">New</span> Unified scanner endpoint</li>
                    <li><span className="changelog-tag new">New</span> GitHub App integration</li>
                    <li><span className="changelog-tag new">New</span> SBOM export in CycloneDX/SPDX formats</li>
                  </ul>
                </div>
              </div>

              <div className="doc-card" id="deprecations">
                <div className="card-header">
                  <h2>Deprecations</h2>
                </div>
                <div className="deprecation-notice">
                  <h4>Deprecated in v2.0</h4>
                  <table className="api-table compact">
                    <thead>
                      <tr>
                        <th>Deprecated</th>
                        <th>Replacement</th>
                        <th>Removal Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>POST /scan/start</code></td>
                        <td><code>POST /scanner/unified</code></td>
                        <td>March 2026</td>
                      </tr>
                      <tr>
                        <td><code>nex_</code> key prefix</td>
                        <td><code>nex_live_</code> / <code>nex_test_</code></td>
                        <td>June 2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Links */}
        <aside className="api-doc-right-sidebar">
          <div className="quick-links">
            <h4>Quick Links</h4>
            <a href="https://cloud.nexula.one/api-keys"><GrKey /> Get API Key</a>
            <a href="https://status.nexula.one"><GrStatusGood /> API Status</a>
            <a href="https://github.com/nexula/nexula-cli"><GrDownload /> Download CLI</a>
            <a href="mailto:support@nexula.one"><GrCircleAlert /> Report Issue</a>
          </div>
          <div className="sdk-downloads">
            <h4>Integrations</h4>
            <a href="https://github.com/nexula-ai/nexula-cli" target="_blank" rel="noopener noreferrer" className="sdk-link">
              <GrTerminal /> Nexula CLI
            </a>
            <a href="https://marketplace.visualstudio.com/items?itemName=nexula.nexula-vscode" target="_blank" rel="noopener noreferrer" className="sdk-link">
              <GrCode /> VSCode Extension
            </a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="api-doc-footer">
        <div className="footer-bottom">
          <p>© 2026 Nexula AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ApiDocumentation;
