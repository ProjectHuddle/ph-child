import type {
  ApiResponse,
  GeneralSettings,
  ConnectionSettings,
  WhiteLabelSettings,
  ManualImportData,
} from '@/types';
import { requestService } from './request';
import { API_ENDPOINTS } from './endpoints';

/**
 * Settings API Service
 * Handles all settings-related API operations
 */
class SettingsService {
  /**
   * Get all settings
   */
  async getSettings(): Promise<ApiResponse> {
    return requestService.getplugin(API_ENDPOINTS.SETTINGS.GET);
  }

  /**
   * Save general settings
   */
  async saveGeneralSettings(settings: GeneralSettings): Promise<ApiResponse> {
    return requestService.postplugin(API_ENDPOINTS.SETTINGS.GENERAL, settings);
  }

  /**
   * Save connection settings
   */
  async saveConnectionSettings(settings: ConnectionSettings): Promise<ApiResponse> {
    return requestService.postplugin(API_ENDPOINTS.SETTINGS.CONNECTION, settings);
  }

  /**
   * Save white label settings
   */
  async saveWhiteLabelSettings(settings: WhiteLabelSettings): Promise<ApiResponse> {
    return requestService.postplugin(API_ENDPOINTS.SETTINGS.WHITE_LABEL, settings);
  }

  /**
   * Manual import settings
   */
  async manualImport(importData: ManualImportData): Promise<ApiResponse> {
    return requestService.postplugin(API_ENDPOINTS.SETTINGS.MANUAL_IMPORT, importData);
  }

  /**
   * Test connection to parent site
   */
  async testConnection(connection: ConnectionSettings): Promise<ApiResponse> {
    return requestService.postplugin(API_ENDPOINTS.SETTINGS.TEST_CONNECTION, {
      parent_url: connection.ph_child_parent_url,
      access_token: connection.ph_child_access_token,
    });
  }
}

export const settingsService = new SettingsService();