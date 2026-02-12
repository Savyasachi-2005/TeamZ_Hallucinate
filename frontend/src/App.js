import { useState, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { 
  TrendingUp, Zap, Play, X, Info, BarChart3, ExternalLink, Loader2, 
  User, Users, Video, Calendar, Target, Lightbulb, AlertCircle,
  Youtube, Search, Sparkles, ArrowRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NICHES = ["Coding", "Finance", "Fitness", "Gaming", "Education"];

function App() {
  // Niche Trends State
  const [selectedNiche, setSelectedNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [currentSearchLabel, setCurrentSearchLabel] = useState("");
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Channel Analysis State
  const [channelUrl, setChannelUrl] = useState("");
  const [isChannelLoading, setIsChannelLoading] = useState(false);
  const [channelData, setChannelData] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState("trends");

  // Ref for scrolling to trends
  const trendsResultsRef = useRef(null);

  // ============ NICHE TRENDS FUNCTIONS ============
  
  const fetchTrends = async (customKeywordOverride = null) => {
    const keyword = customKeywordOverride || customNiche.trim();
    const niche = selectedNiche;

    // Validation: prioritize custom keyword > dropdown
    if (!keyword && !niche) {
      toast.error("Please select a niche or enter a custom keyword");
      return;
    }

    // Validate custom keyword length
    if (keyword && keyword.length < 3) {
      toast.error("Custom keyword must be at least 3 characters");
      return;
    }

    setIsLoading(true);
    setTrends([]);
    
    try {
      const payload = keyword 
        ? { custom_keyword: keyword }
        : { niche: niche };
      
      const response = await axios.post(`${API}/trends`, payload);
      setTrends(response.data.top_trends);
      setCurrentSearchLabel(response.data.niche);
      toast.success(`Found ${response.data.top_trends.length} trending videos`);

      // Scroll to results
      setTimeout(() => {
        trendsResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error fetching trends:", error);
      const errorMessage = error.response?.data?.detail?.error || error.response?.data?.detail || "Failed to fetch trends";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Explore trend from channel theme
  const exploreTrendFromTheme = async (theme) => {
    setActiveTab("trends");
    setCustomNiche(theme);
    setSelectedNiche("");
    
    // Wait for tab switch then fetch
    setTimeout(() => {
      fetchTrends(theme);
    }, 100);
  };

  const analyzeVideo = async (video) => {
    setSelectedVideo(video);
    setShowAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisData(null);

    try {
      const response = await axios.post(`${API}/analyse`, {
        video_id: video.video_id,
        niche: currentSearchLabel || selectedNiche || customNiche
      });
      setAnalysisData(response.data);
    } catch (error) {
      console.error("Error analyzing video:", error);
      const errorMessage = error.response?.data?.detail?.error || error.response?.data?.detail || "Failed to analyze video";
      toast.error(errorMessage);
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ============ CHANNEL ANALYSIS FUNCTIONS ============

  const analyzeChannel = async () => {
    if (!channelUrl.trim()) {
      toast.error("Please enter a YouTube channel URL");
      return;
    }

    setIsChannelLoading(true);
    setChannelData(null);

    try {
      const response = await axios.post(`${API}/channel-analyse`, {
        channel_url: channelUrl
      });
      setChannelData(response.data);
      toast.success(`Analyzed ${response.data.channel_info.name}`);
    } catch (error) {
      console.error("Error analyzing channel:", error);
      const errorMessage = error.response?.data?.detail?.error || error.response?.data?.detail || "Failed to analyze channel";
      toast.error(errorMessage);
    } finally {
      setIsChannelLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS ============

  const getTrendScoreClass = (score) => {
    if (score >= 80) return "trend-score-high";
    if (score >= 50) return "trend-score-medium";
    return "trend-score-low";
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatPercentage = (value) => {
    return (value * 100).toFixed(2) + "%";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay"></div>
      
      {/* Hero glow */}
      <div className="hero-glow"></div>
      
      <Toaster theme="dark" position="top-right" />
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Niche Pulse
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered trend intelligence copilot for YouTube creators.
            Discover what's working and why.
          </p>
        </header>

        {/* Mode Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="trends" 
              data-testid="tab-trends"
              className="rounded-lg py-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Niche Trends
            </TabsTrigger>
            <TabsTrigger 
              value="channel"
              data-testid="tab-channel"
              className="rounded-lg py-3 data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all"
            >
              <User className="w-4 h-4 mr-2" />
              Channel Analysis
            </TabsTrigger>
          </TabsList>

          {/* ============ NICHE TRENDS TAB ============ */}
          <TabsContent value="trends" className="mt-8">
            {/* Search Section */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="glass-card p-8">
                <div className="space-y-6">
                  {/* Custom Niche Input */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                      Or type a custom niche
                    </label>
                    <Input
                      data-testid="custom-niche-input"
                      type="text"
                      value={customNiche}
                      onChange={(e) => {
                        setCustomNiche(e.target.value);
                        if (e.target.value.trim()) setSelectedNiche("");
                      }}
                      placeholder="e.g., AI tools for students, Finance for beginners..."
                      className="w-full bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-6 py-4 text-lg h-auto placeholder:text-gray-600"
                      onKeyDown={(e) => e.key === 'Enter' && fetchTrends()}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Custom input takes priority over dropdown selection
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-xs text-gray-500 uppercase">or select preset</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  {/* Dropdown */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                      Select Preset Niche
                    </label>
                    <Select 
                      value={selectedNiche} 
                      onValueChange={(val) => {
                        setSelectedNiche(val);
                        setCustomNiche("");
                      }}
                    >
                      <SelectTrigger 
                        data-testid="niche-selector"
                        className="w-full bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-6 py-4 text-lg h-auto"
                      >
                        <SelectValue placeholder="Choose a niche..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10">
                        {NICHES.map((niche) => (
                          <SelectItem 
                            key={niche} 
                            value={niche}
                            className="text-white hover:bg-white/10 focus:bg-white/10"
                          >
                            {niche}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <button
                    data-testid="fetch-trends-button"
                    onClick={() => fetchTrends()}
                    disabled={isLoading || (!selectedNiche && !customNiche.trim())}
                    className="w-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Scanning Trends...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Fetch Trends</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {trends.length > 0 && (
              <div className="space-y-8" ref={trendsResultsRef}>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  <h2 className="text-3xl font-semibold tracking-tight">
                    Top Trending in <span className="text-cyan-400">{currentSearchLabel}</span>
                  </h2>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trends.map((video, index) => (
                    <div
                      key={video.video_id}
                      data-testid={`video-card-${index}`}
                      onClick={() => analyzeVideo(video)}
                      className={`glass-card cursor-pointer group animate-fade-in-up ${
                        index === 0 ? "md:col-span-2 lg:col-span-2" : ""
                      }`}
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-900/30 to-cyan-900/30">
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                        
                        {/* Rank badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs font-bold">
                          #{index + 1}
                        </div>
                        
                        {/* Trend score */}
                        <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 font-mono text-lg font-bold ${getTrendScoreClass(video.trend_score)}`}>
                          {video.trend_score.toFixed(1)}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {video.title}
                        </h3>
                        
                        <p className="text-gray-400 text-sm mb-4">{video.channel}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono text-gray-500">
                            {formatViews(video.views)} views
                          </span>
                          <span className="text-gray-500">
                            {formatDate(video.published_at)}
                          </span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Click to analyze
                          </span>
                          <a
                            href={video.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-cyan-400 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============ CHANNEL ANALYSIS TAB ============ */}
          <TabsContent value="channel" className="mt-8">
            {/* Channel Input Section */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="glass-card p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                      Paste YouTube Channel URL
                    </label>
                    <div className="relative">
                      <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        data-testid="channel-url-input"
                        type="text"
                        value={channelUrl}
                        onChange={(e) => setChannelUrl(e.target.value)}
                        placeholder="https://youtube.com/@channelname"
                        className="w-full bg-white/5 border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-12 pr-6 py-4 text-lg h-auto placeholder:text-gray-600"
                        onKeyDown={(e) => e.key === 'Enter' && analyzeChannel()}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: @username, /channel/ID, /c/name, /user/name
                    </p>
                  </div>
                  
                  <button
                    data-testid="analyse-channel-button"
                    onClick={analyzeChannel}
                    disabled={isChannelLoading || !channelUrl.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full px-8 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
                  >
                    {isChannelLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing Channel...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Analyse Channel</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Channel Results */}
            {channelData && (
              <div className="space-y-8 animate-fade-in-up" data-testid="channel-results">
                
                {/* Channel Overview Card */}
                <div className="glass-card p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {channelData.channel_info.thumbnail && (
                      <img
                        src={channelData.channel_info.thumbnail}
                        alt={channelData.channel_info.name}
                        className="w-24 h-24 rounded-full border-2 border-purple-500/50"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2" data-testid="channel-name">
                        {channelData.channel_info.name}
                      </h2>
                      <div className="flex flex-wrap gap-6 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-400" />
                          <span className="font-mono" data-testid="subscriber-count">
                            {formatViews(channelData.channel_info.subscribers)} subscribers
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-cyan-400" />
                          <span className="font-mono" data-testid="video-count">
                            {channelData.channel_info.total_videos} videos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Engagement Rate */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Target className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Engagement Rate</span>
                    </div>
                    <p className="text-4xl font-bold font-mono text-cyan-400" data-testid="engagement-rate">
                      {formatPercentage(channelData.analytics.average_engagement_rate)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Avg. across recent videos</p>
                  </div>

                  {/* Upload Frequency */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Upload Frequency</span>
                    </div>
                    <p className="text-4xl font-bold font-mono text-purple-400" data-testid="upload-frequency">
                      {channelData.analytics.upload_frequency_per_month.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Videos per month</p>
                  </div>

                  {/* Top Themes */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-pink-500/20">
                        <Sparkles className="w-5 h-5 text-pink-400" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Top Themes</span>
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid="top-themes">
                      {channelData.analytics.top_themes.map((theme, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm font-mono">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Videos */}
                <div className="glass-card p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <Video className="w-5 h-5 text-cyan-400" />
                    Recent Videos
                  </h3>
                  <div className="space-y-4" data-testid="recent-videos">
                    {channelData.recent_videos.map((video, index) => (
                      <div 
                        key={video.video_id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{video.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span className="font-mono">{formatViews(video.views)} views</span>
                            <span className="font-mono text-cyan-400">{formatPercentage(video.engagement_rate)} engagement</span>
                            <span>{formatDate(video.published_at)}</span>
                          </div>
                        </div>
                        <a
                          href={`https://youtube.com/watch?v=${video.video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="glass-card p-8 bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    AI Strategic Insights
                  </h3>
                  
                  {/* Channel Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" data-testid="ai-summary">
                    <div className="bg-black/30 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Primary Niche</p>
                      <p className="font-mono text-sm">{channelData.ai_analysis.channel_summary.primary_niche}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Content Style</p>
                      <p className="font-mono text-sm">{channelData.ai_analysis.channel_summary.content_style}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Growth Pattern</p>
                      <p className="font-mono text-sm">{channelData.ai_analysis.channel_summary.growth_pattern}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-2">Key Strength</p>
                      <p className="font-mono text-sm">{channelData.ai_analysis.channel_summary.strength}</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 md:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">Area to Improve</p>
                      <p className="font-mono text-sm">{channelData.ai_analysis.channel_summary.weakness}</p>
                    </div>
                  </div>

                  {/* Strategic Recommendations */}
                  <div data-testid="strategic-recommendations">
                    <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4">Strategic Recommendations</p>
                    <div className="space-y-3">
                      {channelData.ai_analysis.strategic_recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-black/30">
                          <div className="p-1 rounded-full bg-yellow-500/20 mt-0.5">
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
          </TabsContent>
        </Tabs>

        {/* Analysis Modal (for Niche Trends) */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="bg-[#0F0F0F] border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                Trend Analysis
              </DialogTitle>
            </DialogHeader>
            
            {isAnalyzing ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-gray-400">Analyzing with AI...</p>
              </div>
            ) : analysisData && selectedVideo ? (
              <div className="space-y-6 mt-4" data-testid="analysis-content">
                {/* Video Info */}
                <div className="glass-card p-4 flex gap-4">
                  <img
                    src={`https://img.youtube.com/vi/${selectedVideo.video_id}/mqdefault.jpg`}
                    alt={selectedVideo.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{selectedVideo.title}</h4>
                    <p className="text-gray-400 text-sm">{selectedVideo.channel}</p>
                    <p className="text-cyan-400 font-mono text-sm mt-1">
                      Score: {selectedVideo.trend_score.toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Why It's Trending
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Hook Style</p>
                      <p className="font-mono text-sm text-gray-300" data-testid="hook-style">
                        {analysisData.analysis.hook_style}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Title Pattern</p>
                      <p className="font-mono text-sm text-gray-300" data-testid="title-pattern">
                        {analysisData.analysis.title_pattern}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Emotional Driver</p>
                      <p className="font-mono text-sm text-gray-300" data-testid="emotional-driver">
                        {analysisData.analysis.emotional_driver}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:col-span-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Why It Works</p>
                      <p className="font-mono text-sm text-gray-300" data-testid="why-it-works">
                        {analysisData.analysis.why_it_works}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creator Angle Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Your Creator Angle
                  </h3>
                  
                  <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-white/10 rounded-xl p-6 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Suggested Title</p>
                      <p className="text-lg font-semibold" data-testid="suggested-title">
                        {analysisData.creator_angle.suggested_title}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Content Direction</p>
                      <p className="text-gray-300" data-testid="content-direction">
                        {analysisData.creator_angle.content_direction}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Hook Example</p>
                      <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-gray-300 italic" data-testid="hook-example">
                        "{analysisData.creator_angle.hook_example}"
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Close button */}
                <button
                  data-testid="modal-close-button"
                  onClick={() => setShowAnalysis(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close Analysis
                </button>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500 text-sm">
        <p>Powered by YouTube Data API & Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
