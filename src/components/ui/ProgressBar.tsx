import React from 'react';

interface ProgressBarProps {
  progress: number;
  speed?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  speed = 300,
  className = '',
  variant = 'default',
  size = 'md',
  showLabel = false,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-brand-primary-600',
    success: 'bg-support-success',
    warning: 'bg-support-warning',
    error: 'bg-support-error',
  };

  const containerClasses = [
    'w-full bg-misc-progress-background rounded-full overflow-hidden',
    sizeClasses[size],
    className,
  ].join(' ');

  const barClasses = [
    'h-full rounded-full transition-all ease-out',
    variantClasses[variant],
  ].join(' ');

  const barStyle = {
    width: `${clampedProgress}%`,
    transitionDuration: `${speed}ms`,
  };

  return (
    <div className="w-full">
      <div className={containerClasses}>
        <div 
          className={barClasses}
          style={barStyle}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-text-secondary text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
};