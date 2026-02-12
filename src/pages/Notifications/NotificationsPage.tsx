import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Bell } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  Notification
} from '../../services/api';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const loadNotifications = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await getNotifications(pageNum, 20);
      const newNotifications = response.data.notifications;

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(response.data.pagination.hasMore);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, true);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

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
            displayName: notification.actor.displayName,
            avatarUrl: notification.actor.avatar,
          }
        }
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    try {
      setClearingAll(true);
      await clearAllNotifications();
      setNotifications([]);
      setHasMore(false);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setClearingAll(false);
    }
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="min-h-screen bg-fb-bg">
      <Header variant="feed" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold text-light heading-accent">Notifications</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="text-sm text-gold hover:text-[#d4b87e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {markingAllRead ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 500, background: 'none', border: 'none', cursor: clearingAll ? 'not-allowed' : 'pointer', opacity: clearingAll ? 0.5 : 1, transition: 'color 0.2s' }}
              >
                {clearingAll ? 'Clearing...' : 'Clear all'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-gold" size={32} />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700/50 text-red-300 p-4 rounded-xl">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-light/20 mb-4" />
            <p className="text-light/50 text-lg">No notifications yet</p>
            <p className="text-light/30 text-sm mt-1">You'll see notifications here when someone interacts with your content</p>
          </div>
        ) : (
          <>
            <div className="glass-card-elevated rounded-xl overflow-hidden divide-y divide-fb-border/50">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 text-gold hover:text-[#d4b87e] text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Loading...
                    </span>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
