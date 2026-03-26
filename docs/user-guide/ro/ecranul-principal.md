# Ecranul principal

Ecranul principal ocupă zona centrală a interfeței și reprezintă spațiul de lucru unde se desfășoară toate conversațiile și interacțiunile cu asistenții AI. Aici sunt înregistrate toate cererile și răspunsurile generate.

![image](/help-images/ro_0035.png)

**Interfața Unificată**

Toti asistenții utilizează aceeași interfață intuitivă, singura diferență vizibilă este denumirea afișată în partea stânga sus, care indică asistentul activ selectat.

![image](/help-images/ro_0036.png)

## Asistentul QnA (Assistant with knowledge)

**Funcționare și Capabilități**

Asistentul QnA este specializat în furnizarea de răspunsuri bazate exclusiv pe documentațiile încărcate în Confluence. Performanța asistentului depinde direct de calitatea și detaliile întrebării formulate.

Bune Practici pentru Întrebări:

Formulați întrebări clare și directe

Includeți cât mai multe detalii relevante

Specificați contextul când este necesar

Utilizați termeni specifici din documentație

![image](/help-images/ro_0037.png)

**Gestionarea Răspunsurilor**

Dacă informația solicitată nu este identificată în baza de date, asistentul va comunica transparent: *"Nu am identificat un răspuns în documentațiilor disponibile."*

![image](/help-images/ro_0038.png)

Documentațiile din Confluence care stau la baza răspunsurilor asistentului sunt încărcate și vectorizate în baza de date zilnic. Dacă este necesar, frecvența poate fi mărită. Este responsabilitatea fiecărei echipe să mențină documentațiile actualizate în Confluence, pentru ca agentul să poată oferi răspunsuri corecte.

Deoarece documentațiile sunt folosite și la generarea de răspunsuri pentru aplicația Ticheto, este recomandat să se creeze spații separate pentru fiecare misiune și fiecare client. În aceste pagini se gestionează documentațiile aferente fiecărei misiuni.

![image](/help-images/ro_0039.png)

Documentațiile sunt accesate și încărcate în baza de date atât în format link, cât și prin adăugare directă în ecran.

![image](/help-images/ro_0040.png)

![image](/help-images/ro_0041.png)

## Asistentul multi-tool (Assistant)

Asistentul oferă suport complet prin funcționalități multiple, detectând cerințele utilizatorului și procesându-le rapid pentru a oferi soluții eficiente.

**Funcționalități Disponibile:**


|  |
| --- |



| Agent | Acțiuni | Cuvinte cheie de activare |
| --- | --- | --- |
| Chat | Conversație generală, Q&A | Orice solicitare generală |
| Summarizer | Rezumă texte lungi | "summarize", "summary" |
| Translator | Traduce texte/fișiere | "translate to", "translation" |
| DocuFlow | Generează PRD-uri, planuri, diagrame | "prd", "execution plan", "diagram" |
| Code Review | Analizează și îmbunătățește codul | "code review", "analyze code" |


### Chat

Funcționalitate de conversație generală. Răspunde la întrebări cu caracter general.

**⚠️ Atenție:** ***Agentul nu este conectat la internet. Informațiile primite nu sunt actualizate sau verificate în timp real.***

![image](/help-images/ro_0042.png)

### Document summarizer

**Funcționalitate:** Sumarizare inteligentă a documentelor și textelor extinse.

**Formate Suportate**: text direct.

Capabilități Lingvistice:

Sumarizare în aceeași limbă cu textul original

Sumarizare cross-language (ex: text în engleză → sumar în română)

Posibilitate de specificare explicit a limbii pentru sumar

**Exemplu de Utilizare:** *"Sumarizează următorul text din în limba română:"* [text în engleză]

Rezultat: Sumar concis și relevant în limba solicitată

![image](/help-images/ro_0043.png)

### Text translator

**Funcționalitate:** Traducere profesională în multiple limbi.

Metode de adăugare text: Copy/Paste direct în chat.

![image](/help-images/ro_0044.png)

Exemplu traducere in limba engleza a textului:

![image](/help-images/ro_0045.png)

Exemplu de traducere în spaniolă:

![image](/help-images/ro_0046.png)

### Code review

**Funcționalitate:** Analizează, optimizează și corectează cod sursă.

Proces de Utilizare:

Adăugați codul cu Copy/Paste în chat

Specificați cerința (ex: "Cod review”)

Tool-ul analizează codul

Primiti sugestii detaliate cu explicații

Capabilități:

Detectare erori și bug-uri

Optimizare performanță

Îmbunătățire lizibilitate

Sugestii best practices

Explicații detaliate pentru fiecare modificare

![image](/help-images/ro_0047.png)

### Document Flow

**Funcționalitate:** Generare automată de documentație profesională folosind AI.

Tipuri de Documente Generate:

Specificații tehnice – Detalii complete pentru implementare

PRD (Product Requirement Document) – Cerințe produse structurate

Planuri de execuție – Roadmap-uri și taskuri

Diagrame de proces – Flow-uri vizuale pentru fluxuri de lucru

![image](/help-images/ro_0048.png)

**Recomandare:** Cu cât oferiți mai multe detalii inițiale, cu atât documentul generat va fi mai complet și mai precis. Includeți:

Context și obiective

Stakeholderi implicați

Constrângeri și limitări

Cerințe funcționale și non-funcționale

**Exemplu diagramă de proces:**

![image](/help-images/ro_0049.png)

## Agentul PPM – Pontaje din Chat

Agentul PPM este un asistent AI specializat care face legătura directă între Tessa și sistemul Planview PPM. Prin intermediul său puteți vizualiza pontajele proprii, introduce ore direct din câmpul de chat, verifica alocările pe proiecte și trimite pontajele pentru aprobare — fără a deschide aplicația PPM. Utilizatorul este recunoscut automat în baza contului de domeniu, iar toate operațiunile se fac conversațional, în limbaj natural.

### Accesarea Agentului PPM

Agentul PPM se accesează din secțiunea Agent Marketplace. Apăsați iconița Marketplace (grilă 4 pătrate) din bara superioară de navigare a panoului stâng.

![image](/help-images/ro_0050.png)

Alternativ, gasim Agentul PPM in Selectorul de agenti > My Agents > PPM.

![image](/help-images/ro_0051.png)

În pagina Marketplace identificați agentul **PPM** din categoria General și apăsați pe el pentru a-l deschide. Alternativ, folosiți câmpul de căutare „Search agents…” și tastați „PPM”.

![image](/help-images/ro_0052.png)

Apăsați butonul „Start Chat” pentru a porni o sesiune cu agentul PPM. Interfața de chat este identică cu cea a oricărui alt asistent — agentul activ este indicat în bara superioară cu iconița și denumirea „PPM”.

![image](/help-images/ro_0053.png)

### Utilizarea agentului PPM

Pagina agentului are aceeasi configurare ca si ceilalti agenti. Se introduc intrebarile direct in chat, utilizatorul este recunoscut automat.

![image](/help-images/ro_0054.png)

### Vizualizarea Pontajelor

Puteți solicita vizualizarea pontajelor pentru orice perioadă recenta, folosind limbaj natural. Agentul înțelege date exacte, intervale relative („săptămâna trecută”, „luna trecută”, „începând cu 8 martie”) și date individuale. Răspunsul include detalii complete: ore per zi, per proiect, per task și notele aferente.

### Exemple de întrebări pentru vizualizare pontaje

**Exemplul 1 – Pontaje pe perioadă specificată**

*Vreau să văd pontajul pentru perioada 13.03.2026 – 16.03.2026*

Agentul returnează pontajele zilnice detaliate pentru perioada solicitată, cu ore per proiect, per task și notele completate la pontare. Răspunsul include totalul de ore al perioadei.

![image](/help-images/ro_0055.png)

**Exemplul 2 – Pontaje pentru o singură zi**

*Arată-mi pontajele pentru ziua de 16.03.2026*

Agentul afișează defalcarea completă a zilei respective: fiecare activitate pontată, orele alocate, proiectul și task-ul corespunzător și notele adăugate.

![image](/help-images/ro_0056.png)

**Exemplul 3 – Pontaje folosind date relative**

*Suntem în luna martie. Vreau să văd pontajele pentru luna trecută*

Agentul interpretează „luna trecută” în raport cu data curentă și returnează pontajele aferente întregii luni anterioare. Nu este nevoie să specificați datele exacte — agentu înțelege expresii temporale în limbaj natural.

![image](/help-images/ro_0057.png)

### Adăugarea Pontajelor din Chat

Aceasta este funcționalitatea principală a agentului: introduceți pontajul direct din chat, fără a accesa interfața PPM. Specificați în mesaj numărul de ore, data, proiectul, task-ul și, opțional, o notă descriptivă. Agentul procesează cererea și înregistrează pontajul în sistem.

### Exemplu de pontare

*Ponteaźă 3 ore astăzi pe proiectul ERP_PDM_CHARISMA_AI, pe task-ul PPM in Tessa şi adaugă la Note: Testare Agent PPM*

Agentul identifică automat proiectul și task-ul specificat, înregistrează cele 3 ore pentru ziua curentă și adaugă nota indicată. Veți primi o confirmare cu detaliile pontajului înregistrat.

***⚠️ Asigurați-vă că specificați corect codul proiectului (ex.: ERP_PDM_CHARISMA) și denumirea exactă a task-ului. Puteți verifica lista task-urilor disponibile înainte de pontare .***

![image](/help-images/ro_0058.png)

### Vizualizarea Proiectelor și Task-urilor Alocate

Înainte de a ponta ore, este recomandat să verificați lista proiectelor și task-urilor pe care sunteți alocat, pentru a vă asigura că folosiți denumirile corecte.

**Exemplul 1 – Lista proiectelor alocate**

*Vreau să-mi spui pe ce proiecte sunt alocat*

Agentul returnează lista completă a proiectelor active pe care utilizatorul este alocat, cu codurile oficiale din PPM, necesare pentru pontare corectă.

![image](/help-images/ro_0059.png)

**Exemplul 2 – Task-uri alocate pentru o săptămână**

*Vreau să văd task-urile alocate pentru săptămâna 16 MARTIE – 20 MARTIE*

Agentul afișează task-urile alocate din PPM pentru intervalul specificat, grupate pe proiecte. Util pentru a planifica zilele din săptămână și a aloca orele corect per activitate.

![image](/help-images/ro_0060.png)

### Alte Funcționalități Disponibile

Pe lângă funcționalitățile detaliate mai sus, agentul PPM suportă și următoarele cereri:

Vizualizare pontaje pe zile lucrătoare cu marcarea zilelor nepontate (afișare 0h pentru zilele fără înregistrare)

Identificarea zilelor trecute cu ore necompletate sau sub 8 ore (ex.: „Încarcă datele în care nu sunt pontate 8 ore”)

Verificarea pontajelor neaprobate (ex.: „Vreau să văd dacă sunt pontaje neaprobate”)

Raport complet al task-urilor alocate pe un proiect (ex.: „Vreau un raport al task-urilor pe care sunt alocat pe proiectul ERP_PDM_CHARISMA”)

Vizualizare membri echipă pe proiect (ex.: „Vreau să văd membrii proiectului ERP_PDM_CHARISMA”)

Vizualizare milestone-uri proiect (ex.: „Încarcă milestone-urile din PPM pentru proiectele mele”)

Ore utilizate și ore totale disponibile pe proiect (ex.: „Încarcă orele folosite și orele totale disponibile pentru proiectul ERP_PDM_CHARISMA”)

Trimiterea pontajelor pentru aprobare către manager (ex.: „Vreau să trimit pontajul către manager pentru perioada 16.03.2026 – 31.03.2026”) — agentul solicită confirmare înainte de a efectua trimiterea

**Notă:** ***Agentul PPM recunoaște automat utilizatorul conectat — nu este nevoie să specificați adresa de email sau alte date de identificare. Folosiți întotdeauna codul exact al proiectului și denumirea corectă a task-ului pentru a evita erori la pontare. Lista exactă se poate obține din agentul PPM înainte de a adăuga ore.***

**Agent PPM – Lista Comenzi**


| # | Categorie | Comanda (mesaj in chat) |
| --- | --- | --- |
| VIZUALIZARE PONTAJE | VIZUALIZARE PONTAJE | VIZUALIZARE PONTAJE |
| 1 | Vizualizare pontaje | Vreau sa vad pontajul pentru perioada 13.03.2026 - 16.03.2026 |
| 2 | Vizualizare pontaje | Vreau sa vad pontajul incepand cu 8 martie |
| 3 | Vizualizare pontaje | Incarca pontajul pentru 02 martie - 06 martie |
| 4 | Vizualizare pontaje | Arata-mi pontajele pentru ziua de 16.03.2026 |
| 5 | Vizualizare pontaje | Suntem in luna martie. Vreau sa vad pontajele pentru luna trecuta |
| VIZUALIZARE AVANSATA | VIZUALIZARE AVANSATA | VIZUALIZARE AVANSATA |
| 6 | Vizualizare avansata | Vreau sa vad pontajul pentru perioada 01.03.2026 - 16.03.2026 grupeaza pe saptamani, fiecare saptamana are 5 zile lucratoare |
| 7 | Vizualizare avansata | Vreau sa vad pontajul pentru perioada 01.03.2026 - 16.03.2026 grupeaza pe zile lucratoare, cand gasesti pontaje lipsa adaugi 0h in zilele nepontate |
| 8 | Vizualizare avansata | Incarca datele sau zilele trecute in care nu sunt pontate 8 ore sau mai mult de 8 ore |
| INTRODUCERE PONTAJ | INTRODUCERE PONTAJ | INTRODUCERE PONTAJ |
| 9 | Introducere pontaj | Ponteaza 3 ore astazi pe proiectul ERP_PDM_CHARISMA_AI, pe task-ul PPM in Tessa si adauga la Note: Testare Agent PPM |
| PROIECTE SI TASK-URI | PROIECTE SI TASK-URI | PROIECTE SI TASK-URI |
| 10 | Proiecte si task-uri | Vreau sa-mi spui pe ce proiecte sunt alocat |
| 11 | Proiecte si task-uri | Vreau sa vad task-urile alocate pentru saptamana 16 MARTIE - 20 MARTIE |
| 12 | Proiecte si task-uri | Vreau un raport al task-urilor pe care sunt alocat pe proiectul ERP_PDM_CHARISMA_AI |
| APROBARE PONTAJE | APROBARE PONTAJE | APROBARE PONTAJE |
| 13 | Aprobare pontaje | Vreau sa vad daca sunt pontaje neaprobate |
| INFORMATII PROIECT | INFORMATII PROIECT | INFORMATII PROIECT |
| 14 | Informatii proiect | Vreau sa vad membrii proiectului ERP_PDM_CHARISMA_AI |
| 15 | Informatii proiect | Incarca urmatoarele milestone-uri din PPM pentru proiectele mele |
| 16 | Informatii proiect | Incarca orele folosite si orele totale disponibile pentru proiectul ERP_PDM_CHARISMA_AI |


## Export și Partajare Conversații

![image](/help-images/ro_0061.png)

### Export Conversații

Puteți exporta orice conversație pentru a o salva local sau pentru a o include în rapoarte și documentații. Exportul în format text (.txt) este ideal când doriți să editați sau să refolosiți conținutul răspunsurilor — de exemplu, copiind o specificație generată de AI direct într-un document Word sau email. Formatul screenshot este recomandat când doriți să prezentați conversația exact cum arată în platformă, inclusiv formatarea, tabelele și blocurile de cod, fără a fi necesară nicio editare ulterioară.

![image](/help-images/ro_0062.png)

Pași pentru export:

Apăsați butonul "Export" (iconița download) din bara de acțiuni

Selectați formatul dorit din lista disponibilă

Sistemul generează fișierul și descărcarea pornește automat

Formate de export disponibile:


| Format | Descriere |
| --- | --- |
| 📄 Text (.txt) | Export ca text simplu, ușor de editat |
| 📸 Screenshot | Captură vizuală a conversației, include formatarea originală |


### Partajare Conversații

Puteți partaja o conversație cu un coleg printr-un link unic, fără a-i cere să se autentifice în platformă. Aceasta este util în special când doriți să trimiteți rapid un răspuns complex — o analiză, un plan de execuție sau o diagramă generată de AI — unui coleg care nu are cont activ sau care nu este logat în acel moment. Link-ul rămâne activ pe termen nedefinit și poate fi revocat oricând, ceea ce vă oferă control complet asupra accesului la informație.

![image](/help-images/ro_0063.png)

Caracteristici de partajare:

Generare link public unic – link-ul rămâne valid pe termen lung

QR Code – pentru partajare rapidă pe dispozitive mobile

Setare expirare – link-urile pot expira după o perioadă definită

Revocare acces – linkul poate fi anulat oricând

Tracking (opțional) – posibilitatea de a vedea câți utilizatori au vizualizat link-ul

**Exemplu de workflow:**

Accesați o conversație importantă cu analize

Apăsați Share → Create Link

Copiați link-ul și trimiteți-l colegului

Colegul accesează conversația fără a necesita autentificare

Accesul poate fi revocat oricând prin "Delete Link"
