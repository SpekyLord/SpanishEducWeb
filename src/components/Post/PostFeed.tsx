import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, getPosts } from '../../services/api';
import { PostCard } from './PostCard';

export const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No posts yet</p>
          <p className="text-gray-400 text-sm">Check back later for new content</p>
        </div>
      ) : (
        <>
          {posts.map((post, index) => {
            if (index === posts.length - 1) {
              return (
                <div key={post._id} ref={lastPostRef}>
                  <PostCard post={post} onUpdate={handlePostUpdate} />
                </div>
              );
            } else {
              return <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />;
            }
          })}
        </>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end! 🎉
        </div>
      )}
    </div>
  );
};
