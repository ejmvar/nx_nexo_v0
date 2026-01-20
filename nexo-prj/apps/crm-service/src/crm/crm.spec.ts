import { Test, TestingModule } from '@nestjs/testing';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

describe('CrmController', () => {
  let controller: CrmController;
  let service: CrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrmController],
      providers: [CrmService],
    }).compile();

    controller = module.get<CrmController>(CrmController);
    service = module.get<CrmService>(CrmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCustomers', () => {
    it('should return array of customers', async () => {
      const result = await controller.getCustomers({});

      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });
  });

  describe('getCustomer', () => {
    it('should return customer by id', async () => {
      const result = await controller.getCustomer('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('companyName');
    });

    it('should throw error for non-existent customer', async () => {
      await expect(controller.getCustomer('999')).rejects.toThrow('Customer not found');
    });
  });

  describe('createCustomer', () => {
    it('should create new customer', async () => {
      const customerData = {
        companyName: 'Test Company',
        contactPerson: 'Test Person',
        email: 'test@test.com',
      };

      const result = await controller.createCustomer(customerData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('customerNumber');
      expect(result.companyName).toBe('Test Company');
    });
  });

  describe('getLeads', () => {
    it('should return array of leads', async () => {
      const result = await controller.getLeads({});

      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty('total');
    });
  });

  describe('getLead', () => {
    it('should return lead by id', async () => {
      const result = await controller.getLead('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('contactName');
    });

    it('should throw error for non-existent lead', async () => {
      await expect(controller.getLead('999')).rejects.toThrow('Lead not found');
    });
  });

  describe('createLead', () => {
    it('should create new lead', async () => {
      const leadData = {
        contactName: 'Test Lead',
        companyName: 'Test Company',
        email: 'lead@test.com',
      };

      const result = await controller.createLead(leadData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('leadNumber');
      expect(result.contactName).toBe('Test Lead');
    });
  });
});

describe('CrmService', () => {
  let service: CrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrmService],
    }).compile();

    service = module.get<CrmService>(CrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCustomers', () => {
    it('should return paginated customers', async () => {
      const result = await service.getCustomers({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter customers by search term', async () => {
      const result = await service.getCustomers({ search: 'Acme' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(customer => {
        expect(customer.companyName.toLowerCase()).toContain('acme');
      });
    });
  });

  describe('getCustomer', () => {
    it('should return customer by id', async () => {
      const result = await service.getCustomer('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('companyName', 'Acme Corporation');
    });

    it('should throw error for non-existent customer', async () => {
      await expect(service.getCustomer('999')).rejects.toThrow('Customer not found');
    });
  });

  describe('createCustomer', () => {
    it('should create customer with generated number', async () => {
      const customerData = {
        companyName: 'New Company',
        contactPerson: 'New Contact',
        email: 'new@company.com',
      };

      const result = await service.createCustomer(customerData);

      expect(result).toHaveProperty('id');
      expect(result.customerNumber).toMatch(/^CUST\d{3}$/);
      expect(result.companyName).toBe('New Company');
      expect(result.isActive).toBe(true);
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('updateCustomer', () => {
    it('should update customer data', async () => {
      const updateData = { companyName: 'Updated Company' };
      const result = await service.updateCustomer('1', updateData);

      expect(result.companyName).toBe('Updated Company');
    });

    it('should throw error for non-existent customer', async () => {
      await expect(service.updateCustomer('999', {})).rejects.toThrow('Customer not found');
    });
  });

  describe('deleteCustomer', () => {
    it('should delete customer', async () => {
      const result = await service.deleteCustomer('1');

      expect(result).toHaveProperty('message', 'Customer deleted successfully');
    });

    it('should throw error for non-existent customer', async () => {
      await expect(service.deleteCustomer('999')).rejects.toThrow('Customer not found');
    });
  });

  describe('getLeads', () => {
    it('should return paginated leads', async () => {
      const result = await service.getLeads({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter leads by status', async () => {
      const result = await service.getLeads({ status: 'qualified' });

      expect(result.data.length).toBeGreaterThan(0);
      result.data.forEach(lead => {
        expect(lead.status).toBe('qualified');
      });
    });
  });

  describe('getLead', () => {
    it('should return lead by id', async () => {
      const result = await service.getLead('1');

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('contactName', 'Alice Wilson');
    });

    it('should throw error for non-existent lead', async () => {
      await expect(service.getLead('999')).rejects.toThrow('Lead not found');
    });
  });

  describe('createLead', () => {
    it('should create lead with generated number', async () => {
      const leadData = {
        contactName: 'New Lead',
        companyName: 'New Company',
        email: 'new@lead.com',
      };

      const result = await service.createLead(leadData);

      expect(result).toHaveProperty('id');
      expect(result.leadNumber).toMatch(/^LEAD\d{3}$/);
      expect(result.contactName).toBe('New Lead');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('updateLead', () => {
    it('should update lead data', async () => {
      const updateData = { status: 'contacted' };
      const result = await service.updateLead('1', updateData);

      expect(result.status).toBe('contacted');
    });

    it('should throw error for non-existent lead', async () => {
      await expect(service.updateLead('999', {})).rejects.toThrow('Lead not found');
    });
  });

  describe('deleteLead', () => {
    it('should delete lead', async () => {
      const result = await service.deleteLead('1');

      expect(result).toHaveProperty('message', 'Lead deleted successfully');
    });

    it('should throw error for non-existent lead', async () => {
      await expect(service.deleteLead('999')).rejects.toThrow('Lead not found');
    });
  });
});