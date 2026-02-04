import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, FileText, Search, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications';

interface HeaderProps {
  variant?: 'auth' | 'feed';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'auth' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header role="banner" className="sticky top-0 z-20 bg-fb-card border-b border-fb-border shadow-fb">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-3" aria-label="SpanishConnect home">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg" aria-hidden="true">
            SC
          </div>
          <span className="hidden sm:block text-gray-100 font-semibold text-lg">
            SpanishConnect
          </span>
        </Link>

        {/* Navigation - only show when logged in */}
        {variant === 'feed' && (
          <nav role="navigation" aria-label="Main navigation" className="hidden md:flex items-center gap-2 ml-4">
            <Link
              to="/feed"
              aria-current={isActive('/feed') ? 'page' : undefined}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                isActive('/feed')
                  ? 'text-blue-400 bg-fb-hover border-b-2 border-blue-400'
                  : 'text-gray-300 hover:bg-fb-hover'
              }`}
            >
              <Home size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link
              to="/groups"
              aria-current={isActive('/groups') ? 'page' : undefined}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                isActive('/groups')
                  ? 'text-blue-400 bg-fb-hover border-b-2 border-blue-400'
                  : 'text-gray-300 hover:bg-fb-hover'
              }`}
            >
              <Users size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Groups</span>
            </Link>
            <Link
              to="/messages"
              aria-current={isActive('/messages') ? 'page' : undefined}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                isActive('/messages')
                  ? 'text-blue-400 bg-fb-hover border-b-2 border-blue-400'
                  : 'text-gray-300 hover:bg-fb-hover'
              }`}
            >
              <MessageCircle size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Messages</span>
            </Link>
            <Link
              to="/files"
              aria-current={isActive('/files') ? 'page' : undefined}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                isActive('/files')
                  ? 'text-blue-400 bg-fb-hover border-b-2 border-blue-400'
                  : 'text-gray-300 hover:bg-fb-hover'
              }`}
            >
              <FileText size={20} aria-hidden="true" />
              <span className="text-sm font-medium">Files</span>
            </Link>
          </nav>
        )}

        <div className="flex-1" />

        {/* Search bar - only show when logged in */}
        {variant === 'feed' && (
          <div className="hidden md:flex items-center gap-2 bg-fb-hover rounded-full px-4 py-2 flex-1 max-w-xs">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search SpanishConnect"
              className="bg-transparent border-none outline-none text-sm text-gray-100 placeholder-gray-400 w-full"
            />
          </div>
        )}

        {/* Right side */}
        {variant === 'feed' && user ? (
          <div className="flex items-center gap-2">
            <button className="md:hidden p-2 rounded-full hover:bg-fb-hover" aria-label="Open menu">
              <Menu size={20} className="text-gray-300" aria-hidden="true" />
            </button>
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-fb-hover flex items-center justify-center text-white font-semibold text-sm" aria-hidden="true">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{user.displayName}</span>
            </div>
            <button
              onClick={logout}
              aria-label="Logout"
              className="px-3 py-1.5 text-sm font-medium text-white bg-fb-hover rounded-md hover:bg-[#4e4f50] transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 bg-fb-hover rounded-full" aria-hidden="true" />
        )}
      </div>
    </header>
  );
};
