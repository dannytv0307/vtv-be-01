# Multi-stage build for NestJS application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include dev deps for building)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Install curl for health check
RUN apk add --no-cache curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy healthcheck script
COPY --chown=nestjs:nodejs healthcheck.js ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "dist/main"]
