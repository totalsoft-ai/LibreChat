# RAG Integration Documentation

## Overview

LibreChat integrates with the standard RAG API (danny-avila/rag_api) for document embedding and vector search. This document describes the complete integration architecture.

**Status:** As of 2025-10-31, LibreChat uses the standard RAG API architecture with native VectorDB integration. The previous orchestrator-based approach has been replaced with direct RAG API communication.

## Related Documentation

- **[RAG API Configuration Guide](./rag-api-configuration.md)** - Environment variables and setup instructions
- **[RAG API Modifications](./rag-api-modifications.md)** - Required changes to danny-avila/rag_api
- **[Main Configuration](../CLAUDE.md)** - LibreChat configuration overview

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│  LibreChat  │────────>│   RAG API    │────────>│  PostgreSQL    │
│   Backend   │  HTTP   │   (FastAPI)  │  SQL    │  + pgvector    │
└─────────────┘         └──────────────┘         └────────────────┘
      │                        │
      │ Webhook Callback       │
      │<───────────────────────┘
      │
      v
  Update MongoDB
  (embedded: true)
```

## Implementation Details

### How It Works

LibreChat uses a **dual storage pattern** for document files uploaded via the "Assistant" endpoint:

1. **Primary Storage**: Files are saved to configured storage (Local/S3/Firebase) for permanent backup
2. **Vector Database**: Files are simultaneously sent to RAG API for embedding and semantic search

**Trigger Mechanism:**
- When a user uploads a file to endpoint "Assistant", the system automatically:
  - Sets `metadata.tool_resource = "file_search"` (line 395 in `files.js`)
  - Calls `processFileUpload()` which detects `tool_resource === EToolResources.file_search`
  - Executes dual storage: both physical storage AND vector database embedding

**Key Code Locations:**
- `api/server/routes/files/files.js:388-398` - Infers `tool_resource = "file_search"` for Assistant endpoint
- `api/server/services/Files/process.js:659-702` - Dual storage pattern implementation
- `api/server/services/Files/VectorDB/crud.js` - RAG API communication layer

**Important:** The previous orchestrator-based approach has been **removed**. The system now uses native VectorDB integration with the standard RAG API.

## Components

### 1. LibreChat Backend

**Location:** `api/server/services/Files/`

**Responsibilities:**
- Upload files to storage (Local/S3/Firebase)
- Send documents to RAG API for embedding
- Receive webhook callbacks when embedding is complete
- Delete embeddings from RAG API when files are deleted

**Key Files:**
- `routes/files/files.js` - File upload route (lines 388-409: detects "Assistant" endpoint and sets file_search)
- `routes/files/webhooks.js` - Webhook endpoint for RAG callbacks
- `services/Files/process.js` - File processing logic (lines 659-702: dual storage pattern for file_search)
- `services/Files/VectorDB/crud.js` - RAG API integration (`uploadVectors()`, `deleteVectors()`, `sanitizeNamespace()`)
- `services/Files/VectorDB/status.js` - Webhook callback handler (`updateEmbeddingStatus()`)
- `services/Files/Local/crud.js` - Local storage with RAG integration (calls `deleteVectors()`)
- `services/Files/Firebase/crud.js` - Firebase storage with RAG integration (calls `deleteVectors()`)

### 2. RAG API (External Service)

**Docker Image:** `ghcr.io/danny-avila/librechat-rag-api-dev:latest`

**Required Endpoints:**

#### POST /upload/files/
Upload files for embedding processing.

**Request:**
```http
POST /upload/files/
Headers:
  X-Namespace: ns_user_example_com
  X-User-Email: user@example.com
  Content-Type: multipart/form-data

Body:
  files: [file1.pdf, file2.txt]
  storage_metadata: {"source": "s3", "bucket": "..."}
```

**Response:**
```json
{
  "status": "loaded",
  "files": ["file-id-1", "file-id-2"],
  "namespace": "ns_user_example_com"
}
```

**Async Behavior:**
- Process files in background
- Extract text, create embeddings
- Store in PostgreSQL with namespace
- **MUST send webhook callback when done**

#### DELETE /documents
Delete embeddings for specific files.

**Request:**
```http
DELETE /documents
Headers:
  Authorization: Bearer {jwt_token}
  X-Namespace: ns_user_example_com
  Content-Type: application/json

Body:
  ["file-id-1", "file-id-2"]
```

**Response:**
```json
{
  "status": "deleted",
  "count": 2,
  "namespace": "ns_user_example_com"
}
```

**CRITICAL:** Must filter by BOTH file_id AND namespace!

```sql
DELETE FROM embeddings
WHERE file_id = ANY($1)
  AND namespace = $2;
```

#### POST {LIBRECHAT_WEBHOOK_URL}/embedding (Callback)
RAG API must call this after processing completes.

**Request:**
```http
POST http://librechat:3080/api/files/webhooks/embedding
Content-Type: application/json

Body:
{
  "file_id": "file-abc123",
  "embedded": true
}

// Or batch:
{
  "files": [
    {"file_id": "file-1", "embedded": true},
    {"file_id": "file-2", "embedded": false, "error": "Failed"}
  ]
}
```

### 3. PostgreSQL + pgvector

**Required Schema:**

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    file_id VARCHAR(255) NOT NULL,
    namespace VARCHAR(63) NOT NULL,
    chunk_index INT,
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX idx_embeddings_file_namespace
ON embeddings(file_id, namespace);

CREATE INDEX idx_embeddings_namespace
ON embeddings(namespace);

CREATE INDEX idx_embeddings_vector
ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

## Namespace System

### Purpose
Isolate user data in the shared PostgreSQL database.

### Format
User email/ID is sanitized to PostgreSQL-compatible namespace:

```javascript
function sanitizeNamespace(raw) {
  // user@example.com → ns_user_example_com
  // john.doe-123 → ns_john_doe_123

  let s = String(raw)
    .toLowerCase()
    .replace(/[-.@\s]/g, '_')
    .replace(/[^a-z0-9_]/g, '_');

  if (!/^[a-z]/.test(s)) s = `ns_${s}`;
  if (s.length > 63) s = s.slice(0, 63);
  s = s.replace(/^_+|_+$/g, '');

  return s || 'ns_default';
}
```

### Usage

**Upload:**
```
X-Namespace: ns_user_example_com
```

**Delete:**
```
X-Namespace: ns_user_example_com
WHERE file_id = '...' AND namespace = 'ns_user_example_com'
```

**Query:**
```
WHERE namespace = 'ns_user_example_com'
```

## Complete Flow

### Upload Flow

1. **User uploads file** → LibreChat frontend
2. **Save to storage** → Local/S3/Firebase
3. **Create MongoDB record** → `embedded: false`
4. **Send to RAG API** → `POST /upload/files/` with X-Namespace
5. **RAG processes** → Extract text, create embeddings
6. **Store in PostgreSQL** → With namespace
7. **Send webhook** → `POST /api/files/webhooks/embedding`
8. **Update MongoDB** → `embedded: true`
9. **Frontend updates UI** → Badge shows "Indexat" (green)

### Delete Flow

1. **User deletes file** → From attachment panel
2. **Validate ownership** → Check user matches
3. **Delete from RAG** → `DELETE /documents` with X-Namespace
4. **Delete from MongoDB** → `File.deleteOne()`
5. **Delete physical file** → From storage
6. **Frontend updates** → Remove from list

### Message Send Flow (with attachments only)

1. **User attaches file** → Without typing text
2. **Validation passes** → If files exist
3. **Send message** → With file references
4. **RAG context** → Can query embeddings for context

## Configuration

### Environment Variables

```bash
# RAG API URL
RAG_API_URL=http://rag_api:8000

# PostgreSQL connection (for RAG API)
DB_HOST=vectordb
DB_PORT=5432
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword

# Webhook URL (for RAG API to call back)
LIBRECHAT_WEBHOOK_URL=http://librechat:3080/api/files/webhooks/embedding
```

### Docker Compose

```yaml
services:
  vectordb:
    image: pgvector/pgvector:0.8.0-pg15-trixie
    environment:
      POSTGRES_DB: mydatabase
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  rag_api:
    image: ghcr.io/danny-avila/librechat-rag-api-dev:latest
    environment:
      - DB_HOST=vectordb
      - RAG_PORT=8000
      - LIBRECHAT_WEBHOOK_URL=http://librechat:3080/api/files/webhooks/embedding
    depends_on:
      - vectordb
```

## Testing

LibreChat includes comprehensive test scripts for RAG API integration:

### Available Test Scripts

1. **test_webhook.sh** - Test LibreChat webhook endpoint
2. **test_rag_delete.sh** - Test RAG API DELETE endpoint with namespace
3. **test_rag_upload.sh** - Test RAG API file upload endpoint
4. **test_rag_query.sh** - Test semantic search queries
5. **test_rag_integration.sh** - End-to-end integration test suite

### Quick Test: Webhook Endpoint

```bash
chmod +x test_webhook.sh
./test_webhook.sh
```

Expected response:
```json
{
  "success": true,
  "message": "Embedding status updated successfully"
}
```

### Quick Test: RAG API DELETE

```bash
chmod +x test_rag_delete.sh
./test_rag_delete.sh
```

Expected responses:
- **200 OK** - DELETE works, file deleted
- **404 Not Found** - DELETE works, file not found
- **405 Method Not Allowed** - DELETE NOT implemented ❌

### Quick Test: File Upload

```bash
chmod +x test_rag_upload.sh
./test_rag_upload.sh
```

Expected response:
```json
{
  "status": "loaded",
  "files": ["test-file-upload-..."],
  "namespace": "ns_test_user"
}
```

### Quick Test: Semantic Search

```bash
# First upload a file, then query it
export TEST_FILE_ID="your-file-id-here"
chmod +x test_rag_query.sh
./test_rag_query.sh
```

Expected response: Array of results with `page_content` and `metadata`

### Complete Integration Test

Run all tests in sequence:

```bash
chmod +x test_rag_integration.sh
./test_rag_integration.sh
```

This script will:
1. ✓ Test LibreChat webhook endpoint accessibility
2. ✓ Upload a test file to RAG API
3. ✓ Simulate webhook callback
4. ✓ Test semantic search queries (2 different queries)
5. ✓ Test namespace isolation (verify wrong namespace returns no results)
6. ✓ Test DELETE with namespace
7. ✓ Verify deletion (query should return empty)
8. ✓ Clean up test files

Expected output:
```
=========================================
RAG API Integration Test Suite
=========================================
...
✓ PASS: LibreChat webhook endpoint is accessible
✓ PASS: File uploaded successfully
✓ PASS: Webhook callback sent
✓ PASS: Semantic search returned relevant results
✓ PASS: Second query returned relevant results
✓ PASS: Namespace isolation working
✓ PASS: File deleted successfully
✓ PASS: Deletion verified
=========================================
All tests passed!
=========================================
```

### Manual Testing Flow

1. **Start services:**
   ```bash
   docker-compose -f rag.yml up -d
   npm run backend:dev
   npm run frontend:dev
   ```

2. **Upload document:**
   - Select PDF/TXT file
   - Choose "File Search" option
   - Upload
   - Check logs: `[uploadVectors] Starting upload to RAG - namespace: ns_...`

3. **Check MongoDB:**
   ```javascript
   db.files.findOne({ file_id: "file-xxx" })
   // embedded: false (processing)
   ```

4. **Simulate webhook callback:**
   ```bash
   curl -X POST http://localhost:3080/api/files/webhooks/embedding \
     -H "Content-Type: application/json" \
     -d '{"file_id": "file-xxx", "embedded": true}'
   ```

5. **Check MongoDB again:**
   ```javascript
   db.files.findOne({ file_id: "file-xxx" })
   // embedded: true (done!)
   ```

6. **Check UI:**
   - Open attachment panel (right side)
   - Badge should show "Indexat" (green)

7. **Delete file:**
   - Click delete in panel
   - Check logs: `[deleteVectors] Deleting file from RAG - namespace: ns_...`
   - Verify deleted from PostgreSQL:
     ```sql
     SELECT * FROM embeddings WHERE file_id = 'file-xxx';
     -- Should return 0 rows
     ```

## Logging

All RAG operations include detailed logging:

```
[uploadVectors] Starting upload to RAG - file: doc.pdf, file_id: file-123, user: user@example.com, namespace: ns_user_example_com
[uploadVectors] Upload initiated for doc.pdf, returning immediately with embedded: false
[uploadVectors] File doc.pdf successfully processed by RAG API (namespace: ns_user_example_com)

[deleteVectors] Deleting file from RAG - file_id: file-123, user: user@example.com, namespace: ns_user_example_com
[deleteVectors] Successfully deleted from RAG - file_id: file-123, namespace: ns_user_example_com
```

## Troubleshooting

### Issue: Files stuck in "Procesare RAG..." state

**Cause:** RAG API not sending webhook callback

**Solution:**
1. Check RAG API logs for processing errors
2. Verify `LIBRECHAT_WEBHOOK_URL` is correct
3. Manually trigger webhook:
   ```bash
   curl -X POST http://localhost:3080/api/files/webhooks/embedding \
     -H "Content-Type: application/json" \
     -d '{"file_id": "FILE_ID_HERE", "embedded": true}'
   ```

### Issue: Delete not removing from RAG

**Cause:** RAG API DELETE endpoint not implemented or not filtering by namespace

**Solution:**
1. Test DELETE endpoint: `./test_rag_delete.sh`
2. Check RAG API logs for DELETE requests
3. Verify namespace is being sent: `X-Namespace: ns_user_example_com`

### Issue: Wrong user can see other user's embeddings

**Cause:** Namespace not being filtered correctly in RAG API queries

**Solution:**
- **CRITICAL:** RAG API must ALWAYS filter by namespace:
  ```sql
  WHERE namespace = $1  -- REQUIRED in ALL queries!
  ```

## Security Considerations

1. **Namespace Isolation:** MUST filter all queries by namespace
2. **JWT Authentication:** RAG API should validate JWT tokens
3. **User Validation:** LibreChat validates file ownership before delete
4. **SQL Injection:** Use parameterized queries in RAG API
5. **XSS Prevention:** HTML escape in webhook responses (already implemented)

## Performance

- **Upload:** Non-blocking, returns immediately with `embedded: false`
- **Processing:** Background job in RAG API
- **Delete:** Synchronous, waits for RAG API response
- **Query:** Indexed on `(file_id, namespace)` for fast lookups

## Future Enhancements

1. ~~**Query Endpoint:** Add `/query` endpoint for RAG-based search~~ ✅ **IMPLEMENTED** - See `fileSearch.js` tool
2. **Batch Upload:** Support multiple files in single request
3. **Progress Updates:** Stream processing progress to frontend (currently shows "Procesare RAG..." → "Indexat")
4. **Retry Logic:** Auto-retry failed embeddings with exponential backoff
5. **Analytics:** Track embedding success rates, processing times, token usage
6. **Advanced Queries:**
   - Cross-file search (search across all user's documents)
   - Hybrid search (keyword + semantic)
   - Re-ranking with custom models
7. **Metadata Enrichment:**
   - Automatic tag extraction
   - Document classification
   - Entity recognition
