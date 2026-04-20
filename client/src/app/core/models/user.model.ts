export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'qa_engineer' | 'developer' | 'viewer';
  title?: string;
  department?: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  lastLogin?: Date;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  title?: string;
  department?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
