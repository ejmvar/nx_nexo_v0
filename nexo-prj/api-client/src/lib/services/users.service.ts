import { ApiClient, ApiResponse } from '../api-client.js';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UsersService {
  constructor(private apiClient: ApiClient) {}

  async getUsers(filters: UserFilters = {}): Promise<ApiResponse<PaginatedUsers>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    const endpoint = `/users${query ? `?${query}` : ''}`;

    return this.apiClient.get<PaginatedUsers>(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  async createUser(user: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>('/users', user);
  }

  async updateUser(id: string, user: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.apiClient.put<User>(`/users/${id}`, user);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/users/${id}`);
  }

  async activateUser(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>(`/users/${id}/activate`);
  }

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>(`/users/${id}/deactivate`);
  }
}