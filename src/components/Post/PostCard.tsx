import React, { useEffect, useState } from 'react';
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

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
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
    <div className="bg-[#242526] rounded-lg border border-[#3a3b3c] p-6 mb-8">
      {/* Author Header */}
      <div className="flex items-center mb-6">
        <div className="w-11 h-11 rounded-full bg-[#3a3b3c] flex items-center justify-center text-white font-semibold">
          {currentPost.author.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="ml-5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-100">{currentPost.author.displayName}</h3>
            <span className="text-xs bg-[#3a3b3c] text-gray-300 px-2 py-1 rounded">
              {currentPost.author.role}
            </span>
            {currentPost.isPinned && (
              <span className="text-xs bg-[#3a3b3c] text-yellow-300 px-2 py-1 rounded">
                📌 Pinned
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
                  className="w-full rounded-lg object-cover max-h-96"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reactions Summary */}
      {currentPost.reactionsCount.total > 0 && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#3a3b3c]">
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
      <div className="flex items-center gap-4 pt-3 border-t border-[#3a3b3c]/50">
        {/* Reaction Button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPost.userReaction
                ? 'bg-[#3a3b3c] text-blue-300'
                : 'hover:bg-[#3a3b3c] text-gray-200'
            }`}
            disabled={isReacting}
          >
            {currentPost.userReaction ? (
              <>
                <span className="text-xl">
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.emoji}
                </span>
                <span className="text-sm font-medium">
                  {REACTIONS.find(r => r.type === currentPost.userReaction)?.label}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl">👍</span>
                <span className="text-sm font-medium">React</span>
              </>
            )}
          </button>

          {/* Reaction Picker */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#242526] border border-[#3a3b3c] shadow-lg rounded-lg p-2 flex gap-1 z-10">
              {REACTIONS.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className="p-2 hover:bg-[#3a3b3c] rounded-lg transition-colors"
                  title={label}
                >
                  <span className="text-2xl">{emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showComments ? 'bg-[#3a3b3c] text-gray-200' : 'hover:bg-[#3a3b3c] text-gray-200'
          }`}
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-medium">Comment</span>
        </button>

        {/* Bookmark Button */}
        {user && (
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentPost.isBookmarked
                ? 'bg-[#3a3b3c] text-yellow-300'
                : 'hover:bg-[#3a3b3c] text-gray-200'
            }`}
            disabled={isBookmarking}
          >
            <span className="text-xl">{currentPost.isBookmarked ? '🔖' : '📑'}</span>
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
};
