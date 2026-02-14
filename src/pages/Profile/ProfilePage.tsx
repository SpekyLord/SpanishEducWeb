import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Edit3, Check, X, Loader2, Calendar, MessageSquare, ThumbsUp, Download, Camera, Trash2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { UserAvatar } from '../../components/common/UserAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateProfile, uploadAvatar, deleteAvatar, Post } from '../../services/api';

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
  const { user: currentUser, updateUser } = useAuth();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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
          username: profileUser.username,
          displayName: profileUser.displayName,
          avatarUrl: profileUser.avatar?.url,
        }
      }
    });
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    // Client-side size check
    const maxSize = currentUser?.role === 'teacher' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const limitMB = maxSize / (1024 * 1024);
      setAvatarError(`File too large. Maximum size is ${limitMB}MB`);
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError(null);
      const response = await uploadAvatar(file);
      const newAvatar = response.data.user.avatar;
      setProfileUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
      updateUser({ avatar: newAvatar });
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setAvatarUploading(true);
      setAvatarError(null);
      await deleteAvatar();
      const nullAvatar = { url: null, publicId: null };
      setProfileUser(prev => prev ? { ...prev, avatar: nullAvatar } : null);
      updateUser({ avatar: nullAvatar });
    } catch (err: any) {
      console.error('Avatar delete failed:', err);
      setAvatarError(err.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setAvatarUploading(false);
    }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7f5', color: '#1a3a2a' }}>
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
            color: '#6b8a7a',
            fontSize: '0.875rem',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} style={{ color: '#b8860b', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div className="glass-card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button
              onClick={loadProfile}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#f0f4f0',
                color: '#1a3a2a',
                border: '1px solid #d4ddd8',
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
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    onClick={handleAvatarClick}
                    style={{
                      position: 'relative',
                      cursor: isOwnProfile ? 'pointer' : 'default',
                      borderRadius: '50%',
                      overflow: 'hidden',
                    }}
                  >
                    <UserAvatar
                      name={profileUser.displayName}
                      avatarUrl={profileUser.avatar?.url}
                      size="xl"
                      className="ring-2 ring-fb-border"
                    />
                    {isOwnProfile && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: avatarUploading ? 1 : 0,
                        transition: 'opacity 0.2s',
                        borderRadius: '50%',
                      }}
                        onMouseEnter={e => { if (!avatarUploading) e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.opacity = '0'; }}
                      >
                        {avatarUploading ? (
                          <Loader2 size={20} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Camera size={20} style={{ color: 'white' }} />
                        )}
                      </div>
                    )}
                  </div>
                  {isOwnProfile && profileUser.avatar?.url && !avatarUploading && (
                    <button
                      onClick={handleDeleteAvatar}
                      title="Remove photo"
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '2px solid #d4ddd8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <Trash2 size={12} style={{ color: '#dc2626' }} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
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
                          backgroundColor: '#f0f4f0',
                          border: '1px solid #d4ddd8',
                          borderRadius: '8px',
                          color: '#1a3a2a',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          outline: 'none',
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1a3a2a' }}>
                        {profileUser.displayName}
                      </h1>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: profileUser.role === 'teacher' ? 'rgba(184,134,11,0.12)' : '#e0f0e5',
                        color: profileUser.role === 'teacher' ? '#b8860b' : '#276749',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}>
                        {profileUser.role}
                      </span>
                    </div>
                  )}
                  <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6b8a7a' }}>
                    @{profileUser.username}
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#6b8a7a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Joined {formatDate(profileUser.createdAt)}
                  </p>
                </div>
              </div>

              {/* Avatar error */}
              {avatarError && (
                <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626' }}>{avatarError}</p>
                </div>
              )}

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
                        backgroundColor: '#f0f4f0',
                        border: '1px solid #d4ddd8',
                        borderRadius: '8px',
                        color: '#1a3a2a',
                        fontSize: '0.875rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b8a7a', textAlign: 'right' }}>
                      {editBio.length}/500
                    </p>
                  </div>
                ) : (
                  profileUser.bio ? (
                    <p style={{ margin: 0, color: '#4a6a58', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {profileUser.bio}
                    </p>
                  ) : isOwnProfile ? (
                    <p style={{ margin: 0, color: '#6b8a7a', fontSize: '0.875rem', fontStyle: 'italic' }}>
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
                      backgroundColor: '#f0f4f0',
                      color: '#276749',
                      border: '1px solid #d4ddd8',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
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
                        backgroundColor: '#b8860b',
                        color: '#ffffff',
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
                        color: '#6b8a7a',
                        border: '1px solid #d4ddd8',
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
                      backgroundColor: '#f0f4f0',
                      color: '#276749',
                      border: '1px solid #d4ddd8',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
                  >
                    <MessageCircle size={16} />
                    Send Message
                  </button>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="glass-card-elevated" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: '#1a3a2a' }}>
                Activity
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f4f0', borderRadius: '10px' }}>
                  <MessageSquare size={20} style={{ color: '#b8860b', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a3a2a' }}>
                    {profileUser.stats.commentsCount}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b8a7a' }}>Comments</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f4f0', borderRadius: '10px' }}>
                  <ThumbsUp size={20} style={{ color: '#b8860b', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a3a2a' }}>
                    {profileUser.stats.likesGiven}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b8a7a' }}>Likes Given</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f4f0', borderRadius: '10px' }}>
                  <Download size={20} style={{ color: '#b8860b', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a3a2a' }}>
                    {profileUser.stats.downloadsCount}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b8a7a' }}>Downloads</p>
                </div>
              </div>
            </div>

            {/* Recent Posts - Teacher only */}
            {profileUser.role === 'teacher' && recentPosts.length > 0 && (
              <div className="glass-card-elevated" style={{ padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: '#1a3a2a' }}>
                  Recent Posts
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentPosts.map(post => (
                    <div
                      key={post._id}
                      onClick={() => navigate(`/feed#post-${post._id}`)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f0f4f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e8ede8'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
                    >
                      <p style={{
                        margin: 0,
                        color: '#1a3a2a',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {post.content}
                      </p>
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#6b8a7a' }}>
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
