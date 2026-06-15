"""Prompt templates for architecture review, Terraform generation, ADR, and cost comparison."""

REVIEW_SYSTEM_PROMPT = """You are a principal architect reviewing system designs. \
You evaluate architectures against industry best practices, identifying anti-patterns, \
single points of failure, security vulnerabilities, and cost inefficiencies. \
Be specific and actionable in your recommendations."""

REVIEW_PROMPT_TEMPLATE = """Review the following architecture design. Evaluate these aspects: {aspects}

For each aspect, provide:
1. A score from 1-10
2. Issues found (with severity: CRITICAL / HIGH / MEDIUM / LOW)
3. Specific recommendations to fix each issue

## Output Format:
### Overall Assessment
Brief summary paragraph.

### Scores
| Aspect | Score (1-10) | Summary |
|--------|-------------|---------|

### Critical Issues
Numbered list of critical/high issues that must be fixed.

### Recommendations
Numbered list of improvements, ordered by impact.

### Anti-Patterns Detected
List any architectural anti-patterns found.

---

## Architecture to Review:

{architecture_markdown}
"""

TERRAFORM_SYSTEM_PROMPT = """You are a senior DevOps engineer who writes production-ready \
Terraform/OpenTofu HCL. Generate clean, modular, well-documented infrastructure-as-code. \
Follow HashiCorp best practices. Include proper variable definitions, outputs, and comments."""

TERRAFORM_PROMPT_TEMPLATE = """Convert the following architecture design into production-ready \
Terraform code for **{cloud_provider}**.

Generate THREE separate files:

### 1. main.tf
- All resource definitions with proper dependencies
- Use data sources where appropriate
- Include tags for cost allocation
- Security groups, IAM roles, networking

### 2. variables.tf
- All configurable parameters with descriptions and defaults
- Use proper types (string, number, list, map)
- Group by concern (networking, compute, database, etc.)

### 3. outputs.tf
- Useful outputs (endpoints, ARNs, IDs)
- Documentation for each output

## Rules:
- Use the latest provider versions
- Include `depends_on` where implicit dependency isn't enough
- Use `for_each` over `count` for resources that might need individual management
- Add lifecycle policies where appropriate
- Include proper security (encrypted storage, private subnets, security groups)
- Output each file in a separate fenced code block with filename as comment

---

## Architecture:

{architecture_markdown}
"""

ADR_SYSTEM_PROMPT = """You are a technical writer who creates Architecture Decision Records (ADRs) \
following the Michael Nygard format. Extract key architectural decisions from designs \
and document them formally for team review and future reference."""

ADR_PROMPT_TEMPLATE = """Analyze the following architecture design and generate Architecture \
Decision Records (ADRs) for every significant design decision.

For each ADR, use this format:

## ADR-NNN: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded

**Date:** {date}

**Context:**
What is the issue that we're seeing that is motivating this decision?

**Decision:**
What is the change that we're proposing and/or doing?

**Consequences:**
What becomes easier or harder because of this change?

**Alternatives Considered:**
What other options were evaluated and why were they rejected?

---

Generate ADRs for decisions including (but not limited to):
- Architecture pattern choice (monolith vs microservices vs serverless)
- Database technology selection
- Communication protocol choices (sync vs async, REST vs gRPC)
- Cloud service selections
- Caching strategy
- Authentication/authorization approach
- Deployment strategy

---

## Architecture:

{architecture_markdown}
"""

COST_COMPARISON_SYSTEM_PROMPT = """You are a cloud economics expert with deep knowledge of \
AWS, Google Cloud, and Microsoft Azure pricing. Provide accurate cost comparisons \
using current pricing data. Be specific with instance types and service configurations."""

COST_COMPARISON_PROMPT_TEMPLATE = """Estimate and compare the monthly infrastructure cost \
for the following architecture across these cloud providers: {providers}

For EACH provider, provide:

### [Provider Name] Cost Breakdown

| Component | Service | Configuration | Monthly Cost (USD) |
|-----------|---------|---------------|-------------------|

**Monthly Total:** $X,XXX
**Annual Total:** $XX,XXX

After all providers, provide:

### Comparison Summary

| Provider | Monthly Cost | Annual Cost | Key Advantages | Key Disadvantages |
|----------|-------------|-------------|----------------|-------------------|

### Recommendation
Which provider offers the best value for this specific architecture and why.

### Cost Optimization Tips (per provider)
Specific savings opportunities for each.

---

## Architecture:

{architecture_markdown}
"""


def build_review_prompt(architecture_markdown: str, aspects: list[str]) -> list[dict]:
    return [
        {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": REVIEW_PROMPT_TEMPLATE.format(
                architecture_markdown=architecture_markdown,
                aspects=", ".join(aspects),
            ),
        },
    ]


def build_terraform_prompt(architecture_markdown: str, cloud_provider: str) -> list[dict]:
    return [
        {"role": "system", "content": TERRAFORM_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": TERRAFORM_PROMPT_TEMPLATE.format(
                architecture_markdown=architecture_markdown,
                cloud_provider=cloud_provider.upper(),
            ),
        },
    ]


def build_adr_prompt(architecture_markdown: str) -> list[dict]:
    from datetime import date
    return [
        {"role": "system", "content": ADR_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": ADR_PROMPT_TEMPLATE.format(
                architecture_markdown=architecture_markdown,
                date=date.today().isoformat(),
            ),
        },
    ]


def build_cost_comparison_prompt(architecture_markdown: str, providers: list[str]) -> list[dict]:
    return [
        {"role": "system", "content": COST_COMPARISON_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": COST_COMPARISON_PROMPT_TEMPLATE.format(
                architecture_markdown=architecture_markdown,
                providers=", ".join(p.upper() for p in providers),
            ),
        },
    ]
