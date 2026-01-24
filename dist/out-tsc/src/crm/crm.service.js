import { __decorate } from "tslib";
import { Injectable } from '@nestjs/common';
let CrmService = class CrmService {
    constructor() {
        // Mock data - replace with database queries later
        this.customers = [
            {
                id: '1',
                customerNumber: 'CUST001',
                companyName: 'Acme Corporation',
                contactPerson: 'John Doe',
                email: 'john@acme.com',
                phone: '+1-555-0123',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'USA',
                isActive: true,
                createdAt: new Date(),
            },
            {
                id: '2',
                customerNumber: 'CUST002',
                companyName: 'Tech Solutions Inc',
                contactPerson: 'Jane Smith',
                email: 'jane@techsolutions.com',
                phone: '+1-555-0456',
                address: '456 Oak Ave',
                city: 'San Francisco',
                state: 'CA',
                postalCode: '94102',
                country: 'USA',
                isActive: true,
                createdAt: new Date(),
            },
        ];
        this.customerContacts = [
            {
                id: '1',
                customerId: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@acme.com',
                phone: '+1-555-0123',
                position: 'CEO',
                isPrimary: true,
            },
            {
                id: '2',
                customerId: '1',
                firstName: 'Bob',
                lastName: 'Johnson',
                email: 'bob@acme.com',
                phone: '+1-555-0124',
                position: 'CTO',
                isPrimary: false,
            },
        ];
        this.leads = [
            {
                id: '1',
                leadNumber: 'LEAD001',
                customerId: null,
                contactName: 'Alice Wilson',
                companyName: 'StartupXYZ',
                email: 'alice@startupxyz.com',
                phone: '+1-555-0789',
                source: 'Website',
                status: 'qualified',
                estimatedValue: 50000,
                probability: 75,
                notes: 'Interested in our premium package',
                createdAt: new Date(),
            },
        ];
    }
    // Customer methods
    async getCustomers(query) {
        // Mock filtering - replace with database query
        let filteredCustomers = [...this.customers];
        if (query.search) {
            const searchTerm = query.search.toLowerCase();
            filteredCustomers = filteredCustomers.filter(customer => customer.companyName.toLowerCase().includes(searchTerm) ||
                customer.contactPerson.toLowerCase().includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm));
        }
        if (query.isActive !== undefined) {
            filteredCustomers = filteredCustomers.filter(customer => customer.isActive === (query.isActive === 'true'));
        }
        return {
            data: filteredCustomers,
            total: filteredCustomers.length,
            page: parseInt(query.page) || 1,
            limit: parseInt(query.limit) || 10,
        };
    }
    async getCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer;
    }
    async createCustomer(customerData) {
        const newCustomer = {
            id: (this.customers.length + 1).toString(),
            customerNumber: `CUST${String(this.customers.length + 1).padStart(3, '0')}`,
            ...customerData,
            isActive: true,
            createdAt: new Date(),
        };
        this.customers.push(newCustomer);
        return newCustomer;
    }
    async updateCustomer(id, customerData) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Customer not found');
        }
        this.customers[index] = { ...this.customers[index], ...customerData };
        return this.customers[index];
    }
    async deleteCustomer(id) {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error('Customer not found');
        }
        this.customers.splice(index, 1);
        return { message: 'Customer deleted successfully' };
    }
    // Customer contacts methods
    async getCustomerContacts(customerId) {
        return this.customerContacts.filter(contact => contact.customerId === customerId);
    }
    async createCustomerContact(customerId, contactData) {
        const newContact = {
            id: (this.customerContacts.length + 1).toString(),
            customerId,
            ...contactData,
        };
        this.customerContacts.push(newContact);
        return newContact;
    }
    // Lead methods
    async getLeads(query) {
        let filteredLeads = [...this.leads];
        if (query.status) {
            filteredLeads = filteredLeads.filter(lead => lead.status === query.status);
        }
        if (query.search) {
            const searchTerm = query.search.toLowerCase();
            filteredLeads = filteredLeads.filter(lead => lead.contactName.toLowerCase().includes(searchTerm) ||
                lead.companyName.toLowerCase().includes(searchTerm) ||
                lead.email.toLowerCase().includes(searchTerm));
        }
        return {
            data: filteredLeads,
            total: filteredLeads.length,
            page: parseInt(query.page) || 1,
            limit: parseInt(query.limit) || 10,
        };
    }
    async getLead(id) {
        const lead = this.leads.find(l => l.id === id);
        if (!lead) {
            throw new Error('Lead not found');
        }
        return lead;
    }
    async createLead(leadData) {
        const newLead = {
            id: (this.leads.length + 1).toString(),
            leadNumber: `LEAD${String(this.leads.length + 1).padStart(3, '0')}`,
            ...leadData,
            createdAt: new Date(),
        };
        this.leads.push(newLead);
        return newLead;
    }
    async updateLead(id, leadData) {
        const index = this.leads.findIndex(l => l.id === id);
        if (index === -1) {
            throw new Error('Lead not found');
        }
        this.leads[index] = { ...this.leads[index], ...leadData };
        return this.leads[index];
    }
    async deleteLead(id) {
        const index = this.leads.findIndex(l => l.id === id);
        if (index === -1) {
            throw new Error('Lead not found');
        }
        this.leads.splice(index, 1);
        return { message: 'Lead deleted successfully' };
    }
};
CrmService = __decorate([
    Injectable()
], CrmService);
export { CrmService };
//# sourceMappingURL=crm.service.js.map