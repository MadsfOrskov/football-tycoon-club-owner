# QA — NAT 7: ØJEBLIKKENE OG ØKONOMIEN

*Testagent, 11/8 2026. Fjerde gennemgang.*

**Testet SHA: `5da9e7b75970dee5dc07a871d11a2090f8661740`** (`nightly/oejeblikke`, commit *"NIGHT-REPORT-7: alle tolv aendringer, maalte tal, og hvad jeg ikke kunne efterproeve"*).
`NIGHT-REPORT-7.md` **findes** — udviklingsagenten blev færdig. Hvert fund nedenfor er mærket med den SHA.

---

## 0. LÆS DETTE FØRST — `master` ER FLYTTET, og det ændrer forudsætningen

Min ordre sagde: *"Bemærk at `master` bevidst IKKE er flyttet — Mads spillede den gamle version i går."*

**Det passer ikke længere.** `git fetch` gav mig:

```
+ dacb6bd...8eabab5 master -> origin/master  (forced update)
```

`master` står nu på **`8eabab5`** med **13 commits** oven på `46a6da0`, og `nightly/oejeblikke` er **ikke** en forgænger til master. De to linjer er splittet ved `46a6da0` og har begge bygget videre:

| | `nightly/oejeblikke` (natten) | `master` (nu) |
|---|---|---|
| A1, A2, D1, B1 | bygget | **bygget uafhængigt** |
| B2, D3 | faciliteter i **3 niveauer**, huset hedder **`toilets`** | faciliteter i **10 niveauer**, huset hedder **`loos`** |
| Tribuner | 2 niveauer (`cap:[0,1000,2000]`) | **10 niveauer** (`cap:[0,1000,…,25000]`), `STANDCOST` afskaffet |
| B3, B4, C1-C4, D2 | bygget | findes ikke |
| Pengetrappen / STADION-10 | findes ikke | bygget |

**Det er ikke en detalje, det er et sammenstød.** Seks af nattens tolv ændringer er bygget to gange, med forskellige datastrukturer og forskellige nøglenavne. Én af dem kan flettes; begge kan ikke.

**Og det har en målt konsekvens allerede nu.** En gemmefil skrevet af **masters** kode og indlæst af **branchens** kode giver:

```
seed 1000  · skaerm club:  … Din formue £NaN …
seed 1000  · skaerm club:  … Forventet fremmøde: ~NaN af NaN · NaN betaler ved …
seed 32676 · skaerm empire: … Klubværdi · din andel £NaN …
seed 32676 · skaerm club:  … Lån · banken låner op til £NaN til NaN% …
```

**2 af 5 seeds**, og `Din formue £NaN` står i **B1's nye toplinje på alle otte skærme** — netop det tal Mads bad om at få gjort synligt hele tiden. Mekanismen er sporet: masters `G.stands.shed` kan stå på 5, branchens `STANDS.shed.cap` har kun tre pladser, `cap[5]` er `undefined`, `G.capacity` bliver `NaN`, og `NaN` breder sig gennem `clubValuation()` til `netWorth()`.

**Det betyder ikke at branchen er forkert.** Branchen er aldrig blevet bedt om at kunne læse masters gemmefiler. Men **Mads spiller master**, og hvis han får branchens build i hånden, er hans karriere £NaN på hver skærm. Rækkefølgen for en fletning skal besluttes, før nogen af delene røres.

*Fund M1 · SHA 5da9e7b · seeds 1000, 32676 · `node qa-probes.js migrate --seeds=5 --oldseasons=5 --oldfile=<master-8eabab5.html>`*

---

## 1. Gaten står

`node test-harness.js --seeds=200 --seasons=20 --bot=both` er kørt på branchens spids, uafhængigt af natrapporten:

```
401 karrierer gennemført · 0 fejlede
REGRESSION_OK
```

**Natrapportens hovedpåstand reproducerer.** Jeg fandt ingen karriere der væltede, i nogen af de to botprofiler.

Det er værd at sige klart: nattens tolv ændringer er gennemført uden at ødelægge noget der var grønt i forvejen. **Fundene nedenfor er ting gaten ikke kigger efter** — og det er, som de tre foregående gange, hele pointen.

---

## 2. FUND N1 (HØJ) — C1 har genskabt pakke 0's blindgyde

**Det er det vigtigste i rapporten.**

### Tilstanden

Et bud (`sellOffer`) står ubesvaret i indbakken. Spilleren forlader truppen ad en **anden vej**: solgt på deadline day, sluppet i en administration, gået på pension ved sæsonskiftet, eller solgt gennem en anden besked. Ingen af de veje rører budbeskeden.

### Hvorfor den ikke kan lukkes

C1 gjorde indbakkens tre knapper til **én**:

```js
case "sellOffer": return `<button … onclick="openOffer(${id})">Se tilbud · ${kfmt(a.bid)}</button>`;
```

`openOffer()` afviser kun beskeder der allerede er `done` — og den her er ikke `done`. Så siden åbnes, og `viewOffer()` rammer sin anden vagt:

```js
const a=m.action, p=byId(a.pid);
if(!p) return `<div class="card"><div class="newsline">Han er ikke i truppen længere.</div>
  <button class="abtn ghost" onclick="closeOffer()">‹ Tilbage til indbakken</button></div>`;
```

**Ét kort, én knap, og den knap går tilbage til indbakken.** Der er ingen `offerDecide('accept')`, ingen `offerDecide('reject')`. `handleAction()`s egen redning — `if(!p){m.done=true;render();return;}` — er skrevet rigtigt og kan **ikke nås**, fordi ingen knap kalder den længere.

Og beskeden er beskyttet mod alt andet:

* `sweepInbox()` beholder den, fordi `msgAwaitsAnswer(m)` er sand.
* `expireMessages()` rører den ikke — kun `bidAccepted`/`bidCounter`/`bidWar` får en `expires`, ikke `sellOffer`.
* Loftet på 18 vælger den ældste der **ikke** venter på svar, så den kan heller ikke skubbes ud bagfra.

**D1's tre nye værn holder beskeden i live, netop fordi den ser ud som en beslutning der ikke må gå tabt.**

### Målt, tvunget scenarie (`node qa-probes.js stuckoffer --seeds=12 --oldfile=<46a6da0>`)

```
── branchen (nightly/oejeblikke)
   indbakkens knapper til beskeden : openOffer(3) · delMsg(3)
   tilbudssidens beslutningsknapper: INGEN
   overlevede 30 kampdagsskift     : 30 af 30
   kunne besvares ved at trykke    : NEJ — ingen knap afgoer den
   stadig ubesvaret bagefter       : 12 af 12  ✗ BLINDGYDE
   spillet 120 kampdage videre     : forsvandt aldrig · 12 stod stadig ubesvaret

── gammel kode (46a6da0 — den Mads spillede)
   indbakkens knapper til beskeden : actMsg(3,'accept') · actMsg(3,'demand') · actMsg(3,'reject') · delMsg(3)
   kunne besvares ved at trykke    : JA — actMsg(3,'accept')
   stadig ubesvaret bagefter       : 0 af 12  ✅
```

**120 kampdage — knap fem sæsoner — og alle tolv står der stadig. Det er permanent.**

**C1 indførte den.** På `46a6da0` lå de tre `actMsg`-knapper i indbakkerækken, og et hvilket som helst tryk kaldte `handleAction`, som satte `m.done=true`. Den vej er lukket nu.

### Hvor tit i rigtigt spil

`node qa-probes.js pages --seeds=60 --seasons=20`:

```
karrierer ramt          : 9 af 60 (15,0 %)
aabne bud granskede     : 3163 renderinger af tilbudssiden
   ...uden 'tag imod'   : 512 af 3163 (16 %)
```

**15 % af karriererne.** Tidligste træffer: **seed 40595, sæson 1, kampdag 6.**

### Den eneste udvej er den, D1 blev bygget for at forhindre

`delMsg()` (✕) fjerner beskeden. Men **at slette en beslutning er ikke at besvare den** — og D1's hele begrundelse var, at en ubesvaret beslutning aldrig må forsvinde. Spilleren står altså med et valg mellem en knap der ikke virker og en knap der sletter beviset.

### Hvad der skal til

`viewOffer()`s to nødkort mangler den knap `handleAction` allerede kan betjene. Én linje i hvert kort — noget i retning af `<button onclick="offerDecide('reject')">Luk sagen</button>` — og blindgyden er væk. **Vagten skal måle det renderede kort, ikke funktionen:** `handleAction`s `!p`-gren er rigtig og har været rigtig hele tiden. Det var ikke logikken der manglede, det var vejen derhen.

*Fund N1 · SHA 5da9e7b · seeds 1000, 8919, 16838, 32676, 40595 (+15 flere) · sabotage-efterprøvet: prøven er grøn på 46a6da0 og rød på branchen med identisk scenarie.*

---

## 3. FUND N2 (HØJ) — B4 er stærkere end natrapporten siger, og B4 er ikke ene skyldig

Det her var ordren: *"Er Premier gået fra dyrest til pengemaskine, er kuren værre end sygdommen."*

### Metoden

Ikke en sammenligning med gamle tal fra et andet værktøj. **Samme seeds, samme kode, kun ÉN konstant forskellig:** `BAL.ticket.scale` rullet tilbage, så alle fire divisioner får League Threes kolonne (`sweet 10 · min 5 · max 20 · moodAbove 16 · bigMax 8`). Alt andet i pakken bliver stående. Substitutionen dør hellere end at rapportere den samme kode to gange.

**200 seeds × 20 sæsoner, hver kørt to gange** (`node qa-probes.js b4 --seeds=200 --seasons=20`, 1259 s):

| division | kampdage | **uden B4** | **med B4** | ændring | spænd/løn | tilskuere |
|---|---|---|---|---|---|---|
| Premier | 3120 / 2808 | +£18.085 | **+£63.737** | **+£45.652** | 1,07 → **2,58** | 4452 → 4238 |
| League One | 20462 / 20540 | +£11.059 | +£26.197 | +£15.138 | 1,25 → 2,19 | 2714 → 2803 |
| League Two | 43992 / 44512 | +£6.139 | +£10.616 | +£4.476 | 1,57 → 2,10 | 2103 → 2102 |
| League Three | 35850 / 36026 | −£331 | −£243 | +£89 | 1,28 → 1,28 | 975 → 1007 |

### Tre ting at læse ud af den tabel

**1. B4 alene giver Premier +£45.652 pr. kampdag.** Natrapportens egen tabel siger, at hele B4 flyttede Premier fra −£8.566 til +£6.907 — et udsving på ~£15.500 efter dæmpningen. **Mit A/B viser tre gange så meget.** (Kildekommentaren i `BAL.ticket.scale` siger i øvrigt `+£3.634`, mens rapportens tabel siger `+£6.907` for samme konfiguration. De to tal i natrapporten er ikke enige med hinanden.)

**2. League Three er urørt.** −£331 → −£243. Påstanden om at *"League Three-kolonnen er bit for bit de gamle tal"* **holder**, og det er godt bygget.

**3. Og det vigtigste: B4 er ikke ene skyldig.** Uden B4 — altså med hele resten af pakken og den gamle prisskala — tjener Premier stadig **+£18.085 pr. kampdag**. Til sammenligning målte jeg **−£5.903** med det samme værktøj før pakken. **Resten af pakken (B2's niveauer, B3's sponsorer med bonusser, D3) har allerede vendt toppen fra underskud til overskud, før prisskalaen overhovedet rører den.**

**Konsekvensen for punkt 15 i `DECISIONS-NEEDED.md`: at rulle B4 tilbage bringer IKKE toppen tilbage til at være dyrest.** Det bringer den fra +£63.737 til +£18.085. Skruen i punkt 14 (drift der skalerer med divisionen) er den, der rammer det, punkt 15 forsøger at ramme. **De to punkter skal afgøres sammen, og punkt 14 er den store.**

### Formen på kurven — hvor jeg er uenig med natrapporten, og hvor jeg ikke er

Natrapporten forsvarer B4 med at *"kurvens FORM er den samme i alle fire divisioner … det er derfor det er én skala og ikke to multiplikatorer på samme tal."*

**Om efterspørgselskurven har jeg intet at indvende.** `ticketPriceFactor()` regner `r=(price−sweet)/sweet` og ganger med `elasticity*sweetSpot` — den er relativ, og `checkTicketScale` måler præcis det. Det er rigtigt bygget.

**Men det, spilleren mærker, er ikke kurvens form — det er ugens resultat.** Spænd÷løn (interkvartilbredden på netto pr. kampdag, delt med lønsummen):

```
uden B4:  1,07  1,25  1,57  1,28    top:bund 0,83
med B4:   2,58  2,19  2,10  1,28    top:bund 2,01
```

Uden B4 svinger alle fire divisioner lige meget i forhold til lønsummen (0,83 — bunden svinger en anelse mest). **Med B4 svinger toppen dobbelt så meget som bunden.** Til sammenligning lå hele skalaen på **0,84-1,32** før pakken.

**Begge udsagn er sande på én gang:** efterspørgselskurven har samme form, og den økonomiske oplevelse har det ikke. Det er ikke en fejl i koden — det er, hvad der sker, når man ganger et større tal med den samme kurve. Men natrapportens sætning kan læses som om spillet føles ens deroppe, og det gør det ikke.

### Og en detalje der peger den rigtige vej

**Tilskuertallet i Premier FALDER med B4** (4452 → 4238), mens nettoen tredobles. Prisen gør altså præcis det, den skal — den tømmer tribunen en smule og tjener alligevel mere. `townDemand()` som loft virker efter hensigten. **Problemet er ikke mekanikken, det er niveauet.**

*Fund N2 · SHA 5da9e7b · 200 seeds fra 1000, trin 7919 · A/B-substitutionen efterprøvet: den fejler hårdt hvis `BAL.ticket.scale` ikke findes, og afviser at rapportere hvis substitutionen ikke ændrede noget.*

---

## 4. FUND N3 (HØJ) — stemningens vej tilbage kan stadig fjernes med grøn harness

**Mit fund fra 10/8 er ikke rettet.** Natrapporten skriver, at `easeMood()` er trukket ud i egen funktion, *"saa harness'en kan KALDE spillets easing frem for at regne sin egen kopi"*. Det er rigtigt gjort — men det løser ikke problemet, fordi **vagten kalder funktionen selv**:

```js
H.call("easeMood");
H.call("updateProtest");
```

Vagten måler altså, at `easeMood()` **virker**. Den måler ikke, at **spillet bruger den**.

### Saboteret kaldestedet, ikke funktionen

```js
/*SABOTAGE-N2*/ // easeMood(); // the way back: anger cools toward a baseline
```

`node test-harness.js --seeds=10 --seasons=5` → **`REGRESSION_OK`.** Alle ti karrierer grønne.

### Hvad den ene linje er værd

Samme sonde, samme seeds, kun kaldestedet forskelligt (`node qa-probes.js mood --seeds=12 --seasons=12`):

| | med `easeMood()` | **uden kaldet** |
|---|---|---|
| gennemsnitlig stemning | 68,6 | **47,9** |
| kampdage i ro | 87,6 % | 55,0 % |
| kampdage i **boykot** | 0,6 % | **25,1 %** |
| karrierer der når boykot | 8,3 % | **66,7 %** |
| karrierer der **slutter** i protest | 16,7 % | 50,0 % |

**Én linje er værd 20 stemningspoint og fyrretyve gange så mange boykot-kampdage — og gaten kan ikke se, om den er der.**

De to kolonner er samme seeds og samme størrelse (12 × 12), så de er direkte sammenlignelige. I skala bekræftes den grønne side: **60 seeds × 20 sæsoner, 31.196 kampdage** → stemning **65,8** · boykot **0,4 %** af kampdagene · **21,7 %** af karriererne når boykot · **8,3 %** slutter i protest. Vejen tilbage findes altså og virker — den er bare ikke bevogtet.

Sonden `mood` måler kun spillets egen gennemspilning og kalder aldrig `easeMood()` selv. **Den er rød under sabotagen og grøn uden.** Det er den vagt, harness'en mangler.

*Fund N3 · SHA 5da9e7b · seeds 1000-88109 · sabotage kørt og gendannet (`git checkout --`).*

---

## 5. B2's formændring holder — gemmefiler fra i går kan indlæses

Det var ordre nummer to, og svaret er **ja**.

**40 rigtige gemmefiler**, skrevet af koden fra `46a6da0` (den Mads spillede) efter 8 spillede sæsoner hver, plantet i en frisk sandkasse med branchens kode og indlæst:

```
gemmefiler skrevet af gammel kode : 40 af 40
...med mindst én facilitet bygget : 28
...med "det basale" betalt        : 9
det basale baaret over paa 3 huse : 9  ✅
loadGame lykkedes i ny kode       : 40  ✅
fondens penge foldet KORREKT ind  : 40  ✅
spillede 2 saesoner videre        : 40  ✅
ingen bemaerkninger.
```

Tjekket dækker: hvert `G.fac[k]` er et **helt tal** i et gyldigt interval; det gamle samlede `G.fac.basics` er væk; `parking`/`toilets`/`lights` findes alle tre; `facOff` peger ikke på noget ubygget; `facBuild.remain` er et tal ≥ 0; `G.dl`, `G.offerId`, `G.sponsors`, `G.loans` er definerede; og **C3's `p.since` findes på hver eneste spiller** (natrapportens egen rettelse — den holder).

### Sabotage-efterprøvet

Migreringen slået fra (`if(false&&G.fac&&…("basics" in G.fac))`):

```
det basale baaret over paa 3 huse : 0  · TABT: 3 ✗
   · seed 1000: det basale stod paa niveau 1 i den gamle fil, men blev til [0,0,0]
loadGame lykkedes i ny kode       : 8  ✅
spillede 2 saesoner videre        : 8  ✅
```

**Bemærk at `loadGame` stadig lykkes, og at karrieren stadig kan spilles.** Tabet er **tavst** — de £15.000 for det basale forsvinder, efterspørgsel, humør og omsætning pr. hoved falder, og intet siger noget. Uden det her ene tjek ville prøven have været grøn.

*Efterprøvet · SHA 5da9e7b · 40 seeds fra 1000, trin 7919 · sabotage kørt og gendannet.*

### Nedlukningen: ingen facilitet endte hverken åben eller lukket

Tilstandsmaskinen kontrolleres nu på **hver kampdag i hver karriere** (`checkFacState()` i `traceCareer`), ikke ved at læse koden:

* `facOff[k]` sat på noget med niveau 0 → *"hverken åben eller lukket"*
* byggeri på en facilitet der ikke findes
* `facBuild.remain` ikke et tal
* **genåbning af noget der ikke er lukket** (byggepladsen bruges på ingenting)
* et byggeri der står i over 40 kampdage, eller hvor `remain` ikke tæller ned

```
--- B2: kan en facilitet ende hverken aaben eller lukket? ---
ingen ugyldig facilitetstilstand paa nogen kampdag i nogen karriere ✅
--- B2: bliver genaabningen faerdig? ---
intet byggeri og ingen genaabning stod aabent i over 40 kampdage ✅
```

Ved gennemlæsning står de fire indgange rigtigt: `closeFac()` afviser hvis niveauet er 0 eller den allerede er lukket; `reopenFac()` afviser hvis den ikke er lukket, og hvis byggepladsen er optaget; `closeFac()` rydder et igangværende **byggeri** på samme nøgle, men kan ikke ramme en igangværende **genåbning**, fordi `facClosed()` stadig er sand og funktionen returnerer først. Og facilitetskortet har **præcis én knap i hver af de fire tilstande** — bygger, lukket, maks, delvist bygget. Ingen tilstand uden knap.

---

## 6. De to nye sider — hver knap nås, hver knap gør noget

`node qa-probes.js pages --seeds=60 --seasons=20`. Den nysgerrige klikker parser den **renderede** markup, finder hvert `onclick`, trykker ét, og måler om spillets tilstand flyttede sig.

```
naaede tilbudssiden (C1)  : 60 af 60 (100 %) ·  3.163 renderinger
naaede deadline day (C2)  : 60 af 60 (100 %) · 17.783 renderinger
aabne poster granskede    : 24.849 paa deadline day · 3.163 bud
```

**Alle atten handlingsknapper på de to sider blev nået og flyttede spillet:**

| side · knap | set | trykket | flyttede spillet |
|---|---|---|---|
| deadline · `dlClose()` | 17.783 | 1.965 | 100 % |
| deadline · `dlHeistSign(…)` | 17.484 | 1.747 | 100 % |
| deadline · `dlAdvance()` | 17.050 | 1.821 | 100 % |
| deadline · `dlPanicAccept(…)` | 6.690 | 648 | 100 % |
| deadline · `dlPanicReject(…)` | 6.690 | 587 | 100 % |
| deadline · `dlPanicPush(…)` | 5.937 | 508 | 52 % |
| deadline · `dlPoachHold(…)` | 675 | 58 | 100 % |
| deadline · `dlPoachLet(…)` | 675 | 64 | 100 % |
| deadline · `dlPoachSnub(…)` | 675 | 50 | 100 % |
| offer · `offerDecide('accept')` | 2.651 | 241 | 100 % |
| offer · `offerDecide('reject')` | 2.651 | 275 | 100 % |
| offer · `offerDecide('demand')` | 2.146 | 211 | 47 % |
| offer · `offerCallRound(…)` | 2.601 | 245 | 100 % |
| offer · `closeOffer()` | 3.163 | 312 | 100 % |

**De to under 100 % er ikke fejl, og de er heller ikke helt målt.** `dlPanicPush` og `offerDecide('demand')` er gambles der kun **nogle gange** flytter et tal — og mit fingeraftryk af spillets tilstand indeholder ikke `a.bid` eller `m.done`, så jeg **undermåler** dem. De to procenter er gulve, ikke facit. Det er en begrænsning i min sonde, ikke et fund.

**Ingen rendering af nogen af de to sider manglede en vej ud.** Og C2's gate virker, men på en måde man skal kende: `playMatchday()` ser `G.dl`, sætter `screen="deadline"` og **returnerer uden at spille**. Man *kan* trykke `go('club')` og forlade siden — man kommer bare tilbage, næste gang man prøver at spille. Det er, som det skal være.

**Det kostede mig noget at opdage:** min egen probe-driver kendte kun `modal` og sad fast for evigt på kampdag 5 i hver eneste karriere. `qa-probes.js` driver nu helsider som modaler (`drivePageScreen()`). **Enhver anden test der kun kender `modal`, vil have samme blinde plet.**

---

## 7. Er de nye mekanikker levende, eller er de pynt?

`node qa-probes.js usage --seeds=120 --seasons=20`. Målt på **karrierer**, ikke på kald — alt under 1 % er dødt.

**Ikke én af nattens tolv mekanikker ligger under 1 %.** Ingen af dem er død.

| mekanik | karrierer | andel | pr. karriere |
|---|---|---|---|
| `freeAgentDirection` (C4 — retningen) | 79 | 65,8 % | 1,26 |
| `offerCallRound` (**C1's udgående kontakt**) | 81 | 67,5 % | 1,18 |
| `dlPoachHold` (C2 — "hold på ham") | 83 | 69,2 % | 1,32 |
| `dlPoachLet` (C2 — "lad ham gå") | 88 | 73,3 % | 1,57 |
| `reopenFac` (B2's genåbning) | 118 | 98,3 % | 9,43 |
| `openOffer` (**C1's tilbudsside**) | 119 | 99,2 % | 12,25 |
| `closeFac` (**B2's nødbremse**) | 119 | 99,2 % | 8,42 |
| `evt:sponsorBonusPaid` (**B3's bonus**) | 119 | 99,2 % | 6,86 |
| `evt:sponsorBonusMissed` | 120 | 100 % | 13,47 |
| `dlPoachSnub` (C2 — "sig ingenting") | 120 | 100 % | 26,08 |
| `openDeadline` / `dlClose` (**C2**) | 120 | 100 % | 40,0 |

**C1 og C2 — de to Mads udtrykkeligt bad om at få gjort *gode* — nås i praksis i hver eneste karriere.** Tilbudssiden åbnes 12 gange pr. karriere, deadline day 40 gange (præcis to vinduer × 20 sæsoner: siden kan ikke springes over, og den bliver det ikke). Det er ikke pynt.

**Sponsorbonussen:** 823 udløst mod 1.617 forgæves = **33,7 % ramt**. Natrapporten målte 43 % med sit eget værktøj og sin egen bot. Forskellen er botpolitik — begge tal siger, at det er en ægte gamble og ikke en gratis udbetaling.

**De to laveste er C1's "ring rundt" (67,5 %) og C4's retning (65,8 %).** Begge langt over gulvet, men begge sjældne nok til, at Mads kan nå at spille en hel sæson uden at møde dem. Det er ikke nødvendigvis forkert — frie agenter findes kun i vinduet, og "ring rundt" kræver at man har et bud at arbejde med — men det er tallene at kende, hvis de skal føles som mekanik og ikke som anekdote.

**De eneste tal under 10 % er gamle mekanikker, ikke nattens:** `budgetConfirm` 1,7 %, `bidWar` 5,8 %, `administration` 5,8 %, `openBankUltimatum` 6,7 %. Administrationer på 0,15 pr. karriere er **lavere** end natrapportens 0,50 — min bot går sjældnere ned med flaget, og det er samme adfærdsændring der skjuler N4 (afsnit 8).

**Et forbehold, og det er vigtigt:** botten er min, ikke en spiller. At `offerCallRound` sker 1,18 gange pr. karriere siger, at knappen **kan** nås og **virker** — ikke at et menneske vil bruge den lige så tit. Alle tal i dette afsnit er udsagn om rækkevidde, ikke om lyst.

**Et forbehold, og det er vigtigt:** botten er min, ikke en spiller. At `offerCallRound` sker én gang pr. karriere siger, at knappen **kan** nås og **virker** — ikke at et menneske vil bruge den lige så tit. Alle tal i dette afsnit er udsagn om rækkevidde, ikke om lyst.

---

## 8. Mine egne åbne fund fra 10/8 — status

| | fund | status |
|---|---|---|
| **N2** | stemningens vej tilbage kan fjernes med grøn harness | **IKKE RETTET** — se afsnit 4. Sabotage kørt, `REGRESSION_OK` |
| **N3** | `controlAt` flyttet 50 → 0, så *"trin 5 inden for rækkevidde"* ikke måler det, den siger | **IKKE RETTET** |
| **N4** | lånetælleren ser kun den frivillige gren | **IKKE RETTET** (strukturelt) |
| **N5** | to sponsorer lover et fjernet stunt | **IKKE RETTET** — natrapporten skriver selv, at den lod dem ligge |
| **N7** | arvebrevet og de tre første beskeder er engelske | **IKKE RETTET** |

### N3 — `controlAt` er stadig 0, og punkt 10 er stadig forældet

`BAL.ladder.controlAt` er `0`. Harness'ens statistik regner stadig *"trin 5 INDEN FOR RÆKKEVIDDE"* som `rescueSeen > 0` — altså **at en redning blev tilbudt**. Med `controlAt=0` er en tilbudt redning meget langt fra enden: man kan tage imod gentagne gange, ende på 1 % og spille videre. Tallet overdriver.

`DECISIONS-NEEDED.md` punkt 10 hedder stadig *"Trin 4 er fatalt fra start, fordi du kun ejer 51 %"* og regner `51 − 5 = 46, altså under 50`. **Hele præmissen er væk** — der er ingen 50 %-grænse længere. Punktet bør enten skrives om eller markeres som afgjort.

### N4 — lånetælleren, med et forbehold jeg skylder

`stats.loansTaken` inkrementeres stadig **kun** inde i bottens frivillige bankmodal-gren; kriselån gennem `resolveBank` tælles ikke. **Hullet er uændret.**

**Men min måling denne gang siger 0 % undertælling** — fordi min klikker slet ikke tog kriselån i denne kørsel (0 af 8 lån). Sidste gang målte jeg 64 % og 100 %. **Forskellen er bottens adfærd, ikke koden.** Botten bruger nu B2's nødbremse og går sjældnere ned med flaget. Jeg rapporterer altså: *kodehullet består, incidensen er faldet, og jeg kan ikke sige om det holder for et menneske.*

### N5 — de to sponsorer

Stunt-mekanikken udgik i R1c (`delete G.stuntDone`, `sponsorDef` beholdt som *"choke point"*). Men `SPONSORS`-arrayet lover det stadig:

* **Duncroft Mattress Co.** — *"Will pay extra for spectacle."*
* **Glint Energy Drinks** — *"Wants the youth teams in their colours and clips for their feed. Attention is the whole deal."*

Ingen af delene kan ske. Det er prosa der lover en adfærd — **præcis den klasse, ingen vagt fanger** (natrapportens eget punkt 6.7).

### N7 — sproget

`node qa-probes.js danish`: **30 % af de sprogbærende linjer er engelske** (66 af 223 distinkte). Arvebrevet og de tre første beskeder står uændret:

```
[SKAERM:inbox] Solicitor Whitmore — The keys, the debts, and one slightly haunted trophy cabinet are now yours…
[SKAERM:club]  Welcome to Ashford Rovers
[SKAERM:club]  The gaffer's first words
[SKAERM:home]  The League Three season kicks off. Twenty-six matchdays. One dream. Several dodgy pitches.
```

**Onboardingen er derimod helt dansk** — R5/R6 gjorde det, de lovede, der. Det er de første fire ting man ser **efter** onboardingen, der stadig er engelske. Nattens nye tekst (C1's forklaringer, C2's tre konsekvenser, C3's åbninger) er derimod dansk.

---

## 9. Det ærlige forbehold — hvad jeg IKKE kan sige noget om

**Jeg kan ikke se en telefon.** Ikke én pixel. Jeg har bevist, at markuppen er velformet, at hver knap kan nås og gør noget, at ingen side mangler en vej ud, og at intet siger `NaN` i normalt spil. **Jeg kan ikke sige, om noget af det er godt.**

Konkret, hvad Mads selv skal se efter — i den rækkefølge jeg ville gøre det:

1. **C1's tilbudsside i portrait.** Fem kort under hinanden: manden med fem statistik-chips, den bydende klub, *de andre interesserede* (op til seks navngivne klubber), *hvad der er sket* (op til seks logrækker), og forhandlingen med fire knapper. **Hvor langt er der ned til "Tag imod"?** Hvis beslutningsknapperne ligger under to skærmfulde information, er siden bygget forkert, uanset hvad mine tal siger.

2. **C2's deadline day med otte poster åbne.** Feeden vises **omvendt** (nyeste øverst) — er det rigtigt, når "bordet fyldes op mens uret går"? Og *"Sig ingenting — og lev med det"* er en `ghost`-knap under to almindelige. **Ser det tredje valg ud som et valg, eller som noget man overser?**

3. **B1's bånd med formue og kontanter.** Det ligger under headeren på alle otte skærme, og i klublaget ligger `ownerBar()` OVENOVER igen. **Tre linjer krom før indholdet.** Stjæler det pladsen fra det, man kom for?

4. **A2's decimaltegn** (natrapportens punkt 13). `£1,02M` ved siden af `£276,028`. Det er ét tegn, og det tager et minut — men man skal se det på en skærm for at afgøre det.

5. **C3's kontraktdialog.** Jeg kan bevise, at en velbehandlet spiller kræver 27 % mindre, og at syv situationer giver syv åbninger. **Om det føles som en forhandling eller som en regnemaskine, er din dom, ikke min.**

**Og tre ting jeg ikke har målt:**

* **Balancen ud over 20 sæsoner.** Alt her er højst 20. Med Premier på +£63.737 pr. kampdag ved jeg ikke, hvad en 40-sæsoners karriere ser ud som.
* **Om masters linje er bedre end branchens.** Jeg har kun testet branchen. Masters 10-niveau-faciliteter og STADION-10 er urørt land for mig.
* **Prosa der lover en adfærd.** Nattens nye tekst er den største tilvækst nogensinde, og ingen vagt læser den. N5's to sponsorer er beviset på, at klassen findes; jeg kan ikke sige, hvor mange flere der er.

---

## 10. Hvad jeg ville gøre, i rækkefølge

1. **Afgør master mod branch, før noget andet røres.** Seks ændringer er bygget to gange med forskellige datastrukturer. Det bliver ikke nemmere i morgen. *(Afsnit 0)*
2. **Luk N1.** To knapper i `viewOffer()`s nødkort. 15 % af karriererne, og den er permanent. *(Afsnit 2)*
3. **Afgør punkt 14 og 15 sammen — og punkt 14 er den store.** At rulle B4 tilbage flytter Premier fra +£63.737 til +£18.085, ikke til underskud. *(Afsnit 3)*
4. **Sæt en vagt på `easeMood()`s kaldested.** Én linje er værd 20 stemningspoint, og gaten kan ikke se den. *(Afsnit 4)*
5. **Spil det på telefonen.** Alt i afsnit 9 venter på det.
6. **Ryd N3's punkt 10 og N5's to sponsorer.** Begge er tekst der siger noget usandt om spillet.

---

## 11. Formelt

* **Testet SHA:** `5da9e7b75970dee5dc07a871d11a2090f8661740` (`nightly/oejeblikke`). `NIGHT-REPORT-7.md` fandtes.
* **Sammenligningsgrundlag:** `46a6da0` (den udgave Mads spillede) og `origin/master` = `8eabab5` (som **har** flyttet sig).
* **Kørt:** `test-harness.js --seeds=200 --seasons=20 --bot=both` · `qa-probes.js b4 --seeds=200 --seasons=20` (2×200 karrierer, 1259 s) · `pages --seeds=60 --seasons=20` · `usage --seeds=120 --seasons=20` · `migrate --seeds=40 --oldseasons=8` · `mood --seeds=60 --seasons=20` · `stuckoffer` · `danish` · `loans` · `divecon`
* **Nye sonder i `qa-probes.js`:** `b4` (A/B på én konstant), `pages` (blindgyde-audit på helsider), `stuckoffer` (tvunget scenarie, kørt mod to udgaver af koden), `mood` (N2 målt uden at kalde `easeMood()` selv), plus `drivePageScreen()` og B2's tilstandsinvarianter i `traceCareer`.
* **Sabotager kørt og gendannet:** B2's `basics`-migrering slået fra (prøven blev rød) · `easeMood()`s kaldested fjernet (harness'en blev grøn) · `BAL.ticket.scale` fladet ud (A/B-grundlaget). **Hver gang `git checkout -- football-tycoon-club-owner-prototype.html` bagefter.**
* **Committet:** kun `QA-REPORT.md` og `qa-probes.js`, kun på `nightly/qa`. Ingen ændring i prototypen eller `test-harness.js` i diffen.
