import api from './api';

interface Project {
  id: number;
  workspace_id: number;
  project_name: string;
  description: string | null;
  source_type: string;
  repository_url: string | null;
  repository_name: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ProjectCreate {
  workspace_id: number;
  project_name: string;
  description?: string;
  source_type: string;
  repository_url?: string;
  repository_name?: string;
  tags?: string[];
}

interface ProjectUpdate {
  project_name?: string;
  description?: string;
  source_type?: string;
  repository_url?: string;
  repository_name?: string;
  tags?: string[];
}

const projectAPI = {
  list: (workspace_id?: number) => 
    api.get<Project[]>('/projects/', { params: workspace_id ? { workspace_id } : {} }),
  
  create: (data: ProjectCreate) => api.post<Project>('/projects/', data),
  
  get: (id: number) => api.get<Project>(`/projects/${id}`),
  
  update: (id: number, data: ProjectUpdate) => api.put<Project>(`/projects/${id}`, data),
  
  delete: (id: number) => api.delete(`/projects/${id}`)
};

export { projectAPI };
export type { Project, ProjectCreate, ProjectUpdate };
