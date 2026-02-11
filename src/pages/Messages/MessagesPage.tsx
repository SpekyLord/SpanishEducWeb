import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Header } from '../../components';
import { ConversationList } from '../../components/messages/ConversationList';
import { ChatWindow } from '../../components/messages/ChatWindow';
import { useAuth } from '../../contexts/AuthContext';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    <div className="min-h-screen bg-fb-bg text-gray-100">
      <Header variant="feed" />

      <main className="mx-auto px-4 sm:px-6 py-6" style={{ maxWidth: '80rem' }}>
        <div className="glass-card-elevated shadow-fb-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
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
                <div className="flex-1 flex items-center justify-center bg-fb-bg">
                  <div className="text-center">
                    <MessageCircle size={64} className="mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-gray-400 text-lg">Select a conversation to start messaging</p>
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
