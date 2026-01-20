# NEXO Database Schema

This directory contains the PostgreSQL database schema for the NEXO ERP system.

## Overview

The database is designed with multi-tenancy support using Row Level Security (RLS) and includes the following modules:

- **Authentication & Authorization**: Users, roles, permissions
- **CRM**: Customers, contacts, leads
- **Stock/Inventory**: Products, categories, warehouses, inventory levels
- **Purchases**: Suppliers, purchase orders
- **Sales**: Customers, sales orders, invoices
- **Production**: Bill of materials, manufacturing orders
- **Notifications**: Templates and notification logs

## Key Features

### Multi-Tenancy
- Each tenant has isolated data via `tenant_id` foreign keys
- Row Level Security (RLS) policies ensure data isolation
- UUID primary keys for global uniqueness

### Data Integrity
- Foreign key constraints maintain referential integrity
- Check constraints on data ranges (e.g., probability 0-100)
- Unique constraints prevent duplicates
- Generated columns for calculated fields (e.g., line totals, available quantity)

### Audit Trail
- `created_at`, `updated_at` timestamps on all tables
- `created_by`, `updated_by` user references
- Comprehensive logging for changes

## Files

- `schema.sql`: Complete PostgreSQL schema with tables, indexes, triggers, and initial data
- `er-diagram-core.md`: ER diagram for core entities (tenants, users, roles, permissions)
- `er-diagram-crm.md`: ER diagram for CRM module
- `er-diagram-stock.md`: ER diagram for inventory/stock module
- `er-diagram-orders.md`: ER diagram for sales and purchase orders
- `er-diagram-production.md`: ER diagram for manufacturing/production
- `er-diagram-notifications.md`: ER diagram for notifications

## Setup Instructions

1. Create a PostgreSQL database
2. Run the `schema.sql` file to create all tables and initial data
3. Configure your application to connect to the database
4. Set up the `current_tenant_id()` function for RLS policies

## RLS Policies

Row Level Security is enabled on all tables. In your application code, you need to:

1. Create a `current_tenant_id()` function that returns the current tenant's UUID
2. Set the tenant context before executing queries
3. Ensure all inserts/updates include the correct `tenant_id`

Example function:
```sql
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  -- Implementation depends on your authentication/session management
  -- This could read from a session variable or JWT claim
$$ LANGUAGE sql STABLE;
```

## Indexes

Performance indexes are created on:
- Tenant ID columns (for RLS filtering)
- Foreign key columns
- Commonly queried fields (email, status, dates)
- Composite indexes for multi-column queries

## Initial Data

The schema includes default data:
- One default tenant
- Three system roles (admin, manager, user)
- Basic permissions for core resources

## Development Notes

- All monetary values use `DECIMAL(15,2)` for precision
- UUIDs are used for all primary keys
- Timestamps include time zone information
- Text fields use appropriate sizes (avoiding unnecessary large fields)
- Status fields use controlled vocabularies

## Future Enhancements

- Partitioning for large tables (orders, inventory transactions)
- Additional audit logging tables
- Materialized views for reporting
- Full-text search indexes