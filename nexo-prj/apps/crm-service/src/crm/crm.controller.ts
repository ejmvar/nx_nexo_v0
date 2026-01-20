import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CrmService } from './crm.service.js';

@Controller('crm')
export class CrmController {
  constructor(private crmService: CrmService) {}

  // Customer endpoints
  @Get('customers')
  async getCustomers(@Query() query: any) {
    return this.crmService.getCustomers(query);
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    return this.crmService.getCustomer(id);
  }

  @Post('customers')
  async createCustomer(@Body() customerData: any) {
    return this.crmService.createCustomer(customerData);
  }

  @Put('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() customerData: any) {
    return this.crmService.updateCustomer(id, customerData);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.crmService.deleteCustomer(id);
  }

  // Customer contacts endpoints
  @Get('customers/:customerId/contacts')
  async getCustomerContacts(@Param('customerId') customerId: string) {
    return this.crmService.getCustomerContacts(customerId);
  }

  @Post('customers/:customerId/contacts')
  async createCustomerContact(@Param('customerId') customerId: string, @Body() contactData: any) {
    return this.crmService.createCustomerContact(customerId, contactData);
  }

  // Leads endpoints
  @Get('leads')
  async getLeads(@Query() query: any) {
    return this.crmService.getLeads(query);
  }

  @Get('leads/:id')
  async getLead(@Param('id') id: string) {
    return this.crmService.getLead(id);
  }

  @Post('leads')
  async createLead(@Body() leadData: any) {
    return this.crmService.createLead(leadData);
  }

  @Put('leads/:id')
  async updateLead(@Param('id') id: string, @Body() leadData: any) {
    return this.crmService.updateLead(id, leadData);
  }

  @Delete('leads/:id')
  async deleteLead(@Param('id') id: string) {
    return this.crmService.deleteLead(id);
  }
}