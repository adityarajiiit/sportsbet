from tools.mongodbtools import(
    fetchUserProfile,
    fetchUserWallet,
    fetchUserBets,
    fetchUserPortfolio,
    fetchMatch,
    fetchMatchOdds,
    fetchStock,
    fetchLiveMatches,
    fetchUpcomingMatches,
    lookupMatchByCricbuzzId,
)
from rag.retriever import retrieveChunks
import logging
logger=logging.getLogger(__name__)

def _parseMatchIdFromUrl(page:str)->str:
    try:
        if "/event/score/" in page:
            segment=page.split("/event/score/")[-1].split("/")[0].split("?")[0]
            if segment.isdigit():
                return segment
    except Exception:
        pass
    return ""

def _parseStockIdFromUrl(page:str)->str:
    try:
        if "/stock/" in page:
            segment=page.split("/stock/")[-1].split("/")[0].split("?")[0]
            if segment:
                return segment
    except Exception:
        pass
    return ""

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
    if not matchId:
        page=ctx.get("page","")
        cricbuzzId=_parseMatchIdFromUrl(page)
        if cricbuzzId:
            try:
                matchId=await lookupMatchByCricbuzzId(cricbuzzId) or ""
            except Exception:
                matchId=""

    if matchId:
        try:
            match=await fetchMatch(matchId)
            if match:
                updates["match_data"]=match
                updates["live_score"]=match.get("liveScore",{}) or {}
        except Exception as e:
            logger.warning(f"match data fetch failed {e}")
        try:
            odds=await fetchMatchOdds(matchId)
            updates["ctx_current_odds"]=odds or {}
        except Exception as e:
            logger.warning(f"odds fetch failed {e}")
            updates["ctx_current_odds"]={}

    stockId=ctx.get("stockId","")
    if not stockId:
        page=ctx.get("page","")
        stockId=_parseStockIdFromUrl(page)

    if stockId:
        try:
            stock=await fetchStock(stockId)
            updates["ctx_stock_data"]=stock or {}
        except Exception as e:
            logger.warning(f"stock fetch failed {e}")
            updates["ctx_stock_data"]={}

    try:
        live=await fetchLiveMatches()
        updates["ctx_live_matches"]=live or []
    except Exception:
        updates["ctx_live_matches"]=[]
    try:
        upcoming=await fetchUpcomingMatches(limit=5)
        updates["ctx_upcoming_matches"]=upcoming or []
    except Exception:
        updates["ctx_upcoming_matches"]=[]

    query=state.get("query","")
    if query:
        try:
            chunks=await retrieveChunks(query,topK=5)
            updates["rag_chunks"]=chunks
        except Exception:
            updates["rag_chunks"]=[]
    return updates
