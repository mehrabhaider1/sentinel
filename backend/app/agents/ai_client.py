from __future__ import annotations

import json
import logging
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

from app.core.settings import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class AIClient:
    """
    Wrapper around Google AI Studio's OpenAI-compatible endpoint.

    Google AI Studio exposes an OpenAI-compatible API, allowing Sentinel AI
    to switch between providers with minimal code changes.
    """

    def __init__(self) -> None:

        if not settings.GOOGLE_AI_STUDIO_API_KEY:
            raise ValueError(
                "GOOGLE_AI_STUDIO_API_KEY is not configured."
            )

        self.client = OpenAI(
            api_key=settings.GOOGLE_AI_STUDIO_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

        self.model = settings.GOOGLE_AI_STUDIO_MODEL

    def generate(
        self,
        prompt: str,
        *,
        temperature: float = 0.2,
    ) -> str:
        """
        Generate plain text from Google AI Studio.
        """

        logger.info(
            "Sending prompt to Google AI Studio using model %s",
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
            raise RuntimeError(
                "Google AI Studio returned an empty response."
            )

        logger.info("Received response from Google AI Studio.")

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
        try:
            data = json.loads(text)

            return response_model.model_validate(data)

        except json.JSONDecodeError as exc:
            logger.exception(
                "Google AI Studio did not return valid JSON."
            )

            raise ValueError(
                f"Invalid JSON returned by Google AI Studio:\n{text}"
            ) from exc

        except Exception as exc:
            logger.exception(
                "Google AI Studio response failed schema validation."
            )

            raise ValueError(
                f"Google AI Studio returned invalid schema:\n{text}"
            ) from exc