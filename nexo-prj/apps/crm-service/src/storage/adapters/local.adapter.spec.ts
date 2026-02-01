import { LocalStorageAdapter } from './local.adapter';
import { StorageConfig } from '../storage.types';
import { promises as fs } from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    access: jest.fn(),
    readdir: jest.fn(),
    rmdir: jest.fn(),
  },
}));

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;
  let config: StorageConfig;
  const testBaseDir = '/test/media';

  beforeEach(() => {
    jest.clearAllMocks();
    config = {
      type: 'local',
      name: 'test-local-storage',
      config: {
        basePath: testBaseDir,
      },
    };
    adapter = new LocalStorageAdapter(config);
  });

  describe('upload', () => {
    it('should upload a file successfully', async () => {
      const mockFile = {
        originalname: 'test-document.pdf',
        buffer: Buffer.from('test content'),
        size: 12,
        mimetype: 'application/pdf',
      } as any;

      const options = {
        accountId: 'acc-123',
        entityType: 'client',
        entityId: 'client-456',
        category: 'document',
      };

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await adapter.upload(mockFile, options);

      expect(result).toMatchObject({
        size: 12,
        mimeType: 'application/pdf',
        serviceMetadata: {
          file_service_type: 'local',
          file_service_name: 'test-local-storage',
        },
      });

      expect(result.storedFilename).toMatch(/^test-document-\d+-[a-f0-9]+\.pdf$/);
      expect(result.filePath).toContain('uploads');
      expect(result.filePath).toContain('acc-123');
      expect(result.filePath).toContain('client');
      expect(result.filePath).toContain('client-456');

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        mockFile.buffer
      );
    });

    it('should upload without entity association', async () => {
      const mockFile = {
        originalname: 'general.jpg',
        buffer: Buffer.from('image'),
        size: 5,
        mimetype: 'image/jpeg',
      } as any;

      const options = {
        accountId: 'acc-789',
      };

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await adapter.upload(mockFile, options);

      expect(result.filePath).toContain('uploads');
      expect(result.filePath).toContain('acc-789');
      expect(result.filePath).not.toContain('client');
    });

    it('should sanitize filename', async () => {
      const mockFile = {
        originalname: 'my file!@#$%^&*().txt',
        buffer: Buffer.from('test'),
        size: 4,
        mimetype: 'text/plain',
      } as any;

      const options = {
        accountId: 'acc-123',
      };

      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await adapter.upload(mockFile, options);

      // Should replace unsafe characters with dashes
      expect(result.storedFilename).toMatch(/^my-file-+\d+-[a-f0-9]+\.txt$/);
    });
  });

  describe('download', () => {
    it('should download a file successfully', async () => {
      const filePath = 'uploads/2026/02/acc-123/test.pdf';
      const fileContent = Buffer.from('file content');

      (fs.readFile as jest.Mock).mockResolvedValue(fileContent);

      const result = await adapter.download(filePath);

      expect(result).toEqual(fileContent);
      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(testBaseDir, filePath)
      );
    });

    it('should throw error if file not found', async () => {
      const filePath = 'uploads/2026/02/acc-123/missing.pdf';
      const error: any = new Error('File not found');
      error.code = 'ENOENT';

      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(adapter.download(filePath)).rejects.toThrow(
        'File not found: uploads/2026/02/acc-123/missing.pdf'
      );
    });

    it('should prevent path traversal attacks', async () => {
      const maliciousPath = '../../../etc/passwd';

      (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('content'));

      await expect(adapter.download(maliciousPath)).rejects.toThrow(
        'Invalid file path: attempt to access outside storage directory'
      );
    });
  });

  describe('delete', () => {
    it('should delete a file successfully', async () => {
      const filePath = 'uploads/2026/02/acc-123/test.pdf';

      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      (fs.rmdir as jest.Mock).mockResolvedValue(undefined);

      await adapter.delete(filePath);

      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(testBaseDir, filePath)
      );
    });

    it('should not throw if file already deleted', async () => {
      const filePath = 'uploads/2026/02/acc-123/test.pdf';
      const error: any = new Error('File not found');
      error.code = 'ENOENT';

      (fs.unlink as jest.Mock).mockRejectedValue(error);

      await expect(adapter.delete(filePath)).resolves.not.toThrow();
    });

    it('should prevent path traversal in delete', async () => {
      const maliciousPath = '../../../etc/passwd';

      await expect(adapter.delete(maliciousPath)).rejects.toThrow(
        'Invalid file path: attempt to access outside storage directory'
      );
    });
  });

  describe('getUrl', () => {
    it('should return a download URL', () => {
      const filePath = 'uploads/2026/02/acc-123/test.pdf';

      const url = adapter.getUrl(filePath);

      expect(url).toBe('/files/download/uploads%2F2026%2F02%2Facc-123%2Ftest.pdf');
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      const filePath = 'uploads/2026/02/acc-123/test.pdf';

      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const result = await adapter.exists(filePath);

      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(
        path.join(testBaseDir, filePath)
      );
    });

    it('should return false if file does not exist', async () => {
      const filePath = 'uploads/2026/02/acc-123/missing.pdf';

      (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const result = await adapter.exists(filePath);

      expect(result).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should create base directory on initialization', () => {
      expect(fs.mkdir).toHaveBeenCalledWith(testBaseDir, { recursive: true });
    });

    it('should use default base path if not provided', () => {
      const defaultConfig: StorageConfig = {
        type: 'local',
        name: 'test',
      };

      new LocalStorageAdapter(defaultConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('media'),
        { recursive: true }
      );
    });
  });
});
