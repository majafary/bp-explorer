import React from 'react';
import './DiagramButton.css';

interface DiagramButtonProps {
  onClick: () => void;
  variant?: 'floating' | 'inline';
  label?: string;
}

/**
 * Professional diagram button with smooth animations
 * Supports both floating action button (FAB) and inline button styles
 */
export const DiagramButton: React.FC<DiagramButtonProps> = ({
  onClick,
  variant = 'inline',
  label = 'View Architecture Diagram',
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className="diagram-fab"
        aria-label={label}
        title={label}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Architecture/Diagram Icon */}
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <line x1="10" y1="6.5" x2="14" y2="6.5" />
          <line x1="10" y1="17.5" x2="14" y2="17.5" />
        </svg>
        <span className="diagram-fab-label">{label}</span>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="diagram-button-inline">
      <div className="diagram-button-icon">
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
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <line x1="10" y1="6.5" x2="14" y2="6.5" />
          <line x1="10" y1="17.5" x2="14" y2="17.5" />
        </svg>
      </div>
      <div className="diagram-button-content">
        <span className="diagram-button-title">{label}</span>
        <span className="diagram-button-subtitle">
          Professional C4 visualization with zoom & navigation
        </span>
      </div>
      <div className="diagram-button-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
};
