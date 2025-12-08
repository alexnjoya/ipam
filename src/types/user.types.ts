export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'readonly';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'readonly';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user' | 'readonly';
}

