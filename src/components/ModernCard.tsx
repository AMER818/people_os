import React, { ReactNode } from 'react';

type CardVariant = 'default' | 'primary' | 'accent' | 'glass';

interface ModernCardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
}) => {
  const baseStyles = 'rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md';

  const variants = {
    default: 'bg-surface border-border text-text-primary',
    primary: 'bg-primary/5 border-primary/20 hover:border-primary/40 text-text-primary',
    accent: 'bg-accent/5 border-accent/20 hover:border-accent/40 text-text-primary',
    glass: 'bg-surface/80 backdrop-blur-md border-white/20 shadow-lg text-text-primary',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={onClick ? (typeof children === 'string' ? children : 'Card Action') : undefined}
    >
      {children}
    </div>
  );
};
