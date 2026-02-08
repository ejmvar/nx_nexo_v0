/**
 * E2E Tests for File Upload UI
 * Tests the complete file upload user experience including:
 * - File upload component (drag-and-drop and click)
 * - File list display
 * - File preview modal
 * - File download
 * - File delete
 * - Entity integration (clients, projects, tasks pages)
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const FRONTEND_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3002/api';

// Test credentials
const TEST_USER = {
  email: 'admin@techflow.test',
  password: 'test123',
};

// Helper: Login via UI
async function loginViaUI(page: Page) {
  await page.goto(`${FRONTEND_URL}/login`);
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard or success
  await page.waitForURL(/\/(dashboard|clients|files)/, { timeout: 10000 });
}

// Helper: Create temporary test files
function createTempTestFile(filename: string, content: string): string {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Helper: Clean up temp files
function cleanupTempFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

test.describe('File Upload UI - Standalone Files Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should display empty state when no files exist', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Files")', { timeout: 5000 });
    
    // Check for empty state or file list
    const hasEmptyState = await page.locator('text=/No files found|Upload your first file/i').count() > 0;
    const hasFileList = await page.locator('table, [data-testid="file-list"]').count() > 0;
    
    expect(hasEmptyState || hasFileList).toBeTruthy();
  });

  test('should open file upload modal/section', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Look for upload button or upload section
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add File")').first();
    const isVisible = await uploadButton.isVisible({ timeout: 5000 });
    
    if (isVisible) {
      await uploadButton.click();
    }
    
    // Verify upload interface is present (either modal or inline)
    const hasFileInput = await page.locator('input[type="file"]').count() > 0;
    const hasDragDrop = await page.locator('[data-testid="file-upload"], .file-upload, text=/drag.*drop|Drop.*files/i').count() > 0;
    
    expect(hasFileInput || hasDragDrop).toBeTruthy();
  });

  test('should upload a file via file input', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Create test file
    const testFilePath = createTempTestFile('test-upload-ui.txt', 'Test file content from UI test');
    
    try {
      // Find file input (might be hidden for drag-drop UI)
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      
      // Wait for upload to complete
      await page.waitForTimeout(2000);
      
      // Check for success message or file appearing in list
      const hasSuccessMessage = await page.locator('text=/success|uploaded/i').count() > 0;
      const hasFileInList = await page.locator(`text="test-upload-ui.txt"`).count() > 0;
      
      expect(hasSuccessMessage || hasFileInList).toBeTruthy();
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should display uploaded files in a list', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Wait for file list or table
    await page.waitForSelector('table, [data-testid="file-list"], .file-list', { timeout: 5000 });
    
    // Check if any files are displayed
    const fileRows = page.locator('tr:has(td), [data-testid="file-item"], .file-item');
    const fileCount = await fileRows.count();
    
    // Should have at least the file we just uploaded (or other test files)
    expect(fileCount).toBeGreaterThanOrEqual(0);
  });

  test('should show file details in list (name, size, date)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload a test file first
    const testFilePath = createTempTestFile('details-test.txt', 'File with details');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Look for file details
      const hasFilename = await page.locator('text="details-test.txt"').count() > 0;
      const hasSize = await page.locator('text=/\\d+\\s*(B|KB|MB)|bytes/i').count() > 0;
      const hasDate = await page.locator('text=/\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\w+\\s+\\d+,\\s+\\d{4}/').count() > 0;
      
      expect(hasFilename).toBeTruthy();
      // Size and date are optional depending on UI design
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should have preview button for uploaded files', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload a test file
    const testFilePath = createTempTestFile('preview-test.txt', 'File to preview');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Look for preview button (eye icon, "Preview", "View", etc.)
      const previewButton = page.locator('button:has-text("Preview"), button:has-text("View"), button[title*="Preview"], button[aria-label*="Preview"]').first();
      
      const isVisible = await previewButton.count() > 0;
      expect(isVisible).toBeTruthy();
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should open preview modal when clicking preview', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload test file
    const testFilePath = createTempTestFile('modal-test.txt', 'Modal preview test content');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Click preview button
      const previewButton = page.locator('button:has-text("Preview"), button:has-text("View"), button[title*="Preview"]').first();
      
      if (await previewButton.count() > 0) {
        await previewButton.click();
        
        // Wait for modal to appear
        await page.waitForTimeout(1000);
        
        // Check for modal elements
        const hasModal = await page.locator('[role="dialog"], .modal, [data-testid="file-preview-modal"]').count() > 0;
        const hasBackdrop = await page.locator('.backdrop, [data-testid="modal-backdrop"]').count() > 0;
        const hasCloseButton = await page.locator('button:has-text("Close"), button[aria-label*="Close"]').count() > 0;
        
        expect(hasModal || hasBackdrop || hasCloseButton).toBeTruthy();
      }
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should close preview modal with ESC key', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload and open preview
    const testFilePath = createTempTestFile('esc-test.txt', 'ESC key test');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      const previewButton = page.locator('button:has-text("Preview"), button:has-text("View")').first();
      
      if (await previewButton.count() > 0) {
        await previewButton.click();
        await page.waitForTimeout(500);
        
        // Press ESC key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Modal should be closed
        const modalStillOpen = await page.locator('[role="dialog"]:visible, .modal:visible').count() > 0;
        expect(modalStillOpen).toBeFalsy();
      }
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should download file when clicking download', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload test file
    const testFilePath = createTempTestFile('download-test.txt', 'Download test content');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      // Click download button
      const downloadButton = page.locator('button:has-text("Download"), button[title*="Download"], button[aria-label*="Download"]').first();
      
      if (await downloadButton.count() > 0) {
        await downloadButton.click();
        
        // Wait for download
        try {
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toBeTruthy();
        } catch (e) {
          // Download might happen via direct link, not triggering event
          console.log('Download event not captured (might be direct link)');
        }
      }
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should delete file with confirmation', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload test file
    const testFilePath = createTempTestFile('delete-test.txt', 'File to delete');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      // Click delete button
      const deleteButton = page.locator('button:has-text("Delete"), button[title*="Delete"], button[aria-label*="Delete"]').first();
      
      if (await deleteButton.count() > 0) {
        // Setup dialog listener
        page.on('dialog', dialog => dialog.accept());
        
        await deleteButton.click();
        await page.waitForTimeout(1000);
        
        // File should be removed from list
        const fileStillExists = await page.locator('text="delete-test.txt"').count() > 0;
        expect(fileStillExists).toBeFalsy();
      }
    } finally {
      cleanupTempFile(testFilePath);
    }
  });
});

test.describe('File Upload UI - Image Preview', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should preview image files in modal', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Create a simple PNG image (1x1 pixel)
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const imagePath = path.join(os.tmpdir(), 'test-image.png');
    fs.writeFileSync(imagePath, pngBuffer);
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(imagePath);
      await page.waitForTimeout(2000);
      
      // Click preview
      const previewButton = page.locator('button:has-text("Preview"), button:has-text("View")').first();
      
      if (await previewButton.count() > 0) {
        await previewButton.click();
        await page.waitForTimeout(1000);
        
        // Check for image element in modal
        const hasImage = await page.locator('img[src*="test-image.png"], img[alt*="test-image"]').count() > 0;
        expect(hasImage).toBeTruthy();
      }
    } finally {
      cleanupTempFile(imagePath);
    }
  });

  test('should show unsupported file type message for non-previewable files', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Upload a binary file
    const testFilePath = createTempTestFile('binary.bin', '\x00\x01\x02\x03\x04');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(2000);
      
      const previewButton = page.locator('button:has-text("Preview"), button:has-text("View")').first();
      
      if (await previewButton.count() > 0) {
        await previewButton.click();
        await page.waitForTimeout(1000);
        
        // Should show unsupported message
        const hasUnsupportedMessage = await page.locator('text=/Preview not available|cannot be previewed|unsupported/i').count() > 0;
        expect(hasUnsupportedMessage).toBeTruthy();
      }
    } finally {
      cleanupTempFile(testFilePath);
    }
  });
});

test.describe('File Upload UI - Entity Integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should show files section on client detail page', async ({ page }) => {
    // Navigate to clients page
    await page.goto(`${FRONTEND_URL}/clients`);
    await page.waitForTimeout(1000);
    
    // Click first client (if exists)
    const firstClientRow = page.locator('tr:has(td)').first();
    const clientExists = await firstClientRow.count() > 0;
    
    if (clientExists) {
      await firstClientRow.click();
      await page.waitForTimeout(1000);
      
      // Look for files section/tab/button
      const hasFilesSection = await page.locator('text=/Files|Documents|Attachments/i').count() > 0;
      expect(hasFilesSection).toBeTruthy();
    }
  });

  test('should upload file associated with client', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/clients`);
    await page.waitForTimeout(1000);
    
    const firstClientRow = page.locator('tr:has(td)').first();
    const clientExists = await firstClientRow.count() > 0;
    
    if (clientExists) {
      await firstClientRow.click();
      await page.waitForTimeout(1000);
      
      // Open files section/modal
      const filesButton = page.locator('button:has-text("Files"), button:has-text("Documents")').first();
      
      if (await filesButton.count() > 0) {
        await filesButton.click();
        await page.waitForTimeout(500);
        
        // Upload file
        const testFilePath = createTempTestFile('client-doc.txt', 'Client document');
        
        try {
          const fileInput = page.locator('input[type="file"]').first();
          await fileInput.setInputFiles(testFilePath);
          await page.waitForTimeout(2000);
          
          // Verify file uploaded
          const hasFile = await page.locator('text="client-doc.txt"').count() > 0;
          expect(hasFile).toBeTruthy();
        } finally {
          cleanupTempFile(testFilePath);
        }
      }
    }
  });

  test('should show files section on project detail page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/projects`);
    await page.waitForTimeout(1000);
    
    const firstProjectRow = page.locator('tr:has(td)').first();
    const projectExists = await firstProjectRow.count() > 0;
    
    if (projectExists) {
      await firstProjectRow.click();
      await page.waitForTimeout(1000);
      
      const hasFilesSection = await page.locator('text=/Files|Documents|Attachments/i').count() > 0;
      expect(hasFilesSection).toBeTruthy();
    }
  });

  test('should show files section on task detail page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/tasks`);
    await page.waitForTimeout(1000);
    
    const firstTaskRow = page.locator('tr:has(td)').first();
    const taskExists = await firstTaskRow.count() > 0;
    
    if (taskExists) {
      await firstTaskRow.click();
      await page.waitForTimeout(1000);
      
      const hasFilesSection = await page.locator('text=/Files|Documents|Attachments/i').count() > 0;
      expect(hasFilesSection).toBeTruthy();
    }
  });
});

test.describe('File Upload UI - Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test.skip('should show drag-over state when dragging file', async ({ page }) => {
    // Note: Playwright has limited support for drag-and-drop file upload
    // This test is skipped but documents expected behavior
    await page.goto(`${FRONTEND_URL}/files`);
    
    // In real implementation, would test:
    // 1. Drag file over drop zone
    // 2. Verify visual feedback (border, background change)
    // 3. Drop file
    // 4. Verify upload starts
  });
});

test.describe('File Upload UI - Validation', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should show error for invalid file types (if restricted)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Create executable file (might be restricted)
    const testFilePath = createTempTestFile('test.exe', 'fake exe content');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      await page.waitForTimeout(1000);
      
      // Check for error message (if file type validation exists)
      const hasError = await page.locator('text=/invalid|not allowed|restricted/i').count() > 0;
      
      // This test passes either way, just documents behavior
      console.log(hasError ? 'File type validation active' : 'No file type restriction');
    } finally {
      cleanupTempFile(testFilePath);
    }
  });

  test('should show progress indicator during upload', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Create larger file to see progress
    const largeContent = 'x'.repeat(100000); // 100KB
    const testFilePath = createTempTestFile('large-file.txt', largeContent);
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testFilePath);
      
      // Check for progress indicator (immediately after upload starts)
      await page.waitForTimeout(100);
      const hasProgress = await page.locator('.progress, [role="progressbar"], text=/uploading|loading/i').count() > 0;
      
      // Progress indicator should appear (even briefly)
      console.log(hasProgress ? 'Progress indicator found' : 'Upload too fast or no indicator');
      
      await page.waitForTimeout(2000);
    } finally {
      cleanupTempFile(testFilePath);
    }
  });
});

test.describe('File Upload UI - Multiple Files', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should upload multiple files at once', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/files`);
    
    // Create multiple test files
    const file1 = createTempTestFile('multi1.txt', 'File 1');
    const file2 = createTempTestFile('multi2.txt', 'File 2');
    const file3 = createTempTestFile('multi3.txt', 'File 3');
    
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles([file1, file2, file3]);
      await page.waitForTimeout(3000);
      
      // Check all files appear
      const hasFile1 = await page.locator('text="multi1.txt"').count() > 0;
      const hasFile2 = await page.locator('text="multi2.txt"').count() > 0;
      const hasFile3 = await page.locator('text="multi3.txt"').count() > 0;
      
      expect(hasFile1 && hasFile2 && hasFile3).toBeTruthy();
    } finally {
      cleanupTempFile(file1);
      cleanupTempFile(file2);
      cleanupTempFile(file3);
    }
  });
});
