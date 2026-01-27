import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SecurityScoreBadge.css';

interface SecurityScoreBadgeProps {
  projectId: number;
  projectSlug: string;
}

export function SecurityScoreBadge({ projectId, projectSlug }: SecurityScoreBadgeProps) {
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orgSlug } = useParams();

  useEffect(() => {
    fetchScore();
  }, [projectId]);

  const fetchScore = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/security-score/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setScore(data);
      }
    } catch (err) {
      console.error('Failed to fetch security score');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !score || !score.vulnerability_breakdown) return null;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#10b981';
    if (grade.startsWith('B')) return '#3b82f6';
    if (grade.startsWith('C')) return '#f59e0b';
    if (grade.startsWith('D')) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="security-score-badge">
      <div className="badge-content">
        <div className="badge-score" style={{ background: getGradeColor(score.grade) }}>
          {score.grade}
        </div>
        <div className="badge-info">
          <div className="badge-title">Security Score</div>
          <div className="badge-value">{score.score}/100</div>
          <div className="badge-risk">{score.risk_level}</div>
        </div>
        <div className="badge-stats">
          <div className="stat-item">
            <span className="stat-label">Critical</span>
            <span className="stat-value critical">{score.vulnerability_breakdown.critical || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High</span>
            <span className="stat-value high">{score.vulnerability_breakdown.high || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Medium</span>
            <span className="stat-value medium">{score.vulnerability_breakdown.medium || 0}</span>
          </div>
        </div>
      </div>
      <button 
        className="badge-details-btn"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/${orgSlug}/projects/${projectSlug}/scoring`);
        }}
      >
        View Details →
      </button>
    </div>
  );
}
