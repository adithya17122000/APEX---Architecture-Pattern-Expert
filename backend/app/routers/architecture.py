import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.models.schemas import (
    ArchitectureRequest, ArchitectureResponse,
    ReviewRequest, ReviewResponse,
    TerraformRequest, TerraformResponse,
    ADRRequest, ADRResponse,
    CostComparisonRequest, CostComparisonResponse,
)
from app.services.llm_service import generate_architecture, generate_architecture_stream
from app.services.providers import get_provider
from app.services.prompts import (
    build_review_prompt,
    build_terraform_prompt,
    build_adr_prompt,
    build_cost_comparison_prompt,
)

router = APIRouter(prefix="/api/architecture", tags=["architecture"])


@router.post("/generate", response_model=ArchitectureResponse)
async def generate(request: ArchitectureRequest):
    """Generate a complete architectural design from requirements."""
    try:
        result = await generate_architecture(
            requirement_document=request.requirement_document,
            scale=request.scale_hint,
            provider=request.ai_provider,
        )
        sections = _parse_sections(result)
        return ArchitectureResponse(
            problem_analysis=sections.get("problem_analysis"),
            high_level_design=sections.get("high_level_design"),
            low_level_design=sections.get("low_level_design"),
            cost_estimation=sections.get("cost_estimation"),
            full_output=result,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/stream")
async def generate_stream(request: ArchitectureRequest):
    """Generate architectural design with streaming response."""
    async def event_stream():
        try:
            async for chunk in generate_architecture_stream(
                requirement_document=request.requirement_document,
                scale=request.scale_hint,
                provider=request.ai_provider,
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# ─── Architecture Review ───────────────────────────────────────────────

@router.post("/review", response_model=ReviewResponse)
async def review_architecture(request: ReviewRequest):
    """Review an existing architecture for anti-patterns and improvements."""
    try:
        settings = get_settings()
        llm = get_provider(request.ai_provider)
        messages = build_review_prompt(request.architecture_markdown, request.review_aspects)
        result = await llm.generate(messages, settings.max_tokens, settings.temperature)
        return ReviewResponse(review=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review/stream")
async def review_architecture_stream(request: ReviewRequest):
    """Review architecture with streaming response."""
    async def event_stream():
        try:
            settings = get_settings()
            llm = get_provider(request.ai_provider)
            messages = build_review_prompt(request.architecture_markdown, request.review_aspects)
            async for chunk in llm.generate_stream(messages, settings.max_tokens, settings.temperature):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── Terraform Export ──────────────────────────────────────────────────

@router.post("/terraform", response_model=TerraformResponse)
async def generate_terraform(request: TerraformRequest):
    """Generate Terraform IaC from architecture design."""
    try:
        settings = get_settings()
        llm = get_provider(request.ai_provider)
        messages = build_terraform_prompt(request.architecture_markdown, request.cloud_provider)
        result = await llm.generate(messages, settings.max_tokens, settings.temperature)
        files = _parse_terraform_files(result)
        return TerraformResponse(**files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/terraform/stream")
async def generate_terraform_stream(request: TerraformRequest):
    """Generate Terraform with streaming response."""
    async def event_stream():
        try:
            settings = get_settings()
            llm = get_provider(request.ai_provider)
            messages = build_terraform_prompt(request.architecture_markdown, request.cloud_provider)
            async for chunk in llm.generate_stream(messages, settings.max_tokens, settings.temperature):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── ADR Generation ───────────────────────────────────────────────────

@router.post("/adr", response_model=ADRResponse)
async def generate_adr(request: ADRRequest):
    """Generate Architecture Decision Records from design."""
    try:
        settings = get_settings()
        llm = get_provider(request.ai_provider)
        messages = build_adr_prompt(request.architecture_markdown)
        result = await llm.generate(messages, settings.max_tokens, settings.temperature)
        return ADRResponse(full_output=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/adr/stream")
async def generate_adr_stream(request: ADRRequest):
    """Generate ADRs with streaming response."""
    async def event_stream():
        try:
            settings = get_settings()
            llm = get_provider(request.ai_provider)
            messages = build_adr_prompt(request.architecture_markdown)
            async for chunk in llm.generate_stream(messages, settings.max_tokens, settings.temperature):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── Multi-Cloud Cost Comparison ──────────────────────────────────────

@router.post("/cost-compare", response_model=CostComparisonResponse)
async def compare_costs(request: CostComparisonRequest):
    """Compare infrastructure costs across cloud providers."""
    try:
        settings = get_settings()
        llm = get_provider(request.ai_provider)
        messages = build_cost_comparison_prompt(
            request.architecture_markdown,
            [p.value for p in request.cloud_providers],
        )
        result = await llm.generate(messages, settings.max_tokens, settings.temperature)
        return CostComparisonResponse(comparison=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cost-compare/stream")
async def compare_costs_stream(request: CostComparisonRequest):
    """Compare costs with streaming response."""
    async def event_stream():
        try:
            settings = get_settings()
            llm = get_provider(request.ai_provider)
            messages = build_cost_comparison_prompt(
                request.architecture_markdown,
                [p.value for p in request.cloud_providers],
            )
            async for chunk in llm.generate_stream(messages, settings.max_tokens, settings.temperature):
                yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ─── Provider Info ────────────────────────────────────────────────────

@router.get("/providers")
async def list_providers():
    """List available AI providers and their configuration status."""
    settings = get_settings()
    return {
        "providers": [
            {"id": "openai", "name": "OpenAI / Compatible", "configured": bool(settings.openai_api_key)},
            {"id": "anthropic", "name": "Anthropic Claude", "configured": bool(settings.anthropic_api_key)},
            {"id": "gemini", "name": "Google Gemini", "configured": bool(settings.gemini_api_key)},
            {"id": "ollama", "name": "Ollama (Local)", "configured": True},
        ],
        "default": settings.default_provider,
    }


# ─── Helpers ──────────────────────────────────────────────────────────

def _parse_sections(markdown: str) -> dict:
    """Parse the markdown output into named sections."""
    sections = {}
    current_key = None
    current_lines = []

    section_markers = {
        "1. Problem Analysis": "problem_analysis",
        "2. High-Level Design": "high_level_design",
        "3. Low-Level Design": "low_level_design",
        "4. AWS Cost Estimation": "cost_estimation",
        "4. Cost Estimation": "cost_estimation",
    }

    for line in markdown.split("\n"):
        matched = False
        for marker, key in section_markers.items():
            if marker.lower() in line.lower():
                if current_key and current_lines:
                    sections[current_key] = "\n".join(current_lines).strip()
                current_key = key
                current_lines = [line]
                matched = True
                break
        if not matched and current_key is not None:
            current_lines.append(line)

    if current_key and current_lines:
        sections[current_key] = "\n".join(current_lines).strip()

    return sections


def _parse_terraform_files(markdown: str) -> dict:
    """Extract main.tf, variables.tf, outputs.tf from markdown output."""
    import re
    files = {"main_tf": "", "variables_tf": "", "outputs_tf": "", "readme": ""}

    # Find all code blocks
    blocks = re.findall(r'```(?:hcl|terraform)?\s*\n(.*?)```', markdown, re.DOTALL)

    # Try to identify files by content/comments
    for block in blocks:
        content = block.strip()
        lower = content.lower()
        if "variable" in lower[:200] and "resource" not in lower[:200]:
            files["variables_tf"] = content
        elif "output" in lower[:200] and "resource" not in lower[:200]:
            files["outputs_tf"] = content
        elif not files["main_tf"]:
            files["main_tf"] = content
        elif not files["variables_tf"]:
            files["variables_tf"] = content
        elif not files["outputs_tf"]:
            files["outputs_tf"] = content

    files["readme"] = markdown
    return files
