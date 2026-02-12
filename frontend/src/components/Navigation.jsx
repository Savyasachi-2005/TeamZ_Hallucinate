import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home, User, Sparkles } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-white border-2 border-slate-200 shadow-md">
              <img 
                src="https://customer-assets.emergentagent.com/job_ytcreator-buddy/artifacts/21wabeoa_images__1_-removebg-preview.png" 
                alt="NichePulse" 
                className="w-10 h-10 rounded-lg object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Niche<span className="text-blue-600">Pulse</span>
              </h1>
              <p className="text-xs text-slate-600 font-bold">AI Copilot</p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg text-slate-700 font-bold hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/niche-trends')}
              className="px-4 py-2 rounded-lg text-slate-700 font-bold hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Niche Trends</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="px-4 py-2 rounded-lg text-slate-700 font-bold hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Channel Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
