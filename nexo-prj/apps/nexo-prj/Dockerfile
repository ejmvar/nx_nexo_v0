# Use Node.js multi-arch image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files from monorepo root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the app's package.json
COPY apps/nexo-prj/package.json ./apps/nexo-prj/

# Copy source code first
COPY apps ./apps
COPY libs ./libs
COPY nx.json tsconfig.base.json ./
COPY .nx ./.nx

# Install dependencies (this will build the shared-ui library as part of the workspace)
RUN pnpm install --frozen-lockfile

# Build the application (shared-ui is already built)
RUN cd apps/nexo-prj && pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["cd", "apps/nexo-prj", "&&", "pnpm", "start"]