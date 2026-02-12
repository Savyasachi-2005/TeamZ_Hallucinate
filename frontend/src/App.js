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
    <div className="min-h-screen bg-gray-950 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
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
        <header className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Niche
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
              Pulse
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI-powered trend intelligence for YouTube creators
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </p>
        </header>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-1.5 mb-10">
            <TabsTrigger
              value="trends"
              data-testid="tab-trends"
              className="rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-300
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 
                data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2 inline" />
              Niche Trends
            </TabsTrigger>
            <TabsTrigger
              value="channel"
              data-testid="tab-channel"
              className="rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-300
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 
                data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25
                data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white"
            >
              <User className="w-4 h-4 mr-2 inline" />
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
