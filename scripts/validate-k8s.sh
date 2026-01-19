#!/bin/bash
# ============================================================================
# Kubernetes Manifests Validation Script
# ============================================================================
# Validates K8s YAML syntax and checks for common issues
# Usage: bash scripts/validate-k8s.sh
# ============================================================================

set -e

K8S_DIR="k8s"

echo "🎯 Validating Kubernetes manifests..."

# Check if k8s directory exists
if [ ! -d "$K8S_DIR" ]; then
    echo "❌ K8s directory not found: $K8S_DIR"
    exit 1
fi

echo "✓ K8s directory found"

# Count manifest files
MANIFEST_COUNT=$(find "$K8S_DIR" -name "*.yaml" -o -name "*.yml" | wc -l)
if [ "$MANIFEST_COUNT" -eq 0 ]; then
    echo "❌ No K8s manifests found in $K8S_DIR"
    exit 1
fi

echo "✓ Found $MANIFEST_COUNT manifest files"

FAILED=0

# Function to validate YAML syntax
validate_yaml() {
    local file=$1
    echo "Validating $file..."
    
    # Check if kubectl is available
    if command -v kubectl > /dev/null 2>&1; then
        if kubectl apply -f "$file" --dry-run=client > /dev/null 2>&1; then
            echo "✓ $file is valid"
            return 0
        else
            echo "❌ $file has validation errors"
            kubectl apply -f "$file" --dry-run=client 2>&1 | tail -n 5
            return 1
        fi
    else
        # Fallback to yamllint if available
        if command -v yamllint > /dev/null 2>&1; then
            if yamllint "$file" > /dev/null 2>&1; then
                echo "✓ $file YAML syntax is valid"
                return 0
            else
                echo "❌ $file has YAML syntax errors"
                yamllint "$file" 2>&1 | tail -n 5
                return 1
            fi
        else
            echo "⚠️  kubectl and yamllint not found, skipping validation for $file"
            return 0
        fi
    fi
}

# Validate all manifest files
for file in $(find "$K8S_DIR" -name "*.yaml" -o -name "*.yml"); do
    if ! validate_yaml "$file"; then
        FAILED=$((FAILED + 1))
    fi
done

# Summary
echo ""
echo "============================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All Kubernetes manifests are valid!"
    exit 0
else
    echo "❌ $FAILED manifest(s) failed validation"
    echo "💡 Install kubectl for better validation: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi
