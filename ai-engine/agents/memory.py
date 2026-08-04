from tools.mongodbtools import fetchChatHistory,saveChatMessage,oid
from langchain_core.messages import HumanMessage,AIMessage
import logging

logger=logging.getLogger(__name__)
from bson import ObjectId

async def loadMemory(sessionId,limit=50):
    history=await fetchChatHistory(sessionId,limit)
    messages=[]
    for h in history:
        role=h.get('role','user')
        content=h.get('content','')
        if role=='user':
            messages.append(HumanMessage(content=content))
        elif role=='assistant':
            messages.append(AIMessage(content=content))
    return messages

async def saveMemory(sessionId,userId,role,content,context=None,metadata=None):
    data={
        "sessionId":sessionId,
        "userId":oid(userId) if userId and userId!="system" else userId,
        "role":role,
        "content":content,
        "context":context or {},
        "metadata":metadata or {}
    }
    return await saveChatMessage(data)