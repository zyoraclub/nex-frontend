import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { SecurityScoreCard } from '../components/SecurityScore';
import { useState, useEffect } from 'react';
import { projectAPI, type Project } from '../services/projectAPI';
import './Scoring.css';

export default function Scoring() {
  const { projectSlug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectSlug]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.list();
      const foundProject = response.data.find(
        (p: Project) => p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
      );
      setProject(foundProject || null);
    } catch (err) {
      console.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="scoring-loading">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="scoring-error">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="scoring-header">
        <div>
          <h1>Security Scoring</h1>
          <p className="scoring-subtitle">{project.project_name}</p>
        </div>
      </div>

      <div className="scoring-content">
        <SecurityScoreCard projectId={project.id} />
      </div>
    </DashboardLayout>
  );
}
