from collections import defaultdict, deque
from threading import Lock
import time
from fastapi import Depends, HTTPException, status

from app.auth import AuthenticatedUser, get_current_user
from app.config import Settings, get_settings


class SlidingWindowRateLimiter:
    def __init__(self) -> None:
        self._buckets: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, max_requests: int, window_seconds: int) -> int:
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            bucket = self._buckets[key]
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= max_requests:
                retry_after = max(1, int(window_seconds - (now - bucket[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded ({max_requests} requests / {window_seconds}s). Please retry later.",
                    headers={"Retry-After": str(retry_after)},
                )
            bucket.append(now)
            return max_requests - len(bucket)


rate_limiter = SlidingWindowRateLimiter()


async def enforce_rate_limit(
    user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> AuthenticatedUser:
    rate_limiter.check(
        key=user.uid,
        max_requests=settings.rate_limit_requests,
        window_seconds=settings.rate_limit_window_seconds,
    )
    return user
