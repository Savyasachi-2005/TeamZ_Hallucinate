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
    if (score >= 80) return 'bg-emerald-600 text-white';
    if (score >= 60) return 'bg-blue-600 text-white';
    if (score >= 40) return 'bg-yellow-600 text-white';
    return 'bg-slate-600 text-white';
  };

  const getCompetitionColor = (level) => {
    if (level === 'Low') return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (level === 'Medium') return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    return 'text-red-700 bg-red-50 border-red-300';
  };

  return (
    <div
      data-testid={`video-card-${index}`}
      onClick={onClick}
      className={`group relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden cursor-pointer 
        transition-all hover:border-blue-600 hover:shadow-lg ${index === 0 ? 'md:col-span-2' : ''}`}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-slate-100">
        <img
          src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-4 rounded-full bg-white shadow-lg">
            <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
          </div>
        </div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 text-xs font-bold text-white">
            #{index + 1}
          </span>
          {isHot && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-600 text-xs font-bold text-white">
              <Flame className="w-3 h-3" />
              HOT
            </span>
          )}
        </div>
        
        {/* Trend Score Badge */}
        <div className={`absolute top-3 right-3 px-4 py-2 rounded-lg ${getScoreColor(video.trend_score)} font-mono text-lg font-bold shadow-md`}>
          {video.trend_score.toFixed(1)}
        </div>
        
        {/* Competition Badge */}
        {video.competition_level && (
          <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-lg border-2 text-xs font-bold ${getCompetitionColor(video.competition_level)}`}>
            {video.competition_level} Competition
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        
        <p className="text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {video.channel}
        </p>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg px-3 py-2 border-2 border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Views</p>
            <p className="font-mono text-sm text-slate-900 font-semibold">{formatViews(video.views)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2 border-2 border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Velocity</p>
            <p className="font-mono text-sm text-blue-600 font-semibold">{formatVelocity(video.views_per_day)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2 border-2 border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Engagement</p>
            <p className="font-mono text-sm text-blue-600 font-semibold">{(video.engagement_rate * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2 border-2 border-slate-200">
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">Age</p>
            <p className="font-mono text-sm text-slate-900 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-600" />
              {video.recency_days}d ago
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
          <span className="text-xs text-slate-700 flex items-center gap-2 font-semibold">
            <TrendingUp className="w-4 h-4" />
            Click to analyze
          </span>
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;
