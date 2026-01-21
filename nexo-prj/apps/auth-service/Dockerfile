# Auth Service Dockerfile
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/auth-service/package.json ./apps/auth-service/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/auth-service ./apps/auth-service
COPY nx.json tsconfig.base.json ./

# Build
RUN cd apps/auth-service && pnpm build

# Expose port
EXPOSE 3000

# Start
WORKDIR /app/apps/auth-service
CMD ["node", "dist/main.js"]
