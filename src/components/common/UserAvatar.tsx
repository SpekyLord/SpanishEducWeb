import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, icon: 14 },
  md: { width: 40, height: 40, icon: 18 },
  lg: { width: 44, height: 44, icon: 20 },
  xl: { width: 56, height: 56, icon: 24 },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const { width, height, icon } = sizeMap[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width, height, minWidth: width }}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width, height, minWidth: width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className={`rounded-full bg-[#0f3460] ${className}`}
      aria-label={name}
    >
      <User size={icon} className="text-gray-400" />
    </div>
  );
};
