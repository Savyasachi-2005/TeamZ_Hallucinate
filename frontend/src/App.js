import { useState } from 'react';
import { TrendingUp, User, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from 'sonner';
import NicheTrendsTab from '@/components/NicheTrendsTab';
import ChannelAnalysisTab from '@/components/ChannelAnalysisTab';
import '@/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIi8+PC9zdmc+')]" />

      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#fff',
          },
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-16 pt-8">
          {/* Logo Section */}
          <div className="inline-flex items-center justify-center gap-4 mb-8 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative p-3 rounded-3xl bg-gradient-to-br from-blue-600/90 to-purple-600/90 border border-blue-400/30 shadow-2xl shadow-blue-500/30 transform group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=100&h=100&fit=crop" 
                  alt="NichePulse Logo" 
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-100 drop-shadow-2xl">
              Niche
            </span>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 animate-gradient-x">
              Pulse
            </span>
          </h1>

          {/* Subtitle */}
          <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <p className="text-base md:text-lg text-gray-300 font-medium">
              AI-powered trend intelligence for YouTube creators
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        </header>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 mb-12 shadow-2xl">
            <TabsTrigger
              value="trends"
              data-testid="tab-trends"
              className="rounded-xl py-4 px-8 text-base font-bold transition-all duration-300 relative overflow-hidden
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 
                data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/40
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-gray-800/50"
            >
              <TrendingUp className="w-5 h-5 mr-2 inline" />
              Niche Trends
            </TabsTrigger>
            <TabsTrigger
              value="channel"
              data-testid="tab-channel"
              className="rounded-xl py-4 px-8 text-base font-bold transition-all duration-300 relative overflow-hidden
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 
                data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/40
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-gray-800/50"
            >
              <User className="w-5 h-5 mr-2 inline" />
              Channel Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-0 focus-visible:outline-none">
            <NicheTrendsTab />
          </TabsContent>

          <TabsContent value="channel" className="mt-0 focus-visible:outline-none">
            <ChannelAnalysisTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-800/50">
        <p className="text-gray-500 text-sm">
          Powered by <span className="text-blue-400">YouTube Data API</span> & <span className="text-purple-400">Gemini AI</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
