import { useState, useRef } from 'react';
import { 
  Youtube, Search, Users, Video, Target, Calendar, 
  Sparkles, Lightbulb, Zap, ExternalLink, ArrowRight, TrendingUp,
  Activity, BarChart3, Focus, AlertTriangle, CheckCircle2, XCircle,
  GitCompare, Trophy, AlertCircle, Shield, Flame
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
      const data = await analyzeChannel(channelUrl, competitorUrl.trim() || null);
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
                  data-testid="channel-url-input"
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://youtube.com/@channelname"
                  className="w-full bg-white border-#334155 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-12 pr-5 py-4 text-lg h-auto placeholder:text-slate-700 text-slate-900"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeChannel()}
                />
              </div>
              <p className="text-xs text-slate-700 mt-2">
                Supports: @username, /channel/ID, /c/name, /user/name
              </p>
            </div>

            {/* Competitor Comparison Toggle */}
            <div>
              <button
                onClick={() => setShowCompetitorInput(!showCompetitorInput)}
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                {showCompetitorInput ? 'Hide' : 'Add'} Competitor Comparison (Optional)
              </button>
              
              {showCompetitorInput && (
                <div className="mt-4 p-4 bg-white/50 rounded-xl border border-#334155">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    <GitCompare className="w-4 h-4 text-blue-500" />
                    Competitor Channel URL
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                    <Input
                      type="text"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      placeholder="https://youtube.com/@competitor"
                      className="w-full bg-white border-#334155 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-12 pr-5 py-3 h-auto placeholder:text-slate-700 text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              data-testid="analyse-channel-button"
              onClick={handleAnalyzeChannel}
              disabled={isLoading || !channelUrl.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                disabled:bg-slate-400 disabled:cursor-not-allowed
                text-slate-900 font-bold rounded-xl px-8 py-4 transition-all duration-300 
                shadow-lg  hover: disabled:shadow-none
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full " />
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
        <div className="space-y-8  fade-in slide-in-from-bottom-4 duration-500" data-testid="channel-results">
          
          {/* Channel Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {channelData.channel_info.thumbnail && (
                <img
                  src={channelData.channel_info.thumbnail}
                  alt={channelData.channel_info.name}
                  className="w-24 h-24 rounded-full border-4 border-emerald-500/50 shadow-lg "
                />
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-3" data-testid="channel-name">
                  {channelData.channel_info.name}
                </h2>
                <div className="flex flex-wrap gap-6 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-slate-900" data-testid="subscriber-count">
                      {formatNumber(channelData.channel_info.subscribers)} subscribers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono text-slate-900" data-testid="video-count">
                      {channelData.channel_info.total_videos} videos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-mono text-slate-900">
                      {(channelData.analytics.average_engagement_rate * 100).toFixed(2)}% avg engagement
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-slate-900">
                      {channelData.analytics.upload_frequency_per_month.toFixed(1)} videos/month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Health Dashboard */}
          {channelData.health_dashboard && (
            <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                Growth Health Dashboard
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Consistency Score */}
                <div className={`p-5 rounded-xl border-2 ${getScoreColor(channelData.health_dashboard.consistency_score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <h4 className="font-bold text-sm uppercase tracking-wide">Consistency</h4>
                  </div>
                  <div className="text-4xl font-black mb-1">
                    {channelData.health_dashboard.consistency_score}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Upload Regularity</div>
                </div>

                {/* Engagement Stability */}
                <div className={`p-5 rounded-xl border-2 ${getScoreColor(channelData.health_dashboard.engagement_stability)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5" />
                    <h4 className="font-bold text-sm uppercase tracking-wide">Stability</h4>
                  </div>
                  <div className="text-4xl font-black mb-1">
                    {channelData.health_dashboard.engagement_stability}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Engagement Variance</div>
                </div>

                {/* Topic Focus */}
                <div className={`p-5 rounded-xl border-2 ${getScoreColor(channelData.health_dashboard.topic_focus_score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Focus className="w-5 h-5" />
                    <h4 className="font-bold text-sm uppercase tracking-wide">Focus</h4>
                  </div>
                  <div className="text-4xl font-black mb-1">
                    {channelData.health_dashboard.topic_focus_score}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Topic Consistency</div>
                </div>

                {/* Growth Momentum */}
                <div className={`p-5 rounded-xl border-2 ${
                  channelData.health_dashboard.growth_momentum === 'Improving' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                  channelData.health_dashboard.growth_momentum === 'Declining' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                  'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getMomentumIcon(channelData.health_dashboard.growth_momentum)}
                    <h4 className="font-bold text-sm uppercase tracking-wide">Momentum</h4>
                  </div>
                  <div className="text-2xl font-black mb-1">
                    {channelData.health_dashboard.growth_momentum}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">Growth Trajectory</div>
                </div>
              </div>
            </div>
          )}

          {/* Strategic Action Summary - PROMINENT PLACEMENT */}
          {channelData.ai_analysis?.strategic_summary && (
            <div className="bg-white border-2 border-blue-500/50 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                AI Strategic Summary
              </h3>
              
              <div className="space-y-6">
                {/* Main Risk */}
                <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Main Risk
                  </h4>
                  <p className="text-#E2E8F0">{channelData.ai_analysis.strategic_summary.main_risk}</p>
                </div>

                {/* Growth Opportunity */}
                <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-xl">
                  <h4 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Growth Opportunity
                  </h4>
                  <p className="text-#E2E8F0">{channelData.ai_analysis.strategic_summary.growth_opportunity}</p>
                </div>

                {/* Action Plan */}
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Recommended Action Plan
                  </h4>
                  <ol className="space-y-2">
                    {channelData.ai_analysis.strategic_summary.recommended_action_plan.map((action, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-slate-900 flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-#E2E8F0">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Missed Trends Panel */}
          {channelData.missed_trends && channelData.missed_trends.length > 0 && (
            <div className="bg-white border-2 border-yellow-500/30 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Flame className="w-6 h-6 text-yellow-400" />
                Missed Trend Opportunities
              </h3>
              <p className="text-slate-700 mb-6">High-momentum topics you haven't covered yet</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelData.missed_trends.map((trend, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900 capitalize">{trend.keyword}</h4>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                        {trend.trend_score}/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{trend.reason}</p>
                    <button
                      onClick={() => handleExploreTrend(trend.keyword)}
                      className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      Explore Trend <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Comparison */}
          {!showDashboard && channelData.competitor_comparison && (
            <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GitCompare className="w-6 h-6 text-blue-400" />
                Competitor Comparison: {channelData.competitor_comparison.competitor_name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Engagement Gap */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-#334155">
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Engagement Gap</h4>
                  <div className="text-3xl font-black text-slate-900 mb-2">
                    {channelData.competitor_comparison.engagement_gap}
                  </div>
                  <p className="text-sm text-slate-700">Competitor's engagement advantage</p>
                </div>

                {/* Posting Frequency */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-#334155">
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Posting Frequency</h4>
                  <div className="text-lg font-bold text-slate-900 mb-2">
                    {channelData.competitor_comparison.posting_gap}
                  </div>
                </div>

                {/* Theme Overlap */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-#334155">
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Content Overlap</h4>
                  <div className="text-3xl font-black text-slate-900 mb-2">
                    {channelData.competitor_comparison.theme_overlap_percentage}%
                  </div>
                  <p className="text-sm text-slate-700">Shared topic coverage</p>
                </div>

                {/* Missed Topics */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-#334155">
                  <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">You're Missing</h4>
                  <div className="flex flex-wrap gap-2">
                    {channelData.competitor_comparison.missed_topics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold capitalize">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Channel Summary */}
          {!showDashboard && channelData.ai_analysis?.channel_summary && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                Channel Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Primary Niche</h4>
                  <p className="text-slate-900 text-lg">{channelData.ai_analysis.channel_summary.primary_niche}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Content Style</h4>
                  <p className="text-slate-900 text-lg">{channelData.ai_analysis.channel_summary.content_style}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Growth Pattern</h4>
                  <p className="text-slate-900 text-lg">{channelData.ai_analysis.channel_summary.growth_pattern}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Key Strength
                  </h4>
                  <p className="text-slate-900 text-lg">{channelData.ai_analysis.channel_summary.strength}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Area to Improve
                  </h4>
                  <p className="text-slate-900 text-lg">{channelData.ai_analysis.channel_summary.weakness}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Themes */}
          {!showDashboard && channelData.analytics.top_themes && channelData.analytics.top_themes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                Top Content Themes
              </h3>
              <div className="flex flex-wrap gap-3">
                {channelData.analytics.top_themes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => handleExploreTrend(theme)}
                    className="theme-chip px-5 py-2 bg-slate-100 hover:bg-blue-50 
                      border border-blue-500/30 hover:border-blue-500/50 rounded-full text-slate-900 font-bold 
                      transition-all duration-200 flex items-center gap-2 capitalize"
                  >
                    {theme}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Videos */}
          {!showDashboard && channelData.recent_videos && channelData.recent_videos.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-emerald-400" />
                Recent Videos (Last 5)
              </h3>
              <div className="space-y-4">
                {channelData.recent_videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-#334155 hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-bold mb-2 line-clamp-2">{video.title}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-green-400" />
                          {(video.engagement_rate * 100).toFixed(2)}% engagement
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-400" />
                          {formatNumber(video.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          {new Date(video.published_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`https://youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner />
          <p className="text-slate-700 mt-6 text-lg">Analyzing channel with AI Copilot...</p>
        </div>
      )}

      {/* Explored Trends Section */}
      {exploredTrends.length > 0 && (
        <div ref={trendsRef} className="space-y-6  fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
              Trending: "{exploredTheme}"
            </h3>
            <button
              onClick={() => setExploredTrends([])}
              className="text-slate-700 hover:text-slate-900 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploredTrends.map((video) => (
              <TrendCard
                key={video.video_id}
                video={video}
                onAnalyze={() => handleAnalyzeVideo(video)}
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
