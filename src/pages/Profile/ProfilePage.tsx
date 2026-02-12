import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Edit3, Check, X, Loader2, Calendar, MessageSquare, ThumbsUp, Download } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateProfile, Post } from '../../services/api';

interface ProfileUser {
  _id: string;
  displayName: string;
  username: string;
  role: 'teacher' | 'student';
  avatar: { url: string | null; publicId: string | null };
  bio: string;
  stats: {
    commentsCount: number;
    likesGiven: number;
    downloadsCount: number;
    postsCount: number;
  };
  createdAt: string;
}

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserProfile(username!);
      setProfileUser(response.data.user);
      setRecentPosts(response.data.recentPosts || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!profileUser) return;
    setEditDisplayName(profileUser.displayName);
    setEditBio(profileUser.bio || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!profileUser) return;
    try {
      setSaving(true);
      const response = await updateProfile({
        displayName: editDisplayName,
        bio: editBio,
      });
      setProfileUser(prev => prev ? { ...prev, ...response.data.user } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = () => {
    if (!profileUser) return;
    navigate('/messages', {
      state: {
        userId: profileUser._id,
        otherUser: {
          _id: profileUser._id,
          displayName: profileUser.displayName,
          avatarUrl: profileUser.avatar?.url,
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#f3f4f6' }}>
      <Header variant="feed" />

      <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            marginBottom: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} style={{ color: '#c9a96e', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div className="glass-card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#f87171' }}>{error}</p>
            <button
              onClick={loadProfile}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#0f3460',
                color: '#d1d5db',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Try again
            </button>
          </div>
        ) : profileUser ? (
          <>
            {/* Profile Card */}
            <div className="glass-card-elevated" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              {/* Avatar + Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <UserAvatar
                  name={profileUser.displayName}
                  avatarUrl={profileUser.avatar?.url}
                  size="xl"
                  className="ring-2 ring-fb-border"
                />
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={e => setEditDisplayName(e.target.value)}
                        maxLength={50}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(15,52,96,0.5)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          color: '#f3f4f6',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          outline: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f0e6d3' }}>
                        {profileUser.displayName}
                      </h1>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: profileUser.role === 'teacher' ? 'rgba(201,169,110,0.15)' : '#0f3460',
                        color: profileUser.role === 'teacher' ? '#c9a96e' : '#d1d5db',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}>
                        {profileUser.role}
                      </span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#9ca3af' }}>
                    @{profileUser.username}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Joined {formatDate(profileUser.createdAt)}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div style={{ marginTop: '20px' }}>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      maxLength={500}
                      placeholder="Write a short bio..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'rgba(15,52,96,0.5)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#f3f4f6',
                        fontSize: '0.875rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
                      {editBio.length}/500
                    </p>
                  </div>
                ) : (
                  profileUser.bio ? (
                    <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {profileUser.bio}
                    </p>
                  ) : isOwnProfile ? (
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      No bio yet. Click "Edit Profile" to add one.
                    </p>
                  ) : null
                )}
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                {isOwnProfile && !isEditing && (
                  <button
                    onClick={handleStartEdit}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#0f3460',
                      color: '#d1d5db',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a3a6e'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0f3460'; }}
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#c9a96e',
                        color: '#1a1a2e',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#9ca3af',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                )}
                {!isOwnProfile && (
                  <button
                    onClick={handleSendMessage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#0f3460',
                      color: '#d1d5db',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a3a6e'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0f3460'; }}
                  >
                    <MessageCircle size={16} />
                    Send Message
                  </button>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="glass-card-elevated" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: '#f0e6d3' }}>
                Activity
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(15,52,96,0.4)', borderRadius: '10px' }}>
                  <MessageSquare size={20} style={{ color: '#c9a96e', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0e6d3' }}>
                    {profileUser.stats.commentsCount}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Comments</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(15,52,96,0.4)', borderRadius: '10px' }}>
                  <ThumbsUp size={20} style={{ color: '#c9a96e', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0e6d3' }}>
                    {profileUser.stats.likesGiven}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Likes Given</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(15,52,96,0.4)', borderRadius: '10px' }}>
                  <Download size={20} style={{ color: '#c9a96e', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0e6d3' }}>
                    {profileUser.stats.downloadsCount}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Downloads</p>
                </div>
              </div>
            </div>

            {/* Recent Posts - Teacher only */}
            {profileUser.role === 'teacher' && recentPosts.length > 0 && (
              <div className="glass-card-elevated" style={{ padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: '#f0e6d3' }}>
                  Recent Posts
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentPosts.map(post => (
                    <div
                      key={post._id}
                      onClick={() => navigate(`/feed#post-${post._id}`)}
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(15,52,96,0.3)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(15,52,96,0.5)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(15,52,96,0.3)'; }}
                    >
                      <p style={{
                        margin: 0,
                        color: '#d1d5db',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {post.content}
                      </p>
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#6b7280' }}>
                        <span>{formatPostDate(post.createdAt)}</span>
                        {post.media && post.media.length > 0 && (
                          <span>{post.media.length} attachment{post.media.length > 1 ? 's' : ''}</span>
                        )}
                        <span>{post.commentsCount} comment{post.commentsCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};
