import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Navigation from '@/components/Navigation';
import CopilotChat from '@/components/CopilotChat';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Input } from '@/components/ui/input';
import { Youtube, Search, LayoutDashboard, Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';
import { analyzeChannel } from '@/services/api';
import { useChannelData } from '@/context/ChannelDataContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { channelData: sharedChannelData, channelUrl: sharedChannelUrl, competitorUrl: sharedCompetitorUrl, saveChannelData } = useChannelData();
  
  const [channelUrl, setChannelUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);

  // Auto-load data from shared context when page loads
  useEffect(() => {
    if (sharedChannelData) {
      setChannelData(sharedChannelData);
      setChannelUrl(sharedChannelUrl || '');
      setCompetitorUrl(sharedCompetitorUrl || '');
    }
  }, [sharedChannelData, sharedChannelUrl, sharedCompetitorUrl]);

  const handleAnalyzeChannel = async () => {
    if (!channelUrl.trim()) {
      toast.error('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    setChannelData(null);

    try {
      const data = await analyzeChannel(channelUrl, competitorUrl.trim() || null);
      setChannelData(data);
      // Save to shared context
      saveChannelData(data, channelUrl, competitorUrl);
      toast.success(`Dashboard loaded for ${data.channel_info.name}`);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (channelUrl.trim()) {
      handleAnalyzeChannel();
    }
  };

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
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6 border border-indigo-100">
              <LayoutDashboard className="w-12 h-12 text-indigo-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-4">
              Analytics <span className="gradient-text">Dashboard</span>
            </h1>
            
            {/* Description */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <p className="text-base font-semibold text-slate-700">
                Interactive charts and visualizations for your channel data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Channel Input Section - Show if no data or collapsed */}
        {!channelData && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    <Youtube className="w-4 h-4 text-red-500" />
                    YouTube Channel URL
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                    <Input
                      data-testid="dashboard-channel-url-input"
                      type="text"
                      value={channelUrl}
                      onChange={(e) => setChannelUrl(e.target.value)}
                      placeholder="https://youtube.com/@channelname"
                      className="w-full bg-white border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-5 py-4 text-lg h-auto placeholder:text-slate-500 text-slate-900"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeChannel()}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Supports: @username, /channel/ID, /c/name, /user/name
                  </p>
                </div>

                {/* Competitor Toggle */}
                <div>
                  <button
                    onClick={() => setShowCompetitorInput(!showCompetitorInput)}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 transition-colors font-medium"
                  >
                    {showCompetitorInput ? '− Hide' : '+ Add'} Competitor Comparison
                  </button>
                  
                  {showCompetitorInput && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                        Competitor Channel URL (Optional)
                      </label>
                      <div className="relative">
                        <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <Input
                          type="text"
                          value={competitorUrl}
                          onChange={(e) => setCompetitorUrl(e.target.value)}
                          placeholder="https://youtube.com/@competitor"
                          className="w-full bg-white border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-12 pr-5 py-3 h-auto placeholder:text-slate-500 text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  data-testid="dashboard-analyse-button"
                  onClick={handleAnalyzeChannel}
                  disabled={isLoading || !channelUrl.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white 
                    disabled:bg-slate-400 disabled:cursor-not-allowed
                    font-bold rounded-xl px-8 py-4 transition-all duration-300 
                    shadow-lg hover:shadow-xl disabled:shadow-none
                    flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Load Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6" />
            <p className="text-slate-600 text-lg font-medium">Analyzing channel and preparing dashboard...</p>
            <p className="text-slate-500 text-sm mt-2">This may take 15-20 seconds</p>
          </div>
        )}

        {/* Dashboard Content */}
        {channelData && !isLoading && (
          <div className="animate-fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {channelData.channel_info.thumbnail && (
                  <img
                    src={channelData.channel_info.thumbnail}
                    alt={channelData.channel_info.name}
                    className="w-10 h-10 rounded-full border-2 border-indigo-500"
                  />
                )}
                <div>
                  <h3 className="font-bold text-slate-900">{channelData.channel_info.name}</h3>
                  <p className="text-sm text-slate-500">Dashboard Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/channel-analysis')}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Analysis</span>
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setChannelData(null);
                    setChannelUrl('');
                    setCompetitorUrl('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <span>New Channel</span>
                </button>
              </div>
            </div>
            
            <AnalyticsDashboard channelData={channelData} />
          </div>
        )}

        {/* Empty State */}
        {!channelData && !isLoading && (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-slate-100 rounded-full mb-6">
              <LayoutDashboard className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Dashboard Data Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Enter a YouTube channel URL above to generate an interactive analytics dashboard with charts and insights.
            </p>
            <p className="text-sm text-indigo-600 font-medium">
              Or analyze a channel on the <button onClick={() => navigate('/channel-analysis')} className="underline hover:text-indigo-800">Channel Analysis</button> page first
            </p>
          </div>
        )}
      </div>

      {/* AI Copilot */}
      <CopilotChat />

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
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

export default DashboardPage;
