import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixtures for NEXO CRM E2E tests
 * Provides authenticated API contexts and helper functions
 */

interface TestFixtures {
  // Authenticated request contexts
  adminContext: any;
  managerContext: any;
  employeeContext: any;
  clientContext: any;
  
  // Helper functions
  registerUser: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  loginUser: (email: string, password: string) => Promise<string>;
  createAuthContext: (token: string) => any;
}

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  // Helper to register a new user
  registerUser: async ({ request }, use) => {
    const registerFn = async (email: string, password: string, firstName: string, lastName: string) => {
      const timestamp = Date.now();
      const username = `user_${timestamp}`;
      const accountName = `Test Account ${timestamp}`;
      const accountSlug = `test-account-${timestamp}`;
      
      const response = await request.post('/api/auth/register', {
        data: {
          email,
          password,
          firstName,
          lastName,
          username,
          accountName,
          accountSlug,
        },
      });
      
      expect(response.ok()).toBeTruthy();
      return await response.json();
    };
    
    await use(registerFn);
  },
  
  // Helper to login and get JWT token
  loginUser: async ({ request }, use) => {
    const loginFn = async (email: string, password: string) => {
      const response = await request.post('/api/auth/login', {
        data: { email, password },
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      return data.accessToken || data.access_token || data.token;
    };
    
    await use(loginFn);
  },
  
  // Helper to create authenticated request context
  createAuthContext: async ({ request }, use) => {
    const createContextFn = (token: string) => {
      return {
        get: (url: string) => request.get(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        post: (url: string, data: any) => request.post(url, {
          data,
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        put: (url: string, data: any) => request.put(url, {
          data,
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        delete: (url: string) => request.delete(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      };
    };
    
    await use(createContextFn);
  },
  
  // Pre-authenticated Admin context
  adminContext: async ({ request, loginUser, createAuthContext }, use) => {
    // Use existing admin or create one
    const adminEmail = 'admin@acme.com';
    const adminPassword = 'Admin123!';
    
    try {
      const token = await loginUser(adminEmail, adminPassword);
      const context = createAuthContext(token);
      await use(context);
    } catch (error) {
      console.warn('Admin user does not exist or wrong credentials');
      await use(null);
    }
  },
  
  // Pre-authenticated Manager context
  managerContext: async ({ request, registerUser, loginUser, createAuthContext }, use) => {
    const managerEmail = `manager-${Date.now()}@test.com`;
    const managerPassword = 'Manager123!';
    
    try {
      await registerUser(managerEmail, managerPassword, 'Test', 'Manager');
      const token = await loginUser(managerEmail, managerPassword);
      
      // TODO: Assign Manager role via API (if role assignment endpoint exists)
      
      const context = createAuthContext(token);
      await use(context);
    } catch (error) {
      console.error('Failed to create Manager context:', error);
      await use(null);
    }
  },
  
  // Pre-authenticated Employee context
  employeeContext: async ({ request, registerUser, loginUser, createAuthContext }, use) => {
    const employeeEmail = `employee-${Date.now()}@test.com`;
    const employeePassword = 'Employee123!';
    
    try {
      await registerUser(employeeEmail, employeePassword, 'Test', 'Employee');
      const token = await loginUser(employeeEmail, employeePassword);
      
      // TODO: Assign Employee role via API
      
      const context = createAuthContext(token);
      await use(context);
    } catch (error) {
      console.error('Failed to create Employee context:', error);
      await use(null);
    }
  },
  
  // Pre-authenticated Client context
  clientContext: async ({ request, registerUser, loginUser, createAuthContext }, use) => {
    const clientEmail = `client-${Date.now()}@test.com`;
    const clientPassword = 'Client123!';
    
    try {
      await registerUser(clientEmail, clientPassword, 'Test', 'Client');
      const token = await loginUser(clientEmail, clientPassword);
      
      // TODO: Assign Client role via API
      
      const context = createAuthContext(token);
      await use(context);
    } catch (error) {
      console.error('Failed to create Client context:', error);
      await use(null);
    }
  },
});

export { expect };
