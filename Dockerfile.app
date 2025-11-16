# ============================================
# Multi-stage Dockerfile for React App
# Target: AWS ECS Fargate
# ============================================

# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build React app for production
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx-app.conf /etc/nginx/conf.d/default.conf

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
