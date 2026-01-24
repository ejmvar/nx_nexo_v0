#!/bin/bash
#
# Backup Rotation and Retention Management
# Manages backup lifecycle with retention policies
#

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
DB_NAME="${POSTGRES_DB:-nexo}"

# Retention policies (in days)
DAILY_RETENTION="${DAILY_RETENTION:-7}"      # Keep daily backups for 7 days
WEEKLY_RETENTION="${WEEKLY_RETENTION:-30}"   # Keep weekly backups for 30 days
MONTHLY_RETENTION="${MONTHLY_RETENTION:-365}" # Keep monthly backups for 1 year

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

# Get backup age in days
get_backup_age() {
    local file="$1"
    local file_time=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
    local current_time=$(date +%s)
    local age_seconds=$((current_time - file_time))
    local age_days=$((age_seconds / 86400))
    echo "$age_days"
}

# Check if file is a weekly backup (Sunday)
is_weekly_backup() {
    local file="$1"
    local day_of_week=$(stat -c %Y "$file" 2>/dev/null | xargs -I {} date -d @{} +%u)
    [ "$day_of_week" = "7" ] # Sunday = 7
}

# Check if file is a monthly backup (first of month)
is_monthly_backup() {
    local file="$1"
    local day_of_month=$(stat -c %Y "$file" 2>/dev/null | xargs -I {} date -d @{} +%d)
    [ "$day_of_month" = "01" ]
}

# Apply retention policy
apply_retention_policy() {
    log_info "Applying retention policies..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "Backup directory not found: $BACKUP_DIR"
        return
    fi
    
    local total_files=0
    local kept_daily=0
    local kept_weekly=0
    local kept_monthly=0
    local deleted=0
    
    for backup_file in "$BACKUP_DIR"/${DB_NAME}_*.sql.gz; do
        if [ ! -f "$backup_file" ]; then
            continue
        fi
        
        ((total_files++))
        
        local age=$(get_backup_age "$backup_file")
        local filename=$(basename "$backup_file")
        local keep=false
        local reason=""
        
        # Monthly backups - keep for 1 year
        if is_monthly_backup "$backup_file"; then
            if [ "$age" -le "$MONTHLY_RETENTION" ]; then
                keep=true
                reason="monthly backup (age: ${age}d, retention: ${MONTHLY_RETENTION}d)"
                ((kept_monthly++))
            fi
        fi
        
        # Weekly backups - keep for 30 days
        if [ "$keep" = false ] && is_weekly_backup "$backup_file"; then
            if [ "$age" -le "$WEEKLY_RETENTION" ]; then
                keep=true
                reason="weekly backup (age: ${age}d, retention: ${WEEKLY_RETENTION}d)"
                ((kept_weekly++))
            fi
        fi
        
        # Daily backups - keep for 7 days
        if [ "$keep" = false ]; then
            if [ "$age" -le "$DAILY_RETENTION" ]; then
                keep=true
                reason="daily backup (age: ${age}d, retention: ${DAILY_RETENTION}d)"
                ((kept_daily++))
            fi
        fi
        
        # Delete or keep
        if [ "$keep" = true ]; then
            log_info "✓ Keeping: $filename - $reason"
        else
            log_warning "✗ Deleting: $filename - age: ${age}d exceeds all retention policies"
            rm -f "$backup_file" "${backup_file%.sql.gz}.info"
            ((deleted++))
        fi
    done
    
    echo ""
    log_info "Retention Policy Summary:"
    log_info "  Total backups processed: $total_files"
    log_info "  Daily backups kept: $kept_daily (retention: ${DAILY_RETENTION}d)"
    log_info "  Weekly backups kept: $kept_weekly (retention: ${WEEKLY_RETENTION}d)"
    log_info "  Monthly backups kept: $kept_monthly (retention: ${MONTHLY_RETENTION}d)"
    log_info "  Backups deleted: $deleted"
    
    if [ $deleted -gt 0 ]; then
        log_success "Deleted $deleted old backup(s)"
    fi
}

# Show backup statistics
show_statistics() {
    log_info "Backup Statistics:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        log_warning "No backups found"
        return
    fi
    
    # Count backups
    local total=$(ls -1 "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | wc -l)
    log_info "Total backups: $total"
    
    # Calculate total size
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    log_info "Total size: $total_size"
    
    # Age of oldest and newest
    local oldest=$(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | tail -1)
    local newest=$(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | head -1)
    
    if [ -n "$oldest" ]; then
        local oldest_age=$(get_backup_age "$oldest")
        log_info "Oldest backup: $(basename $oldest) (${oldest_age} days old)"
    fi
    
    if [ -n "$newest" ]; then
        local newest_age=$(get_backup_age "$newest")
        log_info "Newest backup: $(basename $newest) (${newest_age} days old)"
    fi
    
    # Age distribution
    echo ""
    log_info "Age Distribution:"
    
    local count_0_7=0
    local count_8_30=0
    local count_31_365=0
    local count_365plus=0
    
    for backup_file in "$BACKUP_DIR"/${DB_NAME}_*.sql.gz; do
        if [ ! -f "$backup_file" ]; then
            continue
        fi
        
        local age=$(get_backup_age "$backup_file")
        
        if [ "$age" -le 7 ]; then
            ((count_0_7++))
        elif [ "$age" -le 30 ]; then
            ((count_8_30++))
        elif [ "$age" -le 365 ]; then
            ((count_31_365++))
        else
            ((count_365plus++))
        fi
    done
    
    log_info "  0-7 days: $count_0_7 backups"
    log_info "  8-30 days: $count_8_30 backups"
    log_info "  31-365 days: $count_31_365 backups"
    log_info "  365+ days: $count_365plus backups"
}

# List backups by category
list_categorized() {
    log_info "Backups by Category:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/*.sql.gz 2>/dev/null)" ]; then
        log_warning "No backups found"
        return
    fi
    
    echo "DAILY BACKUPS (last $DAILY_RETENTION days):"
    for backup_file in $(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz); do
        local age=$(get_backup_age "$backup_file")
        if [ "$age" -le "$DAILY_RETENTION" ] && ! is_weekly_backup "$backup_file" && ! is_monthly_backup "$backup_file"; then
            local size=$(du -h "$backup_file" | cut -f1)
            echo "  - $(basename $backup_file) (${age}d old, $size)"
        fi
    done
    
    echo ""
    echo "WEEKLY BACKUPS (Sundays, last $WEEKLY_RETENTION days):"
    for backup_file in $(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz); do
        local age=$(get_backup_age "$backup_file")
        if is_weekly_backup "$backup_file" && [ "$age" -le "$WEEKLY_RETENTION" ]; then
            local size=$(du -h "$backup_file" | cut -f1)
            echo "  - $(basename $backup_file) (${age}d old, $size)"
        fi
    done
    
    echo ""
    echo "MONTHLY BACKUPS (1st of month, last $MONTHLY_RETENTION days):"
    for backup_file in $(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz); do
        local age=$(get_backup_age "$backup_file")
        if is_monthly_backup "$backup_file" && [ "$age" -le "$MONTHLY_RETENTION" ]; then
            local size=$(du -h "$backup_file" | cut -f1)
            echo "  - $(basename $backup_file) (${age}d old, $size)"
        fi
    done
}

# Main execution
main() {
    echo "========================================"
    echo "Backup Rotation Management"
    echo "========================================"
    echo ""
    
    case "${1:-rotate}" in
        rotate)
            apply_retention_policy
            ;;
        stats)
            show_statistics
            ;;
        list)
            list_categorized
            ;;
        *)
            echo "Usage: $0 {rotate|stats|list}"
            echo ""
            echo "Commands:"
            echo "  rotate - Apply retention policies and delete old backups"
            echo "  stats  - Show backup statistics"
            echo "  list   - List backups by category (daily/weekly/monthly)"
            echo ""
            echo "Retention Policies:"
            echo "  Daily backups: $DAILY_RETENTION days"
            echo "  Weekly backups: $WEEKLY_RETENTION days"
            echo "  Monthly backups: $MONTHLY_RETENTION days"
            exit 1
            ;;
    esac
}

main "$@"
