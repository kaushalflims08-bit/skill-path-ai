import asyncio
import json
import logging
from typing import Callable, Optional, Tuple, Type, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.config import Settings

logger = logging.getLogger("skillpath.gemini")
T = TypeVar("T", bound=BaseModel)


class GeminiStructuredClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: Optional[genai.Client] = None
        if settings.has_gemini_key:
            self._client = genai.Client(api_key=settings.gemini_api_key.strip())

    @property
    def is_configured(self) -> bool:
        return self._client is not None

    async def generate_structured(
        self,
        *,
        system_instruction: str,
        prompt: str,
        schema_model: Type[T],
        fallback_fn: Callable[[], T],
    ) -> Tuple[T, int, bool]:
        """Calls Gemini with timeout, bounded retries, and Pydantic schema validation.

        Returns (validated_model, retries_used, used_fallback).
        """
        if self._client is None:
            return fallback_fn(), 0, True

        max_attempts = max(1, self.settings.gemini_max_retries + 1)
        retries_used = 0

        for attempt in range(max_attempts):
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self._client.models.generate_content,
                        model=self.settings.gemini_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            response_mime_type="application/json",
                            response_schema=schema_model,
                            temperature=0.3,
                        ),
                    ),
                    timeout=self.settings.gemini_timeout_seconds,
                )
                raw_text = (response.text or "").strip()
                if not raw_text:
                    raise ValueError("Empty JSON response from Gemini")
                parsed = schema_model.model_validate(json.loads(raw_text))
                return parsed, retries_used, False
            except (asyncio.TimeoutError, ValidationError, ValueError, Exception) as exc:
                retries_used += 1
                logger.warning(
                    "Gemini structured attempt %d/%d failed for %s: %s",
                    attempt + 1,
                    max_attempts,
                    schema_model.__name__,
                    exc,
                )
                if attempt + 1 < max_attempts:
                    await asyncio.sleep(0.4 * (2**attempt))

        return fallback_fn(), min(retries_used, self.settings.gemini_max_retries), True

    async def generate_text(
        self,
        *,
        system_instruction: str,
        prompt: str,
        fallback_text: str,
    ) -> Tuple[str, bool]:
        if self._client is None:
            return fallback_text, True

        max_attempts = max(1, self.settings.gemini_max_retries + 1)
        for attempt in range(max_attempts):
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self._client.models.generate_content,
                        model=self.settings.gemini_model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.5,
                        ),
                    ),
                    timeout=self.settings.gemini_timeout_seconds,
                )
                text = (response.text or "").strip()
                if text:
                    return text, False
            except Exception as exc:
                logger.warning("Gemini text attempt %d failed: %s", attempt + 1, exc)
                if attempt + 1 < max_attempts:
                    await asyncio.sleep(0.4 * (2**attempt))

        return fallback_text, True
