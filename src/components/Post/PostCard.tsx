import React, { useEffect, useState } from 'react';
import { ThumbsUp, MessageCircle, Bookmark, BookmarkCheck, Pin } from 'lucide-react';
import { Post, addReaction, removeReaction, bookmarkPost, removeBookmark } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CommentSection } from '../Comment/CommentSection';

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'question', emoji: '❓', label: 'Question' }
] as const;

export const PostCard = React.memo<PostCardProps>(({ post, onUpdate }) => {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
    <div className="glass-card-elevated hover-lift p-6 mb-4 shadow-fb">
      {/* Author Header */}
      <div className="flex items-center mb-6">
        <div className="w-11 h-11 rounded-full bg-[#0f3460] ring-2 ring-fb-border flex items-center justify-center text-white font-semibold">
          {currentPost.author.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="ml-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-100">{currentPost.author.displayName}</h3>
            <span className="text-xs bg-[#0f3460] text-gray-300 px-2 py-1 rounded">
              {currentPost.author.role}
            </span>
            {currentPost.isPinned && (
              <span className="flex items-center gap-1 text-xs bg-gold/15 text-gold px-2 py-1 rounded">
                <Pin size={12} />
                <span>Pinned</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">@{currentPost.author.username} · {formatDate(currentPost.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-gray-100 text-base whitespace-pre-wrap leading-relaxed">{currentPost.content}</p>
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
      {currentPost.reactionsCount.total > 0 && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-fb-border">
          <div className="flex -space-x-1">
            {REACTIONS.map(({ type, emoji }) => 
              currentPost.reactionsCount[type] > 0 && (
                <span key={type} className="text-lg">
                  {emoji}
                </span>
              )
            )}
          </div>
          <span className="text-sm text-gray-300">{currentPost.reactionsCount.total}</span>
          <span className="flex-1" />
          <span className="text-sm text-gray-300">{currentPost.commentsCount} comments</span>
        </div>
      )}

      {/* Action Buttons */}
      <div role="group" aria-label="Post actions" className="flex items-center gap-2 pt-3 border-t border-fb-border/50">
        {/* Reaction Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            aria-label={currentPost.userReaction ? `Change reaction (currently ${REACTIONS.find(r => r.type === currentPost.userReaction)?.label})` : 'Add reaction'}
            aria-haspopup="true"
            aria-expanded={showReactionPicker}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg transition-all ${
              currentPost.userReaction
                ? 'bg-fb-hover text-gold'
                : 'hover:bg-fb-hover text-gray-300'
            }`}
            disabled={isReacting}
          >
            {currentPost.userReaction ? (
              <>
                <span className="text-lg">
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.emoji}
                </span>
                <span className="text-sm font-medium">
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.label}
                </span>
              </>
            ) : (
              <>
                <ThumbsUp size={18} />
                <span className="text-sm font-medium">Like</span>
              </>
            )}
          </button>

          {/* Reaction Picker */}
          {showReactionPicker && (
            <div role="menu" aria-label="Choose reaction" className="absolute bottom-full left-0 mb-2 glass-card-elevated shadow-fb-xl animate-scale-in p-2 flex gap-1 z-10">
              {REACTIONS.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  role="menuitem"
                  onClick={() => handleReaction(type)}
                  aria-label={`React with ${label}`}
                  className="p-2 hover:bg-fb-hover rounded-lg transition-colors transform hover:scale-125 active:scale-100"
                  title={label}
                >
                  <span className="text-2xl" aria-hidden="true">{emoji}</span>
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
          className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg transition-all ${
            showComments ? 'bg-fb-hover text-gold' : 'hover:bg-fb-hover text-gray-300'
          }`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span className="text-sm font-medium">Comment</span>
        </button>

        {/* Bookmark Button */}
        {user && (
          <button
            onClick={handleBookmark}
            aria-label={currentPost.isBookmarked ? 'Remove bookmark' : 'Save post'}
            aria-pressed={currentPost.isBookmarked}
            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-lg transition-all ${
              currentPost.isBookmarked
                ? 'bg-fb-hover text-yellow-400'
                : 'hover:bg-fb-hover text-gray-300'
            }`}
            disabled={isBookmarking}
          >
            {currentPost.isBookmarked ? (
              <BookmarkCheck size={18} aria-hidden="true" />
            ) : (
              <Bookmark size={18} aria-hidden="true" />
            )}
            <span className="text-sm font-medium">
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
