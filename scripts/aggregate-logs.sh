#!/bin/bash
# ==============================================================================
# Log Aggregation Script for Multi-Environment Docker Setup
# ==============================================================================
# This script aggregates logs from all Docker environments for centralized
# analysis and debugging.
#
# Usage:
#   bash scripts/aggregate-logs.sh [environment] [service] [lines]
#
# Examples:
#   bash scripts/aggregate-logs.sh                    # All logs from all envs
#   bash scripts/aggregate-logs.sh dev                # All DEV logs
#   bash scripts/aggregate-logs.sh qa auth            # QA auth service logs
#   bash scripts/aggregate-logs.sh prod crm 100       # Last 100 lines from PROD CRM
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR="./tmp/logs/docker"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ENVIRONMENTS=("dev" "test" "qa" "prod")
SERVICES=("postgres" "redis" "auth-service" "crm-service" "api-gateway" "frontend")

# Parse arguments
FILTER_ENV="${1:-all}"
FILTER_SERVICE="${2:-all}"
LINES="${3:-1000}"

# Create log directory
mkdir -p "$LOG_DIR"

# ==============================================================================
# Functions
# ==============================================================================

print_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}NEXO Multi-Environment Log Aggregation${NC}                                  ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    local title="$1"
    echo -e "\n${MAGENTA}▶ ${title}${NC}"
    echo -e "${MAGENTA}$(printf '─%.0s' {1..80})${NC}"
}

aggregate_logs() {
    local env="$1"
    local service="$2"
    local container_name="nexo-${service}-${env}"
    
    echo -e "${YELLOW}📋 ${env^^}/${service}${NC}"
    
    # Check if container exists and is running
    if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo -e "  ${RED}✗${NC} Container not running"
        return
    fi
    
    # Get logs
    local log_file="${LOG_DIR}/${env}-${service}-${TIMESTAMP}.log"
    if docker logs --tail "$LINES" "$container_name" > "$log_file" 2>&1; then
        local line_count=$(wc -l < "$log_file")
        local size=$(du -h "$log_file" | cut -f1)
        echo -e "  ${GREEN}✓${NC} Collected ${line_count} lines (${size})"
        echo -e "  ${CYAN}→${NC} Saved to: ${log_file}"
        
        # Show last 5 lines as preview
        echo -e "  ${CYAN}Preview (last 5 lines):${NC}"
        tail -5 "$log_file" | sed 's/^/    /'
    else
        echo -e "  ${RED}✗${NC} Failed to collect logs"
        rm -f "$log_file"
    fi
}

aggregate_all() {
    print_section "Aggregating Logs from All Environments"
    
    for env in "${ENVIRONMENTS[@]}"; do
        # Skip if filtering by environment
        if [[ "$FILTER_ENV" != "all" && "$FILTER_ENV" != "$env" ]]; then
            continue
        fi
        
        echo -e "\n${BLUE}═══ ${env^^} Environment ═══${NC}"
        
        for service in "${SERVICES[@]}"; do
            # Skip if filtering by service
            if [[ "$FILTER_SERVICE" != "all" && "$FILTER_SERVICE" != "$service" ]]; then
                continue
            fi
            
            aggregate_logs "$env" "$service"
        done
    done
}

create_combined_log() {
    print_section "Creating Combined Log File"
    
    local combined_file="${LOG_DIR}/combined-${FILTER_ENV}-${FILTER_SERVICE}-${TIMESTAMP}.log"
    
    echo -e "${YELLOW}Combining logs...${NC}"
    
    # Add header to combined log
    {
        echo "===================================================================================================="
        echo "NEXO Multi-Environment Log Aggregation"
        echo "Generated: $(date)"
        echo "Filter: Environment=${FILTER_ENV}, Service=${FILTER_SERVICE}, Lines=${LINES}"
        echo "===================================================================================================="
        echo ""
    } > "$combined_file"
    
    # Combine all generated logs
    for log_file in "$LOG_DIR"/*-${TIMESTAMP}.log; do
        if [[ -f "$log_file" ]]; then
            local filename=$(basename "$log_file")
            {
                echo ""
                echo "──────────────────────────────────────────────────────────────────────────────────────────────"
                echo "Source: $filename"
                echo "──────────────────────────────────────────────────────────────────────────────────────────────"
                cat "$log_file"
            } >> "$combined_file"
        fi
    done
    
    local total_size=$(du -h "$combined_file" | cut -f1)
    local total_lines=$(wc -l < "$combined_file")
    
    echo -e "${GREEN}✓${NC} Combined log created: ${combined_file}"
    echo -e "  Size: ${total_size}, Lines: ${total_lines}"
}

search_logs() {
    print_section "Search Logs"
    
    read -p "Enter search pattern (or press Enter to skip): " search_pattern
    
    if [[ -n "$search_pattern" ]]; then
        echo -e "${YELLOW}Searching for: '${search_pattern}'${NC}\n"
        
        local combined_file="${LOG_DIR}/combined-${FILTER_ENV}-${FILTER_SERVICE}-${TIMESTAMP}.log"
        
        if [[ -f "$combined_file" ]]; then
            grep -i --color=always "$search_pattern" "$combined_file" || echo -e "${RED}No matches found${NC}"
        else
            echo -e "${RED}Combined log file not found${NC}"
        fi
    fi
}

analyze_errors() {
    print_section "Error Analysis"
    
    local combined_file="${LOG_DIR}/combined-${FILTER_ENV}-${FILTER_SERVICE}-${TIMESTAMP}.log"
    
    if [[ ! -f "$combined_file" ]]; then
        echo -e "${RED}Combined log file not found${NC}"
        return
    fi
    
    echo -e "${YELLOW}Analyzing errors...${NC}\n"
    
    # Count errors
    local error_count=$(grep -ci "error" "$combined_file" || echo "0")
    local warning_count=$(grep -ci "warning\|warn" "$combined_file" || echo "0")
    local fatal_count=$(grep -ci "fatal\|critical" "$combined_file" || echo "0")
    
    echo -e "${RED}Errors:${NC}    $error_count"
    echo -e "${YELLOW}Warnings:${NC}  $warning_count"
    echo -e "${MAGENTA}Fatal:${NC}     $fatal_count"
    
    if [[ $error_count -gt 0 ]]; then
        echo -e "\n${RED}Last 10 error messages:${NC}"
        grep -i "error" "$combined_file" | tail -10 | sed 's/^/  /'
    fi
}

show_summary() {
    print_section "Summary"
    
    local total_files=$(find "$LOG_DIR" -name "*-${TIMESTAMP}.log" | wc -l)
    local total_size=$(du -sh "$LOG_DIR" | cut -f1)
    
    echo -e "${GREEN}✓${NC} Log aggregation complete"
    echo -e "  Files collected: $total_files"
    echo -e "  Total size: $total_size"
    echo -e "  Location: $LOG_DIR"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo -e "  1. Review combined log: less ${LOG_DIR}/combined-${FILTER_ENV}-${FILTER_SERVICE}-${TIMESTAMP}.log"
    echo -e "  2. Search logs: grep 'pattern' ${LOG_DIR}/*.log"
    echo -e "  3. Copy to remote: scp -r ${LOG_DIR} user@remote:/path"
}

# ==============================================================================
# Main
# ==============================================================================

main() {
    print_header
    
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "  Environment filter: ${YELLOW}${FILTER_ENV}${NC}"
    echo -e "  Service filter:     ${YELLOW}${FILTER_SERVICE}${NC}"
    echo -e "  Lines per service:  ${YELLOW}${LINES}${NC}"
    echo -e "  Output directory:   ${YELLOW}${LOG_DIR}${NC}"
    echo ""
    
    # Aggregate logs
    aggregate_all
    
    # Create combined log
    create_combined_log
    
    # Analyze errors
    analyze_errors
    
    # Optional: Search logs
    # search_logs
    
    # Show summary
    show_summary
}

# Run main function
main

# ==============================================================================
# Usage Examples in .mise.toml
# ==============================================================================
# Add these tasks to .mise.toml:
#
# [tasks."docker:logs-aggregate"]
# description = "Aggregate all Docker logs"
# run = "bash scripts/aggregate-logs.sh"
#
# [tasks."docker:logs-dev"]
# description = "Aggregate DEV environment logs"
# run = "bash scripts/aggregate-logs.sh dev"
#
# [tasks."docker:logs-prod-auth"]
# description = "Aggregate PROD auth service logs"
# run = "bash scripts/aggregate-logs.sh prod auth-service"
# ==============================================================================
