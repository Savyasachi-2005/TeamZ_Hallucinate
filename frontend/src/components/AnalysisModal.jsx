import { X, Zap, BarChart3, Lightbulb, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AnalysisModal = ({ isOpen, onClose, video, analysisData, isLoading }) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            Trend Analysis
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400 animate-pulse">Analyzing with AI...</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-6 mt-4" data-testid="analysis-content">
            {/* Video Preview */}
            <div className="flex gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <img
                src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                alt={video.title}
                className="w-36 h-20 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate">{video.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{video.channel}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold">
                    Score: {video.trend_score?.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Why It's Trending */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Why It's Trending
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Hook Style</p>
                  <p className="text-gray-300 text-sm" data-testid="hook-style">
                    {analysisData.analysis?.hook_style}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Title Pattern</p>
                  <p className="text-gray-300 text-sm" data-testid="title-pattern">
                    {analysisData.analysis?.title_pattern}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Emotional Driver</p>
                  <p className="text-gray-300 text-sm" data-testid="emotional-driver">
                    {analysisData.analysis?.emotional_driver}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 md:col-span-2 hover:border-purple-500/50 transition-colors">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Why It Works</p>
                  <p className="text-gray-300 text-sm" data-testid="why-it-works">
                    {analysisData.analysis?.why_it_works}
                  </p>
                </div>
              </div>
            </div>

            {/* Creator Angle */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Your Creator Angle
              </h3>
              
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Suggested Title</p>
                  <p className="text-lg font-bold text-white" data-testid="suggested-title">
                    {analysisData.creator_angle?.suggested_title}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Content Direction</p>
                  <p className="text-gray-300" data-testid="content-direction">
                    {analysisData.creator_angle?.content_direction}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Hook Example</p>
                  <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700" data-testid="hook-example">
                    <p className="text-gray-300 italic font-mono text-sm">
                      "{analysisData.creator_angle?.hook_example}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              data-testid="modal-close-button"
              onClick={onClose}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors flex items-center justify-center gap-2 text-gray-300 hover:text-white"
            >
              <X className="w-4 h-4" />
              Close Analysis
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisModal;
