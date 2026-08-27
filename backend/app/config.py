import logging
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
GOOGLE_API_KEY = GEMINI_API_KEY
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

NICHE_KEYWORDS = {
    "Coding": ["programming tutorial", "coding tips", "software development"],
    "Finance": ["personal finance tips", "investing strategy", "stock market news"],
    "Fitness": ["workout routine", "fat loss tips", "muscle building"],
    "Gaming": ["gameplay walkthrough", "gaming tips", "new game release"],
    "Education": ["study tips", "exam preparation", "learning strategies"],
}
