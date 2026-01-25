# Backup System Security Architecture

## Complete Backup Security Flow

```mermaid
flowchart TB
    Start([Developer Initiates Migration]) --> Check{Backup First?}
    
    Check -->|Manual| Manual[pnpm db:backup]
    Check -->|Auto| Auto[pnpm db:migrate:safe]
    
    Manual --> CreateBackup
    Auto --> CreateBackup[Create Backup]
    
    CreateBackup --> GatherInfo[Gather DB Info]
    GatherInfo --> RunDump[pg_dump]
    RunDump --> CalcChecksum[Calculate SHA-256]
    CalcChecksum --> SaveMeta[Save Metadata JSON]
    SaveMeta --> VerifyBackup{Backup OK?}
    
    VerifyBackup -->|No| BackupFail[❌ Abort Migration]
    VerifyBackup -->|Yes| ApplyMigration[Apply Migration]
    
    ApplyMigration --> MigrationResult{Migration OK?}
    
    MigrationResult -->|Yes| Success[✅ Success]
    MigrationResult -->|No| Restore[Restore from Backup]
    
    Restore --> RestoreFlow
    Success --> End([Complete])
    BackupFail --> End
    
    RestoreFlow --> VerifyChecksum{Checksum Valid?}
    VerifyChecksum -->|No| Error[❌ Backup Corrupted]
    VerifyChecksum -->|Yes| Confirm{User Confirms?}
    Confirm -->|No| Cancel[❌ Cancelled]
    Confirm -->|Yes| RestoreDB[Restore Database]
    RestoreDB --> End
    
    style CreateBackup fill:#4299E1,color:#fff
    style CalcChecksum fill:#805AD5,color:#fff
    style VerifyChecksum fill:#48BB78,color:#fff
    style Error fill:#E53E3E,color:#fff
    style Success fill:#48BB78,color:#fff
```

## Security Layers Architecture

```mermaid
graph TB
    subgraph "Layer 1: Prevention"
        Prevent1[Automatic Backups]
        Prevent2[Safe Migration Command]
        Prevent3[Clear Documentation]
    end
    
    subgraph "Layer 2: Verification"
        Verify1[SHA-256 Checksum]
        Verify2[Metadata Tracking]
        Verify3[File Integrity Check]
    end
    
    subgraph "Layer 3: Recovery"
        Recover1[Quick Restore]
        Recover2[Multiple Restore Options]
        Recover3[Emergency Procedures]
    end
    
    subgraph "Layer 4: Confirmation"
        Confirm1[Explicit 'yes' Required]
        Confirm2[Clear Warnings]
        Confirm3[Force Flag for CI/CD]
    end
    
    Database[(PostgreSQL)]
    
    Prevent1 --> Verify1
    Prevent2 --> Verify2
    Prevent3 --> Verify3
    
    Verify1 --> Recover1
    Verify2 --> Recover2
    Verify3 --> Recover3
    
    Recover1 --> Confirm1
    Recover2 --> Confirm2
    Recover3 --> Confirm3
    
    Confirm1 --> Database
    Confirm2 --> Database
    Confirm3 --> Database
    
    style Prevent1 fill:#4299E1,color:#fff
    style Verify1 fill:#805AD5,color:#fff
    style Recover1 fill:#48BB78,color:#fff
    style Confirm1 fill:#F6AD55,color:#000
```

## Backup File Structure

```mermaid
graph LR
    subgraph "Backup Files"
        SQL[backup_*.sql<br/>Database Dump]
        JSON[backup_*.json<br/>Metadata]
    end
    
    subgraph "SQL Contents"
        Drop[DROP IF EXISTS]
        Create[CREATE TABLE]
        Insert[INSERT DATA]
    end
    
    subgraph "JSON Contents"
        Time[Timestamp]
        Check[SHA-256 Checksum]
        Tables[Table List]
        Migrations[Migration Count]
        Size[File Size]
    end
    
    SQL --> Drop
    SQL --> Create
    SQL --> Insert
    
    JSON --> Time
    JSON --> Check
    JSON --> Tables
    JSON --> Migrations
    JSON --> Size
    
    Check -.Validates.-> SQL
    
    style SQL fill:#4299E1,color:#fff
    style JSON fill:#48BB78,color:#fff
    style Check fill:#E53E3E,color:#fff
```

## Backup & Restore Timeline

```mermaid
gantt
    title Database Migration with Backup Protection
    dateFormat HH:mm:ss
    
    section Preparation
    Check Database Status    :done, prep1, 00:00:00, 5s
    Create Pre-Migration Backup :done, prep2, 00:00:05, 30s
    Verify Backup Checksum      :done, prep3, 00:00:35, 2s
    
    section Migration
    Apply Prisma Migration   :active, mig1, 00:00:37, 15s
    Apply SQL Migration      :mig2, 00:00:52, 10s
    
    section Verification
    Check Migration Status   :verify1, 00:01:02, 5s
    Run Tests               :verify2, 00:01:07, 20s
    
    section Post-Deploy
    Create Post-Migration Backup :post1, 00:01:27, 30s
    
    section Emergency (If Needed)
    Restore from Backup     :crit, emergency, 00:01:57, 45s
```

## Backup Storage Strategy

```mermaid
graph TB
    subgraph "Production Database"
        ProdDB[(Production DB)]
    end
    
    subgraph "Local Backups"
        LocalDir[database/backups/]
        Daily[Daily Backups<br/>Last 30 days]
        Weekly[Weekly Backups<br/>Last 90 days]
        Monthly[Monthly Backups<br/>Last 1 year]
    end
    
    subgraph "Remote Storage"
        S3[AWS S3 / Cloud Storage]
        RemoteDaily[Remote Daily]
        RemoteMonthly[Remote Monthly]
    end
    
    subgraph "Disaster Recovery"
        DR[DR Site Backups]
    end
    
    ProdDB -->|Automatic| LocalDir
    LocalDir --> Daily
    LocalDir --> Weekly
    LocalDir --> Monthly
    
    Daily -->|Sync| RemoteDaily
    Monthly -->|Sync| RemoteMonthly
    
    RemoteDaily --> S3
    RemoteMonthly --> S3
    
    S3 -->|Replicate| DR
    
    style ProdDB fill:#4299E1,color:#fff
    style LocalDir fill:#48BB78,color:#fff
    style S3 fill:#F6AD55,color:#000
    style DR fill:#E53E3E,color:#fff
```

## Checksum Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant BackupTool
    participant FileSystem
    participant Crypto
    participant Database
    
    Note over User,Database: Backup Creation
    User->>BackupTool: pnpm db:backup
    BackupTool->>Database: pg_dump
    Database-->>FileSystem: backup.sql
    FileSystem-->>BackupTool: File data
    BackupTool->>Crypto: Calculate SHA-256
    Crypto-->>BackupTool: Checksum hash
    BackupTool->>FileSystem: Save metadata.json
    BackupTool-->>User: ✅ Backup complete
    
    Note over User,Database: Restore Verification
    User->>BackupTool: pnpm db:restore
    BackupTool->>FileSystem: Read backup.sql
    BackupTool->>FileSystem: Read metadata.json
    BackupTool->>Crypto: Calculate SHA-256
    Crypto-->>BackupTool: Current hash
    BackupTool->>BackupTool: Compare checksums
    
    alt Checksums Match
        BackupTool-->>User: ✅ Valid backup
        User->>BackupTool: Confirm restore
        BackupTool->>Database: Apply backup
    else Checksums Don't Match
        BackupTool-->>User: ❌ Corrupted backup
    end
```

## Migration Safety Net

```mermaid
graph TB
    Start([Start Migration]) --> Phase1
    
    subgraph "Phase 1: Backup"
        Phase1[Create Backup]
        Phase1 --> Check1{Backup Success?}
        Check1 -->|No| Abort1[❌ Abort]
        Check1 -->|Yes| Phase2
    end
    
    subgraph "Phase 2: Migration"
        Phase2[Apply Migration]
        Phase2 --> Check2{Migration Success?}
        Check2 -->|No| Rollback1[Restore Backup]
        Check2 -->|Yes| Phase3
    end
    
    subgraph "Phase 3: Verification"
        Phase3[Run Tests]
        Phase3 --> Check3{Tests Pass?}
        Check3 -->|No| Rollback2[Restore Backup]
        Check3 -->|Yes| Phase4
    end
    
    subgraph "Phase 4: Finalization"
        Phase4[Create Post-Migration Backup]
        Phase4 --> Success[✅ Complete]
    end
    
    Abort1 --> End([End])
    Rollback1 --> End
    Rollback2 --> End
    Success --> End
    
    style Phase1 fill:#4299E1,color:#fff
    style Phase2 fill:#805AD5,color:#fff
    style Phase3 fill:#48BB78,color:#fff
    style Phase4 fill:#38B2AC,color:#fff
    style Abort1 fill:#E53E3E,color:#fff
    style Rollback1 fill:#ED8936,color:#fff
    style Rollback2 fill:#ED8936,color:#fff
```

## Disaster Recovery Hierarchy

```mermaid
graph TB
    Disaster[🔥 Disaster Scenario] --> Try1
    
    Try1{Latest Local<br/>Backup?} -->|Available| Local[Restore from Local]
    Try1 -->|Not Available| Try2
    
    Try2{Remote Cloud<br/>Backup?} -->|Available| Cloud[Restore from Cloud]
    Try2 -->|Not Available| Try3
    
    Try3{DR Site<br/>Backup?} -->|Available| DR[Restore from DR]
    Try3 -->|Not Available| Try4
    
    Try4{Point-in-Time<br/>Recovery?} -->|Available| PITR[WAL Recovery]
    Try4 -->|Not Available| Last
    
    Last[Manual Rebuild<br/>from Scratch] --> Document[Document Lessons]
    
    Local --> Verify
    Cloud --> Verify
    DR --> Verify
    PITR --> Verify
    
    Verify{Data Valid?} -->|Yes| Success[✅ Recovered]
    Verify -->|No| NextOption[Try Next Option]
    
    NextOption --> Try2
    
    style Disaster fill:#E53E3E,color:#fff
    style Success fill:#48BB78,color:#fff
    style Local fill:#4299E1,color:#fff
    style Cloud fill:#805AD5,color:#fff
```

---

**Visual Reference for:** [BACKUP_SECURITY_SUMMARY.md](../BACKUP_SECURITY_SUMMARY.md)
