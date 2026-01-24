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

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) FROM users u INNER JOIN clients c ON c.user_id = u.id ${whereClause}`,
      params
    );

    const result = await this.db.queryWithAccount(
      accountId,
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

  async getClient(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
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

  async createClient(accountId: string, clientData: CreateClientDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      // Auto-generate username if not provided
      const username = clientData.username || clientData.email.split('@')[0];
      
      // Auto-generate client_code if not provided
      const client_code = clientData.client_code || `CL${Date.now().toString().slice(-8)}`;

      // Create user first (using correct Prisma schema columns)
      const userResult = await client.query(
        `INSERT INTO users (account_id, email, username, password_hash, first_name, last_name, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          accountId,
          clientData.email,
          username,
          clientData.password ? `temp_${clientData.password}` : 'temporary_hash', // Simplified for now
          clientData.full_name?.split(' ')[0] || clientData.full_name || 'Client',
          clientData.full_name?.split(' ').slice(1).join(' ') || '',
          true,
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

      return this.getClient(accountId, clientResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create client: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async updateClient(accountId: string, id: string, clientData: UpdateClientDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

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

      return this.getClient(accountId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update client: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async deleteClient(accountId: string, id: string) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

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
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  // ==================== EMPLOYEES ====================
  async getEmployees(accountId: string, query: any) {
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

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) FROM users u INNER JOIN employees e ON e.user_id = u.id ${whereClause}`,
      params
    );

    const result = await this.db.queryWithAccount(
      accountId,
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

  async getEmployee(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
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

  async createEmployee(accountId: string, employeeData: CreateEmployeeDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      // Auto-generate username if not provided
      const username = employeeData.username || employeeData.email.split('@')[0];
      
      // Auto-generate employee_code if not provided
      const employee_code = employeeData.employee_code || `EMP${Date.now().toString().slice(-8)}`;
      
      // Auto-set hire_date if not provided
      const hire_date = employeeData.hire_date || new Date().toISOString().split('T')[0];

      const userResult = await client.query(
        `INSERT INTO users (account_id, email, username, password_hash, full_name, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          accountId,
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

      return this.getEmployee(accountId, employeeResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create employee: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async updateEmployee(accountId: string, id: string, employeeData: UpdateEmployeeDto) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      const userId = result.rows[0].user_id;
      const userUpdates: string[] = [];
      const userParams: any[] = [];
      let paramCount = 0;

      if (employeeData.full_name) {
        userUpdates.push(`full_name = $${++paramCount}`);
        userParams.push(employeeData.full_name);
      }
      if (employeeData.phone !== undefined) {
        userUpdates.push(`phone = $${++paramCount}`);
        userParams.push(employeeData.phone);
      }

      if (userUpdates.length > 0) {
        userParams.push(userId);
        await client.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${++paramCount}`, userParams);
      }

      const employeeUpdates: string[] = [];
      const employeeParams: any[] = [];
      paramCount = 0;

      if (employeeData.department !== undefined) {
        employeeUpdates.push(`department = $${++paramCount}`);
        employeeParams.push(employeeData.department);
      }
      if (employeeData.position !== undefined) {
        employeeUpdates.push(`position = $${++paramCount}`);
        employeeParams.push(employeeData.position);
      }
      if (employeeData.salary_level !== undefined) {
        employeeUpdates.push(`salary_level = $${++paramCount}`);
        employeeParams.push(employeeData.salary_level);
      }

      if (employeeUpdates.length > 0) {
        employeeParams.push(id);
        await client.query(`UPDATE employees SET ${employeeUpdates.join(', ')} WHERE id = $${++paramCount}`, employeeParams);
      }

      await client.query('COMMIT');
      return this.getEmployee(accountId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update employee: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async deleteEmployee(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM employees WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Employee not found');
    }

    await this.db.queryWithAccount(accountId, 'DELETE FROM users WHERE id = $1', [result.rows[0].user_id]);
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

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (query.status) {
      paramCount++;
      whereClause += ` AND p.status = $${paramCount}`;
      params.push(query.status);
    }

    if (query.search) {
      paramCount++;
      whereClause += ` AND (u.full_name ILIKE $${paramCount} OR p.specialty ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${query.search}%`);
    }

    const countResult = await this.db.queryWithAccount(
      accountId,
      `SELECT COUNT(*) as total FROM professionals p JOIN users u ON p.user_id = u.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT p.*, u.full_name as name, u.email, u.username
       FROM professionals p
       JOIN users u ON p.user_id = u.id
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

  async getProfessional(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(
      accountId,
      `SELECT p.*, u.full_name as name, u.email, u.username
       FROM professionals p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }

    return result.rows[0];
  }

  async createProfessional(accountId: string, professionalData: CreateProfessionalDto) {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (account_id, full_name, username, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'professional')
         RETURNING id`,
        [accountId, professionalData.full_name, professionalData.username, professionalData.email, 'placeholder_hash']
      );

      const userId = userResult.rows[0].id;

      const professionalResult = await client.query(
        `INSERT INTO professionals (
          user_id, professional_code, specialty, phone, 
          hourly_rate, rating, years_experience, 
          certifications, available, status
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          userId,
          professionalData.professional_code,
          professionalData.specialty || null,
          professionalData.phone || null,
          professionalData.hourly_rate || null,
          professionalData.rating || null,
          professionalData.years_experience || null,
          professionalData.certifications ? JSON.stringify(professionalData.certifications) : null,
          professionalData.available !== undefined ? professionalData.available : true,
          'active',
        ]
      );

      await client.query('COMMIT');

      return this.getProfessional(accountId, professionalResult.rows[0].id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to create professional: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async updateProfessional(accountId: string, id: string, professionalData: UpdateProfessionalDto) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM professionals WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL app.current_account_id = $1', [accountId]);

      if (professionalData.full_name) {
        const updateFields = [];
        const params = [];
        let paramCount = 0;

        if (professionalData.full_name) {
          paramCount++;
          updateFields.push(`full_name = $${paramCount}`);
          params.push(professionalData.full_name);
        }

        paramCount++;
        params.push(result.rows[0].user_id);

        await client.query(
          `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
          params
        );
      }

      const professionalFields = [];
      const professionalParams = [];
      let professionalParamCount = 0;

      if (professionalData.specialty !== undefined) {
        professionalParamCount++;
        professionalFields.push(`specialty = $${professionalParamCount}`);
        professionalParams.push(professionalData.specialty);
      }

      if (professionalData.phone !== undefined) {
        professionalParamCount++;
        professionalFields.push(`phone = $${professionalParamCount}`);
        professionalParams.push(professionalData.phone);
      }

      if (professionalData.hourly_rate !== undefined) {
        professionalParamCount++;
        professionalFields.push(`hourly_rate = $${professionalParamCount}`);
        professionalParams.push(professionalData.hourly_rate);
      }

      if (professionalData.status !== undefined) {
        professionalParamCount++;
        professionalFields.push(`status = $${professionalParamCount}`);
        professionalParams.push(professionalData.status);
      }

      if (professionalFields.length > 0) {
        professionalParamCount++;
        professionalParams.push(id);
        await client.query(
          `UPDATE professionals SET ${professionalFields.join(', ')}, updated_at = NOW() WHERE id = $${professionalParamCount}`,
          professionalParams
        );
      }

      await client.query('COMMIT');

      return this.getProfessional(accountId, id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new BadRequestException(`Failed to update professional: ${error.message}`);
    } finally {
      await client.query('RESET app.current_account_id').catch(() => {});
      client.release();
    }
  }

  async deleteProfessional(accountId: string, id: string) {
    const result = await this.db.queryWithAccount(accountId, 'SELECT user_id FROM professionals WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Professional not found');
    }

    await this.db.queryWithAccount(accountId, 'DELETE FROM users WHERE id = $1', [result.rows[0].user_id]);
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
