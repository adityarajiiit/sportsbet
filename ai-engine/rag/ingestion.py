import hashlib
from datetime import datetime, timedelta
from uuid import uuid4
from qdrant_client.models import PointStruct,VectorParams,Distance
from rag.chunker import chunk_document
from rag.embedder import embed_texts
from services.qdrantclient import getQdrantClient
from services.mongodb import getDb
from config.settings import settings
from config.constants import COLL_SCRAPED_DOC,QDRANT_COLLECTION
import logging

logger=logging.getLogger(__name__)

async def create_collection():
    client=getQdrantClient()
    if client is None:
        return
    try:
       collections=await client.get_collections()
       names=[c.name for c in collections.collections]
       if QDRANT_COLLECTION not in names:
           await client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(
                size=settings.EMBEDDING_DIMENSION,
                distance=Distance.COSINE
            )
           )
           logger.info(f"Created Qdrant collection {QDRANT_COLLECTION}")
    except Exception as e:
        logger.error(f"failed to create collection {e}")

async def ingest_document(
    source:str,
    url:str,
    title:str,
    content:str,
    category:str,
    entities:dict=None,
)->dict:
    content_hash=hashlib.md5(content.encode()).hexdigest()
    db=getDb()
    existing=await db [COLL_SCRAPED_DOC].find_one({"hash":content_hash})
    if existing:
        return{"status":"skipped","reason":"duplicate"}
    chunks=chunk_document(content,metadata={
        "source":source,
        "url":url,
        "title":title,
        "category":category,
    })
    if not chunks:
        return {"status":"skipped","reason":"no chunks"}
    texts=[c["text"] for c in chunks]
    embeddings=await embed_texts(texts)
    client=getQdrantClient()
    vectorids=[]
    if client:
        await create_collection()
        points=[]
        for i,(chunk,emb) in enumerate(zip(chunks,embeddings)):
            pid=str(uuid4())
            vectorids.append(pid)
            points.append(PointStruct(
                id=pid,
                vector=emb,
                payload={
                    "text":chunk["text"],
                    "source":source,
                    "url":url,
                    "title":title,
                    "category":category,
                    "chunk_index":i,
                    "ingested_at":datetime.utcnow().isoformat(),
                },
            ))
        await client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=points,
        )
    await db[COLL_SCRAPED_DOC].insert_one({
        "source":source,
        "url":url,
        "title":title,
        "content":content,
        "hash":content_hash,
        "category":category,
        "entities":entities or {},
        "vectorIds":vectorids,
        "isEmbedded":True,
        "scrapedAt":datetime.utcnow(),
        "expiresAt":datetime.utcnow() + timedelta(days=7),
    })
    logger.info(f"ingested {title} with {len(chunks)} chunks")
    return {"status":"success","chunks":len(chunks)}
    