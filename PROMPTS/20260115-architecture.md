# Prompt for Architecture Task

## Objective
Create the ARCHITECTURE.md file documenting the overall system architecture for the NEXO CRM project.

## Context from Talks
- Use NX monorepo.
- Backend: Start with Python, consider Node/NestJS or Rust later.
- Frontend: Next.js with React.
- Supporting services in single docker-compose.
- Run on premise (PC to RaspberryPi), later cloud scalable.
- Multi-actor CRM: employees, clients, suppliers, professionals.
- Permissions model: Account/Role based, PostgreSQL with RLS.
- Modules: CMS, CRM, Compras Ventas, Cuentas (Clientes, Proveedores, Contactos), Produccion (Insumos, Servicios), Articulos (with submodules).

## Requirements
- Document high-level architecture diagram.
- Detail tech stack choices with pros/cons.
- Include microservices structure if applicable.
- Cover database design (PostgreSQL multi-tenant).
- Authentication and authorization.
- Deployment and orchestration (Docker, K8s).
- Scalability considerations.

## Deliverables
- ARCHITECTURE.md in the root of the worktree.
- Include Mermaid diagrams for clarity.

## Branch and Worktree
- Create feature branch: ft/architecture
- Create worktree: /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_architecture
- Work in the worktree, commit changes, and merge back when done.