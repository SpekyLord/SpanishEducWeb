import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, FileText, Users, Bell, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-[#16213e] border-r border-white/10 z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col shadow-fb-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-heading text-lg font-semibold" style={{ color: '#f0e6d3' }}>SpanishConnect</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#0f3460] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Profile section */}
        {user && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="avatar-ring">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-lg">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-white font-medium">{user.displayName}</p>
                <p className="text-gray-400 text-sm capitalize">{user.role || 'Student'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 py-2 overflow-y-auto" aria-label="Mobile navigation">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive(to)
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-gray-300 hover:bg-[#0f3460] hover:text-white'
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all hover:translate-x-1"
          >
            <LogOut size={20} aria-hidden="true" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};
