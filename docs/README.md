# LibreChat - Testing Documentation

Acest director conține documentație pentru testarea manuală a features și environment-urilor LibreChat.

---

## 📁 Structură

### Testing Plans

- **`MANUAL_TESTING_DEV_ENV.md`** - Plan complet de testare manuală pentru Dev Environment (PR #21)
  - 10 test cases detaliate
  - Comenzi kubectl pentru validare
  - Troubleshooting guide
  - Validation checklist
  - Documentație tehnică completă

### Task Assignments

- **`TASK_TESTING_ROXANA.md`** - Task tracking pentru Roxana Ene
  - Format simplificat pentru executare
  - Checklist-uri pentru fiecare secțiune
  - Time tracking
  - Sign-off section

---

## 🎯 Cum să folosești aceste documente

### Pentru Testare Manuală

1. **Citește documentul principal:**
   ```
   docs/MANUAL_TESTING_DEV_ENV.md
   ```

2. **Folosește task assignment-ul pentru tracking:**
   ```
   docs/TASK_TESTING_ROXANA.md
   ```

3. **Urmează pașii în ordine:**
   - Pregătire → GitHub Actions → Kubernetes → Network/App → Production

4. **Documentează rezultatele:**
   - Bifează checkboxurile
   - Completează "Notes" sections
   - Salvează screenshots
   - Exportă logs dacă e cazul

5. **Finalizează cu sign-off:**
   - Completează summary
   - Marchează status (PASS/FAIL)
   - Adaugă semnătura

---

## 📋 Test Cases Overview - PR #21

| ID | Test Case | Scope | Time |
|----|-----------|-------|------|
| TC-01 | GitHub Actions - Dev | Workflow validation | 15 min |
| TC-02 | GitHub Actions - Prod | Workflow validation | 10 min |
| TC-03 | K8s Deployment - Dev | Infrastructure | 20 min |
| TC-04 | Configuration | Config validation | 15 min |
| TC-05 | Networking | Network/DNS/SSL | 20 min |
| TC-06 | UI Functionality | Application testing | 30 min |
| TC-07 | Production Non-regression | Validation | 15 min |
| TC-08 | Secrets Management | Security | 15 min |
| TC-09 | Image Registry | Infrastructure | 10 min |
| TC-10 | Resource Usage | Performance | 10 min |

**Total Estimated Time:** 2-3 ore

---

## 🔧 Prerequisites pentru Testing

### Acces Necesar

- [ ] GitHub repository: totalsoft-ai/LibreChat
- [ ] GitHub Actions (workflow execution rights)
- [ ] Kubernetes cluster access
- [ ] kubectl configured
- [ ] Docker registry access: registry.totalsoft.local
- [ ] Browser pentru UI testing

### Tools Required

```bash
# Kubernetes CLI
kubectl version

# Docker (optional, pentru registry testing)
docker --version

# Network tools
nslookup
curl
ping
```

---

## 📊 Testing Workflow

```
┌─────────────────┐
│   Pregătire     │ (15 min)
│ - Review PR     │
│ - Check access  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │ (30 min)
│ - Deploy dev    │
│ - Verify params │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Kubernetes    │ (45 min)
│ - Pods/Deploy   │
│ - Services      │
│ - Ingress       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Network & App   │ (45 min)
│ - DNS/SSL       │
│ - UI Testing    │
│ - Chat Test     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Production    │ (30 min)
│ - Non-regress   │
│ - Validation    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Sign-off      │ (15 min)
│ - Summary       │
│ - Documentation │
└─────────────────┘
```

---

## 🐛 Issue Reporting

Dacă găsești bugs în timpul testării:

1. **Documentează în secțiunea "Issues Found"** din task document
2. **Include:**
   - Severity (Critical/High/Medium/Low)
   - Component afectat
   - Steps to reproduce
   - Expected vs Actual behavior
   - Screenshots/Logs

3. **Creează GitHub Issue** (dacă e necesar):
   ```
   Title: [BUG] Short description
   Labels: bug, testing, dev-environment
   Assignee: @roxana-ene-ts
   ```

---

## ✅ Success Criteria

Testing-ul este considerat **PASS** dacă:

- ✅ Toate test cases critice PASS
- ✅ No blockers identificați
- ✅ Dev environment funcțional
- ✅ Production neafectat
- ✅ Documentație completă

Testing-ul este **FAIL** dacă:

- ❌ Test cases critice fail (TC-03, TC-06, TC-07)
- ❌ Production afectat negativ
- ❌ Blockers identificați
- ❌ Application nu funcționează

---

## 📚 Related Documentation

### Internal
- `/custom/config/k8s/custom-values.yaml` - Production config
- `/custom/config/k8s/custom-values_dev.yaml` - Dev config
- `/.github/workflows/deploy_environment.yml` - Deployment workflow

### External
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 🔄 Document Maintenance

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-27 | Claude | Initial creation pentru PR #21 testing |

### Updates Needed

Documentația ar trebui actualizată când:
- Se adaugă noi test cases
- Se schimbă infrastructure
- Se identifică best practices noi
- Se finalizează testing rounds

---

## 👥 Contacts

**Pentru întrebări despre testing:**
- Roxana Ene - roxana.ene@totalsoft.ro

**Pentru întrebări tehnice:**
- Repository: https://github.com/totalsoft-ai/LibreChat

---

**Last Updated:** 2025-11-27
**Maintained by:** DevOps Team
