import React from 'react';

interface ProgressStepProps {
  children: React.ReactNode;
  className?: string;
}

interface ProgressStepsProps {
  currentStep: number;
  variant?: 'dot' | 'number' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  type?: 'inline' | 'stack';
  className?: string;
  children: React.ReactElement[];
}

interface StepProps {
  labelText?: string;
  icon?: React.ReactNode;
  index?: number;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({
  labelText,
  icon,
  index = 0,
  isCurrent = false,
  isCompleted = false,
  isLast = false,
}) => {
  const stepNumber = index + 1;
  
  const getStepContent = () => {
    if (isCompleted) {
      return (
        <span className="text-white">
          ✓
        </span>
      );
    }
    if (icon) {
      return icon;
    }
    return stepNumber;
  };

  const stepClasses = `
    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
    ${isCompleted 
      ? 'bg-support-success text-white' 
      : isCurrent 
        ? 'bg-brand-primary-600 text-white ring-4 ring-brand-background-50' 
        : 'bg-field-primary-background text-text-secondary border-2 border-border-subtle'
    }
  `;

  const labelClasses = `
    mt-2 text-xs font-medium text-center
    ${isCurrent ? 'text-text-primary' : 'text-text-secondary'}
  `;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <div className={stepClasses}>
          {getStepContent()}
        </div>
        {!isLast && (
          <div className={`
            w-16 h-px mx-4
            ${isCompleted ? 'bg-support-success' : 'bg-border-subtle'}
          `} />
        )}
      </div>
      {labelText && (
        <div className={labelClasses}>
          {labelText}
        </div>
      )}
    </div>
  );
};

export const ProgressSteps: React.FC<ProgressStepsProps> & { Step: React.FC<StepProps> } = ({
  currentStep,
  variant = 'icon',
  size = 'md',
  type = 'inline',
  className = '',
  children,
}) => {
  const containerClasses = [
    'flex items-start justify-center',
    type === 'stack' ? 'flex-col space-y-4' : 'flex-row',
    className,
  ].join(' ');

  return (
    <div className={containerClasses}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<StepProps>(child)) {
          return React.cloneElement(child, {
            index,
            isCurrent: index === currentStep,
            isCompleted: index < currentStep,
            isLast: index === children.length - 1,
          });
        }
        return child;
      })}
    </div>
  );
};

ProgressSteps.Step = Step;