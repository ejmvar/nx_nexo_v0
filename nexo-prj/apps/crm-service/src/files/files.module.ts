import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { StorageModule } from '../storage/storage.module';
import { DatabaseModule } from '../database/database.module';

/**
 * Files Module
 * Handles file upload, storage, and management
 */
@Module({
  imports: [
    DatabaseModule,
    StorageModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
