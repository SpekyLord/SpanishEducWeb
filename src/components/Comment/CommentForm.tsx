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
        <div className="bg-red-900/20 border border-red-700/50 text-red-300 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', backgroundColor: '#e94560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 600 }}>
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="input-glow"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', resize: 'none', backgroundColor: '#16213e', color: '#f0e6d3', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,230,211,0.5)' }}>{content.length}/2000</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  style={{ padding: '4px 12px', fontSize: '0.875rem', color: 'rgba(240,230,211,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="btn-accent-gradient"
                style={{ padding: '6px 16px', fontSize: '0.875rem', border: 'none', cursor: (isSubmitting || !content.trim()) ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
