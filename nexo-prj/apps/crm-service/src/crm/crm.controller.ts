import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
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
  async getClients(@Query() query: any) {
    return this.crmService.getClients(query);
  }

  @Get('clients/:id')
  async getClient(@Param('id') id: string) {
    return this.crmService.getClient(id);
  }

  @Post('clients')
  async createClient(@Body() clientData: CreateClientDto) {
    return this.crmService.createClient(clientData);
  }

  @Put('clients/:id')
  async updateClient(@Param('id') id: string, @Body() clientData: UpdateClientDto) {
    return this.crmService.updateClient(id, clientData);
  }

  @Delete('clients/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClient(@Param('id') id: string) {
    await this.crmService.deleteClient(id);
  }

  // ==================== EMPLOYEES ====================
  @Get('employees')
  async getEmployees(@Query() query: any) {
    return this.crmService.getEmployees(query);
  }

  @Get('employees/:id')
  async getEmployee(@Param('id') id: string) {
    return this.crmService.getEmployee(id);
  }

  @Post('employees')
  async createEmployee(@Body() employeeData: CreateEmployeeDto) {
    return this.crmService.createEmployee(employeeData);
  }

  @Put('employees/:id')
  async updateEmployee(@Param('id') id: string, @Body() employeeData: UpdateEmployeeDto) {
    return this.crmService.updateEmployee(id, employeeData);
  }

  @Delete('employees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEmployee(@Param('id') id: string) {
    await this.crmService.deleteEmployee(id);
  }

  // ==================== SUPPLIERS ====================
  @Get('suppliers')
  async getSuppliers(@Query() query: any) {
    return this.crmService.getSuppliers(query);
  }

  @Get('suppliers/:id')
  async getSupplier(@Param('id') id: string) {
    return this.crmService.getSupplier(id);
  }

  @Post('suppliers')
  async createSupplier(@Body() supplierData: CreateSupplierDto) {
    return this.crmService.createSupplier(supplierData);
  }

  @Put('suppliers/:id')
  async updateSupplier(@Param('id') id: string, @Body() supplierData: UpdateSupplierDto) {
    return this.crmService.updateSupplier(id, supplierData);
  }

  @Delete('suppliers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSupplier(@Param('id') id: string) {
    await this.crmService.deleteSupplier(id);
  }

  // ==================== PROFESSIONALS ====================
  @Get('professionals')
  async getProfessionals(@Query() query: any) {
    return this.crmService.getProfessionals(query);
  }

  @Get('professionals/:id')
  async getProfessional(@Param('id') id: string) {
    return this.crmService.getProfessional(id);
  }

  @Post('professionals')
  async createProfessional(@Body() professionalData: CreateProfessionalDto) {
    return this.crmService.createProfessional(professionalData);
  }

  @Put('professionals/:id')
  async updateProfessional(@Param('id') id: string, @Body() professionalData: UpdateProfessionalDto) {
    return this.crmService.updateProfessional(id, professionalData);
  }

  @Delete('professionals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfessional(@Param('id') id: string) {
    await this.crmService.deleteProfessional(id);
  }

  // ==================== PROJECTS ====================
  @Get('projects')
  async getProjects(@Query() query: any) {
    return this.crmService.getProjects(query);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    return this.crmService.getProject(id);
  }

  @Post('projects')
  async createProject(@Body() projectData: CreateProjectDto) {
    return this.crmService.createProject(projectData);
  }

  @Put('projects/:id')
  async updateProject(@Param('id') id: string, @Body() projectData: UpdateProjectDto) {
    return this.crmService.updateProject(id, projectData);
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Param('id') id: string) {
    await this.crmService.deleteProject(id);
  }

  // ==================== TASKS ====================
  @Get('tasks')
  async getTasks(@Query() query: any) {
    return this.crmService.getTasks(query);
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.crmService.getTask(id);
  }

  @Post('tasks')
  async createTask(@Body() taskData: CreateTaskDto) {
    return this.crmService.createTask(taskData);
  }

  @Put('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() taskData: UpdateTaskDto) {
    return this.crmService.updateTask(id, taskData);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.crmService.deleteTask(id);
  }
}