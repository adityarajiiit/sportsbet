from motor.motor_asyncio import AsyncIOMotorClient,AsyncIOMotorDatabase
from config.settings import settings
import logging

logger=logging.getLogger(__name__)

_client:AsyncIOMotorClient|None=None
_db:AsyncIOMotorDatabase|None=None

async def connectDb():
    global _client,_db
    _client=AsyncIOMotorClient(settings.MONGODB_URL)
    _db=_client[settings.MONGODB_DB_NAME]
    await _client.admin.command('ping')
    logger.info("Connected to MongoDB")

def getDb()->AsyncIOMotorDatabase:
    if _db is None:
        raise Exception("Database not connected")
    return _db

async def closeDb():
    global _client
    if _client:
        _client.close()
        logger.info("closing connection mongodb")
