import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { NotificationContext } from '../../contexts/NotificationContext';
import './ToastNotification.css';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  link?: string;
  visible: boolean;
}

export default function ToastNotification() {
  const notificationContext = useContext(NotificationContext);
  const notifications = notificationContext?.notifications ?? [];
  const markAsRead = notificationContext?.markAsRead ?? (() => {});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();
  const { orgSlug } = useParams();

  // Watch for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);

    unreadNotifications.forEach(notification => {
      // Check if toast already exists
      if (!toasts.find(t => t.id === notification.id)) {
        setToasts(prev => [
          ...prev,
          {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            visible: true,
          }
        ]);

        // Auto-hide after 8 seconds
        setTimeout(() => {
          setToasts(prev =>
            prev.map(t => (t.id === notification.id ? { ...t, visible: false } : t))
          );
          // Remove from DOM after animation
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== notification.id));
          }, 300);
        }, 8000);
      }
    });
  }, [notifications, toasts]);

  const handleDismiss = (id: string) => {
    setToasts(prev =>
      prev.map(t => (t.id === id ? { ...t, visible: false } : t))
    );
    markAsRead(id);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  const handleClick = (toast: Toast) => {
    if (toast.link) {
      navigate(`/${orgSlug}${toast.link}`);
    }
    handleDismiss(toast.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={20} />;
      case 'error':
        return <FiAlertCircle size={20} />;
      case 'warning':
        return <FiAlertTriangle size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.visible ? 'toast-enter' : 'toast-exit'}`}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => handleClick(toast)}
        >
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss(toast.id);
            }}
          >
            <FiX size={16} />
          </button>
          <div className="toast-progress">
            <div className="toast-progress-bar" />
          </div>
        </div>
      ))}
    </div>
  );
}
