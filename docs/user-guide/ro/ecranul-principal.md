# Ecranul principal

Ecranul principal ocupă zona centrală a interfeței și reprezintă spațiul de lucru unde se desfășoară toate conversațiile și interacțiunile cu asistenții AI. Aici sunt înregistrate toate cererile și răspunsurile generate.

![image](/help-images/ro_0040.png)

## Interfața Unificată - Assistant

Toți asistenții utilizează aceeași interfață intuitivă. Utilizatorul formulează cererea în limbaj natural, iar Asistentul decide automat care agent va prelua și executa cerința. 

![image](/help-images/ro_0041.png)

### Asistentul QnA

**Funcționare și Capabilități**

Asistentul QnA este specializat în furnizarea de răspunsuri bazate exclusiv pe documentațiile încărcate în Confluence și Coda. Performanța asistentului depinde direct de calitatea și detaliile întrebării formulate.

Bune practici pentru Întrebări:

Formulați întrebări clare și directe

Includeți cât mai multe detalii relevante

Specificați contextul când este necesar

Utilizați termeni specifici din documentație

![image](/help-images/ro_0042.png)

**Gestionarea Răspunsurilor**

Dacă informația solicitată nu este identificată în baza de date, asistentul va comunica transparent: *"Nu am identificat un răspuns în documentația disponibilă."*

![image](/help-images/ro_0043.png)

Documentațiile din Confluence și Coda care stau la baza răspunsurilor asistentului sunt încărcate și vectorizate în baza de date zilnic. Dacă este necesar, frecvența poate fi mărită. Este responsabilitatea fiecărei echipe să mențină documentațiile actualizate în Confluence sau Coda, pentru ca agentul să poată oferi răspunsuri corecte.

Deoarece documentațiile sunt folosite și la generarea de răspunsuri pentru aplicația Ticheto, este recomandat să se creeze spații separate pentru fiecare misiune și fiecare client. În aceste pagini se gestionează documentațiile aferente fiecărei misiuni. 

![image](/help-images/ro_0044.png)

Documentațiile sunt accesate și încărcate în baza de date atât în format link, cât și prin adăugare directă în ecran.

![image](/help-images/ro_0045.png)

![image](/help-images/ro_0046.png)

***Aceleași cerințe sunt recomandate și pentru aplicația Coda.**

![image](/help-images/ro_0047.png)

![image](/help-images/ro_0048.png)

#### Preluare Documente din Confluence sau Coda

**Sincronizarea cu Baza de date**

Platforma integrează un mecanism automat de preluare a documentelor din Confluence sau Coda în baza de date vectorizată. **Nu toate paginile din Confluence sau Coda sunt indexate** — pentru a evita supraîncărcarea bazei de date cu conținut irelevant, sistemul aplică un filtru bazat pe titlul paginii.

#### Regula de Includere — Filtrare după Titlu

O pagină Confluence sau Coda este preluată automat doar dacă titlul său conține unul dintre cuvintele cheie definite în configurația namespace-ului. Această regulă se aplică indiferent de spațiul (space) din care face parte pagina.

**Cuvintele cheie acceptate în titlu sunt:**


| Cuvânt cheie (pattern) | Exemple de titluri acceptate |
| --- | --- |
| documenta?i* | Documentație, Documentații |
| documentare | Documentare proces X |
| documentation | API Documentation |
| specifica?i* | Specificație, Specificații tehnice |
| manual* | Manual utilizator, Manuale |
| configur?r* | Configurare, Configurări sistem |
| test case | Test case login |
| *test* | Testing, Teste, Testare |
| tehnic | Ghid tehnic, Documentație tehnică |
| train* | Training, Trainings, Train the trainer |


**Recomandare: La crearea unei pagini noi în Confluence sau Coda, includeți în titlu unul dintre cuvintele cheie de mai sus dacă doriți ca aceasta să fie disponibilă în răspunsurile agentului Tessa.**

**Programul de Sincronizare**

Serviciul de indexare rulează **automat în fiecare noapte, la ora 02:00**. La fiecare rulare, sistemul:

Scanează paginile din namespace-urile Confluence configurate

Filtrează paginile al căror titlu corespunde unuia dintre pattern-urile definite

Încarcă conținutul paginilor eligibile în baza de date vectorizată

Actualizează înregistrările existente dacă pagina a fost modificată

⚠️ **Atenție: Orice pagină adăugată sau redenumită în Confluence sau Coda va deveni disponibilă cel mai devreme a doua zi, după rularea nocturnă a serviciului.**

### Asistentul multi-tool

Assistant integrat cu Asistentul de Charisma oferă suport complet prin funcționalități multiple, detectând cerințele utilizatorului și procesându-le rapid pentru a oferi soluții eficiente.

**Funcționalități Disponibile:**


|  |
| --- |



| Agent | Acțiuni | Cuvinte cheie de activare |
| --- | --- | --- |
| Chat | Conversație generală, Q&amp;A | Orice solicitare generală |
| Summarizer | Rezumă texte lungi | "summarize", "summary" |
| Translator | Traduce texte/fișiere | "translate to", "translation" |
| DocuFlow | Generează PRD-uri, planuri, diagrame | "prd", "execution plan", "diagram" |
| Code Review | Analizează și îmbunătățește codul | "code review", "analyze code" |


#### Chat

Funcționalitate de conversație generală. Răspunde la întrebări cu caracter general.

**⚠️ Atenție:** ***Agentul nu este conectat la internet. Informațiile primite nu sunt actualizate sau verificate în timp real.***

![image](/help-images/ro_0049.png)

#### Document summarizer

**Funcționalitate: Sumarizare inteligentă a documentelor și textelor extinse.**

Formate Suportate: text direct.

Capabilități Lingvistice:

Sumarizare în aceeași limbă cu textul original

Sumarizare cross-language (ex: text în engleză → sumar în română)

Posibilitate de specificare explicită a limbii pentru sumar

**Exemplu de utilizare: "Sumarizează următorul text în limba română:" [text în engleză]**

Rezultat: Sumar concis și relevant în limba solicitată

![image](/help-images/ro_0050.png)

#### Text translator

**Funcționalitate: Traducere profesională în multiple limbi.**

Metode de adăugare text: Copy/Paste direct în chat.

![image](/help-images/ro_0051.png)

Exemplu de traducere în limba engleză a textului:

![image](/help-images/ro_0052.png)

Exemplu de traducere în spaniolă:

![image](/help-images/ro_0053.png)

#### Code review

**Funcționalitate: Analizează, optimizează și corectează cod sursă.**

Proces de Utilizare:

Adăugați codul cu Copy/Paste în chat

Specificați cerința (ex: "Cod review”)

Tool-ul analizează codul

Primiți sugestii detaliate cu explicații

Capabilități:

Detectare erori și bug-uri

Optimizare performanță

Îmbunătățire lizibilitate

Sugestii best practices

Explicații detaliate pentru fiecare modificare

![image](/help-images/ro_0054.png)

***Atașarea Fișierelor de Cod (SQL, Python și alte formate)***

Pe lângă metoda copy/paste, platforma Tessa permite atașarea directă a fișierelor de cod pentru code review. Funcționalitatea este disponibilă prin asistentul File Search și se utilizează prin intermediul butonului „Attach Files" sau prin drag &amp; drop.

**Formate de cod suportate:**

SQL (.sql) — scripturi de baze de date, proceduri stocate, interogări

Python (.py) — scripturi și module

Alte formate text de cod (JavaScript, C#, TypeScript, XML etc.) — procesate ca text simplu

**Pași de utilizare:**

**Pasul 1  —  Selectați asistentul File Search**

Din selectorul de asistent din bara superioară, alegeți File Search.

![image](/help-images/ro_0055.png)

**Pasul 2  —  Încărcați fișierul**

Apăsați butonul „Attach Files" din câmpul de mesaj sau trageți fișierul direct în fereastra de chat (drag &amp; drop). Fișierul apare deasupra câmpului de mesaj, gata de procesare.

![image](/help-images/ro_0056.png)

**Pasul 3  —  Dezactivați butonul File Search și formulați cererea**

Odată fișierul atașat, aplicația detectează automat tipul fișierului și dezactivează butonul File Search. Dacă acest lucru nu se întâmplă, dezactivați manual butonul File Search din bara de mesaj pentru ca asistentul să proceseze fișierul ca text de cod, nu ca document indexat. Scrieți cererea dorită în câmpul de mesaj (ex.: „Verifică dacă scriptul este corect") și apăsați Enter.

![image](/help-images/ro_0057.png)

**Pasul 4  —  Vizualizați rezultatul**

Asistentul analizează codul și returnează un răspuns detaliat: identifică erorile de sintaxă, explică logica scriptului, sugerează îmbunătățiri și furnizează versiunea corectată.

![image](/help-images/ro_0058.png)

**Comportament important de reținut:**

Fișierul nu se vectorizează și nu se salvează în baza de date — rămâne doar în conversația curentă. Dacă deschideți un chat nou sau o altă conversație, fișierul trebuie atașat din nou.

Toate fișierele de cod sunt procesate ca text simplu, indiferent de extensie

Limita recomandată: **aproximativ 1.500 de linii de cod per fișier**. Fișierele mai mari sunt procesate parțial — doar primele ~1.500 de linii

Procesarea fișierelor de cod nu consumă tokeni din limita zilnică de 20.000 — costul de procesare este zero

Export răspuns: în prezent nu există buton de export dedicat — folosiți copy/paste pentru a extrage codul corectat din răspunsul asistentului

**Notă: Pentru fișiere SQL mari (peste 1.500 de linii), împărțiți scriptul în bucăți logice (ex.: câte un modul sau procedură stocată per conversație) și atașați-le separat pentru rezultate optime.**

**Document Flow**

**Funcționalitate: Generare automată de documentație profesională folosind AI.**

Tipuri de Documente Generate:

Specificații tehnice – Detalii complete pentru implementare

PRD (Product Requirement Document) – Cerințe produse structurate

Planuri de execuție – Roadmap-uri și taskuri

Diagrame de proces – Flow-uri vizuale pentru fluxuri de lucru

![image](/help-images/ro_0059.png)

**Recomandare: Cu cât oferiți mai multe detalii inițiale, cu atât documentul generat va fi mai complet și mai precis. Includeți:**

Context și obiective

Stakeholderi implicați

Constrângeri și limitări

Cerințe funcționale și non-funcționale

**Exemplu diagramă de proces:**

![image](/help-images/ro_0060.png)

### Agentul PPM – Pontaje din Chat

Agentul PPM este un asistent AI integrat în Assistant care face legătura directă între Tessa și sistemul Planview PPM. Prin intermediul său puteți vizualiza pontajele proprii, introduce ore direct din câmpul de chat, verifica alocările pe proiecte și trimite pontajele pentru aprobare — fără a deschide aplicația PPM. Utilizatorul este recunoscut automat în baza contului de domeniu, iar toate operațiunile se fac conversațional, în limbaj natural, pe ecranul principal.

#### Accesarea agentului PPM

Agentul PPM se accesează din secțiunea de chat prin introducerea informațiilor necesare pontajului sau cererilor pentru PPM. Apăsați butonul „Start Chat” pentru a porni o sesiune; interfața de chat este identică cu cea a oricărui alt asistent.

![image](/help-images/ro_0061.png)

#### Utilizarea agentului PPM

Pagina agentului are aceeași configurație ca orice alt agent. Întrebările sunt introduse direct în chat; utilizatorul este recunoscut automat. 

![image](/help-images/ro_0062.png)

#### Vizualizarea Pontajelor

Puteți solicita vizualizarea pontajelor pentru orice perioadă recentă, folosind limbaj natural. Agentul înțelege date exacte, intervale relative („săptămâna trecută”, „luna trecută”, „începând cu 8 martie”) și date individuale. Răspunsul include detalii complete: ore per zi, per proiect, per task și notele aferente.

#### Exemple de întrebări pentru vizualizare pontaje

***Exemplul 1 – Pontaje pe perioadă specificată***

*Vreau să văd pontajul pentru perioada 13.03.2026 – 16.03.2026*

Agentul returnează pontajele zilnice detaliate pentru perioada solicitată, cu ore per proiect, per task și notele completate la pontare. Răspunsul include totalul de ore al perioadei.

![image](/help-images/ro_0063.png)

**Exemplul 2 – Pontaje pentru o singură zi**

*Arată-mi pontajele pentru ziua de 16.03.2026*

Agentul afișează defalcarea completă a zilei respective: fiecare activitate pontată, orele alocate, proiectul și task-ul corespunzător și notele adăugate.

![image](/help-images/ro_0064.png)

**Exemplul 3 – Pontaje folosind date relative**

*Suntem în luna martie. Vreau să văd pontajele pentru luna trecută.*

Agentul interpretează „luna trecută” în raport cu data curentă și returnează pontajele aferente întregii luni anterioare. Nu este nevoie să specificați datele exacte — agentul înțelege expresii temporale în limbaj natural.

![image](/help-images/ro_0065.png)

#### Adăugarea Pontajelor din Chat

Aceasta este funcționalitatea principală a agentului: introduceți pontajul direct din chat, fără a accesa interfața PPM. Specificați în mesaj numărul de ore, data, proiectul, task-ul și, opțional, o notă descriptivă. Agentul procesează cererea și înregistrează pontajul în sistem.

#### Exemplu de pontare

*Pontează 3 ore astăzi pe proiectul ERP_PDM_CHARISMA_AI, pe task-ul PPM in Tessa și adaugă la Note: Testare Agent PPM*

Agentul identifică automat proiectul și task-ul specificat, înregistrează cele 3 ore pentru ziua curentă și adaugă nota indicată. Veți primi o confirmare cu detaliile pontajului înregistrat.

***⚠️ Asigurați-vă că specificați corect codul proiectului (ex.: ERP_PDM_CHARISMA) și denumirea exactă a task-ului. Puteți verifica lista task-urilor disponibile înainte de pontare .***

![image](/help-images/ro_0066.png)

#### Vizualizarea Proiectelor și Task-urilor Alocate

Înainte de a ponta ore, este recomandat să verificați lista proiectelor și task-urilor pe care sunteți alocat, pentru a vă asigura că folosiți denumirile corecte.

**Exemplul 1 – Lista proiectelor alocate**

*Vreau să-mi spui pe ce proiecte sunt alocat*

Agentul returnează lista completă a proiectelor active pe care utilizatorul este alocat, cu codurile oficiale din PPM, necesare pentru pontare corectă.

![image](/help-images/ro_0067.png)

**Exemplul 2 – Task-uri alocate pentru o săptămână**

*Vreau să văd task-urile alocate pentru săptămâna 16 MARTIE – 20 MARTIE*

Agentul afișează task-urile alocate din PPM pentru intervalul specificat, grupate pe proiecte. Util pentru a planifica zilele din săptămână și a aloca orele corect per activitate.

![image](/help-images/ro_0068.png)

#### Alte Funcționalități Disponibile

Pe lângă funcționalitățile detaliate mai sus, agentul PPM suportă și următoarele cereri:

Vizualizare pontaje pe zile lucrătoare cu marcarea zilelor nepontate (afișare 0h pentru zilele fără înregistrare)

Identificarea zilelor trecute cu ore necompletate sau sub 8 ore (ex.: „Arată zilele în care nu au fost pontate 8 ore”)

Verificarea pontajelor neaprobate (ex.: „Vreau să văd dacă sunt pontaje neaprobate”)

Raport complet al task-urilor alocate pe un proiect (ex.: „Vreau un raport al task-urilor pe care sunt alocat pe proiectul ERP_PDM_CHARISMA”)

Vizualizare membri echipă pe proiect (ex.: „Vreau să văd membrii proiectului ERP_PDM_CHARISMA”)

Vizualizare milestone-uri proiect (ex.: „Încarcă milestone-urile din PPM pentru proiectele mele”)

Ore utilizate și ore totale disponibile pe proiect (ex.: „Încarcă orele folosite și orele totale disponibile pentru proiectul ERP_PDM_CHARISMA”)

Trimiterea pontajelor pentru aprobare către manager (ex.: „Vreau să trimit pontajul către manager pentru perioada 16.03.2026 – 31.03.2026”) — agentul solicită confirmare înainte de a efectua trimiterea

**Notă:** ***Asistentul recunoaște automat utilizatorul conectat — nu este nevoie să specificați adresa de email sau alte date de identificare. Folosiți întotdeauna codul exact al proiectului și denumirea corectă a task-ului pentru a evita erori la pontare. Lista exactă se poate obține din agentul PPM înainte de a adăuga ore.***

#### Agent PPM – Lista Comenzi


| # | Categorie | Comandă (mesaj în chat) |
| --- | --- | --- |
| 1 | Vizualizare pontaje | Vreau să văd pontajul pentru perioada 13.03.2026 - 16.03.2026 |
| 2 | Vizualizare pontaje | Vreau să văd pontajul începând cu 8 martie |
| 3 | Vizualizare pontaje | Încarcă pontajul pentru 02 martie - 06 martie |
| 4 | Vizualizare pontaje | Arată-mi pontajele pentru ziua de 16.03.2026 |
| 5 | Vizualizare pontaje | Suntem în luna martie. Vreau să văd pontajele pentru luna trecută |
| 6 | Vizualizare avansată | Vreau să văd pontajul pentru perioada 01.03.2026 - 16.03.2026, grupat pe săptămâni |
| 7 | Vizualizare avansată | Încarcă datele sau zilele trecute în care nu sunt pontate 8 ore sau mai mult de 8 ore |
| 8 | Introducere pontaj | Pontează 3 ore astăzi pe proiectul ERP_PDM_CHARISMA_AI, pe task-ul PPM in Tessa |
| 9 | Proiecte și task-uri | Vreau să-mi spui pe ce proiecte sunt alocat |
| 10 | Proiecte și task-uri | Vreau să văd task-urile alocate pentru săptămâna 16 MARTIE - 20 MARTIE |
| 11 | Proiecte și task-uri | Vreau un raport al task-urilor pe care sunt alocat pe proiectul ERP_PDM_CHARISMA_AI |
| 12 | Aprobare pontaje | Vreau să văd dacă sunt pontaje neaprobate |
| 13 | Informații proiect | Vreau să văd membrii proiectului ERP_PDM_CHARISMA_AI |
| 14 | Informații proiect | Încarcă milestone-urile din PPM pentru proiectele mele |
| 15 | Informații proiect | Încarcă orele folosite și orele totale disponibile pentru proiectul ERP_PDM_CHARISMA_AI |


### Identificarea tichetelor Jira cu erori de ecran

Tessa poate recunoaște automat erorile din Charisma dintr-o imagine și poate verifica dacă o problemă similară a fost deja raportată în Jira. Când atașați o captură de ecran sau o fotografie a unui mesaj de eroare de pe ecranul desktop Charisma, de pe o pagină web sau chiar de pe un terminal portabil ori mobil, Assistant citește imaginea, extrage detaliile relevante ale erorii și caută în istoricul tichetelor Jira o potrivire apropiată. Astfel, puteți afla în câteva secunde dacă un tichet cunoscut acoperă deja problema, în loc să căutați manual în Jira sau să deschideți un tichet duplicat.

#### Cum funcționează

Deschideți o conversație cu Assistant și atașați o captură de ecran sau o fotografie care arată eroarea (puteți trage și plasa fișierul, îl puteți lipi din clipboard sau puteți folosi butonul de atașare). Puteți adăuga opțional o scurtă descriere, dar aceasta nu este obligatorie, Tessa citește textul direct din imagine, inclusiv casete de dialog cu erori, stack traces și mesaje de validare, în română sau engleză. Tessa analizează imaginea și răspunde în aceeași conversație.

#### Rezultate posibile

**Tichet similar găsit**

Tessa răspunde cu un mesaj de tipul „Am găsit câteva tichete posibil similare”, urmat de o listă cu până la 3 tichete Jira (de exemplu, ERPCORE-XXXXX), fiecare afișat ca link pe care se poate face clic și care deschide tichetul corespunzător direct în Jira. Dacă doriți să vedeți și alte tichete similare, puteți solicita acest lucru în continuarea conversației, iar Tessa va căuta încă până la 3 tichete suplimentare.

**Niciun tichet similar găsit**

Tessa răspunde „Nu am găsit niciun tichet Jira asemănător cu eroarea descrisă.”, informându-vă că nu există niciun tichet existent care să corespundă erorii dumneavoastră, astfel încât să puteți continua cu raportarea unuia nou.

![image](/help-images/ro_0069.png)

#### Exemple

***Exemplul 1 – Eroare de ecran Charisma***

O fereastră Charisma afișează o eroare, de exemplu o încălcare a unei constrângeri de cheie primară sau de cheie externă. După ce captura de ecran este atașată și trimisă, Tessa returnează cel mai apropiat tichet Jira corespunzător, dacă există unul.

***Exemplul 2 – Eroare pe dispozitiv portabil sau mobil***

O eroare apare pe un scanner de coduri de bare portabil sau pe un terminal mobil folosit în depozit. O fotografie a ecranului, făcută cu telefonul, este suficientă pentru ca Tessa să citească textul erorii și să caute în Jira un tichet similar.

![image](/help-images/ro_0070.png)

***Pentru o acuratețe cât mai bună, asigurați-vă că imaginea este lizibilă și include mesajul complet de eroare. Imaginile decupate sau neclare pot reduce acuratețea potrivirii. Tessa poate citi text atât din fotografii, cât și din capturi de ecran digitale — de exemplu, o fotografie făcută cu telefonul a unui monitor sau a ecranului unui dispozitiv portabil.***

**Notă:** ***Această funcție caută doar tichete deja existente în istoricul de tichete Jira indexat de Tessa, nu mai vechi de 4 ani, tichetele create foarte recent pot de asemenea să nu apară încă în rezultate deoarece nu au fost încă procesate.***

### Deschidere tichete Jira

Atunci când Tessa nu identifică niciun tichet Jira existent care să corespundă erorii de ecran raportate (vezi secțiunea anterioară, rezultatul „Niciun tichet similar găsit”), vă oferă posibilitatea de a deschide direct un tichet nou în Jira, fără a mai fi nevoie să părăsiți conversația din Tessa sau să vă autentificați separat în Jira. Este suficient să urmați pașii indicați de Assistant direct în chat.

#### Cum funcționează

Tessa vă întreabă dacă doriți să deschideți un tichet nou pentru eroarea raportată:

![image](/help-images/ro_0071.jpg)

Răspundeți cu „da” pentru a continua. Tessa vă cere apoi să alegeți proiectul Jira în care va fi deschis tichetul și afișează lista proiectelor disponibile (top10); scrieți numele sau codul proiectului dorit (de exemplu, CEaaS):

![image](/help-images/ro_0072.jpg)

Tessa confirmă proiectul ales și vă întreabă ce tip de tichet doriți să deschideți: Task, Bug, Sub-Task, Epic sau Story. După ce alegeți tipul, afișează câmpurile de completat Summary (obligatoriu), Description, Assignee, Epic Link și TS_CMX_Project (obligatoriu)  împreună cu cele mai folosite valori pentru proiectul ales și un exemplu de completare. Scrieți toate câmpurile într-un singur mesaj, câte un câmp pe linie, în formatul „Câmp: valoare”:

![image](/help-images/ro_0073.jpg)

Tessa afișează un rezumat al tichetului — inclusiv captura de ecran care va fi atașată — și vă cere confirmarea finală: „Confirmi crearea tichetului? (da/nu)”:

![image](/help-images/ro_0074.jpg)

După ce confirmați cu „da”, Tessa creează tichetul direct în Jira și vă răspunde cu codul tichetului nou creat, însoțit de un link către acesta, confirmând totodată câte capturi de ecran au fost atașate.

#### Tichetul creat în Jira

Tichetul apare imediat în Jira, cu toate câmpurile completate și captura de ecran atașată, gata pentru a fi preluat de echipa de suport:

![image](/help-images/ro_0075.jpg)

#### Detalii despre tichetul creat

Pentru trasabilitate și control, tichetele deschise prin Tessa respectă câteva reguli fixe:

**Reporter: aicharisma**

Tichetul este creat și înregistrat în Jira pe contul tehnic aicharisma. Acesta nu poate fi deschis pe contul personal al utilizatorului care a inițiat cererea în Tessa.

**Label: ai-generated**

Fiecare tichet deschis prin această funcționalitate primește automat eticheta ai-generated, pentru a putea fi identificat ușor ca fiind creat printr-un asistent AI.

**Assignee**

Dacă este completat, câmpul Assignee este validat de Tessa și afișat cu numele complet și adresa de email a persoanei din sistem; dacă este lăsat necompletat, tichetul rămâne neasignat.

**Atașamente**

Captura de ecran sau fotografia analizată inițial de Tessa este atașată automat tichetului nou creat.

**Returnarea tichetului către raportor**

Deoarece reporter-ul tichetului este contul tehnic aicharisma și nu contul personal al utilizatorului, în descrierea tichetului este adăugată automat mențiunea „Raportat din Tessa de <adresa de email a utilizatorului>”. Astfel, la finalizarea tichetului, echipa de suport știe exact cui trebuie să îi fie returnat sau comunicat rezultatul rezolvării.

**Notă:** ***Tichetele deschise prin Tessa pot fi editate ulterior direct în Jira (asignare, prioritate, componente etc.). Verificați întotdeauna datele din rezumatul afișat înainte de a confirma crearea tichetului, deoarece acestea nu mai pot fi modificate din chat după creare.***

### Export și Partajare Conversații

![image](/help-images/ro_0076.png)

#### Export Conversații

Puteți exporta orice conversație pentru a o salva local sau pentru a o include în rapoarte și documentații. Exportul în format text (.txt) este ideal când doriți să editați sau să refolosiți conținutul răspunsurilor,  de exemplu, copiind o specificație generată de AI direct într-un document Word sau email. Formatul screenshot este recomandat când doriți să prezentați conversația exact cum arată în platformă, inclusiv formatarea, tabelele și blocurile de cod, fără a fi necesară nicio editare ulterioară.

![image](/help-images/ro_0077.png)

Pași pentru export:

Apăsați butonul "Export" (iconița download) din bara de acțiuni

Selectați formatul dorit din lista disponibilă

Sistemul generează fișierul și descărcarea pornește automat

Formate de export disponibile:


| Format | Descriere |
| --- | --- |
| 📄 Text (.txt) | Export ca text simplu, ușor de editat — ideal pentru copierea conținutului în documente Word sau email |
| 📸 Screenshot | Captură vizuală a conversației, include formatarea originală, tabelele și blocurile de cod |


#### Partajare Conversații

Puteți partaja o conversație cu un coleg printr-un link unic, fără a-i cere să se autentifice în platformă. Aceasta este util în special când doriți să trimiteți rapid un răspuns complex — o analiză, un plan de execuție sau o diagramă generată de AI — unui coleg care nu are cont activ sau care nu este logat în acel moment. Link-ul rămâne activ pe termen nedefinit și poate fi revocat oricând, ceea ce vă oferă control complet asupra accesului la informație.

![image](/help-images/ro_0078.png)

Caracteristici de partajare:

Generare link public unic – link-ul rămâne valid pe termen lung

QR Code – pentru partajare rapidă pe dispozitive mobile

Setare expirare – link-urile pot expira după o perioadă definită

Revocare acces – linkul poate fi anulat oricând

Tracking (opțional) – posibilitatea de a vedea câți utilizatori au vizualizat link-ul

Exemplu de workflow:

Accesați o conversație importantă cu analize

Apăsați Share → Create Link

Copiați link-ul și trimiteți-l colegului

Colegul accesează conversația fără a necesita autentificare

Accesul poate fi revocat oricând prin "Delete Link"
