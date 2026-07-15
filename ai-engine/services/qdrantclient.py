from qdrant_client import AsyncQdrantClient
from config.settings import settings
import logging

logger=logging.getLogger(__name__)
_client:AsyncQdrantClient|None=None

async def newQdrant():
    global _client
    try:
        _client=AsyncQdrantClient(
            url=settings.QDRANT_HOST,
            api_key=settings.QDRANT_API_KEY
        )
        collections=await _client.get_collections()
        logger.info(f"connected to Qdrant collections: {collections}")
    except Exception as e:
        logger.error(f"qdrant error: {e}")
        _client=None

def getQdrantClient()->AsyncQdrantClient|None:
    return _client

async def closeQdrantClient():
    global _client
    if _client is not None:
        await _client.close()
