import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { projectAPI } from '../services/projectAPI';
import { workspaceAPI } from '../services/workspaceAPI';
import { integrationAPI } from '../services/integrationAPI';
import type { Project } from '../services/projectAPI';
import type { Workspace } from '../services/workspaceAPI';
import { GrAdd, GrEdit, GrTrash, GrClose } from 'react-icons/gr';
import { SiSpringsecurity } from 'react-icons/si';
import { RiTeamFill } from 'react-icons/ri';
import { SecurityScoreBadge } from '../components/SecurityScoreBadge';
import './Projects.css';

export default function Projects() {
  const navigate = useNavigate();
  const { workspaceSlug, orgSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [gitlabRepos, setGitlabRepos] = useState<any[]>([]);
  const [bitbucketRepos, setBitbucketRepos] = useState<any[]>([]);
  const [azureRepos, setAzureRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [sagemakerResources, setSagemakerResources] = useState<any>(null);
  const [huggingfaceResources, setHuggingfaceResources] = useState<any>(null);
  const [azureMLResources, setAzureMLResources] = useState<any>(null);
  const [vertexAIResources, setVertexAIResources] = useState<any>(null);
  const [nvidiaNGCResources, setNvidiaNGCResources] = useState<any>(null);
  const [jenkinsResources, setJenkinsResources] = useState<any>(null);
  const [awsECRResources, setAWSECRResources] = useState<any>(null);
  const [googleARResources, setGoogleARResources] = useState<any>(null);
  const [azureACRResources, setAzureACRResources] = useState<any>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    workspace_id: 0,
    project_name: '',
    description: '',
    source_type: 'github',
    repository_url: '',
    repository_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaces.length > 0 && workspaceSlug) {
      const workspace = workspaces.find(w => w.workspace_name.toLowerCase().replace(/\s+/g, '-') === workspaceSlug);
      if (workspace) {
        setSelectedWorkspace(workspace.id);
      }
    }
  }, [workspaceSlug, workspaces]);

  useEffect(() => {
    if (workspaces.length > 0) {
      fetchProjects();
    }
  }, [selectedWorkspace, workspaces]);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.list();
      setWorkspaces(response.data);
    } catch (err) {
      console.error('Failed to fetch workspaces');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.list(selectedWorkspace || undefined);
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setGithubRepos([]);  // Reset repos
    setLoadingRepos(true);  // Start loading state immediately
    setFormData({
      workspace_id: selectedWorkspace || workspaces[0]?.id || 0,
      project_name: '',
      description: '',
      source_type: 'github',
      repository_url: '',
      repository_name: ''
    });
    setShowModal(true);
    fetchGitHubRepos();  // Fetch after modal is shown
  };

  const fetchGitHubRepos = async () => {
    setLoadingRepos(true);
    try {
      const response = await integrationAPI.getGitHubRepos();
      console.log('GitHub repos response:', response.data);
      setGithubRepos(response.data.repositories || []);
    } catch (err) {
      console.error('Failed to fetch GitHub repos:', err);
      setGithubRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchGitLabRepos = async () => {
    try {
      const response = await integrationAPI.getGitLabRepos();
      setGitlabRepos(response.data.repositories || []);
    } catch (err: any) {
      // Integration not connected or error - silently set empty
      setGitlabRepos([]);
    }
  };

  const fetchBitbucketRepos = async () => {
    try {
      const response = await integrationAPI.getBitbucketRepos();
      setBitbucketRepos(response.data.repositories || []);
    } catch (err: any) {
      // Integration not connected or error - silently set empty
      setBitbucketRepos([]);
    }
  };

  const fetchAzureDevOpsRepos = async () => {
    try {
      const response = await integrationAPI.getAzureDevOpsRepos();
      setAzureRepos(response.data.repositories || []);
    } catch (err: any) {
      // Integration not connected or error - silently set empty
      setAzureRepos([]);
    }
  };

  const fetchSageMakerResources = async () => {
    try {
      const response = await integrationAPI.getSageMakerResources();
      setSagemakerResources(response.data.resources || null);
    } catch (err: any) {
      // Integration not connected or error - silently set null
      setSagemakerResources(null);
    }
  };

  const fetchHuggingFaceResources = async () => {
    try {
      const response = await integrationAPI.getHuggingFaceResources();
      setHuggingfaceResources(response.data.resources || null);
    } catch (err: any) {
      // Integration not connected or error - silently set null
      setHuggingfaceResources(null);
    }
  };

  const fetchAzureMLResources = async () => {
    try {
      const response = await integrationAPI.getAzureMLResources();
      setAzureMLResources(response.data.resources || null);
    } catch (err: any) {
      setAzureMLResources(null);
    }
  };

  const fetchVertexAIResources = async () => {
    try {
      const response = await integrationAPI.getVertexAIResources();
      setVertexAIResources(response.data.resources || null);
    } catch (err: any) {
      setVertexAIResources(null);
    }
  };

  const fetchNVIDIANGCResources = async () => {
    try {
      const response = await integrationAPI.getNVIDIANGCResources();
      setNvidiaNGCResources(response.data.resources || null);
    } catch (err: any) {
      setNvidiaNGCResources(null);
    }
  };

  const fetchJenkinsResources = async () => {
    try {
      const response = await integrationAPI.getJenkinsResources();
      setJenkinsResources(response.data.resources || null);
    } catch (err: any) {
      setJenkinsResources(null);
    }
  };

  const fetchAWSECRResources = async () => {
    try {
      const response = await integrationAPI.getAWSECRResources();
      setAWSECRResources(response.data.resources || null);
    } catch (err: any) {
      setAWSECRResources(null);
    }
  };

  const fetchGoogleARResources = async () => {
    try {
      const response = await integrationAPI.getGoogleArtifactRegistryResources();
      setGoogleARResources(response.data.resources || null);
    } catch (err: any) {
      setGoogleARResources(null);
    }
  };

  const fetchAzureACRResources = async () => {
    try {
      const response = await integrationAPI.getAzureContainerRegistryResources();
      setAzureACRResources(response.data.resources || null);
    } catch (err: any) {
      setAzureACRResources(null);
    }
  };

  const handleSourceTypeChange = (sourceType: string) => {
    setFormData({ ...formData, source_type: sourceType, repository_url: '', repository_name: '' });
    if (sourceType === 'github') {
      fetchGitHubRepos();
    } else if (sourceType === 'gitlab') {
      fetchGitLabRepos();
    } else if (sourceType === 'bitbucket') {
      fetchBitbucketRepos();
    } else if (sourceType === 'azuredevops') {
      fetchAzureDevOpsRepos();
    } else if (sourceType === 'aws_sagemaker') {
      fetchSageMakerResources();
    } else if (sourceType === 'huggingface') {
      fetchHuggingFaceResources();
    } else if (sourceType === 'azure_ml') {
      fetchAzureMLResources();
    } else if (sourceType === 'vertex_ai') {
      fetchVertexAIResources();
    } else if (sourceType === 'nvidia_ngc') {
      fetchNVIDIANGCResources();
    } else if (sourceType === 'jenkins') {
      fetchJenkinsResources();
    } else if (sourceType === 'aws_ecr') {
      fetchAWSECRResources();
    } else if (sourceType === 'google_artifact_registry') {
      fetchGoogleARResources();
    } else if (sourceType === 'azure_container_registry') {
      fetchAzureACRResources();
    }
  };

  const handleRepoSelect = (repo: any) => {
    setFormData({
      ...formData,
      repository_url: repo.url || repo.web_url || repo.http_url_to_repo,
      repository_name: repo.name || repo.path_with_namespace,
      project_name: formData.project_name || (repo.name || repo.path).split('/').pop()
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      workspace_id: project.workspace_id,
      project_name: project.project_name,
      description: project.description || '',
      source_type: project.source_type,
      repository_url: project.repository_url || '',
      repository_name: project.repository_name || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProject) {
        await projectAPI.update(editingProject.id, formData);
      } else {
        await projectAPI.create(formData);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectAPI.delete(id);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project');
    }
  };

  const getProjectSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <DashboardLayout>
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p className="projects-subtitle">Manage your AI/ML projects</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {workspaceSlug && (
            <>
              <button 
                className="btn-create" 
                onClick={() => navigate(`/${orgSlug}/${workspaceSlug}/policies`)}
                style={{ background: 'transparent', border: '1px solid #1a1a1a', color: '#ffffff' }}
              >
                <SiSpringsecurity size={14} />
                <span>Policies</span>
              </button>
              <button 
                className="btn-create" 
                onClick={() => navigate(`/${orgSlug}/${workspaceSlug}/team`)}
                style={{ background: 'transparent', border: '1px solid #1a1a1a', color: '#ffffff' }}
              >
                <RiTeamFill size={14} />
                <span>Team</span>
              </button>
            </>
          )}
          <button className="btn-create" onClick={handleCreate}>
            <GrAdd size={14} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="projects-filter">
        <select 
          value={selectedWorkspace || ''} 
          onChange={(e) => setSelectedWorkspace(e.target.value ? Number(e.target.value) : null)}
          className="workspace-filter"
        >
          <option value="">All Workspaces</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.workspace_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="projects-loading">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects yet</p>
          <button className="btn-create" onClick={handleCreate}>
            <GrAdd size={14} />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/${orgSlug}/projects/${getProjectSlug(project.project_name)}`)} style={{ cursor: 'pointer' }}>
              <div className="project-card-header">
                <h3>{project.project_name}</h3>
                <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleEdit(project)} title="Edit">
                    <GrEdit size={14} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(project.id)} title="Delete">
                    <GrTrash size={14} />
                  </button>
                </div>
              </div>
              {project.description && <p className="project-description">{project.description}</p>}
              <div className="project-meta">
                <span className="project-source">{project.source_type}</span>
                {project.repository_name && <span className="project-repo">{project.repository_name}</span>}
              </div>
              <SecurityScoreBadge projectId={project.id} projectSlug={getProjectSlug(project.project_name)} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <GrClose size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Workspace</label>
                <select
                  value={formData.workspace_id}
                  onChange={(e) => setFormData({ ...formData, workspace_id: Number(e.target.value) })}
                  required
                >
                  <option value="">Select workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.workspace_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  required
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Source Type</label>
                <select
                  value={formData.source_type}
                  onChange={(e) => handleSourceTypeChange(e.target.value)}
                  required
                >
                  <optgroup label="Source Control">
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="bitbucket">Bitbucket</option>
                    <option value="azuredevops">Azure DevOps</option>
                  </optgroup>
                  <optgroup label="ML Platforms">
                    <option value="aws_sagemaker">AWS SageMaker</option>
                    <option value="azure_ml">Azure Machine Learning</option>
                    <option value="vertex_ai">Google Vertex AI</option>
                    <option value="huggingface">HuggingFace</option>
                    <option value="nvidia_ngc">NVIDIA NGC</option>
                  </optgroup>
                  <optgroup label="Container Registries">
                    <option value="aws_ecr">AWS ECR</option>
                    <option value="google_artifact_registry">Google Artifact Registry</option>
                    <option value="azure_container_registry">Azure Container Registry</option>
                  </optgroup>
                  <optgroup label="CI/CD">
                    <option value="jenkins">Jenkins</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="local">Local</option>
                  </optgroup>
                </select>
              </div>
              {formData.source_type === 'github' && loadingRepos && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    Loading repositories...
                  </div>
                </div>
              )}
              {formData.source_type === 'github' && !loadingRepos && githubRepos.length > 0 && (
                <div className="form-group">
                  <label>Select Repository</label>
                  <select
                    onChange={(e) => {
                      const repo = githubRepos.find(r => r.name === e.target.value);
                      if (repo) handleRepoSelect(repo);
                    }}
                    value={formData.repository_name}
                  >
                    <option value="">Choose a repository</option>
                    {githubRepos.map((repo, idx) => (
                      <option key={idx} value={repo.name}>{repo.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.source_type === 'github' && !loadingRepos && githubRepos.length === 0 && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ GitHub not connected or no repositories found. <a href={`/${orgSlug}/integrations/github`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect GitHub</a> to fetch repositories.
                  </div>
                </div>
              )}
              {formData.source_type === 'gitlab' && gitlabRepos.length > 0 && (
                <div className="form-group">
                  <label>Select Repository</label>
                  <select
                    onChange={(e) => {
                      const repo = gitlabRepos.find(r => r.path_with_namespace === e.target.value);
                      if (repo) handleRepoSelect(repo);
                    }}
                    value={formData.repository_name}
                  >
                    <option value="">Choose a repository</option>
                    {gitlabRepos.map((repo, idx) => (
                      <option key={idx} value={repo.path_with_namespace}>{repo.path_with_namespace}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.source_type === 'gitlab' && gitlabRepos.length === 0 && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ GitLab not connected. <a href={`/${orgSlug}/integrations/gitlab-oauth`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect GitLab</a> to fetch repositories.
                  </div>
                </div>
              )}
              {formData.source_type === 'bitbucket' && bitbucketRepos.length > 0 && (
                <div className="form-group">
                  <label>Select Repository</label>
                  <select
                    onChange={(e) => {
                      const repo = bitbucketRepos.find(r => r.full_name === e.target.value);
                      if (repo) handleRepoSelect(repo);
                    }}
                    value={formData.repository_name}
                  >
                    <option value="">Choose a repository</option>
                    {bitbucketRepos.map((repo, idx) => (
                      <option key={idx} value={repo.full_name}>{repo.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.source_type === 'bitbucket' && bitbucketRepos.length === 0 && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Bitbucket not connected. <a href={`/${orgSlug}/integrations/bitbucket`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Bitbucket</a> to fetch repositories.
                  </div>
                </div>
              )}
              {formData.source_type === 'azuredevops' && azureRepos.length > 0 && (
                <div className="form-group">
                  <label>Select Repository</label>
                  <select
                    onChange={(e) => {
                      const repo = azureRepos.find(r => r.id === e.target.value);
                      if (repo) {
                        setFormData({
                          ...formData,
                          repository_url: repo.webUrl,
                          repository_name: `${repo.projectName}/${repo.name}`,
                          project_name: formData.project_name || repo.name
                        });
                      }
                    }}
                    value={azureRepos.find(r => formData.repository_name === `${r.projectName}/${r.name}`)?.id || ''}
                  >
                    <option value="">Choose a repository</option>
                    {azureRepos.map((repo, idx) => (
                      <option key={idx} value={repo.id}>{repo.projectName} / {repo.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.source_type === 'azuredevops' && azureRepos.length === 0 && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Azure DevOps not connected. <a href={`/${orgSlug}/integrations/azuredevops`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Azure DevOps</a> to fetch repositories.
                  </div>
                </div>
              )}
              {formData.source_type === 'aws_sagemaker' && sagemakerResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ SageMaker Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      📊 {sagemakerResources.models?.length || 0} models, {sagemakerResources.endpoints?.length || 0} endpoints, {sagemakerResources.training_jobs?.length || 0} training jobs
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will automatically discover all SageMaker resources
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'aws_sagemaker' && !sagemakerResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ SageMaker not connected. <a href={`/${orgSlug}/integrations/aws-sagemaker`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect SageMaker</a> to discover resources.
                  </div>
                </div>
              )}
              {formData.source_type === 'huggingface' && huggingfaceResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ HuggingFace Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🤗 {huggingfaceResources.models?.length || 0} models, {huggingfaceResources.datasets?.length || 0} datasets, {huggingfaceResources.spaces?.length || 0} spaces
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will automatically discover all HuggingFace resources
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'huggingface' && !huggingfaceResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ HuggingFace not connected. <a href={`/${orgSlug}/integrations/huggingface`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect HuggingFace</a> to discover resources.
                  </div>
                </div>
              )}
              {formData.source_type === 'azure_ml' && azureMLResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ Azure ML Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🤖 {azureMLResources.models?.length || 0} models, {azureMLResources.endpoints?.length || 0} endpoints, {azureMLResources.compute?.length || 0} compute instances
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will automatically discover all Azure ML resources
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'azure_ml' && !azureMLResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Azure ML not connected. <a href={`/${orgSlug}/integrations/azure-ml`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Azure ML</a> to discover resources.
                  </div>
                </div>
              )}
              {formData.source_type === 'vertex_ai' && vertexAIResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ Vertex AI Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🔷 {vertexAIResources.models?.length || 0} models, {vertexAIResources.endpoints?.length || 0} endpoints, {vertexAIResources.training_pipelines?.length || 0} pipelines
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will automatically discover all Vertex AI resources
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'vertex_ai' && !vertexAIResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Vertex AI not connected. <a href={`/${orgSlug}/integrations/vertex-ai`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Vertex AI</a> to discover resources.
                  </div>
                </div>
              )}
              {formData.source_type === 'nvidia_ngc' && nvidiaNGCResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ NVIDIA NGC Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🎮 {nvidiaNGCResources.containers?.length || 0} containers, {nvidiaNGCResources.models?.length || 0} models, {nvidiaNGCResources.helm_charts?.length || 0} Helm charts
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will automatically discover all NGC resources
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'nvidia_ngc' && !nvidiaNGCResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ NVIDIA NGC not connected. <a href={`/${orgSlug}/integrations/nvidia-ngc`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect NVIDIA NGC</a> to discover resources.
                  </div>
                </div>
              )}
              {formData.source_type === 'jenkins' && jenkinsResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ Jenkins Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🔧 {jenkinsResources.jobs?.length || 0} jobs, {jenkinsResources.pipelines?.length || 0} pipelines, {jenkinsResources.nodes?.length || 0} nodes
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will integrate with Jenkins CI/CD pipelines
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'jenkins' && !jenkinsResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Jenkins not connected. <a href={`/${orgSlug}/integrations/jenkins`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Jenkins</a> to discover pipelines.
                  </div>
                </div>
              )}
              {formData.source_type === 'aws_ecr' && awsECRResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ AWS ECR Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🐳 {awsECRResources.repositories?.length || 0} repositories, {awsECRResources.images?.length || 0} images
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will scan container images for vulnerabilities
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'aws_ecr' && !awsECRResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ AWS ECR not connected. <a href={`/${orgSlug}/integrations/aws-ecr`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect AWS ECR</a> to scan images.
                  </div>
                </div>
              )}
              {formData.source_type === 'google_artifact_registry' && googleARResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ Google Artifact Registry Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🐳 {googleARResources.repositories?.length || 0} repositories, {googleARResources.images?.length || 0} images
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will scan container images for vulnerabilities
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'google_artifact_registry' && !googleARResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Google Artifact Registry not connected. <a href={`/${orgSlug}/integrations/google-artifact-registry`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect Artifact Registry</a> to scan images.
                  </div>
                </div>
              )}
              {formData.source_type === 'azure_container_registry' && azureACRResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px', color: '#fec76f', fontWeight: 500 }}>✅ Azure Container Registry Connected</div>
                    <div style={{ color: '#888888', fontSize: '12px' }}>
                      🐳 {azureACRResources.repositories?.length || 0} repositories, {azureACRResources.images?.length || 0} images
                    </div>
                    <div style={{ marginTop: '8px', color: '#666666', fontSize: '11px' }}>
                      AIBOM will scan container images for vulnerabilities
                    </div>
                  </div>
                </div>
              )}
              {formData.source_type === 'azure_container_registry' && !azureACRResources && (
                <div className="form-group">
                  <div style={{ padding: '12px', background: '#1a1a1a', borderRadius: '6px', fontSize: '13px', color: '#888888' }}>
                    ⚠️ Azure Container Registry not connected. <a href={`/${orgSlug}/integrations/azure-container-registry`} style={{ color: '#fec76f', textDecoration: 'underline' }}>Connect ACR</a> to scan images.
                  </div>
                </div>
              )}
              {!['aws_sagemaker', 'huggingface', 'azure_ml', 'vertex_ai', 'nvidia_ngc', 'jenkins', 'aws_ecr', 'google_artifact_registry', 'azure_container_registry'].includes(formData.source_type) && (
              <>
              <div className="form-group">
                <label>Repository URL</label>
                <input
                  type="url"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                  placeholder="https://github.com/user/repo"
                  readOnly={(formData.source_type === 'github' && !!formData.repository_name) || (formData.source_type === 'gitlab' && !!formData.repository_name)}
                />
              </div>
              <div className="form-group">
                <label>Repository Name</label>
                <input
                  type="text"
                  value={formData.repository_name}
                  onChange={(e) => setFormData({ ...formData, repository_name: e.target.value })}
                  placeholder="user/repo"
                  readOnly={(formData.source_type === 'github' || formData.source_type === 'gitlab') && (githubRepos.length > 0 || gitlabRepos.length > 0)}
                />
              </div>
              </>
              )}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
