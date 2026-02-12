import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home, User, Sparkles } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-purple-600/90 to-cyan-600/90">
                <img 
                  src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=80&h=80&fit=crop" 
                  alt="NichePulse" 
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="text-white">Niche</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Pulse</span>
              </h1>
              <p className="text-xs text-gray-400">AI Copilot</p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/niche-trends')}
              className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 border border-transparent transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Niche Trends</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Channel Analysis</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="ml-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
