# NEXO CRM System Architecture

## Overview

The NEXO CRM is a multi-actor Customer Relationship Management system designed to handle interactions between employees, clients, suppliers, and professionals. The system is built as an NX monorepo to facilitate modular development and scalability. It supports on-premise deployment (from PC to Raspberry Pi) with future cloud scalability in mind.

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "NX Monorepo"
        FE[Frontend: Next.js/React]
        BE[Backend: Python (initial)]
        LIBS[Shared Libraries]
    end

    subgraph "Supporting Services"
        DB[(PostgreSQL with RLS)]
        AUTH[Authentication Service]
        CACHE[Cache Service]
        QUEUE[Message Queue]
    end

    subgraph "Deployment"
        DC[Docker Compose]
        K8S[Kubernetes (future)]
    end

    FE --> BE
    BE --> DB
    BE --> AUTH
    BE --> CACHE
    BE --> QUEUE
    DC --> FE
    DC --> BE
    DC --> DB
    DC --> AUTH
    DC --> CACHE
    DC --> QUEUE
    K8S --> DC

    subgraph "Modules"
        CMS[CMS Module]
        CRM[CRM Module]
        CV[Compras Ventas Module]
        CU[Cuentas Module<br/>- Clientes<br/>- Proveedores<br/>- Contactos]
        PROD[Produccion Module<br/>- Insumos<br/>- Servicios]
        ART[Articulos Module<br/>(with submodules)]
    end

    BE --> CMS
    BE --> CRM
    BE --> CV
    BE --> CU
    BE --> PROD
    BE --> ART
```

## Tech Stack Choices

### Monorepo Management: NX
- **Pros**: Efficient code sharing, consistent tooling, scalable for large projects, built-in generators for apps/libs.
- **Cons**: Learning curve for NX-specific commands, potential overhead for small teams.
- **Rationale**: Chosen for its ability to manage complex monorepos with multiple apps and libs, aligning with the modular nature of the CRM system.

### Frontend: Next.js with React
- **Pros**: Server-side rendering for better SEO, built-in routing, large ecosystem, TypeScript support.
- **Cons**: Opinionated structure may limit flexibility, steeper learning curve for beginners.
- **Rationale**: Ideal for web applications requiring dynamic content and good performance; React provides component reusability.

### Backend: Python (Initial Implementation)
- **Pros**: Rapid development, extensive libraries (e.g., FastAPI for APIs), strong in data processing.
- **Cons**: Performance may lag behind compiled languages like Rust; GIL can be a bottleneck for CPU-intensive tasks.
- **Rationale**: Start with Python for quick prototyping; consider migration to Node/NestJS or Rust for production scalability.
- **Future Considerations**:
  - Node/NestJS: JavaScript ecosystem alignment, good for microservices.
  - Rust: High performance, memory safety, suitable for high-load scenarios.

### Database: PostgreSQL with Row-Level Security (RLS)
- **Pros**: ACID compliance, advanced features like JSONB, multi-tenancy support via RLS, robust for complex queries.
- **Cons**: More complex setup compared to simpler databases; resource-intensive.
- **Rationale**: Supports multi-tenant architecture with built-in security; aligns with account/role-based permissions.

### Supporting Services
- **Authentication**: Custom service or integration with OAuth providers.
- **Cache**: Redis for session management and data caching.
- **Message Queue**: RabbitMQ or Redis for asynchronous processing.
- **Deployment**: Docker Compose for local/on-premise orchestration; Kubernetes for cloud scaling.

## Microservices Structure

While starting as a monolithic backend for simplicity, the architecture is designed to evolve into microservices:

- **API Gateway**: Central entry point for all requests.
- **User Service**: Handles authentication and user management.
- **CRM Core Service**: Manages core CRM functionalities.
- **Module Services**: Separate services for CMS, Compras Ventas, Cuentas, Produccion, Articulos.
- **Data Service**: Abstraction layer for database interactions.

This structure allows for independent scaling and deployment of modules.

## Database Design

### Multi-Tenant Architecture
- **Schema**: Shared database with tenant-specific schemas or RLS policies.
- **Tables**: Core entities include Users, Accounts, Roles, Permissions, Contacts, Clients, Suppliers, Products, Services, etc.
- **RLS Policies**: Enforce data isolation based on account/role.
- **Migrations**: Use tools like Alembic (Python) for schema versioning.

### Key Entities
- **Accounts**: Top-level tenants.
- **Roles**: Define permissions within accounts.
- **Modules**: Logical groupings (e.g., CRM, CMS) with associated data.

## Authentication and Authorization

### Model: Account/Role-Based
- **Authentication**: JWT tokens or session-based, integrated with PostgreSQL RLS.
- **Authorization**: Role-based access control (RBAC) with granular permissions.
- **Multi-Actor Support**: Different interfaces/permissions for employees, clients, suppliers, professionals.
- **Implementation**: Backend validates tokens and applies RLS policies at the database level.

## Deployment and Orchestration

### On-Premise Deployment
- **Docker Compose**: Orchestrates all services (frontend, backend, database, cache, queue) in a single setup.
- **Target Environments**: PC development, Raspberry Pi production.

### Cloud Scalability
- **Kubernetes**: For container orchestration in cloud environments.
- **CI/CD**: Git-based pipelines for automated deployment.
- **Monitoring**: Integrate tools like Prometheus and Grafana for observability.

## Scalability Considerations

- **Horizontal Scaling**: Microservices allow independent scaling of high-load modules.
- **Caching**: Redis to reduce database load.
- **Asynchronous Processing**: Message queues for background tasks.
- **Database Optimization**: Indexing, partitioning for multi-tenant data.
- **Cloud Migration**: Design for easy transition from on-premise to cloud providers (AWS, GCP, Azure).
- **Performance Monitoring**: Implement logging and metrics to identify bottlenecks.

## Modules Overview

- **CMS**: Content Management System for internal/external content.
- **CRM**: Core customer relationship management.
- **Compras Ventas**: Purchasing and sales management.
- **Cuentas**: Account management including Clients, Suppliers, Contacts.
- **Produccion**: Production management for Inputs and Services.
- **Articulos**: Product management with submodules for categorization and inventory.

This architecture provides a solid foundation for the NEXO CRM, balancing current needs with future growth.