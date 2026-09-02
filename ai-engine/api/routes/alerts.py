from fastapi import APIRouter,HTTPException,Request
from agents.supervisor import getAgent
from agents.state import makeDefaultState
from tools.mongodbtools import fetchLiveMatches,fetchMatch
from config.constants import INTENT_SMART_ALERT
from services.mongodb import getDb
from config.constants import COLL_AI_INSIGHT
from models.schemas import validateAlertTriggerRequest
import logging

router=APIRouter()
logger=logging.getLogger(__name__)


@router.get("/alerts")
async def getAlerts(userId:str="",limit:int=20):
    db=getDb()
    cursor=db[COLL_AI_INSIGHT].find(
        {"type":"smart-alert"}
    ).sort("createdAt",-1).limit(limit)
    alerts=[]
    async for a in cursor:
        a["_id"]=str(a["_id"])
        if "matchId" in a and a["matchId"]:
            a["matchId"]=str(a["matchId"])
        alerts.append(a)
    return{"success":True,"data":{"alerts":alerts},"error":""}


@router.post("/alerts/trigger")
async def triggerAlert(request:Request):
    body=await request.json()
    params=validateAlertTriggerRequest(body)
    match=await fetchMatch(params["matchId"])
    if not match:
        raise HTTPException(status_code=404,detail="Match not found")
    agent=getAgent()
    if agent is None:
        raise HTTPException(status_code=503,detail="AI agent not ready")
    try:
        state=makeDefaultState({
            "query":"Generate smart alert for this match",
            "intent":INTENT_SMART_ALERT,
            "confidence":1.0,
            "slots":{"matchId":params["matchId"]},
            "context":{"matchId":params["matchId"],"pageType":"match"},
            "user_id":"system",
            "match_data":match,
            "live_score":match.get("liveScore",{}),
        })
        result=await agent.ainvoke(state)
        return{"success":True,"data":result.output if hasattr(result, "output") else result.get("output",{}),"error":""}
    except Exception as e:
        logger.error(f"Alert trigger failed: {e}")
        raise HTTPException(status_code=500,detail=str(e))
