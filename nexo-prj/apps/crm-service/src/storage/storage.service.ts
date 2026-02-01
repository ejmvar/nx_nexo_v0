import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  StorageAdapter,
  StorageConfig,
  FileServiceType,
  UploadOptions,
  UploadResult,
  UploadedFile,
} from './storage.types';
import { LocalStorageAdapter } from './adapters/local.adapter';

/**
 * Storage Service
 * Factory service that creates and manages storage adapters
 * Provides a unified interface for file operations across different backends
 */
@Injectable()
export class StorageService {
  private adapter: StorageAdapter;
  private config: StorageConfig;

  constructor(private configService: ConfigService) {
    this.initializeAdapter();
  }

  /**
   * Initialize storage adapter based on environment configuration
   */
  private initializeAdapter(): void {
    const storageType = this.configService.get<FileServiceType>(
      'FILE_STORAGE_TYPE',
      'local',
    );

    this.config = {
      type: storageType,
      name: this.configService.get<string>(
        'FILE_STORAGE_NAME',
        'nexo-local-storage',
      ),
      id: this.configService.get<string>('FILE_STORAGE_ID'),
      description: this.configService.get<string>('FILE_STORAGE_DESC'),
      config: {
        basePath: this.configService.get<string>('FILE_STORAGE_BASE_PATH'),
        // Add more backend-specific config as needed
      },
    };

    this.adapter = this.createAdapter(this.config);
    console.log(`Storage service initialized with type: ${storageType}`);
  }

  /**
   * Factory method to create appropriate storage adapter
   */
  private createAdapter(config: StorageConfig): StorageAdapter {
    switch (config.type) {
      case 'local':
        return new LocalStorageAdapter(config);

      case 's3':
        // TODO: Implement S3StorageAdapter
        throw new Error('S3 storage adapter not yet implemented');

      case 'minio':
        // TODO: Implement MinIOStorageAdapter
        throw new Error('MinIO storage adapter not yet implemented');

      case 'azure':
        // TODO: Implement AzureStorageAdapter
        throw new Error('Azure storage adapter not yet implemented');

      case 'gcp':
        // TODO: Implement GCPStorageAdapter
        throw new Error('GCP storage adapter not yet implemented');

      case 'rustfs':
        // TODO: Implement RustFSStorageAdapter
        throw new Error('RustFS storage adapter not yet implemented');

      case 'cloudflare':
        // TODO: Implement CloudflareStorageAdapter
        throw new Error('Cloudflare R2 storage adapter not yet implemented');

      case 'backblaze':
        // TODO: Implement BackblazeStorageAdapter
        throw new Error('Backblaze B2 storage adapter not yet implemented');

      case 'custom':
        // TODO: Allow custom adapter injection
        throw new Error('Custom storage adapter not configured');

      default:
        throw new Error(`Unknown storage type: ${config.type}`);
    }
  }

  /**
   * Upload a file using the configured storage adapter
   */
  async upload(
    file: UploadedFile,
    options: UploadOptions,
  ): Promise<UploadResult> {
    return this.adapter.upload(file, options);
  }

  /**
   * Download a file using the configured storage adapter
   */
  async download(filePath: string): Promise<Buffer> {
    return this.adapter.download(filePath);
  }

  /**
   * Delete a file using the configured storage adapter
   */
  async delete(filePath: string): Promise<void> {
    return this.adapter.delete(filePath);
  }

  /**
   * Get URL for a file using the configured storage adapter
   */
  getUrl(filePath: string): string {
    return this.adapter.getUrl(filePath);
  }

  /**
   * Check if a file exists using the configured storage adapter
   */
  async exists(filePath: string): Promise<boolean> {
    return this.adapter.exists(filePath);
  }

  /**
   * Get current storage configuration
   */
  getConfig(): StorageConfig {
    return this.config;
  }
}
