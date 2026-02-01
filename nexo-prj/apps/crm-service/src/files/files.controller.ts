import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { AccountId } from '../decorators/account-id.decorator.js';
import { UserId } from '../decorators/user-id.decorator.js';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';
import { UpdateFileDto } from './dto/update-file.dto';

/**
 * Files Controller
 * Handles file upload, download, and management operations
 */
@Controller('files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload a file
   * POST /files/upload
   */
  @Post('upload')
  @RequirePermissions('file:write')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max file size
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @AccountId() accountId: string,
    @UserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.filesService.uploadFile(
      file,
      dto,
      accountId,
      userId,
    );
  }

  /**
   * Search and list files
   * GET /files
   */
  @Get()
  @RequirePermissions('file:read')
  async searchFiles(
    @Query() dto: SearchFilesDto,
    @AccountId() accountId: string,
  ) {
    return this.filesService.searchFiles(dto, accountId);
  }

  /**
   * Get file by ID
   * GET /files/:id
   */
  @Get(':id')
  @RequirePermissions('file:read')
  async getFile(
    @Param('id', ParseUUIDPipe) id: string,
    @AccountId() accountId: string,
  ) {
    return this.filesService.getFileById(id, accountId);
  }

  /**
   * Download file content
   * GET /files/:id/download
   */
  @Get(':id/download')
  @RequirePermissions('file:read')
  async downloadFile(
    @Param('id', ParseUUIDPipe) id: string,
    @AccountId() accountId: string,
    @UserId() userId: string,
    @Res() res: Response,
  ) {
    const result = await this.filesService.downloadFile(
      id,
      accountId,
      userId,
    );

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Length', result.size);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(result.filename)}"`,
    );

    res.send(result.buffer);
  }

  /**
   * Update file metadata
   * PATCH /files/:id
   */
  @Patch(':id')
  @RequirePermissions('file:write')
  async updateFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
    @AccountId() accountId: string,
    @UserId() userId: string,
  ) {
    return this.filesService.updateFile(
      id,
      accountId,
      userId,
      dto,
    );
  }

  /**
   * Delete a file
   * DELETE /files/:id
   */
  @Delete(':id')
  @RequirePermissions('file:delete')
  async deleteFile(
    @Param('id', ParseUUIDPipe) id: string,
    @AccountId() accountId: string,
    @UserId() userId: string,
  ) {
    return this.filesService.deleteFile(id, accountId, userId);
  }
}
