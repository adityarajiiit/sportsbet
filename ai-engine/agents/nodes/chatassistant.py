from agents.memory import loadMemory,saveMemory
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from config.settings import settings
import json,logging
logger=logging.getLogger(__name__)
CHAT_SYSTEM_PROMPT="""You are SportsBet AI, a friendly and knowledgeable cricket and sports betting assistant.

You help users with:
- Cricket match analysis, player stats, team form
- Betting advice, odds interpretation, EV calculations
- Stock trading advice for player/team stocks
- General cricket questions and trivia

CURRENT PAGE CONTEXT:
{page_context}

LIVE MATCHES RIGHT NOW:
{live_matches}

UPCOMING MATCHES:
{upcoming_matches}

CURRENT MATCH ON PAGE (if user is viewing a match):
{current_match}

CURRENT ODDS ON PAGE (if available):
{current_odds}

CURRENT STOCK ON PAGE (if user is viewing a stock):
{stock_data}

USER PROFILE:
{user_context}

RELEVANT KNOWLEDGE:
{rag_context}

Guidelines:
- Be concise but thorough
- If the user is viewing a match, proactively reference that match by name with actual scores and odds
- If the user is viewing a stock, reference its actual price and trend
- When giving betting advice, always mention risk and cite real odds
- For stock questions, reference actual price history and trends
- Reference specific data from the context when available — never be generic
- Use cricket terminology naturally
- Format responses with markdown when helpful
- Be enthusiastic about cricket!
"""
async def chatAssistant(state):
    query=state.get("query","")
    userId=state.get("user_id","")
    ctx=state.get("context",{})
    sessionId=ctx.get("sessionId","default")

    historyMessages=await loadMemory(sessionId,limit=10)
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.7
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",CHAT_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human","{query}")
    ])
    chain=prompt|llm
    try:
        result=await chain.ainvoke({
            "page_context":json.dumps(ctx,default=str),
            "live_matches":json.dumps(state.get("ctx_live_matches",[])[:5],default=str)[:1500],
            "upcoming_matches":json.dumps(state.get("ctx_upcoming_matches",[])[:5],default=str)[:1500],
            "current_match":json.dumps(state.get("match_data",{}),default=str)[:2000],
            "current_odds":json.dumps(state.get("ctx_current_odds",{}),default=str)[:1000],
            "stock_data":json.dumps({
                "stock":state.get("ctx_stock_data",{}),
                "recentPrices":state.get("ctx_price_history",[])[-10:]
            },default=str)[:1000],
            "user_context":json.dumps({
                "profile":state.get("user_profile",{}),
                "wallet":state.get("user_wallet",{}),
            },default=str)[:1000],
            "rag_context":"\n\n".join(state.get("rag_chunks",[])),
            "history":historyMessages[-20:],
            "query":query
        })
        response=result.content if isinstance(result.content,str) else ""
    except Exception as e:
        logger.error(f"chat failed {e}")
        response="Trouble connecting to the AI service"
    if userId and userId!="system":
        await saveMemory(sessionId,userId,"user",query,ctx)
        await saveMemory(sessionId,userId,"assistant",response,ctx)
    
    return{
        "output":{
            "response":response,
            "sessionId":sessionId
        }
    }
async def chatAssistantStream(state):
    query=state.get("query","")
    userId=state.get("user_id","")
    ctx=state.get("context",{})
    sessionId=ctx.get("sessionId","default")
    historyMessages=await loadMemory(
        sessionId,
        limit=10
    )
    llm=ChatCerebras(
            model=settings.CEREBRAS_MODEL,
            api_key=settings.CEREBRAS_API_KEY,
            temperature=0.7,
            streaming=True
        )
    prompt=ChatPromptTemplate.from_messages([
        ("system",CHAT_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human","{query}")
    ])
    chain=prompt|llm
    fullResponse=""
    async for chunk in chain.astream({
        "page_context":json.dumps(ctx,default=str),
        "live_matches":json.dumps(state.get("ctx_live_matches",[])[:5],default=str)[:1500],
        "upcoming_matches":json.dumps(state.get("ctx_upcoming_matches",[])[:5],default=str)[:1500],
        "current_match":json.dumps(state.get("match_data",{}),default=str)[:2000],
        "current_odds":json.dumps(state.get("ctx_current_odds",{}),default=str)[:1000],
        "stock_data":json.dumps({
            "stock":state.get("ctx_stock_data",{}),
            "recentPrices":state.get("ctx_price_history",[])[-10:]
        },default=str)[:1000],
        "user_context":json.dumps({
            "profile":state.get("user_profile",{}),
            "wallet":state.get("user_wallet",{}),
        },default=str)[:1000],
        "rag_context":"\n\n".join(state.get("rag_chunks",[])),
        "history":historyMessages[-20:],
        "query":query
    }):
        token=chunk.content if isinstance(chunk.content,str) else ""
        if token:
            fullResponse+=token
            yield token
    if userId and userId!="system":
        await saveMemory(sessionId,userId,"user",query,ctx)
        await saveMemory(sessionId,userId,"assistant",fullResponse,ctx)
