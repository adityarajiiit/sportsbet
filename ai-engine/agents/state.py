from typing import Any, TypedDict

class AgentState(TypedDict, total=False):
    query:str
    intent:str
    confidence:float
    slots:dict[str,Any]
    context:dict[str,Any]
    user_id:str
    user_profile:dict[str,Any]
    user_recent_bets:list[Any]
    user_portfolio:list[Any]
    user_wallet:dict[str,Any]
    match_data:dict[str,Any]
    live_score:dict[str,Any]
    rag_chunks:list[Any]
    output:dict[str,Any]
    quality_score:float
    reflection_count:int
    messages:list[Any]
    cost_usd:float
    tokens_used:dict[str,int]

def makeDefaultState(overrides=None):
    state={
        "query":"",
        "intent":"",
        "confidence":0.0,
        "slots":{},
        "context":{},
        "user_id":"",
        "user_profile":{},
        "user_recent_bets":[],
        "user_portfolio":[],
        "user_wallet":{},
        "match_data":{},
        "live_score":{},
        "rag_chunks":[],
        "output":{},
        "quality_score":0.0,
        "reflection_count":0,
        "messages":[],
        "cost_usd":0.0,
        "tokens_used":{"input":0,"output":0},
    }
    if overrides:
        state.update(overrides)
    return state
