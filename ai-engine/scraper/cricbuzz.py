import httpx
from bs4 import BeautifulSoup
import logging

logger=logging.getLogger(__name__)

async def scrape_cricbuzz_news(query:str="cricket")->list[dict]:
    articles=[]
    baseurl="https://www.cricbuzz.com"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{baseurl}/cricket-news",
            )
            if resp.status_code!=200:
                return articles
            soup=BeautifulSoup(resp.text,"html.parser")
            items=soup.select("div.flex.flex-col.gap-2.py-4.px-2")
            for item in items[:10]:
                title=item.select_one("a.font-bold")
                desc=item.select_one("p.text-cbTxtSec")
                if title:
                    href=title.get("href","")
                    articles.append({
                        "title":title.get_text(strip=True),
                        "url":baseurl+href if href.startswith("/") else href,
                        "content":desc.get_text(strip=True) if desc else "",
                        "category":"cricket-news",
                    })
    except Exception as e:
        logger.warning(f"cricbuzz failed {e}")
    return articles
