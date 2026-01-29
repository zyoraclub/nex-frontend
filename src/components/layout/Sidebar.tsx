import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GrLogout, GrAppsRounded, GrCompliance, GrLineChart, GrServer, GrCube, GrConnect, GrList, GrBook, GrCode, GrDown, GrUp, GrConfigure } from 'react-icons/gr';
import { PiWebhooksLogo } from 'react-icons/pi';
import { authAPI } from '../../services/api';
import './Layout.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const { orgSlug } = useParams();
  const [orgData, setOrgData] = useState({ name: '', email: '' });
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await authAPI.getMe();
        setOrgData({
          name: response.data.organization_name,
          email: response.data.email
        });
      } catch (err) {
        console.error('Failed to fetch org data');
      }
    };
    fetchOrg();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <GrAppsRounded />, path: `/${orgSlug}/dashboard` },
    { name: 'Workspaces', icon: <GrServer />, path: `/${orgSlug}/workspaces` },
    { name: 'Projects', icon: <GrCube />, path: `/${orgSlug}/projects` },
    { name: 'Trends', icon: <GrLineChart />, path: `/${orgSlug}/trends` },
    { name: 'Compliance', icon: <GrCompliance />, path: `/${orgSlug}/compliance` },
    { name: 'Integrations', icon: <GrConnect />, path: `/${orgSlug}/integrations` },
    { name: 'Webhooks', icon: <PiWebhooksLogo />, path: `/${orgSlug}/settings/webhooks` },
    { name: 'Audit Logs', icon: <GrList />, path: `/${orgSlug}/audit-logs` },
    { name: 'Settings', icon: <GrConfigure />, path: `/${orgSlug}/settings/account` },
  ];

  const developerItems = [
    { name: 'API Keys', icon: <GrCode />, path: `/${orgSlug}/settings/api-keys` },
    { name: 'API Docs', icon: <GrBook />, path: `/api-docs` },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo/nexula.png" alt="Nexula AI" style={{ height: '32px', width: 'auto' }} />
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className="sidebar-item"
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
        
        <div className="sidebar-submenu">
          <button
            className="sidebar-item sidebar-submenu-toggle"
            onClick={() => setIsDeveloperOpen(!isDeveloperOpen)}
          >
            <span className="sidebar-icon"><GrCode /></span>
            <span>Developer</span>
            <span className="sidebar-arrow">{isDeveloperOpen ? <GrUp /> : <GrDown />}</span>
          </button>
          {isDeveloperOpen && (
            <div className="sidebar-submenu-items">
              {developerItems.map((item) => (
                <button
                  key={item.name}
                  className="sidebar-item sidebar-subitem"
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="org-card" onClick={() => navigate(`/${orgSlug}/profile`)} style={{ cursor: 'pointer' }}>
          <div className="org-info">
            <div className="org-name">{orgData.name || 'Organization'}</div>
            <div className="org-email">{orgData.email || 'email@example.com'}</div>
          </div>
          <button className="org-logout" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout">
            <GrLogout size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
