import { test, expect } from './fixtures';

/**
 * Authentication E2E Tests
 * Tests user registration, login, profile management
 */

test.describe('Authentication API', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `test-${timestamp}@nexo.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };
  
  let accessToken: string;

  test('should register a new user successfully', async ({ registerUser }) => {
    const result = await registerUser(
      testUser.email,
      testUser.password,
      testUser.firstName,
      testUser.lastName
    );
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email', testUser.email);
    expect(result).toHaveProperty('accountId');
  });

  test('should fail to register with duplicate email', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: {
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        username: testUser.email.split('@')[0],
      },
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('should login with valid credentials', async ({ loginUser }) => {
    const token = await loginUser(testUser.email, testUser.password);
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(50);
    
    accessToken = token;
  });

  test('should fail to login with invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: 'WrongPassword123!',
      },
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('should get user profile with valid token', async ({ request }) => {
    const response = await request.get('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const profile = await response.json();
    
    expect(profile).toHaveProperty('email', testUser.email);
    expect(profile).toHaveProperty('firstName', testUser.firstName);
    expect(profile).toHaveProperty('lastName', testUser.lastName);
  });

  test('should fail to access profile without token', async ({ request }) => {
    const response = await request.get('/api/auth/profile');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('should fail to access profile with invalid token', async ({ request }) => {
    const response = await request.get('/auth/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
      },
    });
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('should update user profile', async ({ request }) => {
    const updatedData = {
      firstName: 'Updated',
      lastName: 'Name',
    };
    
    const response = await request.put('/auth/profile', {
      data: updatedData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const updated = await response.json();
    
    expect(updated).toHaveProperty('firstName', updatedData.firstName);
    expect(updated).toHaveProperty('lastName', updatedData.lastName);
  });

  test('should validate password requirements', async ({ request }) => {
    const weakPasswords = [
      { password: '123', desc: 'too short' },
      { password: 'password', desc: 'no numbers or special chars' },
      { password: '12345678', desc: 'no letters' },
    ];
    
    for (const { password, desc } of weakPasswords) {
      const response = await request.post('/api/auth/register', {
        data: {
          email: `weak-${Date.now()}@test.com`,
          password,
          firstName: 'Test',
          lastName: 'User',
          username: `weak-${Date.now()}`,
        },
      });
      
      // Should fail validation (400 or 422)
      expect([400, 422]).toContain(response.status());
    }
  });
});

test.describe('JWT Token Behavior', () => {
  let testToken: string;
  
  test.beforeAll(async ({ registerUser, loginUser }) => {
    const email = `jwt-test-${Date.now()}@nexo.com`;
    await registerUser(email, 'Password123!', 'JWT', 'Test');
    testToken = await loginUser(email, 'Password123!');
  });

  test('should accept Bearer token in Authorization header', async ({ request }) => {
    const response = await request.get('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${testToken}` },
    });
    
    expect(response.ok()).toBeTruthy();
  });

  test('should reject token without Bearer prefix', async ({ request }) => {
    const response = await request.get('/api/auth/profile', {
      headers: { 'Authorization': testToken },
    });
    
    expect(response.ok()).toBeFalsy();
  });

  test('should reject malformed tokens', async ({ request }) => {
    const malformedTokens = [
      'Bearer ',
      'Bearer invalidtoken',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
    ];
    
    for (const token of malformedTokens) {
      const response = await request.get('/auth/profile', {
        headers: { 'Authorization': token },
      });
      
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(401);
    }
  });
});
