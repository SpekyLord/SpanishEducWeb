import React from 'react';

interface ThreadLineProps {
  depth: number;
  isLast?: boolean;
}

export const ThreadLine: React.FC<ThreadLineProps> = ({ depth, isLast }) => {
  if (depth === 0) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 flex">
      {Array.from({ length: depth }).map((_, index) => {
        const isCurrentLevel = index === depth - 1;
        return (
          <div key={index} className="relative" style={{ width: '32px' }}>
            {/* Vertical line for parent levels */}
            {!isCurrentLevel && (
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />
            )}

            {/* L-shaped connector for current level */}
            {isCurrentLevel && (
              <>
                {!isLast && (
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300" />
                )}
                <div
                  className="absolute left-4 w-3 h-px bg-gray-300"
                  style={{ top: '24px' }} // Align with avatar center
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
