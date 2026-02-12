import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, MessageCircle } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../../contexts/AuthContext';

interface PopoverUser {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: 'teacher' | 'student';
}

interface UserPopoverProps {
  user: PopoverUser;
  anchorRect: { top: number; left: number; bottom: number };
  onClose: () => void;
}

export const UserPopover: React.FC<UserPopoverProps> = ({ user, anchorRect, onClose }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const isOwnProfile = currentUser?._id === user._id;

  useEffect(() => {
    const popoverWidth = 240;
    const popoverHeight = 180;
    const spaceBelow = window.innerHeight - anchorRect.bottom;

    // Position below the clicked element if there's space, otherwise above
    const top = spaceBelow > popoverHeight
      ? anchorRect.bottom + 8
      : anchorRect.top - popoverHeight - 8;

    // Position popover to the left edge of the anchor, slightly offset
    const left = Math.max(8, Math.min(anchorRect.left, window.innerWidth - popoverWidth - 8));

    setPosition({ top: Math.max(8, top), left });
  }, [anchorRect]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleViewProfile = () => {
    onClose();
    navigate(`/profile/${user.username}`);
  };

  const handleSendMessage = () => {
    onClose();
    navigate('/messages', {
      state: {
        userId: user._id,
        otherUser: {
          _id: user._id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        }
      }
    });
  };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 50,
        width: '240px',
        backgroundColor: '#1e2a4a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* User info */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#f0e6d3', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.displayName}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
            @{user.username}
          </p>
          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', backgroundColor: '#0f3460', color: '#d1d5db', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '4px' }}>
        <button
          onClick={handleViewProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#d1d5db',
            fontSize: '0.85rem',
            borderRadius: '8px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(15,52,96,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <UserIcon size={18} />
          <span>View Profile</span>
        </button>

        {!isOwnProfile && (
          <button
            onClick={handleSendMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#d1d5db',
              fontSize: '0.85rem',
              borderRadius: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(15,52,96,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <MessageCircle size={18} />
            <span>Send Message</span>
          </button>
        )}
      </div>
    </div>
  );
};
