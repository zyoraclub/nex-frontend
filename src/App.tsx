import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import Workspaces from './pages/Workspaces';
import Integrations from './pages/Integrations';
import GitHubIntegration from './pages/GitHubIntegration';
import GitHubDetails from './pages/GitHubDetails';
import GitHubCallback from './pages/GitHubCallback';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import ScanHistory from './pages/ScanHistory';
import ScanDetails from './pages/ScanDetails';
import Reports from './pages/Reports';
import GitHubActionsIntegration from './pages/GitHubActionsIntegration';
import GitLabIntegration from './pages/GitLabIntegration';
import GitLabCallback from './pages/GitLabCallback';
import GitLabDetails from './pages/GitLabDetails';
import BitbucketDetails from './pages/BitbucketDetails';
import BitbucketCallback from './pages/BitbucketCallback';
import AzureDevOpsDetails from './pages/AzureDevOpsDetails';
import WebhookSettings from './pages/WebhookSettings';
import JiraIntegration from './pages/JiraIntegration';
import Trends from './pages/Trends';
import ScanComparison from './pages/ScanComparison';
import TeamManagement from './pages/TeamManagement';
import InviteAccept from './pages/InviteAccept';
import ScanPolicies from './pages/ScanPolicies';
import AuditLogs from './pages/AuditLogs';
import NotificationSettings from './pages/NotificationSettings';
import Compliance from './pages/Compliance';
import SlackIntegration from './pages/SlackIntegration';
import PagerDutyIntegration from './pages/PagerDutyIntegration';
import AWSSageMakerIntegration from './pages/AWSSageMakerIntegration';
import HuggingFaceIntegration from './pages/HuggingFaceIntegration';
import HuggingFaceDetails from './pages/HuggingFaceDetails';
import ApiKeys from './pages/ApiKeys';
import ApiDocumentation from './pages/ApiDocumentation';
import IntegrationsDocumentation from './pages/IntegrationsDocumentation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/api-docs" element={<ApiDocumentation />} />
        <Route path="/integrations-docs" element={<IntegrationsDocumentation />} />
        <Route path="/invite/:token" element={<InviteAccept />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:orgSlug/dashboard" element={<Dashboard />} />
        <Route path="/:orgSlug/trends" element={<Trends />} />
        <Route path="/:orgSlug/audit-logs" element={<AuditLogs />} />
        <Route path="/:orgSlug/compliance" element={<Compliance />} />
        <Route path="/:orgSlug/profile" element={<Organization />} />
        <Route path="/:orgSlug/workspaces" element={<Workspaces />} />
        <Route path="/:orgSlug/:workspaceSlug/projects" element={<Projects />} />
        <Route path="/:orgSlug/:workspaceSlug/team" element={<TeamManagement />} />
        <Route path="/:orgSlug/:workspaceSlug/policies" element={<ScanPolicies />} />
        <Route path="/:orgSlug/settings/notifications" element={<NotificationSettings />} />
        <Route path="/:orgSlug/projects" element={<Projects />} />
        <Route path="/:orgSlug/projects/:projectSlug" element={<ProjectDetails />} />
        <Route path="/:orgSlug/projects/:projectSlug/scans" element={<ScanHistory />} />
        <Route path="/:orgSlug/projects/:projectSlug/scans/:scanId" element={<ScanDetails />} />
        <Route path="/:orgSlug/projects/:projectSlug/compare" element={<ScanComparison />} />
        <Route path="/:orgSlug/projects/:projectSlug/scans/:scanId/reports" element={<Reports />} />
        <Route path="/:orgSlug/integrations" element={<Integrations />} />
        <Route path="/:orgSlug/integrations/github" element={<GitHubIntegration />} />
        <Route path="/:orgSlug/integrations/slack" element={<SlackIntegration />} />
        <Route path="/:orgSlug/integrations/pagerduty" element={<PagerDutyIntegration />} />
        <Route path="/:orgSlug/integrations/aws-sagemaker" element={<AWSSageMakerIntegration />} />
        <Route path="/:orgSlug/integrations/huggingface" element={<HuggingFaceDetails />} />
        <Route path="/:orgSlug/integrations/github-actions" element={<GitHubActionsIntegration />} />
        <Route path="/:orgSlug/integrations/gitlab" element={<GitLabIntegration />} />
        <Route path="/:orgSlug/integrations/gitlab-oauth" element={<GitLabDetails />} />
        <Route path="/:orgSlug/integrations/bitbucket" element={<BitbucketDetails />} />
        <Route path="/:orgSlug/integrations/azuredevops" element={<AzureDevOpsDetails />} />
        <Route path="/:orgSlug/integrations/jira" element={<JiraIntegration />} />
        <Route path="/:orgSlug/settings/webhooks" element={<WebhookSettings />} />
        <Route path="/:orgSlug/settings/api-keys" element={<ApiKeys />} />
        <Route path="/:orgSlug/api-docs" element={<ApiDocumentation />} />
        <Route path="/:orgSlug/integrations/:appName" element={<GitHubDetails />} />
        <Route path="/github-callback" element={<GitHubCallback />} />
        <Route path="/gitlab-callback" element={<GitLabCallback />} />
        <Route path="/bitbucket-callback" element={<BitbucketCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
