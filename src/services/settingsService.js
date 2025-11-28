/**
 * Settings Service
 * 
 * Handles all settings-related API operations
 * 
 * @package SureFeedback
 */

import apiGateway from '../api/gateway.js';
import { WORDPRESS_API } from '../api/apiurls.js';

/**
 * Settings API Service
 */
class SettingsService {
  /**
   * Get all settings
   */
  async getSettings() {
    return apiGateway.get(WORDPRESS_API.BASE() + '/settings');
  }

  /**
   * Save general settings
   */
  async saveGeneralSettings(settings) {
    return apiGateway.post(WORDPRESS_API.BASE() + '/settings/general', settings, { useWpNonce: true });
  }

  /**
   * Save connection settings
   */
  async saveConnectionSettings(settings) {
    return apiGateway.post(WORDPRESS_API.BASE() + '/settings/connection', settings, { useWpNonce: true });
  }

  /**
   * Save white label settings
   */
  async saveWhiteLabelSettings(settings) {
    return apiGateway.post(WORDPRESS_API.BASE() + '/settings/white-label', settings, { useWpNonce: true });
  }

  /**
   * Manual import settings
   */
  async manualImport(importData) {
    return apiGateway.post(WORDPRESS_API.BASE() + '/settings/manual-import', importData, { useWpNonce: true });
  }

  /**
   * Test connection to parent site
   */
  async testConnection(connection) {
    return apiGateway.post(WORDPRESS_API.BASE() + '/settings/test-connection', {
      parent_url: connection.ph_child_parent_url,
      access_token: connection.ph_child_access_token,
    }, { useWpNonce: true });
  }
}

export const settingsService = new SettingsService();
export default settingsService;

