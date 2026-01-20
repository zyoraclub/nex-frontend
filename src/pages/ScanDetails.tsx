import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import UnifiedScanResults from '../components/scanner/UnifiedScanResults';
import ScanResults from '../components/scanner/ScanResults';
import ScanProgressDock from '../components/scanner/ScanProgressDock';
import { scannerAPI, type ScannerRun } from '../services/scannerAPI';
import './ScanDetails.css';

export default function ScanDetails() {
  const { orgSlug, projectSlug, scanId } = useParams();
  const navigate = useNavigate();
  const [scanRun, setScanRun] = useState<ScannerRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProgressDock, setShowProgressDock] = useState(false);

  useEffect(() => {
    fetchScanRun();
    
    // Only poll if scan is running
    let interval: NodeJS.Timeout | null = null;
    if (scanRun?.status === 'running' || scanRun?.status === 'pending') {
      interval = setInterval(fetchScanRun, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanId, scanRun?.status]);

  useEffect(() => {
    if (scanRun?.status === 'running') {
      setShowProgressDock(true);
    }
  }, [scanRun]);

  const fetchScanRun = async () => {
    if (!scanId) return;
    try {
      const response = await scannerAPI.getScanRun(parseInt(scanId));
      setScanRun(response.data);
    } catch (err) {
      console.error('Failed to fetch scan run');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${orgSlug}/projects/${projectSlug}/scans`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="scan-details-loading">Loading scan details...</div>
      </DashboardLayout>
    );
  }

  if (!scanRun) {
    return (
      <DashboardLayout>
        <div className="scan-details-error">
          <p>Scan not found</p>
          <button onClick={handleBack} className="btn-back">Back to Scans</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {showProgressDock && scanRun && scanRun.status === 'running' && (
        <ScanProgressDock
          scanId={scanRun.id}
          status={scanRun.status}
          progress={scanRun.progress}
          onClose={() => setShowProgressDock(false)}
        />
      )}
      <div className="scan-details-container">
        <div className="scan-details-header">
          <button onClick={handleBack} className="btn-back">← Back to Scans</button>
          {scanRun.status === 'completed' && (
            <button 
              onClick={() => navigate(`/${orgSlug}/projects/${projectSlug}/scans/${scanId}/reports`)}
              className="btn-reports"
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📄 View Reports
            </button>
          )}
        </div>
        
        {scanRun.status === 'completed' && (
          scanRun.scan_type === 'unified' ? (
            <UnifiedScanResults run={scanRun} />
          ) : (
            <ScanResults run={scanRun} />
          )
        )}

        {scanRun.status === 'failed' && (
          <div className="scan-error-state">
            <p>Scan failed</p>
            <span>{scanRun.error_message}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
