from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from tools.mongodbtools import(
    fetchStockholdersByStock,
    fetchStockByPlayer,
    saveNotification,
    saveAiInsight
)
from config.settings import settings
import json,logging
logger=logging.getLogger(__name__)
ALERT_PROMPT="""You are a sports alert system. Analyze the live match data and detect significant events.

LIVE MATCH DATA:
{match_data}

LIVE SCORE:
{live_score}

Detect events and generate alerts as JSON:
{{
  "events": [
    {{
      "type": "wicket|boundary|collapse|milestone|momentum_shift",
      "description": "what happened",
      "severity": "low|medium|high|critical",
      "affectedPlayers": ["player names involved"],
      "impact": "how this affects betting/stocks"
    }}
  ],
  "overallStatus": {{
    "matchSituation": "brief description of match state",
    "momentum": "team1|team2|even",
    "keyInsight": "most important takeaway"
  }},
  "alerts": [
    {{
      "title": "alert title",
      "message": "detailed alert message for user notification",
      "priority": "low|medium|high"
    }}
  ]
}}

If there are no significant events, return empty events array.
"""
async def alertGenerator(state):
    matchData=state.get("match_data",{})
    liveScore=state.get("live_score",{})
    if not matchData:
        return{
            "output":{
                "events":[],
                "alerts":[]
            }
        }
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.2
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",ALERT_PROMPT),
        ("human","Analyze the data and trigger any necessary alerts.")
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "match_data":json.dumps(matchData,default=str)[:1000],
            "live_score":json.dumps(liveScore,default=str)[:1000],
        })
        content = "".join(item.get("text", "") if isinstance(item, dict) else str(item) for item in result.content).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:]
        output: dict = json.loads(content)
    except Exception as e:
        logger.error(f"alert generation failed {e}")
        output:dict = {
            "events":[],
            "alerts":[],
            "overallStatus":{}
        }
    alerts=output.get("alerts",[])
    for alert in alerts:
        if alert.get("priority") in ("high","medium"):
            playerIds=matchData.get("playerIds",[])
            for pid in playerIds[:5]:
                stock=await fetchStockByPlayer(str(pid))
                if stock:
                    holders=await fetchStockholdersByStock(str(stock["_id"]))
                    for holder in holders[:50]:
                        try:
                            await saveNotification(
                                str(holder.get("userId","")),
                                alert.get("message","Match alert"),
                                "alert"
                            )
                        except Exception:
                            pass
    
    matchId=str(matchData.get("_id",""))
    if matchId and alerts:
        try:
            from datetime import datetime,timedelta
            await saveAiInsight({
                "matchId":matchId,
                "type":"smart-alert",
                "title":alerts[0].get("title","Match Alert"),
                "content":output,
                "summary":output.get("overallStatus",{}).get("matchSituation",""),
                "score":0.8,
                "metadata":{
                    "alertCount":len(alerts),
                },
                "expiresAt":datetime.utcnow()+timedelta(hours=1)
            })
        except Exception:
            pass
    return{
        "output":output
    }
