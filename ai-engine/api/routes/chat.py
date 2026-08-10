from fastapi import APIRouter,HTTPException,Request
from fastapi.responses import StreamingResponse
from agents.nodes.chatassistant import chatAssistantStream
from agents.nodes.router import detect_intent_only
from agents.nodes.context import contextAdder
from agents.supervisor import getAgent
from agents.state import makeDefaultState
from config.constants import INTENT_CHAT
from tools.mongodbtools import fetchUserProfile,fetchUserWallet
from models.schemas import validateChatRequest
import json,logging
router=APIRouter()
logger=logging.getLogger(__name__)
@router.post("/chat")
async def chatStream(request:Request):
    body=await request.json()
    try:
        params=validateChatRequest(body)
    except Exception as e:
        raise HTTPException(status_code=400,detail=str(e))
    async def eventStream():
        try:
            yield "data:"+json.dumps({"type":"start","sessionId":params["sessionId"]})+"\n\n"
            userProfile={}
            userWallet={}
            if params["userId"]:
                try:
                    userProfile=await fetchUserProfile(params["userId"]) or {}
                    userWallet=await fetchUserWallet(params["userId"]) or {}
                except Exception:
                    pass
            intentResult=await detect_intent_only(params["query"],params["context"])
            intent=intentResult.get("intent",INTENT_CHAT)
            confidence=intentResult.get("confidence",0.5)
            if intent!=INTENT_CHAT and confidence>=0.7:
                yield "data:"+json.dumps({"type":"analyzing"})+"\n\n"
                agent=getAgent()
                if agent is None:
                    raise Exception("AI agent not ready")
                state=makeDefaultState({
                    "query":params["query"],
                    "intent":intent,
                    "confidence":confidence,
                    "slots":intentResult.get("slots",{}),
                    "context":{
                        **params["context"],
                        "sessionId":params["sessionId"],
                    },
                    "user_id":params["userId"],
                    "user_profile":userProfile,
                    "user_wallet":userWallet,
                })
                enriched=await contextAdder(state)
                state.update(enriched)
                result=await agent.ainvoke(state)
                output=result.output if hasattr(result,"output") else result.get("output",{})
                llmState=makeDefaultState({
                    **state,
                    "query":f"Based on this analysis, answer the user's question in a conversational way. User asked: {params['query']}\n\nAnalysis data: {json.dumps(output,default=str)[:3000]}",
                    "intent":INTENT_CHAT,
                    "ctx_live_matches":state.get("ctx_live_matches",[]),
                    "ctx_upcoming_matches":state.get("ctx_upcoming_matches",[]),
                    "ctx_current_odds":state.get("ctx_current_odds",{}),
                    "ctx_stock_data":state.get("ctx_stock_data",{}),
                    "ctx_price_history":state.get("ctx_price_history",[]),
                })
                async for token in chatAssistantStream(llmState):
                    yield "data:"+json.dumps({"type":"token","content":token})+"\n\n"
            else:
                state=makeDefaultState({
                    "query":params["query"],
                    "intent":INTENT_CHAT,
                    "confidence":1.0,
                    "context":{
                        **params["context"],
                        "sessionId":params["sessionId"],
                    },
                    "user_id":params["userId"],
                    "user_profile":userProfile,
                    "user_wallet":userWallet,
                })
                enriched=await contextAdder(state)
                state.update(enriched)
                async for token in chatAssistantStream(state):
                    yield "data:"+json.dumps({"type":"token","content":token})+"\n\n"
            yield "data:"+json.dumps({"type":"done"})+"\n\n"
        except Exception as e:
            logger.error(f"Chat stream error {e}")
            yield "data:"+json.dumps({"type":"error","message":str(e)})+"\n\n"
    return StreamingResponse(eventStream(),media_type="text/event-stream",headers={"Cache-Control":"no-cache","Connection":"keep-alive"})
