import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, type Conversation } from '../../services/api';

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void;
  selectedConversationId: string | null;
  refreshKey?: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
  refreshKey
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, [refreshKey]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await getConversations();
      setConversations(response.data.conversations);
      setError(null);
    } catch (err: any) {
      console.error('Load conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-fb-card border-r border-fb-border">
        <div className="p-4 flex items-center justify-center flex-1">
          <p className="text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-fb-card border-r border-fb-border">
      {/* Search bar */}
      <div className="p-4 border-b border-fb-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-fb-hover rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-700/60 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4 text-center">
            <p className="text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv._id, conv.otherUser)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-fb-hover transition-colors border-b border-fb-border/50 ${
                selectedConversationId === conv._id ? 'bg-fb-hover' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {conv.otherUser.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-semibold truncate ${
                      conv.unreadCount > 0 ? 'text-gray-100' : 'text-gray-300'
                    }`}
                  >
                    {conv.otherUser.displayName}
                  </h3>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatMessageTime(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                {conv.lastMessage && (
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm truncate flex-1 ${
                        conv.unreadCount > 0 ? 'text-gray-100 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {conv.lastMessage.sender._id === user?._id && 'You: '}
                      {conv.lastMessage.hasImage && '📷 '}
                      {conv.lastMessage.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-medium flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
