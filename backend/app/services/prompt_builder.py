SYSTEM_PROMPT = """You are an expert solutions architect with deep expertise in AWS, \
distributed systems, and software architecture. You produce production-ready architectural \
designs that follow industry standards (TOGAF, AWS Well-Architected Framework, 12-Factor App principles).

Your output must be well-structured markdown with clear section headers. \
Use Mermaid syntax (```mermaid code blocks) for ALL diagrams. \
Present cost data in markdown tables.

CRITICAL MERMAID RULES (follow exactly):
- Use ONLY ASCII characters in Mermaid diagrams. NO Unicode dashes, smart quotes, or special chars.
- Wrap ALL node labels in double quotes: A["My Label"] not A[My Label]
- Wrap ALL edge labels in double quotes: A -->|"label"| B
- Wrap ALL subgraph titles in double quotes: subgraph "My Title"
- Do NOT use parentheses, angle brackets, ampersands, or pipe chars inside labels.
- Use simple alphanumeric node IDs (e.g., ApiGW, UserDB, CacheLayer).
- Use --- for plain lines, --> for arrows, -.-> for dotted arrows.
- Each node/edge on its own line. No inline definitions.
- Always start with graph TD, sequenceDiagram, or erDiagram on the first line.
- Test that your Mermaid syntax is valid before outputting it."""

ARCHITECTURE_PROMPT_TEMPLATE = """Given the following client requirement document, produce a complete \
architectural design. Design for **{scale}** scale.

## Instructions — Deliver each section with the exact headers shown:

### 1. Problem Analysis & Design Scope
- Summarize functional and non-functional requirements in bullet points
- Identify core use cases and user personas
- Define system constraints (scale targets: users, requests/sec, data volume, latency SLAs, availability %)
- List assumptions made (with justification)
- State explicit in-scope vs. out-of-scope boundaries

### 2. High-Level Design (HLD)
- State the chosen architecture pattern (e.g., microservices, event-driven, serverless, modular monolith) and WHY
- Provide a Mermaid block diagram showing all major components and their interactions
- Define API contracts between services (method, path, request/response shape)
- Specify data flow with communication protocols (REST, gRPC, WebSocket, async messaging)
- Justify each major design decision with trade-off analysis (what was considered and rejected)
- Address cross-cutting concerns: authentication, observability (logging/metrics/tracing), CI/CD pipeline

### 3. Low-Level Design (LLD) — Deep Dive
- Database schema design with a Mermaid ER diagram. Justify DB choice (SQL vs NoSQL vs both)
- Key service designs with Mermaid sequence diagrams for critical flows
- Caching strategy: what is cached, where (client/CDN/app/DB), TTL policy, invalidation approach
- Scalability plan: horizontal/vertical scaling triggers, auto-scaling configuration
- Failure handling: retry policies, circuit breakers, dead-letter queues, graceful degradation
- Security design: encryption (at-rest/in-transit), IAM roles, network segmentation (VPC/subnets), secrets management

### 4. AWS Cost Estimation
- Map each architectural component to a specific AWS service with the chosen configuration
- Present a cost table in this format:

| Service | AWS Resource | Config/Size | Quantity | Monthly Cost (USD) |
|---------|-------------|-------------|----------|-------------------|

- Include data transfer costs
- Suggest cost optimization strategies (Reserved Instances, Savings Plans, Spot, S3 tiers, etc.)
- Provide **Total Monthly Cost** and **Total Annual Cost**

## Rules
- Use Mermaid syntax for ALL diagrams (block diagrams, sequence diagrams, ER diagrams)
- Prefer managed AWS services over self-hosted where cost-effective
- Design for the stated scale, not infinite scale
- Flag any requirement ambiguity explicitly rather than making silent assumptions
- Be specific with AWS resource sizes (e.g., "t3.medium" not just "EC2")

---

## Client Requirement Document:

{requirement_document}
"""


def build_prompt(requirement_document: str, scale: str) -> list[dict]:
    """Build the message list for the LLM API call."""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": ARCHITECTURE_PROMPT_TEMPLATE.format(
                requirement_document=requirement_document,
                scale=scale,
            ),
        },
    ]
