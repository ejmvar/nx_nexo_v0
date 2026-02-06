// Authentication utility functions
import { jwtDecode } from 'jwt-decode';
import { getServiceUrl } from './api-config';

// Auth service URL
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
const API_PREFIX = '/api'; // API routes start with /api

export interface User {
  userId: string;
  email: string;
  username: string;
  role?: string;
  full_name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  accountName: string;
  accountSlug: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Token storage
const TOKEN_KEY = 'nexo_access_token';
const REFRESH_TOKEN_KEY = 'nexo_refresh_token';
const USER_KEY = 'nexo_user';

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await fetch(`${AUTH_SERVICE_URL}${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(error.message || 'Registration failed');
    }

    const tokens = await response.json() as AuthTokens;
    this.setTokens(tokens);
    return tokens;
  },

  // Login user
  async login(data: LoginData): Promise<AuthTokens> {
    const response = await fetch(`${AUTH_SERVICE_URL}${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(error.message || 'Login failed');
    }

    const tokens = await response.json() as AuthTokens;
    this.setTokens(tokens);
    return tokens;
  },

  // Logout user
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    
    if (token) {
      try {
        await fetch(`${AUTH_SERVICE_URL}${API_PREFIX}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    this.clearTokens();
  },

  // Refresh access token
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}${API_PREFIX}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json() as { accessToken: string };
      this.setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  },

  // Token management
  setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      // Decode and store user info
      try {
        const decoded = jwtDecode<User>(tokens.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(decoded));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  },

  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      
      try {
        const decoded = jwtDecode<User>(token);
        localStorage.setItem(USER_KEY, JSON.stringify(decoded));
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          return null;
        }
      }
    }
    return null;
  },

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
};

// API client with automatic token injection and smart service routing
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Smart routing: Determine which service to call based on endpoint
  const serviceUrl = getServiceUrl(endpoint);
  const fullUrl = `${serviceUrl}${API_PREFIX}${endpoint}`;

  let response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Try to refresh token if unauthorized
  if (response.status === 401 && token) {
    const newToken = await authService.refreshToken();
    
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(fullUrl, {
        ...options,
        headers,
      });
    }
  }

  return response;
}
