# Workspace Features - Ghid de Debugging

## Problema Raportată
- ❌ Tab "Models" nu apare în WorkspaceSettings
- ❌ Start Page nu se afișează când selectezi un workspace

## Fix-uri Aplicate (2025-11-17)

### 1. Fix TypeScript - WorkspaceSelector
**Problema**: `handleSelectWorkspace` primea `null` dar tipul era doar `string`
**Fix**: Schimbat tipul la `string | null` în `WorkspaceSelector.tsx:60`

```typescript
// ÎNAINTE:
const handleSelectWorkspace = useCallback((workspaceId: string) => {

// DUPĂ:
const handleSelectWorkspace = useCallback((workspaceId: string | null) => {
```

### 2. Fix Grid Layout - WorkspaceSettings
**Problema**: TabsList avea `grid-cols-3` fix, dar tab-ul Models apare doar pentru owner
**Fix**: Grid dinamic în `WorkspaceSettings.tsx:253`

```typescript
// ÎNAINTE:
<TabsList className="grid w-full grid-cols-3">

// DUPĂ:
<TabsList className={`grid w-full ${isOwner ? 'grid-cols-3' : 'grid-cols-2'}`}>
```

### 3. Fix Salvare Conversații în Workspace 🔴 CRITIC
**Problema**: Conversațiile create în workspace apareau în "Personal" mode, nu în workspace
**Cauză**: `useNewConvo` nu salvă `workspace` când creează conversația
**Fix**: Adăugat `currentWorkspaceId` în obiectul conversation în `useNewConvo.ts:253`

```typescript
// ÎNAINTE:
const conversation = {
  conversationId: Constants.NEW_CONVO as string,
  title: 'New Chat',
  endpoint: null,
  ...template,
  createdAt: '',
  updatedAt: '',
};

// DUPĂ:
const conversation = {
  conversationId: Constants.NEW_CONVO as string,
  title: 'New Chat',
  endpoint: null,
  ...template,
  workspace: currentWorkspaceId, // ✨ FIX PRINCIPAL
  createdAt: '',
  updatedAt: '',
};
```

**Impact**: Acum conversațiile se salvează corect în workspace-ul activ și apar în sidebar când ești în acel workspace!

## Cum să Testezi

### Test 1: Models Tab (doar pentru Owner)
1. Autentifică-te ca owner al unui workspace
2. Deschide WorkspaceSettings (Settings icon lângă workspace în selector)
3. **TREBUIE să vezi 3 tab-uri**: General, Members, Models
4. Click pe "Models" tab
5. **TREBUIE să vezi**:
   - Mesaj "Model Access Control"
   - Notă despre API endpoint
   - Lista modelelor restricționate (dacă există)

### Test 2: Models Tab NU apare pentru non-owner
1. Autentifică-te ca member/admin (NU owner)
2. Deschide WorkspaceSettings
3. **TREBUIE să vezi DOAR 2 tab-uri**: General, Members
4. Tab-ul "Models" NU ar trebui să fie vizibil

### Test 3: Start Page - Prima Intrare
1. Creează un workspace nou (vei fi owner automat)
2. Selectează alt workspace sau "Personal"
3. Selectează workspace-ul nou creat din WorkspaceSelector
4. **TREBUIE să vezi**: Pagina de start cu:
   - Header cu numele workspace-ului
   - Conținut welcome (dacă e configurat)
   - Statistici (conversations, messages, tokens)
   - Buton "Start Chatting"
   - Checkbox "Don't show this page again"

### Test 4: Start Page - Vizualizări Subsecvente
1. Click "Start Chatting" (fără să bifezi checkbox-ul)
2. Selectează alt workspace
3. Revino la primul workspace
4. **NU trebuie să vezi** start page-ul (deja văzut, salvat în localStorage)

### Test 5: Start Page - Don't Show Again
1. Șterge localStorage: `localStorage.removeItem('workspace_WORKSPACE_ID_start_page_seen')`
2. Selectează workspace-ul
3. Bifează "Don't show this page again"
4. Click "Start Chatting"
5. Selectează alt workspace și revino
6. **NU trebuie să vezi** start page-ul niciodată

### Test 6: Start Page Disabled
1. Folosește API pentru a dezactiva start page:
```bash
curl -X PUT http://localhost:3080/api/workspaces/WORKSPACE_ID/settings/start-page \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```
2. Selectează workspace-ul
3. **NU trebuie să vezi** start page-ul
4. Vei merge direct la `/c/new`

## Debugging în Browser Console

### Verifică dacă workspace are start page enabled:
```javascript
// În console
const workspaceId = 'WORKSPACE_ID';
const seenKey = `workspace_${workspaceId}_start_page_seen`;
console.log('Start page seen:', localStorage.getItem(seenKey));

// Resetează pentru a vedea din nou:
localStorage.removeItem(seenKey);
```

### Verifică currentWorkspaceId:
```javascript
// În console (după ce ai deschis app-ul)
console.log('Current workspace:', localStorage.getItem('currentWorkspaceId'));
```

### Verifică dacă ești owner:
```javascript
// În WorkspaceSettings component, adaugă console.log temporar:
console.log('Is owner:', isOwner);
console.log('User role:', getUserRole(workspace));
```

## Probleme Comune

### Models tab nu apare
**Cauze posibile**:
- ✅ Nu ești owner al workspace-ului (comportament normal)
- ❌ Build-ul client nu e updated (rulează `npm run build:client`)
- ❌ Cache-ul browser-ului (Ctrl+Shift+R pentru hard refresh)

**Verificare**:
```bash
# În terminal
npm run build:client
# Apoi hard refresh în browser (Ctrl+Shift+R)
```

### Start Page nu apare
**Cauze posibile**:
- ✅ Ai mai vizitat workspace-ul (localStorage are `true`)
- ✅ Start page e disabled în settings (`enabled: false`)
- ❌ Eroare în routing (verifică console browser)
- ❌ Component nu e importat corect

**Verificare console**:
```javascript
// Ar trebui să vezi navigare către:
// /workspace/WORKSPACE_ID/start

// Verifică dacă ruta există:
console.log(window.location.pathname);
```

### Start Page se încarcă dar arată eroare
**Cauze posibile**:
- ❌ API endpoint nu răspunde (`GET /api/workspaces/:id/start-page`)
- ❌ Workspace nu există sau nu ai acces
- ❌ Backend nu rulează

**Verificare Network tab**:
1. Deschide DevTools → Network
2. Selectează workspace
3. Caută request către `/api/workspaces/.../start-page`
4. Verifică status code (trebuie 200)

## API Endpoints pentru Testare

### 1. Configurare Models (Owner Only)
```bash
# Restricționează doar la gpt-4o și claude-3-5-sonnet
curl -X PUT http://localhost:3080/api/workspaces/WORKSPACE_ID/settings/models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "availableModels": ["gpt-4o", "claude-3-5-sonnet"],
    "availableEndpoints": ["openAI", "anthropic"]
  }'

# Permite toate modelele
curl -X PUT http://localhost:3080/api/workspaces/WORKSPACE_ID/settings/models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "availableModels": null,
    "availableEndpoints": null
  }'
```

### 2. Configurare Start Page (Admin/Owner)
```bash
# Activează și configurează start page
curl -X PUT http://localhost:3080/api/workspaces/WORKSPACE_ID/settings/start-page \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "title": "Welcome to {workspace_name}!",
    "content": "## Bine ați venit!\n\nAcesta este workspace-ul nostru de echipă.",
    "showStats": true,
    "customLinks": [
      {
        "title": "Documentation",
        "url": "https://example.com/docs",
        "icon": "document"
      }
    ]
  }'

# Dezactivează start page
curl -X PUT http://localhost:3080/api/workspaces/WORKSPACE_ID/settings/start-page \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### 3. Obține Start Page (Toți membrii)
```bash
curl http://localhost:3080/api/workspaces/WORKSPACE_ID/start-page \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Verificare Finală

După fix-uri, rulează:
```bash
# 1. Build packages
npm run build:packages

# 2. Build client
npm run build:client

# 3. Restart dev server (dacă rulează)
npm run frontend:dev

# 4. Hard refresh în browser
# Ctrl+Shift+R (Chrome/Edge)
# Cmd+Shift+R (Mac)
```

## Status Build
✅ Toate pachetele compilate cu succes (2025-11-17)
✅ Client build successful
✅ TypeScript errors rezolvate
✅ Grid layout fix aplicat

## Next Steps
1. Testează manual în browser
2. Verifică dacă ești owner pentru a vedea Models tab
3. Șterge localStorage pentru a vedea start page din nou
4. Raportează orice problemă nouă găsită
