#!/usr/bin/env node
/**
 * Data Model Integrity Validation Script
 *
 * Validates referential integrity, hierarchy structure, and pattern compliance
 * across blueprints, capabilities, and systems data files.
 *
 * Usage: npm run validate-data
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');

// Load JSON file with error handling
function loadJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    process.exit(1);
  }
}

// Validation state
const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

// Main validation function
function validateDataModel() {
  console.log('🔍 Validating Enterprise Architecture Data Model...\n');

  // Load all data files
  const blueprints = loadJSON('blueprints.json');
  const capabilities = loadJSON('ciam-capabilities.json');
  const systems = loadJSON('ciam-systems.json');

  // Extract all valid IDs for reference checking
  const blueprintIds = new Set(blueprints.map(bp => bp.id));
  const systemIds = new Set();

  systems.systems.forEach(sys => {
    systemIds.add(sys.id);
    (sys.containers || []).forEach(cont => systemIds.add(cont.id));
  });

  // Validate capabilities blueprintId
  validateBlueprintReference(capabilities, blueprintIds);

  // Validate capability structure and references
  let capabilityCount = {level1: 0, level2: 0, level3: 0, total: 0};
  capabilities.capabilities.forEach(cap => {
    validateCapability(cap, 1, '', systemIds, capabilityCount);
  });

  // Validate system relationships
  validateSystemRelationships(systems, systemIds);

  // Report results
  printResults(blueprints, capabilities, systems, systemIds, capabilityCount);

  return errors.length === 0;
}

// Validate blueprintId reference
function validateBlueprintReference(capabilities, blueprintIds) {
  if (!blueprintIds.has(capabilities.blueprintId)) {
    addError(`Invalid blueprintId in capabilities.json: "${capabilities.blueprintId}"`);
  }
}

// Validate capability structure and hierarchy
function validateCapability(cap, expectedLevel, parentCode, systemIds, count) {
  count.total++;
  count[`level${expectedLevel}`]++;

  // Validate required fields
  if (!cap.id) addError(`Capability missing id field`);
  if (!cap.code) addError(`Capability ${cap.id || 'unknown'} missing code field`);
  if (!cap.name) addError(`Capability ${cap.id || 'unknown'} missing name field`);
  if (cap.level === undefined) addError(`Capability ${cap.id} missing level field`);

  // Validate level field matches expected
  if (cap.level !== expectedLevel) {
    addError(`Capability ${cap.id} has level=${cap.level} but expected level=${expectedLevel}`);
  }

  // Validate code matches hierarchy
  if (parentCode && !cap.code.startsWith(parentCode + '-')) {
    addWarning(`Capability ${cap.id} code "${cap.code}" doesn't follow parent pattern "${parentCode}-X"`);
  }

  // Validate ID pattern
  const idPattern = /^cap-[a-z]+-[\d-]+$/;
  if (!idPattern.test(cap.id)) {
    addError(`Capability ${cap.id} doesn't match ID pattern "cap-{blueprint}-{code}"`);
  }

  // Validate level-specific requirements
  if (expectedLevel === 3) {
    // Level 3: Should have systemIds, no children
    if (cap.children && cap.children.length > 0) {
      addError(`Level 3 capability ${cap.id} should not have children`);
    }

    if (!cap.systemIds || cap.systemIds.length === 0) {
      addWarning(`Level 3 capability ${cap.id} has no systemIds (may be incomplete)`);
    }

    // Validate all systemIds exist
    (cap.systemIds || []).forEach(sysId => {
      if (!systemIds.has(sysId)) {
        addError(`Capability ${cap.id} references non-existent system/container: "${sysId}"`);
      }
    });
  } else {
    // Level 1-2: Should have children, no systemIds
    if (cap.systemIds) {
      addError(`Level ${expectedLevel} capability ${cap.id} should not have systemIds (only Level 3)`);
    }

    if (!cap.children || cap.children.length === 0) {
      addWarning(`Level ${expectedLevel} capability ${cap.id} has no children`);
    }
  }

  // Validate children recursively
  if (cap.children && cap.children.length > 0) {
    if (expectedLevel >= 3) {
      addError(`Capability ${cap.id} at level ${expectedLevel} should not have children (max depth is 3)`);
    } else {
      cap.children.forEach(child => {
        validateCapability(child, expectedLevel + 1, cap.code, systemIds, count);
      });
    }
  }
}

// Validate system relationships
function validateSystemRelationships(systems, systemIds) {
  (systems.relationships || []).forEach((rel, idx) => {
    if (!systemIds.has(rel.source)) {
      addError(`Relationship [${idx}] references non-existent source: "${rel.source}"`);
    }
    if (!systemIds.has(rel.target)) {
      addError(`Relationship [${idx}] references non-existent target: "${rel.target}"`);
    }
  });
}

// Print validation results
function printResults(blueprints, capabilities, systems, systemIds, capabilityCount) {
  console.log('═══════════════════════════════════════════');
  console.log('  Data Model Validation Report');
  console.log('═══════════════════════════════════════════\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All validation checks passed!\n');

    console.log('Validated Entities:');
    console.log(`  • Blueprints: ${blueprints.length}`);
    console.log(`  • Capabilities:`);
    console.log(`    - Level 1: ${capabilityCount.level1}`);
    console.log(`    - Level 2: ${capabilityCount.level2}`);
    console.log(`    - Level 3: ${capabilityCount.level3}`);
    console.log(`    - Total: ${capabilityCount.total}`);
    console.log(`  • Systems: ${systems.systems.length}`);
    console.log(`  • System/Container Entities: ${systemIds.size}`);
    console.log(`  • Relationships: ${(systems.relationships || []).length}`);
    console.log('');

    console.log('✅ Data Model Integrity: HEALTHY\n');
    return;
  }

  // Report errors
  if (errors.length > 0) {
    console.log(`🔴 ${errors.length} ERROR(S) FOUND:\n`);
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
    console.log('');
  }

  // Report warnings
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S):\n`);
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn}`);
    });
    console.log('');
  }

  // Summary
  if (errors.length > 0) {
    console.log('❌ Data Model Integrity: FAILED');
    console.log('   Please fix errors before proceeding.\n');
  } else {
    console.log('⚠️  Data Model Integrity: WARNINGS PRESENT');
    console.log('   Review warnings for potential issues.\n');
  }
}

// Run validation
const success = validateDataModel();
process.exit(success ? 0 : 1);
