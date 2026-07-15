from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    model_config=SettingsConfigDict(
        env_file=[".env","../.env","../../.env"],
        case_sensitive=True,
        extra='ignore'
    )
    MONGODB_URL:str=""
    MONGODB_DB_NAME:str="aiengine"
    QDRANT_HOST:str="localhost"
    QDRANT_PORT:int=6333
    QDRANT_API_KEY:str=""
    QDRANT_COLLECTION:str="aiengine"
    REDIS_URI:str=""
    GEMINI_API_KEY:str=""
    GEMINI_MODEL:str=""
    CEREBRAS_API_KEY:str=""
    CEREBRAS_MODEL:str="gpt-oss-120b"
    EMBEDDING_MODEL:str=""
    LANGCHAIN_TRACING_V2:bool=True
    LANGCHAIN_API_KEY:str=""
    LANGCHAIN_PROJECT:str="sportsbet"
    FRONTEND_URL:str="http://localhost:3000"
    BACKEND_URL:str="http://localhost:4000"
    AIENGINE_URL:str="http://localhost:8000"
    SCRAPE_INTERVAL:int=60
    RATELIMIT_INTERVAL:int=60
    INSIGHT_CACHE_TTL:int=1800
    STOCK_CACHE_TTL:int=300
    EMBEDDING_DIMENSION:int=384
    
settings=Settings()
