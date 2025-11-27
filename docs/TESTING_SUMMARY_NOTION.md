# 📋 Manual Testing - Dev Environment Setup

> **Task:** Testare manuală PR #21 - Development Environment
> **Assignee:** Roxana Ene
> **Created:** 27 noiembrie 2025
> **Estimated Time:** 2-3 ore

---

## 🎯 Obiectiv

Validare setup dev environment separat de production implementat în PR #21.

### Ce s-a implementat în PR #21:

✅ Environment de development separat (namespace `librechat-dev`)
✅ Workflow GitHub Actions automatizat pentru deployment
✅ Configurare Kubernetes dedicată dev/prod
✅ Rebranding aplicației în "Tessa"
✅ Debug activat în development

---

## 📊 Schimbări Tehnice

### GitHub Actions

| Fișier | Modificări | Impact |
|--------|-----------|--------|
| `deploy_environment.yml` | **NOU** - 128 linii | Workflow manual pentru dev/prod deployment |
| `_ts-build-deploy.yml` | Eliminat trigger automat pe `main` | Mai mult control manual |

### Kubernetes Config

| Environment | Namespace | Host | Image Tag | Resources |
|-------------|-----------|------|-----------|-----------|
| **Development** | `librechat-dev` | `librechat-dev.totalsoft.local` | `dev` | 500m-1CPU, 1-2Gi RAM |
| **Production** | `librechat` | `tessa.totalsoft.local` | `latest` | (production values) |

### Key Features

🔧 **Dev Config (`custom-values_dev.yaml`)**
- Debug flags activate (DEBUG_CONSOLE, DEBUG_LOGGING)
- Resurse limitate pentru dev (1 CPU, 2Gi RAM)
- 1 replica
- Host aliases pentru Keycloak și MCP

🚀 **Production Config**
- APP_TITLE schimbat în "Tessa"
- Host: `tessa.totalsoft.local`
- Production-ready resources

---

## ✅ Plan de Testare - 10 Test Cases

### 🔵 Critice (Must Pass)

| ID | Test Case | Durată | Descriere |
|----|-----------|--------|-----------|
| **TC-03** | K8s Deployment - Dev | 20 min | Validare pods/services/ingress în dev |
| **TC-06** | UI Functionality | 30 min | Test login, chat, debug logs |
| **TC-07** | Production Non-regression | 15 min | Validare că production nu e afectat |

### 🟢 Importante

| ID | Test Case | Durată | Descriere |
|----|-----------|--------|-----------|
| **TC-01** | GitHub Actions - Dev | 15 min | Workflow deployment în dev |
| **TC-05** | Networking | 20 min | DNS, SSL, connectivity |
| **TC-08** | Secrets Management | 15 min | Validare ~25 secrets |

### 🟡 Nice to Have

| ID | Test Case | Durată | Descriere |
|----|-----------|--------|-----------|
| **TC-02** | GitHub Actions - Prod | 10 min | Workflow deployment în production |
| **TC-04** | Configuration | 15 min | Compare dev vs prod config |
| **TC-09** | Image Registry | 10 min | Validare images în registry |
| **TC-10** | Resource Usage | 10 min | Monitor CPU/Memory |

---

## 🚀 Quick Start - Pași de Testare

### 1️⃣ Pregătire (15 min)

```bash
# Verifică acces
kubectl get namespaces | grep librechat
kubectl get pods -n librechat-dev
```

**Checklist:**
- [ ] Acces GitHub Actions
- [ ] kubectl configurat
- [ ] Acces registry
- [ ] Browser pentru UI

---

### 2️⃣ Deploy Dev Environment (15 min)

**În GitHub Actions:**
1. Navigate: `Actions` → `Deploy Environment - Totalsoft Local`
2. Click `Run workflow`
3. Selectează:
   - Environment: **dev**
   - Image Name: **ts-librechat**
4. Monitorizează execuția

**Expected:**
✅ Image tag: `dev`
✅ Namespace: `librechat-dev`
✅ Deployment successful

---

### 3️⃣ Validare Kubernetes (20 min)

```bash
# 1. Check deployment
kubectl get deployment -n librechat-dev
kubectl get pods -n librechat-dev

# 2. Check services
kubectl get svc -n librechat-dev

# 3. Check ingress
kubectl get ingress -n librechat-dev

# 4. Check logs
kubectl logs -n librechat-dev -l app=librechat-dev --tail=50
```

**Expected:**
✅ Pod: Running (1/1)
✅ Service: ClusterIP pe port 3080
✅ Ingress: `librechat-dev.totalsoft.local`
✅ No errors în logs

---

### 4️⃣ Test Aplicație (30 min)

#### A. Network Test

```bash
# DNS
nslookup librechat-dev.totalsoft.local

# HTTP
curl -I https://librechat-dev.totalsoft.local
```

#### B. UI Test

1. **Accesează:** `https://librechat-dev.totalsoft.local`
2. **Verifică:**
   - [ ] Title: "Tessa"
   - [ ] Logo se afișează
   - [ ] No console errors (F12)

3. **Login:**
   - [ ] Click Login
   - [ ] Redirect Keycloak OK
   - [ ] Login successful
   - [ ] Redirect back OK

4. **Chat:**
   - [ ] Creează conversație
   - [ ] Trimite mesaj test
   - [ ] Primește răspuns

5. **Debug:**
   - [ ] F12 → Console
   - [ ] Debug logs vizibile
   - [ ] Network tab: API calls 200 OK

---

### 5️⃣ Validare Production (15 min)

```bash
# Check production
kubectl get pods -n librechat
kubectl get deployment -n librechat
```

**Test în browser:**
- URL: `https://tessa.totalsoft.local`
- Verifică funcționalitate
- Verifică că title e "Tessa"

**Expected:**
✅ Production pods running
✅ No restarts
✅ Application funcțională
✅ Neafectată de dev deploy

---

## 📝 Rezultate Așteptate

### ✅ Success Criteria

| Component | Expected State |
|-----------|---------------|
| **Dev Pods** | Running (1/1) |
| **Dev URL** | `librechat-dev.totalsoft.local` accesibil |
| **Dev Login** | Funcțional (Keycloak) |
| **Dev Chat** | Messages send/receive OK |
| **Prod Pods** | Running, no restarts |
| **Prod URL** | `tessa.totalsoft.local` funcțional |
| **Debug Logs** | Vizibile în dev console |

---

## 🐛 Common Issues & Solutions

### Issue: Pod nu pornește

```bash
# Check events
kubectl describe pod -n librechat-dev <pod-name>

# Check image
kubectl get pod -n librechat-dev -o jsonpath='{.items[0].spec.containers[0].image}'

# Verify secrets
kubectl get secret -n librechat-dev
```

### Issue: Ingress 404

```bash
# Check ingress
kubectl describe ingress -n librechat-dev

# Check service
kubectl get svc -n librechat-dev

# Verify DNS
nslookup librechat-dev.totalsoft.local
```

### Issue: Database connection fail

```bash
# Check MONGO_URI
kubectl exec -n librechat-dev deployment/librechat-dev -- env | grep MONGO

# Check logs
kubectl logs -n librechat-dev deployment/librechat-dev --tail=100
```

---

## 📊 Testing Summary Template

### Rezultate

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01: GitHub Actions Dev | ⬜ | |
| TC-03: K8s Deployment | ⬜ | |
| TC-05: Networking | ⬜ | |
| TC-06: UI Functionality | ⬜ | |
| TC-07: Production | ⬜ | |

**Legend:** ✅ PASS | ❌ FAIL | ⚠️ ISSUES

### Time Tracking

| Phase | Estimated | Actual |
|-------|-----------|--------|
| Pregătire | 15 min | ___ |
| GitHub Actions | 30 min | ___ |
| Kubernetes | 45 min | ___ |
| Network/App | 45 min | ___ |
| Production | 30 min | ___ |
| **TOTAL** | **~3 ore** | ___ |

### Issues Found

| Severity | Component | Description |
|----------|-----------|-------------|
| | | |

### Final Status

**Overall:** ⬜ APPROVED | ⬜ REJECTED | ⬜ NEEDS WORK

**Ready for Production:** ⬜ YES | ⬜ NO

---

## 📎 Documentație Completă

### Fișiere Create

1. **`MANUAL_TESTING_DEV_ENV.md`** - Plan detaliat (10 TC-uri)
2. **`TASK_TESTING_ROXANA.md`** - Task tracking cu checklist-uri
3. **`README.md`** - Overview documentație

### Location

```
/home/user/LibreChat/docs/
├── MANUAL_TESTING_DEV_ENV.md    (15kb - ghid tehnic complet)
├── TASK_TESTING_ROXANA.md       (7kb - task cu checklist-uri)
├── TESTING_SUMMARY_NOTION.md    (acest fișier - rezumat)
└── README.md                     (structură documentație)
```

### Commit Info

**Branch:** `claude/review-weekly-tasks-013f2soL7zaWFmRqugd8tDrg`
**Files:** 3 documente noi + acest rezumat
**Ready to push:** ✅

---

## 🎯 Next Steps

1. **Pentru Roxana:**
   - [ ] Citește `TASK_TESTING_ROXANA.md`
   - [ ] Execută testarea (2-3 ore)
   - [ ] Completează checklist-urile
   - [ ] Document results
   - [ ] Sign-off

2. **După Testing:**
   - [ ] Review results cu echipa
   - [ ] Create GitHub issues pentru bugs (dacă există)
   - [ ] Update documentația cu findings
   - [ ] Approve/Reject pentru production

---

## 👤 Ownership

**Created by:** Claude AI Assistant
**For:** Roxana Ene (roxana.ene@totalsoft.ro)
**Date:** 27 noiembrie 2025
**Version:** 1.0

---

## 📚 References

- **PR #21:** dev-env
- **Commits:** `b7ea52e`, `a16f41c`
- **Repository:** totalsoft-ai/LibreChat

---

**💡 Tip:** Importă acest fișier în Notion folosind "Import" → "Markdown" pentru formatare automată cu tables, checkboxes și emoji-uri.
