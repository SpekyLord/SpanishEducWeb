import React, { useState, useRef } from 'react';
import { Image, Video, Pin, X } from 'lucide-react';
import { createPost } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../common/UserAvatar';

interface PostComposerProps {
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (user?.role !== 'teacher') {
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      setError('Video must be less than 200MB. It will be automatically compressed to 20-30MB.');
      return;
    }

    setError(null);
    setVideo(file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    if (content.length > 10000) {
      setError('Content cannot exceed 10000 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPost({
        content,
        images,
        video: video || undefined,
        isPinned
      });

      // Reset form
      setContent('');
      setImages([]);
      setVideo(null);
      setImagePreviews([]);
      setVideoPreview(null);
      setIsPinned(false);

      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';

      onPostCreated?.();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledStyle = isSubmitting ? { opacity: 0.5, cursor: 'not-allowed' } : {};

  return (
    <div className="glass-card-elevated" style={{ padding: '1.5rem' }}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <UserAvatar name={user.displayName} avatarUrl={user.avatar?.url} size="lg" />
          <div style={{ marginLeft: '12px' }}>
            <h3 style={{ fontWeight: 600, color: '#1a3a2a', margin: 0 }}>{user.displayName}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b8a7a', margin: 0 }}>Create a new post</p>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a lesson, assignment, or announcement..."
          className="input-glow"
          style={{ width: '100%', minHeight: '110px', padding: '1rem', borderRadius: '8px', backgroundColor: '#f0f4f0', color: '#1a3a2a', resize: 'none', border: '1px solid #d4ddd8', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
          disabled={isSubmitting}
        />

        <div style={{ fontSize: '0.875rem', color: '#6b8a7a', marginTop: '1rem', marginBottom: '1.5rem' }}>
          {content.length} / 10000 characters
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Media Previews */}
        {imagePreviews.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: imagePreviews.length === 1 ? '1fr' : '1fr 1fr' }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ width: '100%', height: '192px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {videoPreview && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <video
                src={videoPreview}
                controls
                style={{ width: '100%', borderRadius: '8px', maxHeight: '384px' }}
              />
              <button
                type="button"
                onClick={removeVideo}
                style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b8a7a', marginTop: '8px' }}>
              Original size: {(video!.size / (1024 * 1024)).toFixed(2)} MB
              {video!.size > 30 * 1024 * 1024 && (
                <span style={{ color: '#b8860b', marginLeft: '8px' }}>
                  (Will be compressed to ~20-30MB)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #e8ede8', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Image Upload */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f0f4f0', color: '#1a3a2a', border: '1px solid #d4ddd8', cursor: 'pointer', transition: 'background 0.2s', ...disabledStyle }}
              disabled={isSubmitting || images.length >= 5 || video !== null}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#e8ede8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
            >
              <Image size={20} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Photo</span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            {/* Video Upload */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f0f4f0', color: '#1a3a2a', border: '1px solid #d4ddd8', cursor: 'pointer', transition: 'background 0.2s', ...disabledStyle }}
              disabled={isSubmitting || video !== null || images.length > 0}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#e8ede8'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
            >
              <Video size={20} style={{ color: '#dc2626' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Video</span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
              onChange={handleVideoSelect}
              style={{ display: 'none' }}
            />

            {/* Pin Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f4f0'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#276749', cursor: 'pointer' }}
                disabled={isSubmitting}
              />
              <Pin size={16} style={{ color: '#b8860b' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a3a2a' }}>Pin Post</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="btn-accent-gradient"
            style={{ padding: '8px 24px', fontWeight: 500, border: 'none', cursor: (isSubmitting || !content.trim()) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !content.trim()) ? 0.5 : 1, borderRadius: '8px', color: 'white', fontSize: '0.875rem' }}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
