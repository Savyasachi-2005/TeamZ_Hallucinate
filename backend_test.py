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
                    # Check if each trend has required fields
                    required_fields = ["video_id", "title", "channel", "views", "published_at", "trend_score", "youtube_url"]
                    for i, trend in enumerate(trends):
                        missing_fields = [field for field in required_fields if field not in trend]
                        if missing_fields:
                            self.log_test(f"Trends Response Structure - Video {i+1}", False, f"Missing fields: {missing_fields}")
                            return False, response
                    
                    self.log_test("Trends Response Structure", True)
                    print(f"   Found {len(trends)} trending videos")
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
            "Trends - Missing Niche",
            "POST",
            "trends",
            422,  # FastAPI validation error
            data={}
        )

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
    
    print("\n3️⃣ Analysis Endpoint Tests")
    tester.test_analyse_video(niche="Coding")
    tester.test_analyse_invalid_video()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())