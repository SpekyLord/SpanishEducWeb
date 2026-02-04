import React from 'react';
import { MessageCircle, Heart, AtSign, FileText, Pin, Mail } from 'lucide-react';
import { Notification } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'comment_reply':
      return <MessageCircle size={16} className="text-blue-400" />;
    case 'comment_like':
      return <Heart size={16} className="text-red-400" />;
    case 'mention':
      return <AtSign size={16} className="text-green-400" />;
    case 'new_post':
      return <FileText size={16} className="text-purple-400" />;
    case 'pinned_comment':
      return <Pin size={16} className="text-yellow-400" />;
    case 'direct_message':
      return <Mail size={16} className="text-blue-400" />;
    default:
      return <MessageCircle size={16} className="text-gray-400" />;
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
  const contentPreview = notification.content.length > 60
    ? notification.content.substring(0, 60) + '...'
    : notification.content;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-fb-hover transition-colors flex gap-3 ${
        !notification.isRead ? 'bg-blue-900/10' : ''
      }`}
    >
      {/* Avatar with icon badge */}
      <div className="relative flex-shrink-0">
        <img
          src={notification.actor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.actor.displayName || notification.actor.username)}&background=3b82f6&color=fff`}
          alt={notification.actor.displayName || notification.actor.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="absolute -bottom-1 -right-1 bg-fb-card rounded-full p-0.5">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-100 mb-0.5">
          {message}
        </p>
        {notification.content && (
          <p className="text-xs text-gray-400 mb-1 truncate">
            {contentPreview}
          </p>
        )}
        <p className="text-xs text-gray-500">
          {timeAgo}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0 pt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </button>
  );
}, (prevProps, nextProps) => {
  return prevProps.notification._id === nextProps.notification._id &&
         prevProps.notification.isRead === nextProps.notification.isRead;
});

NotificationItem.displayName = 'NotificationItem';
