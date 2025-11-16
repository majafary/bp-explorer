import { useState } from 'react';
import blueprintsData from '../data/blueprints.json';
import type { Blueprint } from '../types';
import './FilterBar.css';

const blueprints = blueprintsData as Blueprint[];

interface FilterBarProps {
  blueprintId: string;
  onSearchChange: (searchTerm: string) => void;
  onLobChange: (lob: string | null) => void;
  onLevelChange: (level: number | null) => void;
}

export function FilterBar({ blueprintId, onSearchChange, onLobChange, onLevelChange }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLob, setSelectedLob] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const blueprint = blueprints.find((bp) => bp.id === blueprintId);
  const lobs = blueprint?.lobs || [];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleLobChange = (lob: string | null) => {
    setSelectedLob(lob);
    onLobChange(lob);
  };

  const handleLevelChange = (level: number | null) => {
    setSelectedLevel(level);
    onLevelChange(level);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLob(null);
    setSelectedLevel(null);
    onSearchChange('');
    onLobChange(null);
    onLevelChange(null);
  };

  const hasActiveFilters = searchTerm || selectedLob || selectedLevel;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="search-input" className="filter-label">Search:</label>
        <div className="search-input-wrapper">
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search capabilities by name or code..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Line of Business:</label>
        <div className="lob-filters">
          <button
            className={`filter-btn ${selectedLob === null ? 'active' : ''}`}
            onClick={() => handleLobChange(null)}
          >
            All
          </button>
          {lobs.map((lob) => (
            <button
              key={lob}
              className={`filter-btn ${selectedLob === lob ? 'active' : ''}`}
              onClick={() => handleLobChange(lob)}
            >
              {lob}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Level:</label>
        <div className="level-filters">
          <button
            className={`filter-btn ${selectedLevel === null ? 'active' : ''}`}
            onClick={() => handleLevelChange(null)}
          >
            All
          </button>
          <button
            className={`filter-btn ${selectedLevel === 1 ? 'active' : ''}`}
            onClick={() => handleLevelChange(1)}
          >
            L1
          </button>
          <button
            className={`filter-btn ${selectedLevel === 2 ? 'active' : ''}`}
            onClick={() => handleLevelChange(2)}
          >
            L2
          </button>
          <button
            className={`filter-btn ${selectedLevel === 3 ? 'active' : ''}`}
            onClick={() => handleLevelChange(3)}
          >
            L3
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="clear-all-btn" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
}
