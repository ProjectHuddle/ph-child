import React from 'react';

interface AlertAction {
  label: string;
  onClick: (close?: () => void) => void;
  type: 'link' | 'button';
}

interface AlertProps {
  variant?: 'neutral' | 'info' | 'warning' | 'error' | 'success';
  design?: 'inline' | 'stack';
  title?: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactElement | null;
  onClose?: () => void;
  action?: AlertAction;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'neutral',
  design = 'inline',
  title,
  content,
  icon,
  onClose,
  action,
  className = '',
}) => {
  const variantClasses = {
    neutral: 'bg-alert-background-neutral border-alert-border-neutral text-text-primary',
    info: 'bg-alert-background-info border-alert-border-info text-text-primary',
    warning: 'bg-alert-background-warning border-alert-border-warning text-text-primary',
    error: 'bg-alert-background-danger border-alert-border-danger text-text-primary',
    success: 'bg-alert-background-green border-alert-border-green text-text-primary',
  };

  const iconMap = {
    neutral: '🔔',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  const baseClasses = 'border rounded-lg p-4 transition-all';
  const designClasses = design === 'stack' ? 'space-y-3' : 'flex gap-3';

  const classes = [
    baseClasses,
    variantClasses[variant],
    designClasses,
    className,
  ].join(' ');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleAction = () => {
    if (action) {
      action.onClick(handleClose);
    }
  };

  const renderIcon = () => {
    if (icon === null) return null;
    if (icon) return icon;
    return <span className="text-lg">{iconMap[variant]}</span>;
  };

  if (design === 'stack') {
    return (
      <div className={classes}>
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            {renderIcon()}
            <div className="flex-1">
              {title && (
                <div className="font-medium text-sm mb-1">
                  {title}
                </div>
              )}
              {content && (
                <div className="text-sm">
                  {content}
                </div>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary transition-colors ml-4"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        {action && (
          <div className="pt-2">
            {action.type === 'button' ? (
              <button
                onClick={handleAction}
                className="bg-brand-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-brand-hover-700 transition-colors"
              >
                {action.label}
              </button>
            ) : (
              <button
                onClick={handleAction}
                className="text-brand-primary-600 hover:text-brand-hover-700 text-sm font-medium transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={classes}>
      {renderIcon()}
      <div className="flex-1">
        {title && (
          <div className="font-medium text-sm mb-1">
            {title}
          </div>
        )}
        {content && (
          <div className="text-sm">
            {content}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <>
            {action.type === 'button' ? (
              <button
                onClick={handleAction}
                className="bg-brand-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-brand-hover-700 transition-colors"
              >
                {action.label}
              </button>
            ) : (
              <button
                onClick={handleAction}
                className="text-brand-primary-600 hover:text-brand-hover-700 text-sm font-medium transition-colors"
              >
                {action.label}
              </button>
            )}
          </>
        )}
        {onClose && (
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};