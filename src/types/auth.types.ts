export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'readonly';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface UpdateProfileData {
  email?: string;
  username?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

