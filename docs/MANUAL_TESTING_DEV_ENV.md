# Manual Testing Plan - Dev Environment (PR #21)

**Task:** Testare manuală pentru configurarea dev environment
**PR:** #21 - dev-env
**Date:** 27 noiembrie 2025
**Status:** Ready for Testing

---

## 📋 Table of Contents

1. [Obiective](#obiective)
2. [Prerequisites](#prerequisites)
3. [Test Cases](#test-cases)
4. [Validation Checklist](#validation-checklist)
5. [Troubleshooting](#troubleshooting)
6. [Sign-off](#sign-off)

---

## 🎯 Obiective

Validarea funcționalității complete a setup-ului pentru dev environment, inclusiv:
- ✅ Deployment separat pentru development
- ✅ Workflow GitHub Actions funcțional
- ✅ Configurare Kubernetes corectă
- ✅ Networking și ingress functional
- ✅ Production environment neafectat

---

## 📦 Prerequisites

### Acces necesar:
- [ ] Acces la cluster Kubernetes (namespace `librechat-dev` și `librechat`)
- [ ] Acces la GitHub repository (totalsoft-ai/LibreChat)
- [ ] Acces la GitHub Actions workflows
- [ ] Acces la registry: `registry.totalsoft.local`
- [ ] kubectl configurat pentru cluster
- [ ] Browser pentru UI testing

### Verificări inițiale:
```bash
# Verifică acces kubectl
kubectl get namespaces

# Verifică accesul la registry
docker login registry.totalsoft.local

# Verifică branch-ul curent
git branch --show-current
```

---

## 🧪 Test Cases

### **TC-01: Verificare Workflow GitHub Actions - Development**

**Obiectiv:** Validare workflow manual pentru deployment în dev

**Pași:**

1. **Navigate to GitHub Actions**
   ```
   URL: https://github.com/totalsoft-ai/LibreChat/actions
   ```

2. **Trigger manual workflow**
   - Click pe "Deploy Environment - Totalsoft Local"
   - Click "Run workflow"
   - Selectează:
     - Environment: `dev`
     - Image Name: `ts-librechat` (default)
   - Click "Run workflow"

3. **Monitor execution**
   - Verifică că job-ul pornește
   - Urmărește logurile în timp real
   - Notează durata de execuție

**Expected Results:**
- ✅ Workflow se execută fără erori
- ✅ Image tag setat corect la `dev`
- ✅ Namespace setat la `librechat-dev`
- ✅ Helm release: `librechat-dev`
- ✅ Deploy reușit în cluster

**Actual Results:**
```
[ ] PASS    [ ] FAIL
Notes:


```

---

### **TC-02: Verificare Workflow GitHub Actions - Production**

**Obiectiv:** Validare workflow manual pentru deployment în production

**Pași:**

1. **Trigger workflow pentru production**
   - Environment: `production`
   - Image Name: `ts-librechat`

2. **Verifică parametrii**
   - IMAGE_TAG: `latest`
   - Namespace: `librechat`
   - Release: `librechat`

**Expected Results:**
- ✅ Workflow folosește tag-ul `latest`
- ✅ Deploy în namespace `librechat`
- ✅ Production environment funcțional

**Actual Results:**
```
[ ] PASS    [ ] FAIL
Notes:


```

---

### **TC-03: Verificare Deployment Kubernetes - Dev Environment**

**Obiectiv:** Validare că pod-urile rulează corect în dev

**Pași:**

1. **Check namespace dev**
   ```bash
   kubectl get namespaces | grep librechat-dev
   ```

2. **Check pods în dev**
   ```bash
   kubectl get pods -n librechat-dev
   ```

3. **Check deployment**
   ```bash
   kubectl get deployment -n librechat-dev
   kubectl describe deployment librechat-dev -n librechat-dev
   ```

4. **Check pod logs**
   ```bash
   kubectl logs -n librechat-dev -l app=librechat-dev --tail=50
   ```

5. **Check services**
   ```bash
   kubectl get svc -n librechat-dev
   ```

6. **Check ingress**
   ```bash
   kubectl get ingress -n librechat-dev
   kubectl describe ingress -n librechat-dev
   ```

**Expected Results:**
- ✅ Namespace `librechat-dev` există
- ✅ Pod status: `Running`
- ✅ Replicas: 1/1
- ✅ Image: `registry.totalsoft.local/ts-librechat:dev`
- ✅ Service expus pe port 3080
- ✅ Ingress configurat pentru `librechat-dev.totalsoft.local`
- ✅ No errors în logs

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Pod Status:
Service Status:
Ingress Status:

Notes:


```

---

### **TC-04: Verificare Configurare - Dev vs Production**

**Obiectiv:** Validare diferențe de configurare între environments

**Pași:**

1. **Compare configmaps**
   ```bash
   kubectl get configmap -n librechat-dev -o yaml > /tmp/dev-config.yaml
   kubectl get configmap -n librechat -o yaml > /tmp/prod-config.yaml
   diff /tmp/dev-config.yaml /tmp/prod-config.yaml
   ```

2. **Verifică secrets**
   ```bash
   kubectl get secrets -n librechat-dev
   kubectl get secrets -n librechat
   ```

3. **Verifică resource limits**
   ```bash
   kubectl get deployment librechat-dev -n librechat-dev -o jsonpath='{.spec.template.spec.containers[0].resources}'
   kubectl get deployment librechat -n librechat -o jsonpath='{.spec.template.spec.containers[0].resources}'
   ```

**Expected Results - Dev:**
- ✅ APP_TITLE: "Tessa"
- ✅ DEBUG_CONSOLE: "true"
- ✅ DEBUG_LOGGING: "true"
- ✅ Resources: 500m-1CPU, 1Gi-2Gi RAM
- ✅ Host: `librechat-dev.totalsoft.local`

**Expected Results - Production:**
- ✅ APP_TITLE: "Tessa"
- ✅ Host: `tessa.totalsoft.local`
- ✅ Resources: (verifică valorile din prod)

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Differences found:


```

---

### **TC-05: Verificare Networking - Dev Environment**

**Obiectiv:** Validare accesibilitate aplicației în dev

**Pași:**

1. **Add DNS entry (dacă e necesar)**
   ```bash
   # Windows: C:\Windows\System32\drivers\etc\hosts
   # Linux/Mac: /etc/hosts
   # Add: 10.1.48.XXX  librechat-dev.totalsoft.local
   ```

2. **Test DNS resolution**
   ```bash
   ping librechat-dev.totalsoft.local
   nslookup librechat-dev.totalsoft.local
   ```

3. **Test HTTP access**
   ```bash
   curl -I https://librechat-dev.totalsoft.local
   ```

4. **Browser access**
   - Open: `https://librechat-dev.totalsoft.local`
   - Verifică certificatul SSL
   - Verifică că aplicația se încarcă

**Expected Results:**
- ✅ DNS rezolvă corect
- ✅ SSL certificate valid (wildcard totalsoft.local)
- ✅ HTTP Status: 200 OK
- ✅ UI se încarcă complet
- ✅ No console errors în browser

**Actual Results:**
```
[ ] PASS    [ ] FAIL

DNS IP:
SSL Valid:
HTTP Status:

Notes:


```

---

### **TC-06: Verificare Funcționalitate UI - Dev Environment**

**Obiectiv:** Testare funcționalitate de bază a aplicației

**Pași:**

1. **Homepage**
   - Verifică titlul: "Tessa"
   - Verifică că logo-ul se afișează

2. **Authentication**
   - Test OpenID login (dacă configurat)
   - Verifică redirect către Keycloak
   - Login cu user valid

3. **Basic functionality**
   - Creează o conversație nouă
   - Trimite un mesaj de test
   - Verifică răspuns de la AI

4. **Debug info**
   - Deschide Developer Console (F12)
   - Verifică debug logs (DEBUG_CONSOLE: true)
   - Check Network tab pentru API calls

**Expected Results:**
- ✅ App title: "Tessa"
- ✅ Login funcțional
- ✅ Chat funcțional
- ✅ Debug logs visible în console
- ✅ API calls reușite (200 OK)

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Login:
Chat:
Debug logs:

Notes:


```

---

### **TC-07: Verificare Production - Non-regression**

**Obiectiv:** Validare că production NU a fost afectat

**Pași:**

1. **Check production pods**
   ```bash
   kubectl get pods -n librechat
   kubectl get deployment -n librechat
   ```

2. **Check production URL**
   - Browser: `https://tessa.totalsoft.local`
   - Verifică că aplicația funcționează

3. **Compare with previous state**
   - Verifică că nu sunt restarts neașteptate
   - Verifică logs pentru erori

**Expected Results:**
- ✅ Production pods: Running (no restarts)
- ✅ URL `tessa.totalsoft.local` accesibil
- ✅ APP_TITLE: "Tessa" (schimbat din "Librechat")
- ✅ Funcționalitate neafectată
- ✅ No errors în production logs

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Production Status:


```

---

### **TC-08: Verificare Secrets Management**

**Obiectiv:** Validare că secrets-urile sunt configurate corect

**Pași:**

1. **List secrets în dev**
   ```bash
   kubectl get secret librechat-secrets -n librechat-dev -o json | jq '.data | keys'
   ```

2. **Verify secret mounted în pod**
   ```bash
   kubectl exec -n librechat-dev deployment/librechat-dev -- env | grep -E "MONGO_URI|JWT_SECRET|AZURE" | wc -l
   ```

3. **Check application logs for auth**
   ```bash
   kubectl logs -n librechat-dev -l app=librechat-dev | grep -i "mongo\|database\|connected"
   ```

**Expected Results:**
- ✅ Secret `librechat-secrets` există în namespace
- ✅ Minimum 15+ secrets configurate
- ✅ Secrets mounted în pod
- ✅ Database connection successful
- ✅ No "undefined" sau "missing" secret errors

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Secrets count:
DB Connection:

Notes:


```

---

### **TC-09: Verificare Image Registry**

**Obiectiv:** Validare că imaginile sunt în registry

**Pași:**

1. **Check image în dev pod**
   ```bash
   kubectl get pod -n librechat-dev -o jsonpath='{.items[0].spec.containers[0].image}'
   ```

2. **Verify image pull**
   ```bash
   kubectl describe pod -n librechat-dev | grep -A 5 "Events:"
   ```

3. **Check image pull secrets**
   ```bash
   kubectl get secret -n librechat-dev | grep regcred
   ```

**Expected Results:**
- ✅ Image: `registry.totalsoft.local/ts-librechat:dev`
- ✅ Pull successful (no ImagePullBackOff)
- ✅ Image pull secrets configured

**Actual Results:**
```
[ ] PASS    [ ] FAIL

Image:
Pull Status:

Notes:


```

---

### **TC-10: Verificare Resource Usage**

**Obiectiv:** Monitorizare utilizare resurse în dev

**Pași:**

1. **Check resource usage**
   ```bash
   kubectl top pod -n librechat-dev
   kubectl top node
   ```

2. **Check resource limits**
   ```bash
   kubectl describe pod -n librechat-dev | grep -A 5 "Limits:"
   kubectl describe pod -n librechat-dev | grep -A 5 "Requests:"
   ```

**Expected Results:**
- ✅ CPU usage < 1 CPU
- ✅ Memory usage < 2Gi
- ✅ Limits: CPU 1, Memory 2Gi
- ✅ Requests: CPU 500m, Memory 1Gi
- ✅ No OOMKilled errors

**Actual Results:**
```
[ ] PASS    [ ] FAIL

CPU Usage:
Memory Usage:

Notes:


```

---

## ✅ Validation Checklist

### GitHub Actions
- [ ] Workflow "Deploy Environment" există
- [ ] Workflow poate fi trigger-uit manual
- [ ] Deploy în dev folosește tag `dev`
- [ ] Deploy în production folosește tag `latest`
- [ ] Toate secrets-urile sunt configurate în GitHub
- [ ] Workflow se execută fără erori

### Kubernetes - Dev Environment
- [ ] Namespace `librechat-dev` există
- [ ] Deployment rulează (1/1 replicas)
- [ ] Pod status: Running
- [ ] Service expus corect
- [ ] Ingress configurat pentru `librechat-dev.totalsoft.local`
- [ ] ConfigMap cu librechat.yaml mounted
- [ ] Secrets mounted corect

### Kubernetes - Production
- [ ] Production neafectat de schimbări
- [ ] Pods running fără restarts
- [ ] URL `tessa.totalsoft.local` funcțional
- [ ] APP_TITLE schimbat în "Tessa"

### Networking
- [ ] DNS resolution funcționează
- [ ] SSL certificate valid
- [ ] HTTPS access funcțional
- [ ] Keycloak integration funcțională
- [ ] MCP server accessible

### Application
- [ ] UI se încarcă complet
- [ ] Login funcțional (OpenID)
- [ ] Chat funcțional
- [ ] Debug logs vizibile
- [ ] Database connection stabilă
- [ ] API calls successful

### Configuration
- [ ] `custom-values_dev.yaml` aplicat corect
- [ ] Debug flags activate în dev
- [ ] Resource limits corecte
- [ ] Host aliases configurate

---

## 🔧 Troubleshooting

### Issue: Pod nu pornește

**Symptoms:**
```bash
kubectl get pods -n librechat-dev
# Status: ImagePullBackOff sau CrashLoopBackOff
```

**Solutions:**
```bash
# 1. Check events
kubectl describe pod -n librechat-dev <pod-name>

# 2. Check image pull
kubectl get events -n librechat-dev --sort-by='.lastTimestamp'

# 3. Verify image exists
docker pull registry.totalsoft.local/ts-librechat:dev

# 4. Check secrets
kubectl get secret -n librechat-dev
```

---

### Issue: Ingress nu funcționează

**Symptoms:**
- 404 Not Found
- Connection refused
- SSL error

**Solutions:**
```bash
# 1. Check ingress
kubectl get ingress -n librechat-dev
kubectl describe ingress -n librechat-dev

# 2. Check ingress controller
kubectl get pods -n ingress-nginx

# 3. Check service
kubectl get svc -n librechat-dev

# 4. Verify DNS
nslookup librechat-dev.totalsoft.local

# 5. Check certificate
kubectl get secret totalsoft-wildcard-tls -n librechat-dev
```

---

### Issue: Database connection failed

**Symptoms:**
- Logs: "Connection to MongoDB failed"
- Pod restarts

**Solutions:**
```bash
# 1. Check MONGO_URI secret
kubectl get secret librechat-secrets -n librechat-dev -o json | jq -r '.data.MONGO_URI' | base64 -d

# 2. Test connection from pod
kubectl exec -n librechat-dev deployment/librechat-dev -- env | grep MONGO

# 3. Check network policies
kubectl get networkpolicy -n librechat-dev
```

---

### Issue: GitHub Action fails

**Symptoms:**
- Workflow shows red X
- Error în logs

**Solutions:**
1. Check secrets în GitHub Settings > Secrets
2. Verify all required secrets exist
3. Check PowerShell script syntax
4. Verify kubectl context în runner
5. Check Helm release status:
   ```bash
   helm list -n librechat-dev
   helm status librechat-dev -n librechat-dev
   ```

---

### Issue: App shows 500 errors

**Symptoms:**
- UI loads but shows errors
- API calls fail

**Solutions:**
```bash
# 1. Check app logs
kubectl logs -n librechat-dev deployment/librechat-dev --tail=100

# 2. Check env variables
kubectl exec -n librechat-dev deployment/librechat-dev -- env

# 3. Restart deployment
kubectl rollout restart deployment/librechat-dev -n librechat-dev

# 4. Check configmap
kubectl get configmap librechat-config -n librechat-dev -o yaml
```

---

## 📝 Sign-off

### Testing Completed By:
**Name:** ___________________________
**Date:** ___________________________
**Time spent:** _____________________

### Test Results Summary:

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01: GitHub Actions - Dev | [ ] PASS [ ] FAIL | |
| TC-02: GitHub Actions - Prod | [ ] PASS [ ] FAIL | |
| TC-03: K8s Deployment - Dev | [ ] PASS [ ] FAIL | |
| TC-04: Configuration | [ ] PASS [ ] FAIL | |
| TC-05: Networking | [ ] PASS [ ] FAIL | |
| TC-06: UI Functionality | [ ] PASS [ ] FAIL | |
| TC-07: Production Non-regression | [ ] PASS [ ] FAIL | |
| TC-08: Secrets Management | [ ] PASS [ ] FAIL | |
| TC-09: Image Registry | [ ] PASS [ ] FAIL | |
| TC-10: Resource Usage | [ ] PASS [ ] FAIL | |

### Overall Assessment:

**Status:** [ ] APPROVED [ ] REJECTED [ ] NEEDS WORK

**Issues Found:**
```


```

**Recommendations:**
```


```

**Sign-off:**
- [ ] All critical test cases passed
- [ ] No blockers identified
- [ ] Documentation complete
- [ ] Ready for production use

**Signature:** ___________________________

---

## 📚 References

- **PR:** #21 - dev-env
- **Commits:**
  - `b7ea52e` - dev-env implementation
  - `a16f41c` - Merge PR #21
- **Related files:**
  - `.github/workflows/deploy_environment.yml`
  - `custom/config/k8s/custom-values_dev.yaml`
  - `custom/config/k8s/custom-values.yaml`

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Author:** Claude (AI Assistant)
