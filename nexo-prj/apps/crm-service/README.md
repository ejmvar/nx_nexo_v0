# CRM Service

The CRM (Customer Relationship Management) Service manages customer data, contacts, and leads for the NEXO ERP system. It provides comprehensive customer lifecycle management with mock data implementation.

## Overview

- **Port**: 3002
- **Framework**: NestJS
- **Purpose**: Customer and lead management

## Features

- **Customer Management**: Full CRUD operations for customers
- **Contact Management**: Customer contact information
- **Lead Management**: Sales lead tracking and management
- **Mock Data**: Pre-populated test data
- **RESTful API**: Standard HTTP methods and status codes

## API Endpoints

### Customers
- `GET /crm/customers` - List all customers
- `GET /crm/customers/:id` - Get customer by ID
- `POST /crm/customers` - Create new customer
- `PUT /crm/customers/:id` - Update customer
- `DELETE /crm/customers/:id` - Delete customer

### Customer Contacts
- `GET /crm/customers/:customerId/contacts` - Get customer contacts
- `POST /crm/customers/:customerId/contacts` - Add contact to customer

### Leads
- `GET /crm/leads` - List all leads
- `GET /crm/leads/:id` - Get lead by ID
- `POST /crm/leads` - Create new lead
- `PUT /crm/leads/:id` - Update lead
- `DELETE /crm/leads/:id` - Delete lead

### Health Check
- `GET /health` - Service health status

## Data Models

### Customer
```typescript
{
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
}
```

### Lead
```typescript
{
  id: string;
  leadNumber: string;
  customerId?: string;
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
}
```

## Mock Data

The service includes pre-populated mock data:
- **2 Customers**: Acme Corporation, Tech Solutions Inc
- **2 Customer Contacts**: Primary contacts for each customer
- **1 Lead**: Sample qualified lead

## Development

### Prerequisites
- Node.js 18+
- pnpm

### Installation
```bash
pnpm install
```

### Building
```bash
npx nx build crm-service
```

### Running
```bash
# Development
npx nx serve crm-service

# Production
node dist/apps/crm-service/main.js
```

### Testing
```bash
# Unit tests
npx nx test crm-service

# Manual testing
curl http://localhost:3002/crm/customers
```

## Dependencies

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`

## Business Logic

### Customer Management
- Auto-generated customer numbers (CUST001, CUST002, etc.)
- Active/inactive status tracking
- Full address information
- Contact person details

### Lead Management
- Auto-generated lead numbers (LEAD001, LEAD002, etc.)
- Lead qualification tracking
- Source attribution
- Value and probability estimation

## Future Enhancements

- Database integration (PostgreSQL)
- Advanced filtering and search
- Customer segmentation
- Lead scoring algorithms
- Integration with email systems
- Customer communication history
- Analytics and reporting
- Bulk operations
- Data import/export
- Customer portal integration</content>
<parameter name="filePath">/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/nexo-prj/apps/crm-service/README.md