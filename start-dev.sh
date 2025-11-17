#!/bin/bash
# ============================================
# Blueprint Explorer - Development Mode Startup
# Uses volume mounts for live reload
# Auto-builds missing Docker images
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command-line arguments
FORCE_REBUILD=false
CLEAN_BUILD=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--rebuild)
      FORCE_REBUILD=true
      shift
      ;;
    -c|--clean)
      CLEAN_BUILD=true
      shift
      ;;
    -h|--help)
      echo "Usage: ./start-dev.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -r, --rebuild    Force rebuild all Docker images"
      echo "  -c, --clean      Remove existing images before rebuilding"
      echo "  -h, --help       Show this help message"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Blueprint Explorer - Development Mode${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Configuration
NETWORK_NAME="bp-network"
APP_CONTAINER="bp-explorer"
STRUCTURIZR_CONTAINER="structurizr"
PROXY_CONTAINER="nginx-proxy"

# Get absolute path to bp-explorer directory
BP_EXPLORER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$BP_EXPLORER_DIR/structurizr-workspace"

# ============================================
# Helper Functions
# ============================================

# Check if Docker image exists
check_image_exists() {
  local image_name=$1
  if docker image inspect "$image_name" >/dev/null 2>&1; then
    return 0  # Image exists
  else
    return 1  # Image doesn't exist
  fi
}

# Build Docker image
build_image() {
  local image_name=$1
  local dockerfile=$2
  local description=$3

  echo -e "${YELLOW}🔨 Building $description...${NC}"

  # Check if Dockerfile exists
  if [[ ! -f "$BP_EXPLORER_DIR/$dockerfile" ]]; then
    echo -e "${RED}❌ Error: Dockerfile not found: $dockerfile${NC}"
    exit 1
  fi

  # Build the image
  if docker build -f "$BP_EXPLORER_DIR/$dockerfile" -t "$image_name" "$BP_EXPLORER_DIR"; then
    echo -e "${GREEN}✅ $description built successfully${NC}"
    return 0
  else
    echo -e "${RED}❌ Failed to build $description${NC}"
    exit 1
  fi
}

# Ensure all required images exist
ensure_images_exist() {
  local images_built=false

  echo -e "${YELLOW}🔍 Checking Docker images...${NC}"
  echo ""

  # Check and build bp-explorer image
  if [[ "$FORCE_REBUILD" == true ]] || ! check_image_exists "bp-explorer:latest"; then
    if [[ "$FORCE_REBUILD" == true ]]; then
      echo -e "${BLUE}Force rebuild requested for bp-explorer${NC}"
    else
      echo -e "${BLUE}bp-explorer:latest not found${NC}"
    fi

    if [[ "$CLEAN_BUILD" == true ]] && check_image_exists "bp-explorer:latest"; then
      echo -e "${YELLOW}Removing existing bp-explorer:latest image...${NC}"
      docker rmi bp-explorer:latest
    fi

    build_image "bp-explorer:latest" "Dockerfile.app" "Blueprint Explorer React App"
    images_built=true
    echo ""
  else
    echo -e "${GREEN}✅ bp-explorer:latest already exists${NC}"
  fi

  # Check and build nginx-proxy image
  if [[ "$FORCE_REBUILD" == true ]] || ! check_image_exists "nginx-proxy:latest"; then
    if [[ "$FORCE_REBUILD" == true ]]; then
      echo -e "${BLUE}Force rebuild requested for nginx-proxy${NC}"
    else
      echo -e "${BLUE}nginx-proxy:latest not found${NC}"
    fi

    if [[ "$CLEAN_BUILD" == true ]] && check_image_exists "nginx-proxy:latest"; then
      echo -e "${YELLOW}Removing existing nginx-proxy:latest image...${NC}"
      docker rmi nginx-proxy:latest
    fi

    build_image "nginx-proxy:latest" "Dockerfile.proxy" "Nginx Reverse Proxy"
    images_built=true
    echo ""
  else
    echo -e "${GREEN}✅ nginx-proxy:latest already exists${NC}"
  fi

  # Structurizr uses public image, will be pulled automatically if needed
  echo -e "${GREEN}✅ structurizr/lite:latest will be pulled from Docker Hub if needed${NC}"
  echo ""

  if [[ "$images_built" == true ]]; then
    echo -e "${GREEN}🎉 All required images are ready!${NC}"
    echo ""
  else
    echo -e "${GREEN}✅ All images already exist, skipping build${NC}"
    echo ""
  fi
}

# Step 1: Clean up existing containers and network
echo -e "${YELLOW}🧹 Cleaning up existing containers and network...${NC}"
docker rm -f $APP_CONTAINER $STRUCTURIZR_CONTAINER $PROXY_CONTAINER 2>/dev/null || true
docker network rm $NETWORK_NAME 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Ensure Docker images exist (build if missing)
ensure_images_exist

# Step 3: Create Docker network
echo -e "${YELLOW}🌐 Creating Docker network: $NETWORK_NAME${NC}"
docker network create $NETWORK_NAME
echo -e "${GREEN}✅ Network created${NC}"
echo ""

# Step 4: Ensure workspace directory exists and generate initial DSL
echo -e "${YELLOW}📝 Generating initial workspace...${NC}"
mkdir -p "$WORKSPACE_DIR"
npm run structurizr:generate
echo -e "${GREEN}✅ Workspace generated${NC}"
echo ""

# Step 5: Start containers with volume mounts
echo -e "${YELLOW}🚀 Starting containers (Development Mode)...${NC}"
echo ""

# Start Structurizr with VOLUME MOUNT for live reload
echo -e "${BLUE}Starting Structurizr container (with live reload)...${NC}"
docker run -d \
  --name $STRUCTURIZR_CONTAINER \
  --network $NETWORK_NAME \
  -v "$WORKSPACE_DIR:/usr/local/structurizr" \
  -e STRUCTURIZR_WORKSPACE_FILENAME=workspace \
  -e STRUCTURIZR_AUTO_REFRESH_INTERVAL=2000 \
  structurizr/lite:latest
echo -e "${GREEN}✅ Structurizr started with auto-refresh (2s)${NC}"
echo ""

# Wait for Structurizr to be ready
echo -e "${BLUE}Waiting for Structurizr to be ready...${NC}"
sleep 5
echo -e "${GREEN}✅ Structurizr ready${NC}"
echo ""

# Start Nginx Proxy
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

# Start React App
echo -e "${BLUE}Starting Blueprint Explorer React app...${NC}"
docker run -d \
  --name $APP_CONTAINER \
  --network $NETWORK_NAME \
  -p 5173:80 \
  bp-explorer:latest
echo -e "${GREEN}✅ Blueprint Explorer started (accessible at http://localhost:5173)${NC}"
echo ""

# Step 6: Show status
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}🎉 Development Mode Active!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}Running containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|bp-explorer|structurizr|nginx-proxy"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  ${GREEN}React App:${NC}         http://localhost:5173"
echo -e "  ${GREEN}Structurizr (proxy):${NC} http://localhost:8080"
echo ""
echo -e "${YELLOW}🔥 Live Reload Enabled:${NC}"
echo -e "  ${BLUE}Watch mode:${NC}        npm run structurizr:watch"
echo -e "  ${BLUE}Auto-refresh:${NC}      2 seconds after DSL changes"
echo -e "  ${BLUE}Workspace:${NC}         $WORKSPACE_DIR"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo -e "  docker logs -f $STRUCTURIZR_CONTAINER"
echo ""
echo -e "${YELLOW}Stop all:${NC}"
echo -e "  ./stop.sh"
echo ""
