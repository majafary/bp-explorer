import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CapabilitiesPage } from './pages/CapabilitiesPage';
import { C4ViewerPage } from './pages/C4ViewerPage';
import { Layout } from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blueprints/:blueprintId/capabilities" element={<CapabilitiesPage />} />
          <Route path="/blueprints/:blueprintId/c4" element={<C4ViewerPage />} />
          <Route path="/blueprints/:blueprintId/c4/:systemId" element={<C4ViewerPage />} />
          <Route path="/blueprints/:blueprintId/c4/:systemId/:containerId" element={<C4ViewerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
