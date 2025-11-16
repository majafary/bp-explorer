import React from 'react';
import './ViewModeToggle.css';

export type ViewMode = 'cards' | 'diagram';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

/**
 * Professional toggle switch for card/diagram view modes
 * Features: Smooth animations, clear visual feedback, accessibility
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="view-mode-toggle-container">
      <label className="view-mode-toggle-label">VIEW:</label>
      <div
        className={`view-mode-toggle ${disabled ? 'disabled' : ''}`}
        role="group"
        aria-label="View mode selection"
      >
        <button
          onClick={() => onChange('cards')}
          className={`view-mode-option ${mode === 'cards' ? 'active' : ''}`}
          aria-pressed={mode === 'cards'}
          disabled={disabled}
          title="Card Grid View"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Grid Icon */}
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Cards</span>
        </button>

        <button
          onClick={() => onChange('diagram')}
          className={`view-mode-option ${mode === 'diagram' ? 'active' : ''}`}
          aria-pressed={mode === 'diagram'}
          disabled={disabled}
          title="Architecture Diagram View"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Diagram Icon with connections */}
            <rect x="2" y="4" width="6" height="6" />
            <rect x="16" y="4" width="6" height="6" />
            <rect x="9" y="14" width="6" height="6" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="12" y1="10" x2="12" y2="14" />
          </svg>
          <span>Diagram</span>
        </button>

        <div
          className="view-mode-slider"
          style={{
            transform: `translateX(${mode === 'diagram' ? '100%' : '0'})`,
          }}
        />
      </div>
    </div>
  );
};
