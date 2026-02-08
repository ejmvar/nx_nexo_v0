/**
 * E2E Tests for File Operations
 * Tests file upload, download, delete, and entity associations
 */

import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const API_BASE = 'http://localhost:3002/api';
const AUTH_API = 'http://localhost:3001/api/auth';
const CRM_API = 'http://localhost:3003/api';

// Test credentials
const TEST_USER = {
  email: 'admin@techflow.test',
  password: 'test123',
};

// Helper: Login and get token
async function login(request: any) {
  const response = await request.post(`${AUTH_API}/login`, {
    data: TEST_USER,
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.accessToken).toBeTruthy();
  return data.accessToken;
}

// Helper: Create test file buffer
function createTestFile(filename: string, sizeMB: number = 0.1): Buffer {
  const sizeBytes = Math.floor(sizeMB * 1024 * 1024);
  const content = crypto.randomBytes(sizeBytes);
  return content;
}

// Helper: Upload file using FormData
async function uploadFile(request: any, token: string, file: { name: string; buffer: Buffer }, options: any = {}) {
  const formData: any = {
    file: {
      name: file.name,
      mimeType: options.mimeType || 'application/octet-stream',
      buffer: file.buffer,
    },
  };

  // Add optional fields as form fields (not file fields)
  if (options.category) formData.category = options.category;
  if (options.entityType) formData.entityType = options.entityType;
  if (options.entityId) formData.entityId = options.entityId;
  if (options.isPublic !== undefined) formData.isPublic = String(options.isPublic);

  const response = await request.post(`${CRM_API}/files/upload`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    multipart: formData,
  });

  return response;
}

test.describe('File Operations', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // Login before each test
    authToken = await login(request);
  });

  test('should upload a file successfully', async ({ request }) => {
    const testFile = {
      name: 'test-upload.txt',
      buffer: Buffer.from('Test file content for upload'),
    };

    const response = await uploadFile(request, authToken, testFile, {
      category: 'document',
      isPublic: 'false',
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('filename', testFile.name);
    expect(data).toHaveProperty('size_bytes');
    expect(data).toHaveProperty('mime_type');
    expect(data).toHaveProperty('file_path');
    expect(data.file_category).toBe('document');
  });

  test('should list uploaded files', async ({ request }) => {
    // Upload a test file first
    const testFile = {
      name: 'test-list.txt',
      buffer: Buffer.from('Test file for listing'),
    };

    await uploadFile(request, authToken, testFile, { category: 'document' });

    // List files
    const response = await request.get(`${CRM_API}/files`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);
    
    // Verify file structure
    const file = data.data[0];
    expect(file).toHaveProperty('id');
    expect(file).toHaveProperty('filename');
    expect(file).toHaveProperty('size_bytes');
    expect(file).toHaveProperty('created_at');
  });

  test('should download an uploaded file', async ({ request }) => {
    // Upload a test file
    const testFile = {
      name: 'test-download.txt',
      buffer: Buffer.from('Test file content for download'),
    };

    const uploadResponse = await uploadFile(request, authToken, testFile, { category: 'document' });
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    // Download the file
    const downloadResponse = await request.get(`${CRM_API}/files/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(downloadResponse.ok()).toBeTruthy();
    const downloadedContent = await downloadResponse.body();
    
    // Verify content matches
    expect(downloadedContent.toString()).toBe(testFile.buffer.toString());
  });

  test('should delete a file', async ({ request }) => {
    // Upload a test file
    const testFile = {
      name: 'test-delete.txt',
      buffer: Buffer.from('Test file to delete'),
    };

    const uploadResponse = await uploadFile(request, authToken, testFile, { category: 'document' });
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    // Delete the file
    const deleteResponse = await request.delete(`${CRM_API}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(deleteResponse.ok()).toBeTruthy();

    // Verify file is deleted (404 on get)
    const getResponse = await request.get(`${CRM_API}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(getResponse.status()).toBe(404);
  });

  test('should associate file with a client', async ({ request }) => {
    // Get first client
    const clientsResponse = await request.get(`${CRM_API}/clients`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(clientsResponse.ok()).toBeTruthy();
    const clientsData = await clientsResponse.json();
    expect(clientsData.data.length).toBeGreaterThan(0);
    const clientId = clientsData.data[0].id;

    // Upload file associated with client
    const testFile = {
      name: 'client-document.pdf',
      buffer: Buffer.from('Client document content'),
    };

    const response = await uploadFile(request, authToken, testFile, {
      category: 'document',
      entityType: 'client',
      entityId: clientId,
      isPublic: 'false',
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.entity_type).toBe('client');
    expect(data.entity_id).toBe(clientId);
    expect(data.file_category).toBe('document');
  });

  test('should filter files by entity type', async ({ request }) => {
    // Get first client and project
    const [clientsResponse, projectsResponse] = await Promise.all([
      request.get(`${CRM_API}/clients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
      request.get(`${CRM_API}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    ]);

    expect(clientsResponse.ok()).toBeTruthy();
    expect(projectsResponse.ok()).toBeTruthy();
    
    const clientsData = await clientsResponse.json();
    const projectsData = await projectsResponse.json();
    
    expect(clientsData.data.length).toBeGreaterThan(0);
    expect(projectsData.data.length).toBeGreaterThan(0);
    
    const clientId = clientsData.data[0].id;
    const projectId = projectsData.data[0].id;

    // Upload files for different entities
    await uploadFile(request, authToken, 
      { name: 'client-file.txt', buffer: Buffer.from('Client file') },
      { entityType: 'client', entityId: clientId, category: 'document' }
    );

    await uploadFile(request, authToken, 
      { name: 'project-file.txt', buffer: Buffer.from('Project file') },
      { entityType: 'project', entityId: projectId, category: 'document' }
    );

    // Filter by client entity type
    const clientFilesResponse = await request.get(`${CRM_API}/files?entity_type=client&entity_id=${clientId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(clientFilesResponse.ok()).toBeTruthy();
    const clientFiles = await clientFilesResponse.json();
    
    expect(Array.isArray(clientFiles.data)).toBeTruthy();
    expect(clientFiles.data.length).toBeGreaterThan(0);
    
    // All files should be for client entity
    clientFiles.data.forEach((file: any) => {
      expect(file.entity_type).toBe('client');
      expect(file.entity_id).toBe(clientId);
    });
  });

  test('should filter files by category', async ({ request }) => {
    // Upload files with different categories
    await uploadFile(request, authToken, 
      { name: 'image.jpg', buffer: Buffer.from('Image content') },
      { category: 'image' }
    );

    await uploadFile(request, authToken, 
      { name: 'document.pdf', buffer: Buffer.from('Document content') },
      { category: 'document' }
    );

    // Filter by image category
    const imageFilesResponse = await request.get(`${CRM_API}/files?file_category=image`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(imageFilesResponse.ok()).toBeTruthy();
    const imageFiles = await imageFilesResponse.json();
    
    expect(Array.isArray(imageFiles.data)).toBeTruthy();
    
    // All files should be image category
    imageFiles.data.forEach((file: any) => {
      expect(file.file_category).toBe('image');
    });
  });

  test('should reject file upload without authentication', async ({ request }) => {
    const testFile = {
      name: 'unauthorized.txt',
      buffer: Buffer.from('Should fail'),
    };

    const response = await request.post(`${CRM_API}/files/upload`, {
      multipart: {
        file: {
          name: testFile.name,
          mimeType: 'text/plain',
          buffer: testFile.buffer,
        },
      },
    });

    expect(response.status()).toBe(401);
  });

  test.skip('should reject files larger than max size', async ({ request }) => {
    // Create a 60MB file (exceeds 50MB limit)
    const largeFile = {
      name: 'large-file.bin',
      buffer: createTestFile('large-file.bin', 60),
    };

    const response = await uploadFile(request, authToken, largeFile, { category: 'document' });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.message).toContain('size');
  });

  test('should get file metadata', async ({ request }) => {
    // Upload a test file
    const testFile = {
      name: 'test-metadata.txt',
      buffer: Buffer.from('Test file for metadata'),
    };

    const uploadResponse = await uploadFile(request, authToken, testFile, { category: 'document' });
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    // Get file metadata
    const metadataResponse = await request.get(`${CRM_API}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(metadataResponse.ok()).toBeTruthy();
    const metadata = await metadataResponse.json();
    
    expect(metadata).toHaveProperty('id', fileId);
    expect(metadata).toHaveProperty('filename', testFile.name);
    expect(metadata).toHaveProperty('size_bytes');
    expect(metadata).toHaveProperty('mime_type');
    expect(metadata).toHaveProperty('file_path');
    expect(metadata).toHaveProperty('created_at');
  });

  test('should update file metadata', async ({ request }) => {
    // Upload a test file
    const testFile = {
      name: 'test-update.txt',
      buffer: Buffer.from('Test file for metadata update'),
    };

    const uploadResponse = await uploadFile(request, authToken, testFile, { category: 'document' });
    expect(uploadResponse.ok()).toBeTruthy();
    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    // Update file metadata
    const updateResponse = await request.patch(`${CRM_API}/files/${fileId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        file_category: 'attachment',
        is_public: true,
      },
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updatedData = await updateResponse.json();
    
    expect(updatedData.file_category).toBe('attachment');
    expect(updatedData.is_public).toBe(true);
  });
});

test.describe('File Operations - Multi-tenant Isolation', () => {
  test.skip('should not allow access to files from different account', async ({ request }) => {
    // TODO: This test requires two different test accounts
    // Skip for now until we have multiple test accounts set up
  });
});
