from langchain_cohere import CohereEmbeddings

from config.settings import settings
_embedder=None

def get_embedder():
    global _embedder
    if _embedder is None:
        _embedder=CohereEmbeddings(
            cohere_api_key=settings.COHERE_API_KEY,
            model="embed-english-v3.0"
        )
    return _embedder

async def embed_texts(texts:list[str])->list[list[float]]:
    embedder=get_embedder()
    return await embedder.aembed_documents(texts)

async def embed_query(query:str)->list[float]:
    embedder=get_embedder()
    return await embedder.aembed_query(query)