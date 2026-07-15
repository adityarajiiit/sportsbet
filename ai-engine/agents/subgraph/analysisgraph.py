from langgraph.graph import StateGraph,END
from agents.nodes.matchanalyzer import matchAnalyzer
from agents.nodes.alertgenerator import alertGenerator
from agents.state import AgentState
from config.constants import INTENT_SMART_ALERT

def _nodePicker(state):
    if state.get('intent')==INTENT_SMART_ALERT:
        return "alertGenerator"
    return "matchAnalyzer"

def buildAnalysisGraph():
    graph=StateGraph(AgentState)
    graph.add_node("matchAnalyzer",matchAnalyzer)
    graph.add_node("alertGenerator",alertGenerator)
    graph.set_conditional_entry_point(_nodePicker,{
        "matchAnalyzer":"matchAnalyzer",
        "alertGenerator":"alertGenerator"
    })
    graph.add_edge("matchAnalyzer",END)
    graph.add_edge("alertGenerator",END)
    return graph.compile()
