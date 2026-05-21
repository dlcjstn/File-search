import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import FileSearchTool from './pages/FileSearch/FileSearch';
import TestSearch from './pages/FileSearch/TestSearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<FileSearchTool />} />
          <Route path="/file-search" element={<FileSearchTool />} />
          <Route path="/test" element={<TestSearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
