import feedparser
import httpx
import asyncio
import logging
from bs4 import BeautifulSoup

logger=logging.getLogger(__name__)

RSS_FEEDS=[
    "https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
    "https://feeds.bbci.co.uk/sport/cricket/rss.xml",
    "https://www.theguardian.com/sport/cricket/rss",
    "https://news.google.com/rss/search?q=cricket+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://www.skysports.com/rss/12040",
    "https://www.crictracker.com/feed/",
    "https://sportstar.thehindu.com/cricket/feeder/default.rss",
    "https://news.google.com/rss/search?q=ipl+cricket&hl=en-IN&gl=IN&ceid=IN:en",
]

ARTICLE_SELECTORS=[
    "article",
    "[data-component='text-block']",
    ".article-body",
    ".story-body",
    ".entry-content",
    ".post-content",
    "main",
]

async def _fetch_full_content(client:httpx.AsyncClient,url:str)->str:
    try:
        resp=await client.get(url,timeout=10,follow_redirects=True)
        if resp.status_code!=200:
            return ""
        soup=BeautifulSoup(resp.text,"html.parser")
        for sel in ARTICLE_SELECTORS:
            container=soup.select_one(sel)
            if container:
                paragraphs=container.find_all("p")
                text=" ".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True))>40)
                if len(text)>200:
                    return text
        paragraphs=soup.find_all("p")
        text=" ".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True))>40)
        return text
    except Exception as e:
        logger.warning(f"fetch failed {url}: {e}")
        return ""

async def scrape_espn_news(query:str="")->list[dict]:
    raw=[]
    seen=set()
    for url in RSS_FEEDS:
        try:
            feed=feedparser.parse(url)
            for entry in feed.entries[:5]:
                link=str(entry.get("link") or "")
                if not link or link in seen:
                    continue
                seen.add(link)
                raw.append({
                    "title":str(entry.get("title") or "").strip(),
                    "url":link,
                    "summary":str(entry.get("summary") or "").strip(),
                })
        except Exception as e:
            logger.warning(f"feed error {url}: {e}")

    articles=[]
    async with httpx.AsyncClient() as client:
        semaphore=asyncio.Semaphore(5)
        async def fetch(item):
            async with semaphore:
                content=await _fetch_full_content(client,item["url"])
                return{
                    "title":item["title"],
                    "url":item["url"],
                    "content":content if len(content)>200 else item["summary"],
                    "category":"cricket",
                }
        results=await asyncio.gather(*[fetch(r) for r in raw])
        articles=list(results)

    logger.info(f"scraped {len(articles)} articles with full content")
    return articles