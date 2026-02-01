import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { UploadedFile } from '../storage/storage.types';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';
import * as crypto from 'crypto';

/**
 * Files Service
 * Handles file storage operations with database tracking
 */
@Injectable()
export class FilesService {
  constructor(
    private db: DatabaseService,
    private storageService: StorageService,
  ) {}

  /**
   * Upload a file and store metadata in database
   */
  async uploadFile(
    file: UploadedFile,
    dto: UploadFileDto,
    accountId: string,
    userId: string,
  ) {
    // Upload to storage backend
    const uploadResult = await this.storageService.upload(file, {
      accountId,
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      category: dto.file_category,
      isPublic: dto.is_public,
      userId,
    });

    // Store metadata in database
    const fileRecord = await this.db.query(
      `INSERT INTO files (
        id, account_id, filename, stored_filename, mime_type, size_bytes,
        file_service_type, file_service_name, file_service_id, file_service_desc,
        file_path, file_url,
        entity_type, entity_id,
        file_category, file_tags,
        uploaded_by, description, is_public, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12,
        $13, $14,
        $15, $16,
        $17, $18, $19, $20,
        NOW(), NOW()
      ) RETURNING *`,
      [
        crypto.randomUUID(),
        accountId,
        file.originalname,
        uploadResult.storedFilename,
        uploadResult.mimeType,
        uploadResult.size,
        uploadResult.serviceMetadata.file_service_type,
        uploadResult.serviceMetadata.file_service_name,
        uploadResult.serviceMetadata.file_service_id,
        uploadResult.serviceMetadata.file_service_desc,
        uploadResult.filePath,
        uploadResult.fileUrl,
        dto.entity_type,
        dto.entity_id,
        dto.file_category,
        dto.file_tags || [],
        userId,
        dto.description,
        dto.is_public || false,
        'active',
      ],
    );

    return fileRecord.rows[0];
  }

  /**
   * Search and list files with pagination
   */
  async searchFiles(dto: SearchFilesDto, accountId: string) {
    const { page = 1, limit = 20 } = dto;
    const offset = (page - 1) * limit;

    let whereConditions = ['f.account_id = $1', 'f.deleted_at IS NULL'];
    const params: any[] = [accountId];
    let paramIndex = 2;

    // Add filters
    if (dto.entity_type) {
      whereConditions.push(`f.entity_type = $${paramIndex}`);
      params.push(dto.entity_type);
      paramIndex++;
    }

    if (dto.entity_id) {
      whereConditions.push(`f.entity_id = $${paramIndex}`);
      params.push(dto.entity_id);
      paramIndex++;
    }

    if (dto.file_category) {
      whereConditions.push(`f.file_category = $${paramIndex}`);
      params.push(dto.file_category);
      paramIndex++;
    }

    if (dto.uploaded_by) {
      whereConditions.push(`f.uploaded_by = $${paramIndex}`);
      params.push(dto.uploaded_by);
      paramIndex++;
    }

    if (dto.mime_type) {
      whereConditions.push(`f.mime_type ILIKE $${paramIndex}`);
      params.push(`%${dto.mime_type}%`);
      paramIndex++;
    }

    if (dto.status) {
      whereConditions.push(`f.status = $${paramIndex}`);
      params.push(dto.status);
      paramIndex++;
    }

    if (dto.is_public !== undefined) {
      whereConditions.push(`f.is_public = $${paramIndex}`);
      params.push(dto.is_public);
      paramIndex++;
    }

    if (dto.search) {
      whereConditions.push(
        `(f.filename ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`,
      );
      params.push(`%${dto.search}%`);
      paramIndex++;
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM files f
      WHERE ${whereConditions.join(' AND ')}
    `;

    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    // Data query
    const dataQuery = `
      SELECT 
        f.*,
        u.username as uploaded_by_username
      FROM files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY f.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, params);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, accountId: string) {
    const result = await this.db.query(
      `SELECT f.*, u.username as uploaded_by_username
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.id = $1 AND f.account_id = $2 AND f.deleted_at IS NULL`,
      [fileId, accountId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    return result.rows[0];
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string, accountId: string, userId?: string) {
    const fileRecord = await this.getFileById(fileId, accountId);

    // Check access permissions
    if (!fileRecord.is_public) {
      // Private files require the user to be the uploader or have appropriate permissions
      // This will be enhanced when we integrate full RBAC
      if (userId && fileRecord.uploaded_by !== userId) {
        // For now, allow same account access
        // TODO: Add proper RBAC check here
      }
    }

    // Download from storage
    const buffer = await this.storageService.download(fileRecord.file_path);

    return {
      buffer,
      filename: fileRecord.filename,
      mimeType: fileRecord.mime_type,
      size: fileRecord.size_bytes,
    };
  }

  /**
   * Soft delete a file
   */
  async deleteFile(fileId: string, accountId: string, userId: string) {
    const fileRecord = await this.getFileById(fileId, accountId);

    // Check ownership or permissions
    // TODO: Add proper RBAC check here
    if (fileRecord.uploaded_by !== userId) {
      throw new ForbiddenException('You do not have permission to delete this file');
    }

    // Soft delete in database
    await this.db.query(
      `UPDATE files 
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [fileId],
    );

    // Optionally delete from storage (or mark for cleanup)
    // For now, we keep the file in storage for recovery
    // await this.storageService.delete(fileRecord.file_path);

    return { success: true, message: 'File deleted successfully' };
  }

  /**
   * Update file metadata
   */
  async updateFile(
    fileId: string,
    accountId: string,
    userId: string,
    updates: Partial<{ description: string; file_category: string; file_tags: string[]; is_public: boolean }>,
  ) {
    const fileRecord = await this.getFileById(fileId, accountId);

    // Check ownership or permissions
    if (fileRecord.uploaded_by !== userId) {
      throw new ForbiddenException('You do not have permission to update this file');
    }

    const setClauses: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIndex}`);
      params.push(updates.description);
      paramIndex++;
    }

    if (updates.file_category !== undefined) {
      setClauses.push(`file_category = $${paramIndex}`);
      params.push(updates.file_category);
      paramIndex++;
    }

    if (updates.file_tags !== undefined) {
      setClauses.push(`file_tags = $${paramIndex}`);
      params.push(updates.file_tags);
      paramIndex++;
    }

    if (updates.is_public !== undefined) {
      setClauses.push(`is_public = $${paramIndex}`);
      params.push(updates.is_public);
      paramIndex++;
    }

    if (setClauses.length === 1) {
      return fileRecord; // No updates
    }

    params.push(fileId);
    const result = await this.db.query(
      `UPDATE files 
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params,
    );

    return result.rows[0];
  }
}
