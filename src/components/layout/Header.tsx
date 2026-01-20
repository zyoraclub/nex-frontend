import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GrNotification, GrTooltip, GrConnect, GrUser, GrPower } from 'react-icons/gr';
import { authAPI } from '../../services/api';
import NotificationCenter from './NotificationCenter';
import './Layout.css';

export default function Header() {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const location = useLocation();
  const [orgName, setOrgName] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        setOrgName(response.data.organization_name);
      } catch (err) {
        console.error('Failed to fetch user');
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
            className="header-icon-btn" 
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <GrNotification size={16} />
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
