import logging
logger=logging.getLogger(__name__)

def _average(nums):
    if not nums:
        return 0
    return round(sum(nums)/len(nums),2)

def _pctChange(old,new):
    if old==0:
        return 0
    return round((new-old)/old*100,2)

def priceDirection(prices):
    if len(prices)<2:
        return{
            "direction":"flat",
            "change":0
        }
    mid=len(prices)//2
    oldAvg=_average(prices[:mid])
    newAvg=_average(prices[mid:])
    pct=_pctChange(oldAvg,newAvg)
    if pct>2:
        direction="up"
    elif pct<-2:
        direction="down"
    else:
        direction="flat"
    return{
        "direction":direction,
        "change":pct,
        "oldAvg":oldAvg,
        "recentAvg":newAvg
    }

def recentTrend(prices,window=5):
    if len(prices)<2:
        return{
            "trend":"neutral",
            "recentChange":0
        }
    recent=prices[-window:] if len(prices)>=window else prices
    first=recent[0]
    last=recent[-1]
    pct=_pctChange(first,last)
    if pct>3:
        trend="bullish"
    elif pct<-3:
        trend="bearish"
    else:
        trend="neutral"
    return{
        "trend":trend,
        "recentChange":pct,
        "first":first,
        "last":last
    }

def priceLevel(prices):
    if not prices:
        return{
            "level":"normal",
            "position":0.5
        }
    low=min(prices)
    high=max(prices)
    current=prices[-1]
    if high==low:
        return{
            "level":"normal",
            "position":0.5,
            "current":current,
        }
    position=round((current-low)/(high-low),2)
    if position>0.75:
        level="high"
    elif position<0.25:
        level="low"
    else:
        level="normal"
    return{
        "level":level,
        "position":position,
        "current":current,
        "low":low,
        "high":high
    }

def allprint(prices):
    if not prices or len(prices)<2:
        return{
            "signal":"neutral",
            "confidence":0,
            "indicators":{}
        }
    direction=priceDirection(prices)
    trend=recentTrend(prices)
    level=priceLevel(prices)

    votes={
        "bullish":0,
        "bearish":0,
        "neutral":0
    }
    if direction["direction"]=="up":
        votes["bullish"]+=1
    elif direction["direction"]=="down":
        votes["bearish"]+=1
    else:
        votes["neutral"]+=1
    
    votes[trend["trend"]]+=1

    if level["level"]=="low":
        votes["bullish"]+=1
    elif level["level"]=="high":
        votes["bearish"]+=1
    else:
        votes["neutral"]+=1
    
    totalVotes=votes["bullish"]+votes["bearish"]+votes["neutral"]
    if votes["bullish"]>votes["bearish"]:
        signal="bullish"
        confidence=round(votes["bullish"]/totalVotes,2)
    elif votes["bearish"]>votes["bullish"]:
        signal="bearish"
        confidence=round(votes["bearish"]/totalVotes,2)
    else:
        signal="neutral"
        confidence=round(votes["neutral"]/totalVotes,2)
    
    return{
        "signal":signal,
        "confidence":confidence,
        "indicators":{
            "direction":direction,
            "trend":trend,
            "level":level
        }
    }
