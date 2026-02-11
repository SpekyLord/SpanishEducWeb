import React, { useState, useRef } from 'react';
import { Image, Video, Pin, X } from 'lucide-react';
import { createPost } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

  return (
    <div className="glass-card-elevated p-6 shadow-fb-lg">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-11 h-11 rounded-full bg-[#0f3460] flex items-center justify-center text-white font-semibold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-100">{user.displayName}</h3>
            <p className="text-sm text-gray-400">Create a new post</p>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a lesson, assignment, or announcement..."
          className="w-full min-h-[110px] p-4 rounded-lg bg-[#0f3460] text-gray-100 placeholder-gray-400 input-glow resize-none"
          disabled={isSubmitting}
        />

        <div className="text-sm text-gray-400 mt-4 mb-6">
          {content.length} / 10000 characters
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Media Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${imagePreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-fb transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {videoPreview && (
          <div className="mb-4">
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full rounded-lg max-h-96"
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-fb transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Original size: {(video!.size / (1024 * 1024)).toFixed(2)} MB
              {video!.size > 30 * 1024 * 1024 && (
                <span className="text-gold ml-2">
                  (Will be compressed to ~20-30MB)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-fb-border">
          <div className="flex items-center gap-2">
            {/* Image Upload */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fb-hover text-gray-200 hover:bg-[#1a3a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || images.length >= 5 || video !== null}
            >
              <Image size={20} className="text-green-400" />
              <span className="text-sm font-medium">Photo</span>
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Video Upload */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fb-hover text-gray-200 hover:bg-[#1a3a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || video !== null || images.length > 0}
            >
              <Video size={20} className="text-red-400" />
              <span className="text-sm font-medium">Video</span>
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {/* Pin Toggle */}
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-fb-hover cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-fb-border"
                disabled={isSubmitting}
              />
              <Pin size={16} className="text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">Pin Post</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2 btn-accent-gradient disabled:bg-fb-hover disabled:cursor-not-allowed font-medium shadow-fb"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
