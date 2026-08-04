from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from tools.mongodbtools import fetchMatch,fetchMatchOdds,fetchOddsHistory
from tools.oddstools import calculateEv,kellyCriterion,oddsToProbability,oddsMovementAnalysis
from config.settings import settings
import json,logging
logger=logging.getLogger(__name__)
BET_ADVISOR_PROMPT="""You are an expert sports betting advisor with deep knowledge of cricket and probability.

MATCH DATA:
{match_data}

CURRENT ODDS & OUTCOMES:
{odds_data}

ODDS MOVEMENT ANALYSIS:
{odds_movement}

EV CALCULATIONS:
{ev_data}

KELLY CRITERION SUGGESTIONS:
{kelly_data}

USER'S WALLET & RECENT BETS:
{user_context}

RAG CONTEXT:
{rag_context}

Provide detailed betting advice as JSON:
{{
  "recommendation": "bet|hold|avoid",
  "summary": "2-3 sentence summary of advice",
  "evAnalysis": {{
    "bestBet": "which outcome has best EV",
    "ev": 0.0,
    "explanation": "why this bet has positive EV"
  }},
  "kellySuggestion": {{
    "recommendedStake": 0.0,
    "fractionOfBankroll": 0.0,
    "reasoning": "why this stake size"
  }},
  "oddsMovement": {{
    "trend": "shortening|drifting|stable",
    "insight": "what the odds movement tells us"
  }},
  "riskAssessment": {{
    "level": "low|medium|high",
    "factors": ["list of risk factors"],
    "mitigations": ["how to reduce risk"]
  }},
  "confidence": 0.0-1.0
}}
"""
async def betAdvisor(state):
    ctx=state.get("context",{})
    matchId=ctx.get("matchId","") or state.get("slots",{}).get("matchId","")
    matchData=state.get("match_data",{})
    if not matchData and matchId:
        matchData=await fetchMatch(matchId) or {}
    oddsData=await fetchMatchOdds(matchId) if matchId else {}
    outcomes=oddsData.get("_outcomes",[]) if oddsData else []

    oddsHistory=[]
    if oddsData:
        oddsHistory=await fetchOddsHistory(str(oddsData.get("_id","")))
    oddsMovement=oddsMovementAnalysis(oddsHistory)

    evResults=[]
    kellyResults=[]
    walletBalance=state.get("user_wallet",{}).get("balance",1000)

    for outcome in outcomes:
        odds=outcome.get("odds",2.0)
        probability=oddsToProbability(odds)
        ev=calculateEv(odds,probability)
        kelly=kellyCriterion(odds,probability,walletBalance)
        evResults.append({
            "team":outcome.get("teamname",""),
            "odds":odds,
            "probability":probability,
            "ev":ev
        })
        kellyResults.append({
            "team":outcome.get("teamname",""),
            "kelly":kelly
        })
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.2
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",BET_ADVISOR_PROMPT),
        ("human","Provide betting advice based on the data.")
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "match_data":json.dumps(matchData,default=str)[:1000],
            "odds_data":json.dumps(outcomes,default=str)[:1000],
            "odds_movement":json.dumps(oddsMovement,default=str)[:1000],
            "ev_data":json.dumps(evResults,default=str)[:1000],
            "kelly_data":json.dumps(kellyResults,default=str)[:1000],
            "user_context":json.dumps({
                "wallet":state.get("user_wallet",{}),
                "recentBets":state.get("user_recent_bets",[])
            },default=str)[:1000],
            "rag_context":"\n".join(state.get("rag_chunks",[]))[:1500]
        })
        content = "".join(item.get("text", "") if isinstance(item, dict) else str(item) for item in result.content).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:]
        output=json.loads(content)
    except Exception as e:
        logger.error(f"bet advisor failed {e}")
        output={
            "recommendation":"hold",
            "error":str(e)
        }
    return{
        "output":output,
        "match_data":matchData,
    }
