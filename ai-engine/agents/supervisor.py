from langgraph.graph import StateGraph,END,START
from agents.nodes.context import contextAdder
from agents.nodes.router import routerNode
from agents.subgraph.analysisgraph import buildAnalysisGraph
from agents.subgraph.tradinggraph import buildTradingGraph
from agents.subgraph.engagementgraph import buildEngagementGraph
from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from config.settings import settings
from config.constants import(
    INTENT_MATCH_INSIGHT,
    INTENT_BET_ADVICE,
    INTENT_STOCK_PREDICT,
    INTENT_SMART_ALERT,
    INTENT_CHAT
)
import json,logging
logger=logging.getLogger(__name__)
_agent=None

async def outputChecker(state):
    output=state.get("output",{})
    if not output or state.get("intent")==INTENT_CHAT:
        return{
            "quality_score":1.0
        }
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system",
         "Score the quality of this AI-generated output from 0.0 to 1.0. "
         "Consider: completeness, accuracy of reasoning, actionability, specificity. "
         "Respond with ONLY a JSON: {{\"score\": 0.85, \"feedback\": \"brief reason\"}}"),
        ("human","Query: {query}\n\nOutput:\n{output}"),
    ])
    try:
        result=await (prompt|llm).ainvoke({
            "query":state.get("query",""),
            "output":json.dumps(output,default=str)[:1000]
        })
        content="".join(
            str(item) for item in result.content
        ).strip() if isinstance(result.content, list) else result.content.strip()
        if "```" in content:
            content=content.split("```")[1].split("```")[0]
            if content.startswith("json"):
                content=content[4:]
        parsed=json.loads(content)
        score=parsed.get("score",0.7)
    except Exception:
        score=0.7
    return{
        "quality_score":score,
        "reflection_count":state.get("reflection_count",0)+1
    }

async def addMetadata(state):
    output=state.get("output",{})
    output["_meta"]={
        "intent":state.get("intent",""),
        "confidence":state.get("confidence",0),
        "qualityScore":state.get("quality_score",0),
        "reflections":state.get("reflection_count",0),
        "cost":state.get("cost_usd",0),
        "tokens":state.get("tokens_used",{})
    }
    return{
        "output":output
    }

def routeAfterRouter(state):
    intent=state.get("intent","")
    if intent in (INTENT_MATCH_INSIGHT,INTENT_SMART_ALERT):
        return "analysisGraph"
    elif intent in (INTENT_BET_ADVICE,INTENT_STOCK_PREDICT):
        return "tradingGraph"
    else:
        return "engagementGraph"
    
def shouldReflect(state):
    intent=state.get("intent","")
    if intent==INTENT_CHAT:
        return"addMetadata"
    score=state.get("quality_score",1.0)
    count=state.get("reflection_count",0)
    if score<0.7 and count<2:
        return routeAfterRouter(state)
    return "addMetadata"

def buildSupervisor():
    graph=StateGraph(AgentState)
    graph.add_node("contextAdder",contextAdder)
    graph.add_node("router",routerNode)
    graph.add_node("analysisGraph",buildAnalysisGraph())
    graph.add_node("tradingGraph",buildTradingGraph())
    graph.add_node("engagementGraph",buildEngagementGraph())
    graph.add_node("outputChecker",outputChecker)
    graph.add_node("addMetadata",addMetadata)

    graph.add_edge(START,"contextAdder")
    graph.add_edge("contextAdder","router")
    graph.add_conditional_edges("router",routeAfterRouter,{
        "analysisGraph":"analysisGraph",
        "tradingGraph":"tradingGraph",
        "engagementGraph":"engagementGraph"
    })
    graph.add_edge("analysisGraph","outputChecker")
    graph.add_edge("tradingGraph","outputChecker")
    graph.add_edge("engagementGraph","outputChecker")
    graph.add_conditional_edges("outputChecker",shouldReflect,{
        "analysisGraph":"analysisGraph",
        "tradingGraph":"tradingGraph",
        "engagementGraph":"engagementGraph",
        "addMetadata":"addMetadata"
    })
    graph.add_edge("addMetadata",END)
    return graph.compile()

def getAgent():
    global _agent
    if _agent is None:
        _agent=buildSupervisor()
        logger.info("agent supervisor built")
    return _agent