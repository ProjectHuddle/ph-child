import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '../ui/button.jsx';
import { Loader2 } from 'lucide-react';

/**
 * Save Button Component
 * 
 * Reusable save button with loading state
 */
const SaveButton = ({ onClick, disabled, saving }) => {
  return (
    <div className="flex justify-end pt-4">
      <Button
        onClick={onClick}
        disabled={disabled || saving}
        size="default"
        className="h-10 px-8 bg-[#4253ff] hover:bg-[#3142ef] text-white"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {__('Saving...', 'surefeedback')}
          </>
        ) : (
          __('Save Changes', 'surefeedback')
        )}
      </Button>
    </div>
  );
};

export default SaveButton;

