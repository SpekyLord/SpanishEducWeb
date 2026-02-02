import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CommentThreadContextType {
  collapsedThreads: Set<string>;
  toggleCollapse: (commentId: string) => void;
  isCollapsed: (commentId: string) => boolean;
  highlightedCommentId: string | null;
  setHighlightedCommentId: (id: string | null) => void;
}

const CommentThreadContext = createContext<CommentThreadContextType | undefined>(undefined);

export const CommentThreadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  const toggleCollapse = (commentId: string) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const isCollapsed = (commentId: string) => collapsedThreads.has(commentId);

  return (
    <CommentThreadContext.Provider
      value={{
        collapsedThreads,
        toggleCollapse,
        isCollapsed,
        highlightedCommentId,
        setHighlightedCommentId,
      }}
    >
      {children}
    </CommentThreadContext.Provider>
  );
};

export const useCommentThread = () => {
  const context = useContext(CommentThreadContext);
  if (!context) {
    throw new Error('useCommentThread must be used within CommentThreadProvider');
  }
  return context;
};
