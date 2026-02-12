import requests
import sys
import json
from datetime import datetime

class NicheTrendAPITester:
    def __init__(self, base_url="https://ytcreator-buddy.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:500]}...")
                    self.log_test(name, True)
                    return True, response_data
                except json.JSONDecodeError:
                    print(f"   Response Text: {response.text[:200]}...")
                    self.log_test(name, True)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    error_msg = f"Expected {expected_status}, got {response.status_code}. Error: {error_data}"
                except:
                    error_msg = f"Expected {expected_status}, got {response.status_code}. Text: {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            error_msg = f"Request timed out after {timeout} seconds"
            self.log_test(name, False, error_msg)
            return False, {}
        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_trends_valid_niche(self, niche="Coding"):
        """Test trends endpoint with valid niche"""
        success, response = self.run_test(
            f"Trends - Valid Niche ({niche})",
            "POST",
            "trends",
            200,
            data={"niche": niche},
            timeout=60  # YouTube API can be slow
        )
        
        if success and response:
            # Validate response structure
            if "niche" in response and "top_trends" in response:
                trends = response["top_trends"]
                if isinstance(trends, list) and len(trends) <= 5:
                    # Check if each trend has required fields (including new enhanced metrics)
                    required_fields = [
                        "video_id", "title", "channel", "views", "published_at", 
                        "trend_score", "youtube_url",
                        # New enhanced metrics from Trending Detection Engine
                        "views_per_day", "engagement_rate", "recency_days", "competition_level"
                    ]
                    for i, trend in enumerate(trends):
                        missing_fields = [field for field in required_fields if field not in trend]
                        if missing_fields:
                            self.log_test(f"Trends Response Structure - Video {i+1}", False, f"Missing fields: {missing_fields}")
                            return False, response
                        
                        # Validate new metrics data types and ranges
                        if not self.validate_enhanced_metrics(trend, i+1):
                            return False, response
                    
                    self.log_test("Trends Response Structure", True)
                    self.log_test("Enhanced Metrics Validation", True)
                    print(f"   Found {len(trends)} trending videos")
                    
                    # Check for optional trending_topics field
                    if "trending_topics" in response:
                        trending_topics = response["trending_topics"]
                        if trending_topics is None or isinstance(trending_topics, list):
                            self.log_test("Trending Topics Field", True)
                            if trending_topics:
                                print(f"   Trending topics: {trending_topics}")
                        else:
                            self.log_test("Trending Topics Field", False, f"Expected list or null, got {type(trending_topics)}")
                    else:
                        self.log_test("Trending Topics Field", False, "Missing optional trending_topics field")
                    
                    return True, response
                else:
                    self.log_test("Trends Response Structure", False, f"Expected list of max 5 trends, got {len(trends) if isinstance(trends, list) else type(trends)}")
            else:
                self.log_test("Trends Response Structure", False, "Missing 'niche' or 'top_trends' in response")
        
        return success, response

    def test_trends_invalid_niche(self):
        """Test trends endpoint with invalid niche"""
        return self.run_test(
            "Trends - Invalid Niche",
            "POST",
            "trends",
            400,
            data={"niche": "InvalidNiche"}
        )

    def test_trends_missing_niche(self):
        """Test trends endpoint with missing niche"""
        return self.run_test(
            "Trends - Missing Niche and Custom Keyword",
            "POST",
            "trends",
            400,  # Should return 400 with proper error message
            data={}
        )

    def validate_enhanced_metrics(self, trend, video_num):
        """Validate the new enhanced metrics from Trending Detection Engine"""
        
        # Validate views_per_day
        views_per_day = trend.get("views_per_day")
        if not isinstance(views_per_day, (int, float)) or views_per_day < 0:
            self.log_test(f"Views Per Day Validation - Video {video_num}", False, f"Expected positive number, got {views_per_day}")
            return False
        
        # Validate engagement_rate
        engagement_rate = trend.get("engagement_rate")
        if not isinstance(engagement_rate, (int, float)) or engagement_rate < 0:
            self.log_test(f"Engagement Rate Validation - Video {video_num}", False, f"Expected positive number, got {engagement_rate}")
            return False
        
        # Validate recency_days
        recency_days = trend.get("recency_days")
        if not isinstance(recency_days, int) or recency_days < 0:
            self.log_test(f"Recency Days Validation - Video {video_num}", False, f"Expected positive integer, got {recency_days}")
            return False
        
        # Validate competition_level
        competition_level = trend.get("competition_level")
        valid_competition_levels = ["Low", "Medium", "High"]
        if competition_level not in valid_competition_levels:
            self.log_test(f"Competition Level Validation - Video {video_num}", False, f"Expected one of {valid_competition_levels}, got {competition_level}")
            return False
        
        # Validate trend_score is in 0-100 range
        trend_score = trend.get("trend_score")
        if not isinstance(trend_score, (int, float)) or trend_score < 0 or trend_score > 100:
            self.log_test(f"Trend Score Range Validation - Video {video_num}", False, f"Expected 0-100 range, got {trend_score}")
            return False
        
        # Validate views >= 100 (filtering requirement)
        views = trend.get("views")
        if not isinstance(views, int) or views < 100:
            self.log_test(f"Views Filtering Validation - Video {video_num}", False, f"Expected views >= 100, got {views}")
            return False
        
        return True

    def test_trending_detection_engine_features(self):
        """Test specific Trending Detection Engine features"""
        print("\n🔍 Testing Trending Detection Engine Features...")
        
        # Test with a niche that should return results
        success, response = self.run_test(
            "Trending Detection Engine - Enhanced Metrics",
            "POST",
            "trends",
            200,
            data={"niche": "Gaming"},
            timeout=60
        )
        
        if success and response:
            trends = response.get("top_trends", [])
            if not trends:
                self.log_test("Trending Detection Engine", False, "No trends returned")
                return False, response
            
            # Test 1: All videos should have views >= 100
            for i, trend in enumerate(trends):
                if trend.get("views", 0) < 100:
                    self.log_test("100+ Views Filter", False, f"Video {i+1} has {trend.get('views')} views (< 100)")
                    return False, response
            self.log_test("100+ Views Filter", True)
            
            # Test 2: Trend scores should be normalized to 0-100 range
            all_scores_valid = True
            for i, trend in enumerate(trends):
                score = trend.get("trend_score", -1)
                if not (0 <= score <= 100):
                    self.log_test("Trend Score Normalization", False, f"Video {i+1} score {score} not in 0-100 range")
                    all_scores_valid = False
                    break
            if all_scores_valid:
                self.log_test("Trend Score Normalization", True)
            
            # Test 3: Competition levels should be valid
            valid_levels = ["Low", "Medium", "High"]
            all_competition_valid = True
            for i, trend in enumerate(trends):
                level = trend.get("competition_level")
                if level not in valid_levels:
                    self.log_test("Competition Level Values", False, f"Video {i+1} has invalid competition level: {level}")
                    all_competition_valid = False
                    break
            if all_competition_valid:
                self.log_test("Competition Level Values", True)
            
            # Test 4: Enhanced metrics should be present and valid
            for i, trend in enumerate(trends):
                # Check views_per_day calculation makes sense
                views = trend.get("views", 0)
                days = trend.get("recency_days", 1)
                calculated_vpd = views / max(days, 1)
                actual_vpd = trend.get("views_per_day", 0)
                
                # Allow for some rounding differences
                if abs(calculated_vpd - actual_vpd) > 1:
                    self.log_test(f"Views Per Day Calculation - Video {i+1}", False, 
                                f"Expected ~{calculated_vpd:.2f}, got {actual_vpd}")
                    return False, response
            
            self.log_test("Views Per Day Calculation", True)
            
            # Test 5: Check if trending_topics is present (optional field)
            if "trending_topics" in response:
                topics = response["trending_topics"]
                if topics is not None and isinstance(topics, list):
                    self.log_test("Trending Topics Structure", True)
                    print(f"   Trending topics found: {topics}")
                else:
                    self.log_test("Trending Topics Structure", False, f"Expected list or null, got {type(topics)}")
            
            return True, response
        
        return success, response
    def test_trends_custom_keyword_valid(self, custom_keyword="AI tools"):
        """Test trends endpoint with valid custom keyword"""
        success, response = self.run_test(
            f"Trends - Valid Custom Keyword ({custom_keyword})",
            "POST",
            "trends",
            200,
            data={"custom_keyword": custom_keyword},
            timeout=60
        )
        
        if success and response:
            # Validate response structure
            if "niche" in response and "top_trends" in response:
                # Check that niche field contains the custom keyword
                if response["niche"] == custom_keyword:
                    self.log_test("Custom Keyword Response Label", True)
                else:
                    self.log_test("Custom Keyword Response Label", False, f"Expected niche '{custom_keyword}', got '{response['niche']}'")
                    return False, response
                
                trends = response["top_trends"]
                if isinstance(trends, list) and len(trends) <= 5:
                    # Check if each trend has required fields (including enhanced metrics)
                    required_fields = [
                        "video_id", "title", "channel", "views", "published_at", 
                        "trend_score", "youtube_url",
                        "views_per_day", "engagement_rate", "recency_days", "competition_level"
                    ]
                    for i, trend in enumerate(trends):
                        missing_fields = [field for field in required_fields if field not in trend]
                        if missing_fields:
                            self.log_test(f"Custom Keyword Response Structure - Video {i+1}", False, f"Missing fields: {missing_fields}")
                            return False, response
                        
                        # Validate enhanced metrics
                        if not self.validate_enhanced_metrics(trend, i+1):
                            return False, response
                    
                    self.log_test("Custom Keyword Response Structure", True)
                    print(f"   Found {len(trends)} trending videos for custom keyword")
                    return True, response
                else:
                    self.log_test("Custom Keyword Response Structure", False, f"Expected list of max 5 trends, got {len(trends) if isinstance(trends, list) else type(trends)}")
            else:
                self.log_test("Custom Keyword Response Structure", False, "Missing 'niche' or 'top_trends' in response")
        
        return success, response

    def test_trends_custom_keyword_short(self):
        """Test trends endpoint with too short custom keyword"""
        return self.run_test(
            "Trends - Short Custom Keyword (< 3 chars)",
            "POST",
            "trends",
            400,
            data={"custom_keyword": "AI"}
        )

    def test_trends_custom_keyword_priority(self):
        """Test that custom_keyword takes priority over niche"""
        success, response = self.run_test(
            "Trends - Custom Keyword Priority Over Niche",
            "POST",
            "trends",
            200,
            data={"custom_keyword": "machine learning", "niche": "Coding"},
            timeout=60
        )
        
        if success and response:
            # Check that the response niche matches custom_keyword, not the niche parameter
            if response.get("niche") == "machine learning":
                self.log_test("Custom Keyword Priority Logic", True)
                return True, response
            else:
                self.log_test("Custom Keyword Priority Logic", False, f"Expected 'machine learning', got '{response.get('niche')}'")
        
        return success, response

    def test_trends_both_niche_and_custom_keyword(self):
        """Test trends endpoint with both niche and custom keyword (custom should win)"""
        return self.test_trends_custom_keyword_priority()

    def test_analyse_video(self, video_id=None, niche="Coding"):
        """Test analyse endpoint with video ID"""
        if not video_id:
            # First get a video ID from trends
            success, trends_response = self.test_trends_valid_niche(niche)
            if success and trends_response.get("top_trends"):
                video_id = trends_response["top_trends"][0]["video_id"]
                print(f"   Using video ID from trends: {video_id}")
            else:
                # Use a known video ID for testing
                video_id = "dQw4w9WgXcQ"  # Rick Roll - always available
                print(f"   Using fallback video ID: {video_id}")

        success, response = self.run_test(
            "Analyse Video",
            "POST",
            "analyse",
            200,
            data={"video_id": video_id, "niche": niche},
            timeout=90  # Gemini API can be slow
        )
        
        if success and response:
            # Validate response structure
            required_analysis_fields = ["hook_style", "title_pattern", "emotional_driver", "why_it_works"]
            required_creator_fields = ["suggested_title", "content_direction", "hook_example"]
            
            if "analysis" in response and "creator_angle" in response:
                analysis = response["analysis"]
                creator_angle = response["creator_angle"]
                
                missing_analysis = [field for field in required_analysis_fields if field not in analysis]
                missing_creator = [field for field in required_creator_fields if field not in creator_angle]
                
                if missing_analysis or missing_creator:
                    error_msg = f"Missing analysis fields: {missing_analysis}, Missing creator fields: {missing_creator}"
                    self.log_test("Analyse Response Structure", False, error_msg)
                else:
                    self.log_test("Analyse Response Structure", True)
                    return True, response
            else:
                self.log_test("Analyse Response Structure", False, "Missing 'analysis' or 'creator_angle' in response")
        
        return success, response

    def test_analyse_invalid_video(self):
        """Test analyse endpoint with invalid video ID"""
        return self.run_test(
            "Analyse - Invalid Video ID",
            "POST",
            "analyse",
            404,
            data={"video_id": "invalid_video_id", "niche": "Coding"}
        )

    def test_channel_analyse_basic_flow(self, channel_url="@mkbhd"):
        """Test 1: Channel Analysis WITHOUT Competitor (Basic Flow)"""
        success, response = self.run_test(
            "Enhanced AI Copilot - Channel Analysis Basic Flow",
            "POST",
            "channel-analyse",
            200,
            data={"channel_url": channel_url},
            timeout=120  # Channel analysis can be slow
        )
        
        if success and response:
            # Validate enhanced response structure for AI Copilot
            required_sections = [
                "channel_info", "analytics", "recent_videos", "ai_analysis", 
                "health_dashboard", "missed_trends", "competitor_comparison"
            ]
            missing_sections = [section for section in required_sections if section not in response]
            
            if missing_sections:
                self.log_test("Enhanced AI Copilot Response Structure", False, f"Missing sections: {missing_sections}")
                return False, response
            
            # Validate channel_info structure
            channel_info = response["channel_info"]
            required_channel_fields = ["name", "subscribers", "total_videos", "channel_id"]
            missing_channel_fields = [field for field in required_channel_fields if field not in channel_info]
            
            if missing_channel_fields:
                self.log_test("Channel Info Structure", False, f"Missing fields: {missing_channel_fields}")
                return False, response
            
            # Validate analytics structure
            analytics = response["analytics"]
            required_analytics_fields = ["average_engagement_rate", "upload_frequency_per_month", "top_themes"]
            missing_analytics_fields = [field for field in required_analytics_fields if field not in analytics]
            
            if missing_analytics_fields:
                self.log_test("Analytics Structure", False, f"Missing fields: {missing_analytics_fields}")
                return False, response
            
            # Validate health_dashboard structure (NEW)
            health_dashboard = response["health_dashboard"]
            required_health_fields = ["consistency_score", "engagement_stability", "topic_focus_score", "growth_momentum"]
            missing_health_fields = [field for field in required_health_fields if field not in health_dashboard]
            
            if missing_health_fields:
                self.log_test("Health Dashboard Structure", False, f"Missing fields: {missing_health_fields}")
                return False, response
            
            # Validate health dashboard values
            consistency_score = health_dashboard["consistency_score"]
            engagement_stability = health_dashboard["engagement_stability"]
            topic_focus_score = health_dashboard["topic_focus_score"]
            growth_momentum = health_dashboard["growth_momentum"]
            
            if not (0 <= consistency_score <= 100):
                self.log_test("Health Dashboard - Consistency Score Range", False, f"Expected 0-100, got {consistency_score}")
                return False, response
            
            if not (0 <= engagement_stability <= 100):
                self.log_test("Health Dashboard - Engagement Stability Range", False, f"Expected 0-100, got {engagement_stability}")
                return False, response
            
            if not (0 <= topic_focus_score <= 100):
                self.log_test("Health Dashboard - Topic Focus Range", False, f"Expected 0-100, got {topic_focus_score}")
                return False, response
            
            if growth_momentum not in ["Improving", "Stable", "Declining"]:
                self.log_test("Health Dashboard - Growth Momentum Values", False, f"Expected Improving/Stable/Declining, got {growth_momentum}")
                return False, response
            
            self.log_test("Health Dashboard Validation", True)
            
            # Validate missed_trends structure (NEW)
            missed_trends = response["missed_trends"]
            if not isinstance(missed_trends, list):
                self.log_test("Missed Trends Structure", False, "missed_trends should be a list")
                return False, response
            
            for i, trend in enumerate(missed_trends):
                required_trend_fields = ["keyword", "trend_score", "reason"]
                missing_trend_fields = [field for field in required_trend_fields if field not in trend]
                if missing_trend_fields:
                    self.log_test(f"Missed Trend {i+1} Structure", False, f"Missing fields: {missing_trend_fields}")
                    return False, response
                
                # Validate trend_score is 0-100
                trend_score = trend["trend_score"]
                if not (0 <= trend_score <= 100):
                    self.log_test(f"Missed Trend {i+1} Score Range", False, f"Expected 0-100, got {trend_score}")
                    return False, response
            
            self.log_test("Missed Trends Validation", True)
            
            # Validate enhanced ai_analysis structure (NEW)
            ai_analysis = response["ai_analysis"]
            if "channel_summary" not in ai_analysis or "strategic_summary" not in ai_analysis:
                self.log_test("Enhanced AI Analysis Structure", False, "Missing channel_summary or strategic_summary")
                return False, response
            
            # Validate strategic_summary structure
            strategic_summary = ai_analysis["strategic_summary"]
            required_strategic_fields = ["main_risk", "growth_opportunity", "recommended_action_plan"]
            missing_strategic_fields = [field for field in required_strategic_fields if field not in strategic_summary]
            
            if missing_strategic_fields:
                self.log_test("Strategic Summary Structure", False, f"Missing fields: {missing_strategic_fields}")
                return False, response
            
            # Validate recommended_action_plan has 3 steps
            action_plan = strategic_summary["recommended_action_plan"]
            if not isinstance(action_plan, list) or len(action_plan) != 3:
                self.log_test("Action Plan Structure", False, f"Expected list of 3 steps, got {len(action_plan) if isinstance(action_plan, list) else type(action_plan)}")
                return False, response
            
            self.log_test("Strategic Summary Validation", True)
            
            # Validate competitor_comparison is null for basic flow
            competitor_comparison = response["competitor_comparison"]
            if competitor_comparison is not None:
                self.log_test("Competitor Comparison - Basic Flow", False, f"Expected null for basic flow, got {type(competitor_comparison)}")
                return False, response
            
            self.log_test("Competitor Comparison - Basic Flow", True)
            
            self.log_test("Enhanced AI Copilot - Basic Flow Complete", True)
            print(f"   Channel: {channel_info['name']}")
            print(f"   Subscribers: {channel_info['subscribers']:,}")
            print(f"   Health Scores: Consistency={consistency_score}, Engagement={engagement_stability}, Focus={topic_focus_score}")
            print(f"   Growth Momentum: {growth_momentum}")
            print(f"   Missed Trends: {len(missed_trends)} detected")
            return True, response
        
        return success, response

    def test_channel_analyse_with_competitor(self, channel_url="@mkbhd", competitor_url="@UnboxTherapy"):
        """Test 2: Channel Analysis WITH Competitor Comparison"""
        success, response = self.run_test(
            "Enhanced AI Copilot - Channel Analysis with Competitor",
            "POST",
            "channel-analyse",
            200,
            data={"channel_url": channel_url, "competitor_url": competitor_url},
            timeout=180  # Competitor analysis takes longer
        )
        
        if success and response:
            # All basic validations from test 1
            basic_success, _ = self.validate_basic_channel_response(response)
            if not basic_success:
                return False, response
            
            # Validate competitor_comparison is NOT null
            competitor_comparison = response["competitor_comparison"]
            if competitor_comparison is None:
                self.log_test("Competitor Comparison - With Competitor", False, "Expected competitor data, got null")
                return False, response
            
            # Validate competitor_comparison structure
            required_competitor_fields = ["competitor_name", "engagement_gap", "posting_gap", "theme_overlap_percentage", "missed_topics"]
            missing_competitor_fields = [field for field in required_competitor_fields if field not in competitor_comparison]
            
            if missing_competitor_fields:
                self.log_test("Competitor Comparison Structure", False, f"Missing fields: {missing_competitor_fields}")
                return False, response
            
            # Validate engagement_gap format (should be like "+2.3%" or "-1.5%")
            engagement_gap = competitor_comparison["engagement_gap"]
            if not isinstance(engagement_gap, str) or not (engagement_gap.startswith('+') or engagement_gap.startswith('-')) or not engagement_gap.endswith('%'):
                self.log_test("Engagement Gap Format", False, f"Expected format like '+2.3%' or '-1.5%', got {engagement_gap}")
                return False, response
            
            # Validate theme_overlap_percentage is 0-100
            theme_overlap = competitor_comparison["theme_overlap_percentage"]
            if not (0 <= theme_overlap <= 100):
                self.log_test("Theme Overlap Range", False, f"Expected 0-100, got {theme_overlap}")
                return False, response
            
            # Validate missed_topics is a list
            missed_topics = competitor_comparison["missed_topics"]
            if not isinstance(missed_topics, list):
                self.log_test("Competitor Missed Topics Structure", False, "missed_topics should be a list")
                return False, response
            
            self.log_test("Competitor Comparison Validation", True)
            self.log_test("Enhanced AI Copilot - Competitor Flow Complete", True)
            
            print(f"   Competitor: {competitor_comparison['competitor_name']}")
            print(f"   Engagement Gap: {engagement_gap}")
            print(f"   Theme Overlap: {theme_overlap}%")
            print(f"   Missed Topics: {len(missed_topics)} identified")
            return True, response
        
        return success, response

    def validate_basic_channel_response(self, response):
        """Helper method to validate basic channel response structure"""
        # This is a condensed version of the validation from test_channel_analyse_basic_flow
        required_sections = [
            "channel_info", "analytics", "health_dashboard", "missed_trends", "ai_analysis"
        ]
        
        for section in required_sections:
            if section not in response:
                self.log_test(f"Basic Validation - Missing {section}", False, f"Missing section: {section}")
                return False, response
        
        # Quick validation of key fields
        health_dashboard = response["health_dashboard"]
        for score_field in ["consistency_score", "engagement_stability", "topic_focus_score"]:
            if not (0 <= health_dashboard.get(score_field, -1) <= 100):
                self.log_test(f"Basic Validation - {score_field}", False, f"Score out of range: {health_dashboard.get(score_field)}")
                return False, response
        
        if response["health_dashboard"]["growth_momentum"] not in ["Improving", "Stable", "Declining"]:
            self.log_test("Basic Validation - Growth Momentum", False, f"Invalid growth momentum: {response['health_dashboard']['growth_momentum']}")
            return False, response
        
        return True, response

    def test_channel_analyse_caching(self, channel_url="@FireshipChannel"):
        """Test 6: Caching - Make same request twice to verify cache hit"""
        print(f"\n🔍 Testing Caching with {channel_url}...")
        
        # First request
        success1, response1 = self.run_test(
            "Channel Analysis - First Request (Cache MISS)",
            "POST",
            "channel-analyse",
            200,
            data={"channel_url": channel_url},
            timeout=120
        )
        
        if not success1:
            return False, {}
        
        # Second request (should hit cache)
        success2, response2 = self.run_test(
            "Channel Analysis - Second Request (Cache HIT)",
            "POST",
            "channel-analyse",
            200,
            data={"channel_url": channel_url},
            timeout=30  # Should be much faster due to cache
        )
        
        if success2:
            # Both requests should return the same channel name
            if response1.get("channel_info", {}).get("name") == response2.get("channel_info", {}).get("name"):
                self.log_test("Caching Functionality", True)
                print("   Note: Check backend logs for 'Cache HIT' message to confirm caching")
                return True, response2
            else:
                self.log_test("Caching Functionality", False, "Responses differ between requests")
        
        return success2, response2

    def test_channel_analyse_error_handling(self):
        """Test 7: Error Handling"""
        # Test invalid channel URL
        success1, _ = self.run_test(
            "Error Handling - Invalid Channel URL",
            "POST",
            "channel-analyse",
            400,
            data={"channel_url": "https://invalid-url.com"}
        )
        
        # Test non-existent channel
        success2, _ = self.run_test(
            "Error Handling - Non-existent Channel",
            "POST",
            "channel-analyse",
            404,
            data={"channel_url": "@nonexistentchannel12345xyz"}
        )
        
        return success1 and success2

    def test_channel_analyse_valid_url(self, channel_url="https://youtube.com/@MrBeast"):
        """Legacy test - kept for backward compatibility"""
        return self.test_channel_analyse_basic_flow(channel_url)

    def test_channel_analyse_invalid_url(self):
        """Test channel analyse endpoint with invalid URL"""
        return self.run_test(
            "Channel Analyse - Invalid URL",
            "POST",
            "channel-analyse",
            400,
            data={"channel_url": "https://invalid-url.com"}
        )

    def test_channel_analyse_missing_url(self):
        """Test channel analyse endpoint with missing URL"""
        return self.run_test(
            "Channel Analyse - Missing URL",
            "POST",
            "channel-analyse",
            422,  # FastAPI validation error
            data={}
        )

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed < self.tests_run:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAILED":
                    print(f"   • {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    print("🚀 Starting Niche Trend Intelligence API Tests")
    print("=" * 60)
    
    tester = NicheTrendAPITester()
    
    # Test sequence
    print("\n1️⃣ Basic API Health Tests")
    tester.test_health_check()
    tester.test_root_endpoint()
    
    print("\n2️⃣ Trends Endpoint Tests")
    tester.test_trends_valid_niche("Coding")
    tester.test_trends_valid_niche("Finance")
    tester.test_trends_invalid_niche()
    tester.test_trends_missing_niche()
    
    print("\n2️⃣a Trending Detection Engine Features")
    tester.test_trending_detection_engine_features()
    
    print("\n2️⃣b Custom Keyword Tests")
    tester.test_trends_custom_keyword_valid("AI tools")
    tester.test_trends_custom_keyword_valid("crypto trading")
    tester.test_trends_custom_keyword_short()
    tester.test_trends_custom_keyword_priority()
    tester.test_trends_both_niche_and_custom_keyword()
    
    print("\n3️⃣ Analysis Endpoint Tests")
    tester.test_analyse_video(niche="Coding")
    tester.test_analyse_invalid_video()
    
    print("\n4️⃣ Enhanced AI Copilot for Sustainable Growth Features")
    print("   Testing Channel Analysis WITHOUT Competitor (Basic Flow)")
    tester.test_channel_analyse_basic_flow("@mkbhd")
    
    print("   Testing Channel Analysis WITH Competitor Comparison")
    tester.test_channel_analyse_with_competitor("@mkbhd", "@UnboxTherapy")
    
    print("   Testing Caching Functionality")
    tester.test_channel_analyse_caching("@FireshipChannel")
    
    print("   Testing Error Handling")
    tester.test_channel_analyse_error_handling()
    
    print("\n4️⃣b Legacy Channel Analysis Tests")
    tester.test_channel_analyse_invalid_url()
    tester.test_channel_analyse_missing_url()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())