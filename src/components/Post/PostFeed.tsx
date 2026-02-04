import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, getPosts } from '../../services/api';
import { PostCard } from './PostCard';
import { PostSkeleton } from '../common/Skeleton';

export const PostFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockPosts: Post[] = [
    {
      _id: 'mock-1',
      author: {
        _id: 'u1',
        username: 'profesora',
        displayName: 'Profesora María',
        avatarUrl: 'https://placehold.co/80x80',
        role: 'teacher'
      },
      content: 'Lesson 5: Ser vs Estar — quick guide and practice prompts for today’s session.',
      media: [
        {
          type: 'image',
          url: 'https://placehold.co/800x450',
          publicId: 'mock-1',
          mimeType: 'image/png',
          width: 800,
          height: 450
        }
      ],
      reactionsCount: { like: 12, love: 6, celebrate: 3, insightful: 9, question: 1, total: 31 },
      userReaction: null,
      commentsCount: 18,
      bookmarksCount: 5,
      isBookmarked: false,
      isPinned: true,
      pinnedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date().toISOString(),
      contentHtml: ''
    },
    {
      _id: 'mock-2',
      author: {
        _id: 'u2',
        username: 'carlosmendez',
        displayName: 'Carlos Mendez',
        avatarUrl: 'https://placehold.co/80x80',
        role: 'student'
      },
      content: 'Question: When should I use “estoy” vs “soy” for temporary states? Examples appreciated! 😊',
      media: [],
      reactionsCount: { like: 4, love: 0, celebrate: 1, insightful: 2, question: 2, total: 9 },
      userReaction: null,
      commentsCount: 6,
      bookmarksCount: 1,
      isBookmarked: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      updatedAt: new Date().toISOString(),
      contentHtml: ''
    },
    {
      _id: 'mock-3',
      author: {
        _id: 'u1',
        username: 'profesora',
        displayName: 'Profesora María',
        avatarUrl: 'https://placehold.co/80x80',
        role: 'teacher'
      },
      content: 'Vocabulary List Week 3 — Colors PDF attached. Please review before Friday.',
      media: [
        {
          type: 'image',
          url: 'https://placehold.co/800x520',
          publicId: 'mock-3',
          mimeType: 'image/png',
          width: 800,
          height: 520
        }
      ],
      reactionsCount: { like: 8, love: 2, celebrate: 4, insightful: 1, question: 0, total: 15 },
      userReaction: null,
      commentsCount: 3,
      bookmarksCount: 7,
      isBookmarked: false,
      isPinned: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      contentHtml: ''
    }
  ];
  
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
    if (loading || !hasMore || usingMock) return;
    
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
        if (response.data.posts.length > 0) {
          setUsingMock(false);
        }
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
      setUsingMock(true);
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

  const handleRefresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setUsingMock(false);
  };

  const displayPosts = (posts.length === 0 || usingMock) ? mockPosts : posts;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#3a3b3c]">
        <h1 className="text-2xl font-bold text-gray-100">Feed</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#3a3b3c] text-gray-200 rounded-lg hover:bg-[#4e4f50] transition-colors text-sm font-medium"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-5 py-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Initial Loading Skeletons */}
      {loading && posts.length === 0 && !usingMock && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* Posts */}
      {displayPosts.map((post, index) => {
        if (!usingMock && index === displayPosts.length - 1) {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
