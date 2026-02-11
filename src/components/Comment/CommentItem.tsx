import React, { useState } from 'react';
import { Comment, likeComment, unlikeComment, pinComment, unpinComment, updateComment, deleteComment, getReplies } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CommentForm } from './CommentForm';
import { ThreadLine } from './ThreadLine';
import { useCommentThread } from '../../contexts/CommentThreadContext';
import { MentionText } from './MentionText';
import { UserAvatar } from '../common/UserAvatar';

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
      <div style={{ display: 'flex', gap: '12px' }}>
        <UserAvatar name={comment.author.displayName} avatarUrl={comment.author.avatarUrl} size="sm" className="ring-1 ring-fb-border" />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#f0e6d3', fontSize: '0.875rem' }}>{comment.author.displayName}</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#0f3460', color: '#d1d5db', padding: '2px 6px', borderRadius: '4px' }}>
              {comment.author.role}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)' }}>@{comment.author.username}</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)' }}>· {formatDate(comment.createdAt)}</span>
            {comment.isPinned && (
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(201,169,110,0.2)', color: '#c9a96e', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleLike}
                style={{ fontSize: '0.75rem', color: comment.isLiked ? '#c9a96e' : 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                disabled={isLiking}
              >
                👍 {comment.likesCount}
              </button>
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                >
                  Reply
                </button>
              )}
              {canEdit && !comment.isDeleted && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                >
                  Edit
                </button>
              )}
              {isOwner && !comment.isDeleted && (
                <button
                  onClick={handleDelete}
                  style={{ fontSize: '0.75rem', color: '#e94560', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                >
                  Delete
                </button>
              )}
              {user?.role === 'teacher' && !comment.isDeleted && (
                <button
                  onClick={handlePin}
                  style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                  title={comment.isPinned ? 'Unpin comment' : 'Pin comment'}
                >
                  {comment.isPinned ? '📌 Unpin' : '📌 Pin'}
                </button>
              )}
              {hasReplies && (
                <button
                  onClick={() => toggleCollapse(comment._id)}
                  style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}
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
                style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
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
