import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ModelFingerprinting } from '../components/ModelFingerprinting';
import { useState, useEffect } from 'react';
import { projectAPI, type Project } from '../services/projectAPI';
import './Fingerprinting.css';

export default function Fingerprinting() {
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
        <div className="fingerprinting-page-loading">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="fingerprinting-page-error">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="fingerprinting-page-header">
        <div>
          <h1>Model Fingerprinting</h1>
          <p className="fingerprinting-page-subtitle">{project.project_name}</p>
        </div>
      </div>

      <div className="fingerprinting-page-content">
        <ModelFingerprinting projectId={project.id} />
      </div>
    </DashboardLayout>
  );
}
