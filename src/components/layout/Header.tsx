import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, FileText, Search, Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../notifications';
import { MobileDrawer } from './MobileDrawer';
import { UserAvatar } from '../common/UserAvatar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { searchPosts } from '../../services/api';

interface HeaderProps {
  variant?: 'auth' | 'feed';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'auth' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Close profile dropdown on click outside or Escape
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileDropdownOpen]);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchPosts(searchQuery.trim(), 1, 5);
        setSearchResults(result.data?.posts || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSearchResults(false);
    };
    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showSearchResults]);

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: isActive(path) ? '#c9a96e' : '#d1d5db',
    backgroundColor: isActive(path) ? 'rgba(201,169,110,0.1)' : 'transparent',
    borderBottom: isActive(path) ? '2px solid #c9a96e' : '2px solid transparent',
    transition: 'background 0.2s, color 0.2s',
  });

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        width: '100%',
        backgroundColor: 'rgba(22,33,62,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Logo */}
        <Link to={user ? '/feed' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexShrink: 0 }} aria-label="SpanishConnect home">
          <div
            style={{ width: '40px', height: '40px', backgroundColor: '#e94560', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}
            aria-hidden="true"
          >
            SC
          </div>
          {isDesktop && (
            <span style={{ color: '#f3f4f6', fontWeight: 700, letterSpacing: '0.025em', fontSize: '1.125rem' }}>
              SpanishConnect
            </span>
          )}
        </Link>

        {/* Navigation - desktop only (MobileDrawer has these on mobile) */}
        {variant === 'feed' && isDesktop && (
          <nav role="navigation" aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
            <Link
              to="/feed"
              aria-current={isActive('/feed') ? 'page' : undefined}
              style={navLinkStyle('/feed')}
              onMouseEnter={e => { if (!isActive('/feed')) { e.currentTarget.style.backgroundColor = '#0f3460'; e.currentTarget.style.color = '#f3f4f6'; } }}
              onMouseLeave={e => { if (!isActive('/feed')) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; } }}
            >
              <Home size={20} aria-hidden="true" />
              <span>Home</span>
            </Link>
            <Link
              to="/groups"
              aria-current={isActive('/groups') ? 'page' : undefined}
              style={navLinkStyle('/groups')}
              onMouseEnter={e => { if (!isActive('/groups')) { e.currentTarget.style.backgroundColor = '#0f3460'; e.currentTarget.style.color = '#f3f4f6'; } }}
              onMouseLeave={e => { if (!isActive('/groups')) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; } }}
            >
              <Users size={20} aria-hidden="true" />
              <span>Groups</span>
            </Link>
            <Link
              to="/messages"
              aria-current={isActive('/messages') ? 'page' : undefined}
              style={navLinkStyle('/messages')}
              onMouseEnter={e => { if (!isActive('/messages')) { e.currentTarget.style.backgroundColor = '#0f3460'; e.currentTarget.style.color = '#f3f4f6'; } }}
              onMouseLeave={e => { if (!isActive('/messages')) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; } }}
            >
              <MessageCircle size={20} aria-hidden="true" />
              <span>Messages</span>
            </Link>
            <Link
              to="/files"
              aria-current={isActive('/files') ? 'page' : undefined}
              style={navLinkStyle('/files')}
              onMouseEnter={e => { if (!isActive('/files')) { e.currentTarget.style.backgroundColor = '#0f3460'; e.currentTarget.style.color = '#f3f4f6'; } }}
              onMouseLeave={e => { if (!isActive('/files')) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; } }}
            >
              <FileText size={20} aria-hidden="true" />
              <span>Files</span>
            </Link>
          </nav>
        )}

        {/* Search bar */}
        {variant === 'feed' && (
          <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: isDesktop ? '560px' : undefined, marginLeft: 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15,52,96,0.8)',
              borderRadius: '9999px',
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <Search size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: '#f3f4f6', width: '100%' }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, fontSize: '1.25rem', lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div
                className="glass-card-elevated"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 50,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {isSearching ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((post) => (
                    <button
                      key={post._id}
                      onClick={() => {
                        navigate(`/post/${post._id}`);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        color: '#f3f4f6',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#c9a96e', marginBottom: '4px' }}>
                        {post.author.displayName} @{post.author.username}
                      </div>
                      <div style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.content.substring(0, 100)}...
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
                    No posts found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right side */}
        {variant === 'feed' && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Hamburger - mobile only */}
            {!isDesktop && (
              <button
                onClick={() => setMenuOpen(true)}
                style={{ padding: '8px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Open menu"
              >
                <Menu size={20} style={{ color: '#d1d5db' }} aria-hidden="true" />
              </button>
            )}
            <MobileDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
            <NotificationBell />
            {/* Profile dropdown - desktop only */}
            {isDesktop && (
              <div ref={profileDropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: profileDropdownOpen ? 'rgba(15,52,96,0.6)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!profileDropdownOpen) e.currentTarget.style.backgroundColor = 'rgba(15,52,96,0.4)'; }}
                  onMouseLeave={e => { if (!profileDropdownOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  aria-label="Profile menu"
                  aria-expanded={profileDropdownOpen}
                >
                  <UserAvatar name={user.displayName} avatarUrl={user.avatar?.url} size="md" />
                  <span style={{ fontSize: '0.875rem', color: '#d1d5db', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</span>
                  <ChevronDown size={16} style={{ color: '#9ca3af', transition: 'transform 0.2s', transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {profileDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '200px',
                    backgroundColor: '#1e2a4a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '4px' }}>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate(`/profile/${user.username}`);
                        }}
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
                        <User size={18} />
                        <span>View Profile</span>
                      </button>
                    </div>
                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                    <div style={{ padding: '4px' }}>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '10px 12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#f87171',
                          fontSize: '0.85rem',
                          borderRadius: '8px',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0f3460', borderRadius: '50%' }} aria-hidden="true" />
        )}
      </div>
    </header>
  );
};
