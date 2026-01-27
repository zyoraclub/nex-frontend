import api from './api';

export interface ScannerRun {
  id: number;
  project_id: number;
  aibom_id: number;
  scan_type: string;
  status: string;
  progress: number;
  scanners_selected: any;
  orchestrator_decision: any;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  estimated_cost: number;
  actual_cost: number;
  cert_in_enabled: boolean;
  cert_in_findings: number;
  scan_duration_seconds: number | null;
  error_message: string | null;
  nexula_model_latency: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface ScannerFinding {
  id: number;
  run_id: number;
  scanner_type: string;
  severity: string;
  title: string;
  description: string | null;
  cve_id: string | null;
  cvss_score: number | null;
  cvss_vector: string | null;
  cwe_id: string | null;
  package_name: string | null;
  package_version: string | null;
  affected_component: string | null;
  file_path: string | null;
  line_start: number | null;
  line_end: number | null;
  cert_in_advisory_id: string | null;
  cert_in_severity: string | null;
  cert_in_directive: string | null;
  ai_analysis: string | null;
  ai_risk_score: number | null;
  remediation_available: boolean;
  remediation_steps: string | null;
  fixed_version: string | null;
  finding_references: any;
  false_positive: boolean;
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanConfig {
  id: number;
  project_id: number;
  vulnerability_scanner_enabled: boolean;
  llm_rag_scanner_enabled: boolean;
  model_provenance_scanner_enabled: boolean;
  container_scanner_enabled: boolean;
  sast_scanner_enabled: boolean;
  cert_in_compliance_enabled: boolean;
  cert_in_severity_threshold: string;
  auto_scan_enabled: boolean;
  scan_frequency: string;
  notify_on_critical: boolean;
  notify_on_high: boolean;
  notification_channels: any;
  fail_on_critical: boolean;
  fail_on_high: boolean;
  max_acceptable_risk_score: number;
  created_at: string;
  updated_at: string;
}

const scannerAPI = {
  runUnifiedScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/unified/${projectId}`),

  runVulnerabilityScan: (projectId: number, certInEnabled: boolean = false) =>
    api.post<ScannerRun>(`/scanner/scan/vulnerability/${projectId}?cert_in_enabled=${certInEnabled}`),

  runLLMRAGScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/llm-rag/${projectId}`),

  runModelProvenanceScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/model-provenance/${projectId}`),

  runContainerScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/container/${projectId}`),

  runSASTScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/sast/${projectId}`),

  runMLSecurityScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/ml-security/${projectId}`),

  runDatasetPoisoningScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/dataset-poisoning/${projectId}`),

  runModelPoisoningScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/model-poisoning/${projectId}`),

  runAdversarialRobustnessScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/adversarial-robustness/${projectId}`),

  runZeroDayScan: (projectId: number) =>
    api.post<ScannerRun>(`/scanner/scan/zero-day/${projectId}`),

  getScanRuns: (projectId: number, limit: number = 10) =>
    api.get<ScannerRun[]>(`/scanner/scan/runs/${projectId}?limit=${limit}`),

  getScanRun: (runId: number) =>
    api.get<ScannerRun>(`/scanner/scan/run/${runId}`),

  getFindings: (runId: number, severity?: string) =>
    api.get<ScannerFinding[]>(`/scanner/scan/findings/${runId}${severity ? `?severity=${severity}` : ''}`),

  getConfig: (projectId: number) =>
    api.get<ScanConfig>(`/scanner/scan/config/${projectId}`),

  updateConfig: (projectId: number, config: Partial<ScanConfig>) =>
    api.put<ScanConfig>(`/scanner/scan/config/${projectId}`, config)
};

export default scannerAPI;
export { scannerAPI };
