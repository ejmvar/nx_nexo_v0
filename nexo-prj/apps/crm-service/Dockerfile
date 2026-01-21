# CRM Service Dockerfile
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/crm-service/package.json ./apps/crm-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/crm-service ./apps/crm-service
COPY nx.json tsconfig.base.json ./

# Build
RUN cd apps/crm-service && pnpm build

# Expose port
EXPOSE 3002

# Start
WORKDIR /app/apps/crm-service
CMD ["node", "dist/main.js"]
