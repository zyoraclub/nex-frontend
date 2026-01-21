import api from './api';

interface Integration {
  id: number;
  org_id: number;
  integration_type: string;
  integration_name: string;
  status: string;
  config: any;
  installation_id?: number;
  created_at: string;
  updated_at: string;
}

interface GitHubIntegrationCreate {
  integration_name: string;
  access_token: string;
  repositories: string[];
  installation_id?: number | null;
}

interface GitLabIntegrationCreate {
  integration_name: string;
  access_token: string;
  repositories: string[];
}

interface BitbucketIntegrationCreate {
  integration_name: string;
  access_token: string;
  repositories: string[];
}

interface AzureDevOpsIntegrationCreate {
  integration_name: string;
  organization_url: string;
  personal_access_token: string;
  repositories: string[];
}

interface HuggingFaceIntegrationCreate {
  integration_name: string;
  access_token: string;
}

const integrationAPI = {
  list: () => api.get<Integration[]>('/integrations/'),
  
  connectGitHub: (data: GitHubIntegrationCreate) => api.post<Integration>('/integrations/github', data),
  
  connectGitLab: (data: GitLabIntegrationCreate) => api.post<Integration>('/integrations/gitlab', data),
  
  connectBitbucket: (data: BitbucketIntegrationCreate) => api.post<Integration>('/integrations/bitbucket', data),
  
  connectAzureDevOps: (data: AzureDevOpsIntegrationCreate) => api.post<Integration>('/integrations/azuredevops', data),
  
  getGitHubRepos: () => api.get<{ repositories: any[] }>('/integrations/github/repos'),
  
  getGitLabRepos: () => api.get<{ repositories: any[] }>('/integrations/gitlab/repos'),
  
  getBitbucketRepos: () => api.get<{ repositories: any[] }>('/integrations/bitbucket/repos'),
  
  getAzureDevOpsRepos: () => api.get<{ repositories: any[] }>('/integrations/azuredevops/repos'),
  
  getSageMakerResources: () => api.get<{ resources: any }>('/integrations/aws-sagemaker/discover'),
  
  connectHuggingFace: (data: HuggingFaceIntegrationCreate) => api.post<Integration>('/integrations/huggingface', data),
  
  getHuggingFaceResources: () => api.get<{ resources: any }>('/integrations/huggingface/discover'),
  
  delete: (id: number) => api.delete(`/integrations/${id}`)
};

export default integrationAPI;
export { integrationAPI };
export type { Integration, GitHubIntegrationCreate, GitLabIntegrationCreate, BitbucketIntegrationCreate, AzureDevOpsIntegrationCreate, HuggingFaceIntegrationCreate };
