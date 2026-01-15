# Modificări necesare pentru RAG API

## Situația curentă

RAG API oficial de la https://github.com/danny-avila/rag_api **ARE deja:**

✅ **DELETE /documents** endpoint
✅ **user_id** în metadata pentru access control
✅ **file_id** filtering pentru queries
✅ **PostgreSQL + pgvector** cu Langchain

❌ **NU ARE:**
- **X-Namespace header** support (folosește `entity_id` în body)
- **Webhook callbacks** după procesare
- **Namespace-based filtering** în queries
- **Namespace isolation** în DELETE operations

## Modificări necesare

### 1. Suport pentru X-Namespace Header

**Fișier:** `app/routes/document_routes.py`

#### A. Adaugă helper function pentru extragere namespace

```python
def get_namespace(request: Request, entity_id: Optional[str] = None) -> str:
    """
    Extract namespace from X-Namespace header or generate from entity_id.
    Priority: X-Namespace header > entity_id parameter > default
    """
    # Try X-Namespace header first
    namespace = request.headers.get("X-Namespace")
    if namespace:
        return namespace

    # Fallback to entity_id sanitization
    if entity_id:
        return sanitize_namespace(entity_id)

    # Fallback to user email/id from auth
    user_email = request.headers.get("X-User-Email")
    if user_email:
        return sanitize_namespace(user_email)

    user_id = request.state.user.get("id") if hasattr(request.state, "user") else None
    if user_id:
        return sanitize_namespace(user_id)

    return "ns_default"

def sanitize_namespace(raw: str) -> str:
    """Sanitize namespace to PostgreSQL-compatible format."""
    if not raw:
        return "ns_default"

    s = str(raw).lower()
    s = s.replace("-", "_").replace(".", "_").replace("@", "_").replace(" ", "_")
    s = "".join(c if c.isalnum() or c == "_" else "_" for c in s)

    if not s[0].isalpha():
        s = f"ns_{s}"

    if len(s) > 63:
        s = s[:63]

    s = s.strip("_")
    return s or "ns_default"
```

#### B. Modifică endpoint-ul DELETE

**Înainte:**
```python
@router.delete("/documents")
async def delete_documents(request: Request, document_ids: List[str] = Body(...)):
    existing_ids = await fetch_ids()
    # ... validare și delete
```

**După:**
```python
@router.delete("/documents")
async def delete_documents(
    request: Request,
    document_ids: List[str] = Body(...),
    entity_id: Optional[str] = None
):
    namespace = get_namespace(request, entity_id)

    logger.info(f"[DELETE] Deleting documents {document_ids} from namespace: {namespace}")

    # Delete only from this namespace
    deleted_count = await delete_documents_by_namespace(
        document_ids=document_ids,
        namespace=namespace
    )

    if deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail=f"No documents found in namespace {namespace}"
        )

    return {
        "status": "success",
        "message": f"Deleted {deleted_count} documents",
        "namespace": namespace,
        "document_ids": document_ids
    }
```

#### C. Modifică endpoint-urile de embedding

**Înainte:**
```python
@router.post("/embed")
async def embed_file(
    request: Request,
    file: UploadFile = File(...),
    file_id: Optional[str] = Form(None),
    entity_id: Optional[str] = Form(None),
):
    user_id = get_user_id(entity_id, request)
    # ... procesare
```

**După:**
```python
@router.post("/embed")
async def embed_file(
    request: Request,
    file: UploadFile = File(...),
    file_id: Optional[str] = Form(None),
    entity_id: Optional[str] = Form(None),
):
    user_id = get_user_id(entity_id, request)
    namespace = get_namespace(request, entity_id)

    logger.info(f"[EMBED] Processing file {file.filename} for namespace: {namespace}")

    # Store namespace in metadata
    metadata = {
        "user_id": user_id,
        "namespace": namespace,  # ← ADD THIS
        "file_id": file_id or str(uuid.uuid4()),
        "filename": file.filename,
    }

    # ... rest of processing

    # After successful embedding, send webhook
    await send_webhook_callback(
        file_id=metadata["file_id"],
        embedded=True,
        namespace=namespace
    )
```

### 2. Webhook Callback Support

**Fișier nou:** `app/services/webhook.py`

```python
import os
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

async def send_webhook_callback(
    file_id: str,
    embedded: bool,
    namespace: str,
    error: Optional[str] = None
):
    """
    Send webhook callback to LibreChat after embedding processing.
    """
    webhook_url = os.getenv("LIBRECHAT_WEBHOOK_URL")

    if not webhook_url:
        logger.debug("[WEBHOOK] No LIBRECHAT_WEBHOOK_URL configured, skipping callback")
        return

    # Construct full URL
    if not webhook_url.endswith("/embedding"):
        webhook_url = f"{webhook_url}/api/files/webhooks/embedding"

    payload = {
        "file_id": file_id,
        "embedded": embedded,
        "namespace": namespace,
    }

    if error:
        payload["error"] = error

    try:
        logger.info(f"[WEBHOOK] Sending callback for file {file_id} to {webhook_url}")

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )

            response.raise_for_status()

            logger.info(f"[WEBHOOK] Successfully sent callback for file {file_id}")
            return response.json()

    except httpx.TimeoutException:
        logger.error(f"[WEBHOOK] Timeout sending callback for file {file_id}")
    except httpx.HTTPStatusError as e:
        logger.error(f"[WEBHOOK] HTTP error {e.response.status_code} for file {file_id}")
    except Exception as e:
        logger.error(f"[WEBHOOK] Error sending callback for file {file_id}: {str(e)}")
```

**Importă în `document_routes.py`:**
```python
from app.services.webhook import send_webhook_callback
```

**Adaugă la `.env`:**
```bash
# Webhook URL for LibreChat callbacks
LIBRECHAT_WEBHOOK_URL=http://librechat:3080
```

### 3. Database Modifications

**Fișier:** `app/services/database.py`

#### A. Adaugă namespace index

```python
async def ensure_vector_indexes(pool):
    """Ensure vector database indexes exist."""
    table_name = os.getenv("COLLECTION_NAME", "langchain_pg_embedding")

    indexes = [
        f"CREATE INDEX IF NOT EXISTS idx_{table_name}_file_id ON {table_name} ((cmetadata->>'file_id'))",
        f"CREATE INDEX IF NOT EXISTS idx_{table_name}_namespace ON {table_name} ((cmetadata->>'namespace'))",  # ← ADD THIS
        f"CREATE INDEX IF NOT EXISTS idx_{table_name}_custom_id ON {table_name} (custom_id)",
    ]

    # ... rest of function
```

#### B. Adaugă delete_documents_by_namespace function

```python
async def delete_documents_by_namespace(
    document_ids: List[str],
    namespace: str
) -> int:
    """
    Delete documents by IDs filtered by namespace.
    Returns count of deleted documents.
    """
    pool = await PSQLDatabase.get_pool()
    table_name = os.getenv("COLLECTION_NAME", "langchain_pg_embedding")

    # CRITICAL: Filter by BOTH document_id AND namespace
    query = f"""
        DELETE FROM {table_name}
        WHERE custom_id = ANY($1::text[])
          AND cmetadata->>'namespace' = $2
        RETURNING custom_id
    """

    async with pool.acquire() as conn:
        result = await conn.fetch(query, document_ids, namespace)
        deleted_count = len(result)

        logger.info(f"[DB] Deleted {deleted_count} documents from namespace {namespace}")
        return deleted_count
```

#### C. Modifică query functions pentru namespace filtering

```python
async def query_documents(
    query: str,
    file_id: str,
    namespace: str,  # ← ADD THIS
    k: int = 10
):
    """Query documents with namespace filtering."""

    # Langchain filter syntax
    filter_dict = {
        "file_id": file_id,
        "namespace": namespace  # ← ADD THIS
    }

    results = await vector_store.similarity_search_with_score(
        query=query,
        k=k,
        filter=filter_dict
    )

    return results
```

### 4. Modificări în main.py

**Fișier:** `main.py`

```python
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(name)s - %(message)s'
)

# Add at startup
@app.on_event("startup")
async def startup_event():
    logger.info("=== RAG API Starting ===")
    logger.info(f"LIBRECHAT_WEBHOOK_URL: {os.getenv('LIBRECHAT_WEBHOOK_URL', 'NOT SET')}")
    logger.info(f"Collection: {os.getenv('COLLECTION_NAME', 'langchain_pg_embedding')}")

    await PSQLDatabase.get_pool()
    await ensure_vector_indexes(PSQLDatabase._pool)

    logger.info("=== RAG API Ready ===")
```

## Rezumat Modificări

### Fișiere de modificat:

1. **`app/routes/document_routes.py`**:
   - Adaugă `get_namespace()` și `sanitize_namespace()`
   - Modifică `delete_documents()` pentru namespace filtering
   - Modifică `/embed` pentru a stoca namespace în metadata
   - Adaugă webhook call după embedding

2. **`app/services/webhook.py`** (NOU):
   - Implementează `send_webhook_callback()`

3. **`app/services/database.py`**:
   - Adaugă namespace index în `ensure_vector_indexes()`
   - Adaugă `delete_documents_by_namespace()`
   - Modifică query functions pentru namespace filtering

4. **`main.py`**:
   - Adaugă logging pentru webhook URL la startup

5. **`.env`**:
   ```bash
   LIBRECHAT_WEBHOOK_URL=http://librechat:3080
   ```

6. **`requirements.txt`**:
   ```
   httpx>=0.24.0  # Pentru webhook async calls
   ```

## Testing

După modificări, testează:

### 1. Upload cu namespace
```bash
curl -X POST http://localhost:8000/embed \
  -H "X-Namespace: ns_test_user" \
  -F "file=@test.pdf" \
  -F "file_id=file-123"
```

### 2. Delete cu namespace
```bash
curl -X DELETE http://localhost:8000/documents \
  -H "X-Namespace: ns_test_user" \
  -H "Content-Type: application/json" \
  -d '["file-123"]'
```

### 3. Verifică webhook callback în LibreChat logs
```
[WEBHOOK] Sending callback for file file-123
```

### 4. Verifică izolare namespace în PostgreSQL
```sql
-- Inserează în 2 namespace-uri diferite
SELECT cmetadata->>'namespace', custom_id
FROM langchain_pg_embedding;

-- Șterge din ns_user1
DELETE FROM langchain_pg_embedding
WHERE custom_id = 'file-123'
  AND cmetadata->>'namespace' = 'ns_user1';

-- Verifică că ns_user2 încă are fișierul
SELECT * FROM langchain_pg_embedding
WHERE custom_id = 'file-123'
  AND cmetadata->>'namespace' = 'ns_user2';
```

## Alternativă: Fork minimal

Dacă vrei să modifici cât mai puțin codul original:

### Opțiunea 1: Middleware pentru X-Namespace → entity_id

**Fișier:** `app/middleware/namespace.py` (NOU)

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class NamespaceMiddleware(BaseHTTPMiddleware):
    """Convert X-Namespace header to entity_id form parameter."""

    async def dispatch(self, request: Request, call_next):
        namespace = request.headers.get("X-Namespace")

        if namespace and not request.query_params.get("entity_id"):
            # Inject namespace as entity_id
            request.state.entity_id = namespace

        response = await call_next(request)
        return response
```

**Adaugă în `main.py`:**
```python
from app.middleware.namespace import NamespaceMiddleware

app.add_middleware(NamespaceMiddleware)
```

Această metodă necesită modificări minimale dar nu rezolvă problema webhook-urilor.

## Concluzie

**DA, trebuie să modifici RAG API** pentru:

1. ✅ **X-Namespace support** - pentru consistență cu LibreChat
2. ✅ **Webhook callbacks** - pentru actualizare `embedded: true`
3. ✅ **Namespace filtering în DELETE** - CRITICAL pentru security!

**Fără aceste modificări:**
- ❌ Ștergerea va șterge fișiere din TOATE namespace-urile (security issue!)
- ❌ Status `embedded` va rămâne `false` forever în LibreChat
- ❌ Nu vei avea logging consistent între LibreChat și RAG API

**Recomandare:** Fork repository-ul și aplică modificările de mai sus.
