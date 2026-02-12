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
      route: '/niche-trends'
    },
    {
      icon: Shield,
      title: 'Growth Health Dashboard',
      description: 'Track consistency, engagement stability, topic focus, and growth momentum in real-time',
      route: '/channel-analysis'
    },
    {
      icon: GitCompare,
      title: 'Competitor Intelligence',
      description: 'Compare your channel against competitors and identify gaps in your strategy',
      route: '/channel-analysis'
    },
    {
      icon: Flame,
      title: 'Missed Trend Detector',
      description: 'Auto-discover high-momentum topics you haven\'t covered yet',
      route: '/channel-analysis'
    },
    {
      icon: Sparkles,
      title: 'AI Strategic Copilot',
      description: 'Get personalized growth recommendations powered by advanced AI analysis',
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

  const steps = [
    { step: '01', icon: TrendingUp, title: 'Analyze Your Niche', desc: 'Get instant insights on trending topics' },
    { step: '02', icon: BarChart3, title: 'Track Your Health', desc: 'Monitor growth metrics and patterns' },
    { step: '03', icon: Sparkles, title: 'Take Strategic Action', desc: 'Implement AI-powered recommendations' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center gap-4 mb-12">
              <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=120&h=120&fit=crop" 
                  alt="NichePulse Logo" 
                  className="w-20 h-20 rounded-xl object-cover"
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-none">
              <span className="inline-block text-slate-900">
                Niche
              </span>
              <span className="inline-block text-blue-600">
                Pulse
              </span>
            </h1>

            {/* Dynamic Subtitle */}
            <div className="mb-8 h-20 flex items-center justify-center">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                Predict YouTube{' '}
                <span className="text-blue-600">
                  {words[currentWord]}
                </span>
              </h2>
            </div>

            {/* Value Proposition */}
            <p className="text-xl md:text-2xl text-slate-700 font-semibold max-w-3xl mx-auto mb-12 leading-relaxed">
              Your AI-powered copilot for <span className="text-blue-600 font-bold">sustainable growth</span> in the creator economy.
              Detect trends, analyze competitors, and get strategic insights—all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => navigate('/niche-trends')}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-colors shadow-md flex items-center gap-3"
              >
                <Zap className="w-6 h-6" />
                Launch NichePulse
                <ArrowRight className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 font-bold rounded-xl text-lg transition-colors shadow-sm"
              >
                Explore Features
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-8 text-slate-700">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-semibold">
                  <benefit.icon className="w-5 h-5 text-blue-600" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
                Everything You Need to <span className="text-blue-600">Dominate YouTube</span>
              </h2>
              <p className="text-xl text-slate-700 max-w-2xl mx-auto">
                Built for creators who want data-driven insights, not just analytics dashboards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(feature.route)}
                  className="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-xl p-8 shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-blue-600 shadow-md">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-700 text-base leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <span>Try it now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-700">
                From analysis to action in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((item, idx) => (
                <div 
                  key={idx}
                  className="relative bg-white border-2 border-slate-200 rounded-xl p-8 shadow-sm"
                >
                  <div className="text-8xl font-black text-slate-200 absolute top-4 right-4">{item.step}</div>
                  <div className="relative">
                    <div className="inline-flex p-3 rounded-xl bg-blue-600 mb-4 shadow-md">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-700">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              Ready to Transform Your <span className="text-blue-600">YouTube Strategy?</span>
            </h2>
            <p className="text-xl text-slate-700 mb-10">
              Join creators who make data-driven decisions for sustainable growth
            </p>
            <button
              onClick={() => navigate('/niche-trends')}
              className="px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl transition-colors shadow-md flex items-center gap-3 mx-auto"
            >
              <Zap className="w-6 h-6" />
              Get Started Now
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
