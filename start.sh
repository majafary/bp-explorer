#!/bin/bash
# ============================================
# Blueprint Explorer - Docker Startup Script
# Builds and runs all containers from Dockerfiles
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Blueprint Explorer - Docker Startup${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Configuration
NETWORK_NAME="bp-network"
APP_CONTAINER="bp-explorer"
STRUCTURIZR_CONTAINER="structurizr"
PROXY_CONTAINER="nginx-proxy"

# Step 1: Clean up existing containers and network
echo -e "${YELLOW}🧹 Cleaning up existing containers and network...${NC}"
docker rm -f $APP_CONTAINER $STRUCTURIZR_CONTAINER $PROXY_CONTAINER 2>/dev/null || true
docker network rm $NETWORK_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Create Docker network
echo -e "${YELLOW}🌐 Creating Docker network: $NETWORK_NAME${NC}"
docker network create $NETWORK_NAME
echo -e "${GREEN}✅ Network created${NC}"
echo ""

# Step 3: Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
echo ""

echo -e "${BLUE}Building bp-explorer (React app)...${NC}"
docker build -f Dockerfile.app -t bp-explorer:latest .
echo -e "${GREEN}✅ bp-explorer built${NC}"
echo ""

echo -e "${BLUE}Building structurizr (with workspace generation)...${NC}"
docker build -f Dockerfile.structurizr -t structurizr:latest .
echo -e "${GREEN}✅ structurizr built${NC}"
echo ""

echo -e "${BLUE}Building nginx-proxy (reverse proxy)...${NC}"
docker build -f Dockerfile.proxy -t nginx-proxy:latest .
echo -e "${GREEN}✅ nginx-proxy built${NC}"
echo ""

# Step 4: Run containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
echo ""

# Start Structurizr (backend service)
echo -e "${BLUE}Starting Structurizr container...${NC}"
docker run -d \
  --name $STRUCTURIZR_CONTAINER \
  --network $NETWORK_NAME \
  -e STRUCTURIZR_WORKSPACE_FILENAME=workspace \
  -e STRUCTURIZR_AUTO_REFRESH_INTERVAL=0 \
  structurizr:latest
echo -e "${GREEN}✅ Structurizr started${NC}"
echo ""

# Wait for Structurizr to be healthy
echo -e "${BLUE}Waiting for Structurizr to be ready...${NC}"
sleep 10
echo -e "${GREEN}✅ Structurizr ready${NC}"
echo ""

# Start Nginx Proxy (proxies to Structurizr, exposed on 8080)
echo -e "${BLUE}Starting Nginx Proxy container...${NC}"
docker run -d \
  --name $PROXY_CONTAINER \
  --network $NETWORK_NAME \
  -p 8080:80 \
  -e STRUCTURIZR_HOST=$STRUCTURIZR_CONTAINER \
  -e STRUCTURIZR_PORT=8080 \
  -e CORS_ORIGIN=http://localhost:5173 \
  nginx-proxy:latest
echo -e "${GREEN}✅ Nginx Proxy started (accessible at http://localhost:8080)${NC}"
echo ""

# Start React App (exposed on 5173)
echo -e "${BLUE}Starting Blueprint Explorer React app...${NC}"
docker run -d \
  --name $APP_CONTAINER \
  --network $NETWORK_NAME \
  -p 5173:80 \
  bp-explorer:latest
echo -e "${GREEN}✅ Blueprint Explorer started (accessible at http://localhost:5173)${NC}"
echo ""

# Step 5: Show status
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}🎉 All containers started successfully!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|bp-explorer|structurizr|nginx-proxy"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  ${GREEN}React App:${NC}         http://localhost:5173"
echo -e "  ${GREEN}Structurizr (proxy):${NC} http://localhost:8080"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo -e "  docker logs -f $APP_CONTAINER"
echo -e "  docker logs -f $STRUCTURIZR_CONTAINER"
echo -e "  docker logs -f $PROXY_CONTAINER"
echo ""
echo -e "${YELLOW}Stop all containers:${NC}"
echo -e "  ./stop.sh"
echo ""
