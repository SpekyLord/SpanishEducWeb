import React, { useState } from 'react';
import { Comment, likeComment, unlikeComment, pinComment, unpinComment, updateComment, deleteComment, getReplies } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { ThreadLine } from './ThreadLine';
import { useCommentThread } from '../../contexts/CommentThreadContext';
import { MentionText } from './MentionText';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onRefresh?: () => void;
}

export const CommentItem = React.memo<CommentItemProps>(({ comment, postId, depth = 0, onRefresh }) => {
  const { user } = useAuth();
  const { toggleCollapse, isCollapsed, highlightedCommentId } = useCommentThread();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);

  // Lazy loading state
  const [lazyReplies, setLazyReplies] = useState<Comment[]>([]);
  const [replyPage, setReplyPage] = useState(1);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(comment.hasMoreReplies || false);

  const isOwner = user?._id === comment.author._id;
  const collapsed = isCollapsed(comment._id);
  const hasReplies = comment.repliesCount > 0 || (comment.replies && comment.replies.length > 0);

  // Merge initial replies with lazy-loaded replies
  const allReplies = [...(comment.replies || []), ...lazyReplies];

  const canReply = !comment.isDeleted;
  const canEdit = (() => {
    if (!isOwner) return false;
    if (user?.role === 'teacher') return true;
    const createdAt = new Date(comment.createdAt).getTime();
    const diffMinutes = (Date.now() - createdAt) / (1000 * 60);
    return diffMinutes <= 15;
  })();

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    try {
      if (comment.isLiked) {
        await unlikeComment(comment._id);
      } else {
        await likeComment(comment._id);
      }
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment(comment._id, editContent.trim());
      setIsEditing(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handlePin = async () => {
    try {
      if (comment.isPinned) {
        await unpinComment(comment._id);
      } else {
        await pinComment(comment._id);
      }
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const loadMoreReplies = async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);

    try {
      const response = await getReplies(comment._id, replyPage + 1, 10);
      if (response.success) {
        setLazyReplies((prev) => [...prev, ...response.data.replies]);
        setReplyPage((p) => p + 1);
        setHasMoreReplies(response.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div
      id={`comment-${comment._id}`}
      className={`mt-4 relative ${depth > 0 ? 'ml-8' : ''} ${
        highlightedCommentId === comment._id ? 'bg-gold/10 border border-gold/40 rounded-lg p-2 transition-all shadow-glow-gold animate-fade-in' : ''
      }`}
    >
      <ThreadLine depth={depth} isLast={false} />
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/80 ring-1 ring-fb-border flex items-center justify-center text-white text-sm font-semibold">
          {comment.author.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-light text-sm">{comment.author.displayName}</span>
            <span className="text-xs text-light/50">@{comment.author.username}</span>
            <span className="text-xs text-light/50">· {formatDate(comment.createdAt)}</span>
            {comment.isPinned && (
              <span className="text-xs bg-gold/20 text-gold px-2 py-1 rounded font-semibold shadow-sm">
                📌 Pinned by Teacher
              </span>
            )}
          </div>

          {comment.isDeleted ? (
            <p className="text-gray-400 text-sm italic mt-1">[deleted]</p>
          ) : isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-fb-border rounded-lg text-sm bg-fb-card text-light"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-accent text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-light/60 hover:text-light/80 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-light text-sm mt-1 whitespace-pre-wrap">
              <MentionText content={comment.content} mentions={comment.mentions} />
            </p>
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`text-xs ${comment.isLiked ? 'text-gold' : 'text-light/50'} hover:text-gold`}
                disabled={isLiking}
              >
                👍 {comment.likesCount}
              </button>
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-light/50 hover:text-light/80"
                >
                  Reply
                </button>
              )}
              {canEdit && !comment.isDeleted && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-light/50 hover:text-light/80"
                >
                  Edit
                </button>
              )}
              {isOwner && !comment.isDeleted && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-accent hover:text-red-300"
                >
                  Delete
                </button>
              )}
              {user?.role === 'teacher' && !comment.isDeleted && (
                <button
                  onClick={handlePin}
                  className="text-xs text-light/50 hover:text-yellow-600"
                  title={comment.isPinned ? 'Unpin comment' : 'Pin comment'}
                >
                  {comment.isPinned ? '📌 Unpin' : '📌 Pin'}
                </button>
              )}
              {hasReplies && (
                <button
                  onClick={() => toggleCollapse(comment._id)}
                  className="text-xs text-light/50 hover:text-light/80 flex items-center gap-1"
                >
                  {collapsed ? '▶' : '▼'}{' '}
                  {collapsed ? `Show ${comment.totalRepliesCount || comment.repliesCount} replies` : 'Hide replies'}
                </button>
              )}
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}#comment-${comment._id}`;
                  navigator.clipboard.writeText(url);
                }}
                className="text-xs text-light/50 hover:text-light/80"
                title="Copy link to comment"
              >
                🔗 Share
              </button>
            </div>
          )}

          {isReplying && (
            <CommentForm
              postId={postId}
              parentCommentId={comment._id}
              parentAuthor={comment.author.username}
              onCreated={() => {
                setIsReplying(false);
                onRefresh?.();
              }}
              onCancel={() => setIsReplying(false)}
              placeholder={`Reply to @${comment.author.username}...`}
              autoFocus
              compact
            />
          )}

          {!collapsed && allReplies.length > 0 && (
            <div className="mt-2">
              {allReplies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  onRefresh={onRefresh}
                />
              ))}
              {(hasMoreReplies || comment.hasMoreReplies) && (
                <button
                  onClick={loadMoreReplies}
                  disabled={loadingReplies}
                  className="text-xs text-gold hover:text-[#d4b87e] font-medium mt-2 disabled:text-light/50"
                >
                  {loadingReplies ? 'Loading...' : `Load ${comment.repliesCount - allReplies.length} more replies`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.comment._id === nextProps.comment._id &&
         prevProps.comment.content === nextProps.comment.content &&
         prevProps.comment.likesCount === nextProps.comment.likesCount &&
         prevProps.comment.isLiked === nextProps.comment.isLiked &&
         prevProps.comment.repliesCount === nextProps.comment.repliesCount &&
         prevProps.comment.isPinned === nextProps.comment.isPinned &&
         prevProps.comment.isDeleted === nextProps.comment.isDeleted;
});
