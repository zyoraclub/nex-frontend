import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { GrNotification, GrTooltip, GrConnect, GrUser, GrPower } from 'react-icons/gr';
import { authAPI } from '../../services/api';
import { NotificationContext } from '../../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';
import './Layout.css';

export default function Header() {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const location = useLocation();
  const [orgName, setOrgName] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Safe access to notifications context (may not be available on login pages)
  const notificationContext = useContext(NotificationContext);
  const hasUnread = notificationContext?.hasUnread ?? false;
  const markAllAsRead = notificationContext?.markAllAsRead ?? (() => {});
  const setHasUnread = notificationContext?.setHasUnread ?? (() => {});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setOrgName(response.data.organization_name);
      } catch (err) {
        // Silent fail
      }
    };
    fetchUser();
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    return path?.charAt(0).toUpperCase() + path?.slice(1) || 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark as read when opening
      markAllAsRead();
      setHasUnread(false);
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <div className="breadcrumbs">
            <span className="breadcrumb-org">{orgName || orgSlug}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-page">{getPageTitle()}</span>
          </div>
        </div>
        <div className="header-right">
          <button
            className="header-icon-btn notification-btn"
            title="Notifications"
            onClick={handleNotificationClick}
          >
            <GrNotification size={16} />
            {hasUnread && <span className="notification-dot" />}
          </button>
          <button className="header-icon-btn" title="News">
            <GrTooltip size={16} />
          </button>
          <button
            className="header-icon-btn"
            title="Integrations"
            onClick={() => navigate(`/${orgSlug}/integrations`)}
          >
            <GrConnect size={16} />
          </button>
          <div className="user-pill" onClick={() => navigate(`/${orgSlug}/profile`)} style={{ cursor: 'pointer' }}>
            <div className="user-avatar">
              <GrUser size={14} />
            </div>
            <span className="user-name">{orgName || 'User'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <GrPower size={16} />
          </button>
        </div>
      </div>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
