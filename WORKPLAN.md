# ARBEJDSKØ — tre pakker, i denne rækkefølge
*Skrevet 6/8 2026. Selvstændig: en frisk session skal kunne udføre den herfra uden yderligere kontekst.*

Læs `Claude.md` først. Arbejdsformen gælder: **én pakke ad gangen, `node --check` + `node test-harness.js` grøn, én commit pr. pakke.** Alle balancetal skal i `BAL` øverst i JS'en — ingen bare konstanter i logikken.

## Ufravigelig ramme

> **Formanden udtager ALDRIG holdet.** Ingen opstilling, ingen taktik, ingen "hvem spiller på lørdag".

Gafferen vælger elleveren; spilleren skaffer truppen og betingelserne. Enhver mekanik nedenfor der kommer i nærheden af en holdopstilling, er implementeret forkert. (`Claude.md`: *"Ingen taktik/opstilling — formanden vælger kun approach før kamp + taler med truppen."*)

---

# Pakke 0 — Indbakken er en blindgyde (LAV DENNE FØRST)

**Fundet ved rigtig spiltest 6/8.** Mads gav et formelt bud, fik dagen efter besked om en budkrig — og der var **ingen knap at trykke på**. Han kunne heller ikke gå på Market og matche buddet, fordi spilleren stod låst på "BID PENDING".

## Omfanget

`handleAction()` håndterer **otte** beskedtyper. `viewInbox()` (~linje 1853) tegner kun knapper for **to**:

| Type | Handler | Knap i UI |
|---|---|---|
| `sellOffer` | ✅ | ✅ |
| `sponsorChoice` | ✅ | ✅ |
| `bidAccepted` | ✅ | ❌ |
| `bidCounter` | ✅ | ❌ |
| `bidWar` | ✅ | ❌ |
| `callback` | ✅ | ❌ |
| `transferReq` | ✅ | ❌ |
| `stunt` | ✅ | ❌ |

**Hele det formelle bud-spor er dermed dødt** — også når klubben *accepterer* dit bud (`bidAccepted`). GDD linje 59 beskriver ellers to ligeværdige købsspor: *"Quick (live forhandlingsrunder) eller Formelt bud (fax → svar efter næste kampdag: accept / modbud / budkrig / afvist)"*. Kun det ene virker.

Følgefejl: fordi beskeden aldrig kan besvares, ryddes `p.pendingBid` aldrig, og `marketRow()` tegner permanent `BID PENDING` i stedet for knapper. Spilleren er dermed **låst for evigt** — hverken indbakken eller markedet giver en vej videre.

## Implementering

**a) Tegn knapper for alle otte.** Valgene findes allerede i `handleAction` — de skal bare eksponeres:

| Type | Knapper |
|---|---|
| `bidAccepted` | *"Åbn kontraktforhandling"* (ét valg) |
| `bidCounter` | *"Accepter £X"* · *"Lad den dø"* |
| `bidWar` | *"Match £X"* · *"Træk dig"* |
| `callback` | *"Hør ham ad"* (ét valg) |
| `transferReq` | *"Sæt ham på listen"* · *"Afvis"* |
| `stunt` | *"Kør det · +£6.000"* · *"Nej tak"* |

Beløb skal stå **på** knappen, som ved `sellOffer`. Er beløbet uden for kassen, dæmp knappen og skriv hvorfor — samme mønster som spiller-arket i ændring 2.

**b) Bud må ikke hænge i det uendelige.** Giv bud-relaterede beskeder en frist (fx 2 kampdage). Når den passerer: marker beskeden `done`, forklar i teksten at de gik videre til en anden, og **ryd `pendingBid`** så spilleren bliver tilgængelig igen. Det løser låsningen og giver samtidig budkrigen den hastværksfølelse, den skal have.

**c) Ryd op ved sletning.** `delMsg()` fjerner en besked uden at rydde `pendingBid`. Slet man en ubesvaret budbesked, låses spilleren på samme måde. Ryd tilstanden med.

**d) Harness — invarianten der ville have fanget det.** Botten kalder `actMsg()` **direkte** og opdager derfor aldrig manglende knapper. Tilføj: render indbakke-skærmen, og for hver besked med `action && !done` skal den renderede HTML indeholde mindst ét `actMsg(<id>,`. Fejl ellers med beskedtypen. Det er samme fejlklasse som uregistrerede modaltyper, og den skal fanges automatisk på samme måde.

## Færdig når

Alle otte typer kan besvares fra indbakken, ingen spiller kan låses permanent på `BID PENDING`, og den nye harness-invariant er grøn. **Denne pakke går forud for de øvrige** — pakke 1 handler om at gøre dig sulten efter spillere, og det er meningsløst, hvis halvdelen af købsvejene er blindgyder.

---

# Pakke 1 — Trupdybde og friskhed

## Problemet, målt

Truppen står på **13 mand i 40 ud af 40 sæsonafslutninger** over alle seeds — også i klubber med 6.100 pladser og 61 % ejerandel. Transfermarkedet, en af spillets tre søjler, er reelt dødt.

Årsagen er, at dybde i dag er **dobbelt straffet**:

1. `bestXI()` vælger gratis de bedste elleve hver kamp → spiller nr. 12 er ren lønudgift.
2. Bænkslid (`updateFormMood`, ~linje 856): `ranked.slice(16)` trækker form og selvtillid fra alle uden for de bedste 16 **efter OVR-rangering** — så en 17. mand rådner op, uanset om han spiller.

Der findes ingen træthedsmekanik overhovedet. `sapps` er kun en tæller til løftesystemet og ungdomsudvikling.

## Modellen

Spillets tidsenhed er **kampdagen** (`G.md`) — der findes ikke hviledage. Derfor virker et batteri, der tømmes og fyldes, ikke. I stedet **rullende belastning med eksponentielt henfald**, som konvergerer mod et plateau:

```
// pr. kampdag, for hver spiller i truppen
load = load * BAL.fresh.decay + (spillede? BAL.fresh.cost * aldersfaktor : 0)
friskhed = clamp(100 - max(0, load - BAL.fresh.free) * BAL.fresh.slope, 0, 100)

aldersfaktor = 1 + max(0, alder - BAL.fresh.ageFrom) * BAL.fresh.agePerYear
```

**Designkrav (Mads, 6/8):** *ingen* spiller — heller ikke den yngste — skal kunne spille hver kamp uden at det koster. Alderen bestemmer **hvor mange kampe i træk** man holder til, ikke om man kan.

Med `decay 0.78`, `free 2.0`, `slope 20`, `cost = 1 + max(0, alder−22) × 0,018`:

**Ligevægt hvis han spiller ALT** — alle ender trætte, de gamle langt værst:

| Alder | load | friskhed |
|---|---|---|
| 20 | 4,55 | **49** |
| 26 | 4,87 | **43** |
| 30 | 5,20 | **36** |
| 34 | 5,53 | **29** |

**Kampe i træk, fra udhvilet** — her viser alderen sig:

| Kampe i streg | 1 | 2 | 3 | 4 | 6 | 8 | 12 |
|---|---|---|---|---|---|---|---|
| 20 år | 100 | 100 | 92 | 83 | 70 | 62 | 54 |
| 34 år | 100 | 97 | 82 | 70 | 55 | 45 | 35 |

En 20-årig er stadig på 70 efter **seks** kampe i streg; en 34-årig er der efter **fire** — og begge bliver ved med at falde. Ingen spiller sig fri af det.

**Rotation hjælper, men løser det ikke:**

| Mønster (20 år) | friskhed |
|---|---|
| Hver kamp | 49 |
| 3 spillet, 1 fri | 64 → 81 |
| 2 spillet, 1 fri | 72 → 87 |

At rotere 1 ud af 3 kræver ~16-17 mand til elleve pladser — hvilket lander præcis dér, hvor lønloftet rækker (~17) og hvor GDD'ens bløde loft ligger (~22). Det er den tilsigtede kobling.

Én kamps hvile flytter en 20-årig fra 49 til 69. Gafferens beslutning virker synligt med det samme.

```js
fresh:{ decay:0.78, cost:1.0, ageFrom:22, agePerYear:0.018,
        free:2.0, slope:20,
        trainingRecovery:0.03,   // træningsanlæg: 0.78 → 0.81 henfald
        glassCost:0.12,          // glass body: dyrere pr. kamp
        grafterCost:-0.06,       // grafter: billigere
        phyFloor:0.72,           // phyMult = phyFloor + (1-phyFloor)*min(1, fresh/softFrom)
        softFrom:80,             // over 80 mærkes intet
        injuryScale:1.3 }        // skadesrisiko × (1 + (100-fresh)/100 * injuryScale)
```

Med `softFrom 80` mister en evigt spillende 34-årig ~18 % af sit fysiske bidrag. Tallene er startværdier — harness'en skal måle dem efter.

## Implementering

**a) Felt.** `fresh:0` (load) på `genPlayer`. Bemærk: gemt værdi er *load*, ikke friskhed — friskhed udledes. Hjælper `freshOf(p)` → 0-100.

**b) Gafferen roterer.** Omdøb `bestXI()` → behold navnet, men udvid sorteringen:
```js
by = p => p.att + p.def + p.phy + p.form*2 - restWeight(p)
restWeight = p => (100 - freshOf(p)) * (0.02 + G.coach.man/1600)
```
En gaffer med høj `MAN` vægter friskhed tungere og hviler folk i tide; en lav rider sin stjerne i sænk. **Rotationen sker kun, hvis der er dækning** — med 13 mand og to skader er der ingen at sætte ind, og de trætte spiller.

**c) Effekt på banen.** I `myStrength()` skaleres den enkeltes `phy` (og svagere `att`/`def`) med friskheden. Kobler sig til vejret: mudderbane + udkørt trup bliver ubehageligt.

**d) Skader følger trætheden.** `matchIncidents()` bruger i dag flad risiko (7 %, 5 % med klinik). Gang med `(1 + (100-fresh)/100 * injuryScale)` for den valgte spiller. Det lukker sløjfen: tynd trup → ingen rotation → trætte ben → skade → endnu tyndere trup. Selvkorrigerende, når man køber dybde.

**e) Ret bænksliddet.** `ranked.slice(16)` udskiftes med **spillede kampe**: mistede han denne kampdag, falder form let. Så gælder:
- Dybde straffes ikke længere.
- En spiller tilbage fra fire kampes skade er *frisk*, men har lav `form` — altså "ikke kampskarp endnu" uden en fjerde værdi.
- Form tildeles i dag hele truppen efter en kamp (`for(const p of G.squad)`); det skal kun gælde dem der spillede.

**f) Faciliteter får ny mening.** Træningsanlæg → hurtigere restitution (`decay + trainingRecovery`). Lægeklinik → dæmper `injuryScale`.

**g) UI — formandsniveau, ikke trænerniveau.** Ingen tal, kun tilstande:
- Chip på trup-rækken: **Frisk / Brugt / Flad** (`.mini` findes: `a` / `m` / `r`).
- Gafferens replik i prematch-arket når truppen er tynd og træt: *"Tredje kamp på fjorten dage. Jeg har ingen at sætte ind."* Genbrug `.why`-blokken, der allerede advarer ved under elleve mand.
- Spiller-arket: en linje om belastning ved siden af form og selvtillid.

**h) Harness.**
- Invariant: `freshOf(p)` altid 0-100, `load` endelig og ikke-negativ.
- Ny rapportsektion: gennemsnitlig trupstørrelse pr. sæson (**skal stige over 13** — det er hele beviset for at pakken virker), samt andel kampe spillet med under elleve friske.
- Botten skal købe dybde, når gafferen brokker sig.
- `assertSerialisable` fanger automatisk fejl, hvis `load` lægges et forkert sted.

## Færdig når

Bottens gennemsnitlige trupstørrelse er **over 13** ved sæsonslut, ingen invarianter brydes, og økonomien holder sig inden for måltallene i `Claude.md` (netto/kampdag S1 ±£2k, 0-1 administration).

---

# Pakke 3 — Ratebetaling og bonusklausuler

GDD linje 41: *"**Ratebetaling** (køb over 2-4 rater — køb større end kassen, bind fremtiden) og **bonusklausuler** (+£ ved oprykning / pr. mål — flyt risikoen til fremtiden). Rå pris er altid muligt; strukturer er værktøjer, ikke krav."*

I dag er en handel "vælg et tal, prut tre runder". Efter pakke 1 vil man gerne købe spillere, man ikke har kontanter til — det er dér, den her hører hjemme.

- Nyt trin i forhandlingsarket efter prisen er aftalt: **kontant / rater (2-4 sæsoner) / bonusklausul**.
- `G.commitments: [{pid, club, perSeason, seasonsLeft, kind}]` — afdrages i `finishSeason` eller pr. kampdag i `settleFinances`. **Kun id'er og primitive værdier** (se `Claude.md`: G skal være et træ).
- Sælgende klub kræver et tillæg for rater (~8-12 %) — man betaler for likviditeten.
- Bonusklausuler udløses ved oprykning eller ved målscore; tjekkes i `finishSeason`.
- Forpligtelser vises på Klub-skærmen ved siden af banklånet og indgår i budgetmødets opsummering af arbejdskapital.
- Fodrer bank/administration-maskineriet, som står klar men næsten aldrig udløses.

---

# Pakke 2 — Protest-trappen

GDD linje 176: *"PROTEST-TRAPPEN ved lav [stemning]: først bannere, så tavshed (uhyggeligst), så boykot med økonomisk konsekvens. Vrede har trin, ikke bare et tal."*

I dag er `fanMood` blot en faktor på fremmødet — en dårlig sæson betyder færre penge, ikke en krise man kan mærke. Infrastrukturen landede allerede med ændring 4 og 6: publikum tegnes som prikker med tæthed efter fremmøde, og `townDemand()` gør synligt tomme sæder mulige.

Tre trin på `fanMood` (tærskler i `BAL`):
1. **Bannere** — protestskilte tegnes på tribunerne i `stadiumSvg()`, nyheder skifter tone.
2. **Tavshed** — `homeBonus()` (12. mand) falder bort; stadion tegnes uden farvede tørklæder i mængden. Gafferen kommenterer stilheden.
3. **Boykot** — hårdt loft på `townDemand()`, synligt tomme sektioner, medejerne skriver.

Vejen tilbage skal være mulig men langsom, så det bliver en spiral man kan arbejde sig ud af — ikke en dødsdom. Husk `stadCache`-nøglen i `stadiumSvg()`: protesttrinnet skal med, ellers opdateres tegningen ikke.

---

# Verifikation for alle tre

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
```

Grøn = `REGRESSION_OK`. Nye modaltyper **skal** registreres i både `handleModal`-switchen og `HANDLED_MODALS` — ellers stopper harness'en før botten overhovedet starter. Kontrollér måltallene i `Claude.md` efter hver pakke og rapportér afvigelser i commit-beskeden frem for at tune dem væk i stilhed.
