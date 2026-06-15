from typing import AsyncGenerator

from app.config import get_settings
from app.services.providers import get_provider
from app.services.prompt_builder import build_prompt


async def generate_architecture(
    requirement_document: str,
    scale: str,
    provider: str | None = None,
) -> str:
    """Call the LLM API and return the full response."""
    settings = get_settings()
    messages = build_prompt(requirement_document, scale)
    llm = get_provider(provider)
    return await llm.generate(messages, settings.max_tokens, settings.temperature)


async def generate_architecture_stream(
    requirement_document: str,
    scale: str,
    provider: str | None = None,
) -> AsyncGenerator[str, None]:
    """Call the LLM API with streaming and yield chunks."""
    settings = get_settings()
    messages = build_prompt(requirement_document, scale)
    llm = get_provider(provider)
    async for chunk in llm.generate_stream(messages, settings.max_tokens, settings.temperature):
        yield chunk
