import React, { useEffect, useState } from 'react';
import { Comment, getComments } from '../../services/api';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  postId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pinnedComment, setPinnedComment] = useState<Comment | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Comments</h4>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      <CommentForm postId={postId} onCreated={handleRefresh} />

      {pinnedComment && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <CommentItem comment={pinnedComment} postId={postId} onRefresh={handleRefresh} />
        </div>
      )}

      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} postId={postId} onRefresh={handleRefresh} />
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          {loading ? 'Loading...' : 'Load more comments'}
        </button>
      )}
    </div>
  );
};
