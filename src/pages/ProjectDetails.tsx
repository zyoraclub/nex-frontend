import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AIBOMGraph from '../components/aibom/AIBOMGraph';
import ScanResults from '../components/scanner/ScanResults';
import UnifiedScanResults from '../components/scanner/UnifiedScanResults';
import ScanProgressDock from '../components/scanner/ScanProgressDock';
import { projectAPI } from '../services/projectAPI';
import { aibomAPI } from '../services/aibomAPI';
import { scannerAPI, type ScannerRun } from '../services/scannerAPI';
import type { Project } from '../services/projectAPI';
import type { AIBOM } from '../services/aibomAPI';
import { GrDocumentText, GrScan, GrDocument } from 'react-icons/gr';
import './ProjectDetails.css';

export default function ProjectDetails() {
  const { projectSlug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('aibom');
  const [loading, setLoading] = useState(true);
  const [aibom, setAibom] = useState<AIBOM | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pollInterval, setPollInterval] = useState<any>(null);
  const [scanRuns, setScanRuns] = useState<ScannerRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ScannerRun | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showProgressDock, setShowProgressDock] = useState(false);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [certInEnabled, setCertInEnabled] = useState(false);
  const [scanType, setScanType] = useState<'unified' | 'vulnerability' | 'llm_rag' | 'model_provenance' | 'container' | 'sast'>('unified');
  const [filterScanType, setFilterScanType] = useState<'all' | 'unified' | 'vulnerability' | 'llm_rag' | 'model_provenance' | 'container' | 'sast'>('all');

  useEffect(() => {
    fetchProject();
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [projectSlug]);

  useEffect(() => {
    if (project && activeTab === 'scans') {
      fetchScanRuns();
    }
  }, [project, activeTab]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.list();
      const foundProject = response.data.find(
        (p: Project) => p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
      );
      setProject(foundProject || null);
      if (foundProject) {
        fetchLatestAIBOM(foundProject.id);
      }
    } catch (err) {
      console.error('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestAIBOM = async (projectId: number) => {
    try {
      const response = await aibomAPI.listByProject(projectId);
      if (response.data.length > 0) {
        setAibom(response.data[0]);
        if (response.data[0].status === 'processing') {
          startPolling(response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AIBOM');
    }
  };

  const startPolling = (aibomId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await aibomAPI.get(aibomId);
        setAibom(response.data);
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          setPollInterval(null);
          setGenerating(false);
        }
      } catch (err) {
        clearInterval(interval);
        setPollInterval(null);
        setGenerating(false);
      }
    }, 2000);
    setPollInterval(interval);
  };

  const fetchScanRuns = async () => {
    if (!project) return;
    try {
      const response = await scannerAPI.getScanRuns(project.id);
      setScanRuns(response.data);
      if (response.data.length > 0) {
        setSelectedRun(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch scan runs');
    }
  };

  const handleRunScan = async () => {
    if (!project) return;
    setScanning(true);
    try {
      let response;
      if (scanType === 'unified') {
        response = await scannerAPI.runUnifiedScan(project.id);
      } else {
        switch(scanType) {
          case 'vulnerability':
            response = await scannerAPI.runVulnerabilityScan(project.id, certInEnabled);
            break;
          case 'llm_rag':
            response = await scannerAPI.runLLMRAGScan(project.id);
            break;
          case 'model_provenance':
            response = await scannerAPI.runModelProvenanceScan(project.id);
            break;
          case 'container':
            response = await scannerAPI.runContainerScan(project.id);
            break;
          case 'sast':
            response = await scannerAPI.runSASTScan(project.id);
            break;
        }
      }
      setScanRuns([response.data, ...scanRuns]);
      setSelectedRun(response.data);
      setActiveScanId(response.data.id);
      setShowProgressDock(true);
      startScanPolling(response.data.id);
    } catch (err) {
      console.error('Failed to run scan');
      setScanning(false);
    }
  };

  const startScanPolling = (runId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await scannerAPI.getScanRun(runId);
        setSelectedRun(response.data);
        setScanRuns(prev => prev.map(r => r.id === runId ? response.data : r));
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          setScanning(false);
        }
      } catch (err) {
        clearInterval(interval);
        setScanning(false);
      }
    }, 2000);
  };

  const handleGenerateAIBOM = async () => {
    if (!project) return;
    setGenerating(true);
    try {
      const response = await aibomAPI.generate(project.id);
      setAibom(response.data);
      startPolling(response.data.id);
    } catch (err) {
      console.error('Failed to generate AIBOM');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="project-details-loading">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="project-details-error">Project not found</div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'aibom', label: 'AIBOM', icon: <GrDocumentText size={14} /> },
    { id: 'scans', label: 'Scans', icon: <GrScan size={14} /> },
    { id: 'reports', label: 'Reports', icon: <GrDocument size={14} /> }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'scans') {
      const orgSlug = window.location.pathname.split('/')[1];
      navigate(`/${orgSlug}/projects/${projectSlug}/scans`);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <DashboardLayout>
      {showProgressDock && activeScanId && selectedRun && (
        <ScanProgressDock
          scanId={activeScanId}
          status={selectedRun.status}
          progress={selectedRun.progress}
          onClose={() => setShowProgressDock(false)}
        />
      )}
      <div className="project-details-header">
        <div>
          <h1>{project.project_name}</h1>
          {project.description && <p className="project-details-subtitle">{project.description}</p>}
          {project.repository_url && (
            <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="repo-link">
              {project.repository_name || project.repository_url}
            </a>
          )}
        </div>
        <div className="project-details-meta">
          <span className="project-source-badge">{project.source_type}</span>
        </div>
      </div>

      <div className="project-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`project-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="project-content">
        {activeTab === 'aibom' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>AI Bill of Materials</h2>
              <button 
                className="btn-action" 
                onClick={handleGenerateAIBOM}
                disabled={generating || (aibom?.status === 'processing')}
              >
                {generating || (aibom?.status === 'processing') ? 'Generating...' : 'Generate AIBOM'}
              </button>
            </div>
            
            {aibom?.status === 'processing' && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${aibom.progress}%` }}></div>
                </div>
                <p className="progress-text">{aibom.progress}% - Discovering assets...</p>
              </div>
            )}

            {aibom?.status === 'completed' && aibom.assets && (
              <div className="assets-container">
                {aibom.graph && (
                  <div className="graph-section">
                    <AIBOMGraph graphData={aibom.graph} />
                  </div>
                )}

                <div className="assets-summary">
                  <div className="summary-card">
                    <span className="summary-label">Total Assets</span>
                    <span className="summary-value">{aibom.total_assets}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Frameworks</span>
                    <span className="summary-value">{aibom.assets.frameworks?.length || 0}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Models</span>
                    <span className="summary-value">{aibom.assets.models?.length || 0}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Datasets</span>
                    <span className="summary-value">{aibom.assets.datasets?.length || 0}</span>
                  </div>
                </div>

                <div className="assets-list">
                  {Object.entries(aibom.assets).map(([category, items]: [string, any]) => (
                    items && items.length > 0 && (
                      <div key={category} className="asset-category">
                        <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                        <div className="asset-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Name/File</th>
                                <th>Layer</th>
                                <th>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item: any, idx: number) => (
                                <tr key={idx}>
                                  <td>{item.name || item.file}</td>
                                  <td><span className="layer-badge">{item.layer}</span></td>
                                  <td>{item.version || item.type || item.purpose || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {aibom?.status === 'failed' && (
              <div className="error-state">
                <p>Failed to generate AIBOM</p>
                <span>{aibom.error_message}</span>
              </div>
            )}

            {!aibom && (
              <div className="empty-state">
                <p>No AIBOM generated yet</p>
                <span>Generate an AIBOM to discover AI/ML assets and dependencies</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scans' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Security Scans</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={scanType} 
                  onChange={(e) => setScanType(e.target.value as any)}
                  style={{ 
                    padding: '8px 12px', 
                    background: '#1e293b', 
                    border: '1px solid #475569', 
                    borderRadius: '6px', 
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <option value="unified">🎯 Unified Scan (Intelligent)</option>
                  <option value="vulnerability">🛡️ Vulnerability Scan</option>
                  <option value="llm_rag">🤖 LLM/RAG Security</option>
                  <option value="model_provenance">📜 Model Provenance</option>
                  <option value="container">🐳 Container Security</option>
                  <option value="sast">🔍 SAST (Code Analysis)</option>
                </select>
                {scanType === 'vulnerability' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={certInEnabled} 
                      onChange={(e) => setCertInEnabled(e.target.checked)}
                    />
                    CERT-IN Compliance
                  </label>
                )}
                <button 
                  className="btn-action" 
                  onClick={handleRunScan}
                  disabled={scanning || !aibom || aibom.status !== 'completed'}
                >
                  {scanning ? 'Scanning...' : 'Run Scan'}
                </button>
              </div>
            </div>

            {!aibom || aibom.status !== 'completed' ? (
              <div className="empty-state">
                <p>Generate AIBOM first</p>
                <span>An AIBOM is required before running security scans</span>
              </div>
            ) : selectedRun ? (
              <div>
                {selectedRun.status === 'running' && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${selectedRun.progress}%` }}></div>
                    </div>
                    <p className="progress-text">{selectedRun.progress}% - Scanning dependencies...</p>
                  </div>
                )}

                {selectedRun.status === 'completed' && (
                  selectedRun.scan_type === 'unified' ? (
                    <UnifiedScanResults run={selectedRun} />
                  ) : (
                    <ScanResults run={selectedRun} />
                  )
                )}

                {selectedRun.status === 'failed' && (
                  <div className="error-state">
                    <p>Scan failed</p>
                    <span>{selectedRun.error_message}</span>
                  </div>
                )}

                {scanRuns.length > 1 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3>Scan History</h3>
                      <select 
                        value={filterScanType} 
                        onChange={(e) => setFilterScanType(e.target.value as any)}
                        style={{ 
                          padding: '6px 10px', 
                          background: '#1e293b', 
                          border: '1px solid #475569', 
                          borderRadius: '6px', 
                          color: '#fff',
                          fontSize: '13px'
                        }}
                      >
                        <option value="all">All Scans</option>
                        <option value="unified">🎯 Unified</option>
                        <option value="vulnerability">🛡️ Vulnerability</option>
                        <option value="llm_rag">🤖 LLM/RAG</option>
                        <option value="model_provenance">📜 Model Provenance</option>
                        <option value="container">🐳 Container</option>
                        <option value="sast">🔍 SAST</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {scanRuns
                        .filter(run => filterScanType === 'all' || run.scan_type === filterScanType)
                        .map((run) => (
                        <div 
                          key={run.id} 
                          onClick={() => setSelectedRun(run)}
                          style={{
                            padding: '12px',
                            background: selectedRun?.id === run.id ? '#334155' : '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>
                                {run.scan_type === 'unified' ? '🎯' :
                                 run.scan_type === 'llm_rag' ? '🤖' : 
                                 run.scan_type === 'model_provenance' ? '📜' :
                                 run.scan_type === 'container' ? '🐳' :
                                 run.scan_type === 'sast' ? '🔍' : '🛡️'}
                              </span>
                              <span style={{ fontWeight: '500' }}>
                                {run.scan_type === 'unified' ? 'Unified Scan' :
                                 run.scan_type === 'llm_rag' ? 'LLM/RAG Security' : 
                                 run.scan_type === 'model_provenance' ? 'Model Provenance' :
                                 run.scan_type === 'container' ? 'Container Security' :
                                 run.scan_type === 'sast' ? 'SAST' : 'Vulnerability'}
                              </span>
                              <span style={{ color: '#64748b' }}>•</span>
                              <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                                {new Date(run.created_at).toLocaleString()}
                              </span>
                            </div>
                            <span className={`status-badge ${run.status}`}>{run.status}</span>
                          </div>
                          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '5px' }}>
                            {run.total_findings} findings • {run.scan_duration_seconds}s
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <p>No scans available</p>
                <span>Run a security scan to detect vulnerabilities</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Reports</h2>
              <button className="btn-action">Generate Report</button>
            </div>
            <div className="empty-state">
              <p>No reports generated</p>
              <span>Generate reports for compliance and auditing</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
