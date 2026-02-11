import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../../services/api';
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
      className="absolute top-full right-0 mt-2 w-[28rem] max-w-[calc(100vw-2rem)] glass-card-elevated shadow-fb-xl rounded-xl z-50 animate-fade-in-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-fb-border/50">
        <h3 id="notifications-title" className="text-lg font-semibold text-gray-100 font-heading">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="text-sm text-gold hover:text-gold-light font-medium px-3 py-1 rounded-md hover:bg-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {markingAllRead ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-gold" size={24} />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-900/30 border border-red-700/60 text-red-200 p-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">No notifications yet</p>
            <p className="text-gray-500 text-xs mt-1">You'll be notified when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-fb-border/50">
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
        <div className="px-5 py-3 border-t border-fb-border/50 text-center">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-gold hover:text-gold-light font-medium transition-colors"
          >
            See all notifications →
          </button>
        </div>
      )}
    </div>
  );
};
