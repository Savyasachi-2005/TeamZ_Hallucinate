import { Play, ExternalLink, Flame, Clock, TrendingUp, Users } from 'lucide-react';

const TrendCard = ({ video, index, onClick }) => {
  const isHot = video.recency_days <= 3;
  
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatVelocity = (vpd) => {
    if (vpd >= 1000000) return `${(vpd / 1000000).toFixed(1)}M/day`;
    if (vpd >= 1000) return `${(vpd / 1000).toFixed(1)}K/day`;
    return `${Math.round(vpd)}/day`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-600 text-white';
    if (score >= 60) return 'from-blue-500 to-cyan-600 text-white';
    if (score >= 40) return 'from-yellow-500 to-orange-600 text-white';
    return 'from-gray-500 to-gray-600 text-white';
  };

  const getCompetitionColor = (level) => {
    if (level === 'Low') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (level === 'Medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div
      data-testid={`video-card-${index}`}
      onClick={onClick}
      className={`group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer 
        transition-all duration-300 hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 
        hover:-translate-y-1 ${index === 0 ? 'md:col-span-2' : ''}`}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-800">
        <img
          src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/20 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700 text-xs font-bold text-white">
            #{index + 1}
          </span>
          {isHot && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm text-xs font-bold text-white animate-pulse">
              <Flame className="w-3 h-3" />
              HOT
            </span>
          )}
        </div>
        
        {/* Trend Score Badge */}
        <div className={`absolute top-3 right-3 px-4 py-2 rounded-xl bg-gradient-to-r ${getScoreColor(video.trend_score)} font-mono text-lg font-bold shadow-lg`}>
          {video.trend_score.toFixed(1)}
        </div>
        
        {/* Competition Badge */}
        {video.competition_level && (
          <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-lg border text-xs font-semibold ${getCompetitionColor(video.competition_level)}`}>
            {video.competition_level} Competition
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {video.channel}
        </p>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Views</p>
            <p className="font-mono text-sm text-white font-medium">{formatViews(video.views)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Velocity</p>
            <p className="font-mono text-sm text-cyan-400 font-medium">{formatVelocity(video.views_per_day)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Engagement</p>
            <p className="font-mono text-sm text-purple-400 font-medium">{(video.engagement_rate * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700/50">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Age</p>
            <p className="font-mono text-sm text-white font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              {video.recency_days}d ago
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <span className="text-xs text-gray-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Click to analyze
          </span>
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;
