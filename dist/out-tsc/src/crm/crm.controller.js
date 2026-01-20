import { __decorate, __metadata, __param } from "tslib";
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CrmService } from './crm.service.js';
let CrmController = class CrmController {
    constructor(crmService) {
        this.crmService = crmService;
    }
    // Customer endpoints
    async getCustomers(query) {
        return this.crmService.getCustomers(query);
    }
    async getCustomer(id) {
        return this.crmService.getCustomer(id);
    }
    async createCustomer(customerData) {
        return this.crmService.createCustomer(customerData);
    }
    async updateCustomer(id, customerData) {
        return this.crmService.updateCustomer(id, customerData);
    }
    async deleteCustomer(id) {
        return this.crmService.deleteCustomer(id);
    }
    // Customer contacts endpoints
    async getCustomerContacts(customerId) {
        return this.crmService.getCustomerContacts(customerId);
    }
    async createCustomerContact(customerId, contactData) {
        return this.crmService.createCustomerContact(customerId, contactData);
    }
    // Leads endpoints
    async getLeads(query) {
        return this.crmService.getLeads(query);
    }
    async getLead(id) {
        return this.crmService.getLead(id);
    }
    async createLead(leadData) {
        return this.crmService.createLead(leadData);
    }
    async updateLead(id, leadData) {
        return this.crmService.updateLead(id, leadData);
    }
    async deleteLead(id) {
        return this.crmService.deleteLead(id);
    }
};
__decorate([
    Get('customers'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getCustomers", null);
__decorate([
    Get('customers/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getCustomer", null);
__decorate([
    Post('customers'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createCustomer", null);
__decorate([
    Put('customers/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "updateCustomer", null);
__decorate([
    Delete('customers/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "deleteCustomer", null);
__decorate([
    Get('customers/:customerId/contacts'),
    __param(0, Param('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getCustomerContacts", null);
__decorate([
    Post('customers/:customerId/contacts'),
    __param(0, Param('customerId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createCustomerContact", null);
__decorate([
    Get('leads'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getLeads", null);
__decorate([
    Get('leads/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getLead", null);
__decorate([
    Post('leads'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createLead", null);
__decorate([
    Put('leads/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "updateLead", null);
__decorate([
    Delete('leads/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "deleteLead", null);
CrmController = __decorate([
    Controller('crm'),
    __metadata("design:paramtypes", [CrmService])
], CrmController);
export { CrmController };
//# sourceMappingURL=crm.controller.js.map