import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';

interface Report {
  filename: string;
  size_bytes: number;
  created_at: string;
}

interface Language {
  code: string;
  name: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' }
];

export default function Reports() {
  const { orgSlug, projectSlug, scanId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [scanId]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`/scanner/scan/reports/${scanId}`);
      const sortedReports = response.data.reports.sort((a: Report, b: Report) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReports(sortedReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    setGenerating(true);
    try {
      const response = await api.post(
        `/reports/generate/${scanId}?report_type=${reportType}&language=${selectedLanguage}`
      );
      
      if (response.data.success) {
        // Download the generated report
        const downloadResponse = await api.get(
          `/reports/download/${scanId}/${response.data.filename}`,
          { responseType: 'blob' }
        );
        
        const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', response.data.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Refresh reports list
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (filename: string) => {
    try {
      const response = await api.get(
        `/scanner/scan/reports/${scanId}/download/${filename}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const getReportType = (filename: string) => {
    if (filename.includes('cert_in')) return 'CERT-In Compliance';
    if (filename.includes('comprehensive')) return 'Comprehensive';
    if (filename.includes('soc2')) return 'SOC2';
    if (filename.includes('iso27001')) return 'ISO 27001';
    if (filename.includes('nist')) return 'NIST';
    if (filename.includes('rbi')) return 'RBI';
    return 'Report';
  };

  const handleBack = () => {
    navigate(`/${orgSlug}/projects/${projectSlug}/scans/${scanId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#888888'
        }}>
          Loading reports...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleBack} style={{
            padding: '8px 16px',
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            ← Back to Scan
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 5px 0' }}>
            Compliance Reports
          </h1>
          <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>Scan ID: {scanId}</p>
        </div>

        {/* Language Selector & Generate Reports */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
            🌐 Generate Report in Your Language
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#888888', minWidth: '80px' }}>
              Language:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                flex: 1,
                maxWidth: '300px',
                padding: '10px 12px',
                background: '#000000',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => generateReport('cert_in')}
              disabled={generating}
              style={{
                padding: '8px 16px',
                background: generating ? '#1a1a1a' : '#fec76f',
                color: generating ? '#666666' : '#0a0a0a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {generating ? '⏳ Generating...' : '📄 CERT-In'}
            </button>
            <button
              onClick={() => generateReport('comprehensive')}
              disabled={generating}
              style={{
                padding: '8px 16px',
                background: generating ? '#1a1a1a' : '#fec76f',
                color: generating ? '#666666' : '#0a0a0a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {generating ? '⏳ Generating...' : '📊 Comprehensive'}
            </button>
            <button
              onClick={() => generateReport('soc2')}
              disabled={generating}
              style={{
                padding: '8px 16px',
                background: generating ? '#1a1a1a' : '#fec76f',
                color: generating ? '#666666' : '#0a0a0a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {generating ? '⏳ Generating...' : '🔒 SOC2'}
            </button>
            <button
              onClick={() => generateReport('iso27001')}
              disabled={generating}
              style={{
                padding: '8px 16px',
                background: generating ? '#1a1a1a' : '#fec76f',
                color: generating ? '#666666' : '#0a0a0a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: generating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {generating ? '⏳ Generating...' : '🛡️ ISO 27001'}
            </button>
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#eab308', margin: '0 0 8px 0' }}>
                No Reports Available
              </h3>
              <p style={{ fontSize: '13px', color: '#888888', margin: 0 }}>
                Reports are auto-generated when scans complete. Please wait for the scan to finish.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '16px'
          }}>
            {reports.map((report) => (
              <div
                key={report.filename}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: '8px',
                  padding: '20px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fec76f';
                  e.currentTarget.style.background = 'rgba(254, 199, 111, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.background = '#0a0a0a';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '32px' }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', margin: '0 0 4px 0' }}>
                      {getReportType(report.filename)}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#666666', margin: 0 }}>
                      {formatFileSize(report.size_bytes)}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#666666',
                  marginBottom: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #1a1a1a'
                }}>
                  <span>🗓️</span>
                  {new Date(report.created_at).toLocaleString()}
                </div>

                <button
                  onClick={() => downloadReport(report.filename)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: '#fec76f',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#ffd98f';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fec76f';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>⬇️</span>
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6', margin: '0 0 12px 0' }}>
            Report Types
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#888888', lineHeight: '1.8' }}>
            <li><strong style={{ color: '#ffffff' }}>CERT-In:</strong> Indian Government compliance with advisory mappings</li>
            <li><strong style={{ color: '#ffffff' }}>Comprehensive:</strong> All-in-one report covering CVE, CERT-In, SOC2, ISO27001</li>
            <li><strong style={{ color: '#ffffff' }}>SOC2:</strong> Service Organization Control 2 compliance</li>
            <li><strong style={{ color: '#ffffff' }}>ISO 27001:</strong> Information security management standards</li>
            <li><strong style={{ color: '#ffffff' }}>NIST:</strong> US National Institute of Standards and Technology</li>
            <li><strong style={{ color: '#ffffff' }}>RBI:</strong> Reserve Bank of India cybersecurity guidelines</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
