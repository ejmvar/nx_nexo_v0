#!/bin/bash
#
# PostgreSQL Restore Script
# Restores database from backup with validation and testing
#

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-nexo-postgres}"
DB_NAME="${POSTGRES_DB:-nexo}"
DB_USER="${POSTGRES_USER:-nexo_user}"
TEST_MODE="${TEST_MODE:-false}"

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

# Check if PostgreSQL container is running
check_container() {
    log_info "Checking if PostgreSQL container is running..."
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_error "PostgreSQL container '$CONTAINER_NAME' is not running"
        exit 1
    fi
    log_success "PostgreSQL container is running"
}

# List available backups
list_backups() {
    log_info "Available backups in $BACKUP_DIR:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        ls -lht "$BACKUP_DIR"/*.sql.gz | head -10 | nl -w2 -s'. ' | while read line; do
            echo "  $line"
        done
        return 0
    else
        log_error "No backups found in $BACKUP_DIR"
        return 1
    fi
}

# Get latest backup
get_latest_backup() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    local latest=$(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | head -1)
    if [ -z "$latest" ]; then
        log_error "No backup files found"
        exit 1
    fi
    echo "$latest"
}

# Verify backup file
verify_backup() {
    local backup_file="$1"
    
    log_info "Verifying backup file: $(basename $backup_file)"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log_error "Backup file is corrupted!"
        exit 1
    fi
    
    log_success "Backup file integrity verified"
}

# Create pre-restore backup
create_pre_restore_backup() {
    log_warning "Creating pre-restore backup as safety measure..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safety_backup="$BACKUP_DIR/${DB_NAME}_pre_restore_${timestamp}.sql.gz"
    
    if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        | gzip -9 > "$safety_backup"; then
        log_success "Pre-restore safety backup created: $(basename $safety_backup)"
        echo "$safety_backup"
    else
        log_error "Failed to create pre-restore backup"
        exit 1
    fi
}

# Terminate active connections
terminate_connections() {
    log_info "Terminating active database connections..."
    
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" \
        > /dev/null 2>&1 || true
    
    log_success "Active connections terminated"
}

# Drop and recreate database
recreate_database() {
    local test_suffix="${1:-}"
    local target_db="${DB_NAME}${test_suffix}"
    
    log_info "Recreating database '$target_db'..."
    
    # Drop database if exists
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
        "DROP DATABASE IF EXISTS \"$target_db\";" > /dev/null
    
    # Create fresh database
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
        "CREATE DATABASE \"$target_db\" OWNER \"$DB_USER\";" > /dev/null
    
    log_success "Database '$target_db' recreated"
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    local target_db="${2:-$DB_NAME}"
    
    log_info "Restoring backup to database '$target_db'..."
    log_info "Source: $(basename $backup_file)"
    
    if gunzip -c "$backup_file" | docker exec -i "$CONTAINER_NAME" \
        psql -U "$DB_USER" -d "$target_db" > /dev/null 2>&1; then
        log_success "Database restored successfully!"
    else
        log_error "Restore failed!"
        exit 1
    fi
}

# Test restored database
test_restored_database() {
    local target_db="${1:-$DB_NAME}"
    
    log_info "Testing restored database..."
    
    # Test connection
    if ! docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$target_db" \
        -c "SELECT 1;" > /dev/null 2>&1; then
        log_error "Cannot connect to restored database"
        return 1
    fi
    
    # Count tables
    local table_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$target_db" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
    
    log_info "Tables found: $table_count"
    
    # List tables
    log_info "Available tables:"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$target_db" -c \
        "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';" | head -20
    
    log_success "Database tests passed"
}

# Test restore in separate database
test_restore() {
    local backup_file="${1:-$(get_latest_backup)}"
    local test_db="${DB_NAME}_restore_test"
    
    echo "========================================"
    echo "PostgreSQL Restore Test"
    echo "========================================"
    echo ""
    
    verify_backup "$backup_file"
    check_container
    
    log_info "Testing restore in separate database: $test_db"
    
    # Clean up any existing test database
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
        "DROP DATABASE IF EXISTS \"$test_db\";" > /dev/null 2>&1 || true
    
    recreate_database "_restore_test"
    restore_backup "$backup_file" "$test_db"
    test_restored_database "$test_db"
    
    echo ""
    log_success "Restore test completed successfully!"
    log_warning "Test database '$test_db' retained for inspection"
    log_info "To remove: docker exec $CONTAINER_NAME psql -U $DB_USER -d postgres -c 'DROP DATABASE \"$test_db\";'"
}

# Full restore
full_restore() {
    local backup_file="${1:-$(get_latest_backup)}"
    
    echo "========================================"
    echo "PostgreSQL Full Restore"
    echo "========================================"
    echo ""
    
    verify_backup "$backup_file"
    check_container
    
    # Confirm with user
    log_warning "⚠️  WARNING: This will replace the current database!"
    log_info "Database: $DB_NAME"
    log_info "Backup: $(basename $backup_file)"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
    
    # Create safety backup
    local safety_backup=$(create_pre_restore_backup)
    
    # Perform restore
    terminate_connections
    recreate_database
    restore_backup "$backup_file"
    test_restored_database
    
    echo ""
    log_success "Full restore completed successfully!"
    log_info "Safety backup: $(basename $safety_backup)"
}

# Main execution
main() {
    local command="${1:-}"
    local backup_file="${2:-}"
    
    case "$command" in
        test)
            test_restore "$backup_file"
            ;;
        restore)
            full_restore "$backup_file"
            ;;
        list)
            list_backups
            ;;
        latest)
            get_latest_backup
            ;;
        *)
            echo "Usage: $0 {test|restore|list|latest} [backup_file]"
            echo ""
            echo "Commands:"
            echo "  test [file]    - Test restore in separate database (default: latest backup)"
            echo "  restore [file] - Full restore to main database (default: latest backup)"
            echo "  list           - List available backups"
            echo "  latest         - Show latest backup file"
            echo ""
            echo "Examples:"
            echo "  $0 test                              # Test latest backup"
            echo "  $0 test backups/postgres/nexo_*.gz   # Test specific backup"
            echo "  $0 restore                           # Restore from latest backup"
            echo "  $0 restore backups/postgres/nexo_*.gz  # Restore specific backup"
            exit 1
            ;;
    esac
}

main "$@"
