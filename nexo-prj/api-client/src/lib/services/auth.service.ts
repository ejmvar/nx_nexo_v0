import { ApiClient, ApiResponse } from '../api-client.js';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> {
    return this.apiClient.post<AuthTokens>('/auth/login', credentials);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.apiClient.get<UserProfile>('/auth/profile');
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.apiClient.put<UserProfile>('/auth/profile', profile);
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/auth/change-password', data);
  }
}