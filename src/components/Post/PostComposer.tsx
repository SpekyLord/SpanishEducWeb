import React, { useState, useRef } from 'react';
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
            <p className="text-sm text-gray-500">Create a new post</p>
          </div>
        </div>

        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share a lesson, assignment, or announcement..."
          className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isSubmitting}
        />

        <div className="text-sm text-gray-500 mt-2 mb-4">
          {content.length} / 10000 characters
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
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
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
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
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Original size: {(video!.size / (1024 * 1024)).toFixed(2)} MB
              {video!.size > 30 * 1024 * 1024 && (
                <span className="text-blue-600 ml-2">
                  (Will be compressed to ~20-30MB)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {/* Image Upload */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              disabled={isSubmitting || images.length >= 5 || video !== null}
            >
              <span className="text-xl">📷</span>
              <span className="text-sm font-medium">Images</span>
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              disabled={isSubmitting || video !== null || images.length > 0}
            >
              <span className="text-xl">🎥</span>
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
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-gray-700">📌 Pin Post</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};
