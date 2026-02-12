import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import ChannelAnalysisTab from '@/components/ChannelAnalysisTab';
import CopilotChat from '@/components/CopilotChat';
import { BarChart3, Sparkles } from 'lucide-react';

const ChannelAnalysisPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
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
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6 border border-blue-100">
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-4">
              Channel <span className="gradient-text">Analytics</span>
            </h1>
            
            {/* Description */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-blue-100">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <p className="text-base font-semibold text-slate-700">
                Comprehensive growth intelligence and competitor insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <ChannelAnalysisTab />
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

export default ChannelAnalysisPage;
