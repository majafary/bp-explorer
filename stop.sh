#!/bin/bash
# ============================================
# Blueprint Explorer - Docker Stop Script
# Stops and removes all containers
# ============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Blueprint Explorer - Stopping Containers${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Configuration
NETWORK_NAME="bp-network"
APP_CONTAINER="bp-explorer"
STRUCTURIZR_CONTAINER="structurizr"
PROXY_CONTAINER="nginx-proxy"

# Stop and remove containers
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker stop $APP_CONTAINER $STRUCTURIZR_CONTAINER $PROXY_CONTAINER 2>/dev/null || true
echo -e "${GREEN}✅ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}🗑️  Removing containers...${NC}"
docker rm $APP_CONTAINER $STRUCTURIZR_CONTAINER $PROXY_CONTAINER 2>/dev/null || true
echo -e "${GREEN}✅ Containers removed${NC}"
echo ""

echo -e "${YELLOW}🌐 Removing network...${NC}"
docker network rm $NETWORK_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Network removed${NC}"
echo ""

echo -e "${GREEN}🎉 All containers stopped and cleaned up!${NC}"
