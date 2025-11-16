# Enterprise Architecture Viewer - Blueprint Explorer

A modern web application for browsing enterprise architecture blueprints, capabilities hierarchies, and C4 architecture diagrams.

## 🚀 Quick Start (Docker)

**Start everything with one command:**
```bash
cd bp-explorer
./start.sh
```

This builds and runs:
- ✅ React app (bp-explorer)
- ✅ Structurizr Lite with auto-generated workspace
- ✅ Nginx reverse proxy (for iframe embedding)

**Access the application:**
- **React App**: http://localhost:5173
- **Structurizr Diagrams**: http://localhost:8080

**Stop all containers:**
```bash
./stop.sh
```

**View container logs:**
```bash
docker logs -f bp-explorer
docker logs -f structurizr
docker logs -f nginx-proxy
```

## Features

### MVP Features (Implemented)

#### 1. Blueprint Selection
- **Home Page**: Browse available blueprints with metadata
- **Blueprint Cards**: View description, organization, version, and LOBs
- **Quick Navigation**: Jump directly to Capabilities or C4 views

#### 2. Capabilities Hierarchy Browser
- **3-Level Tree Visualization**: Level 1 → Level 2 → Level 3 capabilities
- **Expand/Collapse**: Interactive tree navigation
- **Detail Panel**: View capability details, descriptions, and implementing systems
- **System Links**: Click "View in C4" to see implementing systems in C4 diagram
- **Code-based Organization**: Capabilities organized by blueprint code (001, 002, etc.)

#### 3. C4 Architecture Viewer
- **System Context Diagram**: High-level view of all systems (internal and external)
- **Container Diagram**: Drill down to see applications and databases within a system
- **Component Diagram**: View internal components organized by type (Controllers, Services, etc.)
- **Breadcrumb Navigation**: Easy navigation between levels
- **Visual Differentiation**: Color-coded by type (Backend, Frontend, Database, External)
- **Relationship Visualization**: See connections between systems and containers
- **🆕 Professional Architecture Diagrams**: Integrated Structurizr-powered C4 diagrams
  - **View Mode Toggle**: Switch between card grid and interactive diagram views
  - **Full-Screen Modal**: Professional diagram viewer with glassmorphism design
  - **Auto-Sync**: JSON changes automatically regenerate diagrams
  - **Context-Aware**: Diagrams update based on current view (System/Container/Component)
  - **Zoom & Pan**: Full Structurizr controls for diagram navigation
  - **Export Options**: Export diagrams as PNG/SVG
  - **Responsive Design**: Mobile-friendly with new tab fallback

#### 4. Bidirectional Navigation (FR-005 - Critical MVP Feature)
- **Capability → C4**: Click capability → See implementing systems → Navigate to C4 diagram
- **C4 → Capability**: Future enhancement (ready for capability tagging)
- **Context Preservation**: Maintains selection state across views
- **Deep Linking**: URLs reflect current view state for sharing

### Technology Stack

- **React 19.2** - Modern React with hooks
- **TypeScript 5.9** - Type safety and developer experience
- **Vite 7.2** - Fast build tool and dev server
- **React Router 7** - Client-side routing with URL state management
- **CSS3** - Modern styling with gradients, glassmorphism, and animations
- **Structurizr Lite** - Professional C4 diagram rendering (Docker)
- **Chokidar** - File watching for auto-sync
- **tsx** - TypeScript execution for build scripts

### Diagram Architecture

The application integrates professional C4 diagrams through a multi-layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                    (localhost:5173)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  C4ViewerPage                                         │  │
│  │  ├─ ViewModeToggle (Cards ⇄ Diagram)                 │  │
│  │  ├─ DiagramButton (Inline CTA)                       │  │
│  │  └─ DiagramModal (Full-screen overlay)               │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ iframe embed
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                 Structurizr Lite (Docker)                    │
│                    (localhost:8080)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Workspace DSL → Auto-reload → Rendered C4 Diagrams  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       ↑ monitors
                       │
┌─────────────────────────────────────────────────────────────┐
│               File Watcher (Chokidar)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ciam-systems.json → generates → workspace.dsl       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. JSON Model (`ciam-systems.json`) - Single source of truth
2. DSL Generator (`generate-structurizr-dsl.ts`) - Converts JSON → Structurizr DSL
3. File Watcher (`watch-and-sync.ts`) - Monitors JSON for changes
4. Structurizr Lite - Auto-reloads workspace on DSL changes
5. React Modal - Embeds Structurizr via iframe with context routing

## Project Structure

```
ciam-bp/
├── docker-compose.yml            # Structurizr Lite container
├── structurizr-workspace/        # Auto-generated workspace
│   └── workspace.dsl             # Structurizr DSL (auto-generated)
└── ciam-viewer/
    ├── src/
    │   ├── data/                 # JSON data files
    │   │   ├── blueprints.json   # Blueprint metadata
    │   │   ├── ciam-capabilities.json  # CIAM capabilities hierarchy
    │   │   └── ciam-systems.json # C4 architecture data (source of truth)
    │   ├── types/                # TypeScript type definitions
    │   │   └── index.ts
    │   ├── components/           # Reusable components
    │   │   ├── Layout.tsx
    │   │   ├── FilterBar.tsx
    │   │   ├── StatsPanel.tsx
    │   │   ├── DiagramModal.tsx  # 🆕 Full-screen diagram modal
    │   │   ├── DiagramButton.tsx # 🆕 Diagram action button
    │   │   ├── ViewModeToggle.tsx # 🆕 Card/Diagram toggle
    │   │   └── *.css
    │   ├── pages/                # Page components
    │   │   ├── HomePage.tsx      # Blueprint selector
    │   │   ├── CapabilitiesPage.tsx # Capability browser
    │   │   ├── C4ViewerPage.tsx  # C4 diagram viewer
    │   │   └── *.css
    │   ├── App.tsx               # Main app with routing
    │   └── main.tsx              # Entry point
    ├── scripts/                  # 🆕 Build & automation scripts
    │   ├── generate-structurizr-dsl.ts # JSON → DSL converter
    │   ├── watch-and-sync.ts     # File watcher for auto-sync
    │   └── validate-data-model.cjs # Data integrity validation
    ├── package.json              # Dependencies & npm scripts
    └── README.md                 # This file
```

## Data Model

### Blueprints
- ID, name, description
- Organization and version
- Associated LOBs
- Metadata (created, updated, owner)

### Capabilities (3-Level Hierarchy)
- **Level 1**: Major capability areas (Platform Onboarding, Profile Management, etc.)
- **Level 2**: Capability groups (Credential Issuance, Enhanced Authenticator, etc.)
- **Level 3**: Specific capabilities with system mappings

### C4 Architecture
- **Systems**: Software systems (internal and external)
- **Containers**: Applications, databases, services within systems
- **Components**: Internal components (Controllers, Services, Repositories, etc.)
- **Relationships**: Connections between elements with technology details

## Running the Application

### Development Mode

#### Option 1: React App Only (Basic Mode)
```bash
cd ciam-viewer
npm install
npm run dev
```

The app will be available at: **http://localhost:5173/**

#### Option 2: With Structurizr Diagrams (Full Experience)

**Prerequisites:**
- Docker Desktop installed and running
- Ports 5173 and 8080 available

**First Time Setup:**
```bash
cd ciam-viewer
npm install

# Generate initial Structurizr workspace from JSON
npm run structurizr:generate

# Start everything in one command (React + Structurizr + Auto-sync)
npm run structurizr:dev
```

**What This Does:**
- ✅ Starts React dev server on **http://localhost:5173**
- ✅ Starts Structurizr Lite on **http://localhost:8080**
- ✅ Watches `ciam-systems.json` for changes and auto-regenerates DSL
- ✅ Structurizr auto-reloads diagrams when DSL changes

**Manual Control:**
```bash
# Generate DSL from JSON (one-time)
npm run structurizr:generate

# Start file watcher (monitors JSON → generates DSL)
npm run structurizr:watch

# Start Structurizr Docker container
npm run structurizr:start

# Stop Structurizr container
npm run structurizr:stop

# View Structurizr logs
npm run structurizr:logs
```

**Accessing Services:**
- React App: **http://localhost:5173**
- Structurizr Diagrams: **http://localhost:8080/workspace/diagrams**

### Build for Production
```bash
npm run build
npm run preview
```

## User Flows

### Executive Demo Scenario (from SRS)
1. Open **http://localhost:5173/** - See CIAM blueprint card
2. Click **"View Capabilities"** → Browse capability hierarchy
3. Select "Password Login" (003-1-1) → See implementing systems in detail panel
4. Click **"View in C4"** next to "CIAM Backend" → Navigate to Container diagram
5. See CIAM Backend containers (Backend API, UI SDK, etc.)
6. Click **"CIAM Backend"** container → Drill down to Component level
7. See Controllers, Services, Repositories organized by type
8. Use **breadcrumbs** to navigate back up: Component → Container → System Context

### Architect Workflow
1. Start at **C4 System Context** view
2. Click **CIAM Integration Suite** → See all containers
3. Click **CIAM Backend** → View internal components
4. Navigate to **Capabilities** view
5. Browse capability tree to understand business requirements
6. Use **"View in C4"** to map capabilities to technical implementation

### Developer Workflow
1. Browse **Capabilities** to understand business features
2. Expand capability tree to see detailed requirements
3. Click **"View in C4"** on implementing systems
4. Navigate to **Component** level to see technical architecture
5. Use relationships view to understand dependencies

## Features Aligned with SRS Requirements

### FR-001: Blueprint Registry Management ✅
- Blueprint listing on home page
- Metadata display (organization, version, LOBs)

### FR-002: Capability Hierarchy Visualization ✅
- 3-level tree structure
- Expand/collapse functionality
- Code-based organization (cap-{blueprint}-{code})

### FR-003: C4 Diagram Generation and Viewing ✅
- System Context diagram
- Container diagram
- Component diagram
- Visual differentiation by type

### FR-005: Bidirectional Navigation ✅ (Critical MVP Feature)
- Capability → System → C4 view navigation
- Detail panel with "View in C4" buttons
- URL-based deep linking

### FR-006: Context Preservation Across Views ✅
- URL state management
- Selection persistence
- Breadcrumb navigation

### FR-007: Blueprint Filtering and Selection ✅
- Blueprint selector on home page
- URL-based blueprint routing

### FR-010: Deep Linking and URL State Management ✅
- `/blueprints/:blueprintId/capabilities`
- `/blueprints/:blueprintId/c4/:systemId/:containerId`
- Shareable URLs for specific views

### Navigation Quality Requirements (NQ-001 to NQ-008) ✅
- Breadcrumb navigation
- Back button support
- Deep linking
- Loading state feedback
- Responsive design

## Next Steps (Phase 2+)

### Capability Tagging in C4 Elements
- Add `capabilityIds` to systems, containers, and components
- Highlight elements when navigating from capabilities
- Show capability tags in C4 cards

### Search Functionality
- Full-text search across capabilities and systems
- Filter capabilities by LOB or system
- Search C4 elements

### CRUD Operations
- Add/edit/delete capabilities
- Update system mappings
- Validate relationships

### AI Integration
- Claude-powered validation
- Auto-fix suggestions
- Natural language queries

### Reporting
- Generate capability coverage reports
- System dependency analysis
- LOB-based views

## Troubleshooting

### Structurizr Diagrams Not Showing

**Problem:** "View Architecture Diagram" button doesn't work or modal shows loading forever

**Solutions:**
```bash
# Check if Structurizr container is running
docker ps | grep structurizr

# Check if Structurizr is accessible
curl http://localhost:8080

# Restart Structurizr
npm run structurizr:stop
npm run structurizr:start

# Check logs for errors
npm run structurizr:logs

# Regenerate workspace
npm run structurizr:generate
```

### Port Already in Use

**Problem:** `Error: Port 8080 is already in use`

**Solutions:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process (replace PID)
kill -9 <PID>

# Or use a different port in docker-compose.yml
# Change "8080:8080" to "8081:8080" and update STRUCTURIZR_BASE_URL in C4ViewerPage.tsx
```

### Diagrams Not Auto-Updating

**Problem:** Changes to `ciam-systems.json` don't reflect in diagrams

**Solutions:**
```bash
# Ensure file watcher is running
npm run structurizr:watch

# Manually trigger regeneration
npm run structurizr:generate

# Check file watcher logs for errors
```

### Docker Not Found

**Problem:** `docker: command not found`

**Solution:**
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- Start Docker Desktop application
- Verify: `docker --version`

### TypeScript Errors

**Problem:** TypeScript compilation errors with new components

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version

# Build to see detailed errors
npm run build
```

## Data Sources

The application uses JSON files generated from:
1. **example_ciam.dsl** - C4 architecture in Structurizr DSL format
2. **Requirements/capabilities.md** - CIAM capability hierarchy

**Diagram Generation:**
- JSON data (`ciam-systems.json`) is automatically converted to Structurizr DSL
- DSL is stored in `structurizr-workspace/workspace.dsl`
- Structurizr Lite renders the DSL into interactive C4 diagrams

## Architecture Decisions

### Why JSON-based Storage?
- Tool-agnostic design (per SRS requirement)
- Version control friendly
- Easy to generate from various sources (DSL, spreadsheets, etc.)
- Simple data format for MVP

### Why Client-Side Navigation?
- Fast, responsive UI
- No backend required for MVP
- Easy to add backend later
- Supports deep linking and shareable URLs

### Why Component-Based Architecture?
- Reusable UI components
- Easy to test and maintain
- Aligns with React best practices
- Supports future expansion

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Internal use only - Enterprise Architecture Team

---

**Built with** ❤️ **for the Enterprise Architecture Modeling System MVP**
