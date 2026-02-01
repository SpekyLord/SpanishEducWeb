import React, { useState } from 'react';
import { createComment } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  onCreated?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentCommentId,
  onCreated,
  placeholder = 'Write a comment...',
  compact = false
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment({
        postId,
        content: content.trim(),
        parentComment: parentCommentId
      });

      setContent('');
      onCreated?.();
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.message || 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'mt-2' : 'mt-4'}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={compact ? 2 : 3}
            disabled={isSubmitting}
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{content.length}/2000</span>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
