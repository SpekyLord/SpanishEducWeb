import React, { useState, useEffect } from 'react';

interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
}

interface MentionAutocompleteProps {
  query: string;
  position: { top: number; left: number };
  onSelect: (username: string) => void;
  onClose: () => void;
}

export const MentionAutocomplete: React.FC<MentionAutocompleteProps> = ({
  query,
  position,
  onSelect,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length < 1) {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setUsers(data.users || []);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, users.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && users[selectedIndex]) {
        e.preventDefault();
        onSelect(users[selectedIndex].username);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex, onSelect, onClose]);

  if (users.length === 0 && !loading) return null;

  return (
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-w-xs"
      style={{ top: position.top, left: position.left }}
    >
      {loading && (
        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
      )}
      {users.map((user, index) => (
        <button
          key={user.username}
          onClick={() => onSelect(user.username)}
          className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${
            index === selectedIndex ? 'bg-blue-100' : ''
          } ${index === 0 ? 'rounded-t-lg' : ''} ${
            index === users.length - 1 ? 'rounded-b-lg' : ''
          }`}
        >
          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
          <div className="text-xs text-gray-500">@{user.username}</div>
        </button>
      ))}
    </div>
  );
};
