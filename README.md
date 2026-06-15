# APEX - Architecture Pattern EXpert

AI-powered tool that generates complete architectural designs (HLD + LLD + AWS cost estimation) from client requirement documents.

## Features

- **Problem Analysis** — Extracts requirements, constraints, and design scope
- **High-Level Design** — Architecture patterns, component diagrams, API contracts
- **Low-Level Design** — Database schemas, sequence diagrams, caching, security
- **AWS Cost Estimation** — Per-service cost breakdown with optimization suggestions
- **Interactive UI** — Real-time streaming output with rendered Mermaid diagrams
- **Section Navigation** — View each section independently or as a full document

## Architecture

```
frontend/          React + Vite + Tailwind CSS
  src/
    components/    UI components (input, output, diagrams)
    services/      API client with streaming support

backend/           Python + FastAPI
  app/
    routers/       API endpoints
    services/      LLM integration + prompt engineering
    models/        Request/response schemas
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key (or any OpenAI-compatible API)

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

## Configuration

Edit `backend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | (required) |
| `OPENAI_MODEL` | Model to use | `gpt-4` |
| `OPENAI_BASE_URL` | API base URL (for Azure/local models) | `https://api.openai.com/v1` |
| `MAX_TOKENS` | Max output tokens | `8000` |
| `TEMPERATURE` | Response creativity (0-1) | `0.3` |

### Using with other providers

- **Azure OpenAI**: Set `OPENAI_BASE_URL` to your Azure endpoint
- **Local models (Ollama)**: Set `OPENAI_BASE_URL=http://localhost:11434/v1`
- **Anthropic (via proxy)**: Use any OpenAI-compatible proxy

## Usage

1. Paste your client requirement document into the text area
2. Select the expected scale (small/medium/large/enterprise)
3. Click "Generate Architecture"
4. View the streaming output with rendered diagrams
5. Navigate between sections using the tab bar
6. Copy the full markdown output to share

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Build | Vite | Fast dev server + bundler |
| Diagrams | Mermaid.js | Renders architecture diagrams |
| Markdown | react-markdown | Renders formatted output |
| Backend | FastAPI | Async Python API server |
| HTTP | httpx | Async HTTP client for LLM calls |
| Validation | Pydantic | Request/response validation |
