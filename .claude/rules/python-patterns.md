# Python Development Patterns

This document defines Python coding standards for GECOM services (chatbot-ai, ct-refresher, and future Python components).

---

## Project Structure

Python services live at `apps/generic/<service>/` and follow this layout:

```
apps/generic/<service>/
├── src/<package>/           # Source code
│   ├── __init__.py
│   ├── config.py            # Pydantic settings
│   ├── main.py              # FastAPI app / entry point
│   ├── routes/              # API route definitions
│   ├── agent/               # Business logic (domain-specific)
│   └── utils/               # Shared utilities
├── tests/
│   ├── unit/                # Unit tests (mocked dependencies)
│   └── integration/         # Integration tests (optional)
├── setup.py                 # Package configuration
├── setup.cfg                # Tool configuration (pytest, flake8)
├── Dockerfile               # Container definition
├── docker-compose.yml       # Local development
├── build.sh                 # CI/CD build script
└── terraform/               # Infrastructure as code
```

---

## Configuration (Pydantic Settings)

**ALWAYS** use Pydantic `BaseSettings` for configuration. Never use `os.environ` directly.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Service
    environment: str = "development"
    port: int = 8080
    log_level: str = "INFO"

    # External service
    api_key: str = ""
    api_endpoint: str = ""


# Singleton
settings = Settings()
```

**Rules**:

- Every env var has a default value (empty string `""` for optional secrets)
- Type hints on all fields
- Group related settings with comments
- Single `Settings()` instance imported across the app

---

## Logging (structlog)

**ALWAYS** use `structlog` for structured logging. Never use `print()` or stdlib `logging` directly.

```python
import structlog

logger = structlog.get_logger()

# ✅ CORRECT — Structured key-value logging
logger.info("product_search", query="magnesium", results=25, duration_ms=142)
logger.warning("price_filter_unparseable", title="PhytoMulti", price="N/A")
logger.error("api_call_failed", service="neo4j", error=str(e), retry=True)

# ❌ WRONG — Unstructured string logging
print(f"Searching for {query}")
logging.info(f"Found {len(results)} results")
logger.info(f"Price filter failed for {title}")  # f-string in message
```

**Rules**:

- Log event names in `snake_case` (first positional arg)
- Pass data as keyword arguments (not f-strings)
- Use appropriate levels: `debug` (verbose), `info` (normal flow), `warning` (unexpected but handled), `error` (failure)
- Never log secrets, passwords, or full API keys

---

## Type Hints

Type hints are **required** on all function signatures:

```python
# ✅ CORRECT — Full type hints
def search_products(
    query: str,
    max_results: int = 25,
    price_range: tuple[float, float] | None = None,
) -> list[dict[str, Any]]:
    """Search knowledge base for products matching query."""
    ...

# ❌ WRONG — Missing type hints
def search_products(query, max_results=25, price_range=None):
    ...
```

**Rules**:

- Type hints on ALL function parameters and return types
- Use `|` union syntax (Python 3.10+): `str | None` not `Optional[str]`
- Use `Any` sparingly — prefer specific types
- Use Pydantic models for complex data structures

---

## Error Handling

### Catch Specific Exceptions

```python
# ✅ CORRECT — Specific exception
try:
    response = await client.search(query)
except ClientError as e:
    logger.error("bedrock_search_failed", error=str(e))
    return []
except TimeoutError:
    logger.warning("bedrock_search_timeout", query=query)
    return []

# ❌ WRONG — Bare except
try:
    response = await client.search(query)
except:
    return []

# ❌ WRONG — Catching Exception (too broad)
try:
    response = await client.search(query)
except Exception:
    pass
```

### Custom Exceptions

```python
class ChatbotError(Exception):
    """Base exception for chatbot service."""

class KnowledgeBaseError(ChatbotError):
    """Error querying knowledge base."""

class RateLimitError(ChatbotError):
    """User exceeded rate limit."""
    def __init__(self, user_id: str, limit: int):
        self.user_id = user_id
        self.limit = limit
        super().__init__(f"Rate limit ({limit}/min) exceeded for {user_id}")
```

---

## Testing (pytest)

### Unit Test Structure

```python
import pytest
from unittest.mock import AsyncMock, patch


class TestProductSearch:
    """Tests for product search functionality."""

    def test_search_returns_results(self):
        """Should return matching products for valid query."""
        # Arrange
        client = BedrockKBClient(kb_id="test-kb")

        # Act
        with patch.object(client, "_client") as mock:
            mock.retrieve.return_value = {"retrievalResults": [...]}
            results = client.search("magnesium", max_results=10)

        # Assert
        assert len(results) == 10
        assert all("title" in r for r in results)

    def test_search_empty_query_returns_empty(self):
        """Should return empty list for empty query."""
        client = BedrockKBClient(kb_id="test-kb")
        results = client.search("")
        assert results == []

    @pytest.mark.asyncio
    async def test_async_search(self):
        """Should handle async search correctly."""
        client = AsyncMock()
        client.search.return_value = [{"title": "Product A"}]
        results = await client.search("query")
        assert len(results) == 1
```

### Test Naming

- File: `test_<module>.py` (e.g., `test_bedrock_kb_client.py`)
- Class: `TestClassName` (groups related tests)
- Method: `test_<behavior>` — describes expected behavior, not implementation

### Running Tests

```bash
cd apps/generic/<service>

# All unit tests
python -m pytest tests/unit/ -v --tb=short

# Specific test file
python -m pytest tests/unit/knowledge/test_bedrock_kb_client.py -v

# With coverage
python -m pytest tests/unit/ --cov=src --cov-report=term-missing

# Skip slow/integration tests
python -m pytest tests/unit/ -m "not e2e"
```

---

## FastAPI Patterns

### Route Definitions

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    """Request body for chat message."""
    message: str
    session_id: str
    locale: str = "en-us"


class ChatResponse(BaseModel):
    """Response body for chat message."""
    response: str
    products: list[dict] = []


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Process a chat message and return AI response."""
    ...
```

### SSE Streaming

```python
from fastapi.responses import StreamingResponse

@router.post("/message")
async def send_message_stream(request: ChatRequest):
    """Stream chat response via Server-Sent Events."""
    async def event_generator():
        async for chunk in agent.stream(request.message):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

---

## Linting & Formatting (ruff)

### Pre-PR Check (MANDATORY)

```bash
cd apps/generic/<service>

# Lint check
ruff check src tests

# Format check
ruff format --check src tests

# Auto-fix
ruff check --fix src tests
ruff format src tests
```

### Common Ruff Codes

| Code | Description     | Example                               |
| ---- | --------------- | ------------------------------------- |
| F401 | Unused import   | `import json` when json is never used |
| F841 | Unused variable | `x = compute()` but x is never read   |
| E501 | Line too long   | Lines exceeding configured max length |
| I001 | Import sorting  | Imports not in isort-compatible order |

---

## Docker (Local Development)

```bash
# Start service
cd apps/generic/<service>
docker-compose up -d

# Restart after code changes (source is volume-mounted)
docker-compose restart <service>

# View logs
docker-compose logs -f <service>

# Health check
curl http://localhost:8000/health
```

---

## Anti-Patterns

### ❌ Avoid These

```python
# ❌ Using os.environ directly
api_key = os.environ.get("API_KEY", "")  # Use Pydantic Settings

# ❌ Print statements
print(f"Processing {item}")  # Use structlog

# ❌ Bare except
try: ... except: pass  # Catch specific exceptions

# ❌ Mutable default arguments
def process(items: list = []):  # Use None, then items = items or []

# ❌ String concatenation for SQL/queries
query = f"SELECT * FROM {table}"  # Use parameterized queries

# ❌ Global mutable state
results = []  # Module-level mutable — use function-local or class
```

---

## Confluence References

- [Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304) — General coding standards
- [GECOM WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826436632) — Testing requirements

---

**Last Updated**: 2026-03-24
**Applies To**: `apps/generic/chatbot-ai/`, `apps/generic/ct-refresher/`, future Python services
