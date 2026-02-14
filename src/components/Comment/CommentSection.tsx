import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Comment, getComment, getComments } from '../../services/api';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { CommentThreadProvider, useCommentThread } from '../../contexts/CommentThreadContext';
import { CommentSkeleton } from '../common/Skeleton';

interface CommentSectionProps {
  postId: string;
}

const CommentSectionContent: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedComment, setPinnedComment] = useState<Comment | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleCollapse, isCollapsed, setHighlightedCommentId } = useCommentThread();

  const loadComments = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await getComments(postId, reset ? 1 : page, 10, 'newest');
      if (response.success) {
        if (reset) {
          setComments(response.data.comments);
        } else {
          setComments((prev) => {
            const existing = new Set(prev.map((c) => c._id));
            const next = response.data.comments.filter((c) => !existing.has(c._id));
            return [...prev, ...next];
          });
        }
        setPinnedComment(response.data.pinnedComment || null);
        setHasMore(response.pagination.hasMore);
      }
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(true);
  }, [postId]);

  // Deep linking handler
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#comment-')) {
      const commentId = hash.replace('#comment-', '');
      handleDeepLink(commentId);
    }
  }, []);

  const handleDeepLink = async (commentId: string) => {
    try {
      const response = await getComment(commentId);
      if (!response.success) return;

      const comment = response.data.comment;
      const parentChain = response.data.parentChain || [];

      // Expand all parent threads
      if (comment.path) {
        const ancestorIds = comment.path.split('/').filter((id) => id);
        ancestorIds.forEach((id) => {
          if (isCollapsed(id)) {
            toggleCollapse(id);
          }
        });
      }

      // Build minimal thread chain if comment isn't in current list
      if (parentChain.length > 0) {
        const chain = [...parentChain, comment];
        const root = { ...chain[0], replies: [] as Comment[], hasMoreReplies: false };
        let current = root;
        for (let i = 1; i < chain.length; i++) {
          const node = { ...chain[i], replies: [] as Comment[], hasMoreReplies: false };
          current.replies = [node];
          current = node;
        }

        setComments((prev) => {
          const exists = prev.some((c) => c._id === root._id);
          return exists ? prev : [root, ...prev];
        });
      }

      // Scroll and highlight
      setTimeout(() => {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedCommentId(commentId);
          setTimeout(() => setHighlightedCommentId(null), 3000);
        }
      }, 150);
    } catch (error) {
      console.error('Deep link error:', error);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadComments(true);
  };

  const handleLoadMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments();
  };

  const shouldVirtualize = comments.length > 50;

  return (
    <div className="mt-4 border-t border-fb-border pt-4">
      <h4 className="text-sm font-semibold text-[#4a6a58] mb-2">Comments</h4>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      <CommentForm postId={postId} onCreated={handleRefresh} />

      {/* Initial Loading Skeletons */}
      {loading && comments.length === 0 && (
        <div className="mt-4 space-y-3">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      )}

      {pinnedComment && (
        <div className="mt-4 bg-[rgba(184,134,11,0.08)] border border-[#b8860b]/30 rounded-lg p-3">
          <CommentItem comment={pinnedComment} postId={postId} onRefresh={handleRefresh} />
        </div>
      )}

      {shouldVirtualize ? (
        <Virtuoso
          data={comments}
          style={{ height: '600px' }}
          itemContent={(_index, comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} onRefresh={handleRefresh} />
          )}
          endReached={() => {
            if (hasMore && !loading) {
              handleLoadMore();
            }
          }}
        />
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} onRefresh={handleRefresh} />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              style={{ marginTop: '16px', fontSize: '0.875rem', color: '#b8860b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#d4a017'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#b8860b'; }}
            >
              {loading ? 'Loading...' : 'Load more comments'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  return (
    <CommentThreadProvider>
      <CommentSectionContent postId={postId} />
    </CommentThreadProvider>
  );
};
