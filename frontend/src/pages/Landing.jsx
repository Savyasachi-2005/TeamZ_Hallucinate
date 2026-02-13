import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, BarChart3, GitCompare, Target, 
  Zap, Shield, Flame, ArrowRight, CheckCircle2,
  Activity, Trophy, Lightbulb, Play
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: TrendingUp,
      title: 'Niche Trends',
      description: 'AI-powered momentum detection finds what\'s trending in your niche with strict recency filters',
      color: 'from-indigo-500 to-blue-500',
      route: '/niche-trends'
    },
    {
      icon: Shield,
      title: 'Growth Health Dashboard',
      description: 'Track consistency, engagement stability, and growth momentum in real-time',
      color: 'from-blue-500 to-cyan-500',
      route: '/channel-analysis'
    },
    {
      icon: GitCompare,
      title: 'Competitor Intelligence',
      description: 'Compare against competitors and identify strategic gaps',
      color: 'from-cyan-500 to-teal-500',
      route: '/channel-analysis'
    },
    {
      icon: Flame,
      title: 'Missed Trend Detector',
      description: 'Auto-discover high-momentum topics you haven\'t covered',
      color: 'from-orange-500 to-red-500',
      route: '/channel-analysis'
    },
    {
      icon: Sparkles,
      title: 'AI Strategic Copilot',
      description: 'Get personalized growth recommendations from advanced AI',
      color: 'from-purple-500 to-pink-500',
      route: '/channel-analysis'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Videos Analyzed' },
    { value: '500+', label: 'Creators Helped' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'AI Monitoring' }
  ];

  const benefits = [
    'Predict engagement trends',
    'Identify content gaps',
    'Data-driven decisions',
    'Sustainable growth'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pt-20">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-900">AI-Powered Creator Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-tight">
                Stop Guessing.
                <span className="gradient-text"> Start Growing Smarter.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                Turn data into growth. AI-powered insights for creators who want sustainable success, not just viral moments.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/niche-trends')}
                  className="btn-primary flex items-center justify-center gap-2 relative overflow-hidden"
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget;
                    const particles = btn.querySelectorAll('.magnetize-particle');
                    particles.forEach(p => p.style.opacity = '1');
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget;
                    const particles = btn.querySelectorAll('.magnetize-particle');
                    particles.forEach(p => p.style.opacity = '0.2');
                  }}
                >
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="magnetize-particle absolute w-1 h-1 rounded-full bg-white/60 pointer-events-none transition-opacity duration-300 opacity-20"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`,
                      }}
                    />
                  ))}
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>Start Analyzing</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
                <button
                  onClick={() => navigate('/channel-analysis')}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Benefits List */}
              <div className="flex flex-wrap gap-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative animate-fade-in">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-float">
                {/* Mini Dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900">Growth Analytics</h3>
                      <p className="text-sm text-slate-500">Real-time insights</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                      Live
                    </div>
                  </div>

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="text-2xl font-black gradient-text mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-600 font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Trend Chart Visualization */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-900">Trend Score</span>
                      <span className="text-xs font-bold text-indigo-600">+24%</span>
                    </div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 55, 45, 70, 65, 85, 75, 90].map((height, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-900">AI Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Everything You Need to <span className="gradient-text">Dominate</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional creator intelligence tools designed for sustainable growth
            </p>
          </div>

          {/* Feature Cards Grid with Glowing Effect */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(0, 3).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="relative">
                  <div className="relative h-full rounded-2xl border-2 border-slate-200 p-2 transition-all duration-300">
                    <GlowingEffect
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={3}
                    />
                    <button
                      onClick={() => navigate(feature.route)}
                      onMouseEnter={() => setActiveFeature(idx)}
                      className="relative w-full h-full bg-white rounded-xl p-8 text-left transition-all duration-300 hover:shadow-md"
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Last 2 Feature Cards - Centered */}
          <div className="flex justify-center gap-6 mt-6">
            {features.slice(3).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx + 3} className="relative w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <div className="relative h-full rounded-2xl border-2 border-slate-200 p-2 transition-all duration-300">
                    <GlowingEffect
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={3}
                    />
                    <button
                      onClick={() => navigate(feature.route)}
                      onMouseEnter={() => setActiveFeature(idx + 3)}
                      className="relative w-full h-full bg-white rounded-xl p-8 text-left transition-all duration-300 hover:shadow-md"
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Section with Mesh Gradient */}
      <section className="relative py-20 overflow-hidden">
        {/* Dynamic Mesh Background */}
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Ready to Transform Your Strategy?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join creators making data-driven decisions for sustainable growth
          </p>
          <button
            onClick={() => navigate('/niche-trends')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
            onMouseEnter={(e) => {
              const btn = e.currentTarget;
              const particles = btn.querySelectorAll('.cta-particle');
              particles.forEach(p => {
                p.style.transform = 'translate(-50%, -50%)';
                p.style.opacity = '1';
              });
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget;
              const particles = btn.querySelectorAll('.cta-particle');
              particles.forEach((p, i) => {
                const angle = (i / 10) * Math.PI * 2;
                const distance = 60;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                p.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                p.style.opacity = '0.3';
              });
            }}
          >
            {[...Array(10)].map((_, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const distance = 60;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              return (
                <div
                  key={i}
                  className="cta-particle absolute w-1.5 h-1.5 rounded-full bg-indigo-600/60 pointer-events-none transition-all duration-500 opacity-30"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                />
              );
            })}
            <span className="relative z-10 flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_growth-intel-2/artifacts/t0qb6cuw_images__1_-removebg-preview.png" 
              alt="NichePulse" 
              className="w-6 h-6"
            />
            <span className="text-lg font-black text-slate-900">
              Niche<span className="text-indigo-600">Pulse</span>
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium">
            Powered by <span className="text-indigo-600 font-bold">YouTube Data API</span> & <span className="text-indigo-600 font-bold">Gemini AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
