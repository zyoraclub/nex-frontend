import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SiGithubactions, SiHuggingface } from 'react-icons/si';
import { VscAzureDevops } from 'react-icons/vsc';
import { FaGithub, FaGitlab, FaSlack, FaAws } from 'react-icons/fa';
import { IoLogoBitbucket } from 'react-icons/io';
import { SiJira, SiPagerduty } from 'react-icons/si';

export default function Integrations() {
  const { orgSlug } = useParams();
  const navigate = useNavigate();

  const integrations = [
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      description: 'Automate security scanning in CI/CD pipeline',
      Icon: SiGithubactions,
      color: '#fec76f',
      path: `/${orgSlug}/integrations/github-actions`,
      enabled: true,
      status: 'CI/CD'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect repositories for automated scanning',
      Icon: FaGithub,
      color: '#ffffff',
      path: `/${orgSlug}/integrations/github`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'gitlab-cicd',
      name: 'GitLab CI/CD',
      description: 'Integrate with GitLab CI/CD pipelines',
      Icon: FaGitlab,
      color: '#fc6d26',
      path: `/${orgSlug}/integrations/gitlab`,
      enabled: true,
      status: 'CI/CD'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Connect repositories for automated scanning',
      Icon: FaGitlab,
      color: '#fc6d26',
      path: `/${orgSlug}/integrations/gitlab-oauth`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      description: 'Connect Bitbucket repositories',
      Icon: IoLogoBitbucket,
      color: '#2684FF',
      path: `/${orgSlug}/integrations/bitbucket`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'azuredevops',
      name: 'Azure DevOps',
      description: 'Connect Azure Repos repositories',
      Icon: VscAzureDevops,
      color: '#0078D4',
      path: `/${orgSlug}/integrations/azuredevops`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Auto-create tickets for vulnerabilities',
      Icon: SiJira,
      color: '#0052CC',
      path: `/${orgSlug}/integrations/jira`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get real-time security notifications',
      Icon: FaSlack,
      color: '#4A154B',
      path: `/${orgSlug}/integrations/slack`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      description: 'Create incidents for critical issues',
      Icon: SiPagerduty,
      color: '#06D6A0',
      path: `/${orgSlug}/integrations/pagerduty`,
      enabled: true,
      status: 'Manage'
    },
    {
      id: 'aws-sagemaker',
      name: 'AWS SageMaker',
      description: 'Discover and scan ML models, endpoints, and training jobs',
      Icon: FaAws,
      color: '#FF9900',
      path: `/${orgSlug}/integrations/aws-sagemaker`,
      enabled: true,
      status: 'ML Platform'
    },
    {
      id: 'huggingface',
      name: 'HuggingFace',
      description: 'Scan models, datasets, and spaces for security issues',
      Icon: SiHuggingface,
      color: '#FFD21E',
      path: `/${orgSlug}/integrations/huggingface`,
      enabled: true,
      status: 'ML Platform'
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
              🔗 Integrations
            </h1>
            <a
              href="/integrations-docs"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#1a1a1a',
                color: '#fec76f',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #2a2a2a',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.borderColor = '#fec76f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a1a1a';
                e.currentTarget.style.borderColor = '#2a2a2a';
              }}
            >
              📖 View Documentation
            </a>
          </div>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
            Connect your development tools to automate security scanning
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {integrations.map((integration) => (
            <div
              key={integration.id}
              onClick={() => integration.enabled && navigate(integration.path)}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                padding: '24px',
                cursor: integration.enabled ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                opacity: integration.enabled ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (integration.enabled) {
                  e.currentTarget.style.borderColor = '#fec76f';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(254, 199, 111, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (integration.enabled) {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <integration.Icon style={{ fontSize: '40px', color: integration.color }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
                    {integration.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#888888', margin: 0, lineHeight: '1.5' }}>
                    {integration.description}
                  </p>
                </div>
              </div>
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '12px', color: '#666666' }}>
                  {integration.status}
                </span>
                <span style={{ fontSize: '18px' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
