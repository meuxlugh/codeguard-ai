import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RepoBrowserPage from './pages/RepoBrowserPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/repos/:id" element={<RepoBrowserPage />} />
      </Routes>
    </div>
  );
}

export default App;
