import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, BarChart3, GitCompare, Target, 
  Zap, Shield, Flame, ArrowRight, CheckCircle2, Users,
  Activity, Focus, Trophy, Lightbulb
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const words = ['Trends', 'Growth', 'Success', 'Strategy'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: 'Niche Trends',
      description: 'Discover what\'s trending in your niche with AI-powered momentum detection and strict recency filters',
      gradient: 'from-blue-500 to-emerald-500',
      route: '/niche-trends'
    },
    {
      icon: Shield,
      title: 'Growth Health Dashboard',
      description: 'Track consistency, engagement stability, topic focus, and growth momentum in real-time',
      gradient: 'from-emerald-500 to-blue-500',
      route: '/channel-analysis'
    },
    {
      icon: GitCompare,
      title: 'Competitor Intelligence',
      description: 'Compare your channel against competitors and identify gaps in your strategy',
      gradient: 'from-blue-500 to-pink-500',
      route: '/channel-analysis'
    },
    {
      icon: Flame,
      title: 'Missed Trend Detector',
      description: 'Auto-discover high-momentum topics you haven\'t covered yet',
      gradient: 'from-pink-500 to-orange-500',
      route: '/channel-analysis'
    },
    {
      icon: Sparkles,
      title: 'AI Strategic Copilot',
      description: 'Get personalized growth recommendations powered by advanced AI analysis',
      gradient: 'from-blue-400 to-emerald-400',
      route: '/channel-analysis'
    }
  ];

  const benefits = [
    { icon: TrendingUp, text: 'Predict engagement trends' },
    { icon: Target, text: 'Identify content gaps' },
    { icon: Lightbulb, text: 'Strategic action plans' },
    { icon: BarChart3, text: 'Data-driven decisions' },
    { icon: Activity, text: 'Detect growth instability' },
    { icon: Trophy, text: 'Sustainable growth' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Subtle Professional Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#3B82F6]/5 rounded-full  " />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#10B981]/5 rounded-full  " style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3B82F6]/3 rounded-full  " style={{ animationDelay: '2s' }} />
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0  pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIi8+PC9zdmc+')]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center gap-4 mb-12 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-3xl  opacity-60 group-hover:opacity-80 transition-opacity duration-500 " />
                <div className="relative p-4 rounded-3xl bg-white border border-blue-400/30 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=120&h=120&fit=crop" 
                    alt="NichePulse Logo" 
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Animated Title */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-none">
              <span className="inline-block text-[#0F172A]">
                Niche
              </span>
              <span className="inline-block text-transparent bg-clip-text bg-white
                Pulse
              </span>
            </h1>

            {/* Dynamic Subtitle */}
            <div className="mb-8 h-20 flex items-center justify-center">
              <h2 className="text-3xl md:text-5xl font-black text-[#1E293B]">
                Predict YouTube{' '}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-white  fade-in slide-in-from-bottom-4 duration-500" key={currentWord}>
                    {words[currentWord]}
                  </span>
                </span>
              </h2>
            </div>

            {/* Value Proposition */}
            <p className="text-xl md:text-2xl text-[#334155] font-semibold max-w-3xl mx-auto mb-12 leading-relaxed">
              Your AI-powered copilot for <span className="text-[#10B981] font-bold">sustainable growth</span> in the creator economy.
              Detect trends, analyze competitors, and get strategic insights—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/niche-trends')}
                className="group relative px-10 py-5 bg-white hover:from-blue-500 hover:via-emerald-500 hover:to-blue-500 
                  text-[#0F172A] font-bold rounded-2xl text-lg transition-all duration-300 
                  shadow-2xl  hover: hover:scale-105
                  flex items-center gap-3"
              >
                <Zap className="w-6 h-6" />
                Launch NichePulse
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white/50 hover:bg-white border-2 border-#334155 hover:border-blue-500/50
                  text-[#0F172A] font-bold rounded-2xl text-lg transition-all duration-300 -sm"
              >
                Explore Features
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-[#475569]">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2  fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                  <benefit.icon className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm font-bold">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] mb-6">
                Everything You Need to{' '}
                <span className="text-transparent bg-clip-text bg-white
                  Dominate YouTube
                </span>
              </h2>
              <p className="text-xl text-[#334155] max-w-2xl mx-auto">
                Built for creators who want data-driven insights, not just analytics dashboards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(feature.route)}
                  className="group bg-white/50 -sm border border-[#E2E8F0] hover:border-blue-500/50 rounded-2xl p-8 shadow-md 
                    transition-all duration-500 hover:shadow-2xl hover: hover:-translate-y-2
                     fade-in slide-in-from-bottom-4 text-left cursor-pointer
                    hover:bg-white"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient}  mb-6
                    group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-[#0F172A]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#0F172A] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-emerald-400 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-[#334155] text-base leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-[#3B82F6] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-6 bg-white
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] mb-6">
                How It Works
              </h2>
              <p className="text-xl text-[#334155]">
                From analysis to action in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Analyze Your Channel', desc: 'Enter your YouTube channel URL and get instant insights on growth health metrics', icon: Users, gradient: 'from-blue-500 to-emerald-500' },
                { step: '02', title: 'Discover Opportunities', desc: 'AI identifies missed trends, competitor gaps, and content strategies', icon: Target, gradient: 'from-emerald-500 to-blue-500' },
                { step: '03', title: 'Execute Strategy', desc: 'Follow personalized action plans to accelerate sustainable growth', icon: Zap, gradient: 'from-blue-500 to-blue-500' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="relative bg-white/50 -sm border border-[#E2E8F0] hover:border-blue-500/50 rounded-2xl p-8 shadow-md  fade-in slide-in-from-bottom-4 group transition-all duration-300 hover:-translate-y-2"
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  <div className="text-8xl font-black text-#1E293B/50 absolute top-4 right-4 group-hover:text-blue-500/20 transition-colors">{item.step}</div>
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.gradient}  mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-[#3B82F6]" />
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A] mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-emerald-400 transition-all">{item.title}</h3>
                    <p className="text-[#334155]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border-2 border-blue-500/30 rounded-3xl p-12 text-center -sm shadow-2xl ">
              <h3 className="text-3xl md:text-5xl font-black text-[#0F172A] mb-8">
                Powered by Advanced AI & Real-Time Data
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'Health Metrics', value: '4+', icon: Shield, color: 'purple' },
                  { label: 'AI Insights', value: 'Real-time', icon: Sparkles, color: 'cyan' },
                  { label: 'Data Sources', value: 'YouTube API', icon: BarChart3, color: 'blue' },
                  { label: 'Growth Focus', value: 'Sustainable', icon: TrendingUp, color: 'purple' }
                ].map((stat, idx) => (
                  <div key={idx} className=" fade-in slide-in-from-bottom-4 group" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-500/10 mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                    </div>
                    <div className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-white mb-2`}>{stat.value}</div>
                    <div className="text-[#334155] font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-[#0F172A] mb-6">
              Ready to Transform Your{' '}
              <span className="text-transparent bg-clip-text bg-white
                YouTube Strategy?
              </span>
            </h2>
            <p className="text-xl text-[#334155] mb-10">
              Join creators who make data-driven decisions for sustainable growth
            </p>
            <button
              onClick={() => navigate('/niche-trends')}
              className="group px-12 py-6 bg-white hover:from-blue-500 hover:via-emerald-500 hover:to-blue-500 
                text-[#0F172A] font-bold rounded-2xl text-xl transition-all duration-300 
                shadow-2xl  hover: hover:scale-105
                flex items-center gap-3 mx-auto"
            >
              <Zap className="w-6 h-6" />
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-blue-500/20 py-8 px-6">
          <div className="max-w-6xl mx-auto text-center text-[#475569] text-sm">
            <p className="mb-2">
              Powered by <span className="text-[#3B82F6]">YouTube Data API</span> & <span className="text-[#10B981]">Gemini AI</span>
            </p>
            <p>© 2025 NichePulse. AI Copilot for Sustainable Growth in the Creator Economy.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
