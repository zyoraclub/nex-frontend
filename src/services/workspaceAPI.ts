import api from './api';

interface Workspace {
  id: number;
  org_id: number;
  workspace_name: string;
  details: string | null;
  created_at: string;
}

interface WorkspaceCreate {
  workspace_name: string;
  details?: string;
}

interface WorkspaceUpdate {
  workspace_name?: string;
  details?: string;
}

const workspaceAPI = {
  list: () => api.get<Workspace[]>('/workspaces/'),
  
  create: (data: WorkspaceCreate) => api.post<Workspace>('/workspaces/', data),
  
  get: (id: number) => api.get<Workspace>(`/workspaces/${id}`),
  
  update: (id: number, data: WorkspaceUpdate) => api.put<Workspace>(`/workspaces/${id}`, data),
  
  delete: (id: number) => api.delete(`/workspaces/${id}`)
};

export { workspaceAPI };
export type { Workspace, WorkspaceCreate, WorkspaceUpdate };
