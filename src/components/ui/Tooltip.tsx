import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'light' | 'dark';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  variant = 'dark',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2',
    left: 'left-full top-1/2 transform -translate-y-1/2',
    right: 'right-full top-1/2 transform -translate-y-1/2',
  };

  const variantClasses = {
    light: 'bg-tooltip-background-light text-text-primary border border-border-subtle',
    dark: 'bg-tooltip-background-dark text-text-on-color',
  };

  const arrowVariantClasses = {
    light: 'border-border-subtle',
    dark: 'border-tooltip-background-dark',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm rounded-lg shadow-soft-shadow-lg transition-opacity
            ${placementClasses[placement]}
            ${variantClasses[variant]}
            ${className}
          `}
          style={{ maxWidth: '200px' }}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 transform rotate-45
              ${arrowClasses[placement]}
              ${variant === 'light' ? 'bg-tooltip-background-light border' : 'bg-tooltip-background-dark'}
              ${arrowVariantClasses[variant]}
            `}
            style={{
              [placement === 'top' ? 'borderBottomColor' : 
               placement === 'bottom' ? 'borderTopColor' :
               placement === 'left' ? 'borderRightColor' : 'borderLeftColor']: 'transparent',
            }}
          />
        </div>
      )}
    </div>
  );
};