# Enterprise Architecture Viewer - CIAM Blueprint MVP

A modern web application for browsing enterprise architecture blueprints, capabilities hierarchies, and C4 architecture diagrams.

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

#### 4. Bidirectional Navigation (FR-005 - Critical MVP Feature)
- **Capability → C4**: Click capability → See implementing systems → Navigate to C4 diagram
- **C4 → Capability**: Future enhancement (ready for capability tagging)
- **Context Preservation**: Maintains selection state across views
- **Deep Linking**: URLs reflect current view state for sharing

### Technology Stack

- **React 18.2** - Modern React with hooks
- **TypeScript 5.2** - Type safety and developer experience
- **Vite 4.5** - Fast build tool and dev server
- **React Router 6** - Client-side routing with URL state management
- **CSS3** - Modern styling with gradients and animations

## Project Structure

```
ciam-viewer/
├── src/
│   ├── data/                    # JSON data files
│   │   ├── blueprints.json      # Blueprint metadata
│   │   ├── ciam-capabilities.json  # CIAM capabilities hierarchy
│   │   └── ciam-systems.json    # C4 architecture data
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   ├── components/              # Reusable components
│   │   ├── Layout.tsx
│   │   └── Layout.css
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx         # Blueprint selector
│   │   ├── CapabilitiesPage.tsx # Capability browser
│   │   ├── C4ViewerPage.tsx     # C4 diagram viewer
│   │   └── *.css                # Page styles
│   ├── App.tsx                  # Main app with routing
│   └── main.tsx                 # Entry point
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
```bash
cd ciam-viewer
npm install
npm run dev
```

The app will be available at: **http://localhost:5173/**

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

## Data Sources

The application uses JSON files generated from:
1. **example_ciam.dsl** - C4 architecture in Structurizr DSL format
2. **Requirements/capabilities.md** - CIAM capability hierarchy

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
