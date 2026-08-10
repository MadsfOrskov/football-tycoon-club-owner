# NAT 7 — ØJEBLIKKENE OG ØKONOMIEN

*Udviklingsagent, 10/8 2026. Branch `nightly/oejeblikke`. Master er urørt — ikke én commit, ikke ét push.*

**Alle tolv ændringer er bygget.** A1, A2, D1, D3, B2, B1, B3, B4, D2, C1, C2, C3, C4.

**Slutgaten er grøn:** `node test-harness.js --seeds=200 --seasons=20 --bot=both` → `REGRESSION_OK`, **0 af 400 karrierer fejlede**. Kørt kl. 16:08 UTC på branchens spids.

Rækkefølgen fra planen er fulgt med **én afvigelse**, som står i afsnit 3.

---

## 1. Måltallene i `Claude.md`, målt på slutkoden

`--seeds=10 --seasons=5 --stats`:

| Måltal | Krav | **Målt** | |
|---|---|---|---|
| Netto pr. kampdag, sæson 1 | ±£2.000 | **−£1.336** | ✅ |
| Indtjening sæson 1 | £100-260k | **£134.507** | ✅ |
| Trup pr. kampdag | 16-17 | **16,7 / 16,8 / 16,2 / 15,8** | ✅ |
| Trup ved sæsonslut | over 13 | **13,93** | ✅ |
| Oprykninger sæson 1 | 5-8 af 10 | **5 af 10** | ✅ |
| Administrationer (10×5) | 0-4 | **0** | ✅ |
| Store kampe pr. sæson | 3-5 af 26 | **4,3** | ✅ |

Og på 60 seeds × 20 sæsoner: administrationer **1,20 pr. karriere** (ROADMAP's mål ~1), gennemsnitlig stemning 66, trup ved sæsonslut 14,14.

**Bemærk trup ved sæsonslut på 13,93.** Det er over 13, men kun lige. Tallet er efterslæbende og domineret af gulvet, som `Claude.md` selv skriver — trup *i* sæsonen er 15,8-16,8 og det er tallet der viser at dybde bruges. Men det er tættere på gulvet end i nat 6 (14,63), og D2's alderskurve trækker den vej: flere spillere skal erstattes. Hold øje med det.

---

## 2. Hvad der blev færdigt, og hvad hver ting kostede

### A1 · "Bøger" → "Økonomi"
Etiket og tre prosalinjer. Nøglen `books` bevaret, så ingen gemmefil bliver ugyldig.

**Fund undervejs:** harness'ens M2.5-vagt testede `Kontor|Imperium|Bøger` som **OR** — den bestod uanset hvad de to sidste hed, fordi "Kontor" aldrig flytter sig. Nu kræves alle tre hver for sig.

### A2 · Beløb i millioner
`kfmt()` fik en M-gren. Under £1M uændret (`£950k`), derover `£1,02M` med klippede nuller (`£2,5M`, `£45M`). Rettet ét sted, 199 kaldesteder følger med.

**Vagten ser RENDERET html**, ikke `kfmt()` — så den fanger også en fremtidig lokal formatering. Den fandt to ting:
- sabotagen (kfmt sat tilbage) → rød, på Imperium-skærmen: `værdi £4588k`
- **en ægte randfejl ved 60 seeds × 20 sæsoner:** `£999.950` blev `£1000.0k` — fire cifre foran k, altså præcis det A2 skulle fjerne. Grænsen er nu 999.500. **10×5 var grøn.**

**Ét åbent spørgsmål:** decimaltegnet. `£1,02M` (dansk komma) står ved siden af `£276,028` (en-GB tusinder) på samme skærm. Bygget som du dikterede, men skrevet op som **punkt 13 i `DECISIONS-NEEDED.md`** med tre alternativer. Ét tegn at flytte.

### D1 · Indbakken renses ved kampdagsskifte
Har en besked ingen knap, ryger den. Behold-flag (★) er din undtagelse. **Målt: 734 beskeder ryddet pr. karriere** over 20 sæsoner.

Rydningen ligger i **det ene udtryk hvor `G.md` flytter sig** — ikke i `nextWeek()`, fordi tiden også flytter sig når man spiller kampen inde fra klubben.

**Og loftet på 18 tog før bare den ældste med `pop()`.** Det kunne skubbe en gammel ubesvaret budbesked ud bagfra — samme fejlklasse som pakke 0's blindgyde. Nu tages den ældste der *ikke* venter på svar, og venter alle 18, vokser indbakken frem for at spise en beslutning.

Tre vagter. **Den anden er den vigtige:** uden den var vagt (1) grøn med kaldet til `sweepInbox()` fjernet — præcis QA's N2-familie. Nu kræves at læst post FAKTISK er væk efter et kampdagsskifte.

### D3 · Det usexede basale delt i tre
Parkeringspladsen £5.000 · Toiletterne £4.000 · Lysanlægget £6.000.

**Den samlede virkning er FORDELT, som du krævede — og det er en egenskab ved koden, ikke en hensigt i en kommentar.** Totalerne bor stadig i `demand.basics`, `matchday.basics` og `mood.basicsOpens`; `BAL.basics.split` holder tre andele der summer til 1 på hver akse. Alle tre på niveau 1 giver derfor præcis hvad den gamle knap gav — målt gennem spillets egen `townDemand()` og `gateReceipts()`.

**Bivirkning, målt:** League Three gik fra −£3.356 til −£2.556 netto pr. kampdag, og sæson-til-sæson-nettoen blev markant roligere. Årsagen er adfærd, ikke satser: ni facilitetsvalg i stedet for syv lader pengene fordele sig, hvor botten før købte i klumper.

### B2 · Faciliteter som niveauer
Niveau 0-3. Driften **fast pr. niveau**, indtægten følger fremmødet.

| shop+pub+toiletter, netto pr. hjemmekampdag | niveau 1 | niveau 3 |
|---|---|---|
| fuld klub (kap 7.800 · 7.785 tilskuere) | +£17.384 | **+£29.685** |
| arveklubben (kap 1.500 · 813 tilskuere) | +£1.136 | **−£3.125** |

Prisen stiger 2,4× pr. niveau mens indtægten kun stiger til 2,0×. Det er kilen der gør højere niveauer til noget man skal kunne fylde — **og overinvestering til en fejl man kan lave.**

To kurver, fordi de to slags faciliteter ikke er samme slags tal: `yield` ganger penge, `rate` ganger evner (klinik, træning) og er bevidst flad — 2,2× færre skader ville være stærkere end noget andet i spillet.

**Nødbremsen virker straks:** driften væk samme dag, virkningen til nul, niveauet bevaret, klubværdien uændret (murstenene står der). Genåbning tager kampdage og bruger den ene byggeplads.

Seks sabotager. **Den ene slap først:** `facUpkeep()` var rigtig hele vejen og blev bare ikke trukket fra i `settleFinances()`. Vagten kører nu spillets egen afregning på en udekampdag og kræver at forskellen mellem åben og lukket facilitet er *præcis* driften.

**Regningen — og den er skrevet op, ikke tunet væk.** League Three gik fra −£835 til −£3.356 netto pr. kampdag. Attribution ved isolationskørsler: cirka halvdelen fra den faste drift, halvdelen fra at der nu altid er et næste niveau at købe. Se **punkt 14 i `DECISIONS-NEEDED.md`** med de to skruer.

### B1 · Formue og kontanter fast i toplinjen
Et bånd under headeren på **begge lag og alle otte skærme**. Kontanterne er det handlingsanvisende tal; formuen er pejlemærket, med retning og afstand siden sidste sæson. Et tryk åbner opdelingen.

Fortyndingen er synlig: halveret andel i en **større** klub giver lavere formue.

**To sabotager slap først**, og de er lærerige:
- opdelingen viste hele klubværdien som din → grøn, fordi vagten målte `netWorth()` og ikke arket. Nu kræves at de tre poster summer til formuen.
- kontant-cellen viste **klubkassen** → grøn. `kfmt` er en top-niveau `const` og dermed ikke global i et vm-script, så cellen kan ikke sammenlignes med en formateret streng uden at kopiere formateringen ind i testen. I stedet måles **opførsel**: cellen skal flytte sig når *dine* kontanter gør, og stå stille når klubkassen gør. Det er den forskel der afgør om tallet er til at handle på.

### B3 · Tre tilbud, fire slots, bonusser du selv udløser
Risikostige, ikke tre priser: **Sikker** (fuld grund, 3 sæsoner, ingen bonus) · **Delt** (72 %, 2 sæsoner, oprykningsbonus) · **Alt på ambitionen** (45 %, 1 sæson, oprykning + top 4 + mesterskab). Bonusserne regnes af aftalens *referencebeløb*, ikke af den nedsatte grund — ellers ville "lav grund" også betyde "lille bonus".

Fire slots: hovedsponsor, trøjeleverandør, drikkevarer, stadionnavn. Hvert med sin andel og sin tærskel for hvornår nogen ringer — ingen køber stadionnavnet i League Three. **Stadionnavne-dilemmaet** koster fanhumør den dag der skrives under.

**Koblingen til forventningsmødet:** dristigheden fra budgetmødet ganger bonusserne. Lover du højt begge steder, hænger to udbetalinger på samme sæson, og modalen siger det højt.

Målt over 60 karrierer × 20 sæsoner:
- aftaler pr. slot: trøje 332 · hovedsponsor 503 · drikkevarer 264 · stadionnavn 170
- valgt form: sikker 408 · delt 422 · **alt på ambitionen 439**
- bonusser: 755 udløst, 1.011 forgæves — **43 % ramt**

Alle fire slots og alle tre former bliver altså spillet, og bonussen er en ægte gamble.

**GDD'ens "en pokalrunde" er ikke med som udløser:** der er ingen pokal i spillet, og pokalen er ikke i min ordre. Mesterskabet er den tredje i stedet, og substitutionen står i koden.

**Én ægte fejl, fundet ved 40 seeds × 20 sæsoner og ikke ved 10 × 5:** `sponsorCopy` var en flad kopi, så `triggers`-arrayet lå to steder i `G` i det øjeblik en aftale både stod i et slot og i en ubesvaret indbakkebesked. `assertSerialisable` fangede det. **Det er præcis derfor den store kørsel findes.**

### B4 · Prisskalaen flytter sig med divisionen — og er dæmpet
**Dette er den ændring hvor din balanceadvarsel udløste sig selv, ordret som du skrev den.**

Målt på **60 seeds × 20 sæsoner, samme seeds før og efter**, netto pr. kampdag:

| division | før B4 | B4 som dikteret (normalpris £34) | **B4 dæmpet (£28)** |
|---|---|---|---|
| League Three | −£5.279 | −£4.623 | **−£5.019** |
| League Two | −£4.064 | −£1.195 | **−£1.350** |
| League One | −£3.902 | +£4.471 | **+£2.867** |
| **Premier** | **−£8.566** | **+£10.619** | **+£6.907** |

**Premier gik fra det dyreste sted i spillet til en pengemaskine.** Jeg har dæmpet normalprisen fra £34 til £28, hvilket tager en tredjedel. Længere ned kan den ikke komme uden også at flytte **din** £25-nedre grænse — og det er dit valg, ikke mit. (Min egen invariant stoppede mig: den fejler hvis normalprisen falder under divisionens minimum.) **Punkt 15 i `DECISIONS-NEEDED.md`** har de tre veje videre, og min anbefaling.

**Hvad B4 ikke ødelagde: kurvens form.** Elasticiteten er gjort relativ til normalprisen, så samme procent over "normalt" koster samme andel af publikum i alle fire divisioner — og League Three-kolonnen er bit for bit de gamle tal (£10 / £16 / £20 / +£8). Skalaen åbner sig kun opad. **Det er derfor det er én skala og ikke to multiplikatorer på samme tal.**

To harness-vagte stod på League Threes tal og måtte rettes: storkampssvinget gik 0..8 uanset division, og elasticiteten blev målt på et **udsolgt** hus, hvor et højere tillæg korrekt *er* gratis profit — det er signalet om at bygge, ikke en fejl i priskurven.

### D2 · Fysikken falder først, og mennesker nævner det inden
**QA's augustfund er rettet, begge halvdele.** Faldet startede ved 30 for alle tre attributter med samme rate. Nu: evner fra 31, fysik fra **30** — et år før — og cirka dobbelt så hurtigt. Faldet accelererer med alderen.

| | som 30 | som 33 | som 36 |
|---|---|---|---|
| fysik | −1,01 | −1,51 | −2,50 |
| evner | 0,00 | −1,01 | −1,50 |

Og i **rigtigt spil**, 7.295 aldrende spillere gennem et sæsonskifte: fysik −1,81 mod evner −1,09 point pr. mand pr. år.

**Advarslen** kommer fra gafferen eller scouten, og der er præcis to øjeblikke hvor den er en oplysning og ikke støj: året før benene går, og året før spillet går. Første udgave advarede en gang pr. spiller pr. *sæson* — 51 beskeder pr. karriere, og en 34-årig fik den samme besked hvert år. Nu højst to i hele hans tid i klubben. Målt: 66 advarsler pr. karriere over 20 sæsoner.

**Virkningen på trup og lønsum, som planen krævede målt:** trup ved sæsonslut 15,07 → 15,45, kampdage under 11 friske 30 % → 27 %, løn/uge sæson 7 £28.101 → £28.844, **administrationer 1,49 → 0,50 pr. karriere**. At administrationerne *faldt* var ikke forventet: en aldrende spiller mister værdi og løn hurtigere nu, så den klub der følger advarslen slipper billigere end den der sad på en dyr 34-årig.

`agePlayer()` er trukket ud i egen funktion, men vagten **kalder den ikke direkte** — der sidder en tællende wrapper om både `agePlayer()` og `ageWarnings()`, som kun ser de kald spillet faktisk foretager. Advarslens tal snapshottes ved hovedløkkens slutning, før de tvungne scenarier kalder den selv.

### C1 · Buddet er et marked man arbejder
Indbakken får **én** knap. Fire kort: manden (og hvad han betyder for truppen) · den bydende klub (hvad de kan bære, og hvor stor en del af det buddet er) · de andre interesserede (tre niveauer, navngivne klubber) · forhandlingen.

**"Ring rundt" koster to gange, som du beskrev det:**

1. **Det siver.** Selvtillid ned; er han publikumsyndling, falder stemningen. Har du **offentligt** sagt at han ikke var til salg, koster det dobbelt. "Afvis" *er* den offentlige udmelding.
2. **Markedet reagerer i begge retninger.** Målt på 260 opkald pr. opstilling, **samme mand, kun klubbens nød forskellig:**

| | chance for at buddet STIGER |
|---|---|
| rig klub | **88 %** |
| fallitklub | **13 %** |

Siden siger begge tal højt, før man trykker. Botten spiller siden som en spiller — 52 opkald pr. karriere — og træffer beslutningen derfra.

**Om "formandens ord":** hele systemet er ikke i min ordre (det står i `ROADMAP.md`). Jeg har bygget den mindst mulige krog, så løftet kan koste noget: et afvist bud på ham i denne sæson *er* udmeldingen. Det er ikke det fulde system, og det ved jeg.

### C2 · Deadline day som egen side — og "hold på ham" er nu et valg
**Din første opgave først: hvad gjorde knappen egentlig?** Den betalte 25 % af spillerens værdi i loyalitetsbonus, gav +5 selvtillid, og han blev. **Problemet var ikke forklaringen. Valget var DOMINERET:**

| | udfald |
|---|---|
| lad ham gå | +135 % af hans værdi |
| hold på ham | **−25 % af hans værdi** |
| gør ingenting | han bliver, og det koster **nul** |

Gjorde man ingenting — lukkede bare vinduet — fik man præcis samme udfald som ved at betale, gratis. **Knappen kunne kun spilde penge.** Den var ikke uforklaret, den var uden mening, og derfor kunne du ikke gennemskue den. Ingen kan gennemskue en knap der aldrig er det rigtige valg.

Din ordre siger "er handlingen meningsløs, så fjern den". **Jeg har ikke fjernet den**, fordi den ikke er meningsløs i sig selv — den manglede en modsætning. Et bud på deadline day betyder at han **vil væk**. Bliver han hverken solgt eller holdt, føler han sig taget for givet: selvtillid −14, stemning −2 hvis han er publikumsyndling, og 45 % risiko for en transferanmodning. Nu er de tre valg tre forskellige ting, og "sig ingenting" er en **knap**, ikke bare noget der sker hvis man lukker vinduet. At smække vinduet i med åbne poster giver samme pris.

Siden findes kun på deadline day, og **man kan ikke gå forbi den**: trykker man "spil kampdag" fra en anden skærm, føres man derind. Målt over 60 karrierer: hold 944 · lad gå 834 · sig ingenting 510 · smækket i med noget åbent 343.

### C3 · Han åbner med en holdning, du byder frit, prisen er ikke fast
**Prisen er ikke fast.** De fem forhold du nævnte, hver som en navngiven multiplikator med **begge** fortegn — målt på samme mand, samme vilkår, kun behandlingen forskellig:

| | rabat | | tillæg |
|---|---|---|---|
| Han har det godt her | ×0,93 | Han er ikke glad | ×1,12 |
| Du har spillet ham | ×0,94 | Han har siddet på bænken | ×1,09 |
| Du holdt nøglespiller-løftet | ×0,90 | Du brød det | ×1,27 |
| Klubben rykkede op | ×0,94 | Klubben rykkede ned | ×1,08 |
| Mange år i klubben | ×0,94 | | |
| **Bedst behandlet i alt** | **×0,73** | **Dårligst** | **×1,45** |

"Er han glad og får han det han vil have, accepterer han mindre" er altså **27 % rabat** — og det står i arket med ord og fortegn, så man kan se hvorfor prisen er som den er.

**Han lægger ud med en holdning**, valgt af det stærkeste i hans situation. Syv situationer giver syv forskellige åbninger. **Hvert modbud får en replik** der flytter sig med afstand og humør og **peger på en vej videre** — syv tilstande giver syv forskellige replikker.

**Poker-princippet er låst for begge slags forhandling.** En forlængelse var før en undtagelse, men når han skal åbne med en *holdning*, kan tallet ikke stå i arket ved siden af den. Første runde er blind. Det er en ændring af eksisterende adfærd, og den følger direkte af C3's punkt 1.

**To fund fra vagten, som var ægte fejl i min egen kode:**
- **Din egen eksempelreplik kunne aldrig vises.** Jeg satte "Det er tæt. Giv mig et år mere, så skriver jeg" ved 3 % afstand — men `negoSubmit` accepterer ved 97 %, så handlen er allerede i hus dér. Båndene følger nu mekanikken.
- `p.since` (år i klubben) opstod først ved en **indlæsning**, så gem/indlæs ikke længere var tabsfri. Feltet sættes nu fra fødslen.

### C4 · Retningen, ikke tallet — og han bliver stående
For en fri agent vises lønkravet **aldrig**. I stedet siger agenten hvad der er galt og i hvilken retning: *"Det er for lidt — og jeg vil have mere end to år."* Retningen bygges af de samme tre skruer du har, og peger på den der faktisk mangler: ville en længere aftale bringe kravet under buddet, er det **år** han mangler og ikke penge.

**Og koden gjorde det modsatte af din anden regel:** `negoCollapse()` **slettede** ham af `G.freeAgents` ved et sammenbrud, så den information man netop havde købt med et afslag var værdiløs i samme sekund. Nu bliver han stående, teksten inviterer tilbage, og man kan forhandle igen med det man lærte.

---

## 3. Hvor jeg afveg fra planen, og hvorfor

**Én afvigelse: D3 er bygget EFTER B2, ikke før.**

Planens rækkefølge sætter D3 i anden position, men planens egen begrundelse siger at *"B3 og D3 bygger ovenpå"* B2. De to udsagn står i samme afsnit og peger hver sin vej. Jeg fulgte begrundelsen: D3's krav *"hver med sin pris og virkning"* **er** niveaukurven, så D3 først ville have betydet at designe de tre huse som binære flag og derefter om som niveauer — to gemmefil-migreringer på samme felt og et kasseret design. De tre huse er niveauer fra første commit i stedet.

Alt andet er bygget i den rækkefølge du gav.

---

## 4. Det jeg dæmpede eller flyttede — og ingen af det i stilhed

Tre ting er skrevet op i `DECISIONS-NEEDED.md` frem for at blive besluttet af mig:

- **Punkt 13 · A2's decimaltegn.** `£1,02M` (dansk komma) mod `£276,028` (en-GB tusinder). Bygget som dikteret. Ét tegn at flytte.
- **Punkt 14 · B2's drift gør League Three ~4× strammere.** Attribution, alle måltal, og de to skruer. Min anbefaling: lad driften skalere med divisionen, sammen med punkt 15.
- **Punkt 15 · B4's Premier.** Dæmpet fra +£10.619 til +£6.907. Længere kræver at din £25-grænse flyttes. Tre veje videre og min anbefaling.

**Intet måltal er tunet væk.** Da administrationerne stod på 2,75 pr. karriere, rettede jeg ikke et tal — jeg fandt ud af **hvorfor**: botten lukkede først faciliteter ned når kassen var *under nul*, altså efter insolvens. B2 byggede nødbremsen præcis til den situation. Botten bruger den nu som en spiller ville, og administrationerne faldt til 1,49 — af sig selv. **Begge tal står her, så ingen tror at balancen flyttede sig.**

---

## 5. Hvad jeg var i tvivl om

**1. A2's decimaltegn.** Jeg byggede dit `£1,02M` og var uenig med mig selv om det hele vejen. Det er ikke en detalje: `1,02` kan læses som tusindtalsgruppering ved siden af `£276,028`. Punkt 13.

**2. Om jeg måtte gøre forlængelser blinde i første runde.** C3 siger "han lægger ud med en holdning, ikke et tal" og "poker-princippet holdes". Den eksisterende kode gjorde en undtagelse for forlængelser med en dokumenteret begrundelse fra en tidligere pakke. Jeg valgte C3, fordi de to ikke kan være sande samtidig. Hvis undtagelsen var vigtigere end du husker, er det én linje tilbage.

**3. Hvor "meningsløs" C2's knap egentlig var.** Din ordre gav mig lov til at fjerne den. Jeg beholdt den og gav det tredje valg en pris i stedet, fordi diagnosen var *dominans* og ikke *tomhed*. Det er en fortolkning af din instruks, ikke en udførelse af den.

**4. B3's tredje bonusudløser.** Planen siger "en pokalrunde". Der er ingen pokal, og pokalen er ikke i min ordre. Jeg satte mesterskabet i stedet. Det er ikke det samme — et pokaleventyr er en *overraskelse*, et mesterskab er en *plan*.

**5. Om `sponsorDef` og `bankExposure` skulle ryddes.** Begge er stadig døde (QA's N5 og N9). De er ikke i min ordre, og jeg lod dem ligge frem for at rydde op i noget du ikke har bedt om.

---

## 6. Hvad jeg IKKE kunne efterprøve

**Dette afsnit er det vigtigste i rapporten, og de tidligere rapporter var mest værd hvor de var ærlige her.**

**1. Jeg har ikke set noget af det på en telefon.** Ikke én pixel. C1's tilbudsside har fire kort med mange rækker, og C2's deadline-side kan have otte poster åbne samtidig. Harness'en verificerer at markup er velformet, at hver tilstand har en knap, og at intet siger `NaN` — den kan ikke se om siden er **læselig** i portrait på en iPhone, om båndet med formue og kontanter stjæler for meget plads over headeren, eller om C3's nye "hvad der flytter hans tal"-kort gør forhandlingsarket for langt at scrolle. **Det er den mest sandsynlige uopdagede fejl i nattens arbejde.**

**2. Jeg kan ikke måle om øjeblikkene er FEDE.** Du bad om at C2 og C3 skulle "fange spillere". Jeg kan bevise at de tre valg på deadline day er tre forskellige ting, og at en velbehandlet spiller kræver 27 % mindre. Jeg kan ikke måle om det føles som en forhandling eller som en regnemaskine. Syv forskellige replikker er et tal; om de er *gode* replikker er din dom.

**3. Balancen ud over 20 sæsoner.** Alt er målt på højst 20 sæsoner. Facilitetsdriften er en fast omkostning der vokser med hvert niveau, og B4 gør toppen profitabel — hvad de to gør ved en karriere på 40 sæsoner, ved jeg ikke.

**4. Om `sane`-bottens facilitetspolitik ligner en spiller.** Jeg ændrede den (nødbremsen), og administrationstallet faldt næsten 50 %. Det er et **ærligt** valg med en begrundelse, men det er stadig mig der har valgt hvad "fornuftigt spil" betyder, og alle tal i afsnit 1 hviler på det valg.

**5. Premier-tallene bygger på en lille og skæv stikprøve.** Før B4 havde Premier 286 kampdage af 60 karrierer × 20 sæsoner; efter B4 havde den 2.262. **Populationen ændrede sig med ændringen** — klubber overlever nu deroppe i stedet for at ryge lige ned igen. Før/efter-tallet for Premier sammenligner altså ikke helt de samme klubber, og det er den svageste måling i rapporten.

**6. Jeg har ikke efterprøvet gemmefiler skrevet af nat 6-koden på disken.** `checkOldSaveLoads()` bygger en gammel gemmefil ved at fjerne felter fra den nuværende og indlæse den — den dækker de fem formændringer i nat (`G.fac` → niveauer, `basics` → tre huse, `G.sponsor` → `G.sponsors`, `G.dl`, `p.since`, `sellOffer`-felterne). Det er en **rekonstruktion**, ikke en rigtig fil fra i går. QA skrev 40 rigtige gemmefiler sidste gang; det har jeg ikke gjort.

**7. Talscanneren er stadig blind for prosa.** Jeg har skrevet meget ny tekst i nat — C1's forklaringer, C2's tre konsekvenser, C3's åbninger og replikker, C4's retninger. En tekst der lover en *adfærd* uden at nævne et tal fanges af ingen vagt. QA's punkt 7.2 gælder fuldt ud for nattens arbejde, og der er mere prosa end nogen tidligere nat.

**8. `basicsCost` står i blindgyde-auditten som "aldrig rørt".** Det er en falsk positiv: den kaldes ved modul-initialisering inde i `FACS`-literalen, hvor auditten ikke ser den. Værd at kende, så den ikke bliver "ryddet op" af en fremtidig nat.

---

## 7. De tre faldgruber, du målte før — hvad de kostede i nat

**1. "Sabotér hver ny invariant, FØR du stoler på den."** 45 sabotager kørt. **Otte af dem var grønne første gang**, og hver af dem afslørede en vagt der målte noget andet end sit navn:

| Hvad jeg saboterede | Hvorfor vagten ikke så det |
|---|---|
| `sweepInbox()`-kaldet fjernet | vagten målte at beskeder overlevede, ikke at post blev ryddet |
| driften trukket fra i `settleFinances()` | `facUpkeep()` var rigtig; ingen målte at den ramte kassen |
| opdelingen viste hele klubben som din | vagten målte `netWorth()`, ikke arket |
| kontant-cellen viste klubkassen | vagten sammenlignede ikke det viste tal med noget |
| `ageWarnings()`-kaldet fjernet | scenariet kaldte funktionen selv |
| tre tilbud gjort til samme aftale | firmaerne betaler forskelligt, så beløbene så forskellige ud |
| kassestillingen fjernet fra markedets retning | mine to opstillinger havde også forskellige *spillere* |
| C3's lever fjernet | min regex tålte fallback-teksten med |

**Uden sabotagerne havde otte af nattens tolv ændringer haft en vagt der bestod mod ødelagt kode.**

**2. "Tvungne scenarier forurener statistikken."** Alle nye tal snapshottes ved hovedløkkens slutning, før scenarierne kører. Det gælder D2's advarselstæller (`ageWarnLive`), B3's slots (`sponsorSlotsSigned`) og D1's rydning. Uden det ville D2's advarselstal have talt scenariernes 800 kunstige kald med.

**3. "B4's balanceadvarsel er et krav, ikke en note."** Netto pr. kampdag pr. division er målt før og efter, på samme seeds, og står i afsnit 2. **Premier gik fra dyrest til pengemaskine, og jeg dæmpede.** Det er rapporteret, dæmpet, og resten er skrevet op som din beslutning.

---

## 8. Hvad den store gate fandt, som 10×5 ikke gjorde

Gaten på 200 × 20 × to profiler måtte køres **fire gange**. Hver gang fandt den noget, og det er værd at skrive ned præcis hvad:

| Kørsel | Fund | Hvad det var |
|---|---|---|
| 1 | `myShare = -9` i 12 af 400 | **ÆGTE FEJL I SPILLET** (QA's N3): en redning kunne sælge en skive på 10 % når du kun ejede 1 %. `controlAt` gik fra 50 til 0 i nat 5, og guarden fulgte ikke med. Ejerandelene summede ikke til 100, og æra-skærmen viste en negativ andel af en fodboldklub. Skiven skæres nu til det man ejer. |
| 2 | nedrykningens lønnedgang i 2 af 400 | **MÅLEFEJL:** vagten sammenlignede en samlet ratio med en faktor med 0,02 tolerance, men nedrykningen runder pr. spiller til hele £10. Nattens ændringer gjorde lønningerne lavere, og så voksede afrundingsfejlen. Måler nu den afrundede forventning eksakt. |
| 2 | C4's egen måling i 5 af 400 | **MÅLEFEJL:** frie agenter kan kun registreres i vinduet, og scenariet arvede den kampdag karrieren sluttede på. |
| 3 | `formandens ord` i 2 af 400 | **MIN ÆNDRING, KORREKT OPFØRSEL:** C2's gate fører til deadline-siden hvis `G.dl` står åbent. Tre tvungne scenarier tvinger selv en kampdag frem og skal rydde den, som de rydder `bankDue`. |
| 4 | **0 af 400** | `REGRESSION_OK` |

Dertil de to fund tidligere på natten som kun de store kørsler så: `sponsorCopy`'s delte array (40×20) og `kfmt`'s randfejl ved £999.950 (60×20). **Alle seks var usynlige ved 10 seeds × 5 sæsoner.**

---

## 9. Nye vagte, og hvad de holder fast

23 nye eller omskrevne invarianter. De der er værd at kende ved navn:

- `checkInboxSweep` + `armInboxSweep` — D1, to sider: ubesvarede beslutninger overlever, og læst post er **væk**. Måler kun det ordinære kampdagsskridt, for sæsonskiftet flytter `md` ad en anden vej.
- `checkInboxCap` — indbakkens loft må ikke spise en beslutning bagfra.
- `checkFacilityLevels` — B2, otte led, inkl. at driften rammer kassen og at hver tilstand i UI'et har en knap.
- `checkBasicsSplit` — D3, at andelene summer til 1 på hver akse.
- `checkWealthBar` — B1, båndet på alle otte skærme og opførselen af de to celler.
- `checkSponsorSlots` — B3, syv led, inkl. risikostigen pr. sæson (ikke pr. aftale).
- `checkTicketScale` — B4, at kurvens FORM er ens i alle fire divisioner.
- `checkAgeCurve` + tællende wrapper om `agePlayer`/`ageWarnings` — D2.
- `checkOfferMarket` — C1, markedets retning målt paret: samme mand, kun nøden forskellig.
- `checkDeadlineChoices` — C2, at de tre udgange er tre forskellige ting, og at aftenen ikke kan springes over.
- `checkContractTalks` — C3, ni forhold hver for sig, og at åbningen ikke indeholder et tal.
- `checkFreeAgentTalks` — C4, at han bliver stående og at retningen kan bruges.
- `checkRescueFloor` — QA's N3, hele skalaen af små ejerandele tvunget frem.

Plus A2's grænse i `checkMarkup`, som ser **hver** renderet skærm i hele gennemspilningen.

---

## 10. Hvad jeg ville gøre næste gang, i rækkefølge

1. **Spil det på telefonen.** Især C1's tilbudsside og C2's deadline-side. Det er det eneste sted natten kan være gået grundigt galt uden at nogen vagt siger noget.
2. **Afgør punkt 14 og 15 sammen.** De er samme spørgsmål set fra to sider: skal toppen af pyramiden tjene penge, og skal det koste mere at drive en klub deroppe? Min anbefaling står i punkt 15.
3. **Punkt 13** er ét tegn og tager et minut.
4. **Trup ved sæsonslut ligger på 13,93.** Over målet, men tættere på gulvet end i nat 6. D2 trækker den vej. Værd at holde øje med, ikke at haste efter.
5. **En vagt for prosa der lover adfærd.** QA's punkt 7.2, og natten har gjort problemet større end det var.

---

## 11. Formelt

- **Branch:** `nightly/oejeblikke`. **Master er urørt** — ingen commits, ingen push, ingen flet. Du kan spille master på telefonen uden at noget skifter under hånden.
- **20 commits**, hver med sit A1/B2/C3-mærke og en begrundelse for HVORFOR. Ingen rød kode committet.
- **Filer:** `football-tycoon-club-owner-prototype.html`, `test-harness.js`, `DECISIONS-NEEDED.md` (punkt 13-15), denne rapport.
- **Verifikation kørt:** `node --check proto-extract.js` og `node test-harness.js --seeds=10 --seasons=5 --stats` efter hver ændring. `--seeds=200 --seasons=20 --bot=both` → **`REGRESSION_OK`, 0 af 400**.
- **Gemmefiler:** hver formændring har sin migrering i SAMME commit som ændringen. Fem formændringer i nat, alle dækket af `checkOldSaveLoads()`.
- Standset kl. 16:10 UTC, altså i god tid før 03:00. Alt der var påbegyndt, blev færdigt.
