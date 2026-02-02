import React, { useState, useRef, useEffect } from 'react';
import { createComment } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { MentionAutocomplete } from './MentionAutocomplete';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  parentAuthor?: string;
  onCreated?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  parentCommentId,
  parentAuthor,
  onCreated,
  onCancel,
  placeholder = 'Write a comment...',
  compact = false,
  autoFocus = false
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-fill @mention for replies
  useEffect(() => {
    if (parentAuthor && content === '') {
      setContent(`@${parentAuthor} `);
    }
  }, [parentAuthor]);

  if (!user) return null;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Detect @mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      const rect = e.target.getBoundingClientRect();
      setMentionPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, mentionMatch.index);
      const newContent = `${beforeMention}@${username} ${content.slice(cursorPos)}`;
      setContent(newContent);
      setShowMentions(false);

      setTimeout(() => {
        textareaRef.current?.focus();
        const newPos = beforeMention.length + username.length + 2;
        textareaRef.current?.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment({
        postId,
        content: content.trim(),
        parentCommentId
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
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={compact ? 2 : 3}
            disabled={isSubmitting}
            maxLength={2000}
          />
          {showMentions && (
            <MentionAutocomplete
              query={mentionQuery}
              position={mentionPosition}
              onSelect={handleMentionSelect}
              onClose={() => setShowMentions(false)}
            />
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{content.length}/2000</span>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
