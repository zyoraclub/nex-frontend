import { useState } from 'react';
import { FaGithub, FaGitlab, FaBitbucket, FaAws, FaSlack, FaJira, FaDocker, FaGoogle } from 'react-icons/fa';
import { SiHuggingface, SiPagerduty } from 'react-icons/si';
import { VscAzureDevops } from 'react-icons/vsc';
import './IntegrationsDocumentation.css';

export default function IntegrationsDocumentation() {
  const [activeTab, setActiveTab] = useState('source');

  const sourceIntegrations = [
    {
      name: 'GitHub',
      icon: <FaGithub />,
      color: '#fff',
      description: 'Connect GitHub repositories for code scanning, AIBOM generation, and automated PR creation',
      setupSteps: [
        'Go to Integrations page and click "Connect GitHub"',
        'Choose OAuth (personal) or GitHub App (organization)',
        'Authorize Nexula to access your repositories',
        'For GitHub App: Install app on organization/repositories',
        'Select repositories you want to scan',
        'Click "Connect" to complete setup'
      ],
      features: [
        'Repository scanning',
        'AIBOM generation',
        'Dependency analysis',
        'Security scanning',
        '🎉 NEW: Auto-PR creation after scans',
        '🎉 NEW: PR comments with scan results',
        '🎉 NEW: GitHub Checks integration'
      ],
      permissions: [
        'Read repository contents',
        'Access repository metadata',
        'Create pull requests (for auto-remediation)',
        'Write checks (GitHub App only)',
        'Comment on pull requests (GitHub App only)'
      ]
    },
    {
      name: 'GitLab',
      icon: <FaGitlab />,
      color: '#FC6D26',
      description: 'Integrate GitLab projects for comprehensive AI security analysis',
      setupSteps: [
        'Navigate to Integrations and select GitLab',
        'Generate a Personal Access Token in GitLab Settings',
        'Paste the token and select projects',
        'Save integration'
      ],
      features: ['Project scanning', 'CI/CD integration', 'Merge request analysis', 'Security reports'],
      permissions: ['Read API', 'Read repository']
    },
    {
      name: 'Bitbucket',
      icon: <FaBitbucket />,
      color: '#0052CC',
      description: 'Connect Bitbucket repositories for AI asset discovery',
      setupSteps: [
        'Click "Connect Bitbucket" in Integrations',
        'Authorize Nexula OAuth application',
        'Choose repositories to monitor',
        'Complete connection'
      ],
      features: ['Repository analysis', 'Branch scanning', 'Pull request checks', 'Automated scanning'],
      permissions: ['Read repositories', 'Access account information']
    },
    {
      name: 'Azure DevOps',
      icon: <VscAzureDevops />,
      color: '#0078D4',
      description: 'Integrate Azure DevOps repositories for enterprise-grade scanning',
      setupSteps: [
        'Go to Azure DevOps integration page',
        'Enter your organization URL',
        'Generate and provide Personal Access Token',
        'Select repositories and connect'
      ],
      features: ['Repository scanning', 'Pipeline integration', 'Work item tracking', 'Security analysis'],
      permissions: ['Code (Read)', 'Project and Team (Read)']
    },
    {
      name: 'AWS SageMaker',
      icon: <FaAws />,
      color: '#FF9900',
      description: 'Discover and scan ML models, endpoints, and training jobs',
      setupSteps: [
        'Navigate to AWS SageMaker integration',
        'Provide AWS Access Key ID and Secret Key',
        'Select AWS region',
        'Click "Discover Resources" to scan'
      ],
      features: ['Model discovery', 'Endpoint scanning', 'Training job analysis', 'Security assessment'],
      permissions: ['SageMaker:ListModels', 'SageMaker:DescribeModel', 'SageMaker:ListEndpoints']
    },
    {
      name: 'AWS ECR',
      icon: <FaDocker />,
      color: '#FF9900',
      description: 'Scan container images for vulnerabilities in Amazon ECR',
      setupSteps: [
        'Navigate to AWS ECR integration page',
        'Provide AWS Access Key ID and Secret Access Key',
        'Select AWS region',
        'Click "Connect" to test connection',
        'Discover repositories and scan images'
      ],
      features: ['Repository discovery', 'Image scanning', 'Vulnerability detection', 'Scan findings analysis'],
      permissions: ['ecr:DescribeRepositories', 'ecr:DescribeImages', 'ecr:DescribeImageScanFindings', 'ecr:StartImageScan']
    },
    {
      name: 'Google Artifact Registry',
      icon: <FaGoogle />,
      color: '#4285F4',
      description: 'Manage and scan container images in Google Cloud',
      setupSteps: [
        'Go to Google Artifact Registry integration',
        'Create service account in GCP Console',
        'Grant "Artifact Registry Reader" role',
        'Download service account JSON key',
        'Paste JSON and connect'
      ],
      features: ['Repository discovery', 'Package scanning', 'Version tracking', 'Multi-region support'],
      permissions: ['artifactregistry.repositories.list', 'artifactregistry.packages.list', 'artifactregistry.versions.list']
    },
    {
      name: 'Azure Container Registry',
      icon: <VscAzureDevops />,
      color: '#0078D4',
      description: 'Manage and scan container images in Azure',
      setupSteps: [
        'Navigate to Azure Container Registry integration',
        'Create service principal in Azure Portal',
        'Assign "AcrPull" role to service principal',
        'Provide registry name, tenant ID, client ID, and secret',
        'Connect and discover repositories'
      ],
      features: ['Repository discovery', 'Tag management', 'Manifest inspection', 'Image deletion'],
      permissions: ['AcrPull', 'AcrDelete (optional)']
    },
    {
      name: 'HuggingFace',
      icon: <SiHuggingface />,
      color: '#FFD21E',
      description: 'Scan models, datasets, and spaces from HuggingFace Hub',
      setupSteps: [
        'Go to HuggingFace integration page',
        'Generate API token from HuggingFace Settings',
        'Paste token and connect',
        'Discover your models and datasets'
      ],
      features: ['Model scanning', 'Dataset analysis', 'Space monitoring', 'License compliance'],
      permissions: ['Read access to models', 'Read access to datasets']
    }
  ];

  const notificationIntegrations = [
    {
      name: 'Slack',
      icon: <FaSlack />,
      color: '#4A154B',
      description: 'Receive security alerts and scan results in Slack channels',
      setupSteps: [
        'Click "Connect Slack" in Integrations',
        'Select workspace and authorize',
        'Choose channel for notifications',
        'Configure alert preferences'
      ],
      features: ['Real-time alerts', 'Scan completion notifications', 'Critical vulnerability alerts', 'Custom webhooks'],
      permissions: ['Post messages', 'Access channel information']
    },
    {
      name: 'PagerDuty',
      icon: <SiPagerduty />,
      color: '#06AC38',
      description: 'Create incidents for critical security findings',
      setupSteps: [
        'Navigate to PagerDuty integration',
        'Authorize Nexula application',
        'Select service for incidents',
        'Set severity thresholds'
      ],
      features: ['Incident creation', 'Severity-based routing', 'On-call notifications', 'Escalation policies'],
      permissions: ['Create incidents', 'Read services']
    },
    {
      name: 'Jira',
      icon: <FaJira />,
      color: '#0052CC',
      description: 'Automatically create tickets for security vulnerabilities',
      setupSteps: [
        'Go to Jira integration page',
        'Connect your Jira workspace',
        'Select project and issue type',
        'Configure ticket templates'
      ],
      features: ['Automatic ticket creation', 'Custom field mapping', 'Priority assignment', 'Status tracking'],
      permissions: ['Create issues', 'Read projects']
    }
  ];

  const integrations = activeTab === 'source' ? sourceIntegrations : notificationIntegrations;

  return (
    <div className="integrations-docs">
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

      <div className="docs-header">
        <h1>Integrations Documentation</h1>
        <p>Learn how to connect and configure Nexula integrations</p>
      </div>

      <div className="docs-tabs">
          <button
            className={activeTab === 'source' ? 'active' : ''}
            onClick={() => setActiveTab('source')}
          >
            Source Integrations ({sourceIntegrations.length})
          </button>
          <button
            className={activeTab === 'notification' ? 'active' : ''}
            onClick={() => setActiveTab('notification')}
          >
            Notification Integrations ({notificationIntegrations.length})
          </button>
      </div>

      <div className="integrations-grid">
          {integrations.map((integration, index) => (
            <div key={index} className="integration-doc-card">
              <div className="integration-doc-header">
                <div className="integration-icon" style={{ color: integration.color }}>
                  {integration.icon}
                </div>
                <h2>{integration.name}</h2>
              </div>

              <p className="integration-description">{integration.description}</p>

              <div className="doc-section">
                <h3>Setup Instructions</h3>
                <ol className="setup-steps">
                  {integration.setupSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="doc-section">
                <h3>Features</h3>
                <ul className="features-list">
                  {integration.features.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <div className="doc-section">
                <h3>Required Permissions</h3>
                <ul className="permissions-list">
                  {integration.permissions.map((permission, i) => (
                    <li key={i}>• {permission}</li>
                  ))}
                </ul>
              </div>

              <a
                href="https://cloud.nexula.one/login"
                className="setup-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Started →
              </a>
            </div>
          ))}
      </div>

      <div className="docs-footer">
        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you encounter any issues setting up integrations, please contact our support team.</p>
          <div className="help-links">
            <a href="/api-docs">API Documentation</a>
            <a href="mailto:support@nexula.one">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}