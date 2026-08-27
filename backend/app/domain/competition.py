def compute_competitor_gap(
    creator_analytics, creator_themes, competitor_analytics, competitor_themes
):
    creator = creator_analytics.get("average_engagement_rate", 0)
    competitor = competitor_analytics.get("average_engagement_rate", 0)
    diff = competitor - creator
    engagement = f"+{diff:.1f}%" if diff > 0 else f"{diff:.1f}%"
    creator_freq = creator_analytics.get("upload_frequency_per_month", 0)
    comp_freq = competitor_analytics.get("upload_frequency_per_month", 0)
    if creator_freq > 0:
        ratio = comp_freq / creator_freq
        posting = (
            f"Competitor posts {ratio:.1f}x more frequently"
            if ratio > 1.2
            else (
                f"You post {1/ratio:.1f}x more frequently"
                if ratio < 0.8
                else "Similar posting frequency"
            )
        )
    else:
        posting = "Insufficient data"
    creator_set = {t.lower() for t in creator_themes}
    comp_set = {t.lower() for t in competitor_themes}
    union = creator_set | comp_set
    return {
        "engagement_gap": engagement,
        "posting_gap": posting,
        "theme_overlap_percentage": (
            int(len(creator_set & comp_set) / len(union) * 100) if union else 0
        ),
        "missed_topics": list(comp_set - creator_set)[:5],
    }


def detect_missed_trends(creator_themes, niche_keywords, trending_videos):
    if not trending_videos or not creator_themes:
        return []
    titles = [v.get("title", "") for v in trending_videos]
    phrases = {}
    words = {}
    creator = {t.lower() for t in creator_themes}
    for title in titles:
        tokens = __import__("re").findall(r"\b[a-zA-Z]{4,}\b", title.lower())
        for i in range(len(tokens) - 1):
            phrase = f"{tokens[i]} {tokens[i+1]}"
            if not any(t.lower() in phrase for t in creator) and len(phrase) > 8:
                phrases[phrase] = phrases.get(phrase, 0) + 1
        for word in __import__("re").findall(r"\b[a-zA-Z]{5,}\b", title.lower()):
            words[word] = words.get(word, 0) + 1
    missed = []
    for phrase, count in sorted(phrases.items(), key=lambda x: x[1], reverse=True):
        if count >= 2:
            missed.append(
                {
                    "keyword": phrase.title(),
                    "trend_score": round(min(95, count / len(titles) * 400), 1),
                    "reason": f"Trending topic appearing in {count} videos, not covered in your channel",
                }
            )
    for word, count in sorted(words.items(), key=lambda x: x[1], reverse=True)[:15]:
        if (
            word not in creator
            and count >= 3
            and not any(word in m["keyword"].lower() for m in missed)
        ):
            missed.append(
                {
                    "keyword": word.title(),
                    "trend_score": round(min(90, count / len(titles) * 350), 1),
                    "reason": f"High-frequency keyword in {count} trending videos",
                }
            )
    missed.sort(key=lambda x: x["trend_score"], reverse=True)
    return missed[:5]
