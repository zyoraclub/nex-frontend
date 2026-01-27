import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ScanProgressDock from '../components/scanner/ScanProgressDock';
import { projectAPI } from '../services/projectAPI';
import { aibomAPI } from '../services/aibomAPI';
import { scannerAPI, type ScannerRun } from '../services/scannerAPI';
import type { Project } from '../services/projectAPI';
import type { AIBOM } from '../services/aibomAPI';
import './ScanHistory.css';

export default function ScanHistory() {
  const { orgSlug, projectSlug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [aibom, setAibom] = useState<AIBOM | null>(null);
  const [scanRuns, setScanRuns] = useState<ScannerRun[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showProgressDock, setShowProgressDock] = useState(false);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [activeScanRun, setActiveScanRun] = useState<ScannerRun | null>(null);
  const [certInEnabled, setCertInEnabled] = useState(false);
  const [scanType, setScanType] = useState<'unified' | 'vulnerability' | 'llm_rag' | 'model_provenance' | 'container' | 'sast' | 'ml_security' | 'dataset_poisoning' | 'model_poisoning' | 'adversarial_robustness' | 'zero_day'>('unified');
  const [filterScanType, setFilterScanType] = useState<'all' | 'unified' | 'vulnerability' | 'llm_rag' | 'model_provenance' | 'container' | 'sast' | 'ml_security' | 'dataset_poisoning' | 'model_poisoning' | 'adversarial_robustness' | 'zero_day'>('all');
  const [selectedScans, setSelectedScans] = useState<number[]>([]);

  useEffect(() => {
    fetchProject();
  }, [projectSlug]);

  useEffect(() => {
    if (project) {
      fetchScanRuns();
      fetchLatestAIBOM(project.id);
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.list();
      const foundProject = response.data.find(
        (p: Project) => p.project_name.toLowerCase().replace(/\s+/g, '-') === projectSlug
      );
      setProject(foundProject || null);
    } catch (err) {
      console.error('Failed to fetch project');
    }
  };

  const fetchLatestAIBOM = async (projectId: number) => {
    try {
      const response = await aibomAPI.listByProject(projectId);
      if (response.data.length > 0) {
        setAibom(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch AIBOM');
    }
  };

  const fetchScanRuns = async () => {
    if (!project) return;
    try {
      const response = await scannerAPI.getScanRuns(project.id);
      setScanRuns(response.data);
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
          case 'ml_security':
            response = await scannerAPI.runMLSecurityScan(project.id);
            break;
          case 'dataset_poisoning':
            response = await scannerAPI.runDatasetPoisoningScan(project.id);
            break;
          case 'model_poisoning':
            response = await scannerAPI.runModelPoisoningScan(project.id);
            break;
          case 'adversarial_robustness':
            response = await scannerAPI.runAdversarialRobustnessScan(project.id);
            break;
          case 'zero_day':
            response = await scannerAPI.runZeroDayScan(project.id);
            break;
        }
      }
      setScanRuns([response.data, ...scanRuns]);
      setActiveScanId(response.data.id);
      setActiveScanRun(response.data);
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
        setActiveScanRun(response.data);
        setScanRuns(prev => prev.map(r => r.id === runId ? response.data : r));
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
          setScanning(false);
          fetchScanRuns();
        }
      } catch (err) {
        clearInterval(interval);
        setScanning(false);
      }
    }, 2000);
  };

  const handleScanClick = (scanId: number) => {
    navigate(`/${orgSlug}/projects/${projectSlug}/scans/${scanId}`);
  };

  const getScanIcon = (scanType: string) => {
    switch(scanType) {
      case 'unified': return '🎯';
      case 'llm_rag': return '🤖';
      case 'model_provenance': return '📜';
      case 'container': return '🐳';
      case 'sast': return '🔍';
      case 'ml_security': return '🧠';
      case 'dataset_poisoning': return '💉';
      case 'model_poisoning': return '☠️';
      case 'adversarial_robustness': return '⚔️';
      case 'zero_day': return '🚨';
      default: return '🛡️';
    }
  };

  const getScanLabel = (scanType: string) => {
    switch(scanType) {
      case 'unified': return 'Unified Scan';
      case 'llm_rag': return 'LLM/RAG Security';
      case 'model_provenance': return 'Model Provenance';
      case 'container': return 'Container Security';
      case 'sast': return 'SAST';
      case 'ml_security': return 'ML Security';
      case 'dataset_poisoning': return 'Dataset Poisoning';
      case 'model_poisoning': return 'Model Poisoning';
      case 'adversarial_robustness': return 'Adversarial Robustness';
      case 'zero_day': return 'Zero-Day Threats';
      default: return 'Vulnerability';
    }
  };

  const countScanners = (run: ScannerRun) => {
    if (run.scan_type !== 'unified' || !run.orchestrator_decision) return 1;
    return run.orchestrator_decision.scanners_to_run?.length || 0;
  };

  const filteredScans = scanRuns.filter(run => 
    filterScanType === 'all' || run.scan_type === filterScanType
  );

  return (
    <DashboardLayout>
      {showProgressDock && activeScanId && activeScanRun && (
        <ScanProgressDock
          scanId={activeScanId}
          status={activeScanRun.status}
          progress={activeScanRun.progress}
          onClose={() => setShowProgressDock(false)}
        />
      )}
      
      <div className="scan-history-container">
        <div className="scan-history-header">
          <div>
            <h1>Security Scans</h1>
            <p className="scan-history-subtitle">{project?.project_name}</p>
          </div>
          <div className="scan-actions">
            {selectedScans.length === 2 && (
              <button 
                className="compare-btn"
                onClick={() => navigate(`/${orgSlug}/projects/${projectSlug}/compare?scan1=${selectedScans[0]}&scan2=${selectedScans[1]}`)}
              >
                Compare Scans
              </button>
            )}
            <select 
              value={scanType} 
              onChange={(e) => setScanType(e.target.value as any)}
              className="scan-type-select"
            >
              <option value="unified">🎯 Unified Scan (Intelligent)</option>
              <option value="vulnerability">🛡️ Vulnerability Scan</option>
              <option value="llm_rag">🤖 LLM/RAG Security</option>
              <option value="model_provenance">📜 Model Provenance</option>
              <option value="container">🐳 Container Security</option>
              <option value="sast">🔍 SAST (Code Analysis)</option>
              <option value="ml_security">🧠 ML Security</option>
              <option value="dataset_poisoning">💉 Dataset Poisoning</option>
              <option value="model_poisoning">☠️ Model Poisoning</option>
              <option value="adversarial_robustness">⚔️ Adversarial Robustness</option>
              <option value="zero_day">🚨 Zero-Day Threats</option>
            </select>
            {scanType === 'vulnerability' && (
              <label className="cert-in-label">
                <input 
                  type="checkbox" 
                  checked={certInEnabled} 
                  onChange={(e) => setCertInEnabled(e.target.checked)}
                />
                CERT-IN
              </label>
            )}
            <button 
              className="btn-run-scan" 
              onClick={handleRunScan}
              disabled={scanning || !aibom || aibom.status !== 'completed'}
            >
              {scanning ? 'Scanning...' : 'Run Scan'}
            </button>
          </div>
        </div>

        {!aibom || aibom.status !== 'completed' ? (
          <div className="scan-empty-state">
            <p>Generate AIBOM first</p>
            <span>An AIBOM is required before running security scans</span>
          </div>
        ) : (
          <>
            <div className="scan-filter">
              <select 
                value={filterScanType} 
                onChange={(e) => setFilterScanType(e.target.value as any)}
                className="scan-filter-select"
              >
                <option value="all">All Scans</option>
                <option value="unified">🎯 Unified</option>
                <option value="vulnerability">🛡️ Vulnerability</option>
                <option value="llm_rag">🤖 LLM/RAG</option>
                <option value="model_provenance">📜 Model Provenance</option>
                <option value="container">🐳 Container</option>
                <option value="sast">🔍 SAST</option>
                <option value="ml_security">🧠 ML Security</option>
                <option value="dataset_poisoning">💉 Dataset Poisoning</option>
                <option value="model_poisoning">☠️ Model Poisoning</option>
                <option value="adversarial_robustness">⚔️ Adversarial Robustness</option>
                <option value="zero_day">🚨 Zero-Day</option>
              </select>
            </div>

            {filteredScans.length === 0 ? (
              <div className="scan-empty-state">
                <p>No scans available</p>
                <span>Run a security scan to detect vulnerabilities</span>
              </div>
            ) : (
              <div className="scan-list">
                {filteredScans.map((run) => (
                  <div 
                    key={run.id} 
                    className={`scan-card ${selectedScans.includes(run.id) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox"
                      className="scan-checkbox"
                      checked={selectedScans.includes(run.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          if (selectedScans.length < 2) {
                            setSelectedScans([...selectedScans, run.id]);
                          }
                        } else {
                          setSelectedScans(selectedScans.filter(id => id !== run.id));
                        }
                      }}
                    />
                    <div onClick={() => handleScanClick(run.id)} style={{ flex: 1 }}>
                    <div className="scan-card-header">
                      <div className="scan-card-title">
                        <span className="scan-icon">{getScanIcon(run.scan_type)}</span>
                        <div>
                          <h3>{getScanLabel(run.scan_type)}</h3>
                          <span className="scan-date">
                            {new Date(run.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className={`scan-status ${run.status}`}>{run.status}</span>
                    </div>
                    
                    <div className="scan-card-stats">
                      <div className="scan-stat">
                        <span className="stat-value">{run.total_findings}</span>
                        <span className="stat-label">findings</span>
                      </div>
                      <div className="scan-stat">
                        <span className="stat-value">{countScanners(run)}</span>
                        <span className="stat-label">scanners</span>
                      </div>
                      <div className="scan-stat">
                        <span className="stat-value">{run.scan_duration_seconds}s</span>
                        <span className="stat-label">duration</span>
                      </div>
                    </div>

                    {run.status === 'completed' && (
                      <div className="scan-card-severity">
                        {run.critical_count > 0 && (
                          <div className="severity-badge critical">
                            {run.critical_count} Critical
                          </div>
                        )}
                        {run.high_count > 0 && (
                          <div className="severity-badge high">
                            {run.high_count} High
                          </div>
                        )}
                        {run.medium_count > 0 && (
                          <div className="severity-badge medium">
                            {run.medium_count} Medium
                          </div>
                        )}
                        {run.low_count > 0 && (
                          <div className="severity-badge low">
                            {run.low_count} Low
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
