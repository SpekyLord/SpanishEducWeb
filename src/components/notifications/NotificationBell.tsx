import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '../../services/api';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationRead = () => {
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => {
          if (window.innerWidth < 640) {
            navigate('/notifications');
          } else {
            setShowDropdown(!showDropdown);
          }
        }}
        style={{ position: 'relative', padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} style={{ color: '#4a6a58' }} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: 700, borderRadius: '9999px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', boxShadow: '0 0 8px rgba(233,69,96,0.4)' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          onNotificationRead={handleNotificationRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
