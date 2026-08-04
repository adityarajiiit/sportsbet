from langchain_cerebras import ChatCerebras
from langchain_core.prompts import ChatPromptTemplate
from config.settings import settings
import json,logging

logger=logging.getLogger(__name__)

import re

async def rerank_chunks(
    query:str,
    chunks:list[dict],
    top_k:int=5,
)->list[dict]:
    if len(chunks)<=top_k:
        return chunks
    llm=ChatCerebras(
        model=settings.CEREBRAS_MODEL,
        api_key=settings.CEREBRAS_API_KEY,
        temperature=0.0,
    )
    chunks_text="\n---\n".join(
        f"Chunk {i}: {c.get('text', '')[:400]}" for i,c in enumerate(chunks[:15])
    )
    prompt=ChatPromptTemplate.from_messages([
        ("system","Score each chunk from 0 to 1 based on its relevance to the query and return  a JSON array:[{\"i\": 0, \"s\": 0.85}, ...]"),
        ("human", f"Query: {query}\n\n{chunks_text}"),
    ])
    try:
        result=await(prompt|llm).ainvoke({"query":query})
        content=result.content
        if not isinstance(content,str):
            content=str(content)
        content=content.strip("` \n").removeprefix("json").strip()
        for i in json.loads(content):
           id=i.get("i",0)
           if 0<=id<len(chunks):
              chunks[id]["rerank_score"]=i.get("s",0.5)
        chunks.sort(key=lambda c:c.get("rerank_score",0),reverse=True)
        return chunks[:top_k]
    except Exception as e:
        logger.error(f"reranking failed {e}")
        return chunks[:top_k]