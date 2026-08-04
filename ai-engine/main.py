from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from services.mongodb import connectDb,closeDb
from services.qdrantclient import newQdrant,closeQdrantClient
from services.redisclient import newRedisClient,closeRedisClient
from services.langsmithconfig import setupLangsmith
from scraper.scheduler import startScheduler,stopScheduler
from api.middleware import rateLimitMiddleware
from api.routes import insights,betAdvisor,stockPredict,alerts,chat,health
import logging

logging.basicConfig(level=logging.INFO)

logger=logging.getLogger("ai-engine")

@asynccontextmanager
async def lifespan(app:FastAPI):
    setupLangsmith()
    await connectDb()
    await newQdrant()
    await newRedisClient()
    await startScheduler()
    logger.info("AIEngine starting on port 8000")
    yield
    logger.info("AIEngine shutting down")
    await stopScheduler()
    await closeRedisClient()
    await closeQdrantClient()
    await closeDb()
app=FastAPI(
    title="SportsBet AI Engine",
    version="1.0.0",
    description="AI Engine for SportsBet",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL,settings.BACKEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(rateLimitMiddleware)

app.include_router(health.router,prefix="/api/v1",tags=["Health"])
app.include_router(insights.router,prefix="/api/v1",tags=["Match Insights"])
app.include_router(betAdvisor.router,prefix="/api/v1",tags=["Bet Advisor"])
app.include_router(stockPredict.router,prefix="/api/v1",tags=["Stock Predictor"])
app.include_router(alerts.router,prefix="/api/v1",tags=["Smart Alerts"])
app.include_router(chat.router,prefix="/api/v1",tags=["AI Chat"])
