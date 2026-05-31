# Stage 1: Builder (for TypeScript compilation)
FROM node:20-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first (layer caching)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install all dependencies (including dev for build)
RUN npm ci && npm install -g pnpm

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ------------------------------------------------------------------

# Stage 2: Runtime (final slim image)
FROM node:20-alpine

# Create non‑root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Install runtime system tools (optional: tini for graceful shutdown)
RUN apk add --no-cache tini

# Copy only production artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /build/surgery-room ./surgery-room
COPY --from=builder --chown=nodejs:nodejs /build/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /build/node_modules ./node_modules

# Copy elite configuration (if any)
COPY --chown=nodejs:nodejs .elite-config.json ./

# Expose health check endpoint (add to server.js if needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r=>r.ok?process.exit(0):process.exit(1))" || exit 1

# Switch to non‑root user
USER nodejs

EXPOSE 3001

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Run elite server (with optional environment variables)
CMD ["node", "server.js"]