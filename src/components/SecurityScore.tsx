import React, { useEffect, useState } from 'react';
import './SecurityScore.css';

interface SecurityScoreData {
  score: number;
  grade: string;
  risk_level: string;
  breakdown: {
    vulnerabilities: number;
    remediation: number;
    scan_consistency: number;
    compliance: number;
  };
  details: {
    total_findings: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    message: string;
    impact: number;
  }>;
  calculated_at: string;
  cached: boolean;
}

interface SecurityScoreProps {
  projectId: number;
}

export const SecurityScoreCard: React.FC<SecurityScoreProps> = ({ projectId }) => {
  const [score, setScore] = useState<SecurityScoreData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchScore();
    fetchHistory();
  }, [projectId]);

  const fetchScore = async () => {
    try {
      const res = await fetch(`/api/v1/security-score/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        setScore(null);
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Check if response has score property
      if (data && typeof data.score === 'number') {
        setScore(data);
      } else {
        setScore(null);
      }
      
      setLoading(false);
    } catch (error) {
      // Error fetching security score
      setScore(null);
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/v1/security-score/projects/${projectId}/history?days=90`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      // Failed to fetch score history
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await fetch(`/api/v1/security-score/projects/${projectId}?recalculate=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setScore(data);
      fetchHistory(); // Refresh history
    } catch (error) {
      // Failed to recalculate score
    }
    setRecalculating(false);
  };

  const getScoreColor = (grade: string) => {
    if (grade.startsWith('A')) return '#10b981'; // Green
    if (grade.startsWith('B')) return '#fec76f'; // Nexula yellow
    if (grade.startsWith('C')) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'very_low': return '#10b981';
      case 'low': return '#84cc16';
      case 'medium': return '#fec76f';
      case 'high': return '#f59e0b';
      case 'very_high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="security-score-loading">Loading security score...</div>;
  }

  if (!score) {
    return (
      <div className="security-score-empty">
        <p>No security score available</p>
        <p className="text-sm">Run a scan to generate your security score</p>
      </div>
    );
  }

  return (
    <div className="security-score-container">
      {/* Main Score Display */}
      <div className="score-header">
        <div className="score-main">
          <div className="score-circle" style={{ borderColor: getScoreColor(score.grade) }}>
            <div className="score-number" style={{ color: getScoreColor(score.grade) }}>
              {score.score}
            </div>
            <div className="score-grade">{score.grade}</div>
          </div>
          <div className="score-info">
            <h3>Security Score</h3>
            <div className="risk-badge" style={{ backgroundColor: getRiskBadgeColor(score.risk_level) }}>
              {score.risk_level.replace('_', ' ').toUpperCase()} RISK
            </div>
            <div className="score-meta">
              <span>{score.cached ? '📦 Cached' : '✨ Fresh'}</span>
              <span>•</span>
              <span>{new Date(score.calculated_at).toLocaleDateString()}</span>
            </div>
            <button 
              onClick={handleRecalculate} 
              disabled={recalculating}
              className="recalculate-btn"
            >
              {recalculating ? '⏳ Recalculating...' : '🔄 Recalculate'}
            </button>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="score-breakdown">
        <h4>Score Breakdown</h4>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-label">Vulnerabilities</span>
            <span className={`breakdown-value ${score.breakdown.vulnerabilities < 0 ? 'negative' : 'positive'}`}>
              {score.breakdown.vulnerabilities > 0 ? '+' : ''}{score.breakdown.vulnerabilities}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Remediation</span>
            <span className={`breakdown-value ${score.breakdown.remediation < 0 ? 'negative' : 'positive'}`}>
              {score.breakdown.remediation > 0 ? '+' : ''}{score.breakdown.remediation}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Scan Consistency</span>
            <span className={`breakdown-value ${score.breakdown.scan_consistency < 0 ? 'negative' : 'positive'}`}>
              {score.breakdown.scan_consistency > 0 ? '+' : ''}{score.breakdown.scan_consistency}
            </span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Compliance</span>
            <span className={`breakdown-value ${score.breakdown.compliance < 0 ? 'negative' : 'positive'}`}>
              {score.breakdown.compliance > 0 ? '+' : ''}{score.breakdown.compliance}
            </span>
          </div>
        </div>
      </div>

      {/* Vulnerability Summary */}
      <div className="vulnerability-summary">
        <h4>Current Vulnerabilities</h4>
        <div className="vuln-grid">
          <div className="vuln-item critical">
            <span className="vuln-count">{score.details.critical_count}</span>
            <span className="vuln-label">Critical</span>
          </div>
          <div className="vuln-item high">
            <span className="vuln-count">{score.details.high_count}</span>
            <span className="vuln-label">High</span>
          </div>
          <div className="vuln-item medium">
            <span className="vuln-count">{score.details.medium_count}</span>
            <span className="vuln-label">Medium</span>
          </div>
          <div className="vuln-item low">
            <span className="vuln-count">{score.details.low_count}</span>
            <span className="vuln-label">Low</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>🎯 Recommendations to Improve Score</h4>
          <div className="recommendations-list">
            {score.recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-category">{rec.category}</span>
                  <span className="rec-impact">+{rec.impact} points</span>
                </div>
                <p className="rec-message">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score History */}
      {history.length > 1 && (
        <div className="score-history">
          <h4>Score Trend (Last 90 Days)</h4>
          <div className="score-history-list">
            {history.slice(0, 5).map((h, idx) => (
              <div key={idx} className="history-item">
                <span className="history-date">{new Date(h.calculated_at).toLocaleDateString()}</span>
                <span className="history-score" style={{ color: getScoreColor(h.grade) }}>
                  {h.score} ({h.grade})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
