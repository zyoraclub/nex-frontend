import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaClock, FaTimes } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import api from '../../services/api';
import './NotificationCenter.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/analytics');
      const activities = response.data.recent_activities || [];
      setNotifications(activities);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (status: string) => {
    if (status === 'completed') return <FaCheckCircle style={{ color: '#22c55e' }} />;
    if (status === 'failed') return <FaExclamationTriangle style={{ color: '#ef4444' }} />;
    return <FaClock style={{ color: '#3b82f6' }} />;
  };

  const handleNotificationClick = (notification: any) => {
    navigate(`/${orgSlug}/projects/${notification.project_id}/scans/${notification.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay">
      <div ref={modalRef} className="notification-modal">
        <div className="notification-header">
          <div className="notification-title">
            <FaBell size={18} />
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length}</span>
            )}
          </div>
          <button className="notification-close" onClick={onClose}>
            <FaTimes size={16} />
          </button>
        </div>

        <div className="notification-content">
          {loading ? (
            <div className="notification-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <MdSecurity size={48} style={{ color: '#333333' }} />
              <p>No notifications yet</p>
              <span>Scan activity will appear here</span>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="notification-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.status)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-text">
                      <strong>{notification.scan_type.replace('_', ' ')}</strong> scan on{' '}
                      <strong>{notification.project_name}</strong>
                    </div>
                    <div className="notification-meta">
                      <span className={`notification-status status-${notification.status}`}>
                        {notification.status}
                      </span>
                      {notification.total_findings > 0 && (
                        <>
                          <span className="notification-separator">•</span>
                          <span className="notification-findings">
                            {notification.total_findings} findings
                          </span>
                        </>
                      )}
                      {notification.critical_count > 0 && (
                        <>
                          <span className="notification-separator">•</span>
                          <span className="notification-critical">
                            {notification.critical_count} critical
                          </span>
                        </>
                      )}
                    </div>
                    <div className="notification-time">{formatTime(notification.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
