# NEXO Frontend - Multi-stage Docker Build
# =========================================
# Production-ready containerized deployment

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY nexo-prj/package.json nexo-prj/pnpm-lock.yaml* ./
COPY nexo-prj/pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy workspace configuration
COPY nexo-prj/nx.json ./
COPY nexo-prj/tsconfig.base.json ./
COPY nexo-prj/tsconfig.json ./

# Copy source code
COPY nexo-prj/apps ./apps
COPY nexo-prj/libs ./libs
COPY nexo-prj/shared-ui ./shared-ui

# Build the application
RUN pnpm exec nx build nexo-prj --prod

# Stage 2: Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/nexo-prj/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/nexo-prj/.next/static ./apps/nexo-prj/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/nexo-prj/public ./apps/nexo-prj/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/nexo-prj/server.js"]
