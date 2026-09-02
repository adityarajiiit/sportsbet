from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from tools.mongodbtools import fetchMatch,fetchMatchH2H,fetchTeam,fetchMatchOdds
from rag.retriever import retrieveChunks
from config.settings import settings
import json,logging
logger=logging.getLogger(__name__)
MATCH_ANALYSIS_PROMPT="""You are an expert cricket analyst for a sports betting platform.

Generate a comprehensive pre-match analysis based on the data provided.

MATCH DATA:
{match_data}

HEAD-TO-HEAD HISTORY:
{h2h_data}

CURRENT ODDS:
{odds_data}

TEAM DETAILS:
{team_data}

RELEVANT NEWS & CONTEXT:
{rag_context}

USER CONTEXT:
{user_context}

Generate a detailed analysis as JSON with this exact structure:
{{
  "summary": "2-3 sentence executive summary",
  "teamAnalysis": {{
    "team1": {{
      "name": "team name",
      "strengths": ["list of strengths"],
      "weaknesses": ["list of weaknesses"],
      "keyPlayers": ["player names"],
      "recentForm": "description of recent form"
    }},
    "team2": {{
      "name": "team name",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "keyPlayers": ["..."],
      "recentForm": "..."
    }}
  }},
  "h2hAnalysis": {{
    "totalMatches": 0,
    "team1Wins": 0,
    "team2Wins": 0,
    "insight": "key takeaway from H2H"
  }},
  "conditions": {{
    "venue": "venue name if known",
    "pitch": "pitch analysis if available",
    "weather": "weather info if available",
    "impact": "how conditions might affect the match"
  }},
  "bettingRecommendation": {{
    "favored": "team name",
    "confidence": 0.0-1.0,
    "reasoning": "why this team is favored",
    "riskLevel": "low|medium|high",
    "suggestedBet": "specific betting suggestion"
  }}
}}
"""
async def matchAnalyzer(state):
    ctx=state.get("context",{})
    matchId=ctx.get("matchId","") or state.get("slots",{}).get("matchId","")
    matchData=state.get("match_data",{})
    if not matchData and matchId:
        matchData=await fetchMatch(matchId) or {}
    h2hData=[]
    teamIds=matchData.get("teamIds",[])
    if len(teamIds)>=2:
        h2hData=await fetchMatchH2H(str(teamIds[0]),str(teamIds[1]))
    oddsData={}
    if matchId:
        oddsData=await fetchMatchOdds(matchId) or {}
    teamData=[]
    for tid in teamIds[:2]:
        team=await fetchTeam(str(tid))
        if team:
            teamData.append(team)
    if not teamData and matchData.get("team1") and matchData.get("team2"):
        teamData = [
            {"name": matchData["team1"].get("teamName"), "id": matchData["team1"].get("teamId")},
            {"name": matchData["team2"].get("teamName"), "id": matchData["team2"].get("teamId")}
        ]
    
    matchTitle=matchData.get("title","cricket match")
    ragChunks=state.get("rag_chunks",[])
    if not ragChunks:
        ragChunks=await retrieveChunks(matchTitle,topK=5)
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.3,
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",MATCH_ANALYSIS_PROMPT),
        ("human","Analyze the match based on the provided data.")
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "match_data":json.dumps(matchData,default=str)[:3000],
            "h2h_data":json.dumps(h2hData,default=str)[:2000],
            "odds_data":json.dumps(oddsData,default=str)[:1000],
            "team_data":json.dumps(teamData,default=str)[:3000],
            "rag_context":"\n\n".join(ragChunks)[:2000],
            "user_context":json.dumps({"recentBets":state.get("user_recent_bets",[])[:5],
            "wallet":state.get("user_wallet",{})
            },default=str)[:500]
        })
        content = "".join(item.get("text", "") if isinstance(item, dict) else str(item) for item in result.content).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:]
        output=json.loads(content)
    except Exception as e:
        logger.error(f"match analyzer fail {e}")
        output={
            "summary":f"Analysis for {matchTitle}",
            "error":str(e)
        }
    return{
        "output":output,
        "match_data":matchData,
    }
