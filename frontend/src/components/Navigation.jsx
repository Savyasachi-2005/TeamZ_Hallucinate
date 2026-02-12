import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home, User, Sparkles } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F172A]/90 border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-[#3B82F6]/90 to-[#10B981]/90">
                <img 
                  src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=80&h=80&fit=crop" 
                  alt="NichePulse" 
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="text-[#F8FAFC]">Niche</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#10B981]">Pulse</span>
              </h1>
              <p className="text-xs text-[#64748B]">AI Copilot</p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/niche-trends')}
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/30 border border-transparent transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Niche Trends</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#10B981]/10 hover:border-[#10B981]/30 border border-transparent transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">Channel Analysis</span>
            </button>
            <button
              onClick={() => navigate('/channel-analysis')}
              className="ml-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:from-[#3B82F6]/90 hover:to-[#10B981]/90 text-[#F8FAFC] font-bold transition-all shadow-lg shadow-[#3B82F6]/25 flex items-center gap-2"
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
