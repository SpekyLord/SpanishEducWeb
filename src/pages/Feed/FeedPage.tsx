import React, { useState } from 'react';
import { PostComposer } from '../../components/Post/PostComposer';
import { PostFeed } from '../../components/Post/PostFeed';
import { useAuth } from '../../contexts/AuthContext';

export const FeedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    // Trigger feed refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#18191a] text-gray-100">
      {/* Top Nav (Wireframe) */}
      <header className="sticky top-0 z-20 bg-[#242526] border-b border-[#3a3b3c]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3a3b3c] rounded-full" />
          <div className="text-gray-100 font-semibold">SpanishConnect</div>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-16 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-20 bg-[#3a3b3c] rounded" />
          </nav>
          <div className="flex-1" />
          <div className="hidden md:block w-72 h-9 bg-[#3a3b3c] rounded-full" />
          <div className="hidden sm:block text-sm text-gray-300">
            {user?.displayName} ({user?.role})
          </div>
          <button
            onClick={logout}
            className="px-3 py-2 text-sm font-medium text-white bg-[#3a3b3c] rounded-md hover:bg-[#4e4f50]"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout (Wireframe) */}
      <main className="mx-auto px-6 py-16 flex justify-center">
        <div className="max-w-2xl w-full space-y-10">
          {/* Stories row */}
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-4 flex items-center gap-4 overflow-x-auto mb-10">
            <div className="min-w-[110px] h-16 bg-[#3a3b3c] rounded-lg flex items-center justify-center text-sm text-gray-300">Create story</div>
            <div className="min-w-[110px] h-16 bg-[#3a3b3c] rounded-lg" />
            <div className="min-w-[110px] h-16 bg-[#3a3b3c] rounded-lg" />
            <div className="min-w-[110px] h-16 bg-[#3a3b3c] rounded-lg" />
            <div className="min-w-[110px] h-16 bg-[#3a3b3c] rounded-lg" />
          </div>
          {user?.role === 'teacher' && (
            <PostComposer onPostCreated={handlePostCreated} />
          )}
          <PostFeed key={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};
