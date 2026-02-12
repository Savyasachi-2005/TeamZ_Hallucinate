import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, BarChart3, Home, Zap } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/niche-trends', label: 'Trends', icon: TrendingUp },
    { path: '/channel-analysis', label: 'Analysis', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_ytcreator-buddy/artifacts/21wabeoa_images__1_-removebg-preview.png" 
              alt="NichePulse" 
              className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Niche<span className="gradient-text">Pulse</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">AI Growth Copilot</p>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/channel-analysis')}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-4 h-4" />
            <span>Analyze Channel</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => {
              // Simple mobile menu - toggle between pages
              const currentIndex = navItems.findIndex(item => item.path === location.pathname);
              const nextIndex = (currentIndex + 1) % navItems.length;
              navigate(navItems[nextIndex].path);
            }}
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
