// Authentication utility functions
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export interface User {
  userId: string;
  email: string;
  username: string;
  role?: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  full_name: string;
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
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  },

  // Login user
  async login(data: LoginData): Promise<AuthTokens> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const tokens = await response.json();
    this.setTokens(tokens);
    return tokens;
  },

  // Logout user
  async logout(): Promise<void> {
    const token = this.getAccessToken();
    
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
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
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const { access_token } = await response.json();
      this.setAccessToken(access_token);
      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  },

  // Token management
  setTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      
      // Decode and store user info
      try {
        const decoded = jwtDecode<User>(tokens.access_token);
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

// API client with automatic token injection
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Try to refresh token if unauthorized
  if (response.status === 401 && token) {
    const newToken = await authService.refreshToken();
    
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
}
