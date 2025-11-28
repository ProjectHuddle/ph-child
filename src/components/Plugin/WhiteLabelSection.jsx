import React from 'react';
import { __ } from '@wordpress/i18n';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';

/**
 * White Label Section Component
 * 
 * Displays white label settings with form fields
 */
const WhiteLabelSection = ({
  pluginName = '',
  onPluginNameChange,
  pluginDescription = '',
  onPluginDescriptionChange,
  pluginAuthor = '',
  onPluginAuthorChange,
  pluginAuthorUrl = '',
  onPluginAuthorUrlChange,
  pluginLink = '',
  onPluginLinkChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Plugin Name */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="ph_child_plugin_name" 
          className="text-sm font-medium text-gray-900 block mb-1.5"
        >
          {__('Plugin Name', 'surefeedback')}
        </Label>
        <Input
          id="ph_child_plugin_name"
          value={pluginName}
          onChange={(e) => onPluginNameChange && onPluginNameChange(e.target.value)}
          placeholder={__('Enter plugin name', 'surefeedback')}
          className="w-full !border-gray-300 focus-visible:!border-[#4253ff] focus-visible:ring-[#4253ff]/20"
        />
      </div>

      {/* Plugin Description */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="ph_child_plugin_description" 
          className="text-sm font-medium text-gray-900 block mb-1.5"
        >
          {__('Plugin Description', 'surefeedback')}
        </Label>
        <Textarea
          id="ph_child_plugin_description"
          value={pluginDescription}
          onChange={(e) => onPluginDescriptionChange && onPluginDescriptionChange(e.target.value)}
          rows={4}
          placeholder={__('Enter plugin description', 'surefeedback')}
          className="w-full resize-none !border-gray-300 focus-visible:!border-[#4253ff] focus-visible:ring-[#4253ff]/20 min-h-[100px]"
        />
      </div>

      {/* Author Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plugin Author */}
        <div className="space-y-2.5">
          <Label 
            htmlFor="ph_child_plugin_author" 
            className="text-sm font-medium text-gray-900 block mb-1.5"
          >
            {__('Plugin Author', 'surefeedback')}
          </Label>
          <Input
            id="ph_child_plugin_author"
            value={pluginAuthor}
            onChange={(e) => onPluginAuthorChange && onPluginAuthorChange(e.target.value)}
            placeholder={__('Enter plugin author', 'surefeedback')}
            className="w-full !border-gray-300 focus-visible:!border-[#4253ff] focus-visible:ring-[#4253ff]/20"
          />
        </div>

        {/* Author URL */}
        <div className="space-y-2.5">
          <Label 
            htmlFor="ph_child_plugin_author_url" 
            className="text-sm font-medium text-gray-900 block mb-1.5"
          >
            {__('Plugin Author URL', 'surefeedback')}
          </Label>
          <Input
            id="ph_child_plugin_author_url"
            type="url"
            value={pluginAuthorUrl}
            onChange={(e) => onPluginAuthorUrlChange && onPluginAuthorUrlChange(e.target.value)}
            placeholder={__('https://example.com', 'surefeedback')}
            className="w-full !border-gray-300 focus-visible:!border-[#4253ff] focus-visible:ring-[#4253ff]/20"
          />
        </div>
      </div>

      {/* Plugin URL */}
      <div className="space-y-2.5">
        <Label 
          htmlFor="ph_child_plugin_link" 
          className="text-sm font-medium text-gray-900 block mb-1.5"
        >
          {__('Plugin Link', 'surefeedback')}
        </Label>
        <Input
          id="ph_child_plugin_link"
          type="url"
          value={pluginLink}
          onChange={(e) => onPluginLinkChange && onPluginLinkChange(e.target.value)}
          placeholder={__('https://example.com/plugin', 'surefeedback')}
          className="w-full border-gray-300 focus-visible:border-[#4253ff] focus-visible:ring-[#4253ff]/20"
        />
      </div>
    </div>
  );
};

export default WhiteLabelSection;

