// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH_URL: AUTH_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${AUTH_BASE_URL}/auth/login`,
    LOGOUT: `${AUTH_BASE_URL}/auth/logout`,
    REGISTER: `${AUTH_BASE_URL}/auth/register`,
    PROFILE: `${AUTH_BASE_URL}/auth/profile`,
    REFRESH: `${AUTH_BASE_URL}/auth/refresh`,
  },
  
  // CRM endpoints (via API Gateway)
  CRM: {
    CLIENTS: `${API_BASE_URL}/api/clients`,
    EMPLOYEES: `${API_BASE_URL}/api/employees`,
    SUPPLIERS: `${API_BASE_URL}/api/suppliers`,
    PROFESSIONALS: `${API_BASE_URL}/api/professionals`,
    PROJECTS: `${API_BASE_URL}/api/projects`,
    ORDERS: `${API_BASE_URL}/api/orders`,
    TASKS: `${API_BASE_URL}/api/tasks`,
  },
  
  // Health check
  HEALTH: {
    API_GATEWAY: `${API_BASE_URL}/health`,
    AUTH_SERVICE: `${AUTH_BASE_URL}/health`,
  },
};

export default API_CONFIG;
