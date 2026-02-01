import React, { useState } from 'react';
import { Comment, likeComment, unlikeComment, updateComment, deleteComment } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
  onRefresh?: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, depth = 0, onRefresh }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = user?._id === comment.author._id;
  const canReply = depth < 2;
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
    <div className={`mt-4 ${depth > 0 ? 'ml-8 border-l border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          {comment.author.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{comment.author.displayName}</span>
            <span className="text-xs text-gray-500">@{comment.author.username}</span>
            <span className="text-xs text-gray-400">· {formatDate(comment.createdAt)}</span>
            {comment.isPinned && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">📌 Pinned</span>
            )}
          </div>

          {comment.isDeleted ? (
            <p className="text-gray-400 text-sm italic mt-1">[deleted]</p>
          ) : isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLike}
                className={`text-xs ${comment.isLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
                disabled={isLiking}
              >
                👍 {comment.likesCount}
              </button>
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reply
                </button>
              )}
              {canEdit && !comment.isDeleted && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Edit
                </button>
              )}
              {isOwner && !comment.isDeleted && (
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {isReplying && (
            <CommentForm
              postId={postId}
              parentCommentId={comment._id}
              onCreated={() => {
                setIsReplying(false);
                onRefresh?.();
              }}
              placeholder="Write a reply..."
              compact
            />
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  onRefresh={onRefresh}
                />
              ))}
              {comment.hasMoreReplies && (
                <div className="text-xs text-gray-500 mt-2">View more replies</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
