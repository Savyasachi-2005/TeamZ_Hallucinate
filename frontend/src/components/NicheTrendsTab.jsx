import { useState, useRef } from 'react';
import { Zap, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { fetchTrends, analyzeVideo } from '@/services/api';
import TrendCard from './TrendCard';
import AnalysisModal from './AnalysisModal';
import LoadingSpinner from './LoadingSpinner';

const NICHES = ['Coding', 'Finance', 'Fitness', 'Gaming', 'Education'];

const NicheTrendsTab = () => {
  const [selectedNiche, setSelectedNiche] = useState('');
  const [customNiche, setCustomNiche] = useState('');
  const [currentSearchLabel, setCurrentSearchLabel] = useState('');
  const [trends, setTrends] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  const resultsRef = useRef(null);

  const handleFetchTrends = async (customKeywordOverride = null) => {
    const keyword = customKeywordOverride || customNiche.trim();
    const niche = selectedNiche;

    if (!keyword && !niche) {
      toast.error('Please select a niche or enter a custom keyword');
      return;
    }

    if (keyword && keyword.length < 3) {
      toast.error('Custom keyword must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    setTrends([]);

    try {
      const data = await fetchTrends(keyword ? null : niche, keyword || null);
      setTrends(data.top_trends);
      setCurrentSearchLabel(data.niche);
      setFilteredCount(data.filtered_videos_count || data.top_trends.length);
      toast.success(`Found ${data.top_trends.length} trending videos`);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch trends');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeVideo = async (video) => {
    setSelectedVideo(video);
    setShowAnalysis(true);
    setIsAnalyzing(true);
    setAnalysisData(null);

    try {
      const data = await analyzeVideo(video.video_id, currentSearchLabel || selectedNiche || customNiche);
      setAnalysisData(data);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze video');
      setShowAnalysis(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Expose method for external calls (from Channel Analysis)
  const exploreTrendFromTheme = (theme) => {
    setCustomNiche(theme);
    setSelectedNiche('');
    setTimeout(() => handleFetchTrends(theme), 100);
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8 shadow-md">
          <div className="space-y-6">
            {/* Custom Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Custom Niche Search
              </label>
              <Input
                data-testid="custom-niche-input"
                type="text"
                value={customNiche}
                onChange={(e) => {
                  setCustomNiche(e.target.value);
                  if (e.target.value.trim()) setSelectedNiche('');
                }}
                placeholder="e.g., AI tools for students, React tutorials..."
                className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 rounded-lg px-5 py-4 text-lg h-auto placeholder:text-slate-500 text-slate-900"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchTrends()}
              />
              <p className="text-xs text-slate-600 mt-2 font-semibold">Custom input takes priority over dropdown</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-600 uppercase font-semibold">or select preset</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Preset Niches
              </label>
              <Select
                value={selectedNiche}
                onValueChange={(val) => {
                  setSelectedNiche(val);
                  setCustomNiche('');
                }}
              >
                <SelectTrigger
                  data-testid="niche-selector"
                  className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 rounded-lg px-5 py-4 text-lg h-auto text-slate-900"
                >
                  <SelectValue placeholder="Choose a niche..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-slate-200">
                  {NICHES.map((niche) => (
                    <SelectItem
                      key={niche}
                      value={niche}
                      className="text-slate-900 hover:bg-slate-50 focus:bg-slate-100 cursor-pointer"
                    >
                      {niche}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <button
              data-testid="fetch-trends-button"
              onClick={() => handleFetchTrends()}
              disabled={isLoading || (!selectedNiche && !customNiche.trim())}
              className="w-full bg-blue-600 hover:bg-blue-700 
                disabled:bg-slate-400 disabled:cursor-not-allowed
                text-white font-bold rounded-lg px-8 py-4 transition-colors 
                shadow-md disabled:shadow-none
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        <div ref={resultsRef} className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                Trending in <span className="text-blue-600">{currentSearchLabel}</span>
              </h2>
            </div>
            <span className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full border-2 border-slate-200 font-semibold">
              {filteredCount} videos found
            </span>
          </div>

          {/* Trend Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((video, index) => (
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

export default NicheTrendsTab;
