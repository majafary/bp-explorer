// Blueprint Types
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  organization: string;
  version: string;
  status: string;
  lobs: string[];
  metadata: {
    created: string;
    updated: string;
    owner: string;
  };
}

// Capability Types
export interface Capability {
  id: string;
  code: string;
  level: 1 | 2 | 3;
  name: string;
  description?: string;
  systemIds?: string[];
  children?: Capability[];
}

export interface CapabilityData {
  blueprintId: string;
  capabilities: Capability[];
}

// C4 Model Types
export interface Component {
  id: string;
  type: 'component';
  name: string;
  description: string;
  technology: string;
  tags: string[];
  capabilityIds?: string[];
}

export interface Container {
  id: string;
  type: 'container';
  name: string;
  description: string;
  technology: string;
  tags: string[];
  components?: Component[];
  capabilityIds?: string[];
}

export interface System {
  id: string;
  type: 'softwareSystem';
  name: string;
  description: string;
  tags: string[];
  containers: Container[];
  capabilityIds?: string[];
}

export interface Relationship {
  source: string;
  target: string;
  description: string;
  technology?: string;
}

export interface SystemData {
  blueprintId: string;
  systems: System[];
  relationships: Relationship[];
}

// View Types
export type C4Level = 'system' | 'container' | 'component';

export interface C4ViewState {
  level: C4Level;
  selectedSystemId?: string;
  selectedContainerId?: string;
  selectedComponentId?: string;
  highlightedCapabilityIds?: string[];
}

export interface NavigationState {
  blueprintId: string;
  view: 'capabilities' | 'c4' | 'home';
  c4ViewState?: C4ViewState;
  selectedCapabilityId?: string;
}

// Search Types
export type SearchResultType = 'blueprint' | 'capability' | 'system' | 'container' | 'component';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  description?: string;
  blueprintId: string;
  blueprintName: string;
  routePath: string;
  metadata?: string; // Additional context (e.g., capability code, technology)
}
