# ARBEJDSKØ — ØJEBLIKKENE OG ØKONOMIEN

*Tolv ændringer, dikteret af Mads 10/8 2026 efter første rigtige gennemspilning af nat 6-versionen. Intet herunder er bygget. Selvstændig: en frisk session skal kunne udføre den herfra.*

## Den røde tråd

Spillet afgør i dag sine største beslutninger i **en række i en liste.** Et bud på din bedste spiller, et deadline-day-tilbud, en kontraktforlængelse — hver af dem er en knap i en indbakke. Mads' ord om to af dem: *"Det er de her situationer i spillet som skal gøres gode og fange spillere"* og *"der skal lægges energi i."*

Gruppe C nedenfor er derfor ikke UI-arbejde. Det er dér, spillet enten bliver godt eller bliver en tabel.

---

# A · Straks — rene rettelser

## A1. "Bøger" skal hedde "Økonomi"

Ejer-lagets faner: `const t=[["home","Kontor"],["empire","Imperium"],["books","Bøger"]]` (~linje 4459). Nøglen `books` kan blive; **etiketten** skal være "Økonomi". Husk de tre steder i prosa der også siger "bøgerne": fanebeskrivelsen (~4468), `line("Indtjening · bøgernes form…")` (~4909) og `"Sæsonens afslutning · bøgerne"` (~5495).

## A2. Beløb i millioner, ikke "1018K"

Formateringsfunktionen hedder **ikke** `kfmt` (den findes ikke) — find den faktiske, der producerer `K`-suffikset, og ret den ét sted, så hele spillet følger med. Regel: under £1M → `£950k`; derover → `£1,02M`. Aldrig firecifrede tusinder.

---

# B · Økonomien skal kunne læses

## B1. Formue og kontanter skal være synlige hele tiden

**Mads' ord:** *"Der er ens formue og så ens cash, som man kan bruge. Det er 2 vigtige parametre, men de skal være synlige, så man ved det når man potentielt skal købe noget."*

To tal, ikke ét. **Kontanter** er hvad du kan bruge nu; **formuen** er hvad klubben/imperiet er værd. De skal stå fast i toplinjen — ikke kun på Økonomi-fanen — så beslutningen om at købe tages med tallet for øje. Kig på hvad `clubValuation()` og `G.balance` giver, og afgør om formuen er klubværdi, holdingværdi eller summen; det er en designbeslutning, så læg den i `DECISIONS-NEEDED.md` hvis GDD'en er tavs.

## B2. Faciliteter er ikke noget man køber — de har niveauer

**Mads' ord:** *"Faciliteter i klubben er ikke noget man kan købe. Der skal være niveau i det og så skal det pr. niveau kunne bidrage til klubben, men også gøre at det er dyrere at drive klubben. Så omkostning og indtjening skal påvirkes."*

I dag er `G.fac` binære flag (`{shop:0,pub:0,screen:0,clinic:0,training:0,basics:0,vip:0}`) med én pris hver. Nyt: niveauer som tribunerne har, hvor **hvert niveau både giver mere og koster mere i drift**. Det er den vigtigste del: en facilitet skal kunne blive en byrde, ikke kun et aktiv. Det kobler til endgame-hullet — en klub med alt på max har en driftsudgift, der skal bæres.

## B3. Sponsorer: tre tilbud, flere slots, og risikoen skal kunne vindes

**Mads' ord:** *"Når der er 2 slags sponsorer, så skal den der er risikofyldt være noget hvor man kan 'vinde' på det. Lav det gerne om så der er 3 tilbud med forskellige fordele/ulemper og lav flere sponsorater. Både trøje, stadion, hovesponsor, drikkevarer, osv."*

- **Tre tilbud** ad gangen, med reelle forskelle — ikke tre variationer af samme beløb.
- **Risikoen skal have en opside.** I dag er `G.sponsor.risk` kun en chance for kollaps; en risikabel sponsor skal kunne betale sig hjem.
- **Flere slots:** hovedsponsor, trøje, stadionnavn, drikkevarer. GDD'en har allerede 8-10 firma-karakterer med agenda og nævner slots eksplicit; stadionnavne-dilemmaet står som eget afsnit.

---

# C · Øjeblikkene — fra knap i en liste til et sted man går hen

**Dette er kernen i pakken.** Alle fire handler om at flytte en beslutning ud af indbakken og ind i en scene, hvor man har den information, beslutningen kræver.

## C1. Bud på din spiller: "Se tilbud" fører til en tilbudsside

**Mads' ord:** *"Hvis der kommer et bud på spilleren i indbakken vil jeg gerne have, at man skal klikke på 'Se tilbud' i stedet for bare at træffe beslutningen i indbakken. Det skal så sende en ind på et tilbudsbillede hvor man kan forhandle og se noget info omkring spilleren, den bydende klub og potentielle andre købere, da det kan have en påvirkning på ens beslutning."*

Indbakken får **én** knap: *Se tilbud*. Siden skal vise: spilleren (form, alder, kontrakt, hvad han betyder for truppen), **den bydende klub** (division, hvor de ligger, hvad de har råd til), **andre interesserede** — og en forhandling. At vide at to klubber vil have ham, ændrer beslutningen; det er hele pointen.

## C2. Deadline day skal være sin egen side

**Mads' ord:** *"Hvad betyder 'hold på ham' i deadline day vinduet? Man skal kunne vide lidt mere om spillere der bliver tilbudt til dig og spillere der bliver budt på i deadline day. Du bliver nødt til at gøre det til en hel side man skal ind på (kun synlig på den dag). Så man kan se info om spillere, klubber og alt den info man har brug for. Igen… det her er et af de steder vi skal gøre spillet fedt, så der skal lægges energi i."*

- **Første opgave: find ud af hvad "hold på ham" faktisk gør** og skriv det, så en spiller kan forstå det. Er handlingen uklar for Mads, er den uklar for alle.
- **Egen side, kun synlig på deadline day.** Begge retninger: spillere der tilbydes dig, og bud på dine egne.
- Fuld information pr. post: spilleren, klubben, hvad der sker hvis du siger nej, hvor lang tid der er igen.
- GDD'en beskriver dagen som *"sæsonens teaterforestilling… et rullende feed time for time med 3-5 muligheder der KUN findes her"*. Den ambition er ikke indfriet i dag.

## C3. Kontraktforhandling: dialog frem for faste beløb

**Mads' ord:** *"Når man forhandler med spillere omkring kontraktforlængelse skal det ikke altid bare være et 'fastbeløb' der kan forhandles hjem. Hvis spilleren er glad for at være her og man giver dem det de gerne vil have, så skal de acceptere en lavere pris (og det samme modsatte). Der må godt være lidt spil i det. Og det skal ikke være sat hvad man kan give dem på de forskellige parametre. Det skal mere være dialog end bare kliks."*

Tre krav, og de er alle tre en ændring af form, ikke af tal:

1. **Prisen er ikke fast.** Trivsel, spilletid, rolle, klubbens retning og hvor længe han har været her skal flytte, hvad han accepterer — i begge retninger.
2. **Parametrene skal ikke være faste valgmuligheder.** I dag er det knapper for år og rolle. Det skal være en samtale, hvor man kan tilbyde og han kan svare.
3. **Poker-princippet holdes** (GDD, låst): hans krav er skjult i første runde.

## C4. Free agents skal fortælle vejen videre

**Mads' ord:** *"Hvis man tilbyder noget som de ikke er tilfredse med, må de ikke bare forsvinde. De skal indikere hvordan vi kommer videre. Man kender ingenting af deres krav på forhånd, så de skal være informationsgivende."*

I dag forsvinder en free agent ved et utilfredsstillende tilbud, og da man **intet** kender til hans krav på forhånd, er der ingen læring i afslaget. Han skal blive og pege: *for lidt i løn · for kort kontrakt · han vil have en bærende rolle · han vil se klubben rykke op først*. Afslaget skal være det, der gør næste bud muligt.

---

# D · Realisme og hygiejne

## D1. Indbakken renses ved "Næste uge"

**Mads' ord:** *"Hvis indbakken indeholder beskeder der bare er 'info' så skal de slettes når man trykker 'Næste uge'. På den måde holder vi klubbens indbakke overskuelig når man går ind på klubben. Alternativt, kan man sætte et flag på en besked hvis man gerne vil have den bliver."*

Beskeder **uden** handling (`!m.action`) ryddes ved kampdagsskifte. Beskeder med handling bliver — de venter på svar. Plus et **behold-flag**, spilleren selv kan sætte. Pas på: rydningen må aldrig kunne tage en besked, der stadig kræver svar, og harness'en skal have en invariant om netop det (samme fejlklasse som pakke 0's blindgyde).

## D2. Spillere skal blive dårligere med årene

**Mads' ord:** *"Spillere skal gerne blive 'dårligere' med årene. Så en spiller der rammer en vis alder, skal når han bliver ældre (ved sæsonskift) gå ned i niveau, på den måde rammer vi mere en virkelighed."*

Alderskurven skal falde efter en tærskel, anvendt **ved sæsonskift**. GDD linje 195 er præcis: *"udvikling til ~24, peak 25-29, gradvist fald fra ~31 (Fysik falder først — den aldrende playmaker kan stadig noget, men ikke hver 3. dag)."* QA fandt i august, at faldet i dag starter ved 30 for **alle tre** attributter med samme rate — så fysik falder ikke først, som GDD'en foreskriver. Ret begge dele på én gang.

Bemærk konsekvensen: det gør trupfornyelse til en løbende opgave og giver ungdom og scouting et formål. Mål effekten på trupstørrelse og lønsum — det rører balancen.

## D3. "Det usexede basale" skal deles op

**Mads' ord:** *"Det usexede basale er ikke en facilitet man skal. Del det op i punkter i stedet for."*

I dag: `basics:{n:"Det usexede basale",cost:15000,txt:"parkering, toiletter, lys"}` — én knap til £15.000. Del den i **parkering · toiletter · lys**, hver med sin pris og sin virkning. De fodrer i dag `BAL.demand.basics` (0,05 på byefterspørgslen) og `BAL.mood.basicsOpens` (+4 humør ved åbning); den samlede virkning skal fordeles, ikke ganges op. Hænger sammen med B2 — de bliver niveauer som resten.

---

# Rækkefølge, hvis det bygges i én kørsel

**A først** (minutter, ingen risiko), derefter **D1 og D3** (afgrænsede), så **B2** (faciliteter som niveauer — den rører økonomien, og B3 og D3 bygger ovenpå), så **B1 og B3**, og **C til sidst med mest tid.** C2 og C3 er de to, Mads udtrykkeligt har bedt om at få gjort *gode*; de skal ikke klemmes ind i den sidste halve time.

**Balancemåling efter B2, B3 og D2** — alle tre flytter økonomien. Måltallene står i `Claude.md`.

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
node test-harness.js --seeds=200 --seasons=20 --bot=both
```

Nye modaltyper og nye skærme SKAL registreres i harness'en (`handleModal` + `HANDLED_MODALS`), ellers stopper den før botten starter. Nye skærme skal desuden med i blindgyde-auditten — C1 og C2 tilføjer to sider fulde af knapper, og det er præcis dér, pakke 0's fejl opstod.
