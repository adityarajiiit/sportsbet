from fastapi import APIRouter,HTTPException,Request
from agents.supervisor import getAgent
from agents.state import makeDefaultState
from services.redisclient import cacheGet,cacheSet
from config.settings import settings
from config.constants import INTENT_STOCK_PREDICT
from models.schemas import validateStockPredictRequest
import time,logging

router=APIRouter()
logger=logging.getLogger(__name__)


@router.post("/stock-predict/{stockId}")
async def predictStock(stockId:str,request:Request):
    body=await request.json()
    params=validateStockPredictRequest(body)
    cacheKey=f"stock-predict:{stockId}"
    cached=await cacheGet(cacheKey)
    if cached:
        return{"success":True,"data":cached,"error":""}
    agent=getAgent()
    if agent is None:
        raise HTTPException(status_code=503,detail="AI agent not ready")
    startTime=time.time()
    try:
        state=makeDefaultState({
            "query":params["query"] or f"Predict stock {stockId}",
            "intent":INTENT_STOCK_PREDICT,
            "confidence":1.0,
            "slots":{"stockId":stockId},
            "context":{**params["context"],"stockId":stockId,"pageType":"stock"},
            "user_id":params["userId"],
        })
        result=await agent.ainvoke(state)
    except Exception as e:
        logger.error(f"Stock prediction failed: {e}")
        raise HTTPException(status_code=500,detail=str(e))
    output=result.output if hasattr(result,"output") else result.get("output",{})
    output["_meta"]={
        **(output.get("_meta",{})),
        "latencyMs":round((time.time()-startTime)*1000),
        "stockId":stockId,
    }
    await cacheSet(cacheKey,output,ttl=settings.STOCK_CACHE_TTL)
    return{"success":True,"data":output,"error":""}
