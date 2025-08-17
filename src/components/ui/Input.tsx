import React, { forwardRef } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  onChange?: (value: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  error = false,
  label,
  onChange,
  prefix,
  suffix,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const stateClasses = error
    ? 'border-field-border-error bg-field-background-error focus:ring-support-error focus:border-field-border-error'
    : disabled
    ? 'border-field-border-disabled bg-field-background-disabled text-field-color-disabled cursor-not-allowed'
    : 'border-field-border bg-field-primary-background focus:ring-brand-primary-600 focus:border-brand-primary-600 hover:border-border-interactive';

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    prefix ? 'pl-10' : '',
    suffix ? 'pr-10' : '',
    className,
  ].join(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-field-label mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-icon-secondary">{prefix}</span>
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-icon-secondary">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
});