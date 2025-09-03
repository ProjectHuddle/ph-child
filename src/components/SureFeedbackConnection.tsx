import React, { useState } from 'react';
import { Button, Container, Title } from '@bsf/force-ui';
import { ExternalLink, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { __ } from '@wordpress/i18n';

interface SureFeedbackConnectionProps {
  isConnected: boolean;
  setupInstructions: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  onScriptSubmit: (script: string) => void;
}

const SureFeedbackConnection: React.FC<SureFeedbackConnectionProps> = ({
  isConnected,
  setupInstructions,
  onScriptSubmit
}) => {
  const [script, setScript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!script.trim()) {
      alert('Please paste the SureFeedback script first.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create form data to submit via WordPress admin-post
      const formData = new FormData();
      formData.append('surefeedback_script', script);
      formData.append('surefeedback_script_nonce', window.sureFeedbackAdmin?.connectNonce || '');
      formData.append('action', 'surefeedback_script_submit');

      const response = await fetch(window.sureFeedbackAdmin?.admin_url + 'admin-post.php', {
        method: 'POST',
        body: formData,
      });

      // Check for redirect or success
      if (response.redirected || response.ok) {
        alert('SureFeedback script connected successfully!');
        window.location.reload(); // Reload to show connected state
      } else {
        alert('Failed to save script. Please try again.');
      }
    } catch (error) {
      console.error('Script submission error:', error);
      alert('Failed to save script. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSureFeedback = () => {
    // Use the connectUrl with site information from WordPress
    const connectUrl = window.sureFeedbackAdmin?.connectUrl || 'https://app.surefeedback.com/dashboard';
    window.open(connectUrl, '_self');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    // Simple feedback - in a real app you might use a toast
    const button = document.activeElement as HTMLButtonElement;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  };

  if (isConnected) {
    return (
      <Container className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <Title tag="h3" size="sm" className="m-0">
            {__('SureFeedback Connected', 'ph-child')}
          </Title>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {__('Your site is successfully connected to SureFeedback. The feedback widget is now active on your website.', 'ph-child')}
        </p>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ExternalLink className="w-4 h-4" />}
            iconPosition="right"
            onClick={openSureFeedback}
          >
            {__('Open SureFeedback Dashboard', 'ph-child')}
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-500" />
        <Title tag="h3" size="sm" className="m-0">
          {__('Connect to SureFeedback', 'ph-child')}
        </Title>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        {__('Follow these steps to connect your WordPress site to SureFeedback:', 'ph-child')}
      </p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            1
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Click the button below</strong> to open SureFeedback and automatically connect your site:
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
              iconPosition="right"
              onClick={openSureFeedback}
              className="w-full mb-2"
            >
              {__('🚀 Connect to SureFeedback', 'ph-child')}
            </Button>
            <p className="text-xs text-blue-700">
              This will open SureFeedback with your site information pre-filled for easy connection.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            2
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <strong>Login to SureFeedback</strong> (if not already logged in) and approve the connection when prompted.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
          <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            3
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <strong>Automatic setup complete!</strong> You'll be redirected back here with SureFeedback connected and the commenting widget active.
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            4
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-3">{setupInstructions.step4}</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {__('Paste SureFeedback Integration Script:', 'ph-child')}
                </label>
                <textarea
                  className="w-full h-24 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="<script>
// Paste your SureFeedback integration script here
// It should look something like:
// (function() { ... })();
</script>"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting || !script.trim()}
                className="w-full"
              >
                {isSubmitting ? __('Connecting...', 'ph-child') : __('Connect SureFeedback', 'ph-child')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-md">
        <p className="mb-1">
          <strong>{__('Note:', 'ph-child')}</strong> {__('The script you paste will be automatically added to all pages of your website.', 'ph-child')}
        </p>
        <p>
          {__('Make sure you copy the complete script including the', 'ph-child')} <code>&lt;script&gt;</code> {__('tags.', 'ph-child')}
        </p>
      </div>
    </Container>
  );
};

export default SureFeedbackConnection;