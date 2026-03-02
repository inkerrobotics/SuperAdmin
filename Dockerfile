# Multi-stage build for unified deployment
FROM node:18-alpine AS frontend-builder

# Install frontend dependencies (including devDependencies for build)
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend-builder

# Install system dependencies for Prisma and bcrypt
RUN apk add --no-cache openssl libc6-compat

# Install backend dependencies (including devDependencies for build)
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache openssl libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend build
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./dist

# Copy Prisma client (generated during build)
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema for migrations
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/prisma ./prisma

# Copy frontend build to backend's public directory
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/app.js"]