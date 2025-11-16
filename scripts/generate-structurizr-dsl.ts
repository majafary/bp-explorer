#!/usr/bin/env node
/**
 * JSON to Structurizr DSL Converter
 *
 * Automatically generates workspace.dsl from ciam-systems.json
 * Maintains C4 model hierarchy and relationships
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const DATA_DIR = path.join(__dirname, '../src/data');
const JSON_FILE = path.join(DATA_DIR, 'ciam-systems.json');
const BLUEPRINTS_FILE = path.join(DATA_DIR, 'blueprints.json');
const OUTPUT_DIR = path.join(__dirname, '../../structurizr-workspace');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'workspace.dsl');

// Type definitions
interface Component {
  id: string;
  type: string;
  name: string;
  description: string;
  technology?: string;
  tags?: string[];
}

interface Container {
  id: string;
  type: string;
  name: string;
  description: string;
  technology?: string;
  tags?: string[];
  components?: Component[];
}

interface System {
  id: string;
  type: string;
  name: string;
  description: string;
  tags?: string[];
  containers?: Container[];
}

interface Relationship {
  source: string;
  target: string;
  description: string;
  technology?: string;
}

interface C4Model {
  blueprintId: string;
  systems: System[];
  relationships: Relationship[];
}

interface Blueprint {
  id: string;
  name: string;
  description: string;
}

// Utility: Sanitize ID for DSL variable names
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

// Utility: Escape quotes in descriptions
function escapeQuotes(text: string): string {
  return text.replace(/"/g, '\\"');
}

// Utility: Generate tags string
function generateTags(tags?: string[]): string {
  if (!tags || tags.length === 0) return '';
  return `\n                tags ${tags.map(t => `"${t}"`).join(' ')}`;
}

// Generate component DSL
function generateComponent(component: Component, indent: string): string {
  const varName = sanitizeId(component.id);
  const tech = component.technology ? ` "${escapeQuotes(component.technology)}"` : '';
  const tags = generateTags(component.tags);

  return `${indent}${varName} = component "${escapeQuotes(component.name)}" "${escapeQuotes(component.description)}"${tech} {${tags}
${indent}}`;
}

// Generate container DSL
function generateContainer(container: Container, indent: string): string {
  const varName = sanitizeId(container.id);
  const tech = container.technology ? ` "${escapeQuotes(container.technology)}"` : '';
  const tags = generateTags(container.tags);

  let dsl = `${indent}${varName} = container "${escapeQuotes(container.name)}" "${escapeQuotes(container.description)}"${tech} {${tags}\n`;

  // Add components if present
  if (container.components && container.components.length > 0) {
    dsl += '\n';
    container.components.forEach(component => {
      dsl += generateComponent(component, indent + '            ') + '\n\n';
    });
  }

  dsl += `${indent}}`;
  return dsl;
}

// Generate system DSL
function generateSystem(system: System, indent: string): string {
  const varName = sanitizeId(system.id);
  const tags = generateTags(system.tags);

  let dsl = `${indent}${varName} = softwareSystem "${escapeQuotes(system.name)}" "${escapeQuotes(system.description)}" {${tags}\n`;

  // Add containers if present
  if (system.containers && system.containers.length > 0) {
    dsl += '\n';
    system.containers.forEach(container => {
      dsl += generateContainer(container, indent + '        ') + '\n\n';
    });
  }

  dsl += `${indent}}`;
  return dsl;
}

// Generate relationships DSL
function generateRelationships(relationships: Relationship[], indent: string): string {
  if (relationships.length === 0) return '';

  let dsl = '\n';
  relationships.forEach(rel => {
    const source = sanitizeId(rel.source);
    const target = sanitizeId(rel.target);
    const tech = rel.technology ? ` "${escapeQuotes(rel.technology)}"` : '';
    dsl += `${indent}${source} -> ${target} "${escapeQuotes(rel.description)}"${tech}\n`;
  });

  return dsl;
}

// Generate views DSL
function generateViews(model: C4Model, indent: string): string {
  const primarySystem = model.systems.find(s => s.tags?.includes('Internal'));
  if (!primarySystem) {
    console.warn('⚠️  No primary system found with "Internal" tag, using first system');
    return generateDefaultViews(model.systems[0], indent);
  }

  return generateDefaultViews(primarySystem, indent);
}

function generateDefaultViews(primarySystem: System, indent: string): string {
  const sysVarName = sanitizeId(primarySystem.id);
  let dsl = `${indent}# System Context View\n`;
  dsl += `${indent}systemContext ${sysVarName} "SystemContext" {\n`;
  dsl += `${indent}    include *\n`;
  dsl += `${indent}    autoLayout lr\n`;
  dsl += `${indent}    title "[System Context] ${escapeQuotes(primarySystem.name)}"\n`;
  dsl += `${indent}    description "High-level view showing users, the platform, and external systems"\n`;
  dsl += `${indent}}\n\n`;

  // Container View
  dsl += `${indent}# Container View\n`;
  dsl += `${indent}container ${sysVarName} "Containers" {\n`;
  dsl += `${indent}    include *\n`;
  dsl += `${indent}    autoLayout lr\n`;
  dsl += `${indent}    title "[Container] ${escapeQuotes(primarySystem.name)} - Applications and Databases"\n`;
  dsl += `${indent}    description "Shows the applications, databases, and their interactions"\n`;
  dsl += `${indent}}\n\n`;

  // Component Views (for each container with components)
  if (primarySystem.containers) {
    primarySystem.containers
      .filter(c => c.components && c.components.length > 0)
      .forEach(container => {
        const contVarName = sanitizeId(container.id);
        dsl += `${indent}# Component View - ${container.name}\n`;
        dsl += `${indent}component ${contVarName} "${contVarName}Components" {\n`;
        dsl += `${indent}    include *\n`;
        dsl += `${indent}    autoLayout tb\n`;
        dsl += `${indent}    title "[Component] ${escapeQuotes(container.name)} - Internal Structure"\n`;
        dsl += `${indent}    description "${escapeQuotes(container.description)}"\n`;
        dsl += `${indent}}\n\n`;
      });
  }

  return dsl;
}

// Generate styles DSL
function generateStyles(indent: string): string {
  return `${indent}styles {
${indent}    # Element Styles
${indent}    element "Person" {
${indent}        shape Person
${indent}        background #08427B
${indent}        color #ffffff
${indent}    }

${indent}    element "Software System" {
${indent}        background #1168BD
${indent}        color #ffffff
${indent}    }

${indent}    element "External" {
${indent}        background #999999
${indent}        color #ffffff
${indent}    }

${indent}    element "Container" {
${indent}        background #438DD5
${indent}        color #ffffff
${indent}    }

${indent}    element "Backend" {
${indent}        shape RoundedBox
${indent}        background #438DD5
${indent}        color #ffffff
${indent}    }

${indent}    element "Frontend" {
${indent}        shape WebBrowser
${indent}        background #85BBF0
${indent}        color #000000
${indent}    }

${indent}    element "Library" {
${indent}        shape Component
${indent}        background #85BBF0
${indent}        color #000000
${indent}    }

${indent}    element "Database" {
${indent}        shape Cylinder
${indent}        background #438DD5
${indent}        color #ffffff
${indent}    }

${indent}    element "Component" {
${indent}        background #85BBF0
${indent}        color #000000
${indent}    }

${indent}    element "Controller" {
${indent}        background #5A9FD4
${indent}        color #ffffff
${indent}    }

${indent}    element "Service" {
${indent}        background #7CAFDD
${indent}        color #000000
${indent}    }

${indent}    element "Repository" {
${indent}        background #A1C5E7
${indent}        color #000000
${indent}    }

${indent}    element "Middleware" {
${indent}        background #CCDBEF
${indent}        color #000000
${indent}    }

${indent}    element "Context" {
${indent}        background #D4A5A5
${indent}        color #000000
${indent}    }

${indent}    element "Hook" {
${indent}        background #A8D8EA
${indent}        color #000000
${indent}    }

${indent}    element "WebApp" {
${indent}        shape WebBrowser
${indent}        background #85BBF0
${indent}        color #000000
${indent}    }

${indent}    # Relationship Styles
${indent}    relationship "Relationship" {
${indent}        thickness 2
${indent}        color #707070
${indent}        style solid
${indent}    }

${indent}    relationship "Reads from and writes to" {
${indent}        thickness 4
${indent}    }

${indent}    relationship "Makes API calls" {
${indent}        style dashed
${indent}    }
${indent}}

${indent}theme default`;
}

// Main conversion function
function convertJsonToDsl(): string {
  // Read JSON files
  const modelJson: C4Model = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  const blueprintsJson: Blueprint[] = JSON.parse(fs.readFileSync(BLUEPRINTS_FILE, 'utf-8'));

  // Find blueprint details
  const blueprint: Blueprint | undefined = blueprintsJson.find(
    (b: Blueprint) => b.id === modelJson.blueprintId
  );

  if (!blueprint) {
    throw new Error(`Blueprint ${modelJson.blueprintId} not found in blueprints.json`);
  }

  // Start building DSL
  let dsl = `workspace "${escapeQuotes(blueprint.name)}" "${escapeQuotes(blueprint.description)}" {\n\n`;
  dsl += `    model {\n`;

  // Generate systems
  dsl += `        # ============================================\n`;
  dsl += `        # SOFTWARE SYSTEMS\n`;
  dsl += `        # ============================================\n`;
  modelJson.systems.forEach(system => {
    dsl += generateSystem(system, '        ') + '\n\n';
  });

  // Generate relationships
  dsl += `        # ============================================\n`;
  dsl += `        # RELATIONSHIPS\n`;
  dsl += `        # ============================================\n`;
  dsl += generateRelationships(modelJson.relationships, '        ');

  dsl += `    }\n\n`;

  // Generate views
  dsl += `    views {\n`;
  dsl += generateViews(modelJson, '        ');
  dsl += `\n`;
  dsl += generateStyles('        ');
  dsl += `\n    }\n\n`;

  // Configuration (removed - scope causes validation issues with multiple systems)
  dsl += `}\n`;

  return dsl;
}

// Main execution
function main() {
  console.log('🔄 JSON to Structurizr DSL Converter');
  console.log('=====================================\n');

  try {
    // Check if input files exist
    if (!fs.existsSync(JSON_FILE)) {
      throw new Error(`Input file not found: ${JSON_FILE}`);
    }
    if (!fs.existsSync(BLUEPRINTS_FILE)) {
      throw new Error(`Blueprints file not found: ${BLUEPRINTS_FILE}`);
    }

    console.log(`📖 Reading: ${path.basename(JSON_FILE)}`);
    console.log(`📖 Reading: ${path.basename(BLUEPRINTS_FILE)}`);

    // Convert JSON to DSL
    const dsl = convertJsonToDsl();

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created: ${OUTPUT_DIR}`);
    }

    // Write DSL file
    fs.writeFileSync(OUTPUT_FILE, dsl, 'utf-8');

    console.log(`\n✅ Success!`);
    console.log(`📝 Generated: ${OUTPUT_FILE}`);
    console.log(`📊 File size: ${(dsl.length / 1024).toFixed(2)} KB`);
    console.log(`\n🚀 Structurizr will auto-reload the workspace\n`);

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertJsonToDsl };
