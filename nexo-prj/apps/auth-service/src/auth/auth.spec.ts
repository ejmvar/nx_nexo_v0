import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

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
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
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
    it('should return access token for valid credentials', async () => {
      const loginDto = { username: 'admin', password: 'password' };
      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = { username: 'invalid', password: 'invalid' };

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      const result = await service.validateUser('admin', 'password');

      expect(result).toHaveProperty('userId', 1);
      expect(result).toHaveProperty('username', 'admin');
    });

    it('should return null for invalid credentials', async () => {
      const result = await service.validateUser('invalid', 'invalid');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const result = await service.login('admin', 'password');

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });
  });
});