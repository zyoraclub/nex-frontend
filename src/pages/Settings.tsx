import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiLock, FiShield, FiSmartphone, FiMail, FiEye, FiEyeOff, FiCheck, FiX, FiCopy, FiRefreshCw } from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import './Settings.css';

interface TwoFactorStatus {
  enabled: boolean;
  method: string | null;
  has_backup_codes: boolean;
}

export default function Settings() {
  const { orgSlug } = useParams();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [setupMethod, setSetupMethod] = useState<'email' | 'authenticator' | null>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTwoFactorStatus();
  }, []);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await api.get('/settings/2fa/status');
      setTwoFactorStatus(response.data);
    } catch (err) {
      console.error('Failed to fetch 2FA status');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/settings/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // 2FA setup handlers
  const handleSetup2FA = async (method: 'email' | 'authenticator') => {
    setTwoFactorMessage(null);
    setSetupMethod(method);

    try {
      const response = await api.post('/settings/2fa/setup', { method });
      setSetupData(response.data);
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to start 2FA setup' });
      setSetupMethod(null);
    }
  };

  const handleVerify2FA = async () => {
    setTwoFactorMessage(null);

    try {
      const response = await api.post('/settings/2fa/verify', { code: verificationCode });
      setBackupCodes(response.data.backup_codes);
      setShowBackupCodes(true);
      setTwoFactorStatus({ enabled: true, method: response.data.method, has_backup_codes: true });
      setSetupMethod(null);
      setSetupData(null);
      setVerificationCode('');
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: err.response?.data?.detail || 'Invalid verification code' });
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorMessage(null);

    try {
      await api.post('/settings/2fa/disable', {
        password: disablePassword,
        code: twoFactorStatus?.method === 'authenticator' ? disableCode : undefined
      });
      setTwoFactorStatus({ enabled: false, method: null, has_backup_codes: false });
      setDisablePassword('');
      setDisableCode('');
      setTwoFactorMessage({ type: 'success', text: 'Two-factor authentication disabled' });
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to disable 2FA' });
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  const cancelSetup = () => {
    setSetupMethod(null);
    setSetupData(null);
    setVerificationCode('');
  };

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your password and security settings</p>
        </div>

        <div className="settings-grid">
          {/* Password Section */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FiLock className="settings-icon" />
              <div>
                <h2>Change Password</h2>
                <p>Update your account password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <span className="form-hint">Minimum 8 characters</span>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              {passwordMessage && (
                <div className={`message ${passwordMessage.type}`}>
                  {passwordMessage.type === 'success' ? <FiCheck /> : <FiX />}
                  {passwordMessage.text}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* 2FA Section */}
          <div className="settings-card">
            <div className="settings-card-header">
              <FiShield className="settings-icon" />
              <div>
                <h2>Two-Factor Authentication</h2>
                <p>Add an extra layer of security to your account</p>
              </div>
            </div>

            {twoFactorLoading ? (
              <div className="loading-state">Loading...</div>
            ) : twoFactorStatus?.enabled ? (
              <div className="two-factor-enabled">
                <div className="status-badge enabled">
                  <FiCheck /> 2FA Enabled
                </div>
                <p className="method-info">
                  Method: <strong>{twoFactorStatus.method === 'email' ? 'Email OTP' : 'Authenticator App'}</strong>
                </p>

                <div className="disable-section">
                  <h3>Disable Two-Factor Authentication</h3>
                  <div className="form-group">
                    <label>Your Password</label>
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>

                  {twoFactorStatus.method === 'authenticator' && (
                    <div className="form-group">
                      <label>Authenticator Code or Backup Code</label>
                      <input
                        type="text"
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={8}
                      />
                    </div>
                  )}

                  {twoFactorMessage && (
                    <div className={`message ${twoFactorMessage.type}`}>
                      {twoFactorMessage.type === 'success' ? <FiCheck /> : <FiX />}
                      {twoFactorMessage.text}
                    </div>
                  )}

                  <button
                    className="btn-danger"
                    onClick={handleDisable2FA}
                    disabled={!disablePassword}
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            ) : setupMethod ? (
              <div className="two-factor-setup">
                {setupData?.method === 'authenticator' ? (
                  <div className="authenticator-setup">
                    <h3>Set up Authenticator App</h3>
                    <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

                    <div className="qr-section">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qr_code_uri)}`}
                        alt="QR Code"
                        className="qr-code"
                      />
                      <div className="manual-entry">
                        <p>Or enter this code manually:</p>
                        <code>{setupData.secret}</code>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Enter the 6-digit code from your app</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="verification-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="email-setup">
                    <h3>Email Verification</h3>
                    <p>A verification code has been sent to your email address.</p>

                    <div className="form-group">
                      <label>Enter the 6-digit code</label>
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="verification-input"
                      />
                    </div>
                  </div>
                )}

                {twoFactorMessage && (
                  <div className={`message ${twoFactorMessage.type}`}>
                    {twoFactorMessage.type === 'success' ? <FiCheck /> : <FiX />}
                    {twoFactorMessage.text}
                  </div>
                )}

                <div className="setup-actions">
                  <button className="btn-secondary" onClick={cancelSetup}>Cancel</button>
                  <button
                    className="btn-primary"
                    onClick={handleVerify2FA}
                    disabled={verificationCode.length !== 6}
                  >
                    Verify & Enable
                  </button>
                </div>
              </div>
            ) : (
              <div className="two-factor-options">
                <p className="options-intro">Choose your preferred 2FA method:</p>

                <div className="method-cards">
                  <div className="method-card" onClick={() => handleSetup2FA('authenticator')}>
                    <FiSmartphone className="method-icon" />
                    <h3>Authenticator App</h3>
                    <p>Use Google Authenticator, Authy, or similar apps</p>
                    <span className="recommended">Recommended</span>
                  </div>

                  <div className="method-card" onClick={() => handleSetup2FA('email')}>
                    <FiMail className="method-icon" />
                    <h3>Email OTP</h3>
                    <p>Receive verification codes via email</p>
                  </div>
                </div>

                {twoFactorMessage && (
                  <div className={`message ${twoFactorMessage.type}`}>
                    {twoFactorMessage.type === 'success' ? <FiCheck /> : <FiX />}
                    {twoFactorMessage.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Backup Codes Modal */}
        {showBackupCodes && (
          <div className="modal-overlay">
            <div className="backup-codes-modal">
              <h2>Save Your Backup Codes</h2>
              <p>Store these codes in a safe place. Each code can only be used once.</p>

              <div className="backup-codes-grid">
                {backupCodes.map((code, index) => (
                  <div key={index} className="backup-code">{code}</div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={copyBackupCodes}>
                  <FiCopy /> Copy All
                </button>
                <button className="btn-primary" onClick={() => setShowBackupCodes(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
