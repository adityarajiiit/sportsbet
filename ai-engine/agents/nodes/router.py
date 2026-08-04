from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from config.settings import settings
from config.constants import (
    ALL_INTENTS,
    INTENT_CHAT
)
import json,logging

logger=logging.getLogger(__name__)
ROUTER_PROMPT="""You are an intent classifier for a sports betting platform.

Given the user query and page context, classify the intent into exactly one of:
- match-insight: User wants pre-match analysis, H2H, team form, match preview
- bet-advice: User wants betting advice, odds analysis, EV calculations
- stock-predict: User wants stock price prediction or technical analysis
- smart-alert: System wants to generate alerts for live match events
- chat: General conversation, questions, or anything that doesn't fit above

Page context: {page_context}
User query: {query}

Respond with ONLY a JSON object:
{{"intent": "one-of-the-above", "confidence": 0.0-1.0, "slots": {{"matchId": "if-found", "stockId": "if-found", "teamName": "if-found"}}}}
"""
async def routerNode(state):
    if state.get("intent") and state.get("confidence",0)>=1.0:
        return{}
    query=state.get("query","")
    ctx=state.get("context",{})

    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.0
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",ROUTER_PROMPT),
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "query":query,
            "page_context":json.dumps(ctx)
        })
        content="".join(str(item) for item in result.content).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:]
        parsed=json.loads(content)
        intent=parsed.get("intent",INTENT_CHAT)
        if intent not in ALL_INTENTS:
            intent=INTENT_CHAT
        return{
            "intent":intent,
            "confidence":parsed.get("confidence",0.5),
            "slots":parsed.get("slots",{})
        }
    except Exception as e:
        logger.error(f"router error {e}")
        return{
            "intent":INTENT_CHAT,
            "confidence":0.1,
            "slots":{}
        }
