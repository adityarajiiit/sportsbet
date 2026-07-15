from langchain_community.embeddings import HuggingFaceEmbeddings

from config.settings import settings
_embedder=None

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder=HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
    return _embedder

async def embed_texts(texts:list[str])->list[list[float]]:
    embedder=get_embedder()
    return await embedder.aembed_documents(texts)

async def embed_query(query:str)->list[float]:
    embedder=get_embedder()
    return await embedder.aembed_query(query)