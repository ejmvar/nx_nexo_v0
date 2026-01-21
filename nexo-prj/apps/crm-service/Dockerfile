# ============================================================================
# CRM Service - Multi-stage Dockerfile (Raspberry Pi Optimized)
# ============================================================================
# Supports: linux/amd64, linux/arm64, linux/arm/v7

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crm-service/package.json ./apps/crm-service/

# Install dependencies with cache mount for faster builds
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/crm-service/node_modules ./apps/crm-service/node_modules

# Copy source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./
COPY apps/crm-service ./apps/crm-service

# Build the application
RUN cd apps/crm-service && pnpm build

# Stage 3: Production (Minimal)
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
RUN npm install -g pnpm@latest && \
    apk add --no-cache tini

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only production dependencies
COPY --from=deps /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/apps/crm-service/dist ./dist

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "dist/main.js"]
