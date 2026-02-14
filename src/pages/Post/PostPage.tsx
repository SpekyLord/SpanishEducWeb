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
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7f5', color: '#1a3a2a' }}>
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
            background: '#f0f4f0',
            border: '1px solid #d4ddd8',
            borderRadius: '8px',
            color: '#b8860b',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Feed
        </button>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b8a7a' }}>
            Loading post...
          </div>
        )}

        {error && (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => navigate('/feed')}
              style={{
                padding: '8px 24px',
                background: '#b8860b',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
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
