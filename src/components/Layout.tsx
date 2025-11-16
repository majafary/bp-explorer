import { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { blueprintId } = useParams();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Enterprise Architecture Viewer</h1>
          </Link>
          {blueprintId && (
            <nav className="main-nav">
              <Link
                to={`/blueprints/${blueprintId}/capabilities`}
                className="nav-link"
              >
                Capabilities
              </Link>
              <Link
                to={`/blueprints/${blueprintId}/c4`}
                className="nav-link"
              >
                C4 Architecture
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
