import { useState, useRef } from 'react';
import { 
  Youtube, Search, Users, Video, Target, Calendar, 
  Sparkles, Lightbulb, Zap, ExternalLink, ArrowRight, TrendingUp,
  Activity, BarChart3, Focus, AlertTriangle, CheckCircle2, XCircle,
  GitCompare, Trophy, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { analyzeChannel, fetchTrends } from '@/services/api';
import LoadingSpinner from './LoadingSpinner';
import TrendCard from './TrendCard';
import AnalysisModal from './AnalysisModal';
import { analyzeVideo } from '@/services/api';

const ChannelAnalysisTab = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);
  const [showCompetitorInput, setShowCompetitorInput] = useState(false);
  
  // Theme exploration state
  const [isExploring, setIsExploring] = useState(false);
  const [exploredTrends, setExploredTrends] = useState([]);
  const [exploredTheme, setExploredTheme] = useState('');
  
  // Modal state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  const trendsRef = useRef(null);

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getMomentumIcon = (momentum) => {
    if (momentum === 'Improving') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (momentum === 'Declining') return <AlertTriangle className="w-5 h-5 text-red-400" />;
    return <Activity className="w-5 h-5 text-yellow-400" />;
  };

  const handleAnalyzeChannel = async () => {
    if (!channelUrl.trim()) {
      toast.error('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    setChannelData(null);
    setExploredTrends([]);

    try {
      const payload = { channel_url: channelUrl };
      if (competitorUrl.trim()) {
        payload.competitor_url = competitorUrl.trim();
      }
      
      const data = await analyzeChannel(payload.channel_url, payload.competitor_url);
      setChannelData(data);
      toast.success(`Analyzed ${data.channel_info.name}`);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExploreTrend = async (theme) => {
    setIsExploring(true);
    setExploredTheme(theme);

    try {
      const data = await fetchTrends(null, theme);
      setExploredTrends(data.top_trends);
      toast.success(`Found ${data.top_trends.length} trending videos for "${theme}"`);
      
      setTimeout(() => {
        trendsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch trends');
    } finally {
      setIsExploring(false);
    }
  };

  const handleAnalyzeVideo = async (video) => {
    setSelectedVideo(video);
    setShowAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisData(null);

    try {
      const data = await analyzeVideo(video.video_id, exploredTheme);
      setAnalysisData(data);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze video');
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Channel Input Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Channel URL
              </label>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  data-testid="channel-url-input"
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@channelname"
                  className="w-full bg-gray-800 border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-12 pr-5 py-4 text-lg h-auto placeholder:text-gray-500 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeChannel()}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supports: @username, /channel/ID, /c/name, /user/name
              </p>
            </div>

            <button
              data-testid="analyse-channel-button"
              onClick={handleAnalyzeChannel}
              disabled={isLoading || !channelUrl.trim()}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed
                text-white font-bold rounded-xl px-8 py-4 transition-all duration-300 
                shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:shadow-none
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Channel...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Channel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Channel Results */}
      {channelData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="channel-results">
          
          {/* Channel Overview */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {channelData.channel_info.thumbnail && (
                <img
                  src={channelData.channel_info.thumbnail}
                  alt={channelData.channel_info.name}
                  className="w-24 h-24 rounded-full border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                />
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3" data-testid="channel-name">
                  {channelData.channel_info.name}
                </h2>
                <div className="flex flex-wrap gap-6 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-mono text-white" data-testid="subscriber-count">
                      {formatNumber(channelData.channel_info.subscribers)} subscribers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-white" data-testid="video-count">
                      {channelData.channel_info.total_videos} videos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engagement Rate */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Engagement</span>
              </div>
              <p className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400" data-testid="engagement-rate">
                {(channelData.analytics.average_engagement_rate * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Average across videos</p>
            </div>

            {/* Upload Frequency */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Frequency</span>
              </div>
              <p className="text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400" data-testid="upload-frequency">
                {channelData.analytics.upload_frequency_per_month.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Videos per month</p>
            </div>

            {/* Top Themes */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-colors md:row-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30">
                  <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Top Themes</span>
              </div>
              <div className="space-y-2" data-testid="top-themes">
                {channelData.analytics.top_themes.map((theme, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-pink-500/30 transition-colors group"
                  >
                    <span className="font-mono text-sm text-white">{theme}</span>
                    <button
                      data-testid={`explore-theme-${i}`}
                      onClick={() => handleExploreTrend(theme)}
                      disabled={isExploring}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                        hover:from-purple-500/40 hover:to-pink-500/40 border border-purple-500/30 
                        text-purple-300 hover:text-white text-xs font-semibold transition-all
                        opacity-70 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {isExploring && exploredTheme === theme ? (
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Explore
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Videos */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Video className="w-5 h-5 text-cyan-400" />
              Recent Videos
            </h3>
            <div className="space-y-3" data-testid="recent-videos">
              {channelData.recent_videos.map((video) => (
                <div
                  key={video.video_id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-36 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{video.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="font-mono">{formatNumber(video.views)} views</span>
                      <span className="font-mono text-cyan-400">{(video.engagement_rate * 100).toFixed(2)}% engagement</span>
                    </div>
                  </div>
                  <a
                    href={`https://youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strategic Insights */}
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              AI Strategic Insights
            </h3>

            {/* Channel Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" data-testid="ai-summary">
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Primary Niche</p>
                <p className="text-gray-300">{channelData.ai_analysis.channel_summary.primary_niche}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Content Style</p>
                <p className="text-gray-300">{channelData.ai_analysis.channel_summary.content_style}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">Growth Pattern</p>
                <p className="text-gray-300">{channelData.ai_analysis.channel_summary.growth_pattern}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">Key Strength</p>
                <p className="text-gray-300">{channelData.ai_analysis.channel_summary.strength}</p>
              </div>
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Area to Improve</p>
                <p className="text-gray-300">{channelData.ai_analysis.channel_summary.weakness}</p>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div data-testid="strategic-recommendations">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-4">Strategic Recommendations</p>
              <div className="space-y-3">
                {channelData.ai_analysis.strategic_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/60 border border-gray-700">
                    <div className="p-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 mt-0.5">
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explored Trends Section */}
      {exploredTrends.length > 0 && (
        <div ref={trendsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">
              Trends for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">"{exploredTheme}"</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploredTrends.map((video, index) => (
              <TrendCard
                key={video.video_id}
                video={video}
                index={index}
                onClick={() => handleAnalyzeVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        video={selectedVideo}
        analysisData={analysisData}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default ChannelAnalysisTab;
