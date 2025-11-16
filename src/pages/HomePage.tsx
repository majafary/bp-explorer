import { Link } from 'react-router-dom';
import blueprintsData from '../data/blueprints.json';
import type { Blueprint } from '../types';
import './HomePage.css';

const blueprints = blueprintsData as Blueprint[];

export function HomePage() {
  return (
    <div className="home-page">
      <div className="hero">
        <h2>Enterprise Architecture Modeling System</h2>
        <p>Browse blueprints, capabilities, and C4 architecture diagrams</p>
      </div>

      <div className="blueprint-grid">
        {blueprints.map((blueprint) => (
          <div key={blueprint.id} className="blueprint-card">
            <div className="blueprint-header">
              <h3>{blueprint.name}</h3>
              <span className={`status status-${blueprint.status}`}>
                {blueprint.status}
              </span>
            </div>
            <p className="blueprint-description">{blueprint.description}</p>
            <div className="blueprint-meta">
              <div className="meta-item">
                <strong>Organization:</strong> {blueprint.organization}
              </div>
              <div className="meta-item">
                <strong>Version:</strong> {blueprint.version}
              </div>
              <div className="meta-item">
                <strong>Lines of Business:</strong>
                <div className="lob-tags">
                  {blueprint.lobs.map((lob) => (
                    <span key={lob} className="lob-tag">{lob}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="blueprint-actions">
              <Link
                to={`/blueprints/${blueprint.id}/capabilities`}
                className="btn btn-primary"
              >
                View Capabilities
              </Link>
              <Link
                to={`/blueprints/${blueprint.id}/c4`}
                className="btn btn-secondary"
              >
                View C4 Architecture
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
