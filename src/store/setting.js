import { create } from 'zustand';
import settingsService from '../services/settingsService.js';

export const useSettingsStore = create((set, get) => ({
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
  availableRoles: [],
  loading: false,
  saving: false,
  errors: {},
  activeTab: 'general',

  isConnected: () => {
    const { connection } = get();
    return connection.ph_child_id &&
           connection.ph_child_api_key &&
           connection.ph_child_access_token &&
           connection.ph_child_parent_url;
  },

  disconnectUrl: () => {
    if (typeof window !== 'undefined' && window.sureFeedbackAdmin) {
      const nonce = window.sureFeedbackAdmin.disconnect_nonce;
      const adminUrl = window.sureFeedbackAdmin.admin_url;
      return `${adminUrl}options-general.php?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=${nonce}`;
    }
    return '';
  },

  loadSettings: async () => {
    set({ loading: true, errors: {} });

    try {
      const response = await settingsService.getSettings();
      if (response.success && response.data) {
        set({
          general: { ...get().general, ...(response.data.general || {}) },
          connection: { ...get().connection, ...(response.data.connection || {}) },
          whiteLabel: { ...get().whiteLabel, ...(response.data.whiteLabel || {}) },
          connectionStatus: { ...get().connectionStatus, ...(response.data.connectionStatus || {}) },
          availableRoles: response.data.availableRoles || [],
        });
      }
    } catch (error) {
      set({
        errors: { general: 'Failed to load settings. Please refresh the page.' },
      });
    } finally {
      set({ loading: false });
    }
  },

  saveGeneralSettings: async () => {
    set({ saving: true, errors: {} });

    try {
      const { general } = get();
      const response = await settingsService.saveGeneralSettings(general);
      if (!response.success) {
        set({
          errors: response.errors || { general: response.message || 'Save failed' },
        });
        return false;
      }
      return true;
    } catch (error) {
      set({
        errors: { general: 'Failed to save settings. Please try again.' },
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  saveConnectionSettings: async () => {
    set({ saving: true, errors: {} });

    try {
      const { connection } = get();
      const response = await settingsService.saveConnectionSettings(connection);
      if (!response.success) {
        set({
          errors: response.errors || { connection: response.message || 'Save failed' },
        });
        return false;
      }

      if (response.data?.connectionStatus) {
        set({
          connectionStatus: { ...get().connectionStatus, ...response.data.connectionStatus },
        });
      }

      return true;
    } catch (error) {
      set({
        errors: { connection: 'Failed to save settings. Please try again.' },
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  saveWhiteLabelSettings: async () => {
    set({ saving: true, errors: {} });

    try {
      const { whiteLabel } = get();
      const response = await settingsService.saveWhiteLabelSettings(whiteLabel);
      if (!response.success) {
        set({
          errors: response.errors || { whiteLabel: response.message || 'Save failed' },
        });
        return false;
      }
      return true;
    } catch (error) {
      set({
        errors: { whiteLabel: 'Failed to save settings. Please try again.' },
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  manualImport: async (importData) => {
    set({ saving: true, errors: {} });

    try {
      const response = await settingsService.manualImport(importData);
      if (!response.success) {
        set({
          errors: response.errors || { connection: response.message || 'Import failed' },
        });
        return false;
      }

      set({
        connection: {
          ...get().connection,
          ph_child_id: importData.project_id,
          ph_child_api_key: importData.api_key,
          ph_child_access_token: importData.access_token,
          ph_child_parent_url: importData.parent_url,
          ph_child_signature: importData.signature,
        },
        connectionStatus: {
          ...get().connectionStatus,
          ...(response.data?.connectionStatus || {}),
        },
      });

      return true;
    } catch (error) {
      set({
        errors: { connection: 'Failed to import settings. Please try again.' },
      });
      return false;
    } finally {
      set({ saving: false });
    }
  },

  testConnection: async () => {
    set({ loading: true, errors: {} });

    try {
      const { connection } = get();
      const response = await settingsService.testConnection(connection);
      if (response.success && response.data) {
        set({
          connectionStatus: { ...get().connectionStatus, ...response.data },
        });
        return true;
      } else {
        set({
          errors: { connection: response.message || 'Connection test failed' },
        });
        return false;
      }
    } catch (error) {
      set({
        errors: { connection: 'Failed to test connection. Please try again.' },
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, errors: {} });
  },

  clearErrors: () => {
    set({ errors: {} });
  },

  updateRoleSelection: (roleName, selected) => {
    const { general } = get();
    const roles = [...general.ph_child_role_can_comment];
    
    if (selected && !roles.includes(roleName)) {
      roles.push(roleName);
    } else if (!selected) {
      const index = roles.indexOf(roleName);
      if (index > -1) {
        roles.splice(index, 1);
      }
    }

    set({
      general: {
        ...general,
        ph_child_role_can_comment: roles,
      },
    });
  },

  updateGeneral: (updates) => {
    set((state) => ({
      general: { ...state.general, ...updates },
    }));
  },

  updateConnection: (updates) => {
    set((state) => ({
      connection: { ...state.connection, ...updates },
    }));
  },

  updateWhiteLabel: (updates) => {
    set((state) => ({
      whiteLabel: { ...state.whiteLabel, ...updates },
    }));
  },

  updateState: (updates) => {
    set((state) => ({ ...state, ...updates }));
  },
}));

export default useSettingsStore;
