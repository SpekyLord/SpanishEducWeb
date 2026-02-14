import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications, Notification } from '../../services/api';
import { NotificationItem } from './NotificationItem';
import { Loader2, Bell } from 'lucide-react';

interface NotificationDropdownProps {
  onNotificationRead: () => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onNotificationRead,
  onMarkAllRead,
  onClose
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Focus first focusable element on mount
    const focusableElements = dropdownRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(1, 10);
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        onNotificationRead();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    // Navigate based on notification type
    const { type, reference } = notification;

    if (type === 'comment_reply' || type === 'mention' || type === 'comment_like' || type === 'pinned_comment') {
      navigate(`/feed#comment-${reference.id}`);
    } else if (type === 'new_post') {
      navigate(`/feed#post-${reference.id}`);
    } else if (type === 'direct_message') {
      navigate('/messages', {
        state: {
          userId: notification.actor._id,
          otherUser: {
            _id: notification.actor._id,
            username: notification.actor.username,
            displayName: notification.actor.displayName,
            avatarUrl: notification.actor.avatar,
          }
        }
      });
    }

    onClose();
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onMarkAllRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearingAll(true);
      await clearAllNotifications();
      setNotifications([]);
      onMarkAllRead();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
      className="glass-card-elevated"
      style={{
        position: 'fixed',
        top: '60px',
        right: '16px',
        width: 'min(32rem, calc(100vw - 32px))',
        zIndex: 9997,
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #d4ddd8' }}>
        <h3 id="notifications-title" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a3a2a', margin: 0 }}>Notifications</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              style={{ fontSize: '0.875rem', color: '#b8860b', fontWeight: 500, padding: '4px 12px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: markingAllRead ? 'not-allowed' : 'pointer', opacity: markingAllRead ? 0.5 : 1 }}
            >
              {markingAllRead ? 'Marking...' : 'Mark all read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 500, padding: '4px 12px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: clearingAll ? 'not-allowed' : 'pointer', opacity: clearingAll ? 0.5 : 1 }}
            >
              {clearingAll ? 'Clearing...' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <Loader2 style={{ color: '#b8860b', animation: 'spin 1s linear infinite' }} size={24} />
          </div>
        ) : error ? (
          <div style={{ padding: '16px' }}>
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', color: '#6b8a7a', display: 'block' }} />
            <p style={{ color: '#6b8a7a', fontWeight: 500, margin: '0 0 4px' }}>No notifications yet</p>
            <p style={{ color: '#6b8a7a', fontSize: '0.75rem', margin: 0 }}>You'll be notified when something happens</p>
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && notifications.length > 0 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #d4ddd8', textAlign: 'center' }}>
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            style={{ fontSize: '0.875rem', color: '#b8860b', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            See all notifications →
          </button>
        </div>
      )}
    </div>
  );
};
