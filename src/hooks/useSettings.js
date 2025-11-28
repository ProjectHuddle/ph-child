/**
 * useSettings Hook
 * 
 * React hook for managing settings state
 * 
 * @package SureFeedback
 */

import { useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService.js';
import { toast } from '@/components/ui/toast';
import { __ } from '@wordpress/i18n';

/**
 * useSettings hook
 * 
 * @returns {Object} Settings state and methods
 */
export const useSettings = () => {
  const [state, setState] = useState({
    general: {
      ph_child_role_can_comment: [],
      ph_child_guest_comments_enabled: false,
      ph_child_admin: false,
    },
    connection: {
      ph_child_id: '',
      ph_child_api_key: '',
      ph_child_access_token: '',
      ph_child_parent_url: '',
      ph_child_signature: '',
      ph_child_installed: false,
    },
    whiteLabel: {
      ph_child_plugin_name: '',
      ph_child_plugin_description: '',
      ph_child_plugin_author: '',
      ph_child_plugin_author_url: '',
      ph_child_plugin_link: '',
    },
    connectionStatus: {
      connected: false,
    },
    loading: false,
    saving: false,
    errors: {},
    activeTab: 'general',
  });

  const [availableRoles, setAvailableRoles] = useState([]);

  /**
   * Check if connected
   */
  const isConnected = state.connection.ph_child_id &&
                     state.connection.ph_child_api_key &&
                     state.connection.ph_child_access_token &&
                     state.connection.ph_child_parent_url;

  /**
   * Load settings
   */
  const loadSettings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      const response = await settingsService.getSettings();
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          general: { ...prev.general, ...(response.data.general || {}) },
          connection: { ...prev.connection, ...(response.data.connection || {}) },
          whiteLabel: { ...prev.whiteLabel, ...(response.data.whiteLabel || {}) },
          connectionStatus: { ...prev.connectionStatus, ...(response.data.connectionStatus || {}) },
        }));

        if (response.data.availableRoles) {
          setAvailableRoles(response.data.availableRoles);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setState(prev => ({
        ...prev,
        errors: { general: __('Failed to load settings. Please refresh the page.', 'surefeedback') },
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  /**
   * Save general settings
   */
  const saveGeneralSettings = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, errors: {} }));

    try {
      const response = await settingsService.saveGeneralSettings(state.general);
      if (!response.success) {
        setState(prev => ({
          ...prev,
          errors: response.errors || { general: response.message || __('Save failed', 'surefeedback') },
        }));
        return false;
      }
      toast.success(__('Settings saved successfully', 'surefeedback'));
      return true;
    } catch (error) {
      console.error('Failed to save general settings:', error);
      setState(prev => ({
        ...prev,
        errors: { general: __('Failed to save settings. Please try again.', 'surefeedback') },
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  }, [state.general]);

  /**
   * Save connection settings
   */
  const saveConnectionSettings = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, errors: {} }));

    try {
      const response = await settingsService.saveConnectionSettings(state.connection);
      if (!response.success) {
        setState(prev => ({
          ...prev,
          errors: response.errors || { connection: response.message || __('Save failed', 'surefeedback') },
        }));
        return false;
      }

      if (response.data?.connectionStatus) {
        setState(prev => ({
          ...prev,
          connectionStatus: { ...prev.connectionStatus, ...response.data.connectionStatus },
        }));
      }

      toast.success(__('Connection settings saved successfully', 'surefeedback'));
      return true;
    } catch (error) {
      console.error('Failed to save connection settings:', error);
      setState(prev => ({
        ...prev,
        errors: { connection: __('Failed to save settings. Please try again.', 'surefeedback') },
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  }, [state.connection]);

  /**
   * Save white label settings
   */
  const saveWhiteLabelSettings = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, errors: {} }));

    try {
      const response = await settingsService.saveWhiteLabelSettings(state.whiteLabel);
      if (!response.success) {
        setState(prev => ({
          ...prev,
          errors: response.errors || { whiteLabel: response.message || __('Save failed', 'surefeedback') },
        }));
        return false;
      }
      toast.success(__('White label settings saved successfully', 'surefeedback'));
      return true;
    } catch (error) {
      console.error('Failed to save white label settings:', error);
      setState(prev => ({
        ...prev,
        errors: { whiteLabel: __('Failed to save settings. Please try again.', 'surefeedback') },
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  }, [state.whiteLabel]);

  /**
   * Manual import
   */
  const manualImport = useCallback(async (importData) => {
    setState(prev => ({ ...prev, saving: true, errors: {} }));

    try {
      const response = await settingsService.manualImport(importData);
      if (!response.success) {
        setState(prev => ({
          ...prev,
          errors: response.errors || { connection: response.message || __('Import failed', 'surefeedback') },
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        connection: {
          ...prev.connection,
          ph_child_id: importData.project_id,
          ph_child_api_key: importData.api_key,
          ph_child_access_token: importData.access_token,
          ph_child_parent_url: importData.parent_url,
          ph_child_signature: importData.signature,
        },
        connectionStatus: {
          ...prev.connectionStatus,
          ...(response.data?.connectionStatus || {}),
        },
      }));

      toast.success(__('Connection imported successfully', 'surefeedback'));
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      setState(prev => ({
        ...prev,
        errors: { connection: __('Failed to import settings. Please try again.', 'surefeedback') },
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  }, []);

  /**
   * Test connection
   */
  const testConnection = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, errors: {} }));

    try {
      const response = await settingsService.testConnection(state.connection);
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          connectionStatus: { ...prev.connectionStatus, ...response.data },
        }));
        toast.success(__('Connection test successful', 'surefeedback'));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          errors: { connection: response.message || __('Connection test failed', 'surefeedback') },
        }));
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setState(prev => ({
        ...prev,
        errors: { connection: __('Failed to test connection. Please try again.', 'surefeedback') },
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.connection]);

  /**
   * Update state
   */
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  /**
   * Update role selection
   */
  const updateRoleSelection = useCallback((roleName, selected) => {
    setState(prev => {
      const roles = [...prev.general.ph_child_role_can_comment];
      if (selected && !roles.includes(roleName)) {
        roles.push(roleName);
      } else if (!selected) {
        const index = roles.indexOf(roleName);
        if (index > -1) {
          roles.splice(index, 1);
        }
      }
      return {
        ...prev,
        general: {
          ...prev.general,
          ph_child_role_can_comment: roles,
        },
      };
    });
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    state,
    availableRoles,
    isConnected,
    loadSettings,
    saveGeneralSettings,
    saveConnectionSettings,
    saveWhiteLabelSettings,
    manualImport,
    testConnection,
    updateState,
    clearErrors,
    updateRoleSelection,
  };
};

export default useSettings;

