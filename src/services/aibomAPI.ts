import api from './api';

interface AIBOM {
  id: number;
  project_id: number;
  status: string;
  progress: number;
  assets: any;
  total_assets: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

const aibomAPI = {
  generate: (project_id: number) => api.post<AIBOM>('/aibom/generate', { project_id }),
  
  get: (id: number) => api.get<AIBOM>(`/aibom/${id}`),
  
  listByProject: (project_id: number) => api.get<AIBOM[]>(`/aibom/project/${project_id}`)
};

export { aibomAPI };
export type { AIBOM };
