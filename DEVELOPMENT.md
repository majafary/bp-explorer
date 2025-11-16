# Blueprint Explorer - Development Guide

## 🎯 Two Modes of Operation

### Development Mode (Live Reload) ⚡
**Use for:** Local development, testing changes, iterating on architecture

```bash
./start-dev.sh
```

**Features:**
- ✅ Volume mounts for live reload
- ✅ Auto-refresh enabled (2 second interval)
- ✅ File watcher regenerates DSL on JSON changes
- ✅ Structurizr automatically reloads diagrams
- ✅ No rebuild needed for data changes

**How it works:**
```
1. Edit ciam-systems.json or blueprints.json
2. File watcher detects change → Regenerates workspace.dsl
3. Structurizr auto-refreshes every 2 seconds
4. Diagrams update automatically in browser
```

**File watcher:**
```bash
# Start watcher in separate terminal
npm run structurizr:watch

# Or use docker-compose (alternative)
docker-compose up -d
npm run structurizr:watch
```

---

### Production Mode (Baked In) 📦
**Use for:** Building production images, deploying to ECS/Fargate

```bash
./start.sh
```

**Features:**
- ✅ Workspace baked into Docker image at build time
- ✅ No volume mounts (portable, immutable)
- ✅ Auto-refresh disabled (not needed)
- ✅ Ready for deployment to AWS ECS

**How it works:**
```
1. Dockerfile.structurizr generates workspace.dsl during build
2. DSL file is COPIED into image
3. Image is self-contained and portable
4. Changes require: stop → rebuild → restart
```

---

## 🔄 Development Workflow

### Quick Start
```bash
cd bp-explorer

# Start development mode with live reload
./start-dev.sh

# In another terminal, start file watcher
npm run structurizr:watch
```

### Access
- **React App**: http://localhost:5173
- **Structurizr Diagrams**: http://localhost:8080

### Making Changes

**1. Edit JSON data:**
```bash
vim src/data/ciam-systems.json
# Save changes
```

**2. Watcher automatically:**
- Detects change
- Regenerates workspace.dsl
- Structurizr reloads in ~2 seconds

**3. Refresh browser:**
- Diagrams show updated architecture

### Stopping
```bash
./stop.sh  # Stops all containers
```

---

## 📁 File Structure

```
bp-explorer/
├── structurizr-workspace/         # Auto-generated (gitignored)
│   ├── workspace.dsl              # Generated from JSON
│   ├── workspace.json             # Structurizr state
│   └── .structurizr/              # Structurizr metadata
├── src/data/
│   ├── ciam-systems.json          # C4 architecture data
│   └── blueprints.json            # Blueprint metadata
├── scripts/
│   ├── generate-structurizr-dsl.ts  # JSON → DSL converter
│   └── watch-and-sync.ts            # File watcher
├── start-dev.sh                   # Development mode (volume mounts)
├── start.sh                       # Production mode (baked in)
└── stop.sh                        # Stop all containers
```

---

## 🔧 npm Scripts

### Structurizr Commands
```bash
# Generate workspace.dsl from JSON (one-time)
npm run structurizr:generate

# Watch for changes and auto-regenerate
npm run structurizr:watch

# Start Structurizr container (docker-compose)
npm run structurizr:start

# Stop Structurizr container
npm run structurizr:stop

# View logs
npm run structurizr:logs

# Development mode (React + Structurizr + Watcher)
npm run structurizr:dev
```

### Application Commands
```bash
# React development server
npm run dev

# Build for production
npm run build

# Validate data model integrity
npm run validate-data
```

---

## 🐳 Docker Commands

### Development Mode
```bash
# Start with volume mounts (recommended for development)
./start-dev.sh

# Alternative: Use docker-compose
docker-compose up -d
npm run structurizr:watch
```

### Production Mode
```bash
# Build and run production images
./start.sh

# Build individual images manually
docker build -f Dockerfile.app -t bp-explorer .
docker build -f Dockerfile.structurizr -t structurizr .
docker build -f Dockerfile.proxy -t nginx-proxy .
```

### Debugging
```bash
# View container logs
docker logs -f structurizr
docker logs -f bp-explorer
docker logs -f nginx-proxy

# Execute commands in container
docker exec -it structurizr sh
docker exec -it structurizr ls -la /usr/local/structurizr/

# Inspect volume mount
docker inspect structurizr | grep -A 10 Mounts
```

---

## ⚙️ Configuration

### Structurizr Auto-Refresh

**Development (start-dev.sh):**
```bash
STRUCTURIZR_AUTO_REFRESH_INTERVAL=2000  # 2 seconds
```

**Production (start.sh):**
```bash
STRUCTURIZR_AUTO_REFRESH_INTERVAL=0  # Disabled
```

### Volume Mounts

**Development:**
```bash
-v "$WORKSPACE_DIR:/usr/local/structurizr"
```

**Production:**
```bash
# No volume mount - workspace is COPIED into image
COPY --from=workspace-generator /generator/workspace/workspace.dsl /usr/local/structurizr/workspace.dsl
```

---

## 🧪 Testing Auto-Reload

### Test 1: Change System Name
```bash
# 1. Start development mode
./start-dev.sh

# 2. Start file watcher (in another terminal)
npm run structurizr:watch

# 3. Edit a system name
vim src/data/ciam-systems.json
# Change: "name": "CIAM Suite" → "name": "CIAM Platform"

# 4. Save and watch the terminal
# You should see:
# [timestamp] 📝 File changed: ciam-systems.json
# [timestamp] 🔄 Regenerating Structurizr DSL...
# [timestamp] ✅ DSL regenerated successfully

# 5. Wait 2 seconds, refresh http://localhost:8080
# Diagram should show updated name
```

### Test 2: Add New Container
```bash
# 1. Add a new container to ciam-systems.json
# 2. Watch file watcher output
# 3. Verify it appears in diagram after ~2 seconds
```

---

## 🚨 Troubleshooting

### Problem: Changes not appearing in diagrams

**Check:**
```bash
# 1. Is file watcher running?
ps aux | grep watch-and-sync

# 2. Is Structurizr using volume mount?
docker inspect structurizr | grep -A 5 Mounts

# 3. Is auto-refresh enabled?
docker exec structurizr env | grep STRUCTURIZR_AUTO_REFRESH

# 4. Is workspace.dsl being updated?
ls -la structurizr-workspace/workspace.dsl
```

**Solutions:**
- Make sure you're using `./start-dev.sh` (not `./start.sh`)
- Restart file watcher: `npm run structurizr:watch`
- Check watcher output for errors
- Verify workspace.dsl modification time changes after JSON edit

### Problem: "Permission denied" on workspace files

```bash
# Fix permissions
chmod -R 755 structurizr-workspace/
```

### Problem: Structurizr shows old diagram

```bash
# Force refresh
docker restart structurizr

# Or regenerate manually
npm run structurizr:generate
```

---

## 📝 Best Practices

### Development Workflow
1. **Always use development mode** for local work
2. **Keep file watcher running** in a separate terminal
3. **Check watcher output** to confirm regeneration
4. **Wait 2 seconds** after save for Structurizr to refresh
5. **Use browser hard refresh** (Cmd+Shift+R) if needed

### Before Committing
```bash
# 1. Stop containers
./stop.sh

# 2. Validate data model
npm run validate-data

# 3. Test production build
./start.sh
# Verify app works at http://localhost:5173

# 4. Clean up
./stop.sh
```

### Production Deployment
```bash
# Use production mode (start.sh) for final testing
# Then push to Git for GitLab CI/CD pipeline
# Images will be built with baked-in workspace
```

---

## 🔗 Related Files

- **README.md** - General project overview
- **DEPLOYMENT.md** - AWS ECS deployment guide
- **deployment/docker-compose.prod.yml** - Alternative production setup
- **deployment/ecs-task-definition.json** - ECS Fargate configuration
