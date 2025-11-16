import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import systemsDataImport from '../data/ciam-systems.json';
import type { SystemData, System, Container, Component } from '../types';
import { DiagramModal } from '../components/DiagramModal';
import { DiagramButton } from '../components/DiagramButton';
import { ViewModeToggle, type ViewMode } from '../components/ViewModeToggle';
import './C4ViewerPage.css';

const systemsData = systemsDataImport as SystemData;

// Structurizr configuration
const STRUCTURIZR_BASE_URL = 'http://localhost:8080';

export function C4ViewerPage() {
  const { blueprintId, systemId, containerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightCapability = searchParams.get('highlight');

  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (systemId) {
      const system = systemsData.systems.find((s) => s.id === systemId);
      setSelectedSystem(system || null);

      if (containerId && system) {
        const container = system.containers.find((c) => c.id === containerId);
        setSelectedContainer(container || null);
      } else {
        setSelectedContainer(null);
      }
    } else {
      setSelectedSystem(null);
      setSelectedContainer(null);
    }
  }, [systemId, containerId]);

  const handleSystemClick = (system: System) => {
    navigate(`/blueprints/${blueprintId}/c4/${system.id}`);
  };

  const handleContainerClick = (container: Container) => {
    if (selectedSystem) {
      navigate(`/blueprints/${blueprintId}/c4/${selectedSystem.id}/${container.id}`);
    }
  };

  const handleBackToSystems = () => {
    navigate(`/blueprints/${blueprintId}/c4`);
  };

  const handleBackToContainers = () => {
    if (selectedSystem) {
      navigate(`/blueprints/${blueprintId}/c4/${selectedSystem.id}`);
    }
  };

  // Build Structurizr URL based on current view
  const getStructurizrUrl = (): string => {
    // Start with the base diagrams URL - Structurizr will show the diagram selector
    return `${STRUCTURIZR_BASE_URL}/workspace/diagrams`;
  };

  // Get diagram title based on current view
  const getDiagramTitle = (): string => {
    if (selectedContainer) {
      return `Component Diagram - ${selectedContainer.name}`;
    } else if (selectedSystem) {
      return `Container Diagram - ${selectedSystem.name}`;
    }
    return 'System Context Diagram';
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'diagram') {
      setIsModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setViewMode('cards');
  };

  const renderBreadcrumb = () => {
    return (
      <div className="breadcrumb">
        <button onClick={handleBackToSystems} className="breadcrumb-link">
          System Context
        </button>
        {selectedSystem && (
          <>
            <span className="breadcrumb-separator">/</span>
            <button onClick={handleBackToContainers} className="breadcrumb-link">
              {selectedSystem.name}
            </button>
          </>
        )}
        {selectedContainer && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{selectedContainer.name}</span>
          </>
        )}
      </div>
    );
  };

  const renderSystemContext = () => {
    return (
      <div className="c4-view">
        <div className="view-header">
          <div className="view-header-content">
            <div>
              <h2>System Context Diagram</h2>
              <p>High-level view of all systems and their relationships</p>
            </div>
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>

        <div className="diagram-action-section">
          <DiagramButton
            onClick={() => setIsModalOpen(true)}
            variant="inline"
            label="View Architecture Diagram"
          />
        </div>

        <div className="systems-grid">
          {systemsData.systems.map((system) => (
            <div
              key={system.id}
              className={`system-card ${system.tags.includes('External') ? 'external' : 'internal'}`}
              onClick={() => system.containers.length > 0 && handleSystemClick(system)}
              style={{ cursor: system.containers.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="card-header">
                <h3>{system.name}</h3>
                {system.tags.includes('External') && (
                  <span className="tag tag-external">External</span>
                )}
              </div>
              <p className="card-description">{system.description}</p>
              {system.containers.length > 0 && (
                <div className="card-footer">
                  <span className="container-count">
                    {system.containers.length} container{system.containers.length !== 1 ? 's' : ''}
                  </span>
                  <span className="drill-down-icon">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relationships-section">
          <h3>System Relationships</h3>
          <div className="relationships-list">
            {systemsData.relationships.map((rel, idx) => {
              const source = systemsData.systems.find((s) =>
                s.id === rel.source || s.containers.some((c) => c.id === rel.source)
              );
              const target = systemsData.systems.find((s) =>
                s.id === rel.target || s.containers.some((c) => c.id === rel.target)
              );

              return (
                <div key={idx} className="relationship-item">
                  <span className="rel-source">{source?.name || rel.source}</span>
                  <span className="rel-arrow">→</span>
                  <span className="rel-target">{target?.name || rel.target}</span>
                  <span className="rel-description">{rel.description}</span>
                  {rel.technology && (
                    <span className="rel-technology">{rel.technology}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderContainerView = (system: System) => {
    return (
      <div className="c4-view">
        <div className="view-header">
          <div className="view-header-content">
            <div>
              <h2>Container Diagram: {system.name}</h2>
              <p>Applications and databases within {system.name}</p>
            </div>
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>

        <div className="diagram-action-section">
          <DiagramButton
            onClick={() => setIsModalOpen(true)}
            variant="inline"
            label="View Architecture Diagram"
          />
        </div>

        <div className="containers-grid">
          {system.containers.map((container) => {
            const hasComponents = container.components && container.components.length > 0;
            return (
              <div
                key={container.id}
                className={`container-card ${container.tags.join(' ').toLowerCase()}`}
                onClick={() => hasComponents && handleContainerClick(container)}
                style={{ cursor: hasComponents ? 'pointer' : 'default' }}
              >
                <div className="card-header">
                  <h3>{container.name}</h3>
                  <div className="tags">
                    {container.tags.map((tag) => (
                      <span key={tag} className={`tag tag-${tag.toLowerCase()}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="card-description">{container.description}</p>
                <div className="card-tech">
                  <strong>Technology:</strong> {container.technology}
                </div>
                {hasComponents && (
                  <div className="card-footer">
                    <span className="component-count">
                      {container.components!.length} component{container.components!.length !== 1 ? 's' : ''}
                    </span>
                    <span className="drill-down-icon">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderComponentView = (container: Container) => {
    if (!container.components) return null;

    const componentsByTag = container.components.reduce((acc, comp) => {
      const tag = comp.tags[0] || 'Other';
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(comp);
      return acc;
    }, {} as Record<string, Component[]>);

    return (
      <div className="c4-view">
        <div className="view-header">
          <div className="view-header-content">
            <div>
              <h2>Component Diagram: {container.name}</h2>
              <p>Internal structure and components</p>
            </div>
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>
        </div>

        <div className="diagram-action-section">
          <DiagramButton
            onClick={() => setIsModalOpen(true)}
            variant="inline"
            label="View Architecture Diagram"
          />
        </div>

        {Object.entries(componentsByTag).map(([tag, components]) => (
          <div key={tag} className="component-section">
            <h3 className="section-title">{tag}s</h3>
            <div className="components-grid">
              {components.map((component) => (
                <div
                  key={component.id}
                  className={`component-card ${highlightCapability ? 'highlighted' : ''}`}
                >
                  <div className="card-header">
                    <h4>{component.name}</h4>
                    <span className={`tag tag-${tag.toLowerCase()}`}>{tag}</span>
                  </div>
                  <p className="card-description">{component.description}</p>
                  <div className="card-tech">
                    <strong>Technology:</strong> {component.technology}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="c4-viewer-page">
      {renderBreadcrumb()}
      {!selectedSystem && renderSystemContext()}
      {selectedSystem && !selectedContainer && renderContainerView(selectedSystem)}
      {selectedSystem && selectedContainer && renderComponentView(selectedContainer)}

      <DiagramModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        structurizrUrl={getStructurizrUrl()}
        title={getDiagramTitle()}
      />
    </div>
  );
}
