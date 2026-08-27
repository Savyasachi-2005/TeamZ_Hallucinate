import math
import re
from datetime import datetime, timezone
from .text import STOPWORDS


def extract_title_keywords(title, top_n=3):
    return [
        w for w in re.findall(r"\b[a-zA-Z]{3,}\b", title.lower()) if w not in STOPWORDS
    ][:top_n]


def calculate_days_since_upload(published_at):
    try:
        return max(
            (
                datetime.now(timezone.utc)
                - datetime.fromisoformat(published_at.replace("Z", "+00:00"))
            ).days,
            1,
        )
    except Exception:
        return 9999


def calculate_views_per_day(views, days):
    return views / max(days, 1)


def calculate_engagement_rate(views, likes, comments):
    return (likes + comments) / max(views, 1)


def calculate_recency_weight(days):
    return math.exp(-days / 30)


def calculate_acceleration_score(vpd, average):
    return 1.0 if average <= 0 else vpd / average


def calculate_competition_score(keywords, all_keywords):
    if not keywords or not all_keywords:
        return 100, "Low"
    count = max(0, sum(bool(set(keywords) & set(other)) for other in all_keywords) - 1)
    return (
        (30, "High") if count >= 8 else (60, "Medium") if count >= 4 else (100, "Low")
    )


def normalize_scores(values):
    if not values:
        return []
    maximum = max(values)
    return (
        [0.0] * len(values)
        if maximum == 0
        else [min(100, max(0, v / maximum * 100)) for v in values]
    )


def calculate_trend_scores_batch(videos, stats):
    candidates = []
    for video in videos:
        item = stats.get(video["video_id"], {"views": 0, "likes": 0, "comments": 0})
        views = item.get("views", 0)
        days = calculate_days_since_upload(video["published_at"])
        if days > 5 or views < 100:
            continue
        vpd = calculate_views_per_day(views, days)
        candidates.append(
            {
                **video,
                "stats": item,
                "days": days,
                "views_per_day": vpd,
                "engagement_rate": calculate_engagement_rate(
                    views, item.get("likes", 0), item.get("comments", 0)
                ),
                "recency_weight": calculate_recency_weight(days),
                "title_keywords": extract_title_keywords(video["title"]),
            }
        )
    if not candidates:
        return []
    average = sum(x["views_per_day"] for x in candidates) / len(candidates)
    for x in candidates:
        x["acceleration_score"] = calculate_acceleration_score(
            x["views_per_day"], average
        )
    velocity = normalize_scores([x["views_per_day"] for x in candidates])
    engagement = normalize_scores([x["engagement_rate"] for x in candidates])
    acceleration = normalize_scores([x["acceleration_score"] for x in candidates])
    keywords = [x["title_keywords"] for x in candidates]
    results = []
    for i, x in enumerate(candidates):
        _, level = calculate_competition_score(x["title_keywords"], keywords)
        score = round(
            min(
                100,
                max(
                    0,
                    velocity[i] * 0.35
                    + engagement[i] * 0.20
                    + x["recency_weight"] * 100 * 0.25
                    + acceleration[i] * 0.20,
                ),
            ),
            2,
        )
        results.append(
            {
                "video_id": x["video_id"],
                "title": x["title"],
                "channel": x["channel"],
                "views": x["stats"]["views"],
                "published_at": x["published_at"],
                "trend_score": score,
                "views_per_day": round(x["views_per_day"], 2),
                "engagement_rate": round(x["engagement_rate"], 4),
                "recency_days": x["days"],
                "competition_level": level,
            }
        )
    return sorted(results, key=lambda x: x["trend_score"], reverse=True)


def extract_trending_topics(videos, top_n=3):
    scores = {}
    for video in videos:
        words = [
            w
            for w in re.findall(r"\b[a-zA-Z]{3,}\b", video.get("title", "").lower())
            if w not in STOPWORDS
        ]
        for i in range(len(words) - 1):
            scores.setdefault(f"{words[i]} {words[i+1]}", []).append(
                video.get("trend_score", 0)
            )
    ranked = sorted(
        ((p, sum(s) / len(s)) for p, s in scores.items() if len(s) >= 2),
        key=lambda x: x[1],
        reverse=True,
    )
    return [p for p, _ in ranked[:top_n]]


def calculate_trend_score(video, stats):
    views = stats.get("views", 0)
    likes = stats.get("likes", 0)
    comments = stats.get("comments", 0)
    try:
        hours = max(
            (
                datetime.now(timezone.utc)
                - datetime.fromisoformat(video["published_at"].replace("Z", "+00:00"))
            ).total_seconds()
            / 3600,
            1,
        )
    except Exception:
        hours = 24
    return round(
        (
            min(views / hours / 1000, 100) * 0.6
            + (likes / max(views, 1) * 100) * 0.2
            + (comments / max(views, 1) * 100) * 0.2
        ),
        2,
    )
