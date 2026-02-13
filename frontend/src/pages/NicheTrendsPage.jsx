import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import NicheTrendsTab from '@/components/NicheTrendsTab';
import CopilotChat from '@/components/CopilotChat';
import { TrendingUp, Sparkles } from 'lucide-react';

const NicheTrendsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <Navigation />

      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            color: '#0f172a',
          },
        }}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6 border border-indigo-100">
              <TrendingUp className="w-12 h-12 text-indigo-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-4">
              Discover <span className="gradient-text">Trending</span> Content
            </h1>
            
            {/* Description */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <p className="text-base font-semibold text-slate-700">
                AI-powered momentum detection for your niche
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <NicheTrendsTab />
      </div>

      {/* AI Copilot */}
      <CopilotChat />

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-600 text-sm font-medium">
            Powered by <span className="text-indigo-600 font-bold">YouTube Data API</span> & <span className="text-indigo-600 font-bold">Gemini AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NicheTrendsPage;
