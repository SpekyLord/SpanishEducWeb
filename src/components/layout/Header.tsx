import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageCircle, FileText, Search, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications';
import { MobileDrawer } from './MobileDrawer';

interface HeaderProps {
  variant?: 'auth' | 'feed';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'auth' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header role="banner" className="sticky top-0 z-20 bg-fb-card/95 backdrop-blur-md border-b border-fb-border/50 shadow-fb">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-4">
        {/* Logo */}
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-3" aria-label="SpanishConnect home">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg shadow-glow-accent" aria-hidden="true">
            SC
          </div>
          <span className="hidden sm:block text-gray-100 font-bold tracking-wide text-lg font-heading">
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
                  ? 'text-gold bg-gold/10 border-b-2 border-gold shadow-glow-gold'
                  : 'text-gray-300 hover:bg-fb-hover hover:text-gray-100'
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
                  ? 'text-gold bg-gold/10 border-b-2 border-gold shadow-glow-gold'
                  : 'text-gray-300 hover:bg-fb-hover hover:text-gray-100'
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
                  ? 'text-gold bg-gold/10 border-b-2 border-gold shadow-glow-gold'
                  : 'text-gray-300 hover:bg-fb-hover hover:text-gray-100'
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
                  ? 'text-gold bg-gold/10 border-b-2 border-gold shadow-glow-gold'
                  : 'text-gray-300 hover:bg-fb-hover hover:text-gray-100'
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
          <div className="hidden md:flex items-center gap-2 bg-fb-hover/80 rounded-full px-4 py-2 flex-1 max-w-xs border border-fb-border/50">
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
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded-full hover:bg-fb-hover" aria-label="Open menu">
              <Menu size={20} className="text-gray-300" aria-hidden="true" />
            </button>
            <MobileDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-fb-hover ring-2 ring-gold/30 flex items-center justify-center text-white font-semibold text-sm" aria-hidden="true">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{user.displayName}</span>
            </div>
            <button
              onClick={logout}
              aria-label="Logout"
              className="px-3 py-1.5 text-sm font-medium text-white bg-fb-hover rounded-lg hover:bg-[#1a3a6e] transition-all hover:shadow-fb-lg"
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
