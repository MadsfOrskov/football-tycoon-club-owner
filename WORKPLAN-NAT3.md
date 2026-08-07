# ARBEJDSKØ — NAT 3: strukturen. Spillet skal kunne gå begge veje

*Skrevet 7/8 2026 efter gennemgang af nat 2's arbejde og QA-rapporten. Selvstændig: en frisk session skal kunne udføre den herfra uden yderligere kontekst.*

Læs `Claude.md` først. Læs derefter `QA-REPORT.md` på `nightly/qa` — den er testagentens uafhængige måling af nat 2 og indeholder de tal, denne plan bygger på. `NIGHT-REPORT-2.md` er udviklingsagentens egen; hvor de to er uenige, **har QA ret** (efterprøvet 7/8).

**Arbejdsform:** én pakke ad gangen, `node --check proto-extract.js` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn, én commit pr. pakke. Alle balancetal i `BAL`. Nye modaltyper i **både** `handleModal` og `HANDLED_MODALS`.

**Branch:** fortsæt på `nightly/trupdybde` oven på `02455dc`. Første handling: `git merge origin/master`.

## Ufravigelig ramme

> **Formanden udtager ALDRIG holdet.** Ingen opstilling, ingen taktik. Gafferen vælger elleveren; du skaffer truppen og betingelserne.

- **Rækkefølgen er ikke til forhandling.** Instrumentet repareres først (12), derefter alle mekanikændringer (13-17), og først til sidst balancemålingen (18). Ændrer man `homeBonus()` eller facilitetsindtægter efter at have tunet skaleringen, er tuningen målt mod et mål der flyttede sig.
- **Sabotér hver ny invariant, før du stoler på den.** Nat 2 havde to assertions der bestod mod bevidst ødelagt kode. QA fandt to mere. Gør sabotageforsøget til første skridt.
- **Ingen designbeslutninger.** Er `Claude.md` og GDD'en tavse, og betyder valget noget: skriv spørgsmålet i `DECISIONS-NEEDED.md`, vælg imens den mest GDD-konsistente mulighed, begrund i commit-beskeden. Tun aldrig et måltal væk i stilhed.
- **Hård stop kl. 04:00 dansk (02:00 UTC).** Skriv `NIGHT-REPORT-3.md` og push som allersidste handling — testagenten bruger den som færdigmarkør.
- **Du når ikke alle ti, og det er planlagt.** Pakke 16 og 18 er de største i projektets historie. Pakke 21 ligger sidst, netop fordi den kan undværes. Tre solide pakker slår ti halve.

---

# Pakke 12 — Reparér instrumentet, før du måler noget

**Denne først. I nat er den største måleopgave i projektets historie, og QA har bevist at værktøjet lyver på to bestemte måder.**

**a) Tvungne scenarier forurener statistikken.** `stats.final` snapshottes med vilje før de tvungne scenarier — men `stats.md` og `G.history` gør ikke. Nat 2's sidste commit tilføjede et scenarie, der afvikler én ekstra kampdag i en syntetisk sæson 6, og dermed blev pakke 5's måltal forkert: **rapporteret 3,4 og ✅, mens værktøjet selv skrev 2,9 og UDENFOR.** Samme fejl giver to forskellige tal for "oprykninger i alt" i én kørsel (19 og 29). Snapshot `stats.md` og `G.history` samme sted som `stats.final`, og verificér at de to oprykningstal bliver ens.

**b) Blindgyde-auditten er blind for indbakkeknapperne.** `ibtn()` fjerner `onclick` helt, når knappen er spærret:

```js
return blockedWhy
  ? `<button class="abtn ${cls}" disabled …>${label}</button>`      // intet onclick-maal
  : `<button class="abtn ${cls}" onclick="actMsg(${id},'${choice}')">${label}</button>`;
```

Pakke 8 nøgler på onclick-målet netop for at undgå etiket-støj — men uden mål falder nøglen tilbage på etiketten, og etiketten indeholder beløbet. Hver `Accept £56k` bliver sin egen "knap", der aldrig ses aktiv. Ved 200 seeds rapporterer auditten 13 falske "altid deaktiverede" knapper, og **den knapfamilie den nu er blind for, er præcis den pakke 0 handlede om.** Giv den spærrede variant et stabilt nøglefelt (fx `data-act="actMsg:choice"`), så begge varianter nøgles ens.

**Færdig når** de to oprykningstal er identiske i samme kørsel, og auditten rapporterer nul falske altid-deaktiverede knapper ved 200 seeds. Sabotér begge.

---

# Pakke 13 — Dublet-tickerlinjen

QA's F1. I `halfEvents()`:

```js
if(Math.random()<0.03)ev.push({m:mkMin(),
  txt:"GOAL — no, WAIT. Flag's up. The linesman is the least popular man in the county."});
```

Linjen pushes direkte ind i `ev[]` uden om `pickLine(pool, ctx, match.used)`, som er hele dublettvagten. `halfEvents()` kaldes to gange pr. kamp, hver med sin egen terning. Målt over 300.000 kampe: 1 dublet pr. 1.007 kampe = **~40 % af alle 20-sæsoners karrierer**, og regressionstesten er derfor tilfældigt rød i ~0,3 % af alle seeds.

Send den gennem `pickLine([...], at(m), match.used)`. **Gennemsøg samtidig for andre direkte `ev.push` med hardkodet `txt`** — hvidlisten i pakke 7 kunne ikke se dem.

**Færdig når** `node test-harness.js --seeds=200 --seasons=20` er grøn.

---

# Pakke 14 — Protest-trappen: formen og hviletilstanden

To rettelser i samme system, begge fra QA.

## a) Tavshedens knap har forkert form (F3)

```js
function homeBonus(){
  if(protestLevel()>=2) return BAL.protest.silentHome;   // flad erstatning
  return 0.13 + 0.27*(attendance()/G.capacity)*(G.fanMood/100) + G.stands.shed*BAL.stands.shedHome;
}
```

Den normale hjemmebanefordel har tre led: 0,13 fladt, op til 0,27 for publikum, op til 0,10 for Shed End. Ved protest ≥ 2 kasseres **hele udtrykket**. To følger: Shed End (£220.000 fuldt udbygget) er værdiløs på 31 % af kampdagene uden at teksten siger det — og `silentHome` er et **gulv**, ikke en straf, så ligger det over en klubs normale bonus, bliver tavshed en *fordel*. Derfor gør 0,20 harness'en rød i 7 af 20 kørsler.

Omform til en multiplikator på publikumsleddet:

```js
const quiet = protestLevel()>=2 ? BAL.protest.silentCrowd : 1;
return 0.13 + 0.27*(attendance()/G.capacity)*(G.fanMood/100)*quiet + G.stands.shed*BAL.stands.shedHome;
```

Så tager tavsheden **den tolvte mand** — præcis hvad GDD'en siger — og aldrig mere. Straffen bliver proportional: man kan kun miste et publikum, man havde. `silentHome` slettes. **QA's vippepunkt 0,16-0,17 er målt på den gamle knap og kan ikke overføres** — start `silentCrowd` på 0 og mål efter.

Invariant: `homeBonus()` ved protest ≥ 2 skal **altid** være ≤ samme klubs bonus ved protest 0. Sabotér den.

## b) Byens hviletilstand er protestbannere (F4)

```js
protest = { banners:38, silence:26, boycott:12, hysteresis:5, easing:0.08, baseline:37 }
```

At forlade trin 1 kræver `banners + hysteresis = 43`. `easing` trækker kun stemningen op mod `baseline = 37`. **37 < 43, så der findes ingen mængde tid der løfter en klub af bannerne — kun sejre.** Målt: 100 % af karriererne når trin 1. `BAL`-kommentaren siger selv, at easing skal være *"fast enough to be a way out"*; for trin 1 er den det ikke.

Hæv `baseline` over `banners + hysteresis`, eller sænk `banners`. Ét tal — men det er en direkte årsag til den monotone stemningsnedtur, som pakke 18 skal måle. **Skal rettes før skaleringen måles.**

---

# Pakke 15 — Main Stand får en rolle

Besluttet af Mads 7/8, begge virkninger:

**a) VIP-bokse kræver Main Stand ≥ 1.** I dag udbetaler VIP sit faste beløb uanset hvad, men `stadiumSvg()` tegner dem kun hvis `G.stands.main>=1` — koden og billedet er allerede uenige. Gør kravet ægte, så hovedtribunen låser den mest lukrative facilitet op.

**b) +4 bestyrelsestillid pr. niveau ved opførelse** (`BAL.owners.trustMainStand`). Bevidst lille: med `trustAdmin: −30` er det et symbolsk nik, ikke en genvej. Tillid skal fortsat primært fortjenes gennem opførsel.

Teksten opdateres til at sige begge dele — husk pakke 7's invariant, der fejler hvis en lovning ikke bygges af `BAL`.

---

# Pakke 16 — Nedrykning

**Den største enkeltændring i projektets historie, og den vigtigste.** QA målte, at klubben klatrer til øverste række omkring sæson 6-9 og derefter synker til plads 12,5 af 14 — uden konsekvens, fordi divisionen kun kan gå én vej. Oprykninger falder fra 65 % i sæson 1 til 1,5 % i sæson 20. Der er intet at spille om.

## Modellen

Spejlvend oprykningen: nr. 1-2 direkte op + playoff for 3.-6.; **de nederste to rykker direkte ned.**

**Bunden er hård.** Fra `div 3` (League Three) rykker man **ikke** ned. Det er spilverdenens gulv. Det sportslige nederlag kan sende dig til bunden af pyramiden; kun det økonomiske kan tage klubben fra dig (nat 4's trappe). Hold de to fald adskilt — det er dét, der gør dem til to forskellige historier i stedet for én dobbeltstraf.

## Følgevirkninger, som alle skal med

- **Lønloftet falder.** `BAL.wages.capOnPromotion` skal have en spejling, `capOnRelegation`. Uden den bærer klubben en oprykningslønsum ned i en division der ikke kan betale den — realistisk, men det skal være en *krise*, ikke en automatik.
- **`G.objectivePos` nulstilles** til divisionens niveau (se pakke 19, hvor den i stedet forhandles).
- **Byen skrumper.** `townDemand()` er allerede divisionsdrevet — kontrollér at det ikke kollapser fremmødet på én kampdag.
- **Truppen reagerer.** `dreamer`-traiten vil væk, de bedste får bud, selvtilliden falder. Traiten findes og bruges næsten ikke.
- **Bestyrelsen reagerer.** Ny `BAL.owners.trustRelegation` (negativ).
- **Klubværdien falder.** `clubValuation()` har allerede `(3-G.div)*perDivision` som det led der kan falde — pakke 4 byggede den til netop dette. Verificér at faldet indtræffer.
- **Bundstriden er en ny kilde til store kampe** (pakke 17) — og den virker præcis når de andre tørrer ud.

## Harness

Tvungent scenarie: en klub placeret sidst **skal** rykke ned, alle følgevirkninger måles før/efter. Invariant: `G.div` skal kunne bevæge sig begge veje og forblive i 0-3. Ny rapportlinje: nedrykninger pr. karriere og fordelingen af slutdivision over 20 sæsoner.

**Færdig når** gennemsnitsplaceringen over 20 sæsoner ikke længere glider monotont mod bunden, og nedrykning forekommer målbart uden at gøre klatreturen meningsløs.

---

# Pakke 17 — Store kampe: flere tilskuere, og en pris for tillægget

**a) En stor kamp trækker flere tilskuere.** I dag kommer der ikke én tilskuer mere til en sekser. GDD'en siger "ekstra tilskuere" og "udsolgt uanset form". Læg et boost på efterspørgslen med `G.capacity` som loft (`BAL.big.demandBoost`, start 1,1).

**b) Tillægget skal koste noget — QA's F2, efterprøvet 7/8.**

| tillæg | fremmøde | gate | stemningsstraf |
|---|---|---|---|
| +£0 | 2.670 | £31.132 | 0 |
| +£8 | 2.670 | £56.038 | 0 |

Fremmødet står bomstille. `attendance()` og `updateFormMood()` læser kun `G.ticket`; `G.bigExtra` optræder kun i `gateReceipts()`. **Modvægten findes allerede for grundprisen** — fremmøde 3.071 → 0 fra £5 til £30, stemningsstraf over £16 — den er bare aldrig koblet på tillægget. Lad begge funktioner læse `G.ticket + (big ? G.bigExtra : 0)`. Klub-skærmens *"fans tolerate ~£3"* skal blive sand eller forsvinde.

**Rækkefølgen (a) før (b) er bevidst:** skal et tillæg koste fremmøde, skal fremmødet først reagere på at kampen er stor.

**c) Hold båndet på 3-5.** Målt over 20 sæsoner: **2,4** — under båndet, fordi tre af fire kilder kræver en spændende liga. Bundstriden fra pakke 16 er den nye kilde. Topopgøret (nr. 1 mod nr. 2) fyrer 0,064 gange pr. sæson — én gang hver 16. sæson — og skal enten løsnes eller skrottes.

**Måltallet er nu vigtigere end før**, fordi hver stor kamp både trækker flere tilskuere *og* tillader højere priser. Bliver de for hyppige, er de en pengemaskine. Rapportér frekvensen ved både 10×5 og 200×20.

---

# Pakke 18 — Endgame-skalering: alt skal følge med

**Mads' princip (7/8):** stiger noget, skal alt andet stige med, så udfordringen holdes konstant mens tallene vokser. Presset i Premier Division med 20.000 tilskuere skal føles som League Three med 1.400 — bare med flere nuller. Det er *skalaen* der vokser, ikke lettelsen.

## Asymmetrien, målt

| | Vokser med | Faktor over fire divisioner |
|---|---|---|
| Byen (`townDemand`) | `perDivision` 0,85 + Family Stand | ×3,55 |
| Lønsum (målt) | `promotionRise` 1,35 pr. oprykning + større trup + bedre spillere | **×4,4** |
| TV-penge | faste trin £0 · £0 · £8k · £25k | springer, skalerer ikke |
| Sponsor | division × 0,6 | ×2,8 |

Byen er loftet, og den vokser langsommere end alt det, den skal betale for. Derfor: netto pr. kampdag er positivt fra sæson 2 til 8 og negativt resten af karrieren, med bund omkring −£7.700 i sæson 16.

## Opgaven

Ret indtægtssiden så den følger lønsiden. Særligt `tvMoney()`, som i virkelighedens fodbold gør en topklub til en anden forretning — her er den en fodnote på £25.000. Gør den proportional og markant større i toppen. Præmiepenge og sponsorskalering skal samme vej.

**Måltallet er en fordeling, ikke et tal:** netto pr. kampdag for en velfungerende klub skal have omtrent samme spredning i division 0 som i division 3. Mål pr. division over 200 seeds × 20 sæsoner, begge botprofiler.

**Advarsel:** det er fristende at rette dette ved at skrue byen op. Gør det ikke uden at kigge på lønsiden — `promotionRise` 1,35 sammensat over fire oprykninger er den egentlige motor, og GDD'en gør bevidst `townDemand` til et loft (*"Udbygning er strategi, ikke +kapacitet"*).

**Kommer efter pakke 16 med vilje.** Nedrykning ændrer divisionsdynamikken fundamentalt.

---

# Pakke 19 — Forventningsmødet med medejerne

`G.objectivePos` sættes i dag automatisk: top 8 fra start, derefter top 10, 9 eller 7 efter division. Ingen taler med dig om den — men den styrer `trustObjective +7` / `trustMissed −4`, præmiepenge og hele bestyrelsens dom over sæsonen.

Gør den til en **forhandling ved sæsonstart**, som femte trin i budgetmødet (`BUDGET_STEPS` har allerede fire) eller som scenen før.

Afvejningen er det, der gør det til et valg: **presser du målsætningen ned**, er den nem at ramme — men medejerne noterer, at du ikke tror på klubben, og prisen på deres andele afspejler det. **Accepterer du en høj**, får du mere tillid og bedre præmier hvis du leverer, og en større regning hvis du ikke gør. Samme poker-princip som kontraktforhandlingen: medejernes egen forventning er skjult i første runde. Personligheder og humør findes allerede og skal vægte kravet.

---

# Pakke 20 — Resultatet står fast

Lille pakke, men den hører sammen med nedrykningen: **risiko uden permanens er teater.** Bygger vi et spil, hvor man kan rykke ned og miste klubben, skal man ikke kunne rulle et resultat om.

`saveGame()` kaldes tre steder: ved skærmskift (`go()`), ved sæsonslut, og i `afterMatchday()` — altså **efter** tickeren. Men resultatet er allerede afgjort, når tickeren begynder at rulle. Lukker spilleren appen midt i tickeren, ligger den gemte tilstand stadig før kampdagen, og kampen spilles om med et nyt udfald.

Gem i det øjeblik resultatet afgøres — i `choosePrematch()`, når kampen og AI-runden er beregnet, før tickeren starter. Så er kampen på papiret, uanset hvad spilleren gør bagefter.

Skriv det som en **egenskab, ikke en begrænsning**: en linje i onboardingen eller på indstillingsskærmen om at resultater står fast. Konkurrenten Hometown FC reklamerer eksplicit med det (*"a match is saved the moment it's played, so you can't reload to re-roll a result you didn't like"*), og det er en tillidserklæring til spilleren om at klubben er ægte.

Harness: invariant om at et gemt spil taget midt i en ticker giver samme resultat ved genindlæsning.

---

# Pakke 21 — Oprydning (må gerne droppes, hvis tiden slipper op)

**a) Sponsorkollapset er en anden lodtrækning end det ser ud til (F8).**

```js
if(G.sponsor.risk && G.md===R(8,20) && Math.random()<G.sponsor.risk){ … }
```

`R(8,20)` trækkes **på ny hver kampdag**, så den effektive sæsonsandsynlighed er ca. `0,64 × risk`, ikke `risk`. Det virker i dag og knækker stille den dag nogen ændrer vinduet eller `G.rounds` — **og vi rører sæson- og divisionsstrukturen i nat.** Træk dagen én gang pr. sæson.

**b) De sidste hardkodede tal i lovninger (F10).** Bank-modalens `+£50,000 now, £5,500/MD × 10`, `grantReward("sponsor")`s `+£8,000` (findes slet ikke i `BAL`), Klub-skærmens `patience pays up to 15%`, og stemnings-konstanterne for Family Stand, pub, VIP, basics og klinik.

**c) Gør pakke 7's hvidliste til en scanner.** `checkPromisesMatchCode()` kræver, at 17 *navngivne* tekster indeholder en BAL-afledt streng. Den kan strukturelt ikke finde et hardkodet tal, den ikke er blevet fortalt om — hvilket er præcis hvorfor (b) stod tilbage. Vend den om: scan alle brugervendte strenge for tal­mønstre (`£N`, `N%`, `N matchdays`) og kræv, at hvert fund enten er BAL-afledt eller står på en eksplicit undtagelsesliste.

---

# Efter i nat

Køen bagefter ligger i `ROADMAP.md` — nat 4 (trappen, banken, kontraktrollen, tilgangen), nat 5 (hele staben), nat 6 (formandens ord), nat 7 (pyramiden), og derefter pokal, multi-klub og byen. **Byg ikke på den i nat.** Den er der, så du kan se hvor tingene skal hen, ikke som arbejdsordre.

To ting derfra er relevante for i nat:

- **Pyramiden kommer senere, og nedrykningen skal ikke vente på den.** Pakke 16 virker med `G.div` som tal.
- **Store kampe får en femte kilde (pokalen) senere.** Byg ikke pokalstruktur ind i pakke 17 — udled `big` af tabellen som beskrevet.

---

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
node test-harness.js --seeds=200 --seasons=20 --bot=both
```

Grøn = `REGRESSION_OK`. **Kør 200×20 mindst én gang før rapporten** — nat 2 kørte 50×20, var grøn, og QA fandt den rød ved 200.

Afslut med `NIGHT-REPORT-3.md`: hvad blev færdigt, målte tal før og efter pr. pakke, hvor du afveg fra planen og hvorfor, hvad du var i tvivl om, og hvad du ikke kunne efterprøve. Nat 1's og nat 2's rapporter var mest værdifulde dér, hvor de var ærlige om det, de ikke kunne bevise.
