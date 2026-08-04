from fastapi import APIRouter,HTTPException,Request
from fastapi.responses import StreamingResponse
from agents.nodes.chatassistant import chatAssistantStream
from agents.state import makeDefaultState
from config.constants import INTENT_CHAT
from rag.retriever import retrieveChunks
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
            ragChunks=[]
            if params["userId"]:
                try:
                    userProfile=await fetchUserProfile(params["userId"]) or {}
                    userWallet=await fetchUserWallet(params["userId"]) or {}
                except Exception:
                    pass
            try:
                ragChunks=await retrieveChunks(params["query"],topK=3)
            except Exception:
                pass
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
                "rag_chunks":ragChunks,
            })
            async for token in chatAssistantStream(state):
                yield "data:"+json.dumps({"type":"token","content":token})+"\n\n"
            yield "data:"+json.dumps({"type":"done"})+"\n\n"
        except Exception as e:
            logger.error(f"Chat stream error {e}")
            yield "data:"+json.dumps({"type":"error","message":str(e)})+"\n\n"
    return StreamingResponse(eventStream(),media_type="text/event-stream",headers={"Cache-Control":"no-cache","Connection":"keep-alive"})
