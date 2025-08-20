import React from 'react';

interface BadgeProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'neutral' | 'red' | 'yellow' | 'green' | 'blue' | 'inverse';
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  closable?: boolean;
  onClose?: (event: React.MouseEvent) => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  label,
  size = 'sm',
  variant = 'neutral',
  icon,
  className = '',
  disabled = false,
  closable = false,
  onClose,
}) => {
  const sizeClasses = {
    xxs: 'px-1.5 py-0.5 text-xs',
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-sm',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantClasses = {
    neutral: 'bg-badge-background-gray text-badge-color-gray border-badge-border-gray',
    red: 'bg-badge-background-red text-badge-color-red border-badge-border-red',
    yellow: 'bg-badge-background-yellow text-badge-color-yellow border-badge-border-yellow',
    green: 'bg-badge-background-green text-badge-color-green border-badge-border-green',
    blue: 'bg-badge-background-sky text-badge-color-sky border-badge-border-sky',
    inverse: 'bg-badge-background-important text-text-on-color border-transparent',
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-colors';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabledClasses,
    className,
  ].join(' ');

  return (
    <span className={classes}>
      {icon && <span className="mr-1">{icon}</span>}
      {children || label}
      {closable && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 hover:opacity-70 focus:outline-none"
          disabled={disabled}
        >
          <span className="sr-only">Remove</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};