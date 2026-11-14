import React, { useState } from 'react';

interface PathyMascotProps {
  mood?: 'happy' | 'thinking' | 'celebrating' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PathyMascot: React.FC<PathyMascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeMap = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const ringMap = {
    happy: 'ring-blue-200 dark:ring-blue-900',
    thinking: 'ring-purple-200 dark:ring-purple-900',
    celebrating: 'ring-amber-300 dark:ring-amber-800',
    offline: 'ring-slate-300 dark:ring-slate-700',
  };

  if (imgFailed) {
    return (
      <div
        className={`${sizeMap[size]} flex items-center justify-center rounded-2xl bg-blue-600 text-white ring-4 ${ringMap[mood]} ${className}`}
        aria-label={`Pathy mascot (${mood})`}
      >
        <svg viewBox="0 0 64 64" className="h-3/4 w-3/4" fill="none">
          <path d="M32 10L52 20L32 30L12 20L32 10Z" fill="#FFFFFF" />
          <circle cx="32" cy="39" r="15" fill="#F59E0B" />
          <circle cx="26" cy="36" r="3" fill="#0F172A" />
          <circle cx="38" cy="36" r="3" fill="#0F172A" />
          <path d="M29 42L32 46L35 42H29Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} shrink-0 overflow-hidden rounded-2xl ring-4 ${ringMap[mood]} bg-slate-100 dark:bg-slate-800 ${className}`}
    >
      <img
        src="/src/assets/images/pathy_mascot_owl_1794643475507.jpg"
        alt={`Pathy the study owl mascot (${mood})`}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
};
