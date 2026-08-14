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

## Mads' beslutning 14/8: NEJ til nyemission

Forslaget om at kunne købe flere aktier i egen klub er **forkastet** — det
udvander konceptet. Balancepinden er et **identitetsvalg**, ikke et løbebånd man
kan gå tilbage ad. Byg det ikke, og foreslå det ikke igen.

Det tematiske hul består (man kan ikke lægge egne penge ind i klubben, og et
medejer-opkøb betales af klubkassen) — men det er IKKE der, løsningen skal
findes. **Løsningen er, at pengene får deres eget liv uden for fodbolden.**

---

# PENGE-1 — PORTEFØLJEN: tre tidssignaturer ⭐ hovedpakken

*Mads' retning: "man skal kunne investere i nogle mere ikke-fodbold-agtige ting
og potentielt få et afkast eller tabe penge. Nogle af mulighederne skal være
flere sæsoners investering, andre skal være hurtigere, og nogle skal være noget
hvor man også kan bygge op (hotelkæder, f.eks.)".*

Kernen: du er **tycoon**, ikke kun klubformand. Klubben er ét volatilt aktiv;
porteføljen er dét, der gør dig til en formue frem for en fodboldmand. Den
afgørende forskel fra i dag (R9's tre flade aktiver) er, at aktiverne får
**forskellige tidssignaturer** — og at man **kan tabe penge**.

## 1a — KÆDER (byg op, betaler hver sæson)

Aktiver med **niveauer**, præcis som tribuner og faciliteter (`STANDS`/`FACS` er
det færdige mønster — genbrug det, inkl. `divCashMult`-skaleringen).

- Eksempler: **hotelkæde**, pubkæde (flyt R9's `pubs` herind), fitnesskæde,
  bilforhandlere, vaskerier.
- Hvert niveau koster mere og betaler mere. Niveau 1 skal være til at nå i
  sæson 1 (£60-150k), så en 51 %-formand kan starte ÉN kæde.
- Lav varians pr. sæson (det er drift, ikke væddemål) — men en nedtur kan ramme
  hele kæden på én gang, så det ikke er gratis vækst.
- **Sælges** til ~85 % (`sellFactor` findes allerede) — likviditet med et tab.
- Det er her "imperiet" bliver konkret: dit navn på en kæde med 8 hoteller.

## 1b — PROJEKTER (flere sæsoner, én stor afgørelse)

Penge **låst** i noget, der først afgøres om 3-5 sæsoner.

- Eksempler: ejendomsudvikling i havnekvarteret, kontorbyggeri, whisky-/vinlager,
  jord uden for byen.
- Du binder £X. Ved udløb afgøres det: **succes** (fx 1,6-2,5×), **halv succes**,
  eller **fiasko** (du får en brøkdel igen). Sandsynligheden er kendt på forhånd
  i grove træk ("risikabelt/solidt"), men ikke udfaldet.
- **Undervejs kommer der varsler** i nyhederne ("byrådet udskyder
  lokalplanen…") — så det er en historie med spænding, ikke et møntkast der
  afgøres i en tabel. Varslerne må gerne flytte oddsene lidt.
- **Kan sælges før tid til et stort tab** (fx 50-60 %) — og DÉT er mekanikkens
  bedste øjeblik: mægleren tilbyder en billig klub i sæson 3, men dine penge
  sidder i beton indtil sæson 5. Sælger du med tab for at slå til?
- Projekterne skal **vokse med formuen**: større projekter låses op, når du er
  rig nok, så menuen følger pengetrappen i stedet for at blive irrelevant.

## 1c — HURTIGE HANDLER (afgøres inden for sæsonen)

Et lille, rullende **marked** af væddemål — som transfermarkedet, men for penge.

- Eksempler: et parti whisky, aktier i et lokalt rederi, en væddeløbshest, et
  parti kunst, en container med noget tvivlsomt.
- 2-3 tilbud ad gangen, **friskes op hver sæson** (og delvist når man har taget
  et), så Invest-fanen er værd at besøge.
- Afgøres efter **4-8 kampdage** — altså midt i sæsonen, hvilket giver
  kampdagsrytmen en ekstra puls.
- Høj varians: fra −60 % til +120 %. Små beløb (£25-60k), så man kan tage flere.
- Det er her sæson 1's kontanter får noget at lave **allerede i uge 3**.

## Risikomodellen (gælder alle tre)

I dag regner `settleInvest` afkastet som `yield × (1 ± swing)` — udsvinget ligger
altså oven på et positivt afkast, så **intet aktiv kan tabe penge**. Det er hele
grunden til, at "fede år og magre år" er tekst og ikke matematik. Nyt krav:
afkastet skal kunne blive **negativt**, forskelligt pr. klasse:

| Klasse | Forventet pr. sæson | Udfaldsrum | Rytme |
|---|---|---|---|
| Kæder | +8-14 % pr. niveau | sjældne tabsår | hver sæson |
| Projekter | ~+12-18 % annualiseret | 1,6-2,5× / delvis / 0,3-0,6× | ved udløb (3-5 sæsoner) |
| Hurtige | ~+6-10 % i snit | −60 % til +120 % | 4-8 kampdage |

**Balancekravet:** porteføljen må aldrig gøre fodbolden ligegyldig. Måltallet
findes allerede — median net worth ved S21 er **£12M** (NIGHT-REPORT-8's
baseline). Vokser den til det mangedobbelte efter denne pakke, er afkastene for
høje. Mål det i 200×20 og skriv tallet i rapporten.

## Åbne spørgsmål til Mads (afklar FØR kodning)

1. **Skal porteføljen kunne gå i nul?** Anbefaling: ja, man skal kunne tabe det
   hele på dumme væddemål — E0's comeback-garanti sikrer, at karrieren aldrig
   låser.
2. **Skal nogle aktiver røre fodbolden?** Fx en lokalavis/radiostation der
   dæmper skandaler, eller en hotelkæde der løfter kampdagsindtægten. Mads sagde
   "ikke-fodbold-agtige", så anbefalingen er **højst ét eller to** med et blødt
   link — resten er ren diversificering.
3. **Personlig gæld?** At kunne låne mod formuen (gearing) er et oplagt v2-lag,
   men det hører ikke med i første pakke.
4. **Medejer-opkøb betales af klubkassen** — skal det laves om til dine egne
   penge? (Ikke det samme som nyemissionen Mads forkastede; opkøb findes
   allerede og er spærret før sæson 3.)

## Byggerækkefølge

**1c (hurtige handler) → 1a (kæder) → 1b (projekter).** De hurtige er mindst
kode og løser sæson 1-problemet med det samme; kæderne giver imperie-følelsen;
projekterne er den dyreste at balancere og bør bygges sidst, når de to andre er
målt.

## Invarianter (sabotér hver — mål SPILLETS kode via `H.call`)

- `checkPortfolioRisk`: over mange afregninger findes BÅDE plus- og minusår for
  et risikabelt aktiv (seedet RNG, mål via `H.call("settleInvest")` i løkke).
  Sabotér: fjern nedsiden → rød.
- `checkChainLadder`: hvert niveau koster mere og betaler mere; salg giver
  `sellFactor`; niveau 1 er til at betale for en 51 %-formand i sæson 1.
- `checkProjectClock`: et projekt afgøres PRÆCIST ved sin løbetid, aldrig før;
  førtidigt salg giver det aftalte tab; udløb rammer `personalWealth` og aldrig
  `G.balance`. Sabotér: fjern uret → rød.
- `checkQuickMarket`: markedet friskes op pr. sæson; et afgjort væddemål
  forsvinder; udfaldet ligger inden for BAL's spænd.
- Fælles: **alle pengestrømme rammer `personalWealth`, aldrig klubkassen** —
  det er ejer-lagets grundlov og skal måles i hver eneste probe.

---

# PENGE-2 — Ejer-livet som aktivt forbrug (mindre pakke, bygges efter porteføljen)

I dag kommer ejer-livet TIL dig (O3): et event dukker op, du siger ja eller nej.
Lad dig også **opsøge** det — sponsorér byens juleoptog, betal supporternes bus,
køb huset på bakken. Hvorfor det er mere end pynt: omdømme er porten til
imperiet (`BAL.stake.gateRep` 55), så kontanter brugt på navnet i sæson 1 er
*investering i sæson 2's ambition*. Det giver kontantsiden et mål, allerede før
klubdørene åbner.

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
