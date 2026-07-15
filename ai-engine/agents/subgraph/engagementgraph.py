from langgraph.graph import StateGraph,END
from agents.nodes.chatassistant import chatAssistant
from agents.state import AgentState

def buildEngagementGraph():
    graph=StateGraph(AgentState)
    graph.add_node("chatAssistant",chatAssistant)
    graph.set_entry_point("chatAssistant")
    graph.add_edge("chatAssistant",END)
    return graph.compile()
