import React from 'react';

interface TitleProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Title: React.FC<TitleProps> = ({
  title,
  description,
  icon,
  iconPosition = 'left',
  tag: Tag = 'h2',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: {
      title: 'text-lg font-semibold',
      description: 'text-sm text-text-secondary',
    },
    sm: {
      title: 'text-xl font-semibold',
      description: 'text-sm text-text-secondary',
    },
    md: {
      title: 'text-2xl font-bold',
      description: 'text-base text-text-secondary',
    },
    lg: {
      title: 'text-3xl font-bold',
      description: 'text-lg text-text-secondary',
    },
  };

  const containerClasses = ['space-y-2', className].join(' ');

  if (!title && !description) {
    return null;
  }

  return (
    <div className={containerClasses}>
      {title && (
        <Tag className={`${sizeClasses[size].title} text-text-primary flex items-center gap-2`}>
          {icon && iconPosition === 'left' && icon}
          {title}
          {icon && iconPosition === 'right' && icon}
        </Tag>
      )}
      {description && (
        <p className={sizeClasses[size].description}>
          {description}
        </p>
      )}
    </div>
  );
};