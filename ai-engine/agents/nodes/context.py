from tools.mongodbtools import(
    fetchUserProfile,
    fetchUserWallet,
    fetchUserBets,
    fetchUserPortfolio,
    fetchMatch
)
from rag.retriever import retrieveChunks
import logging
logger=logging.getLogger(__name__)
async def contextAdder(state):
    updates={}
    userId=state.get("user_id","")
    ctx=state.get("context",{})

    if userId and userId!="system":
        try:
            profile=await fetchUserProfile(userId)
            updates["user_profile"]=profile or {}
        except Exception as e:
            logger.warning(f"user data fetch failed {e}")
            updates["user_profile"]={}
        try:
            wallet=await fetchUserWallet(userId)
            updates["user_wallet"]=wallet or {}
        except Exception as e:
            logger.warning(f"user wallet fetch failed {e}")
            updates["user_wallet"]={}
        try:
            bets=await fetchUserBets(userId,limit=10)
            updates["user_recent_bets"]=bets or []
        except Exception as e:
            logger.warning(f"user bets fetch failed {e}")
            updates["user_recent_bets"]=[]
        try:
            portfolio=await fetchUserPortfolio(userId)
            updates["user_portfolio"]=portfolio or {}
        except Exception as e:
            logger.warning(f"user portfolio fetch failed {e}")
            updates["user_portfolio"]={}
    
    matchId=ctx.get("matchId","")
    if matchId:
        try:
            match=await fetchMatch(matchId)
            if match:
                updates["match_data"]=match
                updates["live_score"]=match.get("liveScore",{}) or {}
        except Exception as e:
            logger.warning(f"match data fetch failed {e}")
    
    query=state.get("query","")
    if query:
        try:
            chunks=await retrieveChunks(query,topK=5)
            updates["rag_chunks"]=chunks
        except Exception as e:
            updates["rag_chunks"]=[]
    return updates
