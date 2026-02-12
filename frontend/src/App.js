import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import NicheTrendsPage from './pages/NicheTrendsPage';
import ChannelAnalysisPage from './pages/ChannelAnalysisPage';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/niche-trends" element={<NicheTrendsPage />} />
        <Route path="/channel-analysis" element={<ChannelAnalysisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
