import httpx
import xml.etree.ElementTree as ET
import logging

logger=logging.getLogger(__name__)

async def scrape_live_cricket():
    articles=[]
    url="http://static.cricinfo.com/rss/livescores.xml"
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp=await client.get(url)
            if resp.status_code!=200:
                return articles
            
            root=ET.fromstring(resp.text)
            for item in root.findall('.//item')[:15]:
                title=item.find('title').text
                link=item.find('link').text
                desc=item.find('description').text
                
                if title:
                    articles.append({
                        "title":title,
                        "url":link or url,
                        "content":desc or title,
                        "category":"live-cricket",
                    })
    except Exception as e:
        logger.warning(f"live cricket scrape failed {e}")
    return articles

