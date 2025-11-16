import { useMemo } from 'react';
import blueprintsData from '../data/blueprints.json';
import capabilitiesData from '../data/ciam-capabilities.json';
import systemsData from '../data/ciam-systems.json';
import type { Blueprint, CapabilityData, SystemData, Capability } from '../types';
import './StatsPanel.css';

const blueprints = blueprintsData as Blueprint[];
const capabilities = capabilitiesData as CapabilityData;
const systems = systemsData as SystemData;

export function StatsPanel() {
  const stats = useMemo(() => {
    // Count total capabilities recursively
    const countCapabilities = (caps: Capability[]): { total: number; level1: number; level2: number; level3: number; implemented: number } => {
      let total = 0;
      let level1 = 0;
      let level2 = 0;
      let level3 = 0;
      let implemented = 0;

      caps.forEach((cap) => {
        total++;
        if (cap.level === 1) level1++;
        if (cap.level === 2) level2++;
        if (cap.level === 3) {
          level3++;
          if (cap.systemIds && cap.systemIds.length > 0) {
            implemented++;
          }
        }
        if (cap.children) {
          const childStats = countCapabilities(cap.children);
          total += childStats.total;
          level1 += childStats.level1;
          level2 += childStats.level2;
          level3 += childStats.level3;
          implemented += childStats.implemented;
        }
      });

      return { total, level1, level2, level3, implemented };
    };

    const capStats = countCapabilities(capabilities.capabilities);

    // Count systems, containers, and components
    let containerCount = 0;
    let componentCount = 0;
    systems.systems.forEach((sys) => {
      containerCount += sys.containers.length;
      sys.containers.forEach((cont) => {
        componentCount += cont.components?.length || 0;
      });
    });

    // Calculate coverage percentage
    const coveragePercentage = capStats.level3 > 0
      ? Math.round((capStats.implemented / capStats.level3) * 100)
      : 0;

    return {
      blueprints: blueprints.length,
      capabilities: capStats,
      systems: systems.systems.length,
      containers: containerCount,
      components: componentCount,
      relationships: systems.relationships.length,
      coveragePercentage,
    };
  }, []);

  return (
    <div className="stats-panel">
      <h3 className="stats-title">Portfolio Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.blueprints}</div>
          <div className="stat-label">Active Blueprints</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.capabilities.total}</div>
          <div className="stat-label">Total Capabilities</div>
          <div className="stat-breakdown">
            L1: {stats.capabilities.level1} • L2: {stats.capabilities.level2} • L3: {stats.capabilities.level3}
          </div>
        </div>

        <div className="stat-card stat-highlight">
          <div className="stat-value">{stats.coveragePercentage}%</div>
          <div className="stat-label">Implementation Coverage</div>
          <div className="stat-breakdown">
            {stats.capabilities.implemented} of {stats.capabilities.level3} capabilities
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.systems}</div>
          <div className="stat-label">Systems</div>
          <div className="stat-breakdown">
            {stats.containers} containers • {stats.components} components
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.relationships}</div>
          <div className="stat-label">System Relationships</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{blueprints[0]?.lobs.length || 0}</div>
          <div className="stat-label">Lines of Business</div>
          <div className="stat-breakdown">
            {blueprints[0]?.lobs.join(' • ')}
          </div>
        </div>
      </div>
    </div>
  );
}
