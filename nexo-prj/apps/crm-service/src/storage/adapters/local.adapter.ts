import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  StorageAdapter,
  UploadOptions,
  UploadResult,
  StorageConfig,
  ServiceMetadata,
} from '../storage.types';

/**
 * Local Filesystem Storage Adapter
 * Stores files in ./media directory with organized structure
 */
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly baseDir: string;
  private readonly config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    // Default to ./media, but allow override via config
    this.baseDir = config.config?.basePath || path.join(process.cwd(), 'media');
    this.initializeBaseDirectory();
  }

  /**
   * Ensure base directory exists on initialization
   */
  private async initializeBaseDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      console.log(`Local storage initialized at: ${this.baseDir}`);
    } catch (error) {
      console.error('Failed to initialize local storage directory:', error);
      throw error;
    }
  }

  /**
   * Upload a file to local filesystem
   * Structure: uploads/{year}/{month}/{accountId}/{entityType}/{entityId}/{filename}
   */
  async upload(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Build directory structure
    const pathParts = [
      'uploads',
      year,
      month,
      options.accountId,
    ];

    if (options.entityType) {
      pathParts.push(options.entityType);
      if (options.entityId) {
        pathParts.push(options.entityId);
      }
    }

    const dirPath = path.join(this.baseDir, ...pathParts);

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Generate unique filename
    const storedFilename = this.generateFilename(file.originalname);
    const fullPath = path.join(dirPath, storedFilename);

    // Write file to disk
    await fs.writeFile(fullPath, file.buffer);

    // Calculate relative path for portability
    const relativePath = path.join(...pathParts, storedFilename);

    // Build service metadata
    const serviceMetadata: ServiceMetadata = {
      file_service_type: 'local',
      file_service_name: this.config.name,
      file_service_id: this.baseDir,
      file_service_desc: JSON.stringify({
        basePath: this.baseDir,
        structure: 'uploads/year/month/account/entity/entityId',
      }),
    };

    return {
      storedFilename,
      filePath: relativePath,
      fileUrl: undefined, // Local files don't have direct URLs
      size: file.size,
      mimeType: file.mimetype,
      serviceMetadata,
    };
  }

  /**
   * Download a file from local filesystem
   */
  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filePath);
    
    // Validate path is within base directory (security)
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(this.baseDir))) {
      throw new Error('Invalid file path: attempt to access outside storage directory');
    }

    try {
      return await fs.readFile(fullPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Delete a file from local filesystem
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    
    // Validate path is within base directory (security)
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(path.normalize(this.baseDir))) {
      throw new Error('Invalid file path: attempt to access outside storage directory');
    }

    try {
      await fs.unlink(fullPath);
      
      // Optional: Clean up empty parent directories
      await this.cleanupEmptyDirectories(path.dirname(fullPath));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File already deleted, not an error
        return;
      }
      throw error;
    }
  }

  /**
   * Get URL for a file (local storage returns relative path)
   */
  getUrl(filePath: string): string {
    // For local storage, return a path that can be served via API
    // Actual URL would be constructed by the API endpoint
    return `/files/download/${encodeURIComponent(filePath)}`;
  }

  /**
   * Check if a file exists in local filesystem
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filePath);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate unique filename with timestamp and random suffix
   * Format: {originalName}-{timestamp}-{random}.{ext}
   */
  private generateFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    const ext = path.extname(originalFilename);
    const nameWithoutExt = path.basename(originalFilename, ext);
    
    // Sanitize filename: remove unsafe characters
    const safeName = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .substring(0, 50); // Limit length

    return `${safeName}-${timestamp}-${random}${ext}`;
  }

  /**
   * Clean up empty directories after file deletion
   */
  private async cleanupEmptyDirectories(dirPath: string): Promise<void> {
    // Don't delete the base directory or uploads root
    if (dirPath === this.baseDir || dirPath === path.join(this.baseDir, 'uploads')) {
      return;
    }

    try {
      const entries = await fs.readdir(dirPath);
      if (entries.length === 0) {
        await fs.rmdir(dirPath);
        // Recursively clean parent
        await this.cleanupEmptyDirectories(path.dirname(dirPath));
      }
    } catch {
      // Ignore errors in cleanup
    }
  }
}
