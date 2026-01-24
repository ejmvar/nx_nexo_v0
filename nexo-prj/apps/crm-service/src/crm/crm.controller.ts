import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AccountId } from '../decorators/account-id.decorator.js';
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
@UseGuards(JwtAuthGuard) // Protect all CRM routes
export class CrmController {
  constructor(private crmService: CrmService) {}

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
  getClients(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getClients(accountId, query);
  }

  @Get('clients/:id')
  getClient(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getClient(accountId, id);
  }

  @Post('clients')
  async createClient(@AccountId() accountId: string, @Body() clientData: CreateClientDto) {
    return this.crmService.createClient(accountId, clientData);
  }

  @Put('clients/:id')
  updateClient(@AccountId() accountId: string, @Param('id') id: string, @Body() clientData: UpdateClientDto) {
    return this.crmService.updateClient(accountId, id, clientData);
  }

  @Delete('clients/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteClient(accountId, id);
  }

  // ==================== EMPLOYEES ====================
  @Get('employees')
  getEmployees(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getEmployees(accountId, query);
  }

  @Get('employees/:id')
  getEmployee(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getEmployee(accountId, id);
  }

  @Post('employees')
  async createEmployee(@AccountId() accountId: string, @Body() employeeData: CreateEmployeeDto) {
    return this.crmService.createEmployee(accountId, employeeData);
  }

  @Put('employees/:id')
  updateEmployee(@AccountId() accountId: string, @Param('id') id: string, @Body() employeeData: UpdateEmployeeDto) {
    return this.crmService.updateEmployee(accountId, id, employeeData);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteEmployee(accountId, id);
  }

  // ==================== SUPPLIERS ====================
  @Get('suppliers')
  getSuppliers(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getSuppliers(accountId, query);
  }

  @Get('suppliers/:id')
  getSupplier(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getSupplier(accountId, id);
  }

  @Post('suppliers')
  async createSupplier(@AccountId() accountId: string, @Body() supplierData: CreateSupplierDto) {
    return this.crmService.createSupplier(accountId, supplierData);
  }

  @Put('suppliers/:id')
  updateSupplier(@AccountId() accountId: string, @Param('id') id: string, @Body() supplierData: UpdateSupplierDto) {
    return this.crmService.updateSupplier(accountId, id, supplierData);
  }

  @Delete('suppliers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSupplier(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteSupplier(accountId, id);
  }

  // ==================== PROFESSIONALS ====================
  @Get('professionals')
  getProfessionals(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getProfessionals(accountId, query);
  }

  @Get('professionals/:id')
  getProfessional(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getProfessional(accountId, id);
  }

  @Post('professionals')
  async createProfessional(@AccountId() accountId: string, @Body() professionalData: CreateProfessionalDto) {
    return this.crmService.createProfessional(accountId, professionalData);
  }

  @Put('professionals/:id')
  updateProfessional(@AccountId() accountId: string, @Param('id') id: string, @Body() professionalData: UpdateProfessionalDto) {
    return this.crmService.updateProfessional(accountId, id, professionalData);
  }

  @Delete('professionals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProfessional(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.deleteProfessional(accountId, id);
  }

  // ==================== PROJECTS ====================
  @Get('projects')
  getProjects(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getProjects(accountId, query);
  }

  @Get('projects/:id')
  getProject(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getProject(accountId, id);
  }

  @Post('projects')
  async createProject(@AccountId() accountId: string, @Body() projectData: CreateProjectDto) {
    return this.crmService.createProject(accountId, projectData);
  }

  @Put('projects/:id')
  updateProject(@AccountId() accountId: string, @Param('id') id: string, @Body() projectData: UpdateProjectDto) {
    return this.crmService.updateProject(accountId, id, projectData);
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteProject(accountId, id);
  }

  // ==================== TASKS ====================
  @Get('tasks')
  getTasks(@AccountId() accountId: string, @Query() query: any) {
    return this.crmService.getTasks(accountId, query);
  }

  @Get('tasks/:id')
  getTask(@AccountId() accountId: string, @Param('id') id: string) {
    return this.crmService.getTask(accountId, id);
  }

  @Post('tasks')
  async createTask(@AccountId() accountId: string, @Body() taskData: CreateTaskDto) {
    return this.crmService.createTask(accountId, taskData);
  }

  @Put('tasks/:id')
  updateTask(@AccountId() accountId: string, @Param('id') id: string, @Body() taskData: UpdateTaskDto) {
    return this.crmService.updateTask(accountId, id, taskData);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@AccountId() accountId: string, @Param('id') id: string) {
    await this.crmService.deleteTask(accountId, id);
  }
}