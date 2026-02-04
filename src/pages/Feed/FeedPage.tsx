import React, { useState } from 'react';
import { PostComposer } from '../../components/Post/PostComposer';
import { PostFeed } from '../../components/Post/PostFeed';
import { Header } from '../../components';
import { useAuth } from '../../contexts/AuthContext';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    // Trigger feed refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-fb-bg text-gray-100">
      <Header variant="feed" />

      <main className="mx-auto px-4 sm:px-6 py-6" style={{ maxWidth: '42rem' }}>
        <div className="w-full space-y-4">
          {user?.role === 'teacher' && (
            <PostComposer onPostCreated={handlePostCreated} />
          )}
          <PostFeed key={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};
