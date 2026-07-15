import math
import logging

logger=logging.getLogger(__name__)

def calculateEv(odds:float,probability:float)->float:
    if odds<=0 or probability<0 or probability>1:
        return 0.0
    ev=(probability*(odds-1))-(1-probability)
    return round(ev*100,2)

def kellyCriterion(odds:float,probability:float,bankroll:float=1000.0)->dict:
    if odds<=1 or probability<0 or probability>1:
        return {"fraction":0,"amount":0,"recommendation":"no-bet"}
    b=odds-1
    p=probability
    q=1-p
    f=(b*p-q)/b
    if f<=0:
        return {"fraction":0,"amount":0,"recommendation":"no-bet"}
    halfKelly=f/2
    amount=round(bankroll*halfKelly,2)
    rec="small-bet"
    if halfKelly>0.1:
        rec="strong-bet"
    elif halfKelly>0.05:
        rec="medium-bet"
    return{
        "fraction":round(halfKelly,4),
        "halfKelly":round(halfKelly,4),
        "amount":amount,
        "recommendation":rec
    }

def oddsToProbability(odds:float)->float:
    if odds<=0:
        return 0.0
    return round(1/odds,4)

def oddsMovementAnalysis(history:list[dict])->dict:
    if not history:
        return{
            "trend":"no-data",
            "teams":{}
        }
    teamOdds={}
    for h in history:
        name=h.get("teamname","unknown")
        if name not in teamOdds:
            teamOdds[name]=[]
        teamOdds[name].append(h.get("odds",0))
    analysis={}
    for team,oddsList in teamOdds.items():
        if len(oddsList)<2:
            analysis[team]={"trend":"stable","change":0}
            continue
        change=oddsList[-1]-oddsList[0]
        pctChange=((oddsList[-1]-oddsList[0])/oddsList[0])*100 if oddsList[0]>0 else 0
        trend="stable"
        if change>0.1:
            trend="drifting"
        elif change<-0.1:
            trend="shortening"
        else:
            trend="stable"
        analysis[team]={
            "trend":trend,
            "startOdds":oddsList[0],
            "currentOdds":oddsList[-1],
            "change":round(change,3),
            "pctChange":round(pctChange,2),
            "dataPoints":len(oddsList)
        }
    return{
        "trend":"stable",
        "teams":analysis
    }
