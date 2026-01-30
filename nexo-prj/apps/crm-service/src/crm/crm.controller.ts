import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, UseInterceptors, Res } from '@nestjs/common';
import { CrmService } from './crm.service.js';
import { ExportService } from './services/export.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { AuditLoggerInterceptor } from '../common/interceptors/audit-logger.interceptor.js';
import { AccountId } from '../decorators/account-id.decorator.js';
import { createReadStream } from 'fs';
import { Response } from 'express';
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

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard) // Protect all CRM routes with auth + permissions
@UseInterceptors(AuditLoggerInterceptor) // Log all CRUD operations
export class CrmController {
  constructor(
    private crmService: CrmService,
    private exportService: ExportService,
  ) {}

  // Health check (public - override guard)
  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'crm-service',
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== CLIENTS ====================
  @Get('clients')
  @RequirePermissions('client:read')
  getClients(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getClients(accountId, query);
  }

  @Get('clients/:id')
  @RequirePermissions('client:read')
  getClient(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getClient(accountId, id);
  }

  @Post('clients')
  @RequirePermissions('client:write')
  async createClient(@AccountId() accountId: string, @Body() clientData: CreateClientDto) {
    return this.crmService.createClient(accountId, clientData);
  }

  @Put('clients/:id')
  @RequirePermissions('client:write')
  updateClient(@AccountId() accountId: string, @Param('id') id: string, @Body() clientData: UpdateClientDto) {
    return this.crmService.updateClient(accountId, id, clientData);
  }

  @Delete('clients/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('client:delete')
  async deleteClient(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteClient(accountId, id);
  }

  @Get('clients/export')
  @RequirePermissions('client:read')
  async exportClients(
    @AccountId() accountId: string,
    @Query() query: any,
    @Query('format') format: 'csv' | 'excel' = 'csv',
    @Res() res: Response,
  ) {
    const result = await this.crmService.getClients(accountId, { ...query, limit: 10000 });
    const data = this.exportService.formatClientsForExport(result.data);
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const filename = `clients-${timestamp}`;
    
    let filepath: string;
    if (format === 'excel') {
      filepath = await this.exportService.exportToExcel(
        data,
        this.exportService.getClientsExcelColumns(),
        filename,
        'Clients'
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    } else {
      filepath = await this.exportService.exportToCSV(
        data,
        this.exportService.getClientsCSVHeaders(),
        filename
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    }
    
    const fileStream = createReadStream(filepath);
    fileStream.pipe(res);
  }

  // ==================== EMPLOYEES ====================
  @Get('employees')
  @RequirePermissions('employee:read')
  getEmployees(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getEmployees(accountId, query);
  }

  @Get('employees/:id')
  @RequirePermissions('employee:read')
  getEmployee(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getEmployee(accountId, id);
  }

  @Post('employees')
  @RequirePermissions('employee:write')
  async createEmployee(@AccountId() accountId: string, @Body() employeeData: CreateEmployeeDto) {
    return this.crmService.createEmployee(accountId, employeeData);
  }

  @Put('employees/:id')
  @RequirePermissions('employee:write')
  updateEmployee(@AccountId() accountId: string, @Param('id') id: string, @Body() employeeData: UpdateEmployeeDto) {
    return this.crmService.updateEmployee(accountId, id, employeeData);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('employee:delete')
  async deleteEmployee(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteEmployee(accountId, id);
  }

  @Get('employees/export')
  @RequirePermissions('employee:read')
  async exportEmployees(
    @AccountId() accountId: string,
    @Query() query: any,
    @Query('format') format: 'csv' | 'excel' = 'csv',
    @Res() res: Response,
  ) {
    const result = await this.crmService.getEmployees(accountId, { ...query, limit: 10000 });
    const data = this.exportService.formatEmployeesForExport(result.data);
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const filename = `employees-${timestamp}`;
    
    let filepath: string;
    if (format === 'excel') {
      filepath = await this.exportService.exportToExcel(
        data,
        this.exportService.getEmployeesExcelColumns(),
        filename,
        'Employees'
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    } else {
      filepath = await this.exportService.exportToCSV(
        data,
        this.exportService.getEmployeesCSVHeaders(),
        filename
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    }
    
    const fileStream = createReadStream(filepath);
    fileStream.pipe(res);
  }

  // ==================== SUPPLIERS ====================
  @Get('suppliers')
  @RequirePermissions('supplier:read')
  getSuppliers(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getSuppliers(accountId, query);
  }

  @Get('suppliers/:id')
  @RequirePermissions('supplier:read')
  getSupplier(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getSupplier(accountId, id);
  }

  @Post('suppliers')
  @RequirePermissions('supplier:write')
  async createSupplier(@AccountId() accountId: string, @Body() supplierData: CreateSupplierDto) {
    return this.crmService.createSupplier(accountId, supplierData);
  }

  @Put('suppliers/:id')
  @RequirePermissions('supplier:write')
  updateSupplier(@AccountId() accountId: string, @Param('id') id: string, @Body() supplierData: UpdateSupplierDto) {
    return this.crmService.updateSupplier(accountId, id, supplierData);
  }

  @Delete('suppliers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('supplier:delete')
  async deleteSupplier(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteSupplier(accountId, id);
  }

  // ==================== PROFESSIONALS ====================
  @Get('professionals')
  @RequirePermissions('professional:read')
  getProfessionals(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getProfessionals(accountId, query);
  }

  @Get('professionals/:id')
  @RequirePermissions('professional:read')
  getProfessional(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getProfessional(accountId, id);
  }

  @Post('professionals')
  @RequirePermissions('professional:write')
  async createProfessional(@AccountId() accountId: string, @Body() professionalData: CreateProfessionalDto) {
    return this.crmService.createProfessional(accountId, professionalData);
  }

  @Put('professionals/:id')
  @RequirePermissions('professional:write')
  updateProfessional(@AccountId() accountId: string, @Param('id') id: string, @Body() professionalData: UpdateProfessionalDto) {
    return this.crmService.updateProfessional(accountId, id, professionalData);
  }

  @Delete('professionals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('professional:delete')
  deleteProfessional(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.deleteProfessional(accountId, id);
  }

  // ==================== PROJECTS ====================
  @Get('projects')
  @RequirePermissions('project:read')
  getProjects(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getProjects(accountId, query);
  }

  @Get('projects/:id')
  @RequirePermissions('project:read')
  getProject(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getProject(accountId, id);
  }

  @Post('projects')
  @RequirePermissions('project:write')
  async createProject(@AccountId() accountId: string, @Body() projectData: CreateProjectDto) {
    return this.crmService.createProject(accountId, projectData);
  }

  @Put('projects/:id')
  @RequirePermissions('project:write')
  updateProject(@AccountId() accountId: string, @Param('id') id: string, @Body() projectData: UpdateProjectDto) {
    return this.crmService.updateProject(accountId, id, projectData);
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('project:delete')
  async deleteProject(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteProject(accountId, id);
  }

  // ==================== TASKS ====================
  @Get('tasks')
  @RequirePermissions('task:read')
  getTasks(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getTasks(accountId, query);
  }

  @Get('tasks/:id')
  @RequirePermissions('task:read')
  getTask(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getTask(accountId, id);
  }

  @Post('tasks')
  @RequirePermissions('task:write')
  async createTask(@AccountId() accountId: string, @Body() taskData: CreateTaskDto) {
    return this.crmService.createTask(accountId, taskData);
  }

  @Put('tasks/:id')
  @RequirePermissions('task:write')
  updateTask(@AccountId() accountId: string, @Param('id') id: string, @Body() taskData: UpdateTaskDto) {
    return this.crmService.updateTask(accountId, id, taskData);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('task:delete')
  async deleteTask(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteTask(accountId, id);
  }
}