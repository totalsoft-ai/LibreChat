# Workspace RAG Implementation - Diagnostic Guide

## Overview

This guide helps you diagnose and test the Workspace RAG (Retrieval Augmented Generation) implementation.

---

## ✅ Implementation Complete

### PHASE 1: Workspace Name Uniqueness (CRITICAL)
- ✅ Backend model enforces unique workspace names
- ✅ Backend validation prevents duplicate names
- ✅ Frontend shows error when name exists

### PHASE 2: Workspace RAG Filtering
- ✅ `primeFiles()` filters by workspace
- ✅ `getNamespace()` uses workspace.name for VectorDB namespace
- ✅ `createFileSearchTool()` uses workspace-aware namespace

### PHASE 3: Start Page RAG UI
- ✅ Search interface for workspace files
- ✅ Shows indexed file count
- ✅ Navigates to chat with RAG enabled

### PHASE 4: Embedding Status Badges
- ✅ "Indexed" badge (green) for embedded files
- ✅ "Processing..." badge (yellow) for pending files

---

## How RAG Namespace Works

### 1. Workspace Name → Namespace

**Flow:**
```
Workspace Name: "Marketing Team"
     ↓
getNamespace({ user, workspaceId: "ws_abc123" })
     ↓
Find workspace in MongoDB by workspaceId
     ↓
sanitizeNamespace(workspace.name)
     ↓
Namespace: "ns_marketing_team"
```

**Code:** `api/server/services/Files/VectorDB/crud.js:38-56`

```javascript
async function getNamespace({ user, workspaceId }) {
  if (workspaceId) {
    const workspace = await Workspace.findOne({ workspaceId, isActive: true });
    if (workspace && workspace.name) {
      return sanitizeNamespace(workspace.name); // ✅ Uses NAME
    }
  }
  return sanitizeNamespace(user?.email || user?.id);
}
```

### 2. File Upload with Workspace

**Flow:**
```
User uploads file in workspace "Marketing Team"
     ↓
WorkspaceFilesWidget sets:
  - formData.append('workspace', workspaceId)
  - formData.append('tool_resource', 'file_search')
     ↓
Backend: processAgentFileUpload()
     ↓
uploadVectors({ req, file, file_id, workspaceId })
     ↓
namespace = getNamespace({ user, workspaceId })
     ↓
POST ${RAG_API_URL}/embed
  Header: X-Namespace: ns_marketing_team
     ↓
RAG API stores in pgvector with namespace
     ↓
Webhook updates: embedded: true
```

**Code:** `api/server/services/Files/process.js:695-701`

### 3. RAG Search with Workspace

**Flow:**
```
User searches from Start Page
     ↓
Navigate to /c/new with:
  - workspaceId: "ws_abc123"
  - initialMessage: "What is..."
  - fileSearchEnabled: true
     ↓
Agent initialization
     ↓
primeFiles({ req, agentId, workspaceId })
     ↓
Query: { user, embedded: true, filepath: 'vectordb', workspace: workspaceId }
     ↓
Returns ONLY files from this workspace
     ↓
createFileSearchTool({ ..., workspaceId })
     ↓
namespace = getNamespace({ user, workspaceId })
     ↓
POST ${RAG_API_URL}/query
  Header: X-Namespace: ns_marketing_team
     ↓
Returns results ONLY from "Marketing Team" namespace
```

**Modified Code:**
- `api/app/clients/tools/util/fileSearch.js:22-56` - Added workspace filter
- `api/app/clients/tools/util/fileSearch.js:130-158` - Uses getNamespace()
- `api/app/clients/tools/util/handleTools.js:331` - Passes workspaceId

---

## Diagnostic Checklist

### ✅ Step 1: Verify Workspace Name Uniqueness

**Test:**
```
1. Create workspace "Test Workspace"
2. Try creating another "Test Workspace"
3. Expected: Error "A workspace with this name already exists"
```

**Check:**
```javascript
// MongoDB query
db.workspaces.find({ name: "Test Workspace", isArchived: false })
// Should return max 1 document
```

---

### ⚠️ Step 2: Verify RAG API Configuration

**Required Environment Variables:**

```bash
# In .env file
RAG_API_URL=http://rag_api:8000
LIBRECHAT_WEBHOOK_URL=http://librechat:3080/api/files/webhooks/embedding
```

**Test RAG API Health:**
```bash
curl http://rag_api:8000/health
# Expected: {"status": "ok"}
```

**If RAG API is not configured:**
- Files will NOT be vectorized (embedded remains false)
- RAG search will not work
- You need to deploy RAG API service separately

---

### ✅ Step 3: Test File Upload & Vectorization

**Process:**
```
1. Create workspace "RAG Test" (unique name)
2. Go to Start Page for "RAG Test"
3. Upload PDF file in WorkspaceFilesWidget
4. Check badge shows "Processing..." (yellow)
5. Wait 10-30 seconds
6. Badge should change to "Indexed" (green)
```

**Backend Logs to Check:**
```
[uploadVectors] Starting upload to RAG - file: document.pdf, workspace: ws_xxx, namespace: ns_rag_test
[uploadVectors] File document.pdf successfully processed by RAG API
[uploadVectors] Successfully updated database for file_id with embedded: true
```

**MongoDB Verification:**
```javascript
// Check file record
db.files.findOne({ file_id: "file_xxx" })

// Expected fields:
{
  file_id: "file_xxx",
  filename: "document.pdf",
  workspace: "ws_xxx",
  filepath: "vectordb",
  embedded: true,  // ✅ Should be true after processing
  user: "user_yyy"
}
```

**RAG API Verification:**
```bash
# Query RAG API directly
curl -X POST http://rag_api:8000/query \
  -H "X-Namespace: ns_rag_test" \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "k": 5}'

# Should return: Array of matching chunks
```

---

### ✅ Step 4: Test RAG Search from Start Page

**Process:**
```
1. Go to workspace with indexed files
2. Start Page should show: "Ask About Workspace Files"
3. Count should match: "Search across X indexed documents"
4. Enter query: "What is [topic in document]?"
5. Click "Search" button
6. Should navigate to /c/new with pre-filled message
```

**Expected Behavior:**
- New conversation starts
- Agent automatically uses file_search tool
- Searches ONLY workspace files
- Returns answer with citations: "According to [filename], ..."

**Backend Logs to Check:**
```
[primeFiles] No files attached, fetching all indexed files for user: user_xxx in workspace ws_yyy
[primeFiles] Filtering files by workspace: ws_yyy
[primeFiles] Found 5 indexed files for user user_xxx in workspace ws_yyy
[createFileSearchTool] Created tool with 5 files available for user user_xxx in workspace ws_yyy
[file_search] Tool invoked with query: "What is...", files available: 5 in workspace ws_yyy
[file_search] Using namespace: ns_rag_test for user: user_xxx in workspace ws_yyy
```

---

### ✅ Step 5: Test Namespace Isolation

**Scenario:** Verify files from different workspaces don't leak

**Setup:**
```
1. Create "Workspace A" (unique name)
   - Upload "doc-a.pdf" with content about Topic A
2. Create "Workspace B" (unique name)
   - Upload "doc-b.pdf" with content about Topic B
```

**Test in Workspace A:**
```
1. Go to Start Page for "Workspace A"
2. Search: "What is Topic A?"
3. ✅ Should find info from doc-a.pdf
4. Search: "What is Topic B?"
5. ✅ Should NOT find info (not in workspace)
```

**MongoDB Verification:**
```javascript
// Check files in Workspace A
db.files.find({
  workspace: "ws_workspace_a_id",
  embedded: true,
  filepath: "vectordb"
})
// Should only return doc-a.pdf

// Check files in Workspace B
db.files.find({
  workspace: "ws_workspace_b_id",
  embedded: true,
  filepath: "vectordb"
})
// Should only return doc-b.pdf
```

**Namespace Verification:**
```bash
# Workspace A namespace
ns_workspace_a

# Workspace B namespace
ns_workspace_b

# These are ISOLATED in pgvector
```

---

## Common Issues & Solutions

### Issue 1: Files not vectorizing (embedded: false)

**Symptoms:**
- Badge stays yellow "Processing..." forever
- No "Indexed" badge appears

**Causes & Fixes:**

1. **RAG_API_URL not configured**
   ```bash
   # Add to .env
   RAG_API_URL=http://rag_api:8000
   ```

2. **RAG API not running**
   ```bash
   # Check if RAG API container is running
   docker ps | grep rag_api

   # Start RAG API service
   docker-compose up rag_api
   ```

3. **Network issue between LibreChat and RAG API**
   ```bash
   # Test connectivity from LibreChat container
   docker exec librechat curl http://rag_api:8000/health
   ```

4. **File type not supported by RAG API**
   - Supported: PDF, TXT, DOCX, MD
   - Not supported: Images, Videos, Archives

5. **Webhook not configured**
   ```bash
   # Add to .env
   LIBRECHAT_WEBHOOK_URL=http://librechat:3080/api/files/webhooks/embedding
   ```

---

### Issue 2: Workspace name conflict

**Symptoms:**
- Error: "A workspace with this name already exists"

**Solution:**
- Choose a different workspace name
- Workspace names MUST be unique (enforced at DB level)

---

### Issue 3: RAG searches all user files instead of workspace files

**Symptoms:**
- Search returns results from files outside workspace

**Diagnosis:**
```javascript
// Check backend logs
[primeFiles] Found 50 indexed files for user user_xxx in all namespaces
// ❌ Should say "in workspace ws_xxx"
```

**Cause:**
- workspaceId not passed through request/conversation

**Fix:**
- Ensure conversation has workspace field set
- Verify workspaceId is extracted in backend
- Check logs show: "Filtering files by workspace: ws_xxx"

---

### Issue 4: No results from RAG search

**Symptoms:**
- AI says: "I could not find this information"

**Diagnosis:**
1. **Check files are indexed:**
   ```javascript
   db.files.find({
     workspace: "ws_xxx",
     embedded: true,
     filepath: "vectordb"
   })
   ```

2. **Check namespace:**
   ```bash
   # Backend logs
   [file_search] Using namespace: ns_workspace_name
   ```

3. **Test RAG API directly:**
   ```bash
   curl -X POST http://rag_api:8000/query \
     -H "X-Namespace: ns_workspace_name" \
     -d '{"query": "test", "k": 5}'
   ```

**Possible Causes:**
- Namespace mismatch (upload vs query)
- Files indexed in wrong namespace
- Query doesn't match document content

---

## Namespace Sanitization Rules

**Function:** `sanitizeNamespace()`

**Rules:**
1. Convert to lowercase
2. Replace `-`, `.`, `@`, whitespace with `_`
3. Replace any non-alphanumeric (except `_`) with `_`
4. Prefix with `ns_` if doesn't start with letter
5. Trim to max 63 characters
6. Remove leading/trailing underscores

**Examples:**
```javascript
"Marketing Team"     → "ns_marketing_team"
"Dev-Workspace"      → "ns_dev_workspace"
"user@example.com"   → "ns_user_example_com"
"123workspace"       → "ns_123workspace"
"Very Long Workspace Name That Exceeds Sixty Three Characters Limit"
  → "ns_very_long_workspace_name_that_exceeds_sixty_three_charac"
```

---

## Files Modified

### Backend
1. **`api/models/Workspace.js:140-147`**
   - Added `unique: true` + `index: true` to name field

2. **`api/server/controllers/workspaces.js`**
   - Added uniqueness validation in createWorkspace
   - Added uniqueness validation in updateWorkspace
   - Error handling for duplicate names (409 Conflict)

3. **`api/app/clients/tools/util/fileSearch.js:22-56`**
   - Added `workspaceId` parameter to primeFiles
   - Added workspace filter to file query

4. **`api/app/clients/tools/util/fileSearch.js:130-158`**
   - Added `workspaceId` parameter to createFileSearchTool
   - Uses `getNamespace()` for workspace-aware namespace

5. **`api/app/clients/tools/util/handleTools.js:331`**
   - Passes `workspaceId` to createFileSearchTool

6. **`api/server/services/Files/VectorDB/crud.js:38-56`**
   - ✅ Already uses `workspace.name` for namespace (no changes needed)

### Frontend
1. **`client/src/components/Nav/Workspaces/CreateWorkspaceDialog.tsx`**
   - Added nameError state
   - Handle 409 error with user-friendly message
   - Clear error on input change

2. **`client/src/components/Workspace/StartPage.tsx`**
   - Added RAG search state (searchQuery, searchResults, isSearching)
   - Added indexed files query and filter
   - Added handleSearchSubmit for RAG queries
   - Added RAG search UI section

3. **`client/src/components/Workspace/Widgets/WorkspaceFilesWidget.tsx`**
   - Added CheckCircle and Clock icons
   - Added embedding status badges
   - Green "Indexed" for embedded: true
   - Yellow "Processing..." for embedded: false

---

## Testing Commands

### Check Workspace Uniqueness
```javascript
// MongoDB Shell
use librechat

// Find all workspaces with same name
db.workspaces.aggregate([
  { $match: { isArchived: false } },
  { $group: { _id: "$name", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
// Should return empty array
```

### Check File Embedding Status
```javascript
// MongoDB Shell
use librechat

// Count embedded files per workspace
db.files.aggregate([
  { $match: { filepath: "vectordb", embedded: true } },
  { $group: {
      _id: "$workspace",
      count: { $sum: 1 },
      files: { $push: "$filename" }
  }}
])
```

### Check Namespace Usage
```bash
# Backend logs when uploading file
grep "getNamespace" /path/to/librechat.log | tail -20

# Expected output:
# [getNamespace] Using workspace name for namespace: Marketing Team
# [uploadVectors] Starting upload to RAG - namespace: ns_marketing_team
```

---

## Summary

The implementation ensures:

✅ **Workspace names are UNIQUE** → Prevents namespace collisions
✅ **Namespace uses workspace NAME** → Human-readable, isolated per workspace
✅ **Files filtered by workspace** → Only workspace files in RAG search
✅ **UI shows embedding status** → User knows when files are ready
✅ **Start Page RAG interface** → Easy access to workspace knowledge base

**Critical Flow:**
```
Workspace "Marketing Team" (unique)
  ↓
Upload file → workspace: ws_xxx
  ↓
Namespace: ns_marketing_team (from name)
  ↓
RAG API stores with X-Namespace: ns_marketing_team
  ↓
Search queries same namespace
  ↓
Results ONLY from "Marketing Team" workspace
```
