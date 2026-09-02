from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from tools.mongodbtools import fetchStock,fetchPlayer,fetchTeam
from tools.analytics import allprint
from rag.retriever import retrieveChunks
from config.settings import settings
import json,logging
logger=logging.getLogger(__name__)
STOCK_PREDICT_PROMPT="""You are a sports stock market analyst for a fantasy sports trading platform.
Players and teams have stock prices that fluctuate based on performance.

STOCK DATA:
{stock_data}

ENTITY DATA (Player/Team):
{entity_data}

TECHNICAL ANALYSIS:
{technical}

RELEVANT NEWS:
{rag_context}

Predict the stock price movement as JSON:
{{
  "prediction": {{
    "direction": "up|down|sideways",
    "confidence": 0.0-1.0,
    "targetPrice": 0.0,
    "currentPrice": 0.0,
    "percentChange": 0.0,
    "timeframe": "short_term|medium_term"
  }},
  "technicalAnalysis": {{
    "signal": "bullish|bearish|neutral",
    "priceDirection": "up|down|flat",
    "recentTrend": "bullish|bearish|neutral",
    "priceLevel": "high|low|normal",
    "summary": "1-2 sentence technical summary"
  }},
  "catalysts": ["list of factors that could move the price"],
  "riskFactors": ["list of downside risks"],
  "recommendation": {{
    "action": "buy|sell|hold",
    "reasoning": "why this action",
    "confidence": 0.0-1.0
  }}
}}
"""
async def stockPredictor(state):
    ctx=state.get("context",{})
    stockId=ctx.get("stockId","") or state.get("slots",{}).get("stockId","")
    stock=await fetchStock(stockId) if stockId else None
    stockData=stock or {}
    ptData={}
    if stock:
        if stock.get("playerId"):
            ptData=await fetchPlayer(str(stock["playerId"])) or {}
        elif stock.get("teamId"):
            ptData=await fetchTeam(str(stock["teamId"])) or {}
    prices=[]
    technical={"signal":"neutral","confidence":0}
    name=ptData.get("name","") or stockData.get("name","")
    chunks=await retrieveChunks(f"{name} cricket performance",topK=3)
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.2
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",STOCK_PREDICT_PROMPT),
        ("human","Predict the stock movement based on the provided data.")
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "stock_data":json.dumps(stockData,default=str)[:1000],
            "entity_data":json.dumps(ptData,default=str)[:1000],
            "technical":json.dumps(technical,default=str)[:1000],
            "rag_context":"\n".join(chunks)[:1500]
        })
        content = "".join(item.get("text", "") if isinstance(item, dict) else str(item) for item in result.content).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:].strip()
        output=json.loads(content)
    except Exception as e:
        logger.error(f"stock predictor failed {e}")
        output={
            "prediction":{
                "direction":"sideways",
                "confidence":0,
            },
            "error":str(e)
        }
    return{
        "output":output,
    }
