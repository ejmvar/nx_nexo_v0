import { CrmService } from './crm.service.js';
export declare class CrmController {
    private crmService;
    constructor(crmService: CrmService);
    getCustomers(query: any): Promise<{
        data: {
            id: string;
            customerNumber: string;
            companyName: string;
            contactPerson: string;
            email: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            isActive: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCustomer(id: string): Promise<{
        id: string;
        customerNumber: string;
        companyName: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    createCustomer(customerData: any): Promise<any>;
    updateCustomer(id: string, customerData: any): Promise<{
        id: string;
        customerNumber: string;
        companyName: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        isActive: boolean;
        createdAt: Date;
    }>;
    deleteCustomer(id: string): Promise<{
        message: string;
    }>;
    getCustomerContacts(customerId: string): Promise<{
        id: string;
        customerId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        position: string;
        isPrimary: boolean;
    }[]>;
    createCustomerContact(customerId: string, contactData: any): Promise<any>;
    getLeads(query: any): Promise<{
        data: {
            id: string;
            leadNumber: string;
            customerId: any;
            contactName: string;
            companyName: string;
            email: string;
            phone: string;
            source: string;
            status: string;
            estimatedValue: number;
            probability: number;
            notes: string;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getLead(id: string): Promise<{
        id: string;
        leadNumber: string;
        customerId: any;
        contactName: string;
        companyName: string;
        email: string;
        phone: string;
        source: string;
        status: string;
        estimatedValue: number;
        probability: number;
        notes: string;
        createdAt: Date;
    }>;
    createLead(leadData: any): Promise<any>;
    updateLead(id: string, leadData: any): Promise<{
        id: string;
        leadNumber: string;
        customerId: any;
        contactName: string;
        companyName: string;
        email: string;
        phone: string;
        source: string;
        status: string;
        estimatedValue: number;
        probability: number;
        notes: string;
        createdAt: Date;
    }>;
    deleteLead(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=crm.controller.d.ts.map