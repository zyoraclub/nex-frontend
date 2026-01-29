import { useState } from 'react';
import { FaGithub, FaGitlab, FaBitbucket, FaAws, FaSlack, FaJira, FaDocker, FaGoogle, FaSearch, FaChevronDown, FaChevronRight, FaExternalLinkAlt, FaCheckCircle, FaLock, FaCog } from 'react-icons/fa';
import { SiHuggingface, SiPagerduty } from 'react-icons/si';
import { TbBrandAzure } from 'react-icons/tb';
import { VscAzureDevops } from 'react-icons/vsc';
import { GrBook, GrIntegration, GrShield, GrCloud, GrNotification, GrCode, GrConfigure } from 'react-icons/gr';
import './IntegrationsDocumentation.css';

interface Integration {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  category: string;
  setupSteps: string[];
  features: string[];
  permissions: string[];
  docsUrl?: string;
  status?: 'stable' | 'beta' | 'new';
}

export default function IntegrationsDocumentation() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Integrations', icon: <GrIntegration />, count: 12 },
    { id: 'source-control', name: 'Source Control', icon: <GrCode />, count: 4 },
    { id: 'cloud-ml', name: 'Cloud ML Platforms', icon: <GrCloud />, count: 3 },
    { id: 'container', name: 'Container Registries', icon: <FaDocker />, count: 3 },
    { id: 'notifications', name: 'Notifications', icon: <GrNotification />, count: 3 },
    { id: 'ticketing', name: 'Issue Tracking', icon: <FaCog />, count: 1 },
  ];

  const integrations: Integration[] = [
    // Source Control
    {
      name: 'GitHub',
      icon: <FaGithub />,
      color: '#fff',
      category: 'source-control',
      description: 'Connect GitHub repositories for comprehensive AI/ML code scanning, automated AIBOM generation, and security-aware PR workflows.',
      setupSteps: [
        'Navigate to Settings → Integrations in your Nexula dashboard',
        'Click "Connect GitHub" and select authentication method',
        'Choose OAuth for personal accounts or GitHub App for organizations',
        'Authorize Nexula and select repositories to monitor',
        'Configure scanning preferences and webhook settings',
        'Click "Complete Setup" to activate the integration'
      ],
      features: [
        'Automated repository scanning on push/PR events',
        'AIBOM generation from repository contents',
        'Dependency vulnerability analysis',
        'Auto-PR creation with security fixes',
        'PR comments with scan results summary',
        'GitHub Checks integration for CI/CD gates',
        'Branch protection rule enforcement'
      ],
      permissions: [
        'Contents: Read - Access repository files',
        'Metadata: Read - Repository information',
        'Pull Requests: Write - Create remediation PRs',
        'Checks: Write - Report scan status (App only)',
        'Webhooks: Read/Write - Event notifications'
      ],
      status: 'stable',
      docsUrl: '/api-docs?tab=webhooks'
    },
    {
      name: 'GitLab',
      icon: <FaGitlab />,
      color: '#FC6D26',
      category: 'source-control',
      description: 'Integrate GitLab projects for enterprise-grade AI security analysis with CI/CD pipeline integration and merge request workflows.',
      setupSteps: [
        'Go to Settings → Integrations → GitLab',
        'Enter your GitLab instance URL (gitlab.com or self-hosted)',
        'Generate a Personal Access Token with api and read_repository scopes',
        'Paste the token and click "Verify Connection"',
        'Select projects to monitor from the list',
        'Configure pipeline triggers and save'
      ],
      features: [
        'Project and group-level scanning',
        'CI/CD pipeline integration via .gitlab-ci.yml',
        'Merge request security comments',
        'Security reports in GitLab Security Dashboard',
        'Scheduled scanning support'
      ],
      permissions: [
        'api - Full API access',
        'read_repository - Clone repositories',
        'read_user - User information'
      ],
      status: 'stable'
    },
    {
      name: 'Bitbucket',
      icon: <FaBitbucket />,
      color: '#0052CC',
      category: 'source-control',
      description: 'Connect Bitbucket Cloud or Server repositories for AI asset discovery and automated security scanning.',
      setupSteps: [
        'Navigate to Integrations → Bitbucket',
        'Click "Connect Bitbucket" to start OAuth flow',
        'Authorize Nexula in your Atlassian account',
        'Select workspace and repositories to monitor',
        'Configure branch filters and save'
      ],
      features: [
        'Repository scanning with branch filters',
        'Pull request build status integration',
        'Automated scanning on push events',
        'Bitbucket Pipelines compatibility'
      ],
      permissions: [
        'Repository: Read - Access code',
        'Pull Request: Read/Write - Status updates',
        'Webhook: Manage - Event subscriptions'
      ],
      status: 'stable'
    },
    {
      name: 'Azure DevOps',
      icon: <VscAzureDevops />,
      color: '#0078D4',
      category: 'source-control',
      description: 'Integrate Azure DevOps repositories and pipelines for enterprise security scanning with work item tracking.',
      setupSteps: [
        'Go to Integrations → Azure DevOps',
        'Enter your Azure DevOps organization URL',
        'Generate a Personal Access Token with Code (Read) scope',
        'Paste token and verify connection',
        'Select projects and repositories',
        'Configure pipeline service connections'
      ],
      features: [
        'Azure Repos Git scanning',
        'Azure Pipelines integration',
        'Work item auto-creation for findings',
        'Azure Boards integration',
        'Service connection for pipeline tasks'
      ],
      permissions: [
        'Code (Read) - Repository access',
        'Project and Team (Read) - Project metadata',
        'Work Items (Read/Write) - Issue tracking',
        'Build (Read/Execute) - Pipeline integration'
      ],
      status: 'stable'
    },
    // Cloud ML Platforms
    {
      name: 'AWS SageMaker',
      icon: <FaAws />,
      color: '#FF9900',
      category: 'cloud-ml',
      description: 'Discover and scan ML models, endpoints, training jobs, and feature stores in your AWS SageMaker environment.',
      setupSteps: [
        'Navigate to Integrations → AWS SageMaker',
        'Create an IAM user or role with required permissions',
        'Enter AWS Access Key ID and Secret Access Key',
        'Select AWS region(s) to scan',
        'Click "Discover Resources" to inventory assets',
        'Configure scheduled discovery (optional)'
      ],
      features: [
        'Model registry scanning',
        'Endpoint security assessment',
        'Training job analysis',
        'Feature store discovery',
        'Model artifact inspection',
        'IAM permission analysis'
      ],
      permissions: [
        'sagemaker:ListModels',
        'sagemaker:DescribeModel',
        'sagemaker:ListEndpoints',
        'sagemaker:DescribeEndpoint',
        'sagemaker:ListTrainingJobs',
        's3:GetObject (for model artifacts)'
      ],
      status: 'stable'
    },
    {
      name: 'HuggingFace Hub',
      icon: <SiHuggingface />,
      color: '#FFD21E',
      category: 'cloud-ml',
      description: 'Scan models, datasets, and spaces from HuggingFace Hub for license compliance and security vulnerabilities.',
      setupSteps: [
        'Go to Integrations → HuggingFace',
        'Log in to HuggingFace and go to Settings → Access Tokens',
        'Create a new token with read access',
        'Paste token in Nexula and verify',
        'Select organization/user scope',
        'Enable auto-discovery for new models'
      ],
      features: [
        'Model card analysis',
        'License compliance checking',
        'Dataset security scanning',
        'Space monitoring',
        'Model lineage tracking',
        'Vulnerability detection in model dependencies'
      ],
      permissions: [
        'Read access to models',
        'Read access to datasets',
        'Read access to spaces',
        'Organization membership (for org models)'
      ],
      status: 'stable'
    },
    {
      name: 'Azure ML',
      icon: <TbBrandAzure />,
      color: '#0078D4',
      category: 'cloud-ml',
      description: 'Connect Azure Machine Learning workspaces for model registry scanning and compute security analysis.',
      setupSteps: [
        'Navigate to Integrations → Azure ML',
        'Create a service principal in Azure Portal',
        'Assign "Reader" role on ML workspace',
        'Enter Tenant ID, Client ID, and Client Secret',
        'Select subscription and workspace',
        'Test connection and save'
      ],
      features: [
        'Model registry scanning',
        'Compute instance security',
        'Environment analysis',
        'Pipeline inspection',
        'Datastore access review'
      ],
      permissions: [
        'Reader role on ML workspace',
        'Storage Blob Data Reader (optional)',
        'Key Vault Secrets User (optional)'
      ],
      status: 'beta'
    },
    // Container Registries
    {
      name: 'AWS ECR',
      icon: <FaDocker />,
      color: '#FF9900',
      category: 'container',
      description: 'Scan container images for vulnerabilities in Amazon Elastic Container Registry with automated findings.',
      setupSteps: [
        'Go to Integrations → AWS ECR',
        'Enter AWS credentials with ECR permissions',
        'Select AWS region',
        'Click "Discover Repositories"',
        'Select repositories to monitor',
        'Enable scan-on-push (recommended)'
      ],
      features: [
        'Repository auto-discovery',
        'Image vulnerability scanning',
        'Scan findings aggregation',
        'Layer-by-layer analysis',
        'Base image tracking',
        'Scan-on-push automation'
      ],
      permissions: [
        'ecr:DescribeRepositories',
        'ecr:DescribeImages',
        'ecr:DescribeImageScanFindings',
        'ecr:StartImageScan',
        'ecr:GetAuthorizationToken'
      ],
      status: 'stable'
    },
    {
      name: 'Google Artifact Registry',
      icon: <FaGoogle />,
      color: '#4285F4',
      category: 'container',
      description: 'Manage and scan container images and packages in Google Cloud Artifact Registry.',
      setupSteps: [
        'Navigate to Integrations → Google Artifact Registry',
        'Create a service account in GCP Console',
        'Grant "Artifact Registry Reader" role',
        'Download JSON key file',
        'Upload or paste JSON key in Nexula',
        'Select project and regions'
      ],
      features: [
        'Multi-format support (Docker, npm, Maven, etc.)',
        'Repository discovery across regions',
        'Package version tracking',
        'Vulnerability scanning integration',
        'Access audit logging'
      ],
      permissions: [
        'artifactregistry.repositories.list',
        'artifactregistry.packages.list',
        'artifactregistry.versions.list',
        'artifactregistry.files.get'
      ],
      status: 'stable'
    },
    {
      name: 'Azure Container Registry',
      icon: <VscAzureDevops />,
      color: '#0078D4',
      category: 'container',
      description: 'Connect Azure Container Registry for enterprise container image management and security scanning.',
      setupSteps: [
        'Go to Integrations → Azure Container Registry',
        'Create a service principal in Azure Portal',
        'Assign "AcrPull" role to the service principal',
        'Enter registry name and Azure AD credentials',
        'Verify connection and discover repositories',
        'Configure scan schedule'
      ],
      features: [
        'Registry repository listing',
        'Image tag management',
        'Manifest inspection',
        'Vulnerability scanning',
        'Geo-replication support',
        'Private endpoint compatibility'
      ],
      permissions: [
        'AcrPull - Pull images',
        'AcrPush - Push images (optional)',
        'Reader - Registry metadata'
      ],
      status: 'stable'
    },
    // Notifications
    {
      name: 'Slack',
      icon: <FaSlack />,
      color: '#4A154B',
      category: 'notifications',
      description: 'Receive real-time security alerts, scan results, and vulnerability notifications directly in Slack channels.',
      setupSteps: [
        'Navigate to Integrations → Slack',
        'Click "Add to Slack" button',
        'Select your Slack workspace',
        'Choose channel(s) for notifications',
        'Configure alert severity thresholds',
        'Customize message format preferences'
      ],
      features: [
        'Real-time scan completion alerts',
        'Critical vulnerability notifications',
        'Daily/weekly security digests',
        'Interactive message actions',
        'Channel-based routing by project',
        'Custom webhook support'
      ],
      permissions: [
        'chat:write - Post messages',
        'channels:read - List channels',
        'incoming-webhook - Webhook access'
      ],
      status: 'stable'
    },
    {
      name: 'PagerDuty',
      icon: <SiPagerduty />,
      color: '#06AC38',
      category: 'notifications',
      description: 'Create incidents for critical security findings with severity-based routing and on-call escalation.',
      setupSteps: [
        'Go to Integrations → PagerDuty',
        'Click "Connect PagerDuty"',
        'Authorize Nexula OAuth application',
        'Select service for incident creation',
        'Configure severity mapping',
        'Set up escalation thresholds'
      ],
      features: [
        'Automatic incident creation',
        'Severity-based routing',
        'On-call schedule integration',
        'Escalation policy support',
        'Incident deduplication',
        'Custom urgency mapping'
      ],
      permissions: [
        'incidents:write - Create incidents',
        'services:read - List services',
        'escalation_policies:read - Policy info'
      ],
      status: 'stable'
    },
    // Issue Tracking
    {
      name: 'Jira',
      icon: <FaJira />,
      color: '#0052CC',
      category: 'ticketing',
      description: 'Automatically create and track security issues in Jira with customizable templates and field mapping.',
      setupSteps: [
        'Navigate to Integrations → Jira',
        'Enter your Jira instance URL',
        'Authenticate via OAuth or API token',
        'Select project for issue creation',
        'Configure issue type mapping',
        'Set up custom field mappings'
      ],
      features: [
        'Automatic issue creation',
        'Custom field mapping',
        'Priority assignment rules',
        'Component/label tagging',
        'Issue linking support',
        'Status sync back to Nexula',
        'Bulk issue creation'
      ],
      permissions: [
        'Browse projects',
        'Create issues',
        'Edit issues',
        'Add comments',
        'Transition issues'
      ],
      status: 'stable'
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleCardExpansion = (name: string) => {
    setExpandedCard(expandedCard === name ? null : name);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <span className="status-badge new">New</span>;
      case 'beta':
        return <span className="status-badge beta">Beta</span>;
      default:
        return <span className="status-badge stable">Stable</span>;
    }
  };

  return (
    <div className="integrations-docs">
      {/* Navigation */}
      <nav className="docs-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <img src="/images/logo/nexula.png" alt="Nexula" className="logo-image" />
            <span className="logo-divider">/</span>
            <span className="logo-section">Integrations</span>
          </div>
          <div className="navbar-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="navbar-menu">
            <a href="/api-docs" className="nav-link">API Docs</a>
            <a href="https://cloud.nexula.one/login" className="nav-link nav-link-primary">Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="docs-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <GrIntegration /> {integrations.length} Integrations Available
          </div>
          <h1>Connect Your AI/ML Stack</h1>
          <p>
            Seamlessly integrate Nexula with your existing development workflow.
            Connect source control, cloud platforms, and notification services for comprehensive AI security coverage.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">4</span>
              <span className="stat-label">Source Control</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Cloud ML Platforms</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Container Registries</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="docs-main">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <div className="sidebar-section">
            <h4>Categories</h4>
            <nav className="sidebar-nav">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`sidebar-link ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="sidebar-icon">{cat.icon}</span>
                  <span className="sidebar-label">{cat.name}</span>
                  <span className="sidebar-count">{cat.count}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="sidebar-section">
            <h4>Quick Links</h4>
            <a href="/api-docs" className="sidebar-external-link">
              <GrBook /> API Documentation
            </a>
            <a href="mailto:support@nexula.one" className="sidebar-external-link">
              <GrShield /> Security Support
            </a>
            <a href="https://github.com/nexula-ai/nexula-cli" target="_blank" rel="noopener noreferrer" className="sidebar-external-link">
              <GrCode /> Nexula CLI
            </a>
          </div>
        </aside>

        {/* Integration Cards */}
        <div className="docs-content">
          <div className="content-header">
            <h2>
              {activeCategory === 'all'
                ? 'All Integrations'
                : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            <span className="results-count">{filteredIntegrations.length} integrations</span>
          </div>

          <div className="integrations-grid">
            {filteredIntegrations.map((integration) => (
              <div
                key={integration.name}
                className={`integration-card ${expandedCard === integration.name ? 'expanded' : ''}`}
              >
                <div className="card-header" onClick={() => toggleCardExpansion(integration.name)}>
                  <div className="card-icon" style={{ color: integration.color }}>
                    {integration.icon}
                  </div>
                  <div className="card-title">
                    <h3>{integration.name}</h3>
                    {getStatusBadge(integration.status)}
                  </div>
                  <button className="expand-btn">
                    {expandedCard === integration.name ? <FaChevronDown /> : <FaChevronRight />}
                  </button>
                </div>

                <p className="card-description">{integration.description}</p>

                {expandedCard === integration.name && (
                  <div className="card-details">
                    <div className="detail-section">
                      <h4><FaCog /> Setup Instructions</h4>
                      <ol className="setup-steps">
                        {integration.setupSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="detail-section">
                      <h4><FaCheckCircle /> Features</h4>
                      <ul className="features-list">
                        {integration.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="detail-section">
                      <h4><FaLock /> Required Permissions</h4>
                      <ul className="permissions-list">
                        {integration.permissions.map((permission, i) => (
                          <li key={i}><code>{permission}</code></li>
                        ))}
                      </ul>
                    </div>

                    {integration.docsUrl && (
                      <a href={integration.docsUrl} className="docs-link">
                        <FaExternalLinkAlt /> View API Documentation
                      </a>
                    )}
                  </div>
                )}

                <div className="card-actions">
                  <a
                    href="https://cloud.nexula.one/integrations"
                    className="setup-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Configure Integration
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="no-results">
              <GrIntegration className="no-results-icon" />
              <h3>No integrations found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="docs-footer">
        <div className="footer-content">
          <p>© 2026 Nexula AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
