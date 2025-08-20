import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import React from 'react';
import { settingsService } from '@/services/settings';
import type { 
  GeneralSettings, 
  ConnectionSettings, 
  WhiteLabelSettings, 
  ConnectionStatus,
  SettingsState 
} from '@/types';

interface SettingsStoreState extends SettingsState {
  // Additional store-specific state
  initialized: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveGeneralSettings: (settings?: Partial<GeneralSettings>) => Promise<boolean>;
  saveConnectionSettings: (settings?: Partial<ConnectionSettings>) => Promise<boolean>;
  saveWhiteLabelSettings: (settings?: Partial<WhiteLabelSettings>) => Promise<boolean>;
  testConnection: (settings?: Partial<ConnectionSettings>) => Promise<boolean>;
  
  // State updates
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateConnectionSettings: (settings: Partial<ConnectionSettings>) => void;
  updateWhiteLabelSettings: (settings: Partial<WhiteLabelSettings>) => void;
  updateConnectionStatus: (status: Partial<ConnectionStatus>) => void;
  setActiveTab: (tab: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  
  // Reset actions
  resetSettings: () => void;
  resetErrors: () => void;
}

const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  ph_child_role_can_comment: ['administrator'],
  ph_child_guest_comments_enabled: true,
  ph_child_admin: false,
};

const DEFAULT_CONNECTION_SETTINGS: ConnectionSettings = {
  ph_child_id: '',
  ph_child_api_key: '',
  ph_child_access_token: '',
  ph_child_parent_url: '',
  ph_child_signature: '',
  ph_child_installed: false,
};

const DEFAULT_WHITE_LABEL_SETTINGS: WhiteLabelSettings = {
  ph_child_plugin_name: 'SureFeedback',
  ph_child_plugin_description: '',
  ph_child_plugin_author: '',
  ph_child_plugin_author_url: '',
  ph_child_plugin_link: '',
};

const DEFAULT_CONNECTION_STATUS: ConnectionStatus = {
  connected: false,
  parent_url: undefined,
  project_id: undefined,
  last_verified: undefined,
};

export const useSettingsStore = create<SettingsStoreState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      general: { ...DEFAULT_GENERAL_SETTINGS },
      connection: { ...DEFAULT_CONNECTION_SETTINGS },
      whiteLabel: { ...DEFAULT_WHITE_LABEL_SETTINGS },
      connectionStatus: { ...DEFAULT_CONNECTION_STATUS },
      loading: false,
      saving: false,
      errors: {},
      activeTab: 'general',
      initialized: false,
      lastSaved: null,
      isDirty: false,

      // Initialize the store
      initialize: async () => {
        const state = get();
        if (state.initialized) return;
        
        try {
          await state.loadSettings();
          set((draft) => {
            draft.initialized = true;
          });
        } catch (error) {
          console.error('Failed to initialize settings store:', error);
          set((draft) => {
            draft.errors.initialization = 'Failed to load settings';
            draft.initialized = true;
          });
        }
      },

      // Load all settings from API
      loadSettings: async () => {
        set((draft) => {
          draft.loading = true;
          draft.errors = {};
        });

        try {
          const response = await settingsService.getSettings();
          
          if (response.success && response.data) {
            const { general, connection, whiteLabel, connectionStatus } = response.data;
            
            set((draft) => {
              draft.general = { ...DEFAULT_GENERAL_SETTINGS, ...general };
              draft.connection = { ...DEFAULT_CONNECTION_SETTINGS, ...connection };
              draft.whiteLabel = { ...DEFAULT_WHITE_LABEL_SETTINGS, ...whiteLabel };
              draft.connectionStatus = { ...DEFAULT_CONNECTION_STATUS, ...connectionStatus };
              draft.loading = false;
              draft.isDirty = false;
            });
          } else {
            throw new Error(response.message || 'Failed to load settings');
          }
        } catch (error) {
          console.error('Settings load error:', error);
          set((draft) => {
            draft.loading = false;
            draft.errors.load = error instanceof Error ? error.message : 'Failed to load settings';
          });
        }
      },

      // Save general settings
      saveGeneralSettings: async (settingsOverride?: Partial<GeneralSettings>) => {
        const state = get();
        const settingsToSave = settingsOverride || state.general;

        set((draft) => {
          draft.saving = true;
          draft.errors = {};
        });

        try {
          const response = await settingsService.saveGeneralSettings(settingsToSave as GeneralSettings);
          
          if (response.success) {
            set((draft) => {
              if (settingsOverride) {
                draft.general = { ...draft.general, ...settingsOverride };
              }
              draft.saving = false;
              draft.lastSaved = new Date();
              draft.isDirty = false;
            });
            return true;
          } else {
            throw new Error(response.message || 'Failed to save general settings');
          }
        } catch (error) {
          console.error('General settings save error:', error);
          set((draft) => {
            draft.saving = false;
            draft.errors.general = error instanceof Error ? error.message : 'Failed to save general settings';
          });
          return false;
        }
      },

      // Save connection settings
      saveConnectionSettings: async (settingsOverride?: Partial<ConnectionSettings>) => {
        const state = get();
        const settingsToSave = settingsOverride || state.connection;

        set((draft) => {
          draft.saving = true;
          draft.errors = {};
        });

        try {
          const response = await settingsService.saveConnectionSettings(settingsToSave as ConnectionSettings);
          
          if (response.success) {
            set((draft) => {
              if (settingsOverride) {
                draft.connection = { ...draft.connection, ...settingsOverride };
              }
              draft.saving = false;
              draft.lastSaved = new Date();
              draft.isDirty = false;
              
              // Update connection status if successful
              if (response.data?.connectionStatus) {
                draft.connectionStatus = { ...draft.connectionStatus, ...response.data.connectionStatus };
              }
            });
            return true;
          } else {
            throw new Error(response.message || 'Failed to save connection settings');
          }
        } catch (error) {
          console.error('Connection settings save error:', error);
          set((draft) => {
            draft.saving = false;
            draft.errors.connection = error instanceof Error ? error.message : 'Failed to save connection settings';
          });
          return false;
        }
      },

      // Save white label settings
      saveWhiteLabelSettings: async (settingsOverride?: Partial<WhiteLabelSettings>) => {
        const state = get();
        const settingsToSave = settingsOverride || state.whiteLabel;

        set((draft) => {
          draft.saving = true;
          draft.errors = {};
        });

        try {
          const response = await settingsService.saveWhiteLabelSettings(settingsToSave as WhiteLabelSettings);
          
          if (response.success) {
            set((draft) => {
              if (settingsOverride) {
                draft.whiteLabel = { ...draft.whiteLabel, ...settingsOverride };
              }
              draft.saving = false;
              draft.lastSaved = new Date();
              draft.isDirty = false;
            });
            return true;
          } else {
            throw new Error(response.message || 'Failed to save white label settings');
          }
        } catch (error) {
          console.error('White label settings save error:', error);
          set((draft) => {
            draft.saving = false;
            draft.errors.whiteLabel = error instanceof Error ? error.message : 'Failed to save white label settings';
          });
          return false;
        }
      },

      // Test connection
      testConnection: async (settingsOverride?: Partial<ConnectionSettings>) => {
        const state = get();
        const settingsToTest = { ...state.connection, ...settingsOverride };

        set((draft) => {
          draft.loading = true;
          draft.errors = {};
        });

        try {
          const response = await settingsService.testConnection(settingsToTest as ConnectionSettings);
          
          if (response.success) {
            set((draft) => {
              draft.loading = false;
              if (response.data?.connectionStatus) {
                draft.connectionStatus = { ...draft.connectionStatus, ...response.data.connectionStatus };
              }
            });
            return true;
          } else {
            throw new Error(response.message || 'Connection test failed');
          }
        } catch (error) {
          console.error('Connection test error:', error);
          set((draft) => {
            draft.loading = false;
            draft.errors.connection = error instanceof Error ? error.message : 'Connection test failed';
          });
          return false;
        }
      },

      // State update actions
      updateGeneralSettings: (settings: Partial<GeneralSettings>) =>
        set((draft) => {
          draft.general = { ...draft.general, ...settings };
          draft.isDirty = true;
        }),

      updateConnectionSettings: (settings: Partial<ConnectionSettings>) =>
        set((draft) => {
          draft.connection = { ...draft.connection, ...settings };
          draft.isDirty = true;
        }),

      updateWhiteLabelSettings: (settings: Partial<WhiteLabelSettings>) =>
        set((draft) => {
          draft.whiteLabel = { ...draft.whiteLabel, ...settings };
          draft.isDirty = true;
        }),

      updateConnectionStatus: (status: Partial<ConnectionStatus>) =>
        set((draft) => {
          draft.connectionStatus = { ...draft.connectionStatus, ...status };
        }),

      setActiveTab: (tab: string) =>
        set((draft) => {
          draft.activeTab = tab;
        }),

      setErrors: (errors: Record<string, string>) =>
        set((draft) => {
          draft.errors = errors;
        }),

      clearErrors: () =>
        set((draft) => {
          draft.errors = {};
        }),

      setLoading: (loading: boolean) =>
        set((draft) => {
          draft.loading = loading;
        }),

      setSaving: (saving: boolean) =>
        set((draft) => {
          draft.saving = saving;
        }),

      markDirty: () =>
        set((draft) => {
          draft.isDirty = true;
        }),

      markClean: () =>
        set((draft) => {
          draft.isDirty = false;
        }),

      // Reset actions
      resetSettings: () =>
        set((draft) => {
          draft.general = { ...DEFAULT_GENERAL_SETTINGS };
          draft.connection = { ...DEFAULT_CONNECTION_SETTINGS };
          draft.whiteLabel = { ...DEFAULT_WHITE_LABEL_SETTINGS };
          draft.connectionStatus = { ...DEFAULT_CONNECTION_STATUS };
          draft.errors = {};
          draft.isDirty = false;
        }),

      resetErrors: () =>
        set((draft) => {
          draft.errors = {};
        }),
    }))
  )
);

// Computed selectors for performance
export const useIsConnected = () => {
  return useSettingsStore((state) => state.connectionStatus.connected);
};

export const useSettingsTab = (tab: string) => {
  return useSettingsStore((state) => state.activeTab === tab);
};

export const useSettingsLoading = () => {
  return useSettingsStore((state) => ({
    loading: state.loading,
    saving: state.saving,
    isDirty: state.isDirty,
  }));
};

export const useSettingsErrors = () => {
  return useSettingsStore((state) => state.errors);
};

// Auto-save functionality
export const useAutoSave = (debounceMs: number = 2000) => {
  const { isDirty, saveGeneralSettings, saveConnectionSettings, saveWhiteLabelSettings, activeTab } = useSettingsStore();
  
  React.useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(async () => {
      switch (activeTab) {
        case 'general':
          await saveGeneralSettings();
          break;
        case 'connection':
          await saveConnectionSettings();
          break;
        case 'white_label':
          await saveWhiteLabelSettings();
          break;
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [isDirty, activeTab, debounceMs]);
};