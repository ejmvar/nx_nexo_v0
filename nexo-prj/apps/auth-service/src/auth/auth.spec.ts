import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock services
const mockDb = {
  query: jest.fn(),
};

const mockRedis = {
  getJson: jest.fn(),
  setJson: jest.fn(),
  del: jest.fn(),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwt,
        },
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
        {
          provide: RedisService,
          useValue: mockRedis,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return access token for valid credentials', async () => {
      const loginDto = { email: 'admin@example.com', password: 'password' };
      
      // Mock database response for user lookup
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        password_hash: '$2a$10$somehashedpassword',
        username: 'admin',
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
      };
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock bcrypt to return true (password matches)
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      // Mock database update for last_login
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = { email: 'invalid@example.com', password: 'invalid' };
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = { user: { userId: 1, username: 'admin' } };
      const result = await controller.getProfile(mockRequest);

      expect(result).toHaveProperty('userId', 1);
      expect(result).toHaveProperty('username', 'admin');
    });
  });
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwt,
        },
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
        {
          provide: RedisService,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user data for valid userId', async () => {
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        username: 'admin',
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        last_login: new Date(),
      };

      mockRedis.getJson.mockResolvedValueOnce(null); // Not in cache
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      mockRedis.setJson.mockResolvedValueOnce('OK');

      const result = await service.validateUser('123');

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid userId', async () => {
      mockRedis.getJson.mockResolvedValueOnce(null);
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.validateUser('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return access token for valid user', async () => {
      const mockUser = {
        id: '123',
        email: 'admin@example.com',
        password_hash: '$2a$10$somehashedpassword',
        username: 'admin',
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        last_login: new Date(),
      };
      mockDb.query.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock bcrypt to return true
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      // Mock update last_login
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      
      const result = await service.login({ email: 'admin@example.com', password: 'password' });

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });
  });
});