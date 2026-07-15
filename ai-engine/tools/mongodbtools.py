from bson import ObjectId
from services.mongodb import getDb
from config.constants import(
    COLL_MATCH,COLL_TEAM,COLL_PLAYER,COLL_STOCK,
    COLL_STOCK_TRANSACTION,COLL_STOCKHOLDER,COLL_BET,
    COLL_MATCHBET,COLL_MATCHBET_OUTCOMES,COLL_ODDS_HISTORY,
    COLL_PRICE_HISTORY,COLL_WALLET,COLL_USER,
    COLL_AI_INSIGHT,COLL_CHAT_MESSAGE,COLL_NOTIFICATION,COLL_ALERT,
)
from datetime import datetime,timedelta
import logging

def oid(id:str)->ObjectId|str:
    try:
        return ObjectId(id)
    except Exception:
        return id
    
async def fetchMatch(matchId:str)->dict|None:
    db=getDb()
    match=await db[COLL_MATCH].find_one({
        "_id":oid(matchId)
    })
    if match:
        match["_id"]=str(match["_id"])
        if match.get("teamIds"):
            teams=[]
            for tid in match["teamIds"]:
                t=await db[COLL_TEAM].find_one({
                    "_id":oid(tid)
                })
                if t:
                    t["_id"]=str(t["_id"])
                    teams.append(t)
            match["_teams"]=teams
        return match

async def fetchMatchH2H(teamId1:str,teamId2:str)->list[dict]:
    db=getDb()
    res=db[COLL_MATCH].find({
        "teamIds":{"$all":[oid(teamId1),oid(teamId2)]},
        "status":"Completed"
    }).sort("start",-1).limit(10)
    matches=[]
    async for m in res:
        m["_id"]=str(m["_id"])
        matches.append(m)
    return matches

async def fetchLiveMatches()->list[dict]:
    db=getDb()
    res=db[COLL_MATCH].find({
        "status":"Live"
    })
    matches=[]
    async for m in res:
        m["_id"]=str(m["_id"])
        matches.append(m)
    return matches

async def fetchUpcomingMatches(limit:int=10)->list[dict]:
    db=getDb()
    res=db[COLL_MATCH].find(
        {
            "status":"Upcoming",
            "start":{
                "$gte":datetime.utcnow()
            }
        }
    ).sort("start",1).limit(limit)
    matches=[]
    async for m in res:
        m["_id"]=str(m["_id"])
        matches.append(m)
    return matches

async def fetchTeam(teamId:str)->dict|None:
    db=getDb()
    team=await db[COLL_TEAM].find_one({"_id":oid(teamId)})
    if team:
        team["_id"]=str(team["_id"])
        players=[]
        res=db[COLL_PLAYER].find({"teamId":oid(teamId)})
        async for p in res:
            p["_id"]=str(p["_id"])
            players.append(p)
        team["_players"]=players
    return team

async def fetchPlayer(playerId:str)->dict|None:
    db=getDb()
    player=await db[COLL_PLAYER].find_one({"_id":oid(playerId)})
    if player:
        player["_id"]=str(player["_id"])
    return player

async def fetchStock(stockId:str)->dict|None:
    db=getDb()
    stock=await db[COLL_STOCK].find_one({"_id":oid(stockId)})
    if stock:
        stock["_id"]=str(stock["_id"])
    return stock

async def fetchStockByPlayer(playerId:str)->dict|None:
    db=getDb()
    stock=await db[COLL_STOCK].find_one({"playerId":oid(playerId),"pagetype":"player"})
    if stock:
        stock["_id"]=str(stock["_id"])
    return stock

async def fetchStockPriceHistory(stockId:str,days:int=30)->list[dict]:
    db=getDb()
    since=datetime.utcnow()-timedelta(days=days)
    res=db[COLL_PRICE_HISTORY].find({
        "stockId":oid(stockId),
        "createdAt":{"$gte":since},
    }).sort("createdAt",1)
    history=[]
    async for h in res:
        h["_id"]=str(h["_id"])
        history.append(h)
    return history

async def fetchUserProfile(userId:str)->dict|None:
    db=getDb()
    user=await db[COLL_USER].find_one({"_id":oid(userId)})
    if user:
        user["_id"]=str(user["_id"])
        if user.get("password"):
            del user["password"]
    return user
async def fetchUserWallet(userId:str)->dict|None:
    db=getDb()
    wallet=await db[COLL_WALLET].find_one({"userId":oid(userId)})
    if wallet:
        wallet["_id"]=str(wallet["_id"])
    return wallet
async def fetchUserBets(userId:str,limit:int=20)->list[dict]:
    db=getDb()
    res=db[COLL_BET].find({"userId":oid(userId)}).sort("createdAt",-1).limit(limit)
    bets=[]
    async for b in res:
        b["_id"]=str(b["_id"])
        bets.append(b)
    return bets

async def fetchUserPortfolio(userId:str)->list[dict]:
    db=getDb()
    res=db[COLL_STOCKHOLDER].find({
        "userId":oid(userId),
        "shares":{"$gt":0},
    })
    holdings=[]
    async for h in res:
        h["_id"]=str(h["_id"])
        stock=await db[COLL_STOCK].find_one({"_id":oid(h.get("stockId",""))})
        if stock:
            h["_stock"]={"name":stock.get("name"),"price":stock.get("price")}
        holdings.append(h)
    return holdings
async def fetchMatchOdds(matchId:str)->dict|None:
    db=getDb()
    matchbet=await db[COLL_MATCHBET].find_one({"matchId":oid(matchId)})
    if matchbet:
        matchbet["_id"]=str(matchbet["_id"])
        res=db[COLL_MATCHBET_OUTCOMES].find({"matchbetId":oid(matchbet["_id"])})
        outcomes=[]
        async for o in res:
            o["_id"]=str(o["_id"])
            outcomes.append(o)
        matchbet["_outcomes"]=outcomes
    return matchbet
async def fetchOddsHistory(matchbetId:str,limit:int=100)->list[dict]:
    db=getDb()
    res=db[COLL_ODDS_HISTORY].find(
        {"matchbetId":oid(matchbetId)}
    ).sort("timestamp",-1).limit(limit)
    history=[]
    async for h in res:
        h["_id"]=str(h["_id"])
        history.append(h)
    return history
async def fetchStockholdersByStock(stockId:str)->list[dict]:
    db=getDb()
    res=db[COLL_STOCKHOLDER].find({
        "stockId":oid(stockId),
        "shares":{"$gt":0},
    })
    holders=[]
    async for h in res:
        h["_id"]=str(h["_id"])
        holders.append(h)
    return holders
async def saveAiInsight(data:dict)->str:
    db=getDb()
    data["createdAt"]=datetime.utcnow()
    data["updatedAt"]=datetime.utcnow()
    result=await db[COLL_AI_INSIGHT].insert_one(data)
    return str(result.inserted_id)
async def saveChatMessage(data:dict)->str:
    db=getDb()
    data["createdAt"]=datetime.utcnow()
    result=await db[COLL_CHAT_MESSAGE].insert_one(data)
    return str(result.inserted_id)
async def fetchChatHistory(sessionId:str,limit:int=50)->list[dict]:
    db=getDb()
    res=db[COLL_CHAT_MESSAGE].find(
        {"sessionId":sessionId}
    ).sort("createdAt",-1).limit(limit)
    messages=[]
    async for m in res:
        m["_id"]=str(m["_id"])
        messages.append(m)
    messages.reverse()
    return messages
async def saveNotification(userId:str,message:str,notifType:str="alert")->str:
    db=getDb()
    result=await db[COLL_NOTIFICATION].insert_one({
        "userId":oid(userId),
        "message":message,
        "type":notifType,
        "read":False,
        "createdAt":datetime.utcnow(),
        "updatedAt":datetime.utcnow(),
    })
    return str(result.inserted_id)

