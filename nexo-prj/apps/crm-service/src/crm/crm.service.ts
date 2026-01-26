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
  async getClients(accountId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (query.search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR company ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    if (query.status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(query.status);
    }

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) FROM clients ${whereClause}`,
      params
    );

    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, email, phone, company, address, status, created_at, updated_at
       FROM clients
       ${whereClause}
       ORDER BY created_at DESC
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

  async getClient(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, email, phone, company, address, status, created_at, updated_at
       FROM clients
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Client not found');
    }

    return result.rows[0];
  }

  async createClient(accountId: string, clientData: CreateClientDto) {
    const sql = 'INSERT INTO clients (account_id, name, email, phone, company, address, status, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id';
    const params = [
      accountId,
      clientData.full_name || clientData.company_name || 'Unnamed Client',
      clientData.email,
      clientData.phone || null,
      clientData.company_name || null,
      clientData.billing_address || null,
      'active',
    ];
    
    const result = await this.db.queryWithAccount(accountId, sql, params);
    return this.getClient(accountId, result.rows[0].id);
  }

  async updateClient(accountId: string, id: string, clientData: UpdateClientDto) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (clientData.full_name !== undefined) {
      updates.push(`name = $${++paramCount}`);
      params.push(clientData.full_name);
    }
    if (clientData.phone !== undefined) {
      updates.push(`phone = $${++paramCount}`);
      params.push(clientData.phone);
    }
    if (clientData.company_name !== undefined) {
      updates.push(`company = $${++paramCount}`);
      params.push(clientData.company_name);
    }
    if (clientData.billing_address !== undefined) {
      updates.push(`address = $${++paramCount}`);
      params.push(clientData.billing_address);
    }

    if (updates.length === 0) {
      return this.getClient(accountId, id);
    }

    params.push(id);
    await this.db.queryWithAccount(
      accountId,
      `UPDATE clients SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${++paramCount}`,
      params
    );

    return this.getClient(accountId, id);
  }

  async deleteClient(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      'DELETE FROM clients WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Client not found');
    }
  }

  // ==================== EMPLOYEES ====================
  async getEmployees(accountId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramCount = 0;

    if (query.search) {
      paramCount++;
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR employee_code ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    if (query.department) {
      paramCount++;
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` department = $${paramCount}`;
      params.push(query.department);
    }

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) FROM employees ${whereClause}`,
      params
    );

    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, email, phone, position, department, hire_date, 
              employee_code, salary_level, manager_id, status, created_at, updated_at
       FROM employees
       ${whereClause}
       ORDER BY created_at DESC
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

  async getEmployee(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, email, phone, position, department, hire_date,
              employee_code, salary_level, manager_id, status, created_at, updated_at
       FROM employees
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    return result.rows[0];
  }

  async createEmployee(accountId: string, employeeData: CreateEmployeeDto) {
    // Auto-generate employee_code if not provided
    const employee_code = employeeData.employee_code || `EMP${Date.now().toString().slice(-8)}`;
    
    // Auto-set hire_date if not provided
    const hire_date = employeeData.hire_date || new Date().toISOString().split('T')[0];

    const result = await this.db.queryWithAccount(
      accountId,
      `INSERT INTO employees (
        account_id, name, email, phone, position, department, 
        hire_date, employee_code, salary_level, manager_id, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        accountId,
        employeeData.full_name,
        employeeData.email,
        employeeData.phone || null,
        employeeData.position || null,
        employeeData.department || null,
        hire_date,
        employee_code,
        employeeData.salary_level || null,
        employeeData.manager_id || null,
        'active',
      ]
    );

    return result.rows[0];
  }

  async updateEmployee(accountId: string, id: string, employeeData: UpdateEmployeeDto) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (employeeData.full_name !== undefined) {
      updates.push(`name = $${++paramCount}`);
      params.push(employeeData.full_name);
    }
    if (employeeData.email !== undefined) {
      updates.push(`email = $${++paramCount}`);
      params.push(employeeData.email);
    }
    if (employeeData.phone !== undefined) {
      updates.push(`phone = $${++paramCount}`);
      params.push(employeeData.phone);
    }
    if (employeeData.position !== undefined) {
      updates.push(`position = $${++paramCount}`);
      params.push(employeeData.position);
    }
    if (employeeData.department !== undefined) {
      updates.push(`department = $${++paramCount}`);
      params.push(employeeData.department);
    }
    if (employeeData.salary_level !== undefined) {
      updates.push(`salary_level = $${++paramCount}`);
      params.push(employeeData.salary_level);
    }
    if (employeeData.manager_id !== undefined) {
      updates.push(`manager_id = $${++paramCount}`);
      params.push(employeeData.manager_id);
    }

    if (updates.length === 0) {
      return this.getEmployee(accountId, id);
    }

    params.push(id);
    const result = await this.db.queryWithAccount(
      accountId,
      `UPDATE employees SET ${updates.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    return result.rows[0];
  }

  async deleteEmployee(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      'DELETE FROM employees WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }
  }

  // ==================== SUPPLIERS ====================
  async getSuppliers(accountId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (query.status) {
      paramCount++;
      whereClause += ` AND s.status = $${paramCount}`;
      params.push(query.status);
    }

    if (query.search) {
      paramCount++;
      whereClause += ` AND (u.full_name ILIKE $${paramCount} OR s.company ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) as total FROM suppliers s JOIN users u ON s.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT s.*, u.full_name as name, u.email, u.username
       FROM suppliers s
       JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    );

    return {
      data: result.rows,
      total,
      page,
      limit,
    };
  }

  async getSupplier(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT s.*, u.full_name as name, u.email, u.username
       FROM suppliers s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    return result.rows[0];
  }

  async createSupplier(accountId: string, supplierData: CreateSupplierDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      const userResult = await client.query(
        `INSERT INTO users (account_id, full_name, username, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'supplier')
         RETURNING id`,
        [accountId, supplierData.full_name, supplierData.username, supplierData.email, 'placeholder_hash']
      );

      const userId = userResult.rows[0].id;

      const supplierResult = await client.query(
        `INSERT INTO suppliers (
          user_id, supplier_code, company_name, tax_id, 
          business_address, payment_terms, rating, status
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          userId,
          supplierData.supplier_code,
          supplierData.company_name,
          supplierData.tax_id || null,
          supplierData.business_address || null,
          supplierData.payment_terms || null,
          supplierData.rating || null,
          'active',
        ]
      );

      await client.query('COMMIT');
      return this.getSupplier(accountId, supplierResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create supplier: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async updateSupplier(accountId: string, id: string, supplierData: UpdateSupplierDto) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      if (supplierData.full_name) {
        await client.query(
          `UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2`,
          [supplierData.full_name, result.rows[0].user_id]
        );
      }

      const supplierFields = [];
      const supplierParams = [];
      let supplierParamCount = 0;

      if (supplierData.company_name !== undefined) {
        supplierParamCount++;
        supplierFields.push(`company_name = $${supplierParamCount}`);
        supplierParams.push(supplierData.company_name);
      }

      if (supplierData.phone !== undefined) {
        supplierParamCount++;
        supplierFields.push(`phone = $${supplierParamCount}`);
        supplierParams.push(supplierData.phone);
      }

      if (supplierData.business_address !== undefined) {
        supplierParamCount++;
        supplierFields.push(`business_address = $${supplierParamCount}`);
        supplierParams.push(supplierData.business_address);
      }

      if (supplierData.tax_id !== undefined) {
        supplierParamCount++;
        supplierFields.push(`tax_id = $${supplierParamCount}`);
        supplierParams.push(supplierData.tax_id);
      }

      if (supplierData.payment_terms !== undefined) {
        supplierParamCount++;
        supplierFields.push(`payment_terms = $${supplierParamCount}`);
        supplierParams.push(supplierData.payment_terms);
      }

      if (supplierData.rating !== undefined) {
        supplierParamCount++;
        supplierFields.push(`rating = $${supplierParamCount}`);
        supplierParams.push(supplierData.rating);
      }

      if (supplierFields.length > 0) {
        supplierParamCount++;
        supplierParams.push(id);
        await client.query(
          `UPDATE suppliers SET ${supplierFields.join(', ')}, updated_at = NOW() WHERE id = $${supplierParamCount}`,
          supplierParams
        );
      }

      await client.query('COMMIT');

      return this.getSupplier(accountId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update supplier: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async deleteSupplier(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Supplier not found');
    }

    await this.db.queryWithAccount(accountId, 'DELETE FROM users WHERE id = $1', [result.rows[0].user_id]);
  }

  // ==================== PROFESSIONALS ====================
  async getProfessionals(accountId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramCount = 0;

    if (query.status) {
      paramCount++;
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` status = $${paramCount}`;
      params.push(query.status);
    }

    if (query.search) {
      paramCount++;
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` (full_name ILIKE $${paramCount} OR specialty ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) as total FROM professionals ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, full_name, email, phone, specialty, hourly_rate, 
              availability_status, portfolio_url, rating, certifications, notes, status, created_at, updated_at
       FROM professionals
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total,
      page,
      limit,
    };
  }

  async getProfessional(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT id, name, full_name, email, phone, specialty, hourly_rate,
              availability_status, portfolio_url, rating, certifications, notes, status, created_at, updated_at
       FROM professionals
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }

    return result.rows[0];
  }

  async createProfessional(accountId: string, professionalData: CreateProfessionalDto) {
    const result = await this.db.queryWithAccount(
      accountId,
      `INSERT INTO professionals (
        account_id, name, full_name, email, phone, specialty, 
        hourly_rate, availability_status, portfolio_url, rating, 
        certifications, notes, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        accountId,
        professionalData.full_name, // Use full_name for both name and full_name
        professionalData.full_name,
        professionalData.email,
        professionalData.phone || null,
        professionalData.specialty || null,
        professionalData.hourly_rate || null,
        'available',
        professionalData.portfolio_url || null,
        professionalData.rating || null,
        professionalData.certifications || null,
        professionalData.notes || null,
        'active',
      ]
    );

    return result.rows[0];
  }

  async updateProfessional(accountId: string, id: string, professionalData: UpdateProfessionalDto) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (professionalData.full_name !== undefined) {
      updates.push(`full_name = $${++paramCount}`);
      updates.push(`name = $${paramCount}`); // Update both
      params.push(professionalData.full_name);
    }
    if (professionalData.email !== undefined) {
      updates.push(`email = $${++paramCount}`);
      params.push(professionalData.email);
    }
    if (professionalData.phone !== undefined) {
      updates.push(`phone = $${++paramCount}`);
      params.push(professionalData.phone);
    }
    if (professionalData.specialty !== undefined) {
      updates.push(`specialty = $${++paramCount}`);
      params.push(professionalData.specialty);
    }
    if (professionalData.hourly_rate !== undefined) {
      updates.push(`hourly_rate = $${++paramCount}`);
      params.push(professionalData.hourly_rate);
    }
    if (professionalData.availability_status !== undefined) {
      updates.push(`availability_status = $${++paramCount}`);
      params.push(professionalData.availability_status);
    }
    if (professionalData.portfolio_url !== undefined) {
      updates.push(`portfolio_url = $${++paramCount}`);
      params.push(professionalData.portfolio_url);
    }
    if (professionalData.rating !== undefined) {
      updates.push(`rating = $${++paramCount}`);
      params.push(professionalData.rating);
    }
    if (professionalData.certifications !== undefined) {
      updates.push(`certifications = $${++paramCount}`);
      params.push(professionalData.certifications);
    }
    if (professionalData.notes !== undefined) {
      updates.push(`notes = $${++paramCount}`);
      params.push(professionalData.notes);
    }
    if (professionalData.status !== undefined) {
      updates.push(`status = $${++paramCount}`);
      params.push(professionalData.status);
    }

    if (updates.length === 0) {
      return this.getProfessional(accountId, id);
    }

    params.push(id);
    const result = await this.db.queryWithAccount(
      accountId,
      `UPDATE professionals SET ${updates.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }

    return result.rows[0];
  }

  async deleteProfessional(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      'DELETE FROM professionals WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }
  }

  // ==================== PROJECTS ====================
  async getProjects(accountId: string, query: any) {
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

    const countResult = await this.db.queryWithAccount(accountId, `SELECT COUNT(*) FROM projects ${whereClause}`, params);

    const result = await this.db.queryWithAccount(
      accountId,
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

  async getProject(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }
    return result.rows[0];
  }

  async createProject(accountId: string, projectData: CreateProjectDto) {
    const result = await this.db.queryWithAccount(
      accountId,
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

  async updateProject(accountId: string, id: string, projectData: UpdateProjectDto) {
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
      return this.getProject(accountId, id);
    }

    params.push(id);
    await this.db.queryWithAccount(
      accountId,
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
      params
    );

    return this.getProject(accountId, id);
  }

  async deleteProject(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }
  }

  // ==================== TASKS ====================
  async getTasks(accountId: string, query: any) {
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

    const countResult = await this.db.queryWithAccount(accountId, `SELECT COUNT(*) FROM tasks ${whereClause}`, params);

    const result = await this.db.queryWithAccount(
      accountId,
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

  async getTask(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT * FROM tasks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Task not found');
    }
    return result.rows[0];
  }

  async createTask(accountId: string, taskData: CreateTaskDto) {
    const result = await this.db.queryWithAccount(
      accountId,
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

  async updateTask(accountId: string, id: string, taskData: UpdateTaskDto) {
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
      return this.getTask(accountId, id);
    }

    params.push(id);
    await this.db.queryWithAccount(
      accountId,
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${++paramCount}`,
      params
    );

    return this.getTask(accountId, id);
  }

  async deleteTask(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Task not found');
    }
  }
}
