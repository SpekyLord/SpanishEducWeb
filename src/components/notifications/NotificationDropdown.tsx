import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../../services/api';
import { NotificationItem } from './NotificationItem';
import { Loader2 } from 'lucide-react';

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
      navigate('/messages');
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

  return (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications"
      aria-modal="false"
      className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-fb-card border border-fb-border shadow-fb-xl rounded-lg z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-fb-border">
        <h3 id="notifications-title" className="text-lg font-semibold text-gray-100">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAllRead ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-900/30 border border-red-700/60 text-red-200 p-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-fb-border">
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
        <div className="p-3 border-t border-fb-border text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
};
