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

interface AzureMLIntegrationCreate {
  integration_name: string;
  subscription_id: string;
  resource_group: string;
  workspace_name: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

interface VertexAIIntegrationCreate {
  integration_name: string;
  project_id: string;
  service_account_json: string;
  location?: string;
}

interface NVIDIANGCIntegrationCreate {
  integration_name: string;
  api_key: string;
  org_name?: string;
  team_name?: string;
}

interface JenkinsIntegrationCreate {
  integration_name: string;
  server_url: string;
  username: string;
  api_token: string;
}

const integrationAPI = {
  list: () => api.get<Integration[]>('/integrations/'),
  
  connectGitHub: (data: GitHubIntegrationCreate) => api.post<Integration>('/integrations/github', data),
  
  connectGitLab: (data: GitLabIntegrationCreate) => api.post<Integration>('/integrations/gitlab', data),
  
  connectBitbucket: (data: BitbucketIntegrationCreate) => api.post<Integration>('/integrations/bitbucket', data),
  
  connectAzureDevOps: (data: AzureDevOpsIntegrationCreate) => api.post<Integration>('/integrations/azuredevops', data),
  
  getGitHubRepos: () => api.get<{ repositories: any[]; error?: string; token_status?: string }>('/integrations/github/repos'),
  
  getGitLabRepos: () => api.get<{ repositories: any[] }>('/integrations/gitlab/repos'),
  
  getBitbucketRepos: () => api.get<{ repositories: any[] }>('/integrations/bitbucket/repos'),
  
  getAzureDevOpsRepos: () => api.get<{ repositories: any[] }>('/integrations/azuredevops/repos'),
  
  getSageMakerResources: () => api.get<{ resources: any }>('/integrations/aws-sagemaker/discover'),
  
  connectHuggingFace: (data: HuggingFaceIntegrationCreate) => api.post<Integration>('/integrations/huggingface', data),
  
  getHuggingFaceResources: () => api.get<{ resources: any }>('/integrations/huggingface/discover'),

  // Azure ML
  connectAzureML: (data: AzureMLIntegrationCreate) => api.post<Integration>('/integrations/azure-ml', data),
  getAzureMLResources: () => api.get<{ resources: any }>('/integrations/azure-ml/discover'),

  // Vertex AI
  connectVertexAI: (data: VertexAIIntegrationCreate) => api.post<Integration>('/integrations/vertex-ai', data),
  getVertexAIResources: () => api.get<{ resources: any }>('/integrations/vertex-ai/discover'),

  // NVIDIA NGC
  connectNVIDIANGC: (data: NVIDIANGCIntegrationCreate) => api.post<Integration>('/integrations/nvidia-ngc', data),
  getNVIDIANGCResources: () => api.get<{ resources: any }>('/integrations/nvidia-ngc/discover'),

  // Jenkins
  connectJenkins: (data: JenkinsIntegrationCreate) => api.post<Integration>('/integrations/jenkins', data),
  getJenkinsResources: () => api.get<{ resources: any }>('/integrations/jenkins/discover'),

  // AWS ECR
  getAWSECRResources: () => api.get<{ resources: any }>('/integrations/aws-ecr/discover'),

  // Google Artifact Registry
  getGoogleArtifactRegistryResources: () => api.get<{ resources: any }>('/integrations/google-artifact-registry/discover'),

  // Azure Container Registry
  getAzureContainerRegistryResources: () => api.get<{ resources: any }>('/integrations/azure-container-registry/discover'),

  delete: (id: number) => api.delete(`/integrations/${id}`)
};

export default integrationAPI;
export { integrationAPI };
export type {
  Integration,
  GitHubIntegrationCreate,
  GitLabIntegrationCreate,
  BitbucketIntegrationCreate,
  AzureDevOpsIntegrationCreate,
  HuggingFaceIntegrationCreate,
  AzureMLIntegrationCreate,
  VertexAIIntegrationCreate,
  NVIDIANGCIntegrationCreate,
  JenkinsIntegrationCreate
};
