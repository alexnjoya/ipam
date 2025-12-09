import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, create a generic error
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return { success: true, data: undefined as T };
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default BaseApi;

