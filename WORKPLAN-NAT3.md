# ARBEJDSKØ — NAT 3: strukturen. Spillet skal kunne gå begge veje

*Skrevet 7/8 2026 efter gennemgang af nat 2's arbejde og QA-rapporten. Selvstændig: en frisk session skal kunne udføre den herfra uden yderligere kontekst.*

Læs `Claude.md` først. Læs derefter `QA-REPORT.md` på `nightly/qa` — den er testagentens uafhængige måling af nat 2 og indeholder de tal, denne plan bygger på. `NIGHT-REPORT-2.md` er udviklingsagentens egen; hvor de to er uenige, **har QA ret** (efterprøvet 7/8).

**Arbejdsform:** én pakke ad gangen, `node --check proto-extract.js` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn, én commit pr. pakke. Alle balancetal i `BAL`. Nye modaltyper i **både** `handleModal` og `HANDLED_MODALS`.

**Branch:** fortsæt på `nightly/trupdybde` oven på `02455dc`. Første handling: `git merge origin/master`.

## Ufravigelig ramme

> **Formanden udtager ALDRIG holdet.** Ingen opstilling, ingen taktik. Gafferen vælger elleveren; du skaffer truppen og betingelserne.

- **Rækkefølgen er ikke til forhandling.** Alle mekanikændringer (pakke 12-16) ligger før balancemålingen (pakke 17). Ændrer man `homeBonus()` eller facilitetsindtægter efter at have tunet skaleringen, er tuningen målt mod et mål der flyttede sig.
- **Sabotér hver ny invariant, før du stoler på den.** Nat 2 havde to assertions der bestod mod bevidst ødelagt kode. QA fandt to mere. Gør sabotageforsøget til første skridt.
- **Pas på tvungne scenarier der forurener statistikken.** QA's vigtigste instrumentfund: nat 2's sidste commit afviklede én ekstra kampdag i et tvunget scenarie, og fordi `stats.md` aldrig snapshottes (kun `stats.final` gør), blev pakke 5's måltal forkert — 3,4 rapporteret mod 2,9 målt. **Snapshot `stats.md` og `G.history` før tvungne scenarier**, ellers gentager fejlen sig i alt hvad du måler i nat.
- **Ingen designbeslutninger.** Er `Claude.md` og GDD'en tavse, og betyder valget noget: skriv spørgsmålet i `DECISIONS-NEEDED.md`, vælg imens den mest GDD-konsistente mulighed, begrund i commit-beskeden. Tun aldrig et måltal væk i stilhed.
- **Hård stop kl. 04:00 dansk (02:00 UTC).** Skriv `NIGHT-REPORT-3.md` og push som allersidste handling — testagenten bruger den som færdigmarkør. **Du når formentlig ikke alle syv.** Pakke 15 og 17 er de største i projektets historie; tre solide pakker er mere værd end syv halve.

---

# Pakke 12 — Dublet-tickerlinjen (lav denne først, den tager minutter)

QA's F1, efterprøvet. I `halfEvents()`:

```js
if(Math.random()<0.03)ev.push({m:mkMin(),
  txt:"GOAL — no, WAIT. Flag's up. The linesman is the least popular man in the county."});
```

Linjen pushes direkte ind i `ev[]` uden om `pickLine(pool, ctx, match.used)`, som er hele dublettvagten. `halfEvents()` kaldes to gange pr. kamp, hver med sin egen terning. Målt over 300.000 kampe: 1 dublet pr. 1.007 kampe = **~40 % af alle 20-sæsoners karrierer**, og regressionstesten er derfor tilfældigt rød i ~0,3 % af alle seeds.

Send den gennem `pickLine([...], at(m), match.used)` som en ét-linjes pulje. **Gennemsøg samtidig for andre direkte `ev.push` med hardkodet `txt`** — hvidlisten i pakke 7 kunne ikke se dem, og der er sandsynligvis flere.

**Færdig når** `node test-harness.js --seeds=200 --seasons=20` er grøn.

---

# Pakke 13 — Tavshedens form

QA's F3, og det er en formfejl, ikke en talfejl.

```js
function homeBonus(){
  if(protestLevel()>=2) return BAL.protest.silentHome;   // flad erstatning
  return 0.13 + 0.27*(attendance()/G.capacity)*(G.fanMood/100) + G.stands.shed*BAL.stands.shedHome;
}
```

Den normale hjemmebanefordel har tre led: 0,13 fladt, op til 0,27 for publikum, op til 0,10 for Shed End. Ved protest ≥ 2 kasseres **hele udtrykket** og erstattes af ét tal. To følger:

1. **Shed End (£220.000 fuldt udbygget) er værdiløs på 31 % af kampdagene**, og teksten på tribunen siger det ikke.
2. `silentHome` er et **gulv**, ikke en straf. Ligger det over en klubs normale bonus, bliver tavshed en *fordel* — derfor gør 0,20 harness'en rød i 7 af 20 kørsler.

**Omform til en multiplikator på publikumsleddet:**

```js
const quiet = protestLevel()>=2 ? BAL.protest.silentCrowd : 1;
return 0.13 + 0.27*(attendance()/G.capacity)*(G.fanMood/100)*quiet + G.stands.shed*BAL.stands.shedHome;
```

Så tager tavsheden **den tolvte mand** — præcis hvad GDD'en siger — og aldrig mere. Straffen bliver automatisk proportional: man kan kun miste et publikum, man havde. Shed End overlever, og tavshed kan aldrig blive en gave.

`silentHome` slettes. **QA's vippepunkt på 0,16-0,17 er målt på den gamle knap og kan ikke overføres** — start `silentCrowd` på 0 (total tavshed) og mål, om trappen stadig tænder for hårdt. Invariant: `homeBonus()` ved protest ≥ 2 skal **altid** være ≤ samme klubs bonus ved protest 0. Sabotér den.

---

# Pakke 14 — Main Stand får en rolle

To virkninger, begge besluttet af Mads 7/8:

**a) VIP-bokse kræver Main Stand ≥ 1.** I dag udbetaler VIP sit faste beløb uanset hvad, men `stadiumSvg()` tegner dem kun hvis `G.stands.main>=1` — koden og billedet er allerede uenige. Gør kravet ægte, så hovedtribunen låser den mest lukrative facilitet op.

**b) +4 bestyrelsestillid pr. niveau ved opførelse** (`BAL.owners.trustMainStand`). Bevidst lille: med `trustAdmin: −30` er dette et symbolsk nik fra bestyrelsen, ikke en genvej. Tillid skal fortsat primært fortjenes gennem opførsel.

Teksten på tribunen opdateres til at sige begge dele — og husk pakke 7's invariant, der fejler hvis en lovning ikke bygges af `BAL`.

---

# Pakke 15 — Nedrykning

**Den største enkeltændring i projektets historie, og den vigtigste.** QA målte, at klubben klatrer til øverste række omkring sæson 6-9 og derefter synker til plads 12,5 af 14 — uden konsekvens, fordi divisionen kun kan gå én vej. Oprykninger falder fra 65 % i sæson 1 til 1,5 % i sæson 20. Der er intet at spille om.

## Modellen

Spejlvend oprykningen. Oprykning er i dag nr. 1-2 direkte + playoff for 3.-6.; **nedrykning er de nederste to direkte.**

**Bunden er hård.** Fra `div 3` (League Three) rykker man **ikke** ned. Det er spilverdenens gulv. Det sportslige nederlag kan sende dig til bunden af pyramiden; kun det økonomiske kan tage klubben fra dig (nat 4's trappe). Hold de to fald adskilt — det er dét, der gør dem til to forskellige historier.

## Følgevirkninger, som alle skal med

- **Lønloftet falder.** `BAL.wages.capOnPromotion` har en spejling: `capOnRelegation`. Uden den bærer klubben en oprykningslønsum ned i en division, der ikke kan betale den — hvilket ganske vist er realistisk, men skal være en *krise*, ikke en automatik.
- **`G.objectivePos` nulstilles** til divisionens niveau. Se pakke 18: efter forventningsmødet forhandles den i stedet.
- **Byen skrumper.** `townDemand()` er allerede divisionsdrevet, så det sker af sig selv — kontrollér at det ikke kollapser fremmødet på én kampdag.
- **Truppen reagerer.** En nedrykning skal koste: `dreamer`-traiten vil væk, de bedste får bud, selvtilliden falder. Traiten findes og bruges næsten ikke.
- **Bestyrelsen reagerer.** Ny `BAL.owners.trustRelegation` (negativ). Nedrykning er det mest synlige brud på en målsætning der findes.
- **Klubværdien falder.** `clubValuation()` har allerede `(3-G.div)*perDivision` som det ene led der kan falde — pakke 4 byggede den til netop dette. Verificér at faldet indtræffer.
- **Bundstriden er en ny kilde til store kampe.** Se pakke 16.

## Harness

Tvungent scenarie: en klub placeret sidst **skal** rykke ned, og alle følgevirkninger måles før/efter. Invariant: divisionen skal kunne bevæge sig begge veje, og `G.div` skal forblive i 0-3. Ny rapportlinje: nedrykninger pr. karriere, og fordelingen af slutdivision over 20 sæsoner.

**Færdig når** gennemsnitsplaceringen over 20 sæsoner ikke længere glider monotont mod bunden, og nedrykning forekommer målbart uden at gøre klatreturen meningsløs.

---

# Pakke 16 — Store kampe: flere tilskuere, og en pris for tillægget

Tre ting, der hører sammen, fordi de alle rører storkamps-økonomien.

**a) En stor kamp trækker flere tilskuere.** I dag stiger gaten kun af pristillæg og faciliteter — der kommer ikke én tilskuer mere til en sekser. GDD'en siger "ekstra tilskuere" og "udsolgt uanset form". Læg et boost på efterspørgslen med `G.capacity` som loft (`BAL.big.demandBoost`, start 1,1).

**b) Tillægget skal koste noget — QA's F2, efterprøvet.** I dag:

| tillæg | fremmøde | gate | stemningsstraf |
|---|---|---|---|
| +£0 | 2.670 | £31.132 | 0 |
| +£8 | 2.670 | £56.038 | 0 |

Fremmødet står bomstille. `attendance()` og `updateFormMood()` læser begge kun `G.ticket`; `G.bigExtra` optræder kun i `gateReceipts()`. **Modvægten findes allerede for grundprisen** — fremmøde 3.071 → 0 fra £5 til £30, stemningsstraf over £16 — den er bare aldrig koblet på tillægget. Lad begge funktioner læse `G.ticket + (big ? G.bigExtra : 0)` på store kampe. Klub-skærmens *"fans tolerate ~£3"* skal blive sand eller forsvinde.

**Rækkefølgen (a) før (b) er bevidst:** skal et tillæg koste fremmøde, skal fremmødet først reagere på at kampen er stor.

**c) Hold båndet på 3-5.** Målt over 20 sæsoner: **2,4** — under båndet, fordi tre af de fire kilder kræver at ligaen er spændende, og en stabiliseret klub har ingenting at spille om. Bundstriden fra pakke 15 er en ny kilde, der virker præcis når de andre tørrer ud. Topopgøret (nr. 1 mod nr. 2) fyrer 0,064 gange pr. sæson — én gang hver 16. sæson — og skal enten løsnes eller skrottes.

**Måltallet er nu vigtigere end før**, fordi hver stor kamp både trækker flere tilskuere og tillader højere priser. Bliver de for hyppige, er de en pengemaskine. Rapportér frekvensen ved både 10×5 og 200×20 — ikke kun den korte.

---

# Pakke 17 — Endgame-skalering: alt skal følge med

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

Ret indtægtssiden så den følger lønsiden. Særligt `tvMoney()`, som i virkelighedens fodbold er dét, der gør en topklub til en anden forretning — her er den en fodnote på £25.000. Gør den proportional og markant større i toppen. Prispenge og sponsorskalering skal samme vej.

**Måltallet er en fordeling, ikke et tal:** netto pr. kampdag for en velfungerende klub skal have omtrent samme spredning i division 0 som i division 3. Mål det pr. division over 200 seeds × 20 sæsoner, begge botprofiler.

**Kommer sidst med vilje.** Nedrykning ændrer divisionsdynamikken fundamentalt, og pakke 12-16 flytter alle sammen på økonomien. Måler du før dem, måler du en verden der ikke findes mere.

**Advarsel:** det er fristende at rette dette ved at skrue byen op. Gør det ikke uden at kigge på lønsiden — `promotionRise` 1,35 sammensat over fire oprykninger er den egentlige motor, og GDD'ens `townDemand` er bevidst et loft ("Udbygning er strategi, ikke +kapacitet").

---

# Pakke 18 — Forventningsmødet med medejerne

`G.objectivePos` sættes i dag automatisk: den starter på top 8 og bliver til top 10, 9 eller 7 efter division. Ingen taler med dig om den — men den styrer `trustObjective +7` / `trustMissed −4`, præmiepenge og hele bestyrelsens dom over din sæson.

Gør den til en **forhandling ved sæsonstart**, som femte trin i budgetmødet (`BUDGET_STEPS` har allerede fire) eller som scenen før det.

Det, der gør det til et valg og ikke en dialogboks, er afvejningen: **presser du målsætningen ned**, er den nem at ramme — men medejerne noterer, at du ikke tror på klubben, og prisen på deres andele afspejler det. **Accepterer du en høj**, får du mere tillid og bedre præmier hvis du leverer, og en større regning hvis du ikke gør.

Samme poker-princip som kontraktforhandlingen: medejernes egen forventning er skjult i første runde. Personligheder og humør findes allerede og skal vægte kravet.

---

# Design­noter til senere nætter (byg dem IKKE i nat)

- **Pokalen som kilde til `big`.** 87 % af alle store kampe kommer i dag fra to tabelafhængige kilder. En pokalkamp er uafhængig af tabellen. **Mads' regel (7/8):** møder du din rival fra en anden division i pokalen, er det en *ekstraordinær* situation og må være sæsonens sjette store kamp, uden for båndet.
- **Multi-klub.** Spillet skal senere kunne rumme flere klubber pr. ejer, dog aldrig to i samme liga. `G` skal omstruktureres til at have en klub-dimension i roden — **egen pakke, efter nedrykningen**, med harness'en som sikkerhedsnet. Åbne spørgsmål: fælles eller adskilt kasse; ejer medejerne klubben eller holdingselskabet. **Og den gode kollision:** rykker din ene klub ned i den andens division, skal du sælge en af dem.
- **Nat 4 — konsekvensen:** femtrins-trappen (trin 4 = redningskapital mod andele, trin 5 = under 50 % er game over), administrator-karakteren der flytter ind på kontoret, brandudsalg med ur, æra-opsummeringen. Plus **en rigtig bank**: du vælger beløb og løbetid, banken vælger renten ud fra klubværdi, division, kassestilling og administrationshistorik. Lånet lægges i `G.commitments` fra pakke 3 frem for sit eget `G.loan`-særtilfælde. Måltal: administration ~1 gang pr. karriere (nu 4,5), game over inden for rækkevidde i 5-15 % af karriererne.

---

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
node test-harness.js --seeds=200 --seasons=20 --bot=both
```

Grøn = `REGRESSION_OK`. **Kør 200×20 mindst én gang før rapporten** — nat 2 kørte 50×20, var grøn, og QA fandt den rød ved 200. Kontrollér måltallene efter hver pakke og rapportér afvigelser i commit-beskeden.

Afslut med `NIGHT-REPORT-3.md`: hvad blev færdigt, målte tal før og efter pr. pakke, hvor du afveg fra planen og hvorfor, hvad du var i tvivl om, og hvad du ikke kunne efterprøve. Nat 1's og nat 2's rapporter var mest værdifulde dér, hvor de var ærlige om det, de ikke kunne bevise.
