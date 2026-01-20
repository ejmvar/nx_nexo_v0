#!/bin/bash
# ============================================================================
# Development Environment Setup Script
# ============================================================================
# Complete onboarding script for new developers
# Usage: bash scripts/setup-dev.sh
# ============================================================================

set -e

echo "🏗️  Setting up NEXO CRM Development Environment..."
echo "============================================"

# Function to check if command exists
command_exists() {
    command -v "$1" > /dev/null 2>&1
}

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "ok" ]; then
        echo "✓ $message"
    elif [ "$status" = "error" ]; then
        echo "❌ $message"
    elif [ "$status" = "warning" ]; then
        echo "⚠️  $message"
    else
        echo "ℹ️  $message"
    fi
}

# Check prerequisites
echo ""
echo "1️⃣  Checking prerequisites..."
echo "============================================"

MISSING_DEPS=0

if command_exists docker; then
    print_status ok "Docker is installed ($(docker --version))"
else
    print_status error "Docker is not installed"
    echo "   Install from: https://docs.docker.com/get-docker/"
    MISSING_DEPS=1
fi

if command_exists docker-compose || docker compose version > /dev/null 2>&1; then
    print_status ok "Docker Compose is installed"
else
    print_status error "Docker Compose is not installed"
    MISSING_DEPS=1
fi

if command_exists mise; then
    print_status ok "MISE is installed ($(mise --version))"
else
    print_status warning "MISE is not installed (optional but recommended)"
    echo "   Install from: https://mise.jdx.dev/getting-started.html"
fi

if command_exists pnpm; then
    print_status ok "pnpm is installed ($(pnpm --version))"
else
    print_status warning "pnpm is not installed"
    echo "   Install with: npm install -g pnpm"
fi

if command_exists nx; then
    print_status ok "Nx is installed ($(nx --version))"
else
    print_status warning "Nx is not installed"
    echo "   Install with: pnpm install -g nx"
fi

if [ $MISSING_DEPS -ne 0 ]; then
    echo ""
    print_status error "Missing required dependencies. Please install them and run this script again."
    exit 1
fi

# Validate configuration
echo ""
echo "2️⃣  Validating configuration..."
echo "============================================"

if [ -f "docker/docker-compose.yml" ]; then
    print_status ok "Docker Compose configuration found"
    docker compose -f docker/docker-compose.yml config > /dev/null
    print_status ok "Docker Compose configuration is valid"
else
    print_status error "docker/docker-compose.yml not found"
    exit 1
fi

if [ -d "k8s" ]; then
    print_status ok "Kubernetes manifests directory found"
else
    print_status warning "k8s directory not found"
fi

# Setup MISE (if available)
echo ""
echo "3️⃣  Setting up MISE tasks..."
echo "============================================"

if command_exists mise; then
    mise install
    print_status ok "MISE tools installed"
    
    echo ""
    echo "Available MISE tasks:"
    mise tasks | grep -E "^(docker|test|dev|k8s|ci)" || true
else
    print_status warning "MISE not installed, skipping MISE setup"
fi

# Setup Nx workspace (if exists)
echo ""
echo "4️⃣  Setting up Nx workspace..."
echo "============================================"

if [ -d "nexo-prj" ]; then
    print_status ok "nexo-prj workspace found"
    
    cd nexo-prj
    
    if [ -f "package.json" ]; then
        print_status info "Installing dependencies..."
        pnpm install
        print_status ok "Dependencies installed"
    fi
    
    cd ..
else
    print_status warning "nexo-prj workspace not found"
    echo "   Create with: mise run 100-000-002-nx-CREATE-pnpm-project-here"
fi

# Start Docker services
echo ""
echo "5️⃣  Starting Docker services..."
echo "============================================"

read -p "Do you want to start Docker services now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -f docker/docker-compose.yml up -d
    print_status ok "Docker services started"
    
    echo ""
    print_status info "Waiting for services to be healthy (60s timeout)..."
    sleep 5
    
    # Run health checks
    if [ -f "scripts/test-docker-health.sh" ]; then
        bash scripts/test-docker-health.sh || print_status warning "Some health checks failed, services may still be starting"
    fi
else
    print_status info "Skipping Docker services startup"
    echo "   Start manually with: mise run docker:up"
fi

# Final instructions
echo ""
echo "============================================"
echo "🎉 Setup Complete!"
echo "============================================"
echo ""
echo "📚 Quick Start Guide:"
echo ""
echo "View all available tasks:"
echo "  $ mise tasks"
echo ""
echo "Start development environment:"
echo "  $ mise run dev"
echo ""
echo "Run all tests:"
echo "  $ mise run test:all"
echo ""
echo "Start frontend development:"
echo "  $ mise run dev:frontend"
echo ""
echo "View Docker logs:"
echo "  $ mise run docker:logs"
echo ""
echo "For more information, see:"
echo "  - README.md"
echo "  - docs/docker.md"
echo "  - ARCHITECTURE.md"
echo ""
