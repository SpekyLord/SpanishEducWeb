import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Image as ImageIcon, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage as sendMessageAPI, markAsRead, type Message } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';

interface ChatWindowProps {
  conversationId: string;
  otherUser: any;
  onBack: () => void;
  refreshKey?: number;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  otherUser,
  onBack,
  refreshKey
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, refreshKey]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const timer = setTimeout(() => {
        markAsRead(conversationId).catch(err =>
          console.error('Mark as read error:', err)
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [conversationId, messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getMessages(conversationId);
      setMessages(response.data.messages);
      setError(null);
    } catch (err: any) {
      console.error('Load messages error:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = user?.role === 'teacher' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`Image must be less than ${user?.role === 'teacher' ? '5MB' : '2MB'}`);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images allowed (JPEG, PNG, GIF, WebP)');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || isSending) return;

    if (newMessage.length > 2000) {
      setError('Message cannot exceed 2000 characters');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('recipientId', otherUser._id);
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await sendMessageAPI(formData);

      // Add message to list
      setMessages([...messages, response.data.message]);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#f5f7f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#6b8a7a', margin: 0 }}>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#f5f7f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#6b8a7a', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#f5f7f5' }}>
      {/* Header */}
      <div className="p-3 lg:p-4" style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #d4ddd8', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#4a6a58', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1a3a2a'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#4a6a58'; }}
        >
          <ChevronLeft size={24} />
        </button>
        <UserAvatar name={otherUser.displayName} avatarUrl={otherUser.avatarUrl} size="md" />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 600, color: '#1a3a2a', margin: 0, fontSize: '1rem' }}>{otherUser.displayName}</h2>
          <p style={{ fontSize: '0.75rem', color: '#6b8a7a', margin: 0 }}>@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-3 lg:p-4" style={{ flex: 1, overflowY: 'auto' }}>
        {error && (
          <div style={{ maxWidth: '28rem', margin: '0 auto 12px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.875rem', color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: '#6b8a7a', margin: 0 }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender._id === user?._id;
            const showAvatar =
              !isOwnMessage && (index === 0 || messages[index - 1].sender._id !== message.sender._id);

            return (
              <div key={message._id} style={{ display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                {!isOwnMessage && (
                  <div style={{ marginRight: '8px', flexShrink: 0 }}>
                    {showAvatar ? (
                      <UserAvatar name={message.sender.displayName} avatarUrl={message.sender.avatarUrl} size="sm" />
                    ) : (
                      <div style={{ width: 32, height: 32 }} />
                    )}
                  </div>
                )}

                <div style={{ maxWidth: '75%', marginLeft: isOwnMessage ? 'auto' : undefined }}>
                  {message.image && (
                    <img
                      src={message.image.url}
                      alt="Attachment"
                      style={{ borderRadius: '12px', marginBottom: '4px', maxWidth: '100%', cursor: 'pointer' }}
                      onClick={() => window.open(message.image!.url, '_blank')}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    />
                  )}

                  {message.content.trim() && (
                    <div style={{
                      borderRadius: '16px',
                      padding: '8px 16px',
                      ...(isOwnMessage
                        ? { background: 'linear-gradient(to bottom right, #276749, #1e4d35)', color: 'white' }
                        : { backgroundColor: '#f0f4f0', color: '#1a3a2a', border: '1px solid #d4ddd8' }
                      ),
                    }}>
                      <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{message.content}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '0 8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b8a7a' }}>{formatMessageTime(message.createdAt)}</span>
                    {isOwnMessage && message.isRead && (
                      <span style={{ color: '#b8860b', fontSize: '0.75rem', marginLeft: '4px' }}>✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 lg:p-4" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #d4ddd8' }}>
        {imagePreview && (
          <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ height: '80px', maxWidth: '100%', borderRadius: '8px' }} />
            <button
              onClick={handleRemoveImage}
              style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#dc2626', color: 'white', borderRadius: '50%', padding: '4px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="message-image"
          />
          <label
            htmlFor="message-image"
            style={{ padding: '8px', color: '#6b8a7a', cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#4a6a58'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b8a7a'; }}
          >
            <ImageIcon size={24} />
          </label>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="input-glow"
            style={{ flex: 1, backgroundColor: '#f0f4f0', borderRadius: '16px', padding: '8px 16px', fontSize: '1rem', color: '#1a3a2a', resize: 'none', maxHeight: '128px', border: '1px solid #d4ddd8', outline: 'none', boxSizing: 'border-box' }}
            rows={1}
            maxLength={2000}
            disabled={isSending}
          />

          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            style={{
              padding: '10px',
              backgroundColor: '#276749',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: ((!newMessage.trim() && !selectedImage) || isSending) ? 'not-allowed' : 'pointer',
              opacity: ((!newMessage.trim() && !selectedImage) || isSending) ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s, transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e4d35'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#276749'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send size={20} />
          </button>
        </div>

        {newMessage.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: '#6b8a7a', marginTop: '4px', textAlign: 'right', margin: '4px 0 0' }}>
            {newMessage.length}/2000
          </p>
        )}
      </div>
    </div>
  );
};
