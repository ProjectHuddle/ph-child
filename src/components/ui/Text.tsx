import React from 'react';

interface TextProps {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div' | 'label';
  size?: 12 | 14 | 16 | 18 | 20 | 24;
  weight?: 400 | 500 | 600 | 700;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info' | 'disabled' | 'inverse';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  as: Component = 'p',
  size = 14,
  weight = 400,
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    12: 'text-xs',
    14: 'text-sm',
    16: 'text-base',
    18: 'text-lg',
    20: 'text-xl',
    24: 'text-2xl',
  };

  const weightClasses = {
    400: 'font-normal',
    500: 'font-medium',
    600: 'font-semibold',
    700: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    error: 'text-support-error',
    success: 'text-support-success',
    warning: 'text-support-warning',
    info: 'text-support-info',
    disabled: 'text-text-disabled',
    inverse: 'text-text-inverse',
  };

  const classes = [
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    className,
  ].join(' ');

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
};