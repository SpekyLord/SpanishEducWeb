import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components';
import { PostCard } from '../../components/Post/PostCard';
import { getPost, type Post } from '../../services/api';

export const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const result = await getPost(id);
        setPost(result.data.post);
      } catch (err) {
        console.error('Failed to load post:', err);
        setError('Post not found or has been deleted');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#f3f4f6' }}>
      <Header variant="feed" />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        <button
          onClick={() => navigate('/feed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '8px 16px',
            background: 'rgba(15,52,96,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#c9a96e',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Feed
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
            Loading post...
          </div>
        )}

        {error && (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => navigate('/feed')}
              style={{
                padding: '8px 24px',
                background: '#c9a96e',
                border: 'none',
                borderRadius: '8px',
                color: '#1a1a2e',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to Feed
            </button>
          </div>
        )}

        {post && !loading && !error && (
          <PostCard post={post} showCommentsInitially={true} />
        )}
      </main>
    </div>
  );
};
