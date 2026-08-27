from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class TrendRequest(BaseModel):
    niche: Optional[str] = None
    custom_keyword: Optional[str] = None


class TrendVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    views: int
    published_at: str
    trend_score: float
    youtube_url: str
    views_per_day: float
    engagement_rate: float
    recency_days: int
    competition_level: str


class TrendResponse(BaseModel):
    niche: str
    filtered_videos_count: int
    top_trends: List[TrendVideo]
    trending_topics: Optional[List[str]] = None


class AnalyseRequest(BaseModel):
    video_id: str
    niche: str


class AnalysisDetails(BaseModel):
    hook_style: str
    title_pattern: str
    emotional_driver: str
    why_it_works: str


class CreatorAngle(BaseModel):
    suggested_title: str
    content_direction: str
    hook_example: str


class AnalyseResponse(BaseModel):
    analysis: AnalysisDetails
    creator_angle: CreatorAngle


class ChannelAnalyseRequest(BaseModel):
    channel_url: str
    competitor_url: Optional[str] = None


class ChannelInfo(BaseModel):
    name: str
    subscribers: int
    total_videos: int
    channel_id: str
    thumbnail: Optional[str] = None


class ChannelAnalytics(BaseModel):
    average_engagement_rate: float
    upload_frequency_per_month: float
    top_themes: List[str]


class RecentVideo(BaseModel):
    title: str
    views: int
    engagement_rate: float
    published_at: str
    video_id: str
    thumbnail: Optional[str] = None


class ChannelSummary(BaseModel):
    primary_niche: str
    content_style: str
    growth_pattern: str
    strength: str
    weakness: str


class HealthDashboard(BaseModel):
    consistency_score: int
    engagement_stability: int
    topic_focus_score: int
    growth_momentum: str


class StrategicSummary(BaseModel):
    main_risk: str
    growth_opportunity: str
    recommended_action_plan: List[str]


class EnhancedAIAnalysis(BaseModel):
    channel_summary: ChannelSummary
    strategic_summary: StrategicSummary


class CompetitorComparison(BaseModel):
    competitor_name: str
    engagement_gap: str
    posting_gap: str
    theme_overlap_percentage: int
    missed_topics: List[str]


class MissedTrend(BaseModel):
    keyword: str
    trend_score: float
    reason: str


class ChannelAnalyseResponse(BaseModel):
    channel_info: ChannelInfo
    analytics: ChannelAnalytics
    recent_videos: List[RecentVideo]
    ai_analysis: EnhancedAIAnalysis
    health_dashboard: HealthDashboard
    missed_trends: List[MissedTrend]
    competitor_comparison: Optional[CompetitorComparison] = None


class CopilotChatRequest(BaseModel):
    message: str


class CopilotChatResponse(BaseModel):
    response: str
    source: str
    context_used: bool
