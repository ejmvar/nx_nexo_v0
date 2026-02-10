# ============================================================================
# NestJS Backend API - Multi-stage Dockerfile
# ============================================================================

# Stage 1: Builder
FROM node:22.12-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.13.2

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy application source
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs

# Configure npm mirror (faster, more reliable for builds)
RUN pnpm config set registry https://registry.npmmirror.com

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm nx build api-gateway --prod

# Stage 2: Production
FROM node:22.12-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.13.2

# Copy package files and node_modules from builder (includes all deps)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist/apps/api-gateway ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/src/main.js"]
