import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, ThumbsUp, MessageSquare, Clock, Target, Award, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight, Activity, BarChart3 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CopilotChat from '@/components/CopilotChat';
import { analyzeChannel } from '@/services/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [channelUrl, setChannelUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const handleAnalyze = async () => {
    if (!channelUrl.trim()) {
      toast.error('Please enter a YouTube channel URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeChannel(channelUrl);
      
      // Transform API response into dashboard data
      const transformed = transformDataForDashboard(response);
      setDashboardData(transformed);
      toast.success('Channel analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze channel');
    } finally {
      setIsLoading(false);
    }
  };

  const transformDataForDashboard = (apiData) => {
    // Calculate growth trend data
    const growthTrend = apiData.top_videos?.slice(0, 10).map((video, index) => ({
      name: `Video ${index + 1}`,
      views: video.views || 0,
      engagement: ((video.likes + video.comments) / video.views * 100).toFixed(2) || 0,
      momentum: video.trend_score || 0,
    })) || [];

    // Theme distribution
    const themeData = apiData.top_themes?.map(theme => ({
      name: theme.theme,
      value: theme.count,
      percentage: theme.percentage,
    })) || [];

    // Health metrics for radar chart
    const healthMetrics = [
      { metric: 'Consistency', value: apiData.health_dashboard?.consistency_score || 0 },
      { metric: 'Engagement', value: apiData.health_dashboard?.engagement_stability || 0 },
      { metric: 'Topic Focus', value: apiData.health_dashboard?.topic_focus_score || 0 },
      { metric: 'Growth', value: Math.min(100, (apiData.health_dashboard?.growth_momentum || 0) * 10) },
      { metric: 'Quality', value: apiData.average_engagement_rate * 1000 || 0 },
    ];

    // Competitor comparison
    const competitorData = apiData.competitor_analysis ? [
      {
        metric: 'Avg Views',
        yours: apiData.average_views || 0,
        competitor: apiData.competitor_analysis.competitor_avg_views || 0,
      },
      {
        metric: 'Engagement',
        yours: apiData.average_engagement_rate * 100 || 0,
        competitor: (apiData.competitor_analysis.competitor_avg_engagement || 0) * 100,
      },
      {
        metric: 'Frequency',
        yours: apiData.posting_frequency?.videos_per_week || 0,
        competitor: apiData.competitor_analysis.competitor_posting_frequency?.videos_per_week || 0,
      },
    ] : [];

    return {
      channelInfo: {
        name: apiData.channel_name,
        url: apiData.channel_url,
        totalVideos: apiData.total_videos,
        avgViews: apiData.average_views,
        avgEngagement: apiData.average_engagement_rate,
      },
      healthDashboard: apiData.health_dashboard,
      growthTrend,
      themeData,
      healthMetrics,
      competitorData,
      missedOpportunities: apiData.missed_opportunities || [],
      strategicRecommendations: apiData.strategic_summary,
    };
  };

  const COLORS = ['#4F46E5', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-b-2 border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6 border-2 border-indigo-100">
              <BarChart3 className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-4">
              Channel <span className="gradient-text">Dashboard</span>
            </h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md border-2 border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <p className="text-base font-semibold text-slate-700">
                Interactive analytics & growth insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Input Section */}
        {!dashboardData && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white border-2 border-slate-200 rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Analyze Your Channel</h2>
              <p className="text-slate-600 mb-6">Enter your YouTube channel URL to get comprehensive analytics</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@YourChannel"
                  className="w-full px-5 py-4 border-2 border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      <span>Analyze Channel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {dashboardData && (
          <div className="space-y-6">
            {/* Channel Info Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-black mb-2">{dashboardData.channelInfo.name}</h2>
                  <p className="text-indigo-100">Total Videos: {dashboardData.channelInfo.totalVideos}</p>
                </div>
                <button
                  onClick={() => setDashboardData(null)}
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Analyze Another Channel
                </button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                icon={Eye}
                label="Avg Views"
                value={formatNumber(dashboardData.channelInfo.avgViews)}
                trend={dashboardData.healthDashboard?.growth_momentum > 0 ? 'up' : 'down'}
                trendValue={`${(dashboardData.healthDashboard?.growth_momentum * 100 || 0).toFixed(1)}%`}
              />
              <MetricCard
                icon={ThumbsUp}
                label="Engagement Rate"
                value={`${(dashboardData.channelInfo.avgEngagement * 100).toFixed(2)}%`}
                trend="up"
                trendValue="Healthy"
              />
              <MetricCard
                icon={Activity}
                label="Consistency Score"
                value={dashboardData.healthDashboard?.consistency_score.toFixed(0) || 'N/A'}
                trend="neutral"
                trendValue="Out of 100"
              />
              <MetricCard
                icon={Target}
                label="Topic Focus"
                value={dashboardData.healthDashboard?.topic_focus_score.toFixed(0) || 'N/A'}
                trend="neutral"
                trendValue="Out of 100"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Growth Trend Chart */}
              <ChartCard title="Performance Trend" subtitle="Recent videos analysis">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.growthTrend}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="views" stroke="#4F46E5" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Health Radar Chart */}
              <ChartCard title="Health Metrics" subtitle="Overall channel health">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={dashboardData.healthMetrics}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" stroke="#64748b" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                    <Radar name="Score" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} strokeWidth={2} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Theme Distribution */}
              {dashboardData.themeData.length > 0 && (
                <ChartCard title="Content Themes" subtitle="Topic distribution">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.themeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.themeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Competitor Comparison */}
              {dashboardData.competitorData.length > 0 && (
                <ChartCard title="Competitor Comparison" subtitle="You vs Competition">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.competitorData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="metric" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="yours" fill="#4F46E5" name="Your Channel" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="competitor" fill="#3B82F6" name="Competitor" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>

            {/* Missed Opportunities */}
            {dashboardData.missedOpportunities.length > 0 && (
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  Missed Opportunities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.missedOpportunities.slice(0, 6).map((opp, index) => (
                    <div key={index} className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                      <h4 className="font-bold text-slate-900 mb-2">{opp.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{opp.reason}</p>
                      <div className="flex items-center gap-2 text-xs text-orange-700">
                        <TrendingUp className="w-4 h-4" />
                        <span>Momentum: {opp.momentum_score.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Strategic Recommendations */}
            {dashboardData.strategicRecommendations && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  AI Strategic Insights
                </h3>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {dashboardData.strategicRecommendations}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CopilotChat />

      {/* Footer */}
      <footer className="border-t-2 border-slate-200 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-600 text-sm font-medium">
            Powered by <span className="text-indigo-600 font-bold">YouTube Data API</span> & <span className="text-indigo-600 font-bold">Gemini AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, trend, trendValue }) => {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-indigo-50">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        {trend === 'up' && <ArrowUpRight className="w-5 h-5 text-emerald-600" />}
        {trend === 'down' && <ArrowDownRight className="w-5 h-5 text-red-600" />}
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
      <p className="text-sm text-slate-600 font-semibold">{label}</p>
      {trendValue && (
        <p className="text-xs text-slate-500 mt-2">{trendValue}</p>
      )}
    </div>
  );
};

// Chart Card Component
const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-md">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

// Utility function
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

export default Dashboard;
