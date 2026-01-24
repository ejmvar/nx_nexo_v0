import { Test, TestingModule } from '@nestjs/testing';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { DatabaseService } from '../database/database.service';

describe('CrmController', () => {
  let controller: CrmController;
  let service: CrmService;

  beforeEach(async () => {
    const mockService = {
      getClients: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
      getClient: jest.fn().mockResolvedValue({ id: '1', name: 'Test Client' }),
      createClient: jest.fn().mockResolvedValue({ id: '1', name: 'Test Client' }),
      getEmployees: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
      getProjects: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
      getTasks: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
      getSuppliers: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
      getProfessionals: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrmController],
      providers: [
        {
          provide: CrmService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CrmController>(CrmController);
    service = module.get<CrmService>(CrmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getClients', () => {
    it('should return array of clients', async () => {
      const result = await controller.getClients({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total', 0);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(service.getClients).toHaveBeenCalled();
    });
  });

  describe('getClient', () => {
    it('should return client by id', async () => {
      const result = await controller.getClient('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('name');
      expect(service.getClient).toHaveBeenCalledWith('1');
    });
  });

  describe('createClient', () => {
    it('should create new client', async () => {
      const clientData = {
        email: 'test@test.com',
        full_name: 'Test Client',
        company_name: 'Test Corp',
      };

      const result = await controller.createClient(clientData);

      expect(result).toHaveProperty('id');
      expect(service.createClient).toHaveBeenCalledWith(clientData);
    });
  });

  describe('getEmployees', () => {
    it('should return array of employees', async () => {
      const result = await controller.getEmployees({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(service.getEmployees).toHaveBeenCalled();
    });
  });

  describe('getProjects', () => {
    it('should return array of projects', async () => {
      const result = await controller.getProjects({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(service.getProjects).toHaveBeenCalled();
    });
  });

  describe('getTasks', () => {
    it('should return array of tasks', async () => {
      const result = await controller.getTasks({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(service.getTasks).toHaveBeenCalled();
    });
  });

  describe('getSuppliers', () => {
    it('should return array of suppliers', async () => {
      const result = await controller.getSuppliers({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(service.getSuppliers).toHaveBeenCalled();
    });
  });

  describe('getProfessionals', () => {
    it('should return array of professionals', async () => {
      const result = await controller.getProfessionals({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(service.getProfessionals).toHaveBeenCalled();
    });
  });
});

describe('CrmService', () => {
  let service: CrmService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      query: jest.fn().mockImplementation((sql: string) => {
        // Mock count queries
        if (sql.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [{ count: '0', total: 0 }], rowCount: 1 });
        }
        // Mock SELECT queries
        return Promise.resolve({ rows: [], rowCount: 0 });
      }),
      getClient: jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrmService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getClients', () => {
    it('should return paginated clients', async () => {
      const result = await service.getClients({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getEmployees', () => {
    it('should return paginated employees', async () => {
      const result = await service.getEmployees({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getProjects', () => {
    it('should return paginated projects', async () => {
      const result = await service.getProjects({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getTasks', () => {
    it('should return paginated tasks', async () => {
      const result = await service.getTasks({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getSuppliers', () => {
    it('should return paginated suppliers', async () => {
      const result = await service.getSuppliers({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getProfessionals', () => {
    it('should return paginated professionals', async () => {
      const result = await service.getProfessionals({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
