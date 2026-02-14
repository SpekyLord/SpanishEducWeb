import React from 'react';

interface MentionTextProps {
  content: string;
  mentions?: string[];
}

export const MentionText: React.FC<MentionTextProps> = ({ content, mentions }) => {
  if (!mentions || mentions.length === 0) return <span>{content}</span>;

  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          if (mentions.includes(username)) {
            return (
              <a
                key={index}
                href={`/profile/${username}`}
                className="text-[#b8860b] hover:text-[#d4a017] font-medium hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {part}
              </a>
            );
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
