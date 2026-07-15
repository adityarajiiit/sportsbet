from typing import Callable,Awaitable
Scraperfn=Callable[[str],Awaitable[list[dict]]]
MatchScraperfn=Callable[[str],Awaitable[list[dict]]]