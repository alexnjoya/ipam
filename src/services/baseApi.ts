import type { ApiResponse } from '../types';

// Use environment variable if set, otherwise use production server
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to production server
  return 'https://ipam-yary.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export type { ApiResponse };

class BaseApi {
  protected getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle network errors
      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON but status is OK, return success
        if (response.status >= 200 && response.status < 300) {
          return { success: true, data: undefined as T };
        }
        throw new Error('Invalid response format from server');
      }

      // Check if response indicates failure
      if (data.success === false) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond. Please try again.');
      }
      
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }
      
      // Log error for debugging
      console.error('API request error:', {
        endpoint,
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }
}

export default BaseApi;

