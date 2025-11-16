import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import capabilitiesDataImport from '../data/ciam-capabilities.json';
import systemsDataImport from '../data/ciam-systems.json';
import type { CapabilityData, Capability, SystemData } from '../types';
import './CapabilitiesPage.css';

const capabilitiesData = capabilitiesDataImport as CapabilityData;
const systemsData = systemsDataImport as SystemData;

export function CapabilitiesPage() {
  const { blueprintId } = useParams();
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleCapabilityClick = (capability: Capability) => {
    setSelectedCapability(capability);
  };

  const handleViewInC4 = (systemId: string) => {
    // Find the system to determine if we need to drill down
    const system = systemsData.systems.find((s) => s.id === systemId);
    if (system && system.containers.length > 0) {
      // Navigate to container view
      navigate(`/blueprints/${blueprintId}/c4/${systemId}`);
    } else {
      // Navigate to system context
      navigate(`/blueprints/${blueprintId}/c4`);
    }
  };

  const getSystemName = (systemId: string): string => {
    const system = systemsData.systems.find((s) => s.id === systemId);
    if (system) return system.name;

    // Check containers
    for (const sys of systemsData.systems) {
      const container = sys.containers.find((c) => c.id === systemId);
      if (container) return container.name;
    }

    return systemId;
  };

  const renderCapabilityTree = (capabilities: Capability[], level: number = 1) => {
    return (
      <div className={`capability-level capability-level-${level}`}>
        {capabilities.map((capability) => {
          const hasChildren = capability.children && capability.children.length > 0;
          const isExpanded = expandedIds.has(capability.id);
          const isSelected = selectedCapability?.id === capability.id;

          return (
            <div key={capability.id} className="capability-item">
              <div
                className={`capability-header level-${level} ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(capability.id);
                  }
                  handleCapabilityClick(capability);
                }}
              >
                {hasChildren && (
                  <span className="expand-icon">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                {!hasChildren && <span className="expand-icon-spacer" />}
                <div className="capability-info">
                  <span className="capability-code">{capability.code}</span>
                  <span className="capability-name">{capability.name}</span>
                </div>
                {capability.systemIds && capability.systemIds.length > 0 && (
                  <span className="system-badge">
                    {capability.systemIds.length} system{capability.systemIds.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {hasChildren && isExpanded && renderCapabilityTree(capability.children!, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="capabilities-page">
      <div className="page-header">
        <h2>Capabilities Hierarchy</h2>
        <p>Browse business capabilities and their implementing systems</p>
      </div>

      <div className="capabilities-layout">
        <div className="capabilities-tree-panel">
          <div className="panel-header">
            <h3>Capability Tree</h3>
            <button
              onClick={() => setExpandedIds(new Set())}
              className="btn-collapse-all"
            >
              Collapse All
            </button>
          </div>
          <div className="tree-container">
            {renderCapabilityTree(capabilitiesData.capabilities)}
          </div>
        </div>

        <div className="capability-detail-panel">
          {selectedCapability ? (
            <div className="capability-detail">
              <div className="detail-header">
                <h3>{selectedCapability.name}</h3>
                <span className={`level-badge level-${selectedCapability.level}`}>
                  Level {selectedCapability.level}
                </span>
              </div>

              <div className="detail-section">
                <label>Code:</label>
                <span className="detail-value">{selectedCapability.code}</span>
              </div>

              {selectedCapability.description && (
                <div className="detail-section">
                  <label>Description:</label>
                  <p className="detail-value">{selectedCapability.description}</p>
                </div>
              )}

              {selectedCapability.systemIds && selectedCapability.systemIds.length > 0 && (
                <div className="detail-section">
                  <label>Implementing Systems:</label>
                  <div className="systems-list">
                    {selectedCapability.systemIds.map((systemId) => (
                      <div key={systemId} className="system-item">
                        <span className="system-name">{getSystemName(systemId)}</span>
                        <button
                          onClick={() => handleViewInC4(systemId)}
                          className="btn-view-c4"
                        >
                          View in C4 →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCapability.children && selectedCapability.children.length > 0 && (
                <div className="detail-section">
                  <label>Sub-capabilities:</label>
                  <div className="subcapabilities-list">
                    {selectedCapability.children.map((child) => (
                      <div key={child.id} className="subcapability-item">
                        <span className="subcap-code">{child.code}</span>
                        <span className="subcap-name">{child.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="detail-placeholder">
              <p>Select a capability to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
