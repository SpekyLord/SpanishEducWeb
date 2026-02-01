import React, { useState } from 'react';
import { PostComposer } from '../../components/Post/PostComposer';
import { PostFeed } from '../../components/Post/PostFeed';
import { useAuth } from '../../contexts/AuthContext';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    // Trigger feed refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Post Composer (Teachers Only) */}
        {user?.role === 'teacher' && (
          <PostComposer onPostCreated={handlePostCreated} />
        )}

        {/* Post Feed */}
        <PostFeed key={refreshTrigger} />
      </div>
    </div>
  );
};
