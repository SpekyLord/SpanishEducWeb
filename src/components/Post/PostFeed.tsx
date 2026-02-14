import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, getPosts } from '../../services/api';
import { PostCard } from './PostCard';
import { PostSkeleton } from '../common/Skeleton';

export const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadPosts = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPosts(page, 10);
      
      if (response.success) {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newPosts = response.data.posts.filter(p => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  if (initialLoad && loading) {
    return (
      <div className="space-y-4">{[...Array(3)].map((_, i) => (<PostSkeleton key={i} />))}</div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg text-sm">
          {error}
        </div>
      )}
      {posts.map((post, index) => {
        const isLastPost = index === posts.length - 1;
        return <div key={post._id} ref={isLastPost ? lastPostRef : null}><PostCard post={post} /></div>;
      })}
      {loading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b8860b]"></div>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-[#6b8a7a] text-sm">
          You've reached the end
        </div>
      )}
    </div>
  );
};
