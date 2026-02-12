import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home, User, Sparkles } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=80&h=80&fit=crop" 
                  alt="NichePulse" 
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="text-[#0F172A]">Niche</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#10B981]">Pulse</span>
              </h1>
              <p className="text-xs text-[#475569]">AI Copilot</p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/niche-trends')}
              className="px-4 py-2 rounded-xl text-[#334155] hover:text-[#0F172A] hover:bg-[#3B82F6]/5 hover:border-[#3B82F6]/20 border border-transparent transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Niche Trends</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="px-4 py-2 rounded-xl text-[#334155] hover:text-[#0F172A] hover:bg-[#10B981]/5 hover:border-[#10B981]/20 border border-transparent transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Channel Analysis</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="ml-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#3B82F6]/90 hover:to-[#10B981]/90 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
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
