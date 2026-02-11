import React from 'react';
import { MessageCircle, Heart, AtSign, FileText, Pin, Mail } from 'lucide-react';
import { Notification } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'comment_reply':
      return <MessageCircle size={16} style={{ color: '#60a5fa' }} />;
    case 'comment_like':
      return <Heart size={16} style={{ color: '#f87171' }} />;
    case 'mention':
      return <AtSign size={16} style={{ color: '#4ade80' }} />;
    case 'new_post':
      return <FileText size={16} style={{ color: '#c084fc' }} />;
    case 'pinned_comment':
      return <Pin size={16} style={{ color: '#facc15' }} />;
    case 'direct_message':
      return <Mail size={16} style={{ color: '#60a5fa' }} />;
    default:
      return <MessageCircle size={16} style={{ color: '#9ca3af' }} />;
  }
};

const getNotificationMessage = (notification: Notification): string => {
  const { type, actor } = notification;
  const name = actor.displayName || actor.username;

  switch (type) {
    case 'comment_reply':
      return `${name} replied to your comment`;
    case 'comment_like':
      return `${name} liked your comment`;
    case 'mention':
      return `${name} mentioned you in a comment`;
    case 'new_post':
      return `${name} posted something new`;
    case 'pinned_comment':
      return `${name} pinned your comment`;
    case 'direct_message':
      return `${name} sent you a message`;
    default:
      return `${name} interacted with your content`;
  }
};

export const NotificationItem = React.memo<NotificationItemProps>(({ notification, onClick }) => {
  const message = getNotificationMessage(notification);
  const icon = getNotificationIcon(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  // Truncate content preview
  const contentPreview = notification.content.length > 120
    ? notification.content.substring(0, 120) + '...'
    : notification.content;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px 20px',
        textAlign: 'left' as const,
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        background: !notification.isRead ? 'linear-gradient(135deg, rgba(233,69,96,0.08) 0%, rgba(233,69,96,0.04) 50%, rgba(233,69,96,0.08) 100%)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {/* Avatar with icon badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <UserAvatar name={notification.actor.displayName || notification.actor.username} avatarUrl={notification.actor.avatar} size="lg" />
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: '#16213e', borderRadius: '50%', padding: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {icon}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.875rem', color: '#f3f4f6', margin: '0 0 4px', lineHeight: 1.4 }}>
          {message}
        </p>
        {notification.content && (
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {contentPreview}
          </p>
        )}
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
          {timeAgo}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div style={{ flexShrink: 0, paddingTop: '8px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#e94560', borderRadius: '50%', boxShadow: '0 0 8px rgba(233,69,96,0.4)' }} />
        </div>
      )}
    </button>
  );
}, (prevProps, nextProps) => {
  return prevProps.notification._id === nextProps.notification._id &&
         prevProps.notification.isRead === nextProps.notification.isRead;
});

NotificationItem.displayName = 'NotificationItem';
