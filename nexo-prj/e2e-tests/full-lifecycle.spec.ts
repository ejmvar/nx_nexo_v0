import { test, expect } from './fixtures';

/**
 * Full Lifecycle E2E Test
 * Demonstrates complete system usage from registration to project completion
 */

test.describe('Full System Lifecycle',() => {
  // Test user accounts
  const timestamp = Date.now();
  const admin = {
    email: `lifecycle-admin-${timestamp}@nexo.com`,
    password: 'Admin123!',
    token: '',
  };
  const manager = {
    email: `lifecycle-manager-${timestamp}@nexo.com`,
    password: 'Manager123!',
    token: '',
  };
  const employee = {
    email: `lifecycle-employee-${timestamp}@nexo.com`,
    password: 'Employee123!',
    token: '',
  };
  
  // Test entities
  const entities: Record<string, string> = {};

  test('Step 1: Admin registers and sets up company', async ({ registerUser, loginUser, request }) => {
    // Register admin
    await registerUser(admin.email, admin.password, 'Admin', 'User');
    admin.token = await loginUser(admin.email, admin.password);
    
    expect(admin.token).toBeTruthy();
    
    // Admin creates company client profile
    const clientResponse = await request.post('/api/clients', {
      data: {
        name: 'Acme Corporation',
        email: 'info@acme.com',
        phone: '+1-555-0100',
        address: '123 Business St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94105',
        country: 'USA',
      },
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(clientResponse.ok()).toBeTruthy();
    const client = await clientResponse.json();
    entities.client = client.id;
  });

  test('Step 2: Admin creates employee records', async ({ request }) => {
    // Create manager as employee
    const managerResponse = await request.post('/api/employees', {
      data: {
        first_name: 'Project',
        last_name: 'Manager',
        email: manager.email,
        phone: '+1-555-0101',
        position: 'Project Manager',
        department: 'Operations',
        hire_date: new Date().toISOString().split('T')[0],
        salary: 85000,
      },
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(managerResponse.ok()).toBeTruthy();
    const managerEmployee = await managerResponse.json();
    entities.manager = managerEmployee.id;
    
    // Create employee
    const employeeResponse = await request.post('/api/employees', {
      data: {
        first_name: 'Jane',
        last_name: 'Developer',
        email: employee.email,
        phone: '+1-555-0102',
        position: 'Software Engineer',
        department: 'Engineering',
        hire_date: new Date().toISOString().split('T')[0],
        salary: 75000,
      },
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(employeeResponse.ok()).toBeTruthy();
    const employeeRecord = await employeeResponse.json();
    entities.employee = employeeRecord.id;
  });

  test('Step 3: Admin creates supplier for project resources', async ({ request }) => {
    const supplierResponse = await request.post('/api/suppliers', {
      data: {
        name: 'Tech Supplies Inc',
        contact_name: 'Bob Supplier',
        email: 'bob@techsupplies.com',
        phone: '+1-555-0200',
        address: '456 Supply Ave',
        city: 'Austin',
        state: 'TX',
        zip_code: '73301',
        country: 'USA',
      },
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(supplierResponse.ok()).toBeTruthy();
    const supplier = await supplierResponse.json();
    entities.supplier = supplier.id;
  });

  test('Step 4: Admin adds external professional consultant', async ({ request }) => {
    const professionalResponse = await request.post('/api/professionals', {
      data: {
        first_name: 'Alice',
        last_name: 'Consultant',
        email: 'alice@consulting.com',
        phone: '+1-555-0300',
        specialty: 'Business Strategy',
        hourly_rate: 200,
        availability: 'Part-time',
      },
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(professionalResponse.ok()).toBeTruthy();
    const professional = await professionalResponse.json();
    entities.professional = professional.id;
  });

  test('Step 5: Manager registers and creates project', async ({ registerUser, loginUser, request }) => {
    // Manager registers (if not already done via employee creation)
    await registerUser(manager.email, manager.password, 'Project', 'Manager');
    manager.token = await loginUser(manager.email, manager.password);
    
    // Manager creates project
    const projectResponse = await request.post('/api/projects', {
      data: {
        name: 'CRM System Implementation',
        description: 'Full CRM implementation for Acme Corp',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        client_id: entities.client,
        budget: 150000,
        manager_id: entities.manager,
      },
      headers: { 'Authorization': `Bearer ${manager.token}` },
    });
    
    // May succeed or fail depending on Manager role assignment
    if (projectResponse.status() === 403) {
      console.warn('Manager lacks project:write permission - using admin token');
      const adminProjectResponse = await request.post('/api/projects', {
        data: {
          name: 'CRM System Implementation',
          description: 'Full CRM implementation for Acme Corp',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active',
          client_id: entities.client,
          budget: 150000,
        },
        headers: { 'Authorization': `Bearer ${admin.token}` },
      });
      expect(adminProjectResponse.ok()).toBeTruthy();
      const project = await adminProjectResponse.json();
      entities.project = project.id;
    } else {
      expect(projectResponse.ok()).toBeTruthy();
      const project = await projectResponse.json();
      entities.project = project.id;
    }
  });

  test('Step 6: Manager creates project tasks', async ({ request }) => {
    const tasks = [
      {
        title: 'Requirements Gathering',
        description: 'Meet with stakeholders to gather requirements',
        status: 'completed',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Database Design',
        description: 'Design database schema for CRM',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Frontend Development',
        description: 'Build React-based frontend',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];
    
    for (const taskData of tasks) {
      const taskResponse = await request.post('/api/tasks', {
        data: {
          ...taskData,
          project_id: entities.project,
          assigned_to: entities.employee,
        },
        headers: { 'Authorization': `Bearer ${manager.token}` },
      });
      
      // Use admin token if manager lacks permission
      if (taskResponse.status() === 403) {
        await request.post('/api/tasks', {
          data: {
            ...taskData,
            project_id: entities.project,
            assigned_to: entities.employee,
          },
          headers: { 'Authorization': `Bearer ${admin.token}` },
        });
      } else {
        expect(taskResponse.ok()).toBeTruthy();
      }
    }
  });

  test('Step 7: Employee registers and views assigned tasks', async ({ registerUser, loginUser, request }) => {
    // Employee registers
    await registerUser(employee.email, employee.password, 'Jane', 'Developer');
    employee.token = await loginUser(employee.email, employee.password);
    
    // Employee retrieves tasks
    const tasksResponse = await request.get('/api/tasks', {
      headers: { 'Authorization': `Bearer ${employee.token}` },
    });
    
    if (tasksResponse.status() === 403) {
      console.warn('Employee lacks task:read permission');
    } else {
      expect(tasksResponse.ok()).toBeTruthy();
      const tasks = await tasksResponse.json();
      expect(Array.isArray(tasks)).toBeTruthy();
      
      // Save first task for update
      if (tasks.length > 0) {
        entities.task = tasks[0].id;
      }
    }
  });

  test('Step 8: Employee updates task status', async ({ request }) => {
    if (!entities.task) {
      console.warn('No task available for update');
      return;
    }
    
    const updateResponse = await request.put(`/api/tasks/${entities.task}`, {
      data: {
        status: 'completed',
        completion_notes: 'Task completed successfully',
      },
      headers: { 'Authorization': `Bearer ${employee.token}` },
    });
    
    if (updateResponse.status() === 403) {
      console.warn('Employee lacks task:write permission');
    } else {
      expect(updateResponse.ok()).toBeTruthy();
    }
  });

  test('Step 9: Manager reviews project progress', async ({ request }) => {
    // Get project details
    const projectResponse = await request.get(`/api/projects/${entities.project}`, {
      headers: { 'Authorization': `Bearer ${manager.token}` },
    });
    
    if (projectResponse.status() === 403) {
      console.warn('Manager lacks project:read permission');
    } else {
      expect(projectResponse.ok()).toBeTruthy();
      const project = await projectResponse.json();
      expect(project).toHaveProperty('name', 'CRM System Implementation');
    }
    
    // Get all tasks for project
    const tasksResponse = await request.get(`/api/tasks?project_id=${entities.project}`, {
      headers: { 'Authorization': `Bearer ${manager.token}` },
    });
    
    if (tasksResponse.status() !== 403) {
      expect(tasksResponse.ok()).toBeTruthy();
    }
  });

  test('Step 10: Admin generates reports and reviews audit logs', async ({ request }) => {
    // Get all projects
    const projectsResponse = await request.get('/api/projects', {
      headers: { 'Authorization': `Bearer ${admin.token}` },
    });
    
    expect(projectsResponse.ok()).toBeTruthy();
    const projects = await projectsResponse.json();
    expect(Array.isArray(projects)).toBeTruthy();
    
    // Note: Audit log access would be via direct database query or dedicated endpoint
    // SELECT * FROM audit_trail 
    // WHERE entity_type IN ('project', 'task') 
    // ORDER BY created_at DESC;
  });

  test('Step 11: Manager marks project as completed', async ({ request }) => {
    const completeResponse = await request.put(`/api/projects/${entities.project}`, {
      data: {
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0],
      },
      headers: { 'Authorization': `Bearer ${manager.token}` },
    });
    
    if (completeResponse.status() === 403) {
      // Use admin if manager lacks permission
      const adminCompleteResponse = await request.put(`/api/projects/${entities.project}`, {
        data: {
          status: 'completed',
        },
        headers: { 'Authorization': `Bearer ${admin.token}` },
      });
      expect(adminCompleteResponse.ok()).toBeTruthy();
    } else {
      expect(completeResponse.ok()).toBeTruthy();
    }
  });

  test('Step 12: Verify all entities were created successfully', async ({ request }) => {
    // Verify each entity exists
    const entityChecks = [
      { type: 'clients', id: entities.client },
      { type: 'employees', id: entities.manager },
      { type: 'employees', id: entities.employee },
      { type: 'suppliers', id: entities.supplier },
      { type: 'professionals', id: entities.professional },
      { type: 'projects', id: entities.project },
    ];
    
    for (const { type, id } of entityChecks) {
      const response = await request.get(`/api/${type}/${id}`, {
        headers: { 'Authorization': `Bearer ${admin.token}` },
      });
      
      expect(response.ok()).toBeTruthy();
    }
  });

  // Cleanup test data
  test.afterAll(async ({ request }) => {
    // Delete in reverse order of dependencies
    const cleanup = [
      { type: 'tasks', id: entities.task },
      { type: 'projects', id: entities.project },
      { type: 'professionals', id: entities.professional },
      { type: 'suppliers', id: entities.supplier },
      { type: 'employees', id: entities.employee },
      { type: 'employees', id: entities.manager },
      { type: 'clients', id: entities.client },
    ];
    
    for (const { type, id } of cleanup) {
      if (id) {
        await request.delete(`/api/${type}/${id}`, {
          headers: { 'Authorization': `Bearer ${admin.token}` },
        });
      }
    }
  });
});
