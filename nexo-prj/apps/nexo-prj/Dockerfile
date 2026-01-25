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

# Copy necessary config files
COPY nx.json tsconfig.base.json ./

# Copy shared-ui library source (needed for transpilation)
COPY libs/shared-ui ./libs/shared-ui

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Next.js app source
COPY apps/nexo-prj ./apps/nexo-prj

# Build the Next.js application (will transpile shared-ui on the fly)
RUN cd apps/nexo-prj && pnpm build

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/apps/nexo-prj
CMD ["pnpm", "start"]