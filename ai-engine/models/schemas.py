def validateInsightRequest(body):
    return{
        "userId":body.get("userId",""),
        "context":body.get("context",{}),
        "query":body.get("query",""),
    }

def validateStockPredictRequest(body):
    return{
        "userId":body.get("userId",""),
        "context":body.get("context",{}),
        "query":body.get("query",""),
    }

def validateChatRequest(body):
    query=body.get("query","")
    if not query:
        raise ValueError("query is required")
    userId=body.get("userId","")
    return{
        "userId":userId,
        "sessionId":body.get("sessionId",userId or "default"),
        "query":query,
        "context":body.get("context",{}),
    }

def validateAlertTriggerRequest(body):
    matchId=body.get("matchId","")
    if not matchId:
        raise ValueError("matchId is required")
    return{
        "matchId":matchId,
    }