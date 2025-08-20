import React, { createContext, useContext, useState } from 'react';

interface RadioButtonGroupContextType {
  value: string | string[];
  onChange: (value: string) => void;
  name: string;
  disabled: boolean;
  size: 'sm' | 'md';
  style: 'simple' | 'tile';
  multiSelection: boolean;
}

const RadioButtonGroupContext = createContext<RadioButtonGroupContextType | null>(null);

interface RadioButtonGroupProps {
  children: React.ReactNode;
  name?: string;
  style?: 'simple' | 'tile';
  size?: 'sm' | 'md';
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  multiSelection?: boolean;
  vertical?: boolean;
  className?: string;
}

interface RadioButtonProps {
  value: string;
  label?: {
    heading: string;
    description?: string;
  };
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  borderOn?: boolean;
  borderOnActive?: boolean;
}

const Group: React.FC<RadioButtonGroupProps> = ({
  children,
  name = 'radio-group',
  style = 'simple',
  size = 'md',
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  multiSelection = false,
  vertical = false,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (multiSelection ? [] : '')
  );

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue: string) => {
    let updatedValue: string | string[];

    if (multiSelection) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      if (currentArray.includes(newValue)) {
        updatedValue = currentArray.filter(v => v !== newValue);
      } else {
        updatedValue = [...currentArray, newValue];
      }
    } else {
      updatedValue = newValue;
    }

    if (controlledValue === undefined) {
      setInternalValue(updatedValue);
    }

    if (onChange) {
      onChange(updatedValue);
    }
  };

  const containerClasses = [
    vertical ? 'flex flex-col' : 'flex flex-row flex-wrap',
    className,
  ].join(' ');

  const contextValue: RadioButtonGroupContextType = {
    value: currentValue,
    onChange: handleChange,
    name,
    disabled,
    size,
    style,
    multiSelection,
  };

  return (
    <RadioButtonGroupContext.Provider value={contextValue}>
      <div className={containerClasses}>
        {children}
      </div>
    </RadioButtonGroupContext.Provider>
  );
};

const Button: React.FC<RadioButtonProps> = ({
  value,
  label,
  disabled: buttonDisabled = false,
  icon,
  className = '',
  borderOn = false,
  borderOnActive = false,
}) => {
  const context = useContext(RadioButtonGroupContext);
  
  if (!context) {
    throw new Error('RadioButton.Button must be used within RadioButton.Group');
  }

  const { value: groupValue, onChange, name, disabled: groupDisabled, size, style, multiSelection } = context;
  
  const isDisabled = groupDisabled || buttonDisabled;
  const isChecked = multiSelection 
    ? Array.isArray(groupValue) && groupValue.includes(value)
    : groupValue === value;

  const handleChange = () => {
    if (!isDisabled) {
      onChange(value);
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
  };

  const styleClasses = {
    simple: `
      flex items-center gap-3 p-3 cursor-pointer
      ${isChecked ? 'bg-field-primary-hover' : 'hover:bg-field-primary-hover'}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
    tile: `
      flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all
      ${borderOn || (borderOnActive && isChecked) ? 'border-border-interactive' : 'border-border-subtle'}
      ${isChecked ? 'bg-field-primary-hover border-brand-primary-600' : 'hover:bg-field-primary-hover hover:border-border-interactive'}
      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
  };

  const classes = [
    styleClasses[style],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <label className={classes}>
      <input
        type={multiSelection ? 'checkbox' : 'radio'}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        disabled={isDisabled}
        className="sr-only"
      />
      
      {/* Custom Radio/Checkbox Indicator */}
      <div className={`
        w-4 h-4 border-2 rounded-${multiSelection ? 'sm' : 'full'} transition-colors flex items-center justify-center
        ${isChecked 
          ? 'border-brand-primary-600 bg-brand-primary-600' 
          : 'border-border-interactive bg-field-primary-background'
        }
        ${isDisabled ? 'opacity-50' : ''}
      `}>
        {isChecked && (
          <span className="text-white text-xs">
            {multiSelection ? '✓' : '●'}
          </span>
        )}
      </div>

      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}

      {/* Label */}
      <div className="flex-1">
        {label?.heading && (
          <div className="font-medium text-text-primary">
            {label.heading}
          </div>
        )}
        {label?.description && (
          <div className="text-sm text-text-secondary mt-1">
            {label.description}
          </div>
        )}
      </div>
    </label>
  );
};

export const RadioButton = {
  Group,
  Button,
};