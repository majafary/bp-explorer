import React, { useEffect, useState, useRef } from 'react';
import './DiagramModal.css';

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  structurizrUrl: string;
  title?: string;
}

/**
 * Professional full-screen modal for embedded Structurizr diagrams
 * Features: Glassmorphism design, smooth animations, accessibility, responsive
 */
export const DiagramModal: React.FC<DiagramModalProps> = ({
  isOpen,
  onClose,
  structurizrUrl,
  title = 'Architecture Diagram',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsLoading(true);
    }, 300); // Match CSS animation duration
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(structurizrUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`diagram-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-modal-title"
    >
      <div
        ref={modalRef}
        className={`diagram-modal ${isClosing ? 'closing' : ''}`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="diagram-modal-header">
          <h2 id="diagram-modal-title" className="diagram-modal-title">
            {title}
          </h2>
          <div className="diagram-modal-actions">
            <button
              onClick={handleOpenInNewTab}
              className="diagram-modal-button diagram-modal-button-secondary"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="diagram-modal-button-text">New Tab</span>
            </button>
            <button
              onClick={handleClose}
              className="diagram-modal-button diagram-modal-button-close"
              aria-label="Close diagram"
              title="Close (Esc)"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="diagram-modal-content">
          {isLoading && (
            <div className="diagram-modal-loading">
              <div className="diagram-modal-spinner"></div>
              <p>Loading architecture diagram...</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={structurizrUrl}
            className={`diagram-modal-iframe ${isLoading ? 'loading' : ''}`}
            title="Structurizr Architecture Diagram"
            onLoad={handleIframeLoad}
            allow="fullscreen"
          />
        </div>

        {/* Footer */}
        <div className="diagram-modal-footer">
          <div className="diagram-modal-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Use Structurizr controls to zoom, pan, and navigate views</span>
          </div>
        </div>
      </div>
    </div>
  );
};
