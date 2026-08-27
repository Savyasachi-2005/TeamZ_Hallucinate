import re
from datetime import datetime, timezone
from .text import STOPWORDS, extract_themes_from_titles


def calculate_consistency_score(upload_dates):
    if len(upload_dates) < 3:
        return 50
    dates = sorted(
        datetime.fromisoformat(d.replace("Z", "+00:00")) for d in upload_dates
    )
    gaps = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
    if not gaps:
        return 50
    avg = sum(gaps) / len(gaps)
    variance = sum((g - avg) ** 2 for g in gaps) / len(gaps)
    consistency = 100
    if avg > 0:
        consistency -= min((variance**0.5) / avg * 30, 40)
    consistency -= sum(1 for g in gaps if g > 30) * 15
    return max(0, min(100, int(consistency)))


def calculate_engagement_stability(rates):
    if len(rates) < 5:
        return 50
    rates = rates[:20]
    avg = sum(rates) / len(rates)
    if avg == 0:
        return 50
    cv = (sum((r - avg) ** 2 for r in rates) / len(rates)) ** 0.5 / avg
    half = len(rates) // 2
    recent = sum(rates[:half]) / half if half else 0
    older = sum(rates[half:]) / len(rates[half:])
    bonus = 10 if recent > older * 1.1 else -10 if recent < older * 0.9 else 0
    return max(0, min(100, int(100 - min(cv * 100, 50) + bonus)))


def calculate_topic_focus_score(themes, titles):
    if len(titles) < 5:
        return 50
    recent = extract_themes_from_titles(titles[:5])
    older = extract_themes_from_titles(titles[5:])
    theme_words = [w.lower() for w in themes]
    words = []
    for title in titles:
        words.extend(
            w
            for w in re.findall(r"\b[a-zA-Z]{3,}\b", title.lower())
            if w not in STOPWORDS
        )
    if not words:
        return 50
    score = sum(w in theme_words for w in words) / len(words) * 100
    if older:
        score -= (5 - len(set(recent) & set(older))) * 5
    return max(0, min(100, int(score)))


def determine_growth_momentum(rates, dates):
    if len(rates) < 10 or len(dates) < 10:
        return "Stable"
    recent = sum(rates[:5]) / 5
    older = sum(rates[5:10]) / 5
    if older == 0:
        return "Stable"
    change = (recent - older) / older
    return "Improving" if change > 0.15 else "Declining" if change < -0.15 else "Stable"
