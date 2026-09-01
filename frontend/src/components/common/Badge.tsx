import React from 'react';

interface BadgeProps {
  variant?: 'mint' | 'cobalt' | 'amber' | 'coral' | 'violet' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  size = 'md',
  dot = false,
  children,
  className = ''
}) => {
  const variantStyles = {
    mint: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30',
    cobalt: 'bg-sky-950/60 text-sky-300 border-sky-500/30',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    coral: 'bg-rose-950/60 text-rose-300 border-rose-500/30',
    violet: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
    slate: 'bg-slate-800/60 text-slate-300 border-slate-700/50'
  };

  const dotColors = {
    mint: 'bg-emerald-400',
    cobalt: 'bg-sky-400',
    amber: 'bg-amber-400',
    coral: 'bg-rose-400',
    violet: 'bg-purple-400',
    slate: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs font-medium',
    lg: 'px-3 py-1 text-xs font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border tracking-wide font-sans ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
