import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for NEXO CRM
 * Tests full lifecycle: registration, auth, RBAC, CRUD, audit
 */
export default defineConfig({
  testDir: './e2e-tests',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially for API consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid race conditions
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'playwright-results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for API tests
    baseURL: 'http://localhost:3002',
    
    // Collect trace when retrying failed test
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // API testing settings
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  // Configure projects for different test suites
  projects: [
    {
      name: 'api-auth',
      testMatch: /auth\.spec\.ts/,
    },
    {
      name: 'crm-api-endpoints',
      testMatch: /crm-api-endpoints\.spec\.ts/,
      // Standalone test - uses existing test data
    },
    {
      name: 'api-crm-crud',
      testMatch: /crm-crud\.spec\.ts/,
      dependencies: ['api-auth'],
    },
    {
      name: 'api-rbac',
      testMatch: /rbac\.spec\.ts/,
      dependencies: ['api-auth'],
    },
    {
      name: 'api-audit',
      testMatch: /audit\.spec\.ts/,
      dependencies: ['api-auth'],
    },
    {
      name: 'api-full-lifecycle',
      testMatch: /full-lifecycle\.spec\.ts/,
      dependencies: ['api-auth', 'api-crm-crud', 'api-rbac'],
    },
  ],

  // Run local dev server before tests (if not already running)
  webServer: [
    {
      command: 'pnpm nx serve auth-service',
      url: 'http://localhost:3001/api/auth/health',
      timeout: 60 * 1000,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm nx serve api-gateway',
      url: 'http://localhost:3002/api/health',
      timeout: 60 * 1000,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm nx serve crm-service',
      url: 'http://localhost:3003/api/health',
      timeout: 60 * 1000,
      reuseExistingServer: true,
    },
  ],
});
