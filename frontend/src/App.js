import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChannelDataProvider } from './context/ChannelDataContext';
import Landing from './pages/Landing';
import NicheTrendsPage from './pages/NicheTrendsPage';
import ChannelAnalysisPage from './pages/ChannelAnalysisPage';
import DashboardPage from './pages/DashboardPage';
import '@/App.css';

function App() {
  return (
    <ChannelDataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/niche-trends" element={<NicheTrendsPage />} />
          <Route path="/channel-analysis" element={<ChannelAnalysisPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChannelDataProvider>
  );
}

export default App;
