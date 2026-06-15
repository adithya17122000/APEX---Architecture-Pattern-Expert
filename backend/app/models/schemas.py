from pydantic import BaseModel, Field
from enum import Enum


class ProviderEnum(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    gemini = "gemini"
    ollama = "ollama"


class ScaleEnum(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"
    enterprise = "enterprise"


class CloudProvider(str, Enum):
    aws = "aws"
    gcp = "gcp"
    azure = "azure"
    multi = "multi"  # Compare all three


class ArchitectureRequest(BaseModel):
    requirement_document: str = Field(
        ...,
        min_length=50,
        description="The client requirement document text"
    )
    scale_hint: ScaleEnum = Field(
        default=ScaleEnum.medium,
        description="Expected scale: small, medium, large, enterprise"
    )
    cloud_providers: list[CloudProvider] = Field(
        default=[CloudProvider.aws],
        description="Cloud providers to design for"
    )
    include_sections: list[str] = Field(
        default=["problem_analysis", "hld", "lld", "cost_estimation"],
        description="Which sections to generate"
    )
    ai_provider: ProviderEnum | None = Field(
        default=None,
        description="AI provider to use (defaults to server config)"
    )


class ArchitectureResponse(BaseModel):
    problem_analysis: str | None = None
    high_level_design: str | None = None
    low_level_design: str | None = None
    cost_estimation: str | None = None
    full_output: str = ""


class ReviewRequest(BaseModel):
    architecture_markdown: str = Field(
        ...,
        min_length=100,
        description="Existing architecture design in markdown"
    )
    review_aspects: list[str] = Field(
        default=["security", "scalability", "cost", "reliability", "performance"],
        description="Aspects to review"
    )
    ai_provider: ProviderEnum | None = None


class ReviewResponse(BaseModel):
    review: str = ""
    score: dict[str, int] = {}  # aspect -> score (1-10)
    critical_issues: list[str] = []
    recommendations: list[str] = []


class TerraformRequest(BaseModel):
    architecture_markdown: str = Field(
        ...,
        min_length=100,
        description="Architecture design to convert to Terraform"
    )
    cloud_provider: CloudProvider = CloudProvider.aws
    ai_provider: ProviderEnum | None = None


class TerraformResponse(BaseModel):
    main_tf: str = ""
    variables_tf: str = ""
    outputs_tf: str = ""
    readme: str = ""


class ADRRequest(BaseModel):
    architecture_markdown: str = Field(
        ...,
        min_length=100,
        description="Architecture design to generate ADRs from"
    )
    ai_provider: ProviderEnum | None = None


class ADRResponse(BaseModel):
    adrs: list[dict] = []  # List of {title, status, context, decision, consequences}
    full_output: str = ""


class CostComparisonRequest(BaseModel):
    architecture_markdown: str = Field(
        ...,
        min_length=100,
        description="Architecture to estimate costs for"
    )
    cloud_providers: list[CloudProvider] = Field(
        default=[CloudProvider.aws, CloudProvider.gcp, CloudProvider.azure]
    )
    ai_provider: ProviderEnum | None = None


class CostComparisonResponse(BaseModel):
    comparison: str = ""
    provider_costs: dict[str, str] = {}  # provider -> cost breakdown markdown
