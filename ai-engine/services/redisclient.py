import redis.asyncio as redis
from config.settings import settings
import json
import logging

logger=logging.getLogger(__name__)
_redis:redis.Redis|None=None

async def newRedisClient():
    global _redis
    try:
        _redis=redis.from_url(settings.REDIS_URI,decode_responses=True)
        await _redis.ping()
        logger.info("Connected to Redis")
    except Exception as e:
        logger.error(f"redis error: {e}")
        _redis=None
        raise e

def getRedis()->redis.Redis|None:
    return _redis

async def cacheGet(key:str)->dict|None:
    r=getRedis()
    if r is None:
        return None
    try:
        val=await r.get(key)
        if val is None:
            return None
        return json.loads(val)
    except Exception as e:
        return None

async def cacheSet(key:str,value:dict,ttl:int=300):
    r=getRedis()
    if r is None:
        return
    try:
        await r.set(key,json.dumps(value,default=str),ex=ttl)
    except Exception:
        pass

async def rateLimitCheck(userId:str,limit:int=30)->bool:
    r=getRedis()
    if r is None:
        return True
    try:
        key=f"rate-{userId}"
        count=await r.incr(key)
        if count==1:
            await r.expire(key,60)
        if count>limit:
            return False
        return True
    except Exception:
        return True

async def closeRedisClient():
    r=getRedis()
    if r is not None:
        await r.close()

rate_limit_check=rateLimitCheck
