# Setari aditionale

Meniul de configurare a asistenților se află în partea dreaptă a ecranului și oferă control asupra parametrilor AI. Fiecare utilizator își poate crea agenți care să ofere răspunsuri personale, mai scurte sau mai elaborate.

![image](/help-images/ro_0068.png)

![image](/help-images/ro_0069.png)

## Definire agenti

Funcționalitatea Agent Builder permite crearea de agenți AI personalizați cu instrucțiuni specifice, model configurat și capabilități extinse.

![image](/help-images/ro_0070.png)

Câmpuri necesare pentru crearea unui agent:


| Câmp | Descriere și Scop |
| --- | --- |
| Name | Nume descriptiv al agentului. Permite identificarea rapidă a agentului în lista de agenți disponibili. |
| Description | Descriere detaliată a agentului. Clarifică specializarea agentului și domeniul în care acesta operează. |
| Category | Categorie funcțională din care face parte agentul. Permite gruparea tematică a agenților pentru o navigare mai ușoară. |
| Instructions | Prompt și instrucțiuni specifice pentru agent. Definesc comportamentul AI-ului, modul de răspuns și limitele de acțiune. |
| Model | Modelul AI utilizat de agent. Permite selectarea capabilităților necesare în funcție de complexitatea sarcinilor. |


![image](/help-images/ro_0071.png)

**Configurări Avansate AI**

![image](/help-images/ro_0072.png)

### Temperatura

Temperatura afectează răspunsurile oferite de agent. Aceasta poate fi modificată și trebuie testată la fiecare nivel pentru a verifica dacă răspunsurile sunt adecvate ca lungime și relevanță.

Interval: 0.0 pana la 2.0

0.0 - 0.3: specific, consistent

0.4 - 0.7: echilibrat (setarea standard este 1.0)

0.8 - 1.5: creativ, variat

1.6 - 2.0: aleatoriu, experimental

***Notă:*** *Testați diferite niveluri pentru a identifica setarea optimă pentru cazul dvs.*

### Top P (Nucleus Sampling)

Metodă alternativă de control al diversității răspunsurilor prin selecția tokenurilor probabile.
Interval: 0.0 până la 1.0

0.1: Foarte concentrat

0.5: Moderat

0.9 - 1.0: Mai divers (implicit)

**Când se folosește:**

Alternativă la temperature

Valori mai mici = răspunsuri mai concentrate

Valori mai mari = răspunsuri mai diverse

***Notă: Utilizarea simultană a temperaturii și a Top P poate conduce la rezultate neașteptate. Se recomandă ajustarea unui singur parametru la un moment dat.***

### Max Tokens (Lungimea Output-ului)

Controleaza lungimea maximă a răspunsului AI, variază în funcție de model (de obicei 256 până la 4096+)


| Interval | Tip Răspuns | Cazuri de Utilizare |
| --- | --- | --- |
| 256 - 512 | Scurt | Răspunsuri rapide, simple; Optimizare resurse |
| 1024 | Mediu (implicit) | Conversații standard; Majoritatea cazurilor |
| 2048 - 4096 | Lung, detaliat | Explicații complexe; Cod elaborat; Articole |


### Frequency Penalty (Penalizare pentru Frecvență)

Reduce repetarea cuvintelor și expresiilor deja utilizate în răspuns.
Interval: 0.0 până la 2.0

0.0:         Fără penalizare (implicit)

0.5 - 1.0: Reducere moderată a repetării

1.0 - 2.0: Reducere puternică, încurajează varietatea

Se recomandă creșterea valorii dacă răspunsurile par repetitive sau monotone.

### Presence Penalty (Penalizare pentru Prezență)

Încurajează modelul să abordeze subiecte noi și să evite revenirea la teme deja discutate.
Interval: -2.0 până la 2.0

0.0:         Fără penalizare (implicit)

0.5 - 1.0: Încurajează explorarea de subiecte noi

1.0 - 2.0: Încurajează puternic subiecte noi

Utilizare:

Valori mai mari pentru discuții mai diverse

Valori mai mici pentru răspunsuri concentrate, pe subiect

### Eliminare agenti

Pentru a sterge un agent trebuie sa identificam in ce workspace a fost creat. Selectam workspace-ul dorit si din tabul My Agents selectam agentul care se doreste a fi sters.

![image](/help-images/ro_0073.png)

Pe agentul dorit se deschide ecranul din dreapta si apasam butonul ‘’Delete’’ din partea inferiora a ecranului. 

![image](/help-images/ro_0074.png)

## Biblioteca de Prompturi

Biblioteca de Prompturi permite crearea și reutilizarea rapidă a șabloanelor de instrucțiuni frecvente. Prompturile pot conține variabile și pot fi apelate printr-o comandă scurtă direct din câmpul de mesaj.

![image](/help-images/ro_0075.png)

Exemple de prompturi utile:

/trad – „Traduce în {{limba}}:" → apelabil pentru orice limbă

/email – „Redactează un email profesional pentru {{client}} despre {{subiect}}"

/cr – „Code review pentru cod {{limbaj}}"

/rezumat – „Sumarizează în română textul de mai jos"

### Crearea Prompturilor

Pași pentru crearea unui prompt:

Accesați Prompturile: faceți click pe "Prompts" în panoul lateral sau utilizați comanda rapidă "/" → se deschide biblioteca de prompturi

Creați un prompt nou: apăsați "+ Create Prompt" → se deschide editorul de prompturi

Introduceți un nume descriptiv în câmpul "Prompt Name"

Scrieți conținutul promptului în câmpul "Text"

Configurați setările adiționale:

Comandă rapidă: Creați o comandă scurtă începând cu "/" (ex.: /email)

Variabile: Detectate automat din {{nume_variabilă}}, cu posibilitate de definire a valorilor implicite

Apăsați "Salvează" sau "Creează" → promptul apare în bibliotecă

![image](/help-images/ro_0076.png)

### Utilizarea Prompturilor

Pași pentru utilizarea unui prompt creat:

Reveniți la interfața de chat apăsând "Back to Chat"

În câmpul de mesaj, tastați "/" urmat de comanda sau numele promptului (ex.: "/ef")

Apare un dropdown cu prompturile corespunzătoare; selectați promptul dorit

Textul promptului este populat automat în câmpul de mesaj

Apăsați Enter sau butonul de trimitere pentru a trimite promptul

![image](/help-images/ro_0077.png)

![image](/help-images/ro_0078.png)

### Variabile în Prompturi – Ghid Detaliat cu Exemple

Variabilele sunt elemente dinamice inserate într-un prompt, marcate prin sintaxa **{{nume_variabila}}**. La utilizarea promptului, sistemul detectează automat variabilele și le înlocuiește cu valorile introduse de utilizator la momentul trimiterii. Aceasta permite crearea unor prompturi flexibile, reutilizabile în contexte diferite.


| Variabilă în prompt | Ce introduce utilizatorul la trimitere |
| --- | --- |
| {{limba}} | „engleză", „franceză", „germană" etc. |
| {{nume_client}} | „Alfa SRL", „Beta SA" etc. |
| {{tip_document}} | „SRS", „PRD", „Raport de analiză" etc. |
| {{cod_sursa}} | Codul copiat din IDE (C#, SQL, JS etc.) |


#### Sintaxa variabilelor

O variabilă se declară prin înconjurarea numelui cu duble acolade. Numele variabilei trebuie să fie descriptiv, fără spații (se folosește underscore “_” în loc de spații):

**{{limba}}** – variabilă simplă pentru o limbă de traducere

**{{nume_client}}** – variabilă pentru numele unui client

**{{tip_document}}** – variabilă pentru tipul documentului de generat

**{{text_de_procesat}}** – variabilă pentru conținut lung (text, cod, etc.)

#### Exemplul 1 – Prompt de traducere cu variabile

Scenariu: Doriți un prompt reutilizabil pentru traduceri, unde puteți schimba rapid atât textul cât și limba țintă, fără a rescrie instrucțiunea de fiecare dată.

**Textul promptului (se introduce la creare):**

*Traduce următorul text în limba {{limba}}. Răspunde doar cu textul tradus, fără explicații suplimentare:*

*{{text_de_tradus}}*

**Comanda rapidă asociată:** /trad

**Cum se folosește:**

În câmpul de mesaj tastați **/trad** și selectați promptul din dropdown.

Sistemul afișează un formular cu două câmpuri: **limba** și **text_de_tradus**.

Introduceți: ***limba*** = “engleză” și ***text_de_tradus*** = textul dorit, apoi apăsați Enter.

Promptul complet trimis automat către AI va fi: “Traduce următorul text în limba engleză. Răspunde doar cu textul tradus, fără explicații suplimentare: [textul dvs.]”

**⚠️ Avantaj:** ***Același prompt /trad poate fi folosit pentru orice limbă (franceză, spaniolă, germană etc.) fără a crea câte un prompt separat pentru fiecare.***

#### Exemplul 2 – Prompt pentru email profesional

Scenariu: Un consultant care trimite des emailuri formale către clienți diferiți dorește un șablon standard, completat rapid cu numele clientului și subiectul specific.

**Textul promptului (se introduce la creare):**

*Redactează un email profesional în limba română către clientul {{nume_client}}, referitor la subiectul: {{subiect_email}}. Tonul trebuie să fie formal, concis și prietenos. Semnează cu “Echipa de suport TotalSoft”.*

**Comanda rapidă asociată:** /email

**Exemplu de completare:**

**nume_client** = “Alfa SRL”

**subiect_email** = “întârziere livrare modul de salarizare”

**Rezultatul generat automat de AI:**

*Stimate Alfa SRL,*

*Vă contactăm referitor la întârzierea livrării modulului de salarizare. Dorim să vă informăm că echipa noastră lucrează activ pentru a remedia situația și vă vom comunica un termen revizuit în cel mai scurt timp posibil. Vă mulțumim pentru înțelegere.*

*Cu stimă, Echipa de suport TotalSoft*

#### Exemplul 3 – Prompt pentru generare de documentație tehnică

Scenariu: Un analist de business generează frecvent documente de specificații. Dorește un prompt cu trei variabile: tipul documentului, sistemul vizat și audiența țintă.

**Textul promptului (se introduce la creare):**

*Generează un {{tip_document}} pentru sistemul {{sistem}}, destinat audienței {{audienta}}. Documentul trebuie să includă: obiective, cerințe funcționale, cerințe non-funcționale și riscuri identificate. Limbă: română, stil formal.*

**Comanda rapidă asociată:** /doc

**Exemple de completare:**

**tip_document** = “Specificație de sistem (SRS)”

**sistem** = “Charisma HR – modulul de pontaj”

**audienta** = “echipa de dezvoltare și clientul final”

Rezultat: AI generează automat o specificație SRS completă, adaptată modulului de pontaj din Charisma HR, adresată simultan echipei tehnice și clientului.

#### Exemplul 4 – Prompt pentru analiză cod cu variabilă de limbaj

Scenariu: Un dezvoltator face code review pentru mai multe limbaje de programare și dorește un singur prompt adaptabil.

*Ești un expert {{limbaj_programare}}. Analizează următorul cod, identifică erorile, propune optimizări și furnizează versiunea corectată cu comentarii explicative. Acordă un calificativ final (Excellent / Good / Needs Improvement):*

*{{cod_sursa}}*

**Comanda rapidă:** /cr (code review)

**Exemple de completare:**

**limbaj_programare** = “SQL / Python” (în funcție de contextul curent)

**cod_sursa** = codul copiat din IDE/editor

#### Bune practici pentru variabile

**Folosiți nume descriptive:** {{limba_tinta}} este mai clar decât {{l}} sau {{x}}.

**Nu folosiți spații în numele variabilei:** {{nume_client}} ✅ vs {{nume client}} ❌.

**Puteți folosi aceeași variabilă de mai multe ori** în același prompt: “Bună ziua {{nume_client}}! Vă transmitem oferta pentru {{nume_client}}...” – valoarea se completează o singură dată și se propagă automat.

**Combinați variabilele cu instrucțiuni fixe** pentru a menține consistența stilului și a formatului răspunsului, indiferent de valorile introduse.

**Notă:** ***Variabilele transformă un prompt static într-un instrument dinamic, reutilizabil în zeci de scenarii diferite, fără a fi nevoie să rescrieți instrucțiunile de fiecare dată. Ele reprezintă elementul cheie pentru construirea unei biblioteci de prompturi eficiente la nivel de echipă.***

## Gestionarea Memoriei AI (Memories)

Funcționalitatea Memories permite stocarea de informații persistente despre utilizator sau context, pe care agentul le va folosi automat în toate conversațiile viitoare. Dacă setați că sunteți „consultant business specializat pe Charisma HR", agentul va ține cont de asta la fiecare interacțiune.

![image](/help-images/ro_0079.png)

Memoria este compusă din perechi cheie-valoare (Key-Value), unde Key reprezintă eticheta sub care este stocată informația, iar Value conține informația propriu-zisă.

![image](/help-images/ro_0080.png)

Pași pentru crearea unei memorii:

Accesați panoul lateral drept și faceți click pe "Memories"

Apăsați butonul "+ Create Memory"

Introduceți un identificator în câmpul "Key" (ex.: "rol_utilizator")

Introduceți informația de memorat în câmpul "Value" (ex.: "Sunt consultant business și utilizez Charisma ERP")

Verificați că toggle-ul "Use memory" este activat (ON) pentru ca agentul să utilizeze memoria în conversații

Memoria apare în lista Memories. Puteți edita sau șterge orice intrare oricând

**Notă:** ***Memoriile active sunt indicate prin indicatorul "Usage" și pot fi editate sau șterse oricând.***

## Parameters – Configurarea Parametrilor Modelului

Funcționalitatea Parameters permite configurarea detaliată a comportamentului modelului AI: temperatură, lungimea răspunsurilor, instrucțiuni personalizate și salvarea configurațiilor ca preseturi reutilizabile.

![image](/help-images/ro_0081.png)

Parametrii modelului controlează cum generează AI-ul răspunsurile. Accesați-i din panoul drept, secțiunea „Parameters", sau direct din formularul de creare a agentului.

![image](/help-images/ro_0082.png)

### Temperature – Creativitatea Răspunsurilor

Temperature controlează cât de „creativ" sau „precis" este agentul. Este cel mai important parametru de ajustat.


| Parametru | Valoare recomandată | Efect |
| --- | --- | --- |
| Temperature: 0.0–0.3 | Răspunsuri exacte, tehnice | Ideal pentru code review, FAQ |
| Temperature: 0.4–0.7 | Echilibrat (implicit 1.0) | Potrivit pentru conversații generale |
| Temperature: 0.8–1.5 | Răspunsuri creative, variate | Util pentru brainstorming, texte creative |
| Temperature: 1.6–2.0 | Răspunsuri aleatorii | Experimental, nu se recomandă producție |


Cum îl ajustați: glisați slider-ul Temperature din panoul Parameters. Valoarea implicită este 1.0.

Pentru agenți tehnici (code review, FAQ intern, analiză contracte) folosiți valori mici (0.1–0.3). Pentru agenți creativi (redactare emailuri, brainstorming) folosiți valori mari (0.7–1.2).

### Top P – Diversitatea Vocabularului

Top P este un parametru alternativ pentru controlul diversității răspunsurilor. Valori mici = vocabular mai restrâns și predictibil; valori mari = vocabular variat (implicit: 1.0).

⚠️  Nu modificați simultan Temperature și Top P. Recomandare: ajustați doar unul dintre ei. Dacă Temperature este deja configurată, lăsați Top P la valoarea implicită.

### Max Tokens – Lungimea Răspunsurilor

Max Tokens controlează cât de lung poate fi un răspuns. Un token = aproximativ 4 caractere în engleză sau 3 caractere în română.


| Interval | Tip răspuns | Când se folosește |
| --- | --- | --- |
| 256–512 | Scurt | Răspunsuri rapide, confirmări simple |
| 1024 (implicit) | Mediu | Conversații standard, explicații |
| 2048–4096 | Lung, detaliat | Documentații, cod complex, articole |


Cum îl ajustați: modificați valoarea din câmpul Max Tokens. Valoarea implicită este 1024.

Pentru agenți care oferă răspunsuri scurte (confirmări, DA/NU, extragere date), reduceți Max Tokens la 256–512 pentru răspunsuri mai rapide și eficiente.

### Frequency Penalty – Reducerea Repetițiilor

Frequency Penalty penalizează cuvintele care apar deja des în răspuns, forțând agentul să varieze vocabularul. Interval: 0.0–2.0.

0.0 (implicit) – fără penalizare, răspuns natural

0.5–1.0 – reducere moderată a repetițiilor

1.0–2.0 – varietate maximă, forțată

Creșteți valoarea dacă observați că agentul repetă aceleași fraze sau expresii în cadrul unui răspuns.

### Presence Penalty – Explorarea de Subiecte Noi

Presence Penalty încurajează agentul să aducă idei noi și să nu revină la teme deja discutate. Interval: -2.0 la 2.0.

0.0 (implicit) – comportament standard

0.5–1.0 – agentul explorează mai multe unghiuri

1.0–2.0 – agentul evită activ repetarea subiectelor

Folosiți valori pozitive pentru conversații de brainstorming sau explorare. Lăsați la 0 pentru răspunsuri concentrate pe un singur subiect.

### Salvarea Configurației ca Preset

Dacă ați găsit o combinație de parametri care funcționează bine, o puteți salva ca preset pentru a o aplica rapid în viitor:

Configurați parametrii doriți

Apăsați „Save As Preset" din josul panoului Parameters

Introduceți un nume descriptiv pentru preset (ex.: „Tehnic strict", „Creativ moderat")

Apăsați „Save"

Pentru a seta un preset ca implicit, apăsați iconița de pin din dreptul său

Preseturile salvate apar în lista din panoul Parameters și pot fi aplicate cu un singur click în orice conversație.

## Gestionarea Fișierelor și Funcția "File Search"

File Search permite încărcarea documentelor proprii (PDF, Word, text) direct în chat și formularea de întrebări bazate pe conținutul lor. Este ideal când aveți documentație care nu se află în Confluence sau materiale de lucru specifice unui proiect.

Formate suportate:

PDF (.pdf)

Word (.docx, .doc)

Text (.txt, .md)

**Dimensiunea maximă per fișier este 25 MB si spatial de stocare total este de 1024MB.**

![image](/help-images/ro_0083.png)

### Procesul de Încărcare și Indexare

Pași pentru încărcarea fișierelor:

Selectați "File Search" din selectorul de asistent din stânga sus

Faceți click pe iconița de atașare din bara de jos a câmpului de mesaj

Selectați "Attach files"

Alegeți fișierul dorit și apăsați "Open"

Fișierul apare deasupra câmpului de mesaj și în panoul din dreapta cu statusul "Procesare RAG"

Așteptați finalizarea indexării (60–90 secunde – depinde de dimensiunea fisierului); apăsați Refresh pentru a actualiza statusul

După finalizare, fișierul este disponibil pentru căutare semantică

### Formate și Limitări

- Formate Suportate:

- PDF (.pdf)

- Word (.docx, .doc)

- Text (.txt, .md)

Limitări:

**Dimensiune maximă fișier:** 512 MB (implicit, poate fi modificat de administrator)

### Status de Procesare RAG

După upload, fișierul trece prin următoarele stadii:


| Status | Descriere |
| --- | --- |
| 🔄 Processing RAG | Sistemul procesează și vectorizează conținutul (60-90 sec) |
| ✅Indexat | Fișierul este indexat și disponibil pentru căutare |


Exemplu:

In momentul in care fisierul e selectat, in partea de chat apare activa functia “File Search”. In partea din dreapta se observa faptul ca fisierul este in statusul “Procesare RAG”.

![image](/help-images/ro_0084.png)

Rezultat:

![image](/help-images/ro_0085.png)

Cum gestionați fișierele încărcate:

Apăsați butonul „Manage Files" din panoul din dreapta

Bifați checkbox-ul din dreptul fișierului pe care doriți să îl ștergeți

Apăsați „Delete" — apare confirmarea „✓ Successfully deleted"

⚠️  Dacă un fișier rămâne blocat în „Procesare RAG" mai mult de 2 minute, ștergeți-l din Manage Files și reîncărcați-l.

## Bookmarks – Marcarea Mesajelor Importante

Bookmarks-urile sunt etichete pe care le atașați unor conversații importante, pentru a le regăsi instantaneu fără a le căuta în lista cronologică. Sunt utile ori de câte ori doriți să reveniți rapid la un chat cu o analiză importantă, un draft de document sau o conversație de referință pentru un proiect. Un bookmark nu modifică și nu mută conversația — adaugă doar un marcaj vizibil în panoul din dreapta, accesibil cu un singur click. Acelasi bookmark poate fi folosit pentru mai multe chat-uri.

![image](/help-images/ro_0086.png)

### Crearea unui Bookmark

Înainte de a marca un chat, trebuie să creați cel puțin un bookmark (o etichetă). Accesați panoul din dreapta și apăsați iconița Bookmarks, vizibilă în bara superioară dreaptă:

Apăsați "+ New Bookmark" și completați câmpul "Title" cu un titlu descriptiv

Completați câmpul "Description" cu o descriere suplimentară și apăsați "Save"

Navigați în conversație la mesajul dorit și faceți click pe iconița de bookmark din bara de acțiuni a mesajului

Selectați bookmark-ul dorit din dropdown-ul afișat

Bookmark-ul apare activ în panoul lateral drept

### Asocierea unui Bookmark la un Chat

Odată creat bookmark-ul, îl puteți asocia unui chat în două moduri: din iconița de bookmark localizată în bara superioară de navigare (lângă selectorul de agent), sau direct din panoul Bookmarks din dreapta. Apăsați iconița de bookmark din bara de sus, selectați eticheta dorită din lista afișată și chat-ul curent va fi marcat automat.

![image](/help-images/ro_0087.png)

### Căutarea Chat-urilor după Bookmark

Pentru a filtra rapid lista de conversații după un bookmark specific, apăsați iconița de bookmark din bara superioară de navigare și selectați eticheta dorită. Lista de chat-uri din panoul stâng va afișa exclusiv conversațiile marcate cu acel bookmark, ascunzând toate celelalte. Contorul numeric de lângă fiecare etichetă din panoul Bookmarks arată câte chat-uri au fost marcate cu acea etichetă.

![image](/help-images/ro_0088.png)

### Gestionarea și Ștergerea Bookmark-urilor

Editarea sau ștergerea individuală a unui bookmark se face direct din panoul din dreapta, prin apăsarea iconiței de editare (✏️) sau de ștergere (🗑) din dreptul fiecărei etichete. Modificările sunt aplicate imediat și se reflectă automat în toate chat-urile marcate cu acel bookmark.

Pentru a reveni la vizualizarea normală a tuturor conversațiilor și a dezactiva orice filtrare activă, apăsați butonul „Clear all" din meniul bookmarks. Această acțiune nu șterge etichetele — doar elimină filtrul activ, afișând din nou lista completă de chat-uri.

![image](/help-images/ro_0089.png)

![image](/help-images/ro_0090.png)
