import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { SearchFilesDto } from './dto/search-files.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { Response } from 'express';

describe('FilesController', () => {
  let controller: FilesController;
  let service: FilesService;

  const mockFilesService = {
    uploadFile: jest.fn(),
    searchFiles: jest.fn(),
    getFileById: jest.fn(),
    downloadFile: jest.fn(),
    updateFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAll: jest.fn(),
            getAllAndOverride: jest.fn(),
            getAllAndMerge: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(require('../auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../common/guards/permissions.guard').PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
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
    };

    it('should upload file successfully', async () => {
      const accountId = 'acc-123';
      const userId = 'user-123';

      const expectedResult = {
        id: 'file-123',
        filename: 'test.pdf',
        size_bytes: 4,
      };

      mockFilesService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile, uploadDto, accountId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.uploadFile).toHaveBeenCalledWith(
        mockFile,
        uploadDto,
        accountId,
        userId
      );
    });

    it('should throw BadRequestException if no file provided', async () => {
      await expect(
        controller.uploadFile(undefined as any, uploadDto, 'acc-123', 'user-123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchFiles', () => {
    it('should search files successfully', async () => {
      const accountId = 'acc-123';
      const searchDto: SearchFilesDto = {
        page: 1,
        limit: 20,
      };

      const expectedResult = {
        data: [{ id: 'file-1', filename: 'test.pdf' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockFilesService.searchFiles.mockResolvedValue(expectedResult);

      const result = await controller.searchFiles(searchDto, accountId);

      expect(result).toEqual(expectedResult);
      expect(service.searchFiles).toHaveBeenCalledWith(searchDto, accountId);
    });
  });

  describe('getFile', () => {
    it('should get file by id', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';

      const expectedResult = {
        id: fileId,
        filename: 'test.pdf',
      };

      mockFilesService.getFileById.mockResolvedValue(expectedResult);

      const result = await controller.getFile(fileId, accountId);

      expect(result).toEqual(expectedResult);
      expect(service.getFileById).toHaveBeenCalledWith(fileId, accountId);
    });
  });

  describe('downloadFile', () => {
    it('should download file successfully', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      const downloadResult = {
        buffer: Buffer.from('file content'),
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        size: 12,
      };

      mockFilesService.downloadFile.mockResolvedValue(downloadResult);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.downloadFile(fileId, accountId, userId, mockResponse);

      expect(service.downloadFile).toHaveBeenCalledWith(fileId, accountId, userId);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Length', 12);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('test.pdf')
      );
      expect(mockResponse.send).toHaveBeenCalledWith(downloadResult.buffer);
    });
  });

  describe('updateFile', () => {
    it('should update file successfully', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';
      const updateDto: UpdateFileDto = {
        description: 'Updated description',
      };

      const expectedResult = {
        id: fileId,
        description: 'Updated description',
      };

      mockFilesService.updateFile.mockResolvedValue(expectedResult);

      const result = await controller.updateFile(fileId, updateDto, accountId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.updateFile).toHaveBeenCalledWith(
        fileId,
        accountId,
        userId,
        updateDto
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileId = 'file-123';
      const accountId = 'acc-123';
      const userId = 'user-123';

      const expectedResult = {
        success: true,
        message: 'File deleted successfully',
      };

      mockFilesService.deleteFile.mockResolvedValue(expectedResult);

      const result = await controller.deleteFile(fileId, accountId, userId);

      expect(result).toEqual(expectedResult);
      expect(service.deleteFile).toHaveBeenCalledWith(fileId, accountId, userId);
    });
  });
});
