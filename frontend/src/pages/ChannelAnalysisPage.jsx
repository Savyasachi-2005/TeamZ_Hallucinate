import { useState } from 'react';
import { User, Sparkles } from 'lucide-react';
import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import ChannelAnalysisTab from '@/components/ChannelAnalysisTab';
import CopilotChat from '@/components/CopilotChat';

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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_ytcreator-buddy/artifacts/21wabeoa_images__1_-removebg-preview.png" 
              alt="NichePulse Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none text-slate-900">
            Channel Analysis
          </h1>
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-blue-50 border-2 border-blue-200">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <p className="text-base md:text-lg text-slate-900 font-semibold">
              Get comprehensive insights about your YouTube channel growth
            </p>
          </div>
        </header>

        {/* Channel Analysis Component */}
        <ChannelAnalysisTab />
      </div>

      {/* AI Copilot Chat */}
      <CopilotChat />

      {/* Footer */}
      <footer className="text-center py-8 border-t-2 border-slate-200 mt-20 bg-white">
        <p className="text-slate-700 text-sm font-semibold">
          Powered by <span className="text-blue-600">YouTube Data API</span> & <span className="text-blue-600">Gemini AI</span>
        </p>
      </footer>
    </div>
  );
};

export default ChannelAnalysisPage;
