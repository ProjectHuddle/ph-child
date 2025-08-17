import React from 'react';
import { Loader } from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  destructive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  destructive = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: destructive 
      ? 'bg-button-danger text-text-on-color hover:bg-button-danger-hover focus:ring-support-error'
      : 'bg-button-primary text-text-on-color hover:bg-button-primary-hover focus:ring-brand-primary-600',
    secondary: 'bg-button-secondary text-text-primary border border-border-interactive hover:bg-button-secondary-hover focus:ring-brand-primary-600',
    outline: 'bg-transparent text-text-primary border border-border-interactive hover:bg-field-primary-hover focus:ring-brand-primary-600',
    ghost: 'bg-transparent text-text-primary hover:bg-field-primary-hover focus:ring-brand-primary-600',
    link: 'bg-transparent text-link-primary hover:text-link-primary-hover underline focus:ring-brand-primary-600',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className,
  ].join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Loader size="sm" variant="secondary" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};