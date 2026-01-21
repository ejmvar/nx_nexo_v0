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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared libraries
RUN pnpm nx build shared-ui

# Build the application
RUN cd apps/nexo-prj && pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["cd", "apps/nexo-prj", "&&", "pnpm", "start"]