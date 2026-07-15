from fastapi import APIRouter
from services.mongodb import getDb
from services.redisclient import getRedis
from services.qdrantclient import getQdrantClient

router=APIRouter()


@router.get("/health")
async def health():
    deps={}
    try:
        db=getDb()
        await db.command("ping")
        deps["mongodb"]="ok"
    except Exception:
        deps["mongodb"]="error"
    r=getRedis()
    if r:
        try:
            await r.ping()
            deps["redis"]="ok"
        except Exception:
            deps["redis"]="error"
    else:
        deps["redis"]="unavailable"
    q=getQdrantClient()
    deps["qdrant"]="ok" if q else "unavailable"
    overall="healthy" if deps.get("mongodb")=="ok" else "degraded"
    return{"status":overall,"dependencies":deps,"version":"2.0.0"}
