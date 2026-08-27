from datetime import datetime, timezone, timedelta
import httpx
from fastapi import HTTPException
from ..config import GEMINI_API_KEY, YOUTUBE_API_KEY, logger
from ..state.cache import cached_api_call


def check_api_key(provider="gemini"):
    key = YOUTUBE_API_KEY if provider == "youtube" else GEMINI_API_KEY
    name = "YOUTUBE_API_KEY" if provider == "youtube" else "GEMINI_API_KEY"
    if not key:
        raise HTTPException(
            status_code=500, detail={"error": f"{name} environment variable is not set"}
        )


@cached_api_call
async def search_youtube_videos(keywords, max_results=50, max_age_days=5):
    check_api_key("youtube")
    videos = []
    per_keyword = max(15, max_results // len(keywords))
    after = (datetime.now(timezone.utc) - timedelta(days=max_age_days)).isoformat()
    async with httpx.AsyncClient() as client:
        for keyword in keywords:
            try:
                response = await client.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": keyword,
                        "type": "video",
                        "order": "relevance",
                        "maxResults": per_keyword,
                        "publishedAfter": after,
                        "key": YOUTUBE_API_KEY,
                    },
                )
                response.raise_for_status()
                for item in response.json().get("items", []):
                    video = {
                        "video_id": item["id"]["videoId"],
                        "title": item["snippet"]["title"],
                        "channel": item["snippet"]["channelTitle"],
                        "published_at": item["snippet"]["publishedAt"],
                    }
                    if not any(v["video_id"] == video["video_id"] for v in videos):
                        videos.append(video)
            except httpx.HTTPError as exc:
                logger.error(f"YouTube search error for keyword '{keyword}': {exc}")
    return videos[:max_results]


async def get_video_statistics(video_ids):
    check_api_key("youtube")
    stats = {}
    async with httpx.AsyncClient() as client:
        for i in range(0, len(video_ids), 50):
            try:
                response = await client.get(
                    "https://www.googleapis.com/youtube/v3/videos",
                    params={
                        "part": "statistics",
                        "id": ",".join(video_ids[i : i + 50]),
                        "key": YOUTUBE_API_KEY,
                    },
                )
                response.raise_for_status()
                for item in response.json().get("items", []):
                    s = item.get("statistics", {})
                    stats[item["id"]] = {
                        "views": int(s.get("viewCount", 0)),
                        "likes": int(s.get("likeCount", 0)),
                        "comments": int(s.get("commentCount", 0)),
                    }
            except httpx.HTTPError as exc:
                logger.error(f"YouTube statistics error: {exc}")
    return stats


@cached_api_call
async def get_video_details(video_id):
    check_api_key("youtube")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "part": "snippet,statistics",
                    "id": video_id,
                    "key": YOUTUBE_API_KEY,
                },
            )
            response.raise_for_status()
            items = response.json().get("items", [])
            if items:
                item = items[0]
                snippet = item.get("snippet", {})
                stats = item.get("statistics", {})
                return {
                    "title": snippet.get("title", "Unknown"),
                    "description": snippet.get("description", "")[:500],
                    "channel": snippet.get("channelTitle", "Unknown"),
                    "tags": snippet.get("tags", [])[:10],
                    "views": int(stats.get("viewCount", 0)),
                    "likes": int(stats.get("likeCount", 0)),
                    "comments": int(stats.get("commentCount", 0)),
                }
        except httpx.HTTPError as exc:
            logger.error(f"YouTube video details error: {exc}")
    return None


@cached_api_call
async def resolve_channel_id(identifier, id_type):
    check_api_key("youtube")
    if id_type == "id":
        return identifier
    async with httpx.AsyncClient() as client:
        try:
            params = {
                "part": "snippet",
                "q": f"@{identifier}" if id_type == "handle" else identifier,
                "type": "channel",
                "maxResults": 1,
                "key": YOUTUBE_API_KEY,
            }
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search", params=params
            )
            response.raise_for_status()
            items = response.json().get("items", [])
            if items:
                return items[0]["snippet"]["channelId"]
            if id_type == "handle":
                response = await client.get(
                    "https://www.googleapis.com/youtube/v3/channels",
                    params={
                        "part": "id",
                        "forHandle": identifier,
                        "key": YOUTUBE_API_KEY,
                    },
                )
                response.raise_for_status()
                items = response.json().get("items", [])
                if items:
                    return items[0]["id"]
            raise HTTPException(
                status_code=404, detail={"error": f"Channel not found: {identifier}"}
            )
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=500, detail={"error": f"Failed to resolve channel: {exc}"}
            )


@cached_api_call
async def get_channel_metadata(channel_id):
    check_api_key("youtube")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/channels",
                params={
                    "part": "snippet,statistics,contentDetails",
                    "id": channel_id,
                    "key": YOUTUBE_API_KEY,
                },
            )
            response.raise_for_status()
            items = response.json().get("items", [])
            if not items:
                raise HTTPException(
                    status_code=404, detail={"error": "Channel not found"}
                )
            item = items[0]
            snippet = item["snippet"]
            return {
                "channel_id": channel_id,
                "title": snippet["title"],
                "thumbnail": snippet["thumbnails"].get("medium", {}).get("url"),
                "subscriber_count": int(item["statistics"].get("subscriberCount", 0)),
                "video_count": int(item["statistics"].get("videoCount", 0)),
                "uploads_playlist_id": item["contentDetails"]["relatedPlaylists"][
                    "uploads"
                ],
            }
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=500,
                detail={"error": f"Failed to fetch channel data: {exc}"},
            )


async def get_playlist_videos(playlist_id, max_results=20):
    check_api_key("youtube")
    videos = []
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/playlistItems",
                params={
                    "part": "snippet,contentDetails",
                    "playlistId": playlist_id,
                    "maxResults": max_results,
                    "key": YOUTUBE_API_KEY,
                },
            )
            response.raise_for_status()
            for item in response.json().get("items", []):
                thumbs = item["snippet"].get("thumbnails", {})
                videos.append(
                    {
                        "video_id": item["contentDetails"]["videoId"],
                        "title": item["snippet"]["title"],
                        "published_at": item["snippet"]["publishedAt"],
                        "thumbnail": thumbs.get("medium", {}).get("url")
                        or thumbs.get("default", {}).get("url")
                        or thumbs.get("high", {}).get("url"),
                    }
                )
            if videos:
                stats = await get_video_statistics([v["video_id"] for v in videos])
                for v in videos:
                    s = stats.get(v["video_id"], {})
                    v.update(
                        views=s.get("views", 0),
                        likes=s.get("likes", 0),
                        comments=s.get("comments", 0),
                    )
            return videos
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=500, detail={"error": f"Failed to fetch videos: {exc}"}
            )
