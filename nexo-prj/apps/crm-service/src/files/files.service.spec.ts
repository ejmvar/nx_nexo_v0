import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FilesService } from './files.service';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';

describe('FilesService', () => {
  let service: FilesService;
  let databaseService: DatabaseService;
  let storageService: StorageService;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  const mockStorageService = {
    upload: jest.fn(),
    download: jest.fn(),
    delete: jest.fn(),
    getUrl: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    storageService = module.get<StorageService>(StorageService);
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'test.pdf',
      buffer: Buffer.from('test'),
      size: 4,
      mimetype: 'application/pdf',
    } as any;

    const uploadDto: UploadFileDto = {
      entity_type: 'client',
      entity_id: 'client-123',
      file_category: 'document',
      description: 'Test document',
    };

    it('should upload file successfully', async () => {
      const accountId = 'acc-123';
      const userId = 'user-123';

      mockStorageService.upload.mockResolvedValue({
        storedFilename: 'test-12345.pdf',
        filePath: 'uploads/2026/02/acc-123/test-12345.pdf',
        fileUrl: null,
        size: 4,
        mimeType: 'application/pdf',
        serviceMetadata: {
          file_service_type: 'local',
          file_service_name: 'test-storage',
        },
      });

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: 'file-123',
          filename: 'test.pdf',
          stored_filename: 'test-12345.pdf',
          size_bytes: 4,
        }],
      });

      const result = await service.uploadFile(mockFile, uploadDto, accountId, userId);

      expect(storageService.upload).toHaveBeenCalledWith(mockFile, {
        accountId,
        entityType: 'client',
        entityId: 'client-123',
        category: 'document',
        isPublic: undefined,
        userId,
      });

      expect(databaseService.query).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'file-123');
    });
  });

  describe('searchFiles', () => {
    it('should search files with pagination', async () => {
      const accountId = 'acc-123';
      const searchDto: SearchFilesDto = {
        page: 1,
        limit: 20,
        search: 'test',
      };

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [{ total: '10' }],
      });

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [
          { id: 'file-1', filename: 'test1.pdf' },
          { id: 'file-2', filename: 'test2.pdf' },
        ],
      });

      const result = await service.searchFiles(searchDto, accountId);

      expect(result).toEqual({
        data: [
          { id: 'file-1', filename: 'test1.pdf' },
          { id: 'file-2', filename: 'test2.pdf' },
        ],
        total: 10,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by entity type', async () => {
      const accountId = 'acc-123';
      const searchDto: SearchFilesDto = {
        entity_type: 'client',
        page: 1,
        limit: 20,
      };

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [{ total: '5' }],
      });

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [],
      });

      await service.searchFiles(searchDto, accountId);

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('entity_type = $2'),
        expect.arrayContaining(['acc-123', 'client'])
      );
    });
  });

  describe('getFileById', () => {
    it('should return file by id', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: fileId,
          filename: 'test.pdf',
          account_id: accountId,
        }],
      });

      const result = await service.getFileById(fileId, accountId);

      expect(result).toHaveProperty('id', fileId);
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE f.id = $1 AND f.account_id = $2'),
        [fileId, accountId]
      );
    });

    it('should throw NotFoundException if file not found', async () => {
      const fileId = 'file-999';
      const accountId = 'acc-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [],
      });

      await expect(service.getFileById(fileId, accountId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: fileId,
          filename: 'test.pdf',
          file_path: 'uploads/2026/02/test.pdf',
          mime_type: 'application/pdf',
          size_bytes: 1024,
          is_public: false,
          uploaded_by: userId,
        }],
      });

      const fileBuffer = Buffer.from('file content');
      mockStorageService.download.mockResolvedValue(fileBuffer);

      const result = await service.downloadFile(fileId, accountId, userId);

      expect(result).toEqual({
        buffer: fileBuffer,
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      });

      expect(storageService.download).toHaveBeenCalledWith('uploads/2026/02/test.pdf');
    });

    it('should allow download of public files', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: fileId,
          filename: 'public.pdf',
          file_path: 'uploads/2026/02/public.pdf',
          mime_type: 'application/pdf',
          size_bytes: 512,
          is_public: true,
          uploaded_by: 'other-user',
        }],
      });

      mockStorageService.download.mockResolvedValue(Buffer.from('content'));

      const result = await service.downloadFile(fileId, accountId);

      expect(result).toHaveProperty('filename', 'public.pdf');
    });
  });

  describe('deleteFile', () => {
    it('should soft delete file successfully', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [{
          id: fileId,
          uploaded_by: userId,
          file_path: 'uploads/2026/02/test.pdf',
        }],
      });

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [],
      });

      const result = await service.deleteFile(fileId, accountId, userId);

      expect(result).toEqual({
        success: true,
        message: 'File deleted successfully',
      });

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE files'),
        expect.arrayContaining([fileId])
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: fileId,
          uploaded_by: 'other-user',
        }],
      });

      await expect(service.deleteFile(fileId, accountId, userId)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('updateFile', () => {
    it('should update file metadata', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';
      const updates = {
        description: 'Updated description',
        file_category: 'contract',
      };

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [{
          id: fileId,
          uploaded_by: userId,
        }],
      });

      mockDatabaseService.query.mockResolvedValueOnce({
        rows: [{
          id: fileId,
          description: 'Updated description',
          file_category: 'contract',
        }],
      });

      const result = await service.updateFile(fileId, accountId, userId, updates);

      expect(result).toHaveProperty('description', 'Updated description');
      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE files'),
        expect.anything()
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      mockDatabaseService.query.mockResolvedValue({
        rows: [{
          id: fileId,
          uploaded_by: 'other-user',
        }],
      });

      await expect(
        service.updateFile(fileId, accountId, userId, { description: 'test' })
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
