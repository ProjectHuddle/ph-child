import axios, { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';
import { buildApiUrl, getApiHeaders } from './endpoints';

/**
 * HTTP Request Service
 * Handles all API requests with proper error handling and authentication
 */
class RequestService {
  /**
   * Generic request method
   */
  private async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = buildApiUrl(endpoint);
      const headers = getApiHeaders();

      let response: AxiosResponse;

      switch (method) {
        case 'GET':
          response = await axios.get(url, { headers });
          break;
        case 'POST':
          response = await axios.post(url, data, { headers });
          break;
        case 'PUT':
          response = await axios.put(url, data, { headers });
          break;
        case 'PATCH':
          response = await axios.patch(url, data, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers });
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      return response.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  /**
   * GET plugin request
   */
  async getplugin<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'GET');
  }

  /**
   * POST plugin request
   */
  async postplugin<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'POST', data);
  }

  /**
   * PUT plugin request
   */
  async putplugin<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'PUT', data);
  }

  /**
   * PATCH plugin request
   */
  async patchplugin<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'PATCH', data);
  }

  /**
   * DELETE plugin request
   */
  async deleteplugin<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, 'DELETE');
  }

  // Legacy method names for backward compatibility (deprecated)
  /**
   * @deprecated Use getplugin instead
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.getplugin<T>(endpoint);
  }

  /**
   * @deprecated Use postplugin instead
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.postplugin<T>(endpoint, data);
  }

  /**
   * @deprecated Use putplugin instead
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.putplugin<T>(endpoint, data);
  }

  /**
   * @deprecated Use deleteplugin instead
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.deleteplugin<T>(endpoint);
  }
}

export const requestService = new RequestService();