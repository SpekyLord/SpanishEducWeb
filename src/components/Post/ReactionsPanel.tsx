import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getPostReactions, ReactionsUser } from '../../services/api';
import { UserAvatar } from '../common/UserAvatar';

interface ReactionsPanelProps {
  postId: string;
  onClose: () => void;
}

const REACTION_TYPES = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'question', emoji: '❓', label: 'Question' },
] as const;

type ReactionType = typeof REACTION_TYPES[number]['type'];

export const ReactionsPanel: React.FC<ReactionsPanelProps> = ({ postId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | ReactionType>('all');
  const [reactions, setReactions] = useState<Record<ReactionType, ReactionsUser[]> | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await getPostReactions(postId);
        if (response.success) {
          setReactions(response.data.reactions as Record<ReactionType, ReactionsUser[]>);
          setCounts(response.data.reactionsCount);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReactions();
  }, [postId]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding listener to avoid immediate close from the click that opened this
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getDisplayUsers = (): ReactionsUser[] => {
    if (!reactions) return [];
    if (activeTab === 'all') {
      const seen = new Set<string>();
      const all: ReactionsUser[] = [];
      for (const type of REACTION_TYPES) {
        for (const user of reactions[type.type]) {
          if (!seen.has(user._id)) {
            seen.add(user._id);
            all.push(user);
          }
        }
      }
      return all;
    }
    return reactions[activeTab] || [];
  };

  const displayUsers = getDisplayUsers();

  const content = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div
        ref={panelRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '70vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #d4ddd8',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e8ede8' }}>
          <span style={{ fontWeight: 600, color: '#1a3a2a', fontSize: '1rem' }}>Reactions</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b8a7a', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '12px 20px', borderBottom: '1px solid #e8ede8', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: activeTab === 'all' ? '#e0f0e5' : 'transparent',
              color: activeTab === 'all' ? '#276749' : '#6b8a7a',
              whiteSpace: 'nowrap',
            }}
          >
            All {counts?.total || 0}
          </button>
          {REACTION_TYPES.map(({ type, emoji }) => {
            const count = counts?.[type] || 0;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: activeTab === type ? '#e0f0e5' : 'transparent',
                  color: activeTab === type ? '#276749' : '#6b8a7a',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{emoji}</span> {count}
              </button>
            );
          })}
        </div>

        {/* User List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <div style={{ width: 32, height: 32, border: '2px solid rgba(184,134,11,0.2)', borderTopColor: '#b8860b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : displayUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9cb0a3', fontSize: '0.875rem' }}>
              No reactions yet
            </div>
          ) : (
            displayUsers.map((user) => (
              <div
                key={user._id}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px' }}
              >
                <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="sm" />
                <div>
                  <div style={{ fontWeight: 600, color: '#1a3a2a', fontSize: '0.875rem' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b8a7a' }}>@{user.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
