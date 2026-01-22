import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import {
  CreateClientDto,
  UpdateClientDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateProfessionalDto,
  UpdateProfessionalDto,
  CreateProjectDto,
  UpdateProjectDto,
  CreateTaskDto,
  UpdateTaskDto,
} from './dto/crm.dto.js';

@Injectable()
export class CrmService {
  constructor(private db: DatabaseService) {}

  // ==================== CLIENTS ====================
  async getClients(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role = $1';
    const params: any[] = ['client'];
    let paramCount = 1;

    if (query.search) {
      paramCount++;
      whereClause += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR c.company_name ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    if (query.status) {
      paramCount++;
      whereClause += ` AND u.status = $${paramCount}`;
      params.push(query.status);
    }

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM users u INNER JOIN clients c ON c.user_id = u.id ${whereClause}`,
      params
    );

    const result = await this.db.query(
      `SELECT u.id as user_id, u.email, u.username, u.full_name, u.phone, u.status, u.created_at,
              c.id, c.client_code, c.company_name, c.tax_id, c.billing_address, c.credit_limit, c.account_manager_id
       FROM users u
       INNER JOIN clients c ON c.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async getClient(id: string) {
    const result = await this.db.query(
      `SELECT u.id as user_id, u.email, u.username, u.full_name, u.phone, u.status, u.created_at,
              c.id, c.client_code, c.company_name, c.tax_id, c.billing_address, c.credit_limit, c.account_manager_id
       FROM users u
       INNER JOIN clients c ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Client not found');
    }

    return result.rows[0];
  }

  async createClient(clientData: CreateClientDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Auto-generate username if not provided
      const username = clientData.username || clientData.email.split('@')[0];
      
      // Auto-generate client_code if not provided
      const client_code = clientData.client_code || `CL${Date.now().toString().slice(-8)}`;

      // Create user first (password should be set through auth service or hashed here)
      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          clientData.email,
          username,
          clientData.password ? `temp_${clientData.password}` : 'temporary_hash', // Simplified for now
          clientData.full_name,
          clientData.phone || null,
          'client',
          'active',
        ]
      );

      const userId = userResult.rows[0].id;

      // Create client record
      const clientResult = await client.query(
        `INSERT INTO clients (user_id, client_code, company_name, tax_id, billing_address, credit_limit, account_manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          userId,
          client_code,
          clientData.company_name || null,
          clientData.tax_id || null,
          clientData.billing_address || null,
          clientData.credit_limit || 0,
          clientData.account_manager_id || null,
        ]
      );

      await client.query('COMMIT');

      return this.getClient(clientResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create client: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async updateClient(id: string, clientData: UpdateClientDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Get user_id
      const clientRecord = await client.query('SELECT user_id FROM clients WHERE id = $1', [id]);
      if (clientRecord.rows.length === 0) {
        throw new NotFoundException('Client not found');
      }
      const userId = clientRecord.rows[0].user_id;

      // Update user fields
      const userUpdates: string[] = [];
      const userParams: any[] = [];
      let paramCount = 0;

      if (clientData.full_name) {
        userUpdates.push(`full_name = $${++paramCount}`);
        userParams.push(clientData.full_name);
      }
      if (clientData.phone !== undefined) {
        userUpdates.push(`phone = $${++paramCount}`);
        userParams.push(clientData.phone);
      }

      if (userUpdates.length > 0) {
        userParams.push(userId);
        await client.query(
          `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${++paramCount}`,
          userParams
        );
      }

      // Update client fields
      const clientUpdates: string[] = [];
      const clientParams: any[] = [];
      paramCount = 0;

      if (clientData.company_name !== undefined) {
        clientUpdates.push(`company_name = $${++paramCount}`);
        clientParams.push(clientData.company_name);
      }
      if (clientData.tax_id !== undefined) {
        clientUpdates.push(`tax_id = $${++paramCount}`);
        clientParams.push(clientData.tax_id);
      }
      if (clientData.billing_address !== undefined) {
        clientUpdates.push(`billing_address = $${++paramCount}`);
        clientParams.push(clientData.billing_address);
      }
      if (clientData.credit_limit !== undefined) {
        clientUpdates.push(`credit_limit = $${++paramCount}`);
        clientParams.push(clientData.credit_limit);
      }
      if (clientData.account_manager_id !== undefined) {
        clientUpdates.push(`account_manager_id = $${++paramCount}`);
        clientParams.push(clientData.account_manager_id);
      }

      if (clientUpdates.length > 0) {
        clientParams.push(id);
        await client.query(
          `UPDATE clients SET ${clientUpdates.join(', ')} WHERE id = $${++paramCount}`,
          clientParams
        );
      }

      await client.query('COMMIT');

      return this.getClient(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update client: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async deleteClient(id: string) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Get user_id before deletion
      const clientRecord = await client.query('SELECT user_id FROM clients WHERE id = $1', [id]);
      if (clientRecord.rows.length === 0) {
        throw new NotFoundException('Client not found');
      }

      // Delete user (cascade will delete client)
      await client.query('DELETE FROM users WHERE id = $1', [clientRecord.rows[0].user_id]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to delete client: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // ==================== EMPLOYEES ====================
  async getEmployees(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE u.role = $1';
    const params: any[] = ['employee'];
    let paramCount = 1;

    if (query.search) {
      paramCount++;
      whereClause += ` AND (u.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR e.employee_code ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    if (query.department) {
      paramCount++;
      whereClause += ` AND e.department = $${paramCount}`;
      params.push(query.department);
    }

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM users u INNER JOIN employees e ON e.user_id = u.id ${whereClause}`,
      params
    );

    const result = await this.db.query(
      `SELECT u.id as user_id, u.email, u.username, u.full_name, u.phone, u.status, u.created_at,
              e.id, e.employee_code, e.department, e.position, e.hire_date, e.salary_level, e.manager_id
       FROM users u
       INNER JOIN employees e ON e.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async getEmployee(id: string) {
    const result = await this.db.query(
      `SELECT u.id as user_id, u.email, u.username, u.full_name, u.phone, u.status, u.created_at,
              e.id, e.employee_code, e.department, e.position, e.hire_date, e.salary_level, e.manager_id
       FROM users u
       INNER JOIN employees e ON e.user_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    return result.rows[0];
  }

  async createEmployee(employeeData: CreateEmployeeDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Auto-generate username if not provided
      const username = employeeData.username || employeeData.email.split('@')[0];
      
      // Auto-generate employee_code if not provided
      const employee_code = employeeData.employee_code || `EMP${Date.now().toString().slice(-8)}`;
      
      // Auto-set hire_date if not provided
      const hire_date = employeeData.hire_date || new Date().toISOString().split('T')[0];

      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          employeeData.email,
          username,
          employeeData.password ? `temp_${employeeData.password}` : 'temporary_hash',
          employeeData.full_name,
          employeeData.phone || null,
          'employee',
          'active',
        ]
      );

      const userId = userResult.rows[0].id;

      const employeeResult = await client.query(
        `INSERT INTO employees (user_id, employee_code, department, position, hire_date, salary_level, manager_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          userId,
          employee_code,
          employeeData.department || null,
          employeeData.position || null,
          hire_date,
          employeeData.salary_level || null,
          employeeData.manager_id || null,
        ]
      );

      await client.query('COMMIT');

      return this.getEmployee(employeeResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create employee: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async updateEmployee(id: string, employeeData: UpdateEmployeeDto) {
    // Similar to updateClient - abbreviated for brevity
    const result = await this.db.query('SELECT user_id FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    // Update logic similar to client...
    return this.getEmployee(id);
  }

  async deleteEmployee(id: string) {
    const result = await this.db.query('SELECT user_id FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    await this.db.query('DELETE FROM users WHERE id = $1', [result.rows[0].user_id]);
  }

  // ==================== SUPPLIERS (abbreviated) ====================
  async getSuppliers(query: any) {
    // Similar to getClients
    return { data: [], total: 0, page: 1, limit: 10 };
  }

  async getSupplier(id: string) {
    throw new NotFoundException('Supplier not found');
  }

  async createSupplier(supplierData: CreateSupplierDto) {
    // Similar to createClient
    return {};
  }

  async updateSupplier(id: string, supplierData: UpdateSupplierDto) {
    return {};
  }

  async deleteSupplier(id: string) {}

  // ==================== PROFESSIONALS (abbreviated) ====================
  async getProfessionals(query: any) {
    return { data: [], total: 0, page: 1, limit: 10 };
  }

  async getProfessional(id: string) {
    throw new NotFoundException('Professional not found');
  }

  async createProfessional(professionalData: CreateProfessionalDto) {
    return {};
  }

  async updateProfessional(id: string, professionalData: UpdateProfessionalDto) {
    return {};
  }

  async deleteProfessional(id: string) {}

  // ==================== PROJECTS ====================
  async getProjects(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (query.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(query.status);
    }

    if (query.client_id) {
      paramCount++;
      whereClause += ` AND client_id = $${paramCount}`;
      params.push(query.client_id);
    }

    const countResult = await this.db.query(`SELECT COUNT(*) FROM projects ${whereClause}`, params);

    const result = await this.db.query(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async getProject(id: string) {
    const result = await this.db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }
    return result.rows[0];
  }

  async createProject(projectData: CreateProjectDto) {
    const result = await this.db.query(
      `INSERT INTO projects (name, description, status, client_id, budget, start_date, deadline, completion_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectData.name,
        projectData.description || null,
        projectData.status || 'planning',
        projectData.client_id || null,
        projectData.budget || null,
        projectData.start_date || null,
        projectData.deadline || null,
        projectData.completion_percentage || 0,
      ]
    );

    return result.rows[0];
  }

  async updateProject(id: string, projectData: UpdateProjectDto) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    Object.entries(projectData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${++paramCount}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getProject(id);
    }

    params.push(id);
    await this.db.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
      params
    );

    return this.getProject(id);
  }

  async deleteProject(id: string) {
    const result = await this.db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }
  }

  // ==================== TASKS ====================
  async getTasks(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (query.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(query.status);
    }

    if (query.assigned_to) {
      paramCount++;
      whereClause += ` AND assigned_to = $${paramCount}`;
      params.push(query.assigned_to);
    }

    if (query.project_id) {
      paramCount++;
      whereClause += ` AND project_id = $${paramCount}`;
      params.push(query.project_id);
    }

    const countResult = await this.db.query(`SELECT COUNT(*) FROM tasks ${whereClause}`, params);

    const result = await this.db.query(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
    };
  }

  async getTask(id: string) {
    const result = await this.db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Task not found');
    }
    return result.rows[0];
  }

  async createTask(taskData: CreateTaskDto) {
    const result = await this.db.query(
      `INSERT INTO tasks (title, description, status, priority, assigned_to, project_id, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        taskData.title,
        taskData.description || null,
        taskData.status || 'pending',
        taskData.priority || 'medium',
        taskData.assigned_to || null,
        taskData.project_id || null,
        taskData.due_date || null,
      ]
    );

    return result.rows[0];
  }

  async updateTask(id: string, taskData: UpdateTaskDto) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    Object.entries(taskData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${++paramCount}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getTask(id);
    }

    params.push(id);
    await this.db.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
      params
    );

    return this.getTask(id);
  }

  async deleteTask(id: string) {
    const result = await this.db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}
