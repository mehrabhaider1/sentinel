from __future__ import annotations

import json
import logging
import time
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

from app.core.settings import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AIClient:
    """
    Wrapper around an OpenAI-compatible chat completions endpoint.

    Provider-agnostic by design: which backend this talks to (local vLLM,
    Google AI Studio, etc.) is controlled entirely by AI_BASE_URL / AI_MODEL /
    AI_API_KEY in settings, so switching providers never requires touching
    this file — only .env.
    """

    def __init__(self) -> None:
        self.client = OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL,
        )
        self.model = settings.AI_MODEL

    def generate(
        self,
        prompt: str,
        *,
        temperature: float = 0.2,
    ) -> str:
        """
        Generate plain text from the configured AI provider.
        """
        start = time.monotonic()
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        self.last_latency_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            "Sending prompt to %s using model %s",
            settings.AI_BASE_URL,
            self.model,
        )
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        text = response.choices[0].message.content
        if text is None:
            raise RuntimeError("AI provider returned an empty response.")
        logger.info("Received response from AI provider.")
        return text.strip()

    def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
        *,
        temperature: float = 0.2,
    ) -> T:
        """
        Generate structured JSON and validate it against the
        supplied Pydantic model.
        """
        text = self.generate(
            prompt,
            temperature=temperature,
        )

        # Remove markdown code fences if the model returns them
        text = text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines)

        if "<thought>" in text and "</thought>" in text:
            text = text.split("</thought>", 1)[1].strip()

        # Defensive: extract the outermost JSON object in case there's
        # still leading/trailing non-JSON text around it
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            text = text[first_brace : last_brace + 1]

        def derive_risk_level(score: int) -> str:
            if score <= 20:
                return "Low"
            elif score <= 50:
                return "Medium"
            elif score <= 75:
                return "High"
            return "Critical"

        try:
            data = json.loads(text)

            for score_field, level_field in (
                ("risk_score", "risk_level"),
                ("overall_risk_score", "overall_risk_level"),
            ):
                if score_field in data and isinstance(data[score_field], int):
                    data[level_field] = derive_risk_level(data[score_field])

            return response_model.model_validate(data)
        except json.JSONDecodeError as exc:
            logger.exception("AI provider did not return valid JSON.")
            raise ValueError(
                f"Invalid JSON returned by AI provider:\n{text}"
            ) from exc
        except Exception as exc:
            logger.exception("AI provider response failed schema validation.")
            raise ValueError(
                f"AI provider returned invalid schema:\n{text}"
            ) from excfrom __future__ import annotations

import json
import logging
import time
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

from app.core.settings import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AIClient:
    """
    Wrapper around an OpenAI-compatible chat completions endpoint.

    Provider-agnostic by design: which backend this talks to (local vLLM,
    Google AI Studio, etc.) is controlled entirely by AI_BASE_URL / AI_MODEL /
    AI_API_KEY in settings, so switching providers never requires touching
    this file — only .env.
    """

    def __init__(self) -> None:
        self.client = OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL,
        )
        self.model = settings.AI_MODEL

    def generate(
        self,
        prompt: str,
        *,
        temperature: float = 0.2,
    ) -> str:
        """
        Generate plain text from the configured AI provider.
        """
        start = time.monotonic()
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        self.last_latency_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            "Sending prompt to %s using model %s",
            settings.AI_BASE_URL,
            self.model,
        )
        response = self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )
        text = response.choices[0].message.content
        if text is None:
            raise RuntimeError("AI provider returned an empty response.")
        logger.info("Received response from AI provider.")
        return text.strip()

    def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
        *,
        temperature: float = 0.2,
    ) -> T:
        """
        Generate structured JSON and validate it against the
        supplied Pydantic model.
        """
        text = self.generate(
            prompt,
            temperature=temperature,
        )

        # Remove markdown code fences if the model returns them
        text = text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines)

        if "<thought>" in text and "</thought>" in text:
            text = text.split("</thought>", 1)[1].strip()

        # Defensive: extract the outermost JSON object in case there's
        # still leading/trailing non-JSON text around it
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            text = text[first_brace : last_brace + 1]

        def derive_risk_level(score: int) -> str:
            if score <= 20:
                return "Low"
            elif score <= 50:
                return "Medium"
            elif score <= 75:
                return "High"
            return "Critical"

        try:
            data = json.loads(text)

            for score_field, level_field in (
                ("risk_score", "risk_level"),
                ("overall_risk_score", "overall_risk_level"),
            ):
                if score_field in data and isinstance(data[score_field], int):
                    data[level_field] = derive_risk_level(data[score_field])

            return response_model.model_validate(data)
        except json.JSONDecodeError as exc:
            logger.exception("AI provider did not return valid JSON.")
            raise ValueError(
                f"Invalid JSON returned by AI provider:\n{text}"
            ) from exc
        except Exception as exc:
            logger.exception("AI provider response failed schema validation.")
            raise ValueError(
                f"AI provider returned invalid schema:\n{text}"
            ) from exc