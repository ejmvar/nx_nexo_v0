import { test, expect } from './fixtures';

/**
 * CRM CRUD Operations E2E Tests
 * Tests all entities: clients, employees, suppliers, professionals, projects, tasks
 */

test.describe('CRM CRUD Operations', () => {
  let adminToken: string;
  let createdIds: Record<string, string> = {};

  test.beforeAll(async ({ loginUser }) => {
    // Login as admin
    adminToken = await loginUser('admin@acme.com', 'Admin123!');
  });

  // ============================================================================
  // CLIENTS CRUD
  // ============================================================================
  
  test.describe('Clients Management', () => {
    test('should create a new client', async ({ request }) => {
      const clientData = {
        name: `Test Client ${Date.now()}`,
        email: `client-${Date.now()}@test.com`,
        phone: '+1234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
      };
      
      const response = await request.post('/api/clients', {
        data: clientData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const client = await response.json();
      
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name', clientData.name);
      expect(client).toHaveProperty('email', clientData.email);
      
      createdIds.client = client.id;
    });

    test('should retrieve all clients', async ({ request }) => {
      const response = await request.get('/api/clients', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const clients = await response.json();
      
      expect(Array.isArray(clients)).toBeTruthy();
      expect(clients.length).toBeGreaterThan(0);
    });

    test('should retrieve client by ID', async ({ request }) => {
      const response = await request.get(`/api/clients/${createdIds.client}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const client = await response.json();
      
      expect(client).toHaveProperty('id', createdIds.client);
    });

    test('should update client', async ({ request }) => {
      const updateData = {
        name: `Updated Client ${Date.now()}`,
        phone: '+9876543210',
      };
      
      const response = await request.put(`/api/clients/${createdIds.client}`, {
        data: updateData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const updated = await response.json();
      
      expect(updated).toHaveProperty('name', updateData.name);
      expect(updated).toHaveProperty('phone', updateData.phone);
    });
  });

  // ============================================================================
  // EMPLOYEES CRUD
  // ============================================================================
  
  test.describe('Employees Management', () => {
    test('should create a new employee', async ({ request }) => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: `employee-${Date.now()}@test.com`,
        phone: '+1234567890',
        position: 'Software Engineer',
        department: 'Engineering',
        hire_date: new Date().toISOString().split('T')[0],
        salary: 75000,
      };
      
      const response = await request.post('/api/employees', {
        data: employeeData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const employee = await response.json();
      
      expect(employee).toHaveProperty('id');
      expect(employee).toHaveProperty('first_name', employeeData.first_name);
      expect(employee).toHaveProperty('position', employeeData.position);
      
      createdIds.employee = employee.id;
    });

    test('should retrieve all employees', async ({ request }) => {
      const response = await request.get('/api/employees', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const employees = await response.json();
      
      expect(Array.isArray(employees)).toBeTruthy();
    });

    test('should retrieve employee by ID', async ({ request }) => {
      const response = await request.get(`/api/employees/${createdIds.employee}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const employee = await response.json();
      
      expect(employee).toHaveProperty('id', createdIds.employee);
    });

    test('should update employee', async ({ request }) => {
      const updateData = {
        position: 'Senior Software Engineer',
        salary: 95000,
      };
      
      const response = await request.put(`/api/employees/${createdIds.employee}`, {
        data: updateData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const updated = await response.json();
      
      expect(updated).toHaveProperty('position', updateData.position);
    });
  });

  // ============================================================================
  // SUPPLIERS CRUD
  // ============================================================================
  
  test.describe('Suppliers Management', () => {
    test('should create a new supplier', async ({ request }) => {
      const supplierData = {
        name: `Test Supplier ${Date.now()}`,
        contact_name: 'Jane Supplier',
        email: `supplier-${Date.now()}@test.com`,
        phone: '+1234567890',
        address: '456 Supplier Ave',
        city: 'Supply City',
        state: 'SC',
        zip_code: '54321',
        country: 'Supply Country',
      };
      
      const response = await request.post('/api/suppliers', {
        data: supplierData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const supplier = await response.json();
      
      expect(supplier).toHaveProperty('id');
      expect(supplier).toHaveProperty('name', supplierData.name);
      
      createdIds.supplier = supplier.id;
    });

    test('should retrieve all suppliers', async ({ request }) => {
      const response = await request.get('/api/suppliers', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const suppliers = await response.json();
      
      expect(Array.isArray(suppliers)).toBeTruthy();
    });
  });

  // ============================================================================
  // PROFESSIONALS CRUD
  // ============================================================================
  
  test.describe('Professionals Management', () => {
    test('should create a new professional', async ({ request }) => {
      const professionalData = {
        first_name: 'Alice',
        last_name: 'Professional',
        email: `professional-${Date.now()}@test.com`,
        phone: '+1234567890',
        specialty: 'Consulting',
        hourly_rate: 150,
        availability: 'Full-time',
      };
      
      const response = await request.post('/api/professionals', {
        data: professionalData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const professional = await response.json();
      
      expect(professional).toHaveProperty('id');
      expect(professional).toHaveProperty('specialty', professionalData.specialty);
      
      createdIds.professional = professional.id;
    });

    test('should retrieve all professionals', async ({ request }) => {
      const response = await request.get('/api/professionals', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const professionals = await response.json();
      
      expect(Array.isArray(professionals)).toBeTruthy();
    });
  });

  // ============================================================================
  // PROJECTS CRUD
  // ============================================================================
  
  test.describe('Projects Management', () => {
    test('should create a new project', async ({ request }) => {
      const projectData = {
        name: `Test Project ${Date.now()}`,
        description: 'E2E Test Project',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        client_id: createdIds.client,
        budget: 100000,
      };
      
      const response = await request.post('/api/projects', {
        data: projectData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const project = await response.json();
      
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name', projectData.name);
      expect(project).toHaveProperty('status', projectData.status);
      
      createdIds.project = project.id;
    });

    test('should retrieve all projects', async ({ request }) => {
      const response = await request.get('/api/projects', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const projects = await response.json();
      
      expect(Array.isArray(projects)).toBeTruthy();
    });

    test('should retrieve project by ID', async ({ request }) => {
      const response = await request.get(`/api/projects/${createdIds.project}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const project = await response.json();
      
      expect(project).toHaveProperty('id', createdIds.project);
    });
  });

  // ============================================================================
  // TASKS CRUD
  // ============================================================================
  
  test.describe('Tasks Management', () => {
    test('should create a new task', async ({ request }) => {
      const taskData = {
        title: `Test Task ${Date.now()}`,
        description: 'E2E Test Task',
        status: 'pending',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        project_id: createdIds.project,
        assigned_to: createdIds.employee,
      };
      
      const response = await request.post('/api/tasks', {
        data: taskData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const task = await response.json();
      
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title', taskData.title);
      expect(task).toHaveProperty('status', taskData.status);
      
      createdIds.task = task.id;
    });

    test('should retrieve all tasks', async ({ request }) => {
      const response = await request.get('/api/tasks', {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const tasks = await response.json();
      
      expect(Array.isArray(tasks)).toBeTruthy();
    });

    test('should retrieve task by ID', async ({ request }) => {
      const response = await request.get(`/api/tasks/${createdIds.task}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const task = await response.json();
      
      expect(task).toHaveProperty('id', createdIds.task);
    });

    test('should update task status', async ({ request }) => {
      const updateData = {
        status: 'in_progress',
      };
      
      const response = await request.put(`/api/tasks/${createdIds.task}`, {
        data: updateData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
      const updated = await response.json();
      
      expect(updated).toHaveProperty('status', updateData.status);
    });
  });

  // ============================================================================
  // DELETE OPERATIONS (Cleanup)
  // ============================================================================
  
  test.describe('Delete Operations', () => {
    test('should delete task', async ({ request }) => {
      const response = await request.delete(`/api/tasks/${createdIds.task}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('should delete project', async ({ request }) => {
      const response = await request.delete(`/api/projects/${createdIds.project}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('should delete professional', async ({ request }) => {
      const response = await request.delete(`/api/professionals/${createdIds.professional}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('should delete supplier', async ({ request }) => {
      const response = await request.delete(`/api/suppliers/${createdIds.supplier}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('should delete employee', async ({ request }) => {
      const response = await request.delete(`/api/employees/${createdIds.employee}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });

    test('should delete client', async ({ request }) => {
      const response = await request.delete(`/api/clients/${createdIds.client}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(response.ok()).toBeTruthy();
    });
  });
});
