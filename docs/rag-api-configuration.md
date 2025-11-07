# RAG API Configuration Guide

This guide explains how to configure LibreChat to work with the standard RAG API (danny-avila/rag_api) for document embedding and semantic search.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [LibreChat Configuration](#librechat-configuration)
- [RAG API Setup](#rag-api-setup)
- [Testing Configuration](#testing-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **RAG API Service**: You need a running instance of the RAG API with the modifications documented in [rag-api-modifications.md](./rag-api-modifications.md)
2. **PostgreSQL with pgvector**: Required for the RAG API (v0.5.0+ on PostgreSQL 12.16-R2+, 13.12-R2+, 14.9-R2+, or 15.4-R2+)
3. **LibreChat**: Running instance with endpoint "Assistant" configured

## Environment Variables

Add the following variables to your `.env` file:

### Required Variables

```bash
# RAG API Integration
RAG_API_URL=http://rag_api:8000
# URL where RAG API can reach LibreChat for webhook callbacks
LIBRECHAT_WEBHOOK_URL=http://librechat:3080
```

### Optional Variables

```bash
# Disable semantic search queries (default: false)
# Set to true to disable query functionality, only embeddings will work
RAG_DISABLE_QUERIES=false

# Skip embedded check for RAG queries (default: false)
# Set to true to allow files to be queried even if embedded status is not true
# Useful for testing and debugging RAG functionality without waiting for webhook callbacks
RAG_SKIP_EMBEDDED_CHECK=false

# JWT Secret for RAG API authentication
# If not set, will use the main JWT_SECRET
# RAG_JWT_SECRET=your_secret_here

# Debug mode for RAG operations
DEBUG_RAG_API=false
```

### Legacy Variables (No Longer Used)

The following variables are **NO LONGER NEEDED** after migration to RAG API standard:

```bash
# ❌ REMOVE THESE FROM YOUR .ENV:
# ORCHESTRATOR_URL=http://orchestrator-agent.totalsoft.local
# ORCHESTRATOR_API_KEY=your_api_key
# EMBEDDINGS_NAMESPACE_MAXLEN=64
```

## LibreChat Configuration

### librechat.yaml Setup

Ensure your `librechat.yaml` includes the "Assistant" endpoint configuration:

```yaml
interface:
  agents: true
  genericFileUpload: true  # Required for file uploads

endpoints:
  custom:
    - name: "Assistant"
      baseURL: "YOUR_LLM_API_URL"  # Your actual LLM endpoint
      apiKey: "${YOUR_API_KEY}"
      # Add your model configuration
      models:
        default: ["your-model-name"]

      # These settings enable RAG integration
      titleModel: "your-model-name"
      summarize: false
```

### Important Notes

1. **Endpoint Name**: The endpoint name MUST be exactly `"Assistant"` (case-sensitive) for RAG integration to activate
2. **File Types**: Only document files (PDF, DOCX, TXT, etc.) will be sent for embedding; images are skipped
3. **Namespace Isolation**: Each user gets their own namespace based on email (e.g., `user@example.com` → `ns_user_example_com`)

## RAG API Setup

Your RAG API instance MUST be modified to support LibreChat integration. See [rag-api-modifications.md](./rag-api-modifications.md) for complete implementation details.

### Required RAG API Modifications

The following modifications are **CRITICAL** for security and functionality:

1. ✅ **X-Namespace Header Support** - Accept namespace via header instead of body
2. ✅ **Webhook Callback Service** - Call LibreChat after embedding completes
3. ✅ **Namespace Filtering in DELETE** - Filter by BOTH document_id AND namespace
4. ✅ **PostgreSQL Index** - Add index on `cmetadata->>'namespace'` for performance

### RAG API Environment Variables

Configure your RAG API instance with:

```bash
# In RAG API .env file:

# LibreChat webhook URL for status updates
LIBRECHAT_WEBHOOK_URL=http://librechat:3080

# PostgreSQL connection
POSTGRES_DB=rag_db
POSTGRES_USER=rag_user
POSTGRES_PASSWORD=secure_password
DB_HOST=postgres
DB_PORT=5432

# Embeddings configuration
EMBEDDINGS_PROVIDER=openai
EMBEDDINGS_MODEL=text-embedding-3-small
RAG_OPENAI_API_KEY=your_openai_api_key

# Optional: JWT secret for auth
# Should match LibreChat's JWT_SECRET or RAG_JWT_SECRET
JWT_SECRET=your_jwt_secret
```

## Data Flow

### Upload Flow

```
1. User uploads PDF via "Assistant" endpoint
   ↓
2. LibreChat frontend → POST /api/files
   - Multer saves to temp location
   ↓
3. files.js route handler
   - Detects endpoint === "Assistant"
   - Sets metadata.tool_resource = "file_search"
   - Calls processFileUpload()
   ↓
4. processFileUpload() in process.js
   - Detects tool_resource === "file_search"
   - Saves to storage (S3/Local/Firebase)
   - Calls uploadVectors()
   ↓
5. uploadVectors() in crud.js
   - Generates namespace: user@example.com → ns_user_example_com
   - POST to RAG_API_URL/upload/files/
   - Headers: X-Namespace, X-User-Email
   - Returns immediately with embedded: false
   ↓
6. MongoDB record created
   - file.embedded = false
   - file.source = "vectordb"
   ↓
7. Frontend shows "Procesare RAG..." badge (yellow)
   ↓
8. [RAG API] Processes file and creates embeddings
   ↓
9. [RAG API] Calls webhook
   - POST to LIBRECHAT_WEBHOOK_URL/api/files/webhooks/embedding
   - Body: { file_id, embedded: true }
   ↓
10. Webhook updates MongoDB
    - file.embedded = true
    ↓
11. Frontend updates to "Indexat" badge (green)
```

### Query Flow (Semantic Search)

```
1. User sends message with file attached
   ↓
2. AI agent detects file_search tool
   ↓
3. fileSearch.js tool
   - POST to RAG_API_URL/query
   - Headers: Authorization (JWT), X-Namespace
   - Body: { query, file_id, k: 5 }
   ↓
4. RAG API searches embeddings
   - Filters by namespace AND file_id
   - Returns top k results
   ↓
5. Results formatted and added to context
   ↓
6. AI generates response using retrieved context
```

### Delete Flow

```
1. User deletes file in UI
   ↓
2. LibreChat frontend → DELETE /api/files/:file_id
   ↓
3. processDeleteRequest()
   ↓
4. deleteLocalFile() / deleteFirebaseFile()
   - Checks: file.embedded && RAG_API_URL
   ↓
5. deleteVectors() in crud.js
   - Generates namespace
   - DELETE to RAG_API_URL/documents
   - Headers: Authorization (JWT), X-Namespace
   - Body: [file_id]
   ↓
6. [RAG API] Deletes embeddings
   - Filters by BOTH file_id AND namespace (CRITICAL!)
   ↓
7. Delete from MongoDB
   ↓
8. Delete physical file from storage
```

## Testing Configuration

### 1. Test Webhook Endpoint

```bash
# Test that LibreChat can receive webhook callbacks
curl -X POST http://localhost:3080/api/files/webhooks/embedding \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "test-file-123",
    "embedded": true
  }'

# Expected response: 200 OK
```

### 2. Test File Upload

```bash
# 1. Upload a PDF file via the UI using "Assistant" endpoint
# 2. Check LibreChat logs for:
#    - "[/files] upload meta: endpoint=Assistant tool_resource=file_search"
#    - "[uploadVectors] Starting upload to RAG"
#    - "[uploadVectors] Upload initiated for filename, returning immediately with embedded: false"

# 3. Check MongoDB:
db.files.findOne({ file_id: "your-file-id" })
# Should show: embedded: false, source: "vectordb"

# 4. Check RAG API logs for processing
# 5. Wait for webhook callback
# 6. Check MongoDB again:
# Should show: embedded: true
```

### 3. Test Semantic Search

```bash
# Send a query to RAG API directly
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -H "X-Namespace: ns_user_example_com" \
  -d '{
    "query": "What is this document about?",
    "file_id": "your-file-id",
    "k": 3
  }'

# Expected: Array of results with page_content and metadata
```

### 4. Test Delete

```bash
# 1. Delete file via UI
# 2. Check LibreChat logs for:
#    - "[deleteVectors] Deleting file from RAG - file_id: ..."
#    - "[deleteVectors] Successfully deleted from RAG"

# 3. Check RAG API logs for DELETE request
# 4. Verify embeddings are removed from PostgreSQL
```

## Troubleshooting

### Files Stuck in "Procesare RAG..."

**Symptoms**: File status shows "Procesare RAG..." (yellow badge) but never changes to "Indexat"

**Causes**:
1. RAG API webhook callback not implemented or failing
2. RAG API cannot reach LibreChat at LIBRECHAT_WEBHOOK_URL
3. RAG API processing failed without callback

**Solutions**:
```bash
# 1. Check RAG API logs for webhook attempts
# 2. Verify LIBRECHAT_WEBHOOK_URL is accessible from RAG API container
docker exec rag_api curl http://librechat:3080/api/files/webhooks/health

# 3. Manually trigger webhook for testing
curl -X POST http://localhost:3080/api/files/webhooks/embedding \
  -H "Content-Type: application/json" \
  -d '{ "file_id": "stuck-file-id", "embedded": true }'

# 4. Check MongoDB to see current state
db.files.find({ embedded: false }).pretty()
```

### Semantic Search Not Working

**Symptoms**: Files are embedded but search returns no results

**Causes**:
1. `RAG_DISABLE_QUERIES=true` is set
2. Namespace mismatch between upload and query
3. Missing X-Namespace header in query

**Solutions**:
```bash
# 1. Check environment variables
echo $RAG_DISABLE_QUERIES  # Should be empty or "false"

# 2. Check namespace generation in logs
# Should see: "[uploadVectors] Starting upload to RAG - namespace: ns_user_example_com"

# 3. Test query with explicit namespace
curl -X POST http://localhost:8000/query \
  -H "X-Namespace: ns_user_example_com" \
  -d '{ "query": "test", "file_id": "your-id", "k": 3 }'
```

### Delete Not Removing Embeddings

**Symptoms**: File deleted from LibreChat but embeddings remain in RAG API

**Causes**:
1. Namespace filtering not implemented in RAG API DELETE endpoint
2. `file.embedded` is false so delete is skipped
3. `RAG_API_URL` not set

**Solutions**:
```bash
# 1. Verify RAG_API_URL is set
echo $RAG_API_URL

# 2. Check file status before delete
db.files.findOne({ file_id: "file-to-delete" })
# embedded should be true for delete to trigger

# 3. Check LibreChat logs for delete attempt
# Should see: "[deleteVectors] Deleting file from RAG - file_id: ..."

# 4. Verify RAG API has namespace filtering in DELETE
# See rag-api-modifications.md for implementation
```

### Namespace Issues

**Symptoms**: User can see other users' files or cannot find their own

**Causes**:
1. Namespace not being sent in requests
2. RAG API not filtering by namespace
3. Namespace generation inconsistent

**Solutions**:
```bash
# 1. Check namespace generation consistency
# LibreChat uses sanitizeNamespace() which:
#    - Converts to lowercase
#    - Replaces [@.-] with _
#    - Replaces other special chars with _
#    - Adds prefix ns_ if doesn't start with letter
#    - Max 63 characters

# 2. Test namespace generation
# user@example.com → ns_user_example_com
# user-name@test.org → ns_user_name_test_org

# 3. Verify X-Namespace header is sent
# Check RAG API logs for incoming requests
```

### Docker Network Issues

**Symptoms**: Connection refused errors between containers

**Causes**:
1. Containers on different networks
2. Wrong hostname in environment variables
3. Port not exposed

**Solutions**:
```bash
# 1. Check docker network
docker network ls
docker network inspect your_network_name

# 2. Verify container connectivity
docker exec librechat curl http://rag_api:8000/health
docker exec rag_api curl http://librechat:3080/api/health

# 3. Use container names, not localhost
# ✅ CORRECT: http://rag_api:8000
# ❌ WRONG:   http://localhost:8000
```

## Security Considerations

### Critical Security Requirements

1. **Namespace Isolation** (CRITICAL)
   - RAG API MUST filter all operations by namespace
   - Without this, users can delete other users' embeddings
   - See rag-api-modifications.md Section 3 for implementation

2. **JWT Authentication**
   - DELETE operations use short-lived JWT tokens
   - Tokens include user ID for validation
   - Secret must match between LibreChat and RAG API

3. **File Ownership Validation**
   - LibreChat validates file ownership before delete
   - RAG API should also validate based on namespace

4. **Input Sanitization**
   - Namespace is sanitized to prevent SQL injection
   - File IDs are validated before use

### Best Practices

1. **Use HTTPS in Production**
   ```bash
   RAG_API_URL=https://rag-api.yourdomain.com
   LIBRECHAT_WEBHOOK_URL=https://librechat.yourdomain.com
   ```

2. **Rotate JWT Secrets Regularly**
   ```bash
   # Generate new secret
   openssl rand -base64 32
   ```

3. **Monitor Failed Webhook Attempts**
   - Set up alerts for repeated webhook failures
   - Check logs regularly for errors

4. **Use Secrets Manager**
   - Don't commit secrets to git
   - Use Docker secrets or environment-specific configs

## Performance Optimization

### PostgreSQL Indexing

Add these indexes to your RAG API PostgreSQL database:

```sql
-- Index for namespace filtering (REQUIRED)
CREATE INDEX idx_embeddings_namespace ON embeddings USING GIN ((cmetadata -> 'namespace'));

-- Index for file_id filtering
CREATE INDEX idx_embeddings_source ON embeddings USING GIN ((cmetadata -> 'source'));

-- Composite index for namespace + file_id queries
CREATE INDEX idx_embeddings_namespace_source ON embeddings USING GIN (
  (cmetadata -> 'namespace'),
  (cmetadata -> 'source')
);
```

### Connection Pooling

Configure connection pooling in RAG API:

```python
# In RAG API database connection
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### Webhook Timeout

Adjust timeout for webhook callbacks:

```bash
# In LibreChat .env
WEBHOOK_TIMEOUT=30000  # 30 seconds
```

## Migration from Orchestrator

If you're migrating from the orchestrator-based integration:

### Step 1: Update Environment Variables

```bash
# Before (Orchestrator)
ORCHESTRATOR_URL=http://orchestrator-agent.totalsoft.local
ORCHESTRATOR_API_KEY=your_api_key
EMBEDDINGS_NAMESPACE_MAXLEN=64

# After (RAG API)
RAG_API_URL=http://rag_api:8000
LIBRECHAT_WEBHOOK_URL=http://librechat:3080
# EMBEDDINGS_NAMESPACE_MAXLEN removed - uses 63 char PostgreSQL limit
```

### Step 2: Update librechat.yaml

No changes needed! The "Assistant" endpoint configuration remains the same.

### Step 3: Re-upload Files

Files uploaded via orchestrator will NOT work with RAG API. Users must:
1. Delete old files
2. Re-upload files after migration
3. New files will be embedded in RAG API

### Step 4: Verify Migration

```bash
# 1. Check that orchestrator variables are removed
env | grep ORCHESTRATOR  # Should return nothing

# 2. Check that RAG variables are set
env | grep RAG_API_URL

# 3. Upload test file
# 4. Verify webhook callback
# 5. Test semantic search
```

## Reference Documentation

- [RAG API Modifications](./rag-api-modifications.md) - Required changes to RAG API
- [RAG Integration Architecture](./rag-integration.md) - Complete integration guide
- [Main Configuration](../CLAUDE.md) - LibreChat configuration overview

---

**Last Updated:** 2025-10-31
**Version:** 1.0
**Maintainer:** Development Team
