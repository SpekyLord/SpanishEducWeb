import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Header } from '../../components';
import { ConversationList } from '../../components/messages/ConversationList';
import { ChatWindow } from '../../components/messages/ChatWindow';
import { getConversation } from '../../services/api';

export const MessagesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-select conversation when navigating from a DM notification
  useEffect(() => {
    const state = location.state as any;
    if (!state?.userId) return;

    // Clear the state so it doesn't re-trigger on navigation
    navigate(location.pathname, { replace: true, state: {} });

    const openConversation = async () => {
      try {
        const response = await getConversation(state.userId);
        const conversation = response.data.conversation;
        setSelectedConversationId(conversation._id);
        setSelectedOtherUser(state.otherUser || { displayName: 'User' });
      } catch (err) {
        console.error('Failed to open conversation from notification:', err);
      }
    };

    openConversation();
  }, [location.state]);

  // Polling mechanism - refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = (conversationId: string, otherUser: any) => {
    setSelectedConversationId(conversationId);
    setSelectedOtherUser(otherUser);
  };

  const handleBack = () => {
    setSelectedConversationId(null);
    setSelectedOtherUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#f3f4f6' }}>
      <Header variant="feed" />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div className="glass-card-elevated" style={{ height: 'calc(100vh - 8rem)', overflow: 'hidden' }}>
          <div className="flex h-full">
            {/* Conversation List - 1/3 width on desktop, full on mobile when not selected */}
            <div
              className={`w-full lg:w-1/3 h-full ${
                selectedConversationId ? 'hidden lg:block' : ''
              }`}
            >
              <ConversationList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
                refreshKey={refreshKey}
              />
            </div>

            {/* Chat Window - 2/3 width on desktop, full on mobile when selected */}
            <div
              className={`w-full lg:w-2/3 h-full ${
                !selectedConversationId ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {selectedConversationId ? (
                <ChatWindow
                  conversationId={selectedConversationId}
                  otherUser={selectedOtherUser}
                  onBack={handleBack}
                  refreshKey={refreshKey}
                />
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' }}>
                  <div style={{ textAlign: 'center' }}>
                    <MessageCircle size={64} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#9ca3af', display: 'block' }} />
                    <p style={{ color: '#9ca3af', fontSize: '1.125rem', margin: 0 }}>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
