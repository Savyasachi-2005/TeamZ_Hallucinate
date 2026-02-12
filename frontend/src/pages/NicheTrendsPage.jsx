import { useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Toaster } from 'sonner';
import Navigation from '@/components/Navigation';
import NicheTrendsTab from '@/components/NicheTrendsTab';

const NicheTrendsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIi8+PC9zdmc+')]" />

      <Navigation />

      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #7c3aed',
            color: '#fff',
          },
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-purple-500/30 shadow-xl shadow-purple-500/20">
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 animate-gradient-x">
              Niche Trends
            </span>
          </h1>
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <p className="text-base md:text-lg text-gray-300 font-medium">
              Discover what's trending in your niche with AI-powered analysis
            </p>
          </div>
        </header>

        {/* Niche Trends Component */}
        <NicheTrendsTab />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-purple-500/20 mt-20">
        <p className="text-gray-500 text-sm">
          Powered by <span className="text-purple-400">YouTube Data API</span> & <span className="text-cyan-400">Gemini AI</span>
        </p>
      </footer>
    </div>
  );
};

export default NicheTrendsPage;
