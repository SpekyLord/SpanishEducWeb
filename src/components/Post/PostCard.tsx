import React, { useEffect, useState } from 'react';
import { ThumbsUp, MessageCircle, Bookmark, BookmarkCheck, Pin } from 'lucide-react';
import { Post, addReaction, removeReaction, bookmarkPost, removeBookmark } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CommentSection } from '../Comment/CommentSection';
import { UserAvatar } from '../common/UserAvatar';
import { UserPopover } from '../common/UserPopover';
import { ReactionsPanel } from './ReactionsPanel';

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
  showCommentsInitially?: boolean;
}

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'question', emoji: '❓', label: 'Question' }
] as const;

export const PostCard = React.memo<PostCardProps>(({ post, onUpdate, showCommentsInitially = false }) => {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showComments, setShowComments] = useState(showCommentsInitially);
  const [showReactionsPanel, setShowReactionsPanel] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState<{ top: number; left: number; bottom: number } | null>(null);

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const handleReaction = async (type: typeof REACTIONS[number]['type']) => {
    if (!user || isReacting) return;
    
    setIsReacting(true);
    setShowReactionPicker(false);
    
    try {
      if (currentPost.userReaction === type) {
        // Remove reaction if clicking the same one
        await removeReaction(currentPost._id);
        const updated = { ...currentPost, userReaction: null };
        setCurrentPost(updated);
        onUpdate?.(updated);
      } else {
        // Add new reaction
        const response = await addReaction(currentPost._id, type);
        const updated = {
          ...currentPost,
          userReaction: type,
          reactionsCount: response.data.reactionsCount
        };
        setCurrentPost(updated);
        onUpdate?.(updated);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    } finally {
      setIsReacting(false);
    }
  };

  const handleBookmark = async () => {
    if (!user || isBookmarking) return;
    
    setIsBookmarking(true);
    
    try {
      if (currentPost.isBookmarked) {
        await removeBookmark(currentPost._id);
        const updated = { ...currentPost, isBookmarked: false };
        setCurrentPost(updated);
        onUpdate?.(updated);
      } else {
        await bookmarkPost(currentPost._id);
        const updated = { ...currentPost, isBookmarked: true };
        setCurrentPost(updated);
        onUpdate?.(updated);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return postDate.toLocaleDateString();
  };

  return (
    <div className="glass-card-elevated hover-lift shadow-fb" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Author Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setPopoverAnchor({ top: rect.top, left: rect.left, bottom: rect.bottom });
            }}
            style={{ cursor: 'pointer', display: 'flex' }}
          >
            <UserAvatar name={currentPost.author.displayName} avatarUrl={currentPost.author.avatarUrl} size="lg" className="ring-2 ring-fb-border" />
          </div>
          <div style={{ marginLeft: '1.25rem' }}>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setPopoverAnchor({ top: rect.top, left: rect.left, bottom: rect.bottom });
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', cursor: 'pointer' }}
            >
              <h3 style={{ fontWeight: 600, color: '#1a3a2a', margin: 0 }}>{currentPost.author.displayName}</h3>
              <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f0e5', color: '#276749', padding: '2px 8px', borderRadius: '4px' }}>
                {currentPost.author.role}
              </span>
              {currentPost.isPinned && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: 'rgba(184,134,11,0.12)', color: '#b8860b', padding: '2px 8px', borderRadius: '4px' }}>
                  <Pin size={12} />
                  <span>Pinned</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b8a7a', marginTop: '8px' }}>@{currentPost.author.username} · {formatDate(currentPost.createdAt)}</p>
          </div>
        </div>
      </div>

      {popoverAnchor && (
        <UserPopover
          user={{
            _id: currentPost.author._id,
            username: currentPost.author.username,
            displayName: currentPost.author.displayName,
            avatarUrl: currentPost.author.avatarUrl,
            role: currentPost.author.role,
          }}
          anchorRect={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
        />
      )}

      {/* Content */}
      <div className="mb-6">
        <p className="text-[#1a3a2a] text-base whitespace-pre-wrap leading-relaxed">{currentPost.content}</p>
      </div>

      {/* Media */}
      {currentPost.media && currentPost.media.length > 0 && (
        <div className="mb-6">
          {currentPost.media[0].type === 'video' ? (
            <video
              controls
              preload="metadata"
              className="w-full rounded-lg max-h-96"
              poster={currentPost.media[0].thumbnailUrl}
            >
              <source src={currentPost.media[0].url} type={currentPost.media[0].mimeType} />
            </video>
          ) : (
            <div className={`grid gap-2 ${currentPost.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {currentPost.media.map((item, index) => (
                <img
                  key={index}
                  src={item.url}
                  alt={`Post media ${index + 1}`}
                  loading="lazy"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reactions Summary */}
      {currentPost.reactionsCount.total > 0 && (() => {
        const topReaction = REACTIONS.reduce<typeof REACTIONS[number] | null>((top, r) =>
          currentPost.reactionsCount[r.type] > (top ? currentPost.reactionsCount[top.type] : 0) ? r : top,
          null
        );
        return (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e8ede8' }}>
            <button
              onClick={() => setShowReactionsPanel(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '16px', color: '#4a6a58', fontSize: '0.875rem', transition: 'background 0.2s' }}
            >
              {topReaction && <span style={{ fontSize: '1.125rem' }}>{topReaction.emoji}</span>}
              <span>{currentPost.reactionsCount.total}</span>
            </button>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: '0.875rem', color: '#6b8a7a' }}>{currentPost.commentsCount} comments</span>
          </div>
        );
      })()}
      {showReactionsPanel && (
        <ReactionsPanel 
          postId={currentPost._id} 
          onClose={() => setShowReactionsPanel(false)} 
        />
      )}

      {/* Action Buttons */}
      <div role="group" aria-label="Post actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid #e8ede8' }}>
        {/* Reaction Button */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            aria-label={currentPost.userReaction ? `Change reaction (currently ${REACTIONS.find(r => r.type === currentPost.userReaction)?.label})` : 'Add reaction'}
            aria-haspopup="true"
            aria-expanded={showReactionPicker}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentPost.userReaction ? '#e0f0e5' : 'transparent', color: currentPost.userReaction ? '#276749' : '#4a6a58', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            disabled={isReacting}
          >
            {currentPost.userReaction ? (
              <>
                <span style={{ fontSize: '1.125rem' }}>
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.emoji}
                </span>
                <span className="hide-on-mobile">
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.label}
                </span>
              </>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span className="hide-on-mobile">Like</span>
              </>
            )}
          </button>

          {/* Reaction Picker */}
          {showReactionPicker && (
            <div role="menu" aria-label="Choose reaction" className="glass-card-elevated" style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px', padding: '8px', display: 'flex', gap: '4px', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.12)' }}>
              {REACTIONS.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  role="menuitem"
                  onClick={() => handleReaction(type)}
                  aria-label={`React with ${label}`}
                  style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.15s, background 0.15s' }}
                  title={label}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          aria-label={showComments ? 'Hide comments' : `Show comments (${currentPost.commentsCount})`}
          aria-pressed={showComments}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '8px 12px', borderRadius: '8px', border: 'none', background: showComments ? '#e0f0e5' : 'transparent', color: showComments ? '#276749' : '#4a6a58', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span className="hide-on-mobile">Comment</span>
        </button>

        {/* Bookmark Button */}
        {user && (
          <button
            onClick={handleBookmark}
            aria-label={currentPost.isBookmarked ? 'Remove bookmark' : 'Save post'}
            aria-pressed={currentPost.isBookmarked}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', padding: '8px 12px', borderRadius: '8px', border: 'none', background: currentPost.isBookmarked ? 'rgba(184,134,11,0.12)' : 'transparent', color: currentPost.isBookmarked ? '#b8860b' : '#4a6a58', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
            disabled={isBookmarking}
          >
            {currentPost.isBookmarked ? (
              <BookmarkCheck size={18} aria-hidden="true" />
            ) : (
              <Bookmark size={18} aria-hidden="true" />
            )}
            <span className="hide-on-mobile">
              {currentPost.isBookmarked ? 'Saved' : 'Save'}
            </span>
          </button>
        )}
      </div>

      {showComments && (
        <CommentSection postId={currentPost._id} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.post._id === nextProps.post._id &&
         prevProps.post.updatedAt === nextProps.post.updatedAt &&
         prevProps.post.reactionsCount.total === nextProps.post.reactionsCount.total &&
         prevProps.post.commentsCount === nextProps.post.commentsCount &&
         prevProps.post.isBookmarked === nextProps.post.isBookmarked &&
         prevProps.post.userReaction === nextProps.post.userReaction;
});
