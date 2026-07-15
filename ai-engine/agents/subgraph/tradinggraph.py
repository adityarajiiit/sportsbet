from langgraph.graph import StateGraph,END
from agents.nodes.betadvisor import betAdvisor
from agents.nodes.stockpredictor import stockPredictor
from agents.state import AgentState
from config.constants import INTENT_STOCK_PREDICT

def _nodePicker(state):
    if state.get("intent")==INTENT_STOCK_PREDICT:
        return "stockPredictor"
    return "betAdvisor"

def buildTradingGraph():
    graph=StateGraph(AgentState)
    graph.add_node("betAdvisor",betAdvisor)
    graph.add_node("stockPredictor",stockPredictor)
    graph.set_conditional_entry_point(_nodePicker,{
        "betAdvisor":"betAdvisor",
        "stockPredictor":"stockPredictor"
    })
    graph.add_edge("betAdvisor",END)
    graph.add_edge("stockPredictor",END)
    return graph.compile()
