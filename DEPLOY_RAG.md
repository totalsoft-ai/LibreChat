# Deployment Guide: RAG API Integration

## Quick Start

### Step 1: Build Packages

După modificările făcute, packages-urile trebuie rebuild-uite:

```bash
# Build toate packages-urile în ordine corectă
npm run build:packages

# Sau individual:
npm run build:data-schemas
npm run build:data-provider
npm run build:api
```

### Step 2: Configure Environment Variables

Editează `.env` și adaugă:

```bash
# RAG API Integration
RAG_API_URL=http://rag_api:8000
LIBRECHAT_WEBHOOK_URL=http://librechat:3080

# Optional: Disable queries dacă vrei doar embedding
# RAG_DISABLE_QUERIES=false

# ELIMINĂ variabilele de orchestrator (nu mai sunt folosite)
# ORCHESTRATOR_URL=...
# ORCHESTRATOR_API_KEY=...
# EMBEDDINGS_NAMESPACE_MAXLEN=...
```

### Step 3: Restart Backend

```bash
# Stop backend
npm run backend:stop

# Start backend în dev mode
npm run backend:dev
```

### Step 4: Restart Frontend (dacă rulează)

```bash
# Ctrl+C pentru a opri
# Apoi restart:
npm run frontend:dev
```

---

## Verificare Rapidă

### 1. Check Logs la Startup

Când pornești backend-ul, ar trebui să vezi:

```
[files.js] upload meta: endpoint=Assistant tool_resource=file_search
```

### 2. Test în Browser

1. Deschide LibreChat: http://localhost:3080
2. Selectează endpoint-ul "Assistant"
3. Click pe butonul de attach file (📎) - **ar trebui să apară**
4. Upload un PDF
5. Verifică în panoul din dreapta:
   - Status "Procesare RAG..." (galben) → "Indexat" (verde) după webhook

### 3. Check MongoDB

```javascript
// Connect la MongoDB
db.files.find({ endpoint: "Assistant" }).pretty()

// Ar trebui să vezi:
{
  file_id: "file-xxx",
  embedded: false,  // inițial
  source: "local",  // sau "s3", "firebase"
  tool_resource: "file_search",
  // ... alte câmpuri
}

// După webhook callback:
{
  embedded: true,  // actualizat!
}
```

---

## Troubleshooting

### Problema: Butonul de attach file NU apare

**Cauză:** Packages-urile nu sunt build-uite sau frontend-ul nu s-a reîncărcat

**Soluție:**
```bash
# 1. Rebuild packages
npm run build:packages

# 2. Restart frontend (hard refresh)
# Închide tab-ul complet și redeschide
# Sau apasă Ctrl+Shift+R pentru hard reload
```

### Problema: Files uploaded dar embedded rămâne false

**Cauză:** RAG API nu trimite webhook callback

**Soluție:**
```bash
# 1. Verifică că RAG API rulează
curl http://localhost:8000/health

# 2. Test manual webhook
curl -X POST http://localhost:3080/api/files/webhooks/embedding \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "file-id-from-mongodb",
    "embedded": true
  }'

# 3. Check logs RAG API pentru erori
docker logs rag_api
```

### Problema: Error "RAG_API_URL not defined"

**Cauză:** Environment variable nu este setat corect

**Soluție:**
```bash
# Verifică .env
cat .env | grep RAG_API_URL

# Ar trebui să vezi:
RAG_API_URL=http://rag_api:8000

# Restart backend după modificare
npm run backend:stop
npm run backend:dev
```

### Problema: Files se uploadează dar nu apar în RAG API

**Cauză:** Modificările în `files.js` nu au avut efect sau endpoint-ul nu este "Assistant"

**Soluție:**
```bash
# 1. Verifică endpoint-ul în librechat.yaml
grep -A5 'name: "Assistant"' librechat.yaml

# 2. Check logs backend pentru:
[/files] upload meta: endpoint=Assistant tool_resource=file_search
[uploadVectors] Starting upload to RAG

# 3. Dacă nu vezi logs-urile, verifică că:
#    - Endpoint-ul selectat în UI este exact "Assistant"
#    - Fișierul este document (PDF, DOCX, TXT), nu imagine
```

---

## Verificare Completă: Script de Test

Rulează scriptul de integrare completă:

```bash
# Setează environment variables
export RAG_API_URL=http://localhost:8000
export LIBRECHAT_URL=http://localhost:3080

# Rulează toate testele
chmod +x test_rag_integration.sh
./test_rag_integration.sh
```

**Output așteptat:**
```
=========================================
RAG API Integration Test Suite
=========================================

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

---

## Production Deployment

### Docker Compose Setup

Creează `docker-compose.rag.yml`:

```yaml
version: '3.8'

services:
  vectordb:
    image: pgvector/pgvector:0.8.0-pg15
    environment:
      POSTGRES_DB: rag_db
      POSTGRES_USER: rag_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - vectordb_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - librechat

  rag_api:
    image: ghcr.io/danny-avila/librechat-rag-api-dev:latest
    environment:
      - DB_HOST=vectordb
      - DB_PORT=5432
      - POSTGRES_DB=rag_db
      - POSTGRES_USER=rag_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - RAG_PORT=8000
      - EMBEDDINGS_PROVIDER=openai
      - RAG_OPENAI_API_KEY=${RAG_OPENAI_API_KEY}
      - LIBRECHAT_WEBHOOK_URL=http://librechat:3080
    depends_on:
      - vectordb
    ports:
      - "8000:8000"
    networks:
      - librechat

  librechat:
    # Your existing LibreChat config
    environment:
      - RAG_API_URL=http://rag_api:8000
      - LIBRECHAT_WEBHOOK_URL=http://librechat:3080
    networks:
      - librechat

volumes:
  vectordb_data:

networks:
  librechat:
    driver: bridge
```

### Start Services

```bash
# Start toate serviciile
docker-compose -f docker-compose.yml -f docker-compose.rag.yml up -d

# Check logs
docker-compose logs -f rag_api
docker-compose logs -f librechat
```

---

## Next Steps

După ce totul funcționează:

1. ✅ **Verifică că butonul de attach apare** în UI pentru "Assistant"
2. ✅ **Upload un fișier test** (PDF sau TXT)
3. ✅ **Verifică status badges** în panoul din dreapta
4. ✅ **Modifică RAG API** conform `docs/rag-api-modifications.md`
5. ✅ **Test semantic search** (dacă implementat în RAG API)

---

## Documentation

- **Setup Guide**: `docs/rag-api-configuration.md`
- **Architecture**: `docs/rag-integration.md`
- **RAG API Changes**: `docs/rag-api-modifications.md`

---

**Last Updated:** 2025-10-31
**Status:** Ready for deployment
