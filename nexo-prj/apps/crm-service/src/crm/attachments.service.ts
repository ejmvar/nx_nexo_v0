import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

export interface Attachment {
  id: string;
  account_id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  constructor(private db: DatabaseService) {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      if (!existsSync(this.uploadDir)) {
        await fs.mkdir(this.uploadDir, { recursive: true });
        this.logger.log(`📁 Created upload directory: ${this.uploadDir}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async upload(
    file: Express.Multer.File,
    entityType: string,
    entityId: string,
    accountId: string,
    userId: string,
    description?: string,
  ): Promise<Attachment> {
    this.logger.log(
      `📤 Upload request: file="${file.originalname}" size=${file.size} mime="${file.mimetype}" ` +
      `entity=${entityType}:${entityId} account=${accountId} user=${userId}`
    );

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.logger.warn(
        `❌ File size validation failed: ${file.size} bytes exceeds limit of ${this.maxFileSize} bytes ` +
        `(${this.maxFileSize / 1024 / 1024}MB) for file "${file.originalname}"`
      );
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Validate MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(
        `❌ MIME type validation failed: "${file.mimetype}" not in allowed list for file "${file.originalname}"`
      );
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Generate unique file name to prevent collisions
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = path.extname(file.originalname);
    const fileName = `${timestamp}-${randomString}${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Create attachment record in database
      const result = await this.db.queryWithAccount(
        accountId,
        `INSERT INTO attachments (
          account_id, entity_type, entity_id, file_name, original_name,
          file_path, file_size, mime_type, uploaded_by, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [accountId, entityType, entityId, fileName, file.originalname, 
         filePath, file.size, file.mimetype, userId, description || null]
      );

      this.logger.log(
        `✅ File uploaded successfully: id=${result.rows[0].id} file="${file.originalname}" ` +
        `stored_as="${fileName}" size=${file.size} bytes mime="${file.mimetype}" ` +
        `entity=${entityType}:${entityId} account=${accountId}`
      );

      return result.rows[0];
    } catch (error) {
      // Clean up file if database save fails
      this.logger.error(
        `❌ Upload failed for "${file.originalname}": ${error instanceof Error ? error.message : String(error)} - Rolling back file write`
      );
      try {
        await fs.unlink(filePath);
        this.logger.log(`🧹 Cleaned up orphaned file: ${filePath}`);
      } catch (unlinkError) {
        this.logger.error(
          `⚠️  Failed to clean up orphaned file ${filePath}: ${unlinkError instanceof Error ? unlinkError.message : String(unlinkError)}`
        );
      }
      throw error;
    }
  }

  async findAll(
    accountId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<Attachment[]> {
    let query = 'SELECT * FROM attachments WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (entityType) {
      paramCount++;
      query += ` AND entity_type = $${paramCount}`;
      params.push(entityType);
    }

    if (entityId) {
      paramCount++;
      query += ` AND entity_id = $${paramCount}`;
      params.push(entityId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.queryWithAccount(accountId, query, params);
    this.logger.log(
      `📋 Listed ${result.rows.length} attachments for account=${accountId} ` +
      `filters: entityType=${entityType || 'all'} entityId=${entityId || 'all'}`
    );
    return result.rows;
  }

  async findOne(id: string, accountId: string): Promise<Attachment> {
    const result = await this.db.queryWithAccount(
      accountId,
      'SELECT * FROM attachments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async download(id: string, accountId: string): Promise<{
    buffer: Buffer;
    attachment: Attachment;
  }> {
    const attachment = await this.findOne(id, accountId);

    this.logger.log(
      `⬇️  Downloading attachment: id=${id} file="${attachment.original_name}" ` +
      `size=${attachment.file_size} account=${accountId}`
    );

    try {
      const buffer = await fs.readFile(attachment.file_path);
      this.logger.log(`✅ Download successful: id=${id} bytes=${buffer.length}`);
      return { buffer, attachment };
    } catch (error) {
      this.logger.error(
        `Failed to read file ${attachment.file_path}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new NotFoundException('File not found on disk');
    }
  }

  async delete(id: string, accountId: string): Promise<void> {
    const attachment = await this.findOne(id, accountId);

    this.logger.log(
      `🗑️  Deleting attachment: id=${id} file="${attachment.original_name}" ` +
      `size=${attachment.file_size} account=${accountId}`
    );

    try {
      // Delete file from disk
      await fs.unlink(attachment.file_path);
      this.logger.log(`✅ File deleted from disk: ${attachment.file_path}`);
    } catch (error) {
      this.logger.warn(
        `⚠️  File not found on disk: ${attachment.file_path} - ${error instanceof Error ? error.message : String(error)}. ` +
        `Proceeding with database deletion.`
      );
    }

    // Delete database record
    await this.db.queryWithAccount(
      accountId,
      'DELETE FROM attachments WHERE id = $1',
      [id]
    );
    this.logger.log(
      `✅ Attachment deleted successfully: id=${id} file="${attachment.original_name}"`
    );
  }

  async getStats(accountId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byEntityType: Record<string, { count: number; size: number }>;
  }> {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT 
        entity_type,
        COUNT(*) as count,
        SUM(file_size) as total_size
      FROM attachments
      GROUP BY entity_type`,
      []
    );

    const totalResult = await this.db.queryWithAccount(
      accountId,
      `SELECT 
        COUNT(*) as total_files,
        COALESCE(SUM(file_size), 0) as total_size
      FROM attachments`,
      []
    );

    const stats = {
      totalFiles: parseInt(totalResult.rows[0]?.total_files || '0'),
      totalSize: parseInt(totalResult.rows[0]?.total_size || '0'),
      byEntityType: {} as Record<string, { count: number; size: number }>,
    };

    result.rows.forEach((row) => {
      stats.byEntityType[row.entity_type] = {
        count: parseInt(row.count),
        size: parseInt(row.total_size),
      };
    });

    return stats;
  }
}
