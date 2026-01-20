import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import api from '../services/api';
import './Trends.css';

export default function Trends() {
  const { orgSlug } = useParams();
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/trends?days=${period}`);
      setTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch trends');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    return colors[severity] || '#6b7280';
  };

  const getMaxValue = () => {
    if (!trends?.trend_data) return 100;
    return Math.max(...trends.trend_data.map((d: any) => d.total_findings), 10);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="trends-loading">Loading trends...</div>
      </DashboardLayout>
    );
  }

  if (!trends) {
    return (
      <DashboardLayout>
        <div className="trends-error">Failed to load trends</div>
      </DashboardLayout>
    );
  }

  const maxValue = getMaxValue();

  return (
    <DashboardLayout>
      <div className="trends-header">
        <div className="trends-title">
          <FaChartLine size={24} />
          <h1>Vulnerability Trends</h1>
        </div>
        <div className="period-selector">
          <button 
            className={period === 7 ? 'active' : ''} 
            onClick={() => setPeriod(7)}
          >
            7 Days
          </button>
          <button 
            className={period === 30 ? 'active' : ''} 
            onClick={() => setPeriod(30)}
          >
            30 Days
          </button>
          <button 
            className={period === 90 ? 'active' : ''} 
            onClick={() => setPeriod(90)}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="trends-summary">
        <div className="summary-card">
          <div className="summary-value">{trends.summary.total_scans}</div>
          <div className="summary-label">Total Scans</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{trends.summary.total_findings}</div>
          <div className="summary-label">Total Findings</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{trends.summary.avg_findings_per_scan}</div>
          <div className="summary-label">Avg per Scan</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Findings Over Time</h3>
            <span className="chart-subtitle">{period} days</span>
          </div>
          <div className="line-chart">
            {trends.trend_data.length === 0 ? (
              <div className="chart-empty">No data available</div>
            ) : (
              <>
                <div className="chart-y-axis">
                  <span>{maxValue}</span>
                  <span>{Math.round(maxValue / 2)}</span>
                  <span>0</span>
                </div>
                <div className="chart-content">
                  <svg className="chart-svg" viewBox="0 0 800 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fec76f" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#fec76f" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area under line */}
                    <path
                      d={`M 0 300 ${trends.trend_data.map((d: any, i: number) => {
                        const x = (i / (trends.trend_data.length - 1)) * 800;
                        const y = 300 - (d.total_findings / maxValue) * 300;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 800 300 Z`}
                      fill="url(#lineGradient)"
                      className="chart-area"
                    />
                    
                    {/* Line */}
                    <path
                      d={trends.trend_data.map((d: any, i: number) => {
                        const x = (i / (trends.trend_data.length - 1)) * 800;
                        const y = 300 - (d.total_findings / maxValue) * 300;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      stroke="#fec76f"
                      strokeWidth="3"
                      fill="none"
                      className="chart-line"
                    />
                    
                    {/* Points */}
                    {trends.trend_data.map((d: any, i: number) => {
                      const x = (i / (trends.trend_data.length - 1)) * 800;
                      const y = 300 - (d.total_findings / maxValue) * 300;
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#fec76f"
                          className="chart-point"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        />
                      );
                    })}
                  </svg>
                  <div className="chart-x-axis">
                    {trends.trend_data.map((d: any, i: number) => {
                      if (i % Math.ceil(trends.trend_data.length / 6) === 0) {
                        return <span key={i}>{formatDate(d.date)}</span>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Severity Distribution</h3>
            <span className="chart-subtitle">Total findings</span>
          </div>
          <div className="bar-chart">
            {Object.entries(trends.summary.severity_distribution).map(([severity, count]: any, index) => {
              const maxCount = Math.max(...Object.values(trends.summary.severity_distribution as any));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={severity} className="bar-item" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bar-label">
                    <span className="bar-severity">{severity}</span>
                    <span className="bar-count">{count}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getSeverityColor(severity)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Stacked Severity Trends</h3>
          <span className="chart-subtitle">Daily breakdown</span>
        </div>
        <div className="stacked-chart">
          {trends.trend_data.length === 0 ? (
            <div className="chart-empty">No data available</div>
          ) : (
            <>
              <div className="stacked-bars">
                {trends.trend_data.map((d: any, i: number) => {
                  const total = d.critical + d.high + d.medium + d.low;
                  const maxTotal = Math.max(...trends.trend_data.map((x: any) => x.critical + x.high + x.medium + x.low), 1);
                  
                  return (
                    <div 
                      key={i} 
                      className="stacked-bar-wrapper"
                      style={{ animationDelay: `${i * 0.02}s` }}
                    >
                      <div className="stacked-bar" style={{ height: `${(total / maxTotal) * 100}%` }}>
                        {d.critical > 0 && (
                          <div 
                            className="stack-segment" 
                            style={{ 
                              height: `${(d.critical / total) * 100}%`,
                              backgroundColor: '#dc2626'
                            }}
                            title={`Critical: ${d.critical}`}
                          />
                        )}
                        {d.high > 0 && (
                          <div 
                            className="stack-segment" 
                            style={{ 
                              height: `${(d.high / total) * 100}%`,
                              backgroundColor: '#ea580c'
                            }}
                            title={`High: ${d.high}`}
                          />
                        )}
                        {d.medium > 0 && (
                          <div 
                            className="stack-segment" 
                            style={{ 
                              height: `${(d.medium / total) * 100}%`,
                              backgroundColor: '#f59e0b'
                            }}
                            title={`Medium: ${d.medium}`}
                          />
                        )}
                        {d.low > 0 && (
                          <div 
                            className="stack-segment" 
                            style={{ 
                              height: `${(d.low / total) * 100}%`,
                              backgroundColor: '#3b82f6'
                            }}
                            title={`Low: ${d.low}`}
                          />
                        )}
                      </div>
                      {i % Math.ceil(trends.trend_data.length / 10) === 0 && (
                        <span className="stacked-label">{formatDate(d.date)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="stacked-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#dc2626' }} />
                  <span>Critical</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ea580c' }} />
                  <span>High</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f59e0b' }} />
                  <span>Medium</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#3b82f6' }} />
                  <span>Low</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
