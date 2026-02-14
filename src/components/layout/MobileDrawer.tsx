import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, FileText, Users, Bell, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/files', icon: FileText, label: 'Files' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open (position:fixed pattern for mobile browsers)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
    };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 9998,
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '300px',
          backgroundColor: '#ffffff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header with close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #d4ddd8',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a3a2a',
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Piccio Bloguero
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b8a7a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile section */}
        {user && (
          <Link
            to={`/profile/${user.username}`}
            onClick={onClose}
            style={{
              display: 'block',
              padding: '16px',
              borderBottom: '1px solid #d4ddd8',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserAvatar name={user.displayName} avatarUrl={user.avatar?.url} size="md" />
              <div>
                <p style={{ color: '#1a3a2a', fontWeight: 500, margin: 0, fontSize: '15px' }}>
                  {user.displayName}
                </p>
                <p style={{ color: '#6b8a7a', fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>
                  {user.role || 'Student'}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }} aria-label="Mobile navigation">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                margin: '2px 8px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(to) ? '#b8860b' : '#4a6a58',
                backgroundColor: isActive(to) ? 'rgba(184,134,11,0.08)' : 'transparent',
                borderLeft: isActive(to) ? '3px solid #b8860b' : '3px solid transparent',
                fontWeight: 500,
                fontSize: '15px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div style={{ padding: '16px', borderTop: '1px solid #d4ddd8' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#dc2626',
              fontWeight: 500,
              fontSize: '15px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <LogOut size={20} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
