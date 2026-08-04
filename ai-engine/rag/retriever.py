from qdrant_client.models import ScoredPoint,Filter,FieldCondition,MatchValue
from rag.embedder import embed_query
from services.qdrantclient import getQdrantClient
from config.constants import QDRANT_COLLECTION
from typing import Optional
import logging

logger=logging.getLogger(__name__)

async def hybrid_search(
    query:str,
    top_k:int=10,
    category:Optional[str]=None,
    score_threshold:float=0.5
)->list[dict]:
    client=getQdrantClient()
    if client is None:
        return []
    try:
        collections=await client.get_collections()
        if QDRANT_COLLECTION not in [c.name for c in collections.collections]:
            return []
    except Exception:
        return []
    conditions=[]
    if category:
        conditions.append(
            FieldCondition(
                key="category",
                match=MatchValue(value=category)
            )
        )
    search_filter=Filter(
        must=conditions
    ) if conditions else None
    try:
        query_vector=await embed_query(query)
        response=await client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=query_vector,
            query_filter=search_filter,
            limit=top_k*2,
            score_threshold=score_threshold
        )
        results:list[ScoredPoint] = response.points
    except Exception as e:
        logger.warning(f"search failed: {e}")
        return []
    return [
        {
            "text":(pt.payload or {}).get("text",""),
            "score":pt.score,
            "source":(pt.payload or {}).get("source",""),
            "title":(pt.payload or {}).get("title",""),
            "category":(pt.payload or {}).get("category","")
        }
        for pt in results
    ][:top_k]

async def retrieveChunks(query,topK=5,category=None):
    hits=await hybrid_search(query,top_k=topK,category=category)
    return[
        f"[{h['source']} | {h['title']} | score:{h['score']:.2f}]\n{h['text']}"
        for h in hits
    ]
