import { API_CONFIG, API_ENDPOINTS, getServiceUrl } from './api-config';

// API Error class
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Request helper with error handling
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

// API Client
export const apiClient = {
  // GET request
  get: async <T>(url: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(url, {
      ...options,
      method: 'GET',
    });
  },

  // POST request
  post: async <T>(
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put: async <T>(
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete: async <T>(url: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(url, {
      ...options,
      method: 'DELETE',
    });
  },
};

// Health check utility
export async function checkHealth() {
  const results = {
    authService: false,
    crmService: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await apiClient.get(API_ENDPOINTS.HEALTH.AUTH_SERVICE);
    results.authService = true;
  } catch (error) {
    console.error('Auth Service health check failed:', error);
  }

  try {
    await apiClient.get(API_ENDPOINTS.HEALTH.CRM_SERVICE);
    results.crmService = true;
  } catch (error) {
    console.error('CRM Service health check failed:', error);
  }

  return results;
}

export default apiClient;
