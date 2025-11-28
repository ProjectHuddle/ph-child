import React from 'react';
import { __ } from '@wordpress/i18n';
import { Checkbox } from '../ui/checkbox.jsx';
import { Label } from '../ui/label.jsx';

/**
 * User Permissions Section Component
 * 
 * Displays user role checkboxes for permissions
 */
const UserPermissionsSection = ({ roles = [], selectedRoles = [], onRoleChange, onRoleToggle }) => {
  if (!roles || roles.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        {__('No user roles available.', 'surefeedback')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {roles.map((role) => (
        <div
          key={role.name}
          className="role-card flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#4253ff] hover:bg-[#4253ff]/10 transition-all duration-200 cursor-pointer"
          onClick={() => onRoleToggle && onRoleToggle(role.name)}
        >
          <Checkbox
            id={`role-${role.name}`}
            checked={selectedRoles.includes(role.name)}
            onCheckedChange={(checked) => onRoleChange && onRoleChange(role.name, checked)}
            className="pointer-events-none"
          />
          <Label
            htmlFor={`role-${role.name}`}
            className="text-sm font-medium text-gray-900 cursor-pointer flex-1 pointer-events-none"
          >
            {role.label || role.name}
          </Label>
        </div>
      ))}
    </div>
  );
};

export default UserPermissionsSection;

