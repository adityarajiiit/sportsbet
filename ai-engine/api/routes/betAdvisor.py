from fastapi import APIRouter,HTTPException
from fastapi.responses import StreamingResponse
from agents.supervisor import getAgent
from agents.state import makeDefaultState
from config.constants import INTENT_BET_ADVICE
import json,logging

router=APIRouter()
logger=logging.getLogger(__name__)


@router.get("/bet-advisor/{matchId}")
async def betAdvisorStream(matchId:str,userId:str="",query:str=""):
    agent=getAgent()
    if agent is None:
        raise HTTPException(status_code=503,detail="AI agent not ready")
    async def eventStream():
        try:
            yield f"data: {json.dumps({'type':'start','matchId':matchId})}\n\n"
            state=makeDefaultState({
                "query":query or f"Give betting advice for match {matchId}",
                "intent":INTENT_BET_ADVICE,
                "confidence":1.0,
                "slots":{"matchId":matchId},
                "context":{"matchId":matchId,"pageType":"match"},
                "user_id":userId,
            })
            result=await agent.ainvoke(state)
            output=result.output if hasattr(result, "output") else result.get("output",{})
            yield f"data: {json.dumps({'type':'result','data':output},default=str)}\n\n"
            yield f"data: {json.dumps({'type':'done'})}\n\n"
        except Exception as e:
            logger.error(f"Bet advisor error: {e}")
            yield f"data: {json.dumps({'type':'error','message':str(e)})}\n\n"
    return StreamingResponse(
        eventStream(),
        media_type="text/event-stream",
        headers={"Cache-Control":"no-cache","Connection":"keep-alive"},
    )
