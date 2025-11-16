#!/usr/bin/env node
/**
 * File Watcher for Automatic DSL Generation
 *
 * Monitors ciam-systems.json for changes and automatically
 * regenerates workspace.dsl for Structurizr Lite
 */

import chokidar from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WATCH_FILE = path.join(__dirname, '../src/data/ciam-systems.json');
const BLUEPRINTS_FILE = path.join(__dirname, '../src/data/blueprints.json');
const GENERATOR_SCRIPT = path.join(__dirname, 'generate-structurizr-dsl.ts');

// ANSI color codes for professional console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// Utility: Formatted timestamp
function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// Utility: Log with color and timestamp
function log(color: string, icon: string, message: string) {
  console.log(`${colors.dim}[${timestamp()}]${colors.reset} ${color}${icon} ${message}${colors.reset}`);
}

// Generate DSL from JSON
function generateDsl() {
  try {
    log(colors.cyan, '🔄', 'Regenerating Structurizr DSL...');

    // Execute the generator script using tsx
    execSync(`npx tsx "${GENERATOR_SCRIPT}"`, {
      stdio: 'inherit',
      cwd: path.dirname(GENERATOR_SCRIPT),
    });

    log(colors.green, '✅', 'DSL regenerated successfully');
    log(colors.dim, '📡', 'Structurizr Lite will auto-reload in ~2 seconds');

  } catch (error) {
    log(colors.red, '❌', 'DSL generation failed');
    if (error instanceof Error) {
      console.error(colors.red, error.message, colors.reset);
    }
  }
}

// Debounce function to prevent rapid regenerations
let regenerateTimer: NodeJS.Timeout | null = null;
function debouncedGenerate() {
  if (regenerateTimer) {
    clearTimeout(regenerateTimer);
  }

  regenerateTimer = setTimeout(() => {
    generateDsl();
  }, 500); // Wait 500ms after last change
}

// Main watcher
function startWatcher() {
  console.log('\n');
  log(colors.bright + colors.blue, '🚀', 'Structurizr DSL Auto-Sync Service');
  console.log(colors.dim + '━'.repeat(60) + colors.reset);
  log(colors.dim, '📂', `Watching: ${path.basename(WATCH_FILE)}`);
  log(colors.dim, '📂', `Watching: ${path.basename(BLUEPRINTS_FILE)}`);
  log(colors.dim, '🎯', `Output: structurizr-workspace/workspace.dsl`);
  console.log(colors.dim + '━'.repeat(60) + colors.reset);

  // Initial generation
  log(colors.yellow, '⚡', 'Running initial DSL generation...');
  generateDsl();

  console.log('\n');
  log(colors.green, '👀', 'Watching for changes (Ctrl+C to stop)...\n');

  // Watch for changes
  const watcher = chokidar.watch([WATCH_FILE, BLUEPRINTS_FILE], {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on('change', (filePath) => {
      log(colors.yellow, '📝', `File changed: ${path.basename(filePath)}`);
      debouncedGenerate();
    })
    .on('error', (error) => {
      log(colors.red, '❌', `Watcher error: ${error.message}`);
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n');
    log(colors.yellow, '👋', 'Shutting down file watcher...');
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    watcher.close();
    process.exit(0);
  });
}

// Run watcher
startWatcher();
