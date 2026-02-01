/**
 * Storage Service Type Definitions
 * Supports multiple storage backends (local, S3, MinIO, RustFS, etc.)
 */

/**
 * Interface for uploaded files (compatible with Express.Multer.File)
 */
export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
  fieldname?: string;
  encoding?: string;
}

export type FileServiceType =
  | 'local'       // Local filesystem (./media)
  | 's3'          // Amazon S3
  | 'minio'       // MinIO (S3-compatible)
  | 'azure'       // Azure Blob Storage
  | 'gcp'         // Google Cloud Storage
  | 'rustfs'      // Custom Rust filesystem service
  | 'cloudflare'  // Cloudflare R2
  | 'backblaze'   // Backblaze B2
  | 'custom';     // Custom implementation

/**
 * Storage configuration for initializing adapters
 */
export interface StorageConfig {
  type: FileServiceType;
  name: string;           // Service identifier (e.g., 'nexo-local-dev')
  id?: string;            // Service-specific ID (bucket, container, node)
  description?: string;   // Additional metadata
  config?: Record<string, any>;  // Backend-specific configuration
}

/**
 * Result from uploading a file
 */
export interface UploadResult {
  storedFilename: string;   // Unique filename in storage
  filePath: string;         // Relative path within storage service
  fileUrl?: string;         // Accessible URL (if applicable)
  size: number;             // File size in bytes
  mimeType: string;         // MIME type
  serviceMetadata: ServiceMetadata;
}

/**
 * Storage service metadata for database storage
 */
export interface ServiceMetadata {
  file_service_type: FileServiceType;
  file_service_name: string;
  file_service_id?: string;
  file_service_desc?: string;
}

/**
 * Options for file upload operations
 */
export interface UploadOptions {
  accountId: string;
  entityType?: string;      // 'client', 'project', 'task', etc.
  entityId?: string;        // UUID of associated entity
  category?: string;        // 'document', 'image', 'avatar', etc.
  isPublic?: boolean;       // Public access flag
  userId?: string;          // Who is uploading
}

/**
 * Storage Adapter Interface
 * All storage implementations must implement this interface
 */
export interface StorageAdapter {
  /**
   * Upload a file to storage
   */
  upload(file: UploadedFile, options: UploadOptions): Promise<UploadResult>;

  /**
   * Download a file from storage
   */
  download(filePath: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  delete(filePath: string): Promise<void>;

  /**
   * Get accessible URL for a file
   */
  getUrl(filePath: string): string;

  /**
   * Check if a file exists in storage
   */
  exists(filePath: string): Promise<boolean>;
}

/**
 * Download result with metadata
 */
export interface DownloadResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}
