#!/bin/bash
#
# PostgreSQL Backup Script
# Creates timestamped backups with compression and verification
#

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-nexo-postgres}"
DB_NAME="${POSTGRES_DB:-nexo}"
DB_USER="${POSTGRES_USER:-nexo_user}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
COMPRESSION_LEVEL="${BACKUP_COMPRESSION:-9}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Check if PostgreSQL container is running
check_container() {
    log_info "Checking if PostgreSQL container is running..."
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "PostgreSQL container '$CONTAINER_NAME' is not running"
        exit 1
    fi
    log_success "PostgreSQL container is running"
}

# Create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${timestamp}.sql.gz"
    local backup_info="$BACKUP_DIR/${DB_NAME}_${timestamp}.info"
    
    log_info "Starting backup of database '$DB_NAME'..."
    log_info "Backup file: $backup_file"
    
    # Create backup with pg_dump and compress
    if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" --verbose \
        | gzip -${COMPRESSION_LEVEL} > "$backup_file"; then
        
        # Get backup size
        local size=$(du -h "$backup_file" | cut -f1)
        
        # Create backup metadata file
        cat > "$backup_info" << EOF
{
  "timestamp": "$timestamp",
  "database": "$DB_NAME",
  "container": "$CONTAINER_NAME",
  "user": "$DB_USER",
  "backup_file": "$(basename $backup_file)",
  "size": "$size",
  "compression": "$COMPRESSION_LEVEL",
  "created_at": "$(date -Iseconds)",
  "hostname": "$(hostname)",
  "postgres_version": "$(docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c 'SELECT version();' | head -n 1 | xargs)"
}
EOF
        
        log_success "Backup completed successfully!"
        log_info "Backup size: $size"
        log_info "Backup metadata: $backup_info"
        
        # Verify backup file integrity
        verify_backup "$backup_file"
        
        echo "$backup_file"
    else
        log_error "Backup failed!"
        exit 1
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    log_info "Verifying backup integrity..."
    
    if gzip -t "$backup_file" 2>/dev/null; then
        log_success "Backup file integrity verified"
    else
        log_error "Backup file is corrupted!"
        rm -f "$backup_file"
        exit 1
    fi
}

# List recent backups
list_backups() {
    log_info "Recent backups in $BACKUP_DIR:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz | awk '{print $9, "(" $5 ")"}' | while read line; do
            echo "  - $line"
        done
    else
        log_warning "No backups found"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning backups older than $RETENTION_DAYS days..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "No backup directory found, skipping cleanup"
        return
    fi
    
    local deleted_count=0
    while IFS= read -r file; do
        log_info "Deleting old backup: $(basename $file)"
        rm -f "$file" "${file%.sql.gz}.info"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +${RETENTION_DAYS} -type f)
    
    if [ $deleted_count -gt 0 ]; then
        log_success "Deleted $deleted_count old backup(s)"
    else
        log_info "No old backups to delete"
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "PostgreSQL Backup Script"
    echo "========================================"
    echo ""
    
    create_backup_dir
    check_container
    create_backup
    cleanup_old_backups
    
    echo ""
    list_backups
    echo ""
    log_success "Backup process completed!"
}

# Handle script arguments
case "${1:-backup}" in
    backup)
        main
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    verify)
        if [ -z "${2:-}" ]; then
            log_error "Please provide backup file path"
            exit 1
        fi
        verify_backup "$2"
        ;;
    *)
        echo "Usage: $0 {backup|list|cleanup|verify <file>}"
        echo ""
        echo "Commands:"
        echo "  backup  - Create a new backup (default)"
        echo "  list    - List all available backups"
        echo "  cleanup - Remove backups older than retention period"
        echo "  verify  - Verify backup file integrity"
        exit 1
        ;;
esac
