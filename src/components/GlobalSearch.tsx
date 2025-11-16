import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import blueprintsData from '../data/blueprints.json';
import ciamCapabilitiesData from '../data/ciam-capabilities.json';
import ciamSystemsData from '../data/ciam-systems.json';
import { hasCapabilitiesData, hasSystemsData } from '../utils/dataAvailability';
import type { Blueprint, Capability, CapabilityData, System, SystemData, SearchResult } from '../types';
import './GlobalSearch.css';

const blueprints = blueprintsData as Blueprint[];
const ciamCapabilities = ciamCapabilitiesData as CapabilityData;
const ciamSystems = ciamSystemsData as SystemData;

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Build search index once on mount
  const searchIndex = useMemo(() => buildSearchIndex(), []);

  // Build comprehensive search index from all available data
  function buildSearchIndex(): SearchResult[] {
    const index: SearchResult[] = [];

    // Index blueprints
    blueprints.forEach((bp) => {
      index.push({
        type: 'blueprint',
        id: bp.id,
        name: bp.name,
        description: bp.description,
        blueprintId: bp.id,
        blueprintName: bp.name,
        routePath: '/',
        metadata: bp.status,
      });
    });

    // Index capabilities for blueprints with data
    blueprints.forEach((bp) => {
      if (hasCapabilitiesData(bp.id)) {
        // For now, only CIAM has capabilities data
        if (bp.id === 'bp-ciam') {
          indexCapabilities(ciamCapabilities.capabilities, bp.id, bp.name, index);
        }
        // Future: Load other blueprint capabilities dynamically
      }
    });

    // Index C4 systems/containers/components for blueprints with data
    blueprints.forEach((bp) => {
      if (hasSystemsData(bp.id)) {
        // For now, only CIAM has systems data
        if (bp.id === 'bp-ciam') {
          indexSystems(ciamSystems.systems, bp.id, bp.name, index);
        }
        // Future: Load other blueprint systems dynamically
      }
    });

    return index;
  }

  // Recursively index capabilities (flattens the hierarchy)
  function indexCapabilities(
    capabilities: Capability[],
    blueprintId: string,
    blueprintName: string,
    index: SearchResult[]
  ) {
    capabilities.forEach((cap) => {
      index.push({
        type: 'capability',
        id: cap.id,
        name: cap.name,
        description: cap.description,
        blueprintId,
        blueprintName,
        routePath: `/blueprints/${blueprintId}/capabilities#${cap.id}`,
        metadata: cap.code, // Show capability code as metadata
      });

      // Recursively index children
      if (cap.children && cap.children.length > 0) {
        indexCapabilities(cap.children, blueprintId, blueprintName, index);
      }
    });
  }

  // Index systems, containers, and components
  function indexSystems(
    systems: System[],
    blueprintId: string,
    blueprintName: string,
    index: SearchResult[]
  ) {
    systems.forEach((system) => {
      // Index system
      index.push({
        type: 'system',
        id: system.id,
        name: system.name,
        description: system.description,
        blueprintId,
        blueprintName,
        routePath: `/blueprints/${blueprintId}/c4`,
        metadata: system.tags.join(', '),
      });

      // Index containers
      system.containers.forEach((container) => {
        index.push({
          type: 'container',
          id: container.id,
          name: container.name,
          description: container.description,
          blueprintId,
          blueprintName,
          routePath: `/blueprints/${blueprintId}/c4/${system.id}`,
          metadata: container.technology,
        });

        // Index components
        if (container.components && container.components.length > 0) {
          container.components.forEach((component) => {
            index.push({
              type: 'component',
              id: component.id,
              name: component.name,
              description: component.description,
              blueprintId,
              blueprintName,
              routePath: `/blueprints/${blueprintId}/c4/${system.id}/${container.id}`,
              metadata: component.technology,
            });
          });
        }
      });
    });
  }

  // Filter results based on query
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(0);
      return;
    }

    const queryLower = query.toLowerCase();
    const filtered = searchIndex
      .filter((item) => {
        // Search in name, description, and metadata
        const nameMatch = item.name.toLowerCase().includes(queryLower);
        const descMatch = item.description?.toLowerCase().includes(queryLower);
        const metaMatch = item.metadata?.toLowerCase().includes(queryLower);
        return nameMatch || descMatch || metaMatch;
      })
      .slice(0, 10); // Limit to 10 results

    setResults(filtered);
    setIsOpen(filtered.length > 0);
    setSelectedIndex(0); // Reset selection when results change
  }, [query, searchIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    navigate(result.routePath);
    setIsOpen(false);
    setQuery('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get type badge label
  const getTypeBadge = (type: string): string => {
    switch (type) {
      case 'blueprint':
        return 'BP';
      case 'capability':
        return 'CAP';
      case 'system':
        return 'SYS';
      case 'container':
        return 'CNT';
      case 'component':
        return 'CMP';
      default:
        return type.toUpperCase().slice(0, 3);
    }
  };

  return (
    <div className="global-search" ref={searchRef}>
      <input
        type="text"
        placeholder="Search blueprints, capabilities, systems..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="global-search-input"
        aria-label="Global search"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="search-results"
      />
      {query && (
        <button
          className="clear-search-btn"
          onClick={() => {
            setQuery('');
            setIsOpen(false);
          }}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      {isOpen && (
        <div id="search-results" className="search-dropdown" role="listbox">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleResultClick(result)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span className={`result-type result-type-${result.type}`}>
                {getTypeBadge(result.type)}
              </span>
              <div className="result-content">
                <div className="result-name">{result.name}</div>
                {result.metadata && (
                  <div className="result-meta">{result.metadata}</div>
                )}
              </div>
              <div className="result-blueprint">{result.blueprintName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
