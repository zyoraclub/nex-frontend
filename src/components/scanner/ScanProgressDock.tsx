import { useEffect } from 'react';
import './ScanProgressDock.css';

interface ScanProgressDockProps {
  scanId: number;
  status: string;
  progress: number;
  onClose: () => void;
}

export default function ScanProgressDock({ scanId, status, progress, onClose }: ScanProgressDockProps) {
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <div className="scan-progress-dock">
      <div className="dock-header">
        <span className="dock-title">🔍 Security Scan #{scanId}</span>
        <button className="dock-close" onClick={onClose}>×</button>
      </div>
      <div className="dock-body">
        <div className="dock-status">
          {status === 'running' && <span className="status-running">Running...</span>}
          {status === 'completed' && <span className="status-completed">✓ Completed</span>}
          {status === 'failed' && <span className="status-failed">✗ Failed</span>}
        </div>
        {status === 'running' && (
          <div className="dock-progress">
            <div className="dock-progress-bar">
              <div className="dock-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="dock-progress-text">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
