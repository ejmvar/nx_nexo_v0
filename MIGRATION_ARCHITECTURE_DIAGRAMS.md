# Database Migration System Architecture

## System Overview

```mermaid
graph TB
    subgraph "Developer Tools"
        CLI[CLI Commands<br/>pnpm db:*]
        Studio[Prisma Studio<br/>GUI]
    end

    subgraph "Migration Layer"
        Prisma[Prisma Migrations<br/>Schema Changes]
        SQL[SQL Migrations<br/>RLS, Triggers]
        Version[Version Tracker<br/>check-version.ts]
    end

    subgraph "Database Layer"
        PG[(PostgreSQL 16<br/>with RLS)]
        Tables[Application Tables<br/>accounts, users, etc.]
        History[migration_history<br/>Version Tracking]
    end

    subgraph "Application Layer"
        Backend[NestJS Services<br/>auth, crm, api-gateway]
        PrismaClient[Prisma Client<br/>Type-Safe Queries]
    end

    CLI --> Prisma
    CLI --> SQL
    CLI --> Version
    Studio --> PrismaClient
    
    Prisma --> PG
    SQL --> PG
    Version --> History
    
    PG --> Tables
    PG --> History
    
    Backend --> PrismaClient
    PrismaClient --> PG
    
    style PG fill:#4169E1,color:#fff
    style Prisma fill:#2D3748,color:#fff
    style SQL fill:#2D3748,color:#fff
    style Backend fill:#48BB78,color:#fff
```

## Migration Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Prisma as Prisma CLI
    participant SQL as SQL Runner
    participant DB as PostgreSQL
    participant History as migration_history

    Note over Dev,History: Schema Change Flow
    Dev->>Dev: Edit schema.prisma
    Dev->>Prisma: pnpm db:migrate:dev
    Prisma->>DB: Create tables/columns
    Prisma->>DB: Record in _prisma_migrations
    
    Note over Dev,History: SQL Features Flow
    Dev->>Dev: Create .sql file
    Dev->>SQL: pnpm db:migrate
    SQL->>DB: Apply SQL (RLS, triggers)
    SQL->>History: Record in migration_history
    
    Note over Dev,History: Verification Flow
    Dev->>SQL: pnpm db:version
    SQL->>DB: Check schema
    SQL->>History: Check versions
    SQL->>Dev: Display status report
```

## Version Tracking System

```mermaid
graph LR
    subgraph "Version Sources"
        Schema[schema.prisma<br/>Prisma Migrations]
        SQLFiles[SQL Files<br/>Custom Migrations]
        Package[package.json<br/>Dependencies]
    end

    subgraph "Tracking Tables"
        PrismaTable[_prisma_migrations<br/>Schema History]
        HistoryTable[migration_history<br/>SQL History]
    end

    subgraph "Version Reports"
        VersionDoc[DATABASE_VERSION.md<br/>Documentation]
        VersionCheck[check-version.ts<br/>CLI Tool]
    end

    Schema --> PrismaTable
    SQLFiles --> HistoryTable
    Package --> VersionCheck
    
    PrismaTable --> VersionCheck
    HistoryTable --> VersionCheck
    
    VersionCheck --> VersionDoc
    
    style PrismaTable fill:#805AD5,color:#fff
    style HistoryTable fill:#805AD5,color:#fff
    style VersionCheck fill:#F6AD55,color:#000
```

## Multi-Tenant RLS Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        Service[NestJS Service]
        Prisma[Prisma Client]
    end

    subgraph "Session Context"
        SetAccount["SET app.current_account_id = 'uuid'"]
    end

    subgraph "PostgreSQL with RLS"
        RLS[Row Level Security]
        Policy[RLS Policies<br/>7 isolation policies]
        Tables[Tables with account_id]
    end

    subgraph "Multi-Tenant Data"
        AccA[Account A Data]
        AccB[Account B Data]
        AccC[Account C Data]
    end

    Service --> Prisma
    Prisma --> SetAccount
    SetAccount --> RLS
    RLS --> Policy
    Policy --> Tables
    
    Tables --> AccA
    Tables --> AccB
    Tables --> AccC
    
    Policy -.Block.-> AccB
    Policy -.Block.-> AccC
    Policy -.Allow.-> AccA
    
    style RLS fill:#E53E3E,color:#fff
    style Policy fill:#DD6B20,color:#fff
    style AccA fill:#48BB78,color:#fff
    style AccB fill:#718096,color:#fff
    style AccC fill:#718096,color:#fff
```

## Development Workflow

```mermaid
flowchart TD
    Start([Developer Makes Change]) --> Type{Change Type?}
    
    Type -->|Schema| Schema[Edit schema.prisma]
    Type -->|SQL Feature| SQLFile[Create .sql migration]
    
    Schema --> PrismaDev[pnpm db:migrate:dev]
    PrismaDev --> Generate[pnpm db:generate]
    
    SQLFile --> SQLMigrate[pnpm db:migrate]
    
    Generate --> Verify[pnpm db:version]
    SQLMigrate --> Verify
    
    Verify --> Test[Run Tests]
    Test --> Pass{Tests Pass?}
    
    Pass -->|Yes| Commit[Commit Changes]
    Pass -->|No| Debug[Debug & Fix]
    Debug --> Type
    
    Commit --> End([Done])
    
    style Start fill:#4299E1,color:#fff
    style End fill:#48BB78,color:#fff
    style Pass fill:#F6AD55,color:#000
```

## Production Deployment Flow

```mermaid
flowchart TD
    Start([Production Deploy]) --> Backup[Backup Database]
    Backup --> Staging[Test on Staging]
    Staging --> StagePass{Staging OK?}
    
    StagePass -->|No| Rollback[Rollback & Fix]
    StagePass -->|Yes| Maintenance[Schedule Maintenance]
    
    Maintenance --> Deploy[Deploy Migrations]
    Deploy --> PrismaProd[pnpm db:migrate:deploy]
    PrismaProd --> SQLProd[pnpm db:migrate]
    SQLProd --> Verify[pnpm db:version]
    
    Verify --> VerifyPass{All Green?}
    VerifyPass -->|No| Emergency[Emergency Rollback]
    VerifyPass -->|Yes| Smoke[Smoke Tests]
    
    Smoke --> SmokePass{Tests Pass?}
    SmokePass -->|No| Emergency
    SmokePass -->|Yes| Monitor[Monitor Metrics]
    
    Monitor --> Success([Deployment Success])
    Emergency --> Restore[Restore from Backup]
    Restore --> Debug[Debug & Fix]
    
    style Success fill:#48BB78,color:#fff
    style Emergency fill:#E53E3E,color:#fff
    style Start fill:#4299E1,color:#fff
```

## File Structure

```
nexo-prj/
├── prisma/
│   ├── schema.prisma          ← Define tables & relations
│   ├── prisma.config.ts       ← Prisma 7 configuration
│   └── migrations/
│       ├── 20260123_*_initial/
│       │   └── migration.sql   ← Auto-generated
│       └── migration_lock.toml
│
├── database/
│   ├── DATABASE_VERSION.md    ← Version documentation
│   ├── migrations/
│   │   ├── README.md          ← Strategy guide
│   │   └── sql/
│   │       └── 20260123_1800_*.sql  ← Custom SQL
│   └── scripts/
│       ├── check-version.ts   ← Version checker
│       └── migrate.ts         ← SQL runner
│
└── .env                       ← Database connection
```

## Command Flow Diagram

```mermaid
graph LR
    subgraph "Development"
        DevMigrate[pnpm db:migrate:dev]
        Generate[pnpm db:generate]
        Studio[pnpm db:studio]
    end

    subgraph "Production"
        Deploy[pnpm db:migrate:deploy]
        SQLMigrate[pnpm db:migrate]
    end

    subgraph "Verification"
        Version[pnpm db:version]
        Dry[pnpm db:migrate:dry]
    end

    DevMigrate --> Generate
    Generate --> Version
    
    Dry --> Deploy
    Deploy --> SQLMigrate
    SQLMigrate --> Version
    
    Studio -.View Data.-> Generate
    
    style DevMigrate fill:#4299E1,color:#fff
    style Deploy fill:#DD6B20,color:#fff
    style Version fill:#48BB78,color:#fff
```

---

**Visual Reference for:** [MIGRATION_SYSTEM_SUMMARY.md](./MIGRATION_SYSTEM_SUMMARY.md)
