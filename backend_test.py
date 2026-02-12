import requests
import sys
import json
from datetime import datetime

class NicheTrendAPITester:
    def __init__(self, base_url="https://nichepulse.preview.emergentagent.com/api"):
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
                    # Check if each trend has required fields
                    required_fields = ["video_id", "title", "channel", "views", "published_at", "trend_score", "youtube_url"]
                    for i, trend in enumerate(trends):
                        missing_fields = [field for field in required_fields if field not in trend]
                        if missing_fields:
                            self.log_test(f"Custom Keyword Response Structure - Video {i+1}", False, f"Missing fields: {missing_fields}")
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

    def test_channel_analyse_valid_url(self, channel_url="https://youtube.com/@MrBeast"):
        """Test channel analyse endpoint with valid URL"""
        success, response = self.run_test(
            "Channel Analyse - Valid URL",
            "POST",
            "channel-analyse",
            200,
            data={"channel_url": channel_url},
            timeout=120  # Channel analysis can be slow
        )
        
        if success and response:
            # Validate response structure
            required_sections = ["channel_info", "analytics", "recent_videos", "ai_analysis"]
            missing_sections = [section for section in required_sections if section not in response]
            
            if missing_sections:
                self.log_test("Channel Analyse Response Structure", False, f"Missing sections: {missing_sections}")
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
            
            # Validate recent_videos structure
            recent_videos = response["recent_videos"]
            if not isinstance(recent_videos, list):
                self.log_test("Recent Videos Structure", False, "recent_videos should be a list")
                return False, response
            
            if recent_videos:
                required_video_fields = ["title", "views", "engagement_rate", "published_at", "video_id"]
                for i, video in enumerate(recent_videos[:3]):  # Check first 3 videos
                    missing_video_fields = [field for field in required_video_fields if field not in video]
                    if missing_video_fields:
                        self.log_test(f"Recent Video {i+1} Structure", False, f"Missing fields: {missing_video_fields}")
                        return False, response
            
            # Validate ai_analysis structure
            ai_analysis = response["ai_analysis"]
            if "channel_summary" not in ai_analysis or "strategic_recommendations" not in ai_analysis:
                self.log_test("AI Analysis Structure", False, "Missing channel_summary or strategic_recommendations")
                return False, response
            
            self.log_test("Channel Analyse Response Structure", True)
            print(f"   Channel: {channel_info['name']}")
            print(f"   Subscribers: {channel_info['subscribers']:,}")
            print(f"   Videos: {len(recent_videos)} recent videos found")
            return True, response
        
        return success, response

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
    
    print("\n2️⃣b Custom Keyword Tests")
    tester.test_trends_custom_keyword_valid("AI tools")
    tester.test_trends_custom_keyword_valid("crypto trading")
    tester.test_trends_custom_keyword_short()
    tester.test_trends_custom_keyword_priority()
    tester.test_trends_both_niche_and_custom_keyword()
    
    print("\n3️⃣ Analysis Endpoint Tests")
    tester.test_analyse_video(niche="Coding")
    tester.test_analyse_invalid_video()
    
    print("\n4️⃣ Channel Analysis Endpoint Tests")
    tester.test_channel_analyse_valid_url("https://youtube.com/@MrBeast")
    tester.test_channel_analyse_invalid_url()
    tester.test_channel_analyse_missing_url()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())