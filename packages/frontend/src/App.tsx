import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RepoBrowserPage from './pages/RepoBrowserPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* New owner/name based routes */}
        <Route path="/repos/:owner/:name" element={<RepoBrowserPage />} />
        <Route path="/repos/:owner/:name/code" element={<RepoBrowserPage />} />
        <Route path="/repos/:owner/:name/code/*" element={<RepoBrowserPage />} />
      </Routes>
    </div>
  );
}

export default App;
