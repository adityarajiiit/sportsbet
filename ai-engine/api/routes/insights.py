from fastapi import APIRouter,HTTPException,Request
from agents.supervisor import getAgent
from agents.state import makeDefaultState
from services.redisclient import cacheGet,cacheSet
from tools.mongodbtools import saveAiInsight
from config.settings import settings
from config.constants import INTENT_MATCH_INSIGHT
from models.schemas import validateInsightRequest
from datetime import datetime,timedelta
import time,logging

router=APIRouter()
logger=logging.getLogger(__name__)


@router.post("/insights/{matchId}")
async def generateInsight(matchId:str,request:Request):
    body=await request.json()
    params=validateInsightRequest(body)
    cacheKey=f"insight:{matchId}"
    # cached=await cacheGet(cacheKey)
    # if cached:
    #     return{"success":True,"data":cached,"error":""}
    agent=getAgent()
    if agent is None:
        raise HTTPException(status_code=503,detail="AI agent not ready")
    startTime=time.time()
    try:
        state=makeDefaultState({
            "query":params["query"] or f"Analyze match {matchId}",
            "intent":INTENT_MATCH_INSIGHT,
            "confidence":1.0,
            "slots":{"matchId":matchId},
            "context":{**params["context"],"matchId":matchId,"pageType":"match"},
            "user_id":params["userId"],
        })
        result=await agent.ainvoke(state)
    except Exception as e:
        logger.error(f"Insight generation failed: {e}")
        raise HTTPException(status_code=500,detail=str(e))
    output=result.output if hasattr(result, "output") else result.get("output",{})
    output["_meta"]={
        **(output.get("_meta",{})),
        "latencyMs":round((time.time()-startTime)*1000),
        "matchId":matchId,
    }
    await cacheSet(cacheKey,output,ttl=settings.INSIGHT_CACHE_TTL)
    try:
        await saveAiInsight({
            "matchId":matchId,
            "type":"match-insight",
            "title":output.get("summary","Match Insight")[:100],
            "content":output,
            "summary":output.get("summary",""),
            "score":output.get("_meta",{}).get("qualityScore",0),
            "metadata":output.get("_meta",{}),
            "expiresAt":datetime.utcnow()+timedelta(minutes=30),
        })
    except Exception:
        pass
    return{"success":True,"data":output,"error":""}
