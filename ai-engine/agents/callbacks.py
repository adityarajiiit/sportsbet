import logging

logger=logging.getLogger(__name__)

COST_PER_1M_INPUT=0.075
COST_PER_1M_OUTPUT=0.30


def createCostTracker():
    return{
        "totalInputTokens":0,
        "totalOutputTokens":0,
        "totalCost":0.0,
        "calls":0,
    }


def onLlmEnd(tracker,response):
    tracker["calls"]+=1
    if hasattr(response,"llm_output") and response.llm_output:
        usage=response.llm_output.get("token_usage",{})
        inputTokens=usage.get("prompt_tokens",0)
        outputTokens=usage.get("completion_tokens",0)
    elif response.generations:
        gen=response.generations[0][0]
        info=getattr(gen,"generation_info",{}) or {}
        usage=info.get("usage_metadata",{})
        inputTokens=usage.get("prompt_token_count",0) or usage.get("input_tokens",0)
        outputTokens=usage.get("candidates_token_count",0) or usage.get("output_tokens",0)
    else:
        inputTokens=0
        outputTokens=0
    tracker["totalInputTokens"]+=inputTokens
    tracker["totalOutputTokens"]+=outputTokens
    cost=(inputTokens*COST_PER_1M_INPUT+outputTokens*COST_PER_1M_OUTPUT)/1_000_000
    tracker["totalCost"]+=cost


def getTrackerSummary(tracker):
    return{
        "input":tracker["totalInputTokens"],
        "output":tracker["totalOutputTokens"],
        "cost_usd":round(tracker["totalCost"],6),
        "calls":tracker["calls"],
    }
