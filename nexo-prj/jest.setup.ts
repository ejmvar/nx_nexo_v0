// Jest setup file to load test environment variables
// This runs before all tests to ensure environment configuration is available

import { config } from 'dotenv';
import { resolve } from 'path';

// Mock pg module BEFORE loading any modules that use it
jest.mock('pg');

// Load test environment variables from .env.test
const envPath = resolve(__dirname, '.env.test');
config({ path: envPath });

// Ensure critical environment variables have defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || '3001';
process.env.API_GATEWAY_PORT = process.env.API_GATEWAY_PORT || '3002';
process.env.CRM_SERVICE_PORT = process.env.CRM_SERVICE_PORT || '3003';
process.env.STOCK_SERVICE_PORT = process.env.STOCK_SERVICE_PORT || '3004';
process.env.SALES_SERVICE_PORT = process.env.SALES_SERVICE_PORT || '3005';

console.log('Test environment loaded from .env.test');
