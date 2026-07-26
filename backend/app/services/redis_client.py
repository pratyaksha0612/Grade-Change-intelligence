import json
import logging
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        try:
            self.redis = redis.from_url(
                settings.REDIS_URI,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            logger.info(f"Connected to Redis at {settings.REDIS_URI}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            self.redis = None

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def set_value(self, key: str, value: Any, expire_seconds: int = None):
        if not self.redis:
            return
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            await self.redis.set(key, value, ex=expire_seconds)
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {str(e)}")

    async def get_value(self, key: str) -> Optional[str]:
        if not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {str(e)}")
            return None

# Singleton instance
redis_client = RedisClient()
