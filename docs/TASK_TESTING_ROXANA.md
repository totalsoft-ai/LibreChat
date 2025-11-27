# Task: Testare Manuală Dev Environment

**Assignee:** Roxana Ene
**Created:** 27 noiembrie 2025
**Priority:** Medium
**Estimated Time:** 2-3 ore
**Related PR:** #21 - dev-env

---

## 📋 Obiectiv

Testare manuală completă a setup-ului pentru dev environment implementat în PR #21.

---

## 🎯 Scope

Validare că:
- ✅ Dev environment funcționează independent de production
- ✅ GitHub Actions workflow funcționează corect
- ✅ Aplicația este accesibilă la `librechat-dev.totalsoft.local`
- ✅ Production environment nu este afectat
- ✅ Toate configurările sunt corecte

---

## 📝 Task List

### Pregătire (15 min)

- [ ] Review PR #21 și înțelege schimbările
- [ ] Citește documentul `MANUAL_TESTING_DEV_ENV.md`
- [ ] Verifică că ai acces la:
  - [ ] GitHub Actions (totalsoft-ai/LibreChat)
  - [ ] Kubernetes cluster (kubectl)
  - [ ] Registry: registry.totalsoft.local
  - [ ] Browser pentru testing

---

### Partea 1: GitHub Actions Testing (30 min)

#### Task 1.1: Test Deploy Development
- [ ] Navighează la GitHub Actions
- [ ] Rulează workflow "Deploy Environment - Totalsoft Local"
  - Environment: `dev`
  - Image Name: `ts-librechat`
- [ ] Monitorizează execuția
- [ ] Verifică că se completează fără erori
- [ ] Notează durata: ______ minute

**Notes:**
```


```

#### Task 1.2: Verifică Parameters
- [ ] Confirmă că workflow folosește:
  - [ ] IMAGE_TAG: `dev`
  - [ ] Namespace: `librechat-dev`
  - [ ] Release: `librechat-dev`

**Notes:**
```


```

---

### Partea 2: Kubernetes Validation (45 min)

#### Task 2.1: Verifică Deployment

```bash
# Rulează următoarele comenzi și notează rezultatele:

# 1. Check namespace
kubectl get namespaces | grep librechat-dev

# 2. Check pods
kubectl get pods -n librechat-dev

# 3. Check deployment
kubectl get deployment -n librechat-dev

# 4. Check logs (ultimele 50 linii)
kubectl logs -n librechat-dev -l app=librechat-dev --tail=50
```

**Rezultate:**
- [ ] Namespace există
- [ ] Pod status: `Running` (1/1)
- [ ] No errors în logs

**Notes:**
```


```

#### Task 2.2: Verifică Services & Ingress

```bash
# Services
kubectl get svc -n librechat-dev

# Ingress
kubectl get ingress -n librechat-dev
kubectl describe ingress -n librechat-dev
```

**Rezultate:**
- [ ] Service expus pe port 3080
- [ ] Ingress configurat pentru `librechat-dev.totalsoft.local`
- [ ] SSL certificate: `totalsoft-wildcard-tls`

**Notes:**
```


```

#### Task 2.3: Verifică Configurare

```bash
# Check image
kubectl get pod -n librechat-dev -o jsonpath='{.items[0].spec.containers[0].image}'

# Check resources
kubectl describe pod -n librechat-dev | grep -A 10 "Limits:"
```

**Expected:**
- [ ] Image: `registry.totalsoft.local/ts-librechat:dev`
- [ ] CPU Limit: 1
- [ ] Memory Limit: 2Gi
- [ ] CPU Request: 500m
- [ ] Memory Request: 1Gi

**Actual Results:**
```


```

---

### Partea 3: Network & Application Testing (45 min)

#### Task 3.1: Test DNS & Network

**Windows:**
```powershell
# Verifică DNS
nslookup librechat-dev.totalsoft.local

# Test connectivity
Test-NetConnection librechat-dev.totalsoft.local -Port 443
```

**Linux/Mac:**
```bash
# DNS
nslookup librechat-dev.totalsoft.local

# Ping
ping -c 4 librechat-dev.totalsoft.local

# HTTP test
curl -I https://librechat-dev.totalsoft.local
```

**Rezultate:**
- [ ] DNS rezolvă la IP corect
- [ ] Port 443 accesibil
- [ ] HTTP Status: 200 OK

**IP Address:** _______________

**Notes:**
```


```

#### Task 3.2: Test UI în Browser

1. **Accesare aplicație**
   - [ ] Deschide: `https://librechat-dev.totalsoft.local`
   - [ ] Verifică că se încarcă fără erori

2. **Verificări vizuale**
   - [ ] Title: "Tessa" (în tab browser)
   - [ ] Logo se afișează corect
   - [ ] No console errors (F12 → Console)

3. **Test Login**
   - [ ] Click pe Login
   - [ ] Redirect către Keycloak funcționează
   - [ ] Login cu user valid
   - [ ] Redirect înapoi la aplicație funcționează

4. **Test Chat**
   - [ ] Creează conversație nouă
   - [ ] Trimite mesaj: "Hello, this is a test"
   - [ ] Verifică că primești răspuns

**Screenshots:**
- [ ] Homepage (salvează screenshot)
- [ ] Login page (salvează screenshot)
- [ ] Chat interface (salvează screenshot)

**Notes:**
```


```

#### Task 3.3: Verifică Debug Logs

- [ ] Deschide Developer Console (F12)
- [ ] Navigate la tab "Console"
- [ ] Verifică debug logs (DEBUG_CONSOLE: true)
- [ ] Navigate la tab "Network"
- [ ] Verifică API calls (toate ar trebui să fie 200 OK)

**Debug logs visible:** [ ] DA [ ] NU

**API Errors:** [ ] DA [ ] NU

**Notes:**
```


```

---

### Partea 4: Production Validation (Non-regression) (30 min)

#### Task 4.1: Verifică Production Pods

```bash
# Check production status
kubectl get pods -n librechat
kubectl get deployment -n librechat

# Check for restarts
kubectl get pods -n librechat -o jsonpath='{.items[*].status.containerStatuses[*].restartCount}'
```

**Rezultate:**
- [ ] Production pods: Running
- [ ] No unexpected restarts
- [ ] No errors în logs

**Notes:**
```


```

#### Task 4.2: Test Production URL

- [ ] Accesează: `https://tessa.totalsoft.local`
- [ ] Verifică că aplicația funcționează normal
- [ ] Verifică title: "Tessa" (schimbat din "Librechat")
- [ ] Test login și chat funcționează

**Production Status:** [ ] OK [ ] ISSUES

**Notes:**
```


```

---

### Partea 5: Comparație Dev vs Production (15 min)

#### Task 5.1: Compare Configurations

| Aspect | Dev | Production | Match Expected? |
|--------|-----|------------|-----------------|
| Namespace | librechat-dev | librechat | [ ] |
| Host | librechat-dev.totalsoft.local | tessa.totalsoft.local | [ ] |
| Image Tag | dev | latest | [ ] |
| Replicas | 1 | ? | [ ] |
| CPU Limit | 1 | ? | [ ] |
| Memory Limit | 2Gi | ? | [ ] |
| DEBUG_CONSOLE | true | ? | [ ] |
| APP_TITLE | Tessa | Tessa | [ ] |

**Notes:**
```


```

---

## 🐛 Issues Found

| # | Severity | Component | Description | Status |
|---|----------|-----------|-------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity:** Critical / High / Medium / Low

---

## ✅ Testing Summary

### Completion Status

**Total Tests:** 10 test cases
**Passed:** _____ / 10
**Failed:** _____ / 10
**Blocked:** _____ / 10

### Time Tracking

| Activity | Estimated | Actual |
|----------|-----------|--------|
| Pregătire | 15 min | |
| GitHub Actions | 30 min | |
| Kubernetes | 45 min | |
| Network/App | 45 min | |
| Production | 30 min | |
| Comparație | 15 min | |
| **TOTAL** | **~3 ore** | |

### Overall Result

**Status:** [ ] PASS [ ] FAIL [ ] NEEDS INVESTIGATION

**Ready for Production:** [ ] YES [ ] NO [ ] CONDITIONAL

**Conditional Notes:**
```


```

---

## 📊 Final Assessment

### What Works Well ✅
```
1.
2.
3.
```

### Issues Found ⚠️
```
1.
2.
3.
```

### Recommendations 💡
```
1.
2.
3.
```

### Next Steps
- [ ] Document all findings
- [ ] Create GitHub issues for bugs (if any)
- [ ] Notify team of results
- [ ] Update this document with final status

---

## 📎 Attachments

**Screenshots saved in:**
```
/path/to/screenshots/
```

**Logs exported to:**
```
/path/to/logs/
```

---

## ✍️ Sign-off

**Tested by:** Roxana Ene
**Date:** _______________
**Time spent:** _______________
**Status:** [ ] APPROVED [ ] REJECTED [ ] NEEDS WORK

**Signature:** ___________________________

**Additional Comments:**
```




```

---

## 📚 Reference Documents

1. **Detailed Testing Guide:** `MANUAL_TESTING_DEV_ENV.md`
2. **PR:** #21 - dev-env
3. **Commits:**
   - `b7ea52e` - dev-env implementation
   - `a16f41c` - Merge PR #21

---

**Document Version:** 1.0
**Created:** 2025-11-27
**For:** Roxana Ene (roxana.ene@totalsoft.ro)
