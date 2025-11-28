import React from 'react';
import { __ } from '@wordpress/i18n';
import { Switch } from '../ui/switch.jsx';

/**
 * Commenting Section Component
 * 
 * Displays commenting settings with toggle switches
 */
const CommentingSection = ({ 
  allowSiteVisitors = false, 
  onToggleSiteVisitors,
  allowDashboardCommenting = false,
  onToggleDashboardCommenting 
}) => {
  return (
    <div className="space-y-6">
      {/* Allow Site Visitors */}
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-6">
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            {__('Allow Site Visitors', 'surefeedback')}
          </h4>
          <p className="text-sm text-gray-600">
            {__('Allow the site visitors to view and add comments on your site without access token.', 'surefeedback')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            checked={allowSiteVisitors}
            onCheckedChange={onToggleSiteVisitors || (() => {})}
          />
        </div>
      </div>

      {/* Dashboard Commenting */}
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-6">
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            {__('Dashboard Commenting', 'surefeedback')}
          </h4>
          <p className="text-sm text-gray-600">
            {__('Allow commenting in your site\'s WordPress dashboard area', 'surefeedback')}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Switch
            checked={allowDashboardCommenting}
            onCheckedChange={onToggleDashboardCommenting || (() => {})}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentingSection;

