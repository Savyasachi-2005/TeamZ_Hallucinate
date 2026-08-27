import hashlib
from functools import wraps
from time import time
from typing import Any, Optional
from ..config import logger

global_cache = {}
CACHE_TTL = {"trends": 600, "channel": 1200, "analysis": 1800, "youtube_api": 900}


def get_from_cache(key: str) -> Optional[Any]:
    entry = global_cache.get(key)
    if entry is None:
        return None
    if time() > entry["expiry"]:
        del global_cache[key]
        logger.info(f"Cache EXPIRED: {key}")
        return None
    logger.info(f"Cache HIT: {key}")
    return entry["data"]


def set_cache(key: str, data: Any, ttl_seconds: int):
    global_cache[key] = {"data": data, "expiry": time() + ttl_seconds}
    logger.info(f"Cache SET: {key} (TTL={ttl_seconds}s)")


def cached_api_call(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        raw = str(args) + str(sorted(kwargs.items()))
        key = f"youtube_api:{func.__name__}:{hashlib.md5(raw.encode()).hexdigest()}"
        cached = get_from_cache(key)
        if cached is not None:
            return cached
        logger.info(f"Cache MISS for {func.__name__} - calling YouTube API")
        result = await func(*args, **kwargs)
        set_cache(key, result, CACHE_TTL["youtube_api"])
        return result

    return wrapper
