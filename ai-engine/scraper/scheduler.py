from scraper.cricbuzz import scrape_cricbuzz_news
from scraper.espn import scrape_espn_news
from rag.ingestion import ingest_document
from config.constants import INTENT_SMART_ALERT
import logging
from agents.supervisor import getAgent
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from tools.mongodbtools import fetchLiveMatches
from datetime import datetime

logger=logging.getLogger(__name__)
scheduler=AsyncIOScheduler()

async def scrape_and_ingest():
    scrapers=[scrape_cricbuzz_news,scrape_espn_news]
    for scraper in scrapers:
        try:
            articles=await scraper()
            for a in articles:
                url=a.get("url")
                content=a.get("content")
                if content and url:
                    await ingest_document(
                        source=scraper.__name__,
                        url=str(url),
                        title=str(a.get("title")or" "),
                        content=str(content),
                        category=str(a.get("category")or" "),
                    )
            logger.info(f"Scraped {len(articles)}")
        except Exception as e:
            logger.error(f"Scraper error {e}")

async def run_smart_alerts():
    agent=getAgent()
    live=await fetchLiveMatches()
    for match in live:
        try:
            await agent.ainvoke({
                "query":"Generate smart alert for live match",
                "intent":INTENT_SMART_ALERT,
                "intent_confidence":1.0,
                "intent_slots":{},
                "context":{
                    "matchId":str(match["_id"]),
                    "pageType":"match"
                },
                "match_data":match,
                "live_score":match.get("liveScore",{}),
                "messages":[]
            })
        except Exception as e:
            logger.error(f"Alert error {e}")

from config.settings import settings
async def startScheduler():
    scheduler.add_job(scrape_and_ingest,"interval",
    minutes=settings.SCRAPE_INTERVAL,id="scrape",next_run_time=datetime.now())
    scheduler.add_job(run_smart_alerts,"interval",minutes=5,id="alerts")
    scheduler.start()
    logger.info("scheduler started")

async def stopScheduler():
    scheduler.shutdown()