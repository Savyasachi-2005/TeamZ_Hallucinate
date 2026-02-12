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
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-xl">
          <div className="space-y-6">
            {/* Custom Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
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
                className="w-full bg-white border-#334155 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-5 py-4 text-lg h-auto placeholder:text-[#64748B] text-[#0F172A]"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchTrends()}
              />
              <p className="text-xs text-[#64748B] mt-2">Custom input takes priority over dropdown</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white" />
              <span className="text-xs text-[#64748B] uppercase font-medium">or select preset</span>
              <div className="flex-1 h-px bg-white" />
            </div>

            {/* Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
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
                  className="w-full bg-white border-#334155 focus:border-blue-500 rounded-xl px-5 py-4 text-lg h-auto text-[#0F172A]"
                >
                  <SelectValue placeholder="Choose a niche..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E2E8F0]">
                  {NICHES.map((niche) => (
                    <SelectItem
                      key={niche}
                      value={niche}
                      className="text-[#0F172A] hover:bg-white focus:bg-white cursor-pointer"
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
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 
                disabled:from-#334155 disabled:to-#334155 disabled:cursor-not-allowed
                text-[#0F172A] font-bold rounded-xl px-8 py-4 transition-all duration-300 
                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none
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
        <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-[#0F172A]">
                Trending in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{currentSearchLabel}</span>
              </h2>
            </div>
            <span className="text-sm text-[#475569] bg-white px-3 py-1 rounded-full">
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
