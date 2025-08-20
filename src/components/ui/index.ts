// UI Components barrel export
export { Alert } from './Alert';
export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { Checkbox } from './Checkbox';
export { Container } from './Container';
export { Input } from './Input';
export { Loader } from './Loader';
export { ProgressBar } from './ProgressBar';
export { ProgressSteps } from './ProgressSteps';
export { RadioButton } from './RadioButton';
export { Switch } from './Switch';
export { Text } from './Text';
export { Title } from './Title';
export { Tooltip } from './Tooltip';
export { default as Toast } from './Toast';

// Toast utility function for easy usage
export const toast = {
  success: (message: string) => {
    // This would integrate with the existing toast system
    console.log('Success:', message);
    // In a real implementation, this would call the useToast hook
  },
  error: (message: string) => {
    console.log('Error:', message);
  },
  warning: (message: string) => {
    console.log('Warning:', message);
  },
  info: (message: string) => {
    console.log('Info:', message);
  },
};