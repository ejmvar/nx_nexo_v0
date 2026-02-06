// API Client Configuration
// Direct service endpoints (no API Gateway yet)
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
const CRM_SERVICE_URL = process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:3003';

export const API_CONFIG = {
  AUTH_SERVICE_URL,
  CRM_SERVICE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Smart routing: Route requests to the correct service based on path
export function getServiceUrl(path: string): string {
  // Auth service endpoints
  if (path.startsWith('/auth') || path.startsWith('/api/auth')) {
    return AUTH_SERVICE_URL;
  }
  
  // CRM service endpoints
  if (path.startsWith('/crm') || path.startsWith('/api/')) {
    return CRM_SERVICE_URL;
  }
  
  // Default to CRM service
  return CRM_SERVICE_URL;
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${AUTH_SERVICE_URL}/api/auth/login`,
    LOGOUT: `${AUTH_SERVICE_URL}/api/auth/logout`,
    REGISTER: `${AUTH_SERVICE_URL}/api/auth/register`,
    PROFILE: `${AUTH_SERVICE_URL}/api/auth/profile`,
    REFRESH: `${AUTH_SERVICE_URL}/api/auth/refresh`,
  },
  
  // CRM endpoints
  CRM: {
    CLIENTS: `${CRM_SERVICE_URL}/api/clients`,
    EMPLOYEES: `${CRM_SERVICE_URL}/api/employees`,
    SUPPLIERS: `${CRM_SERVICE_URL}/api/suppliers`,
    PROFESSIONALS: `${CRM_SERVICE_URL}/api/professionals`,
    PROJECTS: `${CRM_SERVICE_URL}/api/projects`,
    ORDERS: `${CRM_SERVICE_URL}/api/orders`,
    TASKS: `${CRM_SERVICE_URL}/api/tasks`,
  },
  
  // Health check
  HEALTH: {
    AUTH_SERVICE: `${AUTH_SERVICE_URL}/api/auth/health`,
    CRM_SERVICE: `${CRM_SERVICE_URL}/api/health`,
  },
};

export default API_CONFIG;
