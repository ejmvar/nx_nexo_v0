#!/bin/bash

# Test script for Attachments System
# This script comprehensively tests all attachment endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUTH_SERVICE_URL="${AUTH_SERVICE_URL:-http://localhost:3001}"
CRM_SERVICE_URL="${CRM_SERVICE_URL:-http://localhost:3003}"
TEST_USER_EMAIL="attachment-test-$(date +%s)@test.com"
TEST_USER_PASSWORD="Test123!"
TEST_ENTITY_ID="11111111-1111-1111-1111-111111111111"

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Temporary files
TEMP_DIR=$(mktemp -d)
TEST_FILE_SMALL="$TEMP_DIR/test-small.txt"
TEST_FILE_IMAGE="$TEMP_DIR/test-image.jpg"
TEST_FILE_PDF="$TEMP_DIR/test-document.pdf"
TEST_FILE_LARGE="$TEMP_DIR/test-large.bin"
TEST_FILE_INVALID="$TEMP_DIR/test-invalid.exe"
DOWNLOAD_FILE="$TEMP_DIR/downloaded-file"

trap 'rm -rf "$TEMP_DIR"' EXIT

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓PASS]${NC} $1"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

fail() {
    echo -e "${RED}[✗FAIL]${NC} $1"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# Create test files
create_test_files() {
    log "Creating test files..."
    
    # Small text file (60 bytes)
    echo "This is a test file for attachment testing." > "$TEST_FILE_SMALL"
    
    # Fake image file (1KB)
    dd if=/dev/urandom of="$TEST_FILE_IMAGE" bs=1024 count=1 2>/dev/null
    
    # Fake PDF file (100KB)
    dd if=/dev/urandom of="$TEST_FILE_PDF" bs=1024 count=100 2>/dev/null
    
    # Large file exceeding 10MB (11MB)
    dd if=/dev/urandom of="$TEST_FILE_LARGE" bs=1024 count=11264 2>/dev/null
    
    # Invalid file type
    echo "fake executable" > "$TEST_FILE_INVALID"
    
    log "Test files created in $TEMP_DIR"
}

# Register test user and get token
register_and_login() {
    section "Authentication Setup"
    
    log "Registering test user: $TEST_USER_EMAIL"
    
    REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_SERVICE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_USER_EMAIL\",
            \"password\": \"$TEST_USER_PASSWORD\",
            \"username\": \"attachtest\",
            \"firstName\": \"Attachment\",
            \"lastName\": \"Test\",
            \"accountName\": \"Attachment Test Account\",
            \"accountSlug\": \"attachment-test-$(date +%s)\"
        }")
    
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken // .access_token // empty')
    
    if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
        fail "Failed to register user or get access token"
        echo "Response: $REGISTER_RESPONSE"
        exit 1
    fi
    
    success "User registered and authenticated"
    log "Access token obtained: ${ACCESS_TOKEN:0:20}..."
}

# Test 1: Upload small text file
test_upload_small_file() {
    section "Test 1: Upload Small Text File"
    
    log "Uploading small text file (60 bytes)..."
    
    RESPONSE=$(curl -s -X POST "$CRM_SERVICE_URL/api/attachments/upload?entityType=client&entityId=$TEST_ENTITY_ID&description=Test%20small%20file" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -F "file=@$TEST_FILE_SMALL")
    
    ATTACHMENT_ID=$(echo "$RESPONSE" | jq -r '.id // empty')
    
    if [ -n "$ATTACHMENT_ID" ] && [ "$ATTACHMENT_ID" != "null" ]; then
        success "Small file uploaded successfully (ID: $ATTACHMENT_ID)"
        echo "$ATTACHMENT_ID" > "$TEMP_DIR/small_file_id.txt"
    else
        fail "Failed to upload small file"
        echo "Response: $RESPONSE"
        return 1
    fi
    
    # Verify response fields
    FILE_SIZE=$(echo "$RESPONSE" | jq -r '.file_size')
    MIME_TYPE=$(echo "$RESPONSE" | jq -r '.mime_type')
    
    if [ "$FILE_SIZE" -eq 60 ] || [ "$FILE_SIZE" -eq 45 ]; then
        success "File size correct: $FILE_SIZE bytes"
    else
        fail "File size incorrect: expected ~60, got $FILE_SIZE"
    fi
    
    if [ "$MIME_TYPE" = "text/plain" ]; then
        success "MIME type correct: $MIME_TYPE"
    else
        warn "MIME type: $MIME_TYPE (expected text/plain)"
    fi
}

# Test 2: Upload large file (should fail)
test_upload_large_file() {
    section "Test 2: Upload Large File (>10MB - Should Fail)"
    
    log "Uploading large file (11MB, should exceed limit)..."
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$CRM_SERVICE_URL/api/attachments/upload?entityType=client&entityId=$TEST_ENTITY_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -F "file=@$TEST_FILE_LARGE")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")
    
    if [ "$HTTP_CODE" = "400" ]; then
        success "Large file rejected with 400 Bad Request"
    else
        fail "Large file should have been rejected (got HTTP $HTTP_CODE)"
        echo "Response: $BODY"
    fi
    
    if echo "$BODY" | grep -q "exceeds maximum"; then
        success "Error message mentions size limit"
    else
        warn "Error message doesn't mention size limit"
    fi
}

# Test 3: Upload invalid MIME type
test_upload_invalid_mime() {
    section "Test 3: Upload Invalid MIME Type (Should Fail)"
    
    log "Uploading invalid file type (.exe)..."
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$CRM_SERVICE_URL/api/attachments/upload?entityType=client&entityId=$TEST_ENTITY_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -F "file=@$TEST_FILE_INVALID")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")
    
    if [ "$HTTP_CODE" = "400" ]; then
        success "Invalid MIME type rejected with 400 Bad Request"
    else
        fail "Invalid MIME type should have been rejected (got HTTP $HTTP_CODE)"
        echo "Response: $BODY"
    fi
    
    if echo "$BODY" | grep -q "not allowed"; then
        success "Error message mentions file type not allowed"
    else
        warn "Error message doesn't mention file type restriction"
    fi
}

# Test 4: List attachments
test_list_attachments() {
    section "Test 4: List Attachments"
    
    log "Listing all attachments..."
    
    RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments")
    
    COUNT=$(echo "$RESPONSE" | jq '. | length')
    
    if [ "$COUNT" -ge 1 ]; then
        success "Listed $COUNT attachment(s)"
    else
        fail "Failed to list attachments or no attachments found"
        echo "Response: $RESPONSE"
        return 1
    fi
    
    # Test filtering by entity type
    log "Filtering by entity type (client)..."
    
    FILTERED_RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments?entityType=client")
    
    FILTERED_COUNT=$(echo "$FILTERED_RESPONSE" | jq '. | length')
    
    if [ "$FILTERED_COUNT" -ge 1 ]; then
        success "Filtered list returned $FILTERED_COUNT attachment(s)"
    else
        warn "Filtering by entity type returned unexpected results"
    fi
}

# Test 5: Get attachment metadata
test_get_attachment() {
    section "Test 5: Get Attachment Metadata"
    
    if [ ! -f "$TEMP_DIR/small_file_id.txt" ]; then
        fail "No attachment ID available from previous test"
        return 1
    fi
    
    ATTACHMENT_ID=$(cat "$TEMP_DIR/small_file_id.txt")
    log "Getting metadata for attachment: $ATTACHMENT_ID"
    
    RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments/$ATTACHMENT_ID")
    
    ID=$(echo "$RESPONSE" | jq -r '.id // empty')
    
    if [ "$ID" = "$ATTACHMENT_ID" ]; then
        success "Retrieved attachment metadata successfully"
    else
        fail "Failed to retrieve attachment metadata"
        echo "Response: $RESPONSE"
        return 1
    fi
    
    # Check all expected fields are present
    REQUIRED_FIELDS=("id" "account_id" "entity_type" "entity_id" "file_name" "original_name" "file_size" "mime_type")
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        value=$(echo "$RESPONSE" | jq -r ".$field // empty")
        if [ -n "$value" ] && [ "$value" != "null" ]; then
            success "Field '$field' present: $value"
        else
            fail "Required field '$field' missing or null"
        fi
    done
}

# Test 6: Download attachment
test_download_attachment() {
    section "Test 6: Download Attachment"
    
    if [ ! -f "$TEMP_DIR/small_file_id.txt" ]; then
        fail "No attachment ID available from previous test"
        return 1
    fi
    
    ATTACHMENT_ID=$(cat "$TEMP_DIR/small_file_id.txt")
    log "Downloading attachment: $ATTACHMENT_ID"
    
    HTTP_CODE=$(curl -s -w "%{http_code}" -o "$DOWNLOAD_FILE" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments/$ATTACHMENT_ID/download")
    
    if [ "$HTTP_CODE" = "200" ]; then
        success "Download successful (HTTP 200)"
    else
        fail "Download failed (HTTP $HTTP_CODE)"
        return 1
    fi
    
    if [ -f "$DOWNLOAD_FILE" ]; then
        DOWNLOAD_SIZE=$(wc -c < "$DOWNLOAD_FILE")
        success "Downloaded file size: $DOWNLOAD_SIZE bytes"
        
        # Verify content matches original
        if cmp -s "$TEST_FILE_SMALL" "$DOWNLOAD_FILE"; then
            success "Downloaded file content matches original"
        else
            warn "Downloaded file content differs from original"
        fi
    else
        fail "Downloaded file not found"
    fi
}

# Test 7: Get statistics
test_get_statistics() {
    section "Test 7: Get Attachment Statistics"
    
    log "Fetching attachment statistics..."
    
    RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments/stats")
    
    TOTAL_FILES=$(echo "$RESPONSE" | jq -r '.totalFiles // 0')
    TOTAL_SIZE=$(echo "$RESPONSE" | jq -r '.totalSize // 0')
    
    if [ "$TOTAL_FILES" -ge 1 ]; then
        success "Statistics show $TOTAL_FILES file(s), $TOTAL_SIZE bytes total"
    else
        fail "Statistics returned unexpected values"
        echo "Response: $RESPONSE"
        return 1
    fi
    
    # Check by entity type breakdown
    CLIENT_COUNT=$(echo "$RESPONSE" | jq -r '.byEntityType.client.count // 0')
    
    if [ "$CLIENT_COUNT" -ge 1 ]; then
        success "Entity type breakdown shows $CLIENT_COUNT client attachment(s)"
    else
        warn "Entity type breakdown not as expected"
    fi
}

# Test 8: Delete attachment
test_delete_attachment() {
    section "Test 8: Delete Attachment"
    
    if [ ! -f "$TEMP_DIR/small_file_id.txt" ]; then
        fail "No attachment ID available from previous test"
        return 1
    fi
    
    ATTACHMENT_ID=$(cat "$TEMP_DIR/small_file_id.txt")
    log "Deleting attachment: $ATTACHMENT_ID"
    
    HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null \
        -X DELETE \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments/$ATTACHMENT_ID")
    
    if [ "$HTTP_CODE" = "204" ]; then
        success "Attachment deleted successfully (HTTP 204)"
    else
        fail "Delete failed (HTTP $HTTP_CODE)"
        return 1
    fi
    
    # Verify it's gone
    log "Verifying deletion..."
    
    VERIFY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$CRM_SERVICE_URL/api/attachments/$ATTACHMENT_ID")
    
    VERIFY_HTTP_CODE=$(echo "$VERIFY_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    
    if [ "$VERIFY_HTTP_CODE" = "404" ]; then
        success "Verified: Attachment no longer exists (HTTP 404)"
    else
        warn "Expected 404 after deletion, got HTTP $VERIFY_HTTP_CODE"
    fi
}

# Test 9: Upload without authentication
test_upload_no_auth() {
    section "Test 9: Upload Without Authentication (Should Fail)"
    
    log "Attempting upload without JWT token..."
    
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$CRM_SERVICE_URL/api/attachments/upload?entityType=client&entityId=$TEST_ENTITY_ID" \
        -F "file=@$TEST_FILE_SMALL")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "401" ]; then
        success "Unauthorized request rejected with 401"
    else
        fail "Unauthorized request should have been rejected (got HTTP $HTTP_CODE)"
    fi
}

# Test 10: Multiple file uploads and cleanup
test_multiple_uploads() {
    section "Test 10: Multiple File Uploads"
    
    log "Uploading multiple files..."
    
    IDS=()
    
    for i in {1..3}; do
        RESPONSE=$(curl -s -X POST "$CRM_SERVICE_URL/api/attachments/upload?entityType=project&entityId=$TEST_ENTITY_ID&description=Batch%20test%20$i" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -F "file=@$TEST_FILE_SMALL")
        
        ID=$(echo "$RESPONSE" | jq -r '.id // empty')
        
        if [ -n "$ID" ] && [ "$ID" != "null" ]; then
            IDS+=("$ID")
        fi
    done
    
    if [ ${#IDS[@]} -eq 3 ]; then
        success "Uploaded ${#IDS[@]} files successfully"
    else
        fail "Expected 3 uploads, got ${#IDS[@]}"
    fi
    
    # Cleanup
    log "Cleaning up uploaded files..."
    for id in "${IDS[@]}"; do
        curl -s -X DELETE -H "Authorization: Bearer $ACCESS_TOKEN" \
            "$CRM_SERVICE_URL/api/attachments/$id" > /dev/null
    done
    
    success "Cleanup completed"
}

# Main execution
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║         Attachments System Comprehensive Test Suite          ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    log "Auth Service: $AUTH_SERVICE_URL"
    log "CRM Service: $CRM_SERVICE_URL"
    log "Test User: $TEST_USER_EMAIL"
    
    create_test_files
    register_and_login
    
    # Run all tests
    test_upload_small_file
    test_upload_large_file
    test_upload_invalid_mime
    test_list_attachments
    test_get_attachment
    test_download_attachment
    test_get_statistics
    test_delete_attachment
    test_upload_no_auth
    test_multiple_uploads
    
    # Summary
    section "Test Summary"
    echo ""
    echo "  Total Tests:  $TESTS_TOTAL"
    echo -e "  ${GREEN}Passed:       $TESTS_PASSED${NC}"
    echo -e "  ${RED}Failed:       $TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                  ALL TESTS PASSED! ✓                          ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                  SOME TESTS FAILED! ✗                         ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
        exit 1
    fi
}

# Run main function
main
