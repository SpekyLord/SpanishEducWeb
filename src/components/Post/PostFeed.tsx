import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
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
      setHasMore(false);
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

  const handleRefresh = async () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);

    try {
      const response = await getPosts(1, 10);
      if (response.success) {
        setPosts(response.data.posts);
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f3f4f6', margin: 0 }}>Feed</h1>
        <button
          onClick={handleRefresh}
          aria-label="Refresh feed"
          style={{ padding: '8px', borderRadius: '50%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, border-color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <RefreshCw size={18} style={{ color: '#c9a96e' }} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-5 py-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !loading && !error && (
        <div className="glass-card-elevated p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-heading font-semibold text-gray-300 mb-2">No posts yet</h3>
          <p className="text-gray-500 text-sm">Be the first to share something with the class!</p>
        </div>
      )}

      {/* Posts */}
      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <div key={post._id} ref={lastPostRef}>
              <PostCard post={post} onUpdate={handlePostUpdate} />
            </div>
          );
        }
        return <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />;
      })}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          You've reached the end! 🎉
        </div>
      )}
    </div>
  );
};
