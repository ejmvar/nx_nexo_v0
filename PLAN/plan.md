# NEXO CRM Development Plan

## Phase 1: Architecture (Completed)
- [x] Create ARCHITECTURE.md with high-level diagram, tech stack, microservices, DB design, auth/authz, deployment, scalability
- [x] Commit to ft/architecture branch

## Phase 2: Backend Implementation
- [x] Create feature branch: ft/backend
- [x] Create worktree: /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend
- [x] Initialize NX workspace for backend
- [x] Set up NestJS services (Auth, Produccion, Stock, Ventas initialized; Core CRM, Compras, Notificaciones pending)
- [x] Implement authentication (JWT initialized; OAuth2, RBAC+ABAC, permissions engine pending)
- [ ] Design database schema based on ER diagram (PostgreSQL multi-tenant with RLS)
- [ ] Create API endpoints for modules (CMS, CRM, Compras Ventas, Cuentas, Produccion, Articulos)
- [ ] Implement permissions engine
- [ ] Create database migrations
- [ ] Build basic API with auth
- [ ] Commit changes and merge back

## Phase 3: Frontend Implementation
- [ ] Create feature branch: ft/frontend
- [ ] Create worktree: /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_frontend
- [ ] Initialize NX workspace
- [ ] Create Next.js apps for each portal (employees, clients, suppliers, professionals)
- [ ] Set up shared libs (UI components, auth, API client, types)
- [ ] Implement basic routing and layout
- [ ] Integrate authentication (NextAuth.js or similar)
- [ ] Prepare for multi-actor UX
- [ ] Build basic portal skeletons
- [ ] Create shared UI library
- [ ] Commit changes and merge back

## Phase 4: Docker/Infrastructure Implementation
- [ ] Create feature branch: ft/docker
- [ ] Create worktree: /W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_docker
- [ ] Create docker-compose.yml for local dev (frontend, backend, DB, Cache, Auth)
- [ ] Create Dockerfile for each service
- [ ] Set up K8s manifests for production
- [ ] Implement infrastructure as code (Terraform if needed)
- [ ] Setup for Raspberry Pi compatibility
- [ ] Add monitoring (Prometheus, Grafana)
- [ ] Configure CI/CD (GitHub Actions)
- [ ] Create deployment scripts
- [ ] Document scaling
- [ ] Commit changes and merge back

## Phase 5: Integration and Testing
- [ ] Integrate frontend with backend APIs
- [ ] Test multi-actor portals
- [ ] Validate permissions and RLS
- [ ] Run end-to-end tests
- [ ] Update ARCHITECTURE.md with implementation details
- [ ] Update README.md with setup instructions

## Phase 6: Deployment and Launch
- [ ] Deploy to on-premise (PC/Raspberry Pi)
- [ ] Test cloud scalability (K8s)
- [ ] Monitor and optimize performance
- [ ] Final documentation

