import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type { User, LoginResponse, UpdateProfileData, ChangePasswordData } from '../types';

class AuthService extends BaseApi {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    username: string,
    email: string,
    password: string,
    role?: string
  ): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(
    data: ChangePasswordData
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
export default authService;

