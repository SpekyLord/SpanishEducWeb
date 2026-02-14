import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const defaultHeights = {
    text: 16,
    circular: 40,
    rectangular: 200
  };

  const finalHeight = height || defaultHeights[variant];

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight
      }}
    />
  );
};

// Pre-built skeleton patterns
export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-fb-card rounded-lg border border-fb-border p-6 mb-4 shadow-fb">
      {/* Author Header */}
      <div className="flex items-center mb-6">
        <Skeleton variant="circular" width={44} height={44} />
        <div className="ml-5 flex-1">
          <Skeleton variant="text" width="30%" height={20} className="mb-2" />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 space-y-2">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="95%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>

      {/* Image placeholder */}
      <Skeleton variant="rectangular" width="100%" height={300} className="mb-6" />

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-fb-border/50">
        <Skeleton variant="rectangular" width="30%" height={40} />
        <Skeleton variant="rectangular" width="30%" height={40} />
        <Skeleton variant="rectangular" width="30%" height={40} />
      </div>
    </div>
  );
};

export const CommentSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 p-3">
      {/* Avatar */}
      <Skeleton variant="circular" width={32} height={32} />

      {/* Content */}
      <div className="flex-1">
        <Skeleton variant="text" width="25%" height={14} className="mb-2" />
        <div className="space-y-2 mb-2">
          <Skeleton variant="text" width="100%" height={14} />
          <Skeleton variant="text" width="90%" height={14} />
        </div>
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
};

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 p-4">
      {/* Avatar */}
      <Skeleton variant="circular" width={40} height={40} />

      {/* Content */}
      <div className="flex-1">
        <Skeleton variant="text" width="70%" height={14} className="mb-2" />
        <Skeleton variant="text" width="50%" height={12} className="mb-1" />
        <Skeleton variant="text" width="30%" height={10} />
      </div>
    </div>
  );
};
