# Ghiduri Simple pentru Tool-urile LibreChat

Aici găsiți explicații simple despre toate tool-urile care vă ajută să lucrați cu documente în LibreChat. Fiecare ghid este scris în română și explică pas cu pas cum să folosiți tool-urile.

## Tool-uri Disponibile

### 📄 DocumentLoader - Încărcați Documente
- **Ghid**: [DocumentLoader-Usage-Guide.md](./DocumentLoader-Usage-Guide.md)
- **Ce face**: Vă ajută să încărcați și să organizați documente în dosare
- **Ce fișiere acceptă**: PDF, Word, Excel, pagini Notion/Confluence
- **Când îl folosiți**: Când vreti să organizați documentele companiei

### 📝 DocumentSummarizer - Faceți Rezumate
- **Ghid**: [DocumentSummarizer-Usage-Guide.md](./DocumentSummarizer-Usage-Guide.md)
- **Ce face**: Face rezumate rapide din documente lungi
- **Ce fișiere acceptă**: PDF, Word, fișiere text
- **Când îl folosiți**: Când aveți un document lung și vreti să știți rapid despre ce e vorba

### 🌍 TextTranslator - Traduceți Texte
- **Ghid**: [TextTranslator-Usage-Guide.md](./TextTranslator-Usage-Guide.md)
- **Ce face**: Traduce texte și documente în diferite limbi
- **Ce fișiere acceptă**: PDF, Word, fișiere text
- **Când îl folosiți**: Când aveți documente în limbi străine sau trebuie să traduceți ceva

### 📋 DocumentFlow - Creați Documentație
- **Ghid**: [DocumentFlow-Usage-Guide.md](./DocumentFlow-Usage-Guide.md)
- **Ce face**: Creează automat documentație profesională pentru proiecte
- **Ce fișiere acceptă**: Word, PDF
- **Când îl folosiți**: Când trebuie să scrieți planuri de proiect sau documentație tehnică

## Pentru Administratori

### Ce Trebuie Configurat
1. **Activarea tool-urilor** - Să permită utilizarea tool-urilor personalizate
2. **Încărcarea fișierelor** - Să permită upload-ul de documente PDF, Word, Excel
3. **Serviciile externe** - Să ruleze serviciile pentru fiecare tool (la porturile 8000-8003)
4. **Dimensiunea fișierelor** - Să permită fișiere de până la 25-50MB

### Ce Servicii Trebuie să Ruleze
- **DocumentLoader**: http://localhost:8000
- **DocumentSummarizer**: http://localhost:8001  
- **TextTranslator**: http://localhost:8002
- **DocumentFlow**: http://localhost:8003

💡 **Pentru utilizatori**: Dacă tool-urile nu funcționează, vorbiti cu administratorul să verifice aceste setări!

<details>
<summary>📋 Configurație completă pentru administratori (click pentru detalii tehnice)</summary>

```yaml
# Configurare în librechat.yaml
agents:
  capabilities:
    - tools
    - document_loader

fileConfig:
  endpoints:
    agents:
      disabled: false
      fileLimit: 20
      fileSizeLimit: 25MB
      allowMessageAttachments: true
      supportedMimeTypes:
        - application/pdf
        - application/vnd.openxmlformats-officedocument.wordprocessingml.document
        - text/plain

documentLoader:
  enabled: true
  baseUrl: ${DOCUMENT_LOADER_BASE_URL}
  maxFileSize: 50MB
  features:
    uploadFiles: true

interface:
  genericFileUpload: true
```

```bash
# Variabile de mediu necesare
DOCUMENT_LOADER_BASE_URL=http://localhost:8000
DOCUMENT_SUMMARIZER_API_URL=http://localhost:8001
TEXT_TRANSLATOR_API_URL=http://localhost:8002
DOCUMENT_FLOW_API_URL=http://localhost:8003
```
</details>

## Cum să Folosiți Tool-urile

### Pașii Simpli:
1. **📎 Încărcați fișierul** - Faceți clic pe iconița de ataș din bara de mesaje
2. **📂 Alegeți "Upload files"** - Selectați documentul dorit  
3. **💬 Scrieți cererea** - Exemple: "Rezumă documentul", "Traduce în engleză", "Încarcă în dosarul contracte"
4. **✅ Primiți rezultatul** - Tool-ul va procesa automat fișierul

### Exemplu Complet:
```
1. Faceți clic pe 📎
2. Selectați contractul.pdf
3. Scrieți: "Te rog să rezumi contractul și să-l încarci în dosarul contracte-2024"
4. Așteptați rezultatul
```

## Când Ceva Nu Merge

### ❌ Tool-ul nu răspunde
- Verificați că ați încărcat fișierul corect
- Încercați cu un mesaj mai simplu
- Contactați administratorul

### ❌ "Fișier nesuportat"  
- Folosiți doar PDF, Word sau Excel
- Verificați că fișierul nu e prea mare (sub 25-50MB)

### ❌ Tool-ul nu face ce vreti
- Citiți ghidul specific pentru tool-ul respectiv
- Încercați să fiți mai clari în cerere
- Întrebați administratorul despre setări

---

💡 **Sfat**: Pentru probleme mai complexe, consultați ghidurile individuale pentru fiecare tool!
