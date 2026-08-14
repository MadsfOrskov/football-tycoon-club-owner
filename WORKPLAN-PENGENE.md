# ARBEJDSKØ — PENGENE & NAVNENE

*Brainstorm med Mads 14/8 2026. Skrevet som instruks til den agent der koder det
senere. Intet af dette er bygget endnu. Læs `Claude.md`, `DESIGN-SYSTEM.md` og
`NIGHT-REPORT-8.md` først. Ufravigelig ramme som altid: én pakke pr. commit ·
alle tal i BAL · nye modaler i `handleModal` OG `HANDLED_MODALS` · **sabotér hver
ny invariant først** (mål SPILLETS kode via `H.call`) · `node --check` + 6×4 +
20×5 `--stats` grøn pr. pakke · 200×20 `--bot=both` før master.*

---

# DEL 1 — PENGENE: hvad skal kontanterne bruges til i sæson 1?

## Problemet, målt i koden

E2-justeringen låste eksterne klubkøb til efter sæson 1 (Mads' playtest-fund —
korrekt beslutning). Men det efterlod balancepinden uden modvægt tidligt. Her er
**alle** steder `personalWealth` kan bruges i dag:

| Sted | Kode | Tilgængelig i sæson 1? |
|---|---|---|
| Minoritetsandel i fremmed klub | `buyStake` | **NEJ** — `unlockSeason:2` |
| Kontrol med klub nr. 2 | `buyControl` | **NEJ** — samme dør |
| Mæglerens tilbud | `brokerAccept` | **NEJ** — samme dør |
| Indskud i kriseramt holding | `dirCrisisAct` | **NEJ** — kræver en holding |
| Invest-aktiver | `investBuy` | **JA** — pubs £180k · agentur £300k · akademi £500k |
| Ejer-livet (forfængelighed/velgørenhed/PR) | `ownerSpend` | Kun REAKTIVT, når et event dukker op |

Med 51 % får du ca. **£240k** ved stiftelsen. Den eneste beslutning du kan træffe
mandag morgen er: *køb pubkæden (£180k)*. Derefter ligger pengene stille.

**Konsekvensen:** balancepinden er et falsk valg i sæson 1. Patriarken (100 %)
giver dig hele klubbens opside og går ikke glip af noget, fordi kontanter næsten
ingen job har. Kontantsiden mangler et "hvad gør jeg med dem i morgen".

## Det tematiske hul

**Du kan ikke lægge dine egne penge IND i din klub.** Det er den mest oplagte
manglende handling for en engelsk klubejer overhovedet — direktørlånet er selve
definitionen på lower-league-formandskab. Spillet har allerede vejen UD
(udbyttet, R3), men ingen vej IND. Bemærk også skævheden: at købe en medejer ud
(`ownerNegoSubmit`) betales i dag af **klubkassen** (`G.balance`), ikke af dine
egne penge — klubben køber altså sine egne aktier og forærer dig dem.

## Pakke PENGE-1 — Kapitalindskud: pinden skal kunne køre BEGGE veje ⭐ vigtigst

Ejeren kan skyde egne penge ind i klubben. Tre mulige former — **anbefaling:
byg (b) som hovedgreb**, fordi den lukker balancepindens sløjfe:

- **(a) Direktørlån.** Du låner klubben penge; den skylder dig dem. Skaber en
  beslutning senere ("kalder jeg lånet hjem, eller eftergiver jeg det for
  tillid?"). Meget engelsk. Kan komme som smagsgiver i v2.
- **(b) Nyemission — DIN andel stiger** ⭐. Du indskyder kontanter og får nye
  aktier; medejerne udvandes. Så bliver E2 en sløjfe: sælg 49 % ved stiftelsen
  for en krigskasse, køb dig tilbage op gennem karrieren med det, du selv har
  tjent. Prisen pr. procent skal være **dyrere end stiftelsesrabatten**
  (`BAL.e2.startDiscount` 0,55), ellers er der en arbitrage: sælg billigt, køb
  billigt tilbage. Brug klubvurderingen × en præmie ≥ 1,0.
- **(c) Gave.** Pengene er væk; du får tillid (`bumpTrust`) og fanhumør. Enkel,
  men uden strategisk dybde.

**Værn (vigtigt — økonomitrappen må ikke miste tænder):** loft pr. sæson
(`BAL.capital.maxPerSeason`), og medejerne skal sige ja (tillids-gate) ved
nyemission, ellers kan enhver krise købes væk. Måltallene for administration
(~0-1 pr. karriere) og bank-ultimatummer skal holde i 20×5 EFTER pakken — hvis
administrationer falder til nul overalt, er værnet for løst.

**Invariant `checkCapital`** (sabotér hver):
1. Indskuddet flytter penge fra `personalWealth` til `G.balance` — beløbet er
   præcist, og ingen af de to må ændre sig mere end det.
2. Ved nyemission stiger `myShare` og medejernes andele falder, og summen er
   stadig 100 (kør `checkInvariants`).
3. Loftet bider: andet indskud over `maxPerSeason` afvises.
4. Prisen pr. procent er DYRERE end stiftelsesrabatten (ingen arbitrage) —
   regn den ud af BAL, aldrig af koden selv.

## Pakke PENGE-2 — Køb medejere ud med DINE penge

Ret skævheden ovenfor: opkøbet skal (kunne) betales af `personalWealth`. Enten
som ren omlægning, eller — federe — som et **valg** med to konsekvenser: klubbens
kasse (svækker sæsonens budget) eller din egen formue (tømmer krigskassen).
Dette er det direkte modtræk til pinden: solgte du 49 %, kan du købe dem tilbage.

Bemærk `ownerGate()`: opkøb er allerede spærret før sæson 3 og ét pr. sæson.
Overvej om PENGE-1(b)'s nyemission skal have samme spærring — den er en anden
vej til det samme mål, og to veje der ikke kender hinandens regler er præcis den
slags hul en gate finder.

**Invariant `checkBuyoutFunding`:** pengene kommer fra den valgte kilde og KUN
den; ejerandele summer til 100; sæson-spærringen gælder begge veje ind.

## Pakke PENGE-3 — Invest-aktiverne skal holde karrieren ud

Tre problemer i den nuværende tabel (`BAL.invest.assets`):

1. **Ingen ægte risiko.** `settleInvest` regner `yield * (1 ± swing)` — agenturet
   (18 % ± 50 %) giver altså mindst 9 % i plus. Intet aktiv kan tabe penge, så
   "fede år og magre år" er tekst, ikke matematik. Fix: lad udsvinget kunne
   overstige afkastet (fx `swing` som absolut spænd omkring nul-linjen), så et
   dårligt agentur-år koster penge.
2. **Akademiet er strengt dårligst.** Dyrest (£500k) og lavest afkast (9 %) uden
   modydelse. Fix: giv det en **klub-fordel** — fx en ung spiller til truppen
   hvert sæsonskifte eller hurtigere udvikling — så det er et strategisk valg og
   ikke en dårlig obligation.
3. **De falmer.** Faste priser mod en klubøkonomi der skalerer ~80× gennem
   divisionerne: £300k er en stor beslutning i League Three og lommeuld i
   Premier. Fix: skalér pris OG afkast med pengetrappen (`divCashMult`-mønstret),
   eller indfør niveauer, så aktiverne kan udbygges.

Tilføj gerne et **billigt aktiv** (£60-80k), så en 51 %-formand har mere end ét
valg i sæson 1.

**Invariant `checkInvestRisk`:** over mange afregninger findes der BÅDE plus- og
minusår for et risikabelt aktiv (mål via `H.call("settleInvest")` i en løkke med
seedet RNG); akademiets fordel udløses målbart; prisen skalerer med divisionen.

## Pakke PENGE-4 — Ejer-livet som aktivt forbrug

I dag kommer ejer-livet TIL dig (O3). Lad dig også **opsøge** det: sponsorér
byens juleoptog, betal supporternes bus, køb huset på bakken. Hvorfor det er
mere end pynt: omdømme er porten til imperiet (`BAL.stake.gateRep` 55) — så
kontanter brugt på navnet i sæson 1 er *investering i sæson 2's ambition*. Det
giver kontantsiden et mål allerede før dørene åbner.

## Pakke PENGE-5 (senere) — Privat infrastruktur & netværk

- Betal en tribune/faciliteten af egen lomme: klubben får muren, du får regningen
  og godviljen.
- Agent-retainer: private penge køber relation (T3 `agentRel`) og dermed bedre
  handler.
- Privat spejdernetværk: penge køber SYN — hænger sammen med E5 (skjult
  potentiale som ejer-beslutning).

## Rækkefølge (anbefalet)

**PENGE-1(b) → PENGE-2 → PENGE-3 → PENGE-4.** De to første gør balancepinden til
et ægte valg fra dag ét; de to sidste holder pengene relevante hele karrieren.

---

# DEL 2 — NAVNENE (klar til at bygge, analysen er lavet)

## Baggrund: licens

Rigtige klubnavne (Arsenal, Liverpool …) er registrerede varemærker. Spillet
udgives offentligt og sigter mod App Store, så de kan ikke bruges uden licens.
Andre mobilspil gør det alligevel — de har typisk ingen licens, forvansker
navnene let ("Manchester C"), undgår bomærker og spillerfotos (der håndhæves
hårdest), eller lader BRUGEREN indtaste navnene. Vi vælger den sidste model —
som feature, ikke som smuthul.

## Pakke NAV-1 — Klubnavne der lyder engelske, uden at være rigtige klubber

**Fundet der skal rettes:** den nuværende pulje kan producere EKSISTERENDE
klubber. `TOWN1` indeholder Harlow, Ashford, Eastleigh, Tilbury, Millbrook,
Netherfield og Stanmore, og med `TOWN2` bliver det til **Harlow Town**, **Ashford
United**, **Eastleigh** og **Tilbury** — alle rigtige engelske klubber. De skal
ud af puljen.

**Selve grebet:** i engelsk fodbold er over halvdelen af de øverste klubber ét
ord (Arsenal, Everton, Fulham, Chelsea), mens de lavere rækker er fulde af
Town/United/Rovers. Spillet sætter i dag ALTID et suffiks på — dét er det, der
føles forkert.

Byg `clubName(div)`:
- blander **bare stednavne** (opdigtede, engelsk-klingende: Ashcombe, Draycote,
  Fenwick, Barleigh …) med suffiks-navne,
- **vægtet efter division**: flere étords-navne i toppen, flere Town/United i
  bunden (genskaber virkelighedens fordeling — `genClub(div)` kender allerede
  divisionen),
- bevarer unikhed (`used`-sættet findes allerede).

**Kaldesteder der skal opdateres (alle fire):** `newGame` (verdens fødsel),
`ensureWorld` (migration af gamle karrierer), `obDiceClub` (introens terning) og
introens standardnavn i `obData`.

**Invariant `checkClubNames`** — læg en **`REAL_CLUBS`-blokliste i harness'en**
(ikke i spillet) med de rigtige klubnavne, og kræv:
1. verdenens 56 navne indeholder BÅDE bare og suffikserede navne (featuren er i
   live — sabotér: tving suffiks på altid → rød),
2. INTET navn står på blokliste-listen (sabotér: læg "Harlow" tilbage i puljen →
   rød),
3. alle navne er unikke.

## Pakke NAV-2 — "Omdøb klub": din verden, dine navne

Spilleren kan omdøbe **enhver** klub i sin verden — sin egen (navn + skjoldets
initialer) og verdensklubberne fra Imperiet. Det er både en god tycoon-feature
og hele licens-svaret: vi udgiver opdigtede navne, spilleren skriver selv, hvad
de vil have.

Krav:
- `safeName()` saniterer (findes allerede), unikhed håndhæves mod ALLE klubber i
  verden,
- egen klub: `G.club` **og** `G.badge` (initialer) opdateres,
- `G.holdings[wid].name` følger med, hvis en kontrolleret klub omdøbes,
- navnet overlever sæsonskift/`applyPyramidExchange` og gem/indlæs (det bor på
  klubobjektet, så det burde det gøre — men det skal MÅLES),
- UI: knap på Imperium-kortene og på egen klub. Følg `DESIGN-SYSTEM.md` (ét
  tydeligt fokuspunkt, genbrug eksisterende komponenter).

**Invariant `checkRename`** (sabotér hver): omdøbning af egen klub ændrer navn OG
skjold · et navn der allerede findes afvises · en omdøbt verdensklub hedder
stadig det nye navn efter et sæsonskifte og efter `saveGame`/`loadGame` ·
holdings-navnet følger med.

---

# Verifikation (gælder alt ovenstående)

Grøn = `REGRESSION_OK`. Efter HVER pakke: `--stats` mod gulvtallene — netto S1
±£2k · indtjening S1 £100-260k · store kampe 3-5 · administration lav ·
oprykning S1 i båndet. **Pengepakkerne rører ved kluboekonomien og skal
kontrolleres ekstra hårdt:** hvis administrationer og bank-ultimatummer falder
markant efter PENGE-1, er værnet for løst, og trappen har mistet sine tænder.
200×20 `--bot=both` før master-merge, og cache-bump i `index.html` ved hver
udgivelse.
