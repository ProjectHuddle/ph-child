import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '../ui/button.jsx';

/**
 * Error Notice Component
 * 
 * Displays error messages with dismiss functionality
 */
const ErrorNotice = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3">
      <p className="text-sm text-red-700">{error}</p>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="mt-2 text-xs"
        >
          {__('Dismiss', 'surefeedback')}
        </Button>
      )}
    </div>
  );
};

export default ErrorNotice;

