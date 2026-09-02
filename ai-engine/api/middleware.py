from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response,JSONResponse
from services.redisclient import rate_limit_check
from config.settings import settings

class rateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self,request,call_next):
        if request.url.path.startswith("/api/health"):
            return await call_next(request)
        userId=request.headers.get("X-User-Id",request.client.host if request.client else "anon")
        allowed=await rate_limit_check(userId,settings.RATELIMIT_INTERVAL)
        if not allowed:
            return JSONResponse(
                status_code=400,
                content={"detail":"rate limit exceeded"},
            )
        return await call_next(request)