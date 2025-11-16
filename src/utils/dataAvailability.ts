/**
 * Data Availability Utility
 *
 * Tracks which data files exist for each blueprint.
 * This configuration drives UI behavior (button enable/disable state).
 *
 * Architecture Principle: Dumb Client
 * - UI components check this configuration to determine feature availability
 * - Adding new blueprint data = updating this config (no UI code changes)
 * - Buttons auto-enable when data files are added
 */

export interface BlueprintDataAvailability {
  blueprintId: string;
  hasCapabilities: boolean;
  hasSystems: boolean;
}

/**
 * Registry of data file availability per blueprint.
 *
 * Update this when adding new {blueprint}-capabilities.json or {blueprint}-systems.json files.
 * UI will automatically react to changes here.
 */
export const dataAvailabilityRegistry: Record<string, BlueprintDataAvailability> = {
  'bp-ciam': {
    blueprintId: 'bp-ciam',
    hasCapabilities: true,  // ciam-capabilities.json exists
    hasSystems: true,        // ciam-systems.json exists
  },
  'bp-api-platform': {
    blueprintId: 'bp-api-platform',
    hasCapabilities: false,  // No data file yet
    hasSystems: false,       // No data file yet
  },
  'bp-c3': {
    blueprintId: 'bp-c3',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-conversational-ai': {
    blueprintId: 'bp-conversational-ai',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-customer-communications': {
    blueprintId: 'bp-customer-communications',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-deposits-fraud': {
    blueprintId: 'bp-deposits-fraud',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-deposits-platform': {
    blueprintId: 'bp-deposits-platform',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-intelligent-automation': {
    blueprintId: 'bp-intelligent-automation',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-money-movement': {
    blueprintId: 'bp-money-movement',
    hasCapabilities: false,
    hasSystems: false,
  },
  'bp-personalization': {
    blueprintId: 'bp-personalization',
    hasCapabilities: false,
    hasSystems: false,
  },
};

/**
 * Check if capabilities data exists for a blueprint
 */
export function hasCapabilitiesData(blueprintId: string): boolean {
  return dataAvailabilityRegistry[blueprintId]?.hasCapabilities ?? false;
}

/**
 * Check if C4 systems data exists for a blueprint
 */
export function hasSystemsData(blueprintId: string): boolean {
  return dataAvailabilityRegistry[blueprintId]?.hasSystems ?? false;
}

/**
 * Get data availability for a blueprint
 */
export function getDataAvailability(blueprintId: string): BlueprintDataAvailability {
  return dataAvailabilityRegistry[blueprintId] ?? {
    blueprintId,
    hasCapabilities: false,
    hasSystems: false,
  };
}

/**
 * Get all blueprints with complete data (both capabilities and systems)
 */
export function getBlueprintsWithCompleteData(): string[] {
  return Object.entries(dataAvailabilityRegistry)
    .filter(([_, availability]) => availability.hasCapabilities && availability.hasSystems)
    .map(([blueprintId]) => blueprintId);
}
