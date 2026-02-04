import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Image as ImageIcon, Send, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages, sendMessage as sendMessageAPI, markAsRead, type Message } from '../../services/api';

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
      formData.append('content', newMessage.trim() || ' '); // Space if only image
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
      <div className="flex flex-col h-full bg-fb-bg">
        <div className="flex items-center justify-center flex-1">
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-fb-bg">
      {/* Header */}
      <div className="bg-fb-card border-b border-fb-border p-4 flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden text-gray-300 hover:text-gray-100">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {otherUser.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-100">{otherUser.displayName}</h2>
          <p className="text-xs text-gray-500">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="mx-auto max-w-md p-3 bg-red-900/30 border border-red-700/60 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender._id === user?._id;
            const showAvatar =
              !isOwnMessage && (index === 0 || messages[index - 1].sender._id !== message.sender._id);

            return (
              <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
                    {showAvatar ? message.sender.displayName.charAt(0).toUpperCase() : ''}
                  </div>
                )}

                <div className={`max-w-[70%] ${isOwnMessage ? 'ml-auto' : ''}`}>
                  {message.image && (
                    <img
                      src={message.image.url}
                      alt="Attachment"
                      className="rounded-lg mb-1 max-w-full cursor-pointer hover:opacity-90"
                      onClick={() => window.open(message.image!.url, '_blank')}
                    />
                  )}

                  {message.content.trim() && (
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage ? 'bg-blue-600 text-white' : 'bg-fb-card text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 px-2">
                    <span className="text-xs text-gray-500">{formatMessageTime(message.createdAt)}</span>
                    {isOwnMessage && message.isRead && (
                      <span className="text-blue-400 text-xs ml-1">✓✓</span>
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
      <div className="bg-fb-card border-t border-fb-border p-4">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="message-image"
          />
          <label
            htmlFor="message-image"
            className="p-2 text-gray-400 hover:text-gray-300 cursor-pointer transition-colors"
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
            className="flex-1 bg-fb-hover rounded-2xl px-4 py-2 text-sm text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            rows={1}
            maxLength={2000}
            disabled={isSending}
          />

          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {newMessage.length > 0 && (
          <p className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/2000
          </p>
        )}
      </div>
    </div>
  );
};
