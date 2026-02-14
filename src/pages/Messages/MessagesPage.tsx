import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Header } from '../../components';
import { ConversationList } from '../../components/messages/ConversationList';
import { ChatWindow } from '../../components/messages/ChatWindow';
import { getConversation } from '../../services/api';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const MessagesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const showConversationList = isDesktop || !selectedConversationId;
  const showChatWindow = isDesktop || !!selectedConversationId;

  // Auto-select conversation when navigating from a DM notification
  useEffect(() => {
    const state = location.state as any;
    if (!state?.userId) return;

    // Clear the state so it doesn't re-trigger on navigation
    navigate(location.pathname, { replace: true, state: {} });

    const openConversation = async () => {
      try {
        const response = await getConversation(state.userId);
        const conversation = response.data?.conversation;
        if (!conversation?._id) return;
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
    <div style={{ height: '100vh', backgroundColor: '#f5f7f5', color: '#1a3a2a', overflow: 'hidden' }}>
      <Header variant="feed" />

      <main style={{ padding: '1.25rem 0.5rem 0.75rem' }}>
        <div className="glass-card-elevated" style={{ height: 'calc(100vh - 7.5rem)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            {/* Conversation List - 1/3 on desktop, full width on mobile when no chat selected */}
            {showConversationList && (
              <div style={{ width: isDesktop ? '33.333%' : '100%', height: '100%' }}>
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversationId}
                  refreshKey={refreshKey}
                />
              </div>
            )}

            {/* Chat Window - 2/3 on desktop, full width on mobile when chat selected */}
            {showChatWindow && (
              <div style={{ width: isDesktop ? '66.667%' : '100%', height: '100%', display: 'flex' }}>
                {selectedConversationId ? (
                  <ChatWindow
                    conversationId={selectedConversationId}
                    otherUser={selectedOtherUser}
                    onBack={handleBack}
                    refreshKey={refreshKey}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7f5' }}>
                    <div style={{ textAlign: 'center' }}>
                      <MessageCircle size={64} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b8a7a', display: 'block' }} />
                      <p style={{ color: '#6b8a7a', fontSize: '1.125rem', margin: 0 }}>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
