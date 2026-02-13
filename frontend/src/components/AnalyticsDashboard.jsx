import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Activity, Target, Users, Eye, Calendar,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Zap, Award, Flame
} from 'lucide-react';

const COLORS = {
  primary: '#4f46e5',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  slate: '#64748b'
};

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? 
              entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Score gauge component
const ScoreGauge = ({ score, label, color, icon: Icon }) => {
  const gaugeData = [
    { name: 'score', value: score, fill: color },
    { name: 'remaining', value: 100 - score, fill: '#e2e8f0' }
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={12}
            data={gaugeData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#f1f5f9' }}
              dataKey="value"
              cornerRadius={6}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="text-2xl font-black text-slate-900">{score}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold text-slate-600">{label}</span>
    </div>
  );
};

const AnalyticsDashboard = ({ channelData }) => {
  if (!channelData) return null;

  const { analytics, health_dashboard, recent_videos, competitor_comparison } = channelData;

  // Prepare video performance data for bar chart
  const videoPerformanceData = recent_videos?.map((video, index) => ({
    name: `Video ${index + 1}`,
    title: video.title.substring(0, 30) + (video.title.length > 30 ? '...' : ''),
    views: video.views,
    engagement: parseFloat((video.engagement_rate * 100).toFixed(2))
  })) || [];

  // Prepare engagement trend data for line chart
  const engagementTrendData = recent_videos?.map((video, index) => ({
    name: new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    engagement: parseFloat((video.engagement_rate * 100).toFixed(2)),
    views: video.views
  })).reverse() || [];

  // Prepare theme distribution data for pie chart
  const themeDistributionData = analytics?.top_themes?.slice(0, 6).map((theme, index) => ({
    name: theme.charAt(0).toUpperCase() + theme.slice(1),
    value: Math.max(20 - (index * 3), 5), // Simulated distribution based on ranking
    fill: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  // Prepare competitor comparison data
  const competitorData = competitor_comparison ? [
    { 
      metric: 'Engagement', 
      yours: parseFloat((analytics.average_engagement_rate * 100).toFixed(2)),
      competitor: parseFloat((analytics.average_engagement_rate * 100 * (1 + parseFloat(competitor_comparison.engagement_gap) / 100)).toFixed(2))
    },
    { 
      metric: 'Theme Overlap', 
      yours: competitor_comparison.theme_overlap_percentage,
      competitor: 100 - competitor_comparison.theme_overlap_percentage
    }
  ] : [];

  // Health score colors
  const getScoreColor = (score) => {
    if (score >= 75) return COLORS.success;
    if (score >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-8" data-testid="analytics-dashboard">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8" />
          <h2 className="text-2xl font-black">Interactive Analytics Dashboard</h2>
        </div>
        <p className="text-indigo-100">
          Visualize your channel's performance metrics and growth trajectory
        </p>
      </div>

      {/* Health Score Gauges */}
      {health_dashboard && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Channel Health Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScoreGauge 
              score={health_dashboard.consistency_score} 
              label="Consistency"
              color={getScoreColor(health_dashboard.consistency_score)}
              icon={Calendar}
            />
            <ScoreGauge 
              score={health_dashboard.engagement_stability} 
              label="Stability"
              color={getScoreColor(health_dashboard.engagement_stability)}
              icon={Activity}
            />
            <ScoreGauge 
              score={health_dashboard.topic_focus_score} 
              label="Focus"
              color={getScoreColor(health_dashboard.topic_focus_score)}
              icon={Target}
            />
            <div className="flex flex-col items-center justify-center">
              <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
                health_dashboard.growth_momentum === 'Improving' ? 'border-green-500 bg-green-50' :
                health_dashboard.growth_momentum === 'Declining' ? 'border-red-500 bg-red-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <Flame className={`w-6 h-6 mb-1 ${
                  health_dashboard.growth_momentum === 'Improving' ? 'text-green-500' :
                  health_dashboard.growth_momentum === 'Declining' ? 'text-red-500' :
                  'text-yellow-500'
                }`} />
                <span className="text-sm font-black text-slate-900">
                  {health_dashboard.growth_momentum}
                </span>
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-600">Momentum</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Video Views Bar Chart */}
        {videoPerformanceData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Recent Video Views
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    tickFormatter={formatNumber}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={60}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="views" 
                    fill={COLORS.primary}
                    radius={[0, 4, 4, 0]}
                    name="Views"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Engagement Trend Line Chart */}
        {engagementTrendData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Engagement Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementTrendData}>
                  <defs>
                    <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke={COLORS.success}
                    strokeWidth={3}
                    fill="url(#engagementGradient)"
                    name="Engagement %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Theme Distribution Pie Chart */}
        {themeDistributionData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-500" />
              Content Theme Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={themeDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {themeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {themeDistributionData.map((theme, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: theme.fill }}
                    />
                    <span className="text-xs text-slate-600 truncate">{theme.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Video Performance Comparison */}
        {videoPerformanceData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Video Engagement Rates
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="engagement" 
                    fill={COLORS.secondary}
                    radius={[4, 4, 0, 0]}
                    name="Engagement %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Competitor Comparison Chart */}
      {competitor_comparison && competitorData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Competitor Comparison: {competitor_comparison.competitor_name}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="yours" 
                  fill={COLORS.primary}
                  name="Your Channel"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="competitor" 
                  fill={COLORS.danger}
                  name={competitor_comparison.competitor_name}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase opacity-80">Subscribers</span>
          </div>
          <div className="text-2xl font-black">
            {formatNumber(channelData.channel_info.subscribers)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase opacity-80">Avg Engagement</span>
          </div>
          <div className="text-2xl font-black">
            {(analytics.average_engagement_rate * 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase opacity-80">Videos/Month</span>
          </div>
          <div className="text-2xl font-black">
            {analytics.upload_frequency_per_month.toFixed(1)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase opacity-80">Total Videos</span>
          </div>
          <div className="text-2xl font-black">
            {formatNumber(channelData.channel_info.total_videos)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
