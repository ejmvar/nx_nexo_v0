import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
} from '@nestjs/platform-express';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { AccountId } from '../decorators/account-id.decorator.js';
import { UserId } from '../decorators/user-id.decorator.js';
import { AuditLoggerInterceptor } from '../common/interceptors/audit-logger.interceptor.js';

@Controller('attachments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditLoggerInterceptor)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @RequirePermissions('attachment:create')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('description') description: string,
    @AccountId() accountId: string,
    @UserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    return this.attachmentsService.upload(
      file,
      entityType,
      entityId,
      accountId,
      userId,
      description,
    );
  }

  @Get()
  @RequirePermissions('attachment:read')
  async findAll(
    @AccountId() accountId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.attachmentsService.findAll(accountId, entityType, entityId);
  }

  @Get('stats')
  @RequirePermissions('attachment:read')
  async getStats(@AccountId() accountId: string) {
    return this.attachmentsService.getStats(accountId);
  }

  @Get(':id')
  @RequirePermissions('attachment:read')
  async findOne(
    @Param('id') id: string,
    @AccountId() accountId: string,
  ) {
    return this.attachmentsService.findOne(id, accountId);
  }

  @Get(':id/download')
  @RequirePermissions('attachment:read')
  async download(
    @Param('id') id: string,
    @AccountId() accountId: string,
    @Res() res: Response,
  ) {
    const { buffer, attachment } = await this.attachmentsService.download(
      id,
      accountId,
    );

    res.set({
      'Content-Type': attachment.mime_type,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(
        attachment.original_name
      )}"`,
      'Content-Length': attachment.file_size,
    });

    res.send(buffer);
  }

  @Delete(':id')
  @RequirePermissions('attachment:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @AccountId() accountId: string,
  ) {
    await this.attachmentsService.delete(id, accountId);
  }
}
