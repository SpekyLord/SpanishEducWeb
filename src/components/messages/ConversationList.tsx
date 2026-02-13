import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getConversations, type Conversation } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';

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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#16213e', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#9ca3af', margin: 0 }}>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#16213e', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Search bar */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glow"
            style={{ width: '100%', backgroundColor: '#0f3460', borderRadius: '8px', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.875rem', color: '#f3f4f6', border: '1px solid rgba(255,255,255,0.08)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ margin: '16px 16px 0', padding: '12px', backgroundColor: 'rgba(127,29,29,0.3)', border: '1px solid rgba(185,28,28,0.6)', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#fecaca', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 16px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedConversationId === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => onSelectConversation(conv._id, conv.otherUser)}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  backgroundColor: isSelected ? '#0f3460' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isSelected ? '3px solid #c9a96e' : '3px solid transparent',
                  borderTop: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#0f3460'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Avatar */}
                <UserAvatar name={conv.otherUser.displayName} avatarUrl={conv.otherUser.avatarUrl} size="md" />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{
                      fontWeight: 600,
                      color: conv.unreadCount > 0 ? '#f3f4f6' : '#d1d5db',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                    }}>
                      {conv.otherUser.displayName}
                    </h3>
                    {conv.lastMessage && (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '8px', flexShrink: 0 }}>
                        {formatMessageTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  {conv.lastMessage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: conv.unreadCount > 0 ? '#f3f4f6' : '#9ca3af',
                        fontWeight: conv.unreadCount > 0 ? 500 : 400,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {conv.lastMessage.sender?._id === user?._id && 'You: '}
                        {conv.lastMessage.hasImage && '📷 '}
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#e94560',
                          color: 'white',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          padding: '2px 8px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
