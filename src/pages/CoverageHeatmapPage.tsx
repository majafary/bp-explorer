import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import capabilitiesDataImport from '../data/ciam-capabilities.json';
import systemsDataImport from '../data/ciam-systems.json';
import type { CapabilityData, Capability, SystemData } from '../types';
import './CoverageHeatmapPage.css';

const capabilitiesData = capabilitiesDataImport as CapabilityData;
const systemsData = systemsDataImport as SystemData;

interface HeatmapCell {
  capabilityId: string;
  capabilityName: string;
  capabilityCode: string;
  systemId: string;
  systemName: string;
  implemented: boolean;
}

export function CoverageHeatmapPage() {
  const { blueprintId: _blueprintId } = useParams();
  const [_selectedLevel, _setSelectedLevel] = useState<number | null>(null);

  // Flatten capabilities to only include Level 3 (actual implementations)
  const flattenCapabilities = (caps: Capability[]): Capability[] => {
    const result: Capability[] = [];
    caps.forEach((cap) => {
      if (cap.level === 3) {
        result.push(cap);
      }
      if (cap.children) {
        result.push(...flattenCapabilities(cap.children));
      }
    });
    return result;
  };

  const level3Capabilities = useMemo(
    () => flattenCapabilities(capabilitiesData.capabilities),
    []
  );

  // Get all system/container IDs and names
  const systemEntities = useMemo(() => {
    const entities: Array<{ id: string; name: string }> = [];

    systemsData.systems.forEach((sys) => {
      if (sys.containers.length === 0) {
        // External system with no containers
        entities.push({ id: sys.id, name: sys.name });
      } else {
        // Add containers
        sys.containers.forEach((cont) => {
          entities.push({ id: cont.id, name: cont.name });
        });
      }
    });

    return entities;
  }, []);

  // Build heatmap data
  const heatmapData = useMemo(() => {
    const cells: HeatmapCell[] = [];

    level3Capabilities.forEach((cap) => {
      systemEntities.forEach((sys) => {
        const implemented = cap.systemIds?.includes(sys.id) || false;
        cells.push({
          capabilityId: cap.id,
          capabilityName: cap.name,
          capabilityCode: cap.code,
          systemId: sys.id,
          systemName: sys.name,
          implemented,
        });
      });
    });

    return cells;
  }, [level3Capabilities, systemEntities]);

  // Calculate coverage statistics
  const stats = useMemo(() => {
    const totalCapabilities = level3Capabilities.length;
    const implementedCapabilities = level3Capabilities.filter(
      (cap) => cap.systemIds && cap.systemIds.length > 0
    ).length;
    const orphanedCapabilities = totalCapabilities - implementedCapabilities;

    const totalCells = heatmapData.length;
    const implementedCells = heatmapData.filter((cell) => cell.implemented).length;
    const coveragePercentage = totalCapabilities > 0
      ? Math.round((implementedCapabilities / totalCapabilities) * 100)
      : 0;

    return {
      totalCapabilities,
      implementedCapabilities,
      orphanedCapabilities,
      totalCells,
      implementedCells,
      coveragePercentage,
    };
  }, [level3Capabilities, heatmapData]);

  return (
    <div className="heatmap-page">
      <div className="page-header">
        <h2>Capability-System Coverage Heatmap</h2>
        <p>Visual mapping of capabilities to implementing systems</p>
      </div>

      <div className="coverage-stats">
        <div className="stat-item">
          <span className="stat-label">Total Capabilities:</span>
          <span className="stat-value">{stats.totalCapabilities}</span>
        </div>
        <div className="stat-item stat-success">
          <span className="stat-label">Implemented:</span>
          <span className="stat-value">{stats.implementedCapabilities}</span>
        </div>
        <div className="stat-item stat-danger">
          <span className="stat-label">Gaps:</span>
          <span className="stat-value">{stats.orphanedCapabilities}</span>
        </div>
        <div className="stat-item stat-highlight">
          <span className="stat-label">Coverage:</span>
          <span className="stat-value">{stats.coveragePercentage}%</span>
        </div>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-legend">
          <div className="legend-item">
            <div className="legend-color implemented"></div>
            <span>Implemented</span>
          </div>
          <div className="legend-item">
            <div className="legend-color not-implemented"></div>
            <span>Not Implemented</span>
          </div>
        </div>

        <div className="heatmap-scroll-container">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="capability-header">Capability</th>
                {systemEntities.map((sys) => (
                  <th key={sys.id} className="system-header">
                    <div className="system-header-content">
                      <span title={sys.name}>{sys.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {level3Capabilities.map((cap) => (
                <tr key={cap.id}>
                  <td className="capability-cell">
                    <span className="capability-code" title={cap.name}>
                      {cap.code}
                    </span>
                    <span className="capability-name-tooltip">{cap.name}</span>
                  </td>
                  {systemEntities.map((sys) => {
                    const isImplemented = cap.systemIds?.includes(sys.id) || false;
                    return (
                      <td
                        key={`${cap.id}-${sys.id}`}
                        className={`heatmap-cell ${isImplemented ? 'implemented' : 'not-implemented'}`}
                        title={`${cap.name} ${isImplemented ? '✓ implemented in' : '✗ not implemented in'} ${sys.name}`}
                      >
                        {isImplemented && <span className="check-mark">✓</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
