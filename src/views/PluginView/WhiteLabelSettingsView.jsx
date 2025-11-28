import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { Loader2 } from 'lucide-react';
import { toast } from '../../components/ui/toast.jsx';
import useSettings from '../../hooks/useSettings.js';

/**
 * White Label Settings View
 * 
 * Converted from Vue to React
 */
const WhiteLabelSettingsView = () => {
  const {
    state,
    saveWhiteLabelSettings,
    updateState,
    clearErrors,
  } = useSettings();

  const handleInputChange = (field, value) => {
    updateState({
      whiteLabel: {
        ...state.whiteLabel,
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    const success = await saveWhiteLabelSettings();
    if (success) {
      // Settings saved successfully
    }
  };

  return (
    <div className="white-label-settings space-y-6 max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {__('White Label', 'surefeedback')}
        </h1>
        <p className="text-base text-gray-600">
          {__('Customize the SureFeedback interface with your own branding by labels to create a seamless client experience.', 'surefeedback')}
        </p>
      </div>

      {/* Branding Form */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-8 space-y-6">
          {/* Plugin Name */}
          <div className="space-y-2">
            <Label htmlFor="ph_child_plugin_name" className="text-sm font-medium text-gray-900">
              {__('Plugin Name', 'surefeedback')}
            </Label>
            <Input
              id="ph_child_plugin_name"
              value={state.whiteLabel.ph_child_plugin_name}
              onChange={(e) => handleInputChange('ph_child_plugin_name', e.target.value)}
              disabled={state.saving}
              placeholder={__('Enter plugin name', 'surefeedback')}
              className="w-full h-10"
            />
          </div>

          {/* Plugin Description */}
          <div className="space-y-2">
            <Label htmlFor="ph_child_plugin_description" className="text-sm font-medium text-gray-900">
              {__('Plugin Description', 'surefeedback')}
            </Label>
            <Textarea
              id="ph_child_plugin_description"
              value={state.whiteLabel.ph_child_plugin_description}
              onChange={(e) => handleInputChange('ph_child_plugin_description', e.target.value)}
              rows={3}
              disabled={state.saving}
              placeholder={__('Enter plugin description', 'surefeedback')}
              className="w-full resize-none min-h-[80px]"
            />
          </div>

          {/* Author Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plugin Author */}
            <div className="space-y-2">
              <Label htmlFor="ph_child_plugin_author" className="text-sm font-medium text-gray-900">
                {__('Plugin Author', 'surefeedback')}
              </Label>
              <Input
                id="ph_child_plugin_author"
                value={state.whiteLabel.ph_child_plugin_author}
                onChange={(e) => handleInputChange('ph_child_plugin_author', e.target.value)}
                disabled={state.saving}
                placeholder={__('Enter plugin author', 'surefeedback')}
                className="w-full h-10"
              />
            </div>

            {/* Author URL */}
            <div className="space-y-2">
              <Label htmlFor="ph_child_plugin_author_url" className="text-sm font-medium text-gray-900">
                {__('Plugin Author URL', 'surefeedback')}
              </Label>
              <Input
                id="ph_child_plugin_author_url"
                type="url"
                value={state.whiteLabel.ph_child_plugin_author_url}
                onChange={(e) => handleInputChange('ph_child_plugin_author_url', e.target.value)}
                disabled={state.saving}
                placeholder={__('Enter plugin author url', 'surefeedback')}
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Plugin URL */}
          <div className="space-y-2">
            <Label htmlFor="ph_child_plugin_link" className="text-sm font-medium text-gray-900">
              {__('Plugin Link', 'surefeedback')}
            </Label>
            <Input
              id="ph_child_plugin_link"
              type="url"
              value={state.whiteLabel.ph_child_plugin_link}
              onChange={(e) => handleInputChange('ph_child_plugin_link', e.target.value)}
              disabled={state.saving}
              placeholder={__('Enter plugin link', 'surefeedback')}
              className="w-full h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={state.saving}
          size="default"
          className="h-10 px-8 bg-primary hover:bg-primary/90"
        >
          {state.saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {__('Saving...', 'surefeedback')}
            </>
          ) : (
            __('Save Changes', 'surefeedback')
          )}
        </Button>
      </div>

      {/* Error Notice */}
      {state.errors.whiteLabel && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">{state.errors.whiteLabel}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearErrors}
            className="mt-2 text-xs"
          >
            {__('Dismiss', 'surefeedback')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WhiteLabelSettingsView;

