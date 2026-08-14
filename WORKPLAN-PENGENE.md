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

## LÅST med Mads 14/8 — svarene på de fire spørgsmål

### 1. Ja, man skal kunne tabe det hele — men det skal være "ens egen skyld"

Mads' ord: *"det skal være fordi man træffer nogle satsede valg hvor det er
belyst, at man kan tabe det hele."* Det er mekanikkens vigtigste regel, og den
er en **UI-kontrakt**, ikke kun en talregel:

- **Ingen skjult ruin.** Et aktiv må aldrig gå i nul uden at kortet PÅ FORHÅND
  har sagt, at det kunne. Hvert aktiv bærer et synligt risikoniveau
  (fx *solid · risikabel · vovet*) med sit udfaldsrum skrevet frem: "bedste år
  +120 % · værste år −60 %".
- **Ordene skal stå der, hvor de er sande.** "Du kan tabe hele indskuddet" på
  vovede projekter; "du kan tabe MERE end du lægger" på gearede (se PENGE-3).
- **En forsigtig portefølje må aldrig udslette dig.** Ruin skal kun kunne nås
  gennem valg, der var mærket som farlige. Det er målbart — se invarianten
  `checkNoHiddenRuin` nedenfor.
- Varslerne undervejs i projekter (1b) hører til samme kontrakt: du skal kunne
  SE det gå galt og nå at handle, ikke få beskeden når pengene er væk.

### 2. Ja, nogle aktiver må røre fodbolden — men de skal ændre en BESLUTNING, ikke et tal

Faren er, at et fodbold-koblet aktiv bliver en **obligatorisk opgradering**:
giver hotelkæden +8 % kampdagsindtægt, køber enhver fornuftig spiller hoteller,
og så er det ikke diversificering — det er en fodboldopgradering med ekstra
trin. Samme fejl som akademiet, der i dag bare er en dårlig obligation.

**Reglen:** koblingen skal være *situationsbestemt, tveægget og lille* — og
helst skabe et dilemma frem for en bonus. Gennemtænkte eksempler:

- **Jord omkring stadion** ⭐ bedst. Ejer du jorden, bliver en fremtidig
  tribuneudvidelse billigere — eller du kan sælge grunden dyrt, når klubben
  vokser. Ingen bonus, kun et ægte valg: kontanter nu eller plads senere.
- **Lokalavis/radio.** Dæmper skandalers *styrke* (ikke deres eksistens) og gør
  omdømme billigere at bygge. Bagsiden: byen ved, hvem der ejer avisen — en
  dårlig sæson får hårdere medfart andre steder, og medejerne ser spin frem for
  resultater (tillid falder lidt).
- **Hotelkæde.** Betaler kun ekstra på STORE kampdage (situationsbestemt, og
  vokser kun hvis du bliver ved at investere).
- **Fitnes-/klinikkæde:** frarådes — hurtigere skadesheling er en ren
  fodboldopgradering og bliver obligatorisk.

### 2b. KORRELATION — den bedste idé i hele pakken

Aktiver skal være forskelligt **bundet til klubbens skæbne**:

- **Lokale aktiver** (hoteller ved stadion, pubber, jorden, avisen) stiger og
  falder MED klubben: fantastiske når du klatrer, brutale ved en nedrykning.
- **Fjerne aktiver** (rederi, whiskylager, kunst, udenlandsk ejendom) er
  upåvirkede — kedeligere, men de holder, når fodbolden brænder.

Teknisk er det billigt: en `corr`-faktor pr. aktiv, der ganges med klubbens
udvikling (division/omtale) i afregningen. Spillermæssigt er det hele lektien om
diversificering, uden et eneste ord undervisning: den formand, der har bygget
alt op omkring sin egen by, mister det hele samtidig med klubben. Det skal
skrives ÆRLIGT på kortet ("følger byens gang"), jf. regel 1.

### 3. Gearing — se PENGE-3 nedenfor (eksempler efterspurgt af Mads)

### 4. Medejer-opkøb betales af DIN egen kasse

Mads' ord: *"hvis JEG køber en større andel af klubben skal det selvfølgelig
være fra min egen kasse og ikke klubbens."* `ownerNegoSubmit` trækker i dag
beløbet fra `G.balance` — det skal være `personalWealth`.

Husk følgevirkningerne, ellers går gaten rød:
- harness'ens bot (`doOwnerBuyout`) gater i dag på `G.balance` og
  `workingCapital()` — den skal gate på formuen i stedet,
- invarianten `checkOwnerBuyout` måler klubkassen — den skal måle formuen,
- afvisningsteksten ("banken sagde nej") skal omskrives: det er DIN konto, der
  ikke rækker.

Bemærk at det passer smukt med balancepinden: den, der solgte 49 % ved
stiftelsen, har præcis de kontanter, det kræver at købe dem tilbage senere — og
den, der beholdt 100 %, har hverken medejere at købe ud eller behov for det.

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

# PENGE-3 — GEARING: at låne mod formuen (eksempler, låst retning mangler)

*Mads bad om eksempler. Fælles regel: gearing hører under regel 1 — ordene "du
kan tabe MERE end du lægger" skal stå på kortet, før man trykker.*

**Balancekravet der gør gearing til et valg og ikke en gratis multiplikator:**
gearede varianter skal have **lavere forventet værdi** end ugearede (renten
koster), men en meget federe hale. Ellers tager enhver fornuftig spiller altid
gearingen, og så er det ikke et valg.

### A. Kassekredit hos privatbanken
Du kan trække op til fx 40 % af din **formues værdi** (ikke kun kontanter) som
kredit. Rente hver sæson. Falder formuen under et gulv, **kalder banken lånet**
— og du tvinges til at sælge aktiver til brandudsalgspris. Det er den reneste
form: den gør en nedtur til en spiral, du selv har åbnet døren for.

### B. Pant i et konkret aktiv
Belån hotelkæden: du får ~60 % af værdien udbetalt nu, kædens afkast går til at
betale renten, og kan du ikke betale, **overtager långiveren kæden**. Mere
konkret end en generisk kredit — du kan mærke, hvad der er stillet i pant.

### C. Gearet projekt ⭐ det bedste greb
Havneprojektet koster £2M. Du lægger £600k og låner resten. Lykkes det, er
afkastet på DIN indsats enormt; fejler det, **skylder du stadig lånet**. Det er
regel 1 i sin reneste form, og kortet siger det med rene ord.

**Anbefaling: byg gearing som tre finansieringsveje på PROJEKT-kortet** frem for
som et separat lånesystem:

| Vej | Risiko | Udfald |
|---|---|---|
| **Egen kasse** | du kan tabe indskuddet | 1,6-2,5× / delvis / 0,3-0,6× |
| **Med partner** | halv indsats, halv gevinst | mildere i begge ender |
| **Gearet** | du kan tabe MERE end du lægger | meget federe top, gæld ved fiasko |

Ét beslutningspunkt, tre risikoappetitter, og ordene står på kortet. Det er
langt mindre kode end et fuldt lånesystem og giver 90 % af følelsen.

### D. Den grå investor (v2 — kræver sit eget indhold)
Billige penge fra en mand, der vil have noget til gengæld senere: indflydelse,
en tjeneste, en andel, tavshed. Stærk RPG-krog og meget fodbold — men den skal
have skrevet indhold og konsekvenser, så den hører ikke med i første pakke.

---

# PENGE-4 — Kampen skal simuleres, når du IKKE er inde i klubben (Mads 14/8)

*Mads' fund under spil: "Når man ikke er inde i en klub, skal man ikke blive
spurgt om de ting inden kamp. Altså at gafferen venter på ens ord. Der skal
kampen bare simuleres — det er kun hvis man er inde i klubben, at man kan have
den samtale."*

**Årsagen er fundet — det er tre UNDTAGELSER i M2.5-reglen**, ikke en manglende
regel. Alle tre steder tjekker `G.layer==="owner"`, men med et hul:

| Sted | Kode i dag | Hullet |
|---|---|---|
| Før kamp | `if(G.layer==="owner" && !match.isPlayoff)` → auto-ordre | **playoffkampe spørger stadig** |
| Ticker | `if(G.layer==="owner" && !match.big && !match.isPlayoff)` → spring over | **store kampe OG playoffs vises minut for minut** |
| Halvleg | samme betingelse | **samme** |

**Rettelsen:** fjern undtagelserne, så reglen bliver én sætning uden huller —
*står du i ejer-laget, spørger ingen dig om noget, og kampen afvikles; går du
IND i klubben, får du hele samtalen.* Det er også mere robust: undtagelserne er
præcis dét, der skaber "hvorfor spørger den mig nu?"-forvirring.

**Bevidst konsekvens:** man kan så ikke længere se en playoff-finale eller et
derby minut for minut hjemmefra. Det er den rigtige pris — vil du være der, går
du ind i klubben. Det er hele tilstedeværelses-modellen (M2.5), og den bliver
skarpere af, at et besøg BETYDER noget.

**Invariant `checkPresenceRule`** (sabotér: læg en af undtagelserne tilbage →
rød): fra ejer-laget åbner en kampdag ALDRIG en prematch-modal og aldrig
tickeren — heller ikke ved en stor kamp, heller ikke i et playoff; og inde i
klubben gør den ALTID. Botten skal spille begge veje (den gør det allerede via
`--bot=both`s to profiler — sørg for at scenariet med playoff hjemmefra bliver
ramt).

---

# PENGE-2 — Ejer-livet som aktivt forbrug (mindre pakke, bygges efter porteføljen)

I dag kommer ejer-livet TIL dig (O3): et event dukker op, du siger ja eller nej.
Lad dig også **opsøge** det — sponsorér byens juleoptog, betal supporternes bus,
køb huset på bakken. Hvorfor det er mere end pynt: omdømme er porten til
imperiet (`BAL.stake.gateRep` 55), så kontanter brugt på navnet i sæson 1 er
*investering i sæson 2's ambition*. Det giver kontantsiden et mål, allerede før
klubdørene åbner.

---

# DEL 1B — STYRKE & FORVENTNINGER (Mads 14/8)

*Mads' spørgsmål: hvor meget logik er der bag, hvor godt ens hold er mod
modstanderne? Kan man se ligaens klubbers samlede niveau og sit eget — og kan
man bygge logik om, hvor ofte man BØR vinde, og dermed om forventninger?*

## Hvad der ALLEREDE findes (målt i motoren, ikke gættet)

**Der er én fælles skala — den er bare usynlig.** `myStrength()` koger din
bedste XI ned til et att/def-par (angreb: 50 % angribere, 35 % midtbane, 15 %
forsvar; forsvar: 35 % målmand, 45 % forsvar, 20 % midtbane; plus form,
selvtillid, trænerbonus og anførerbonus). AI-klubberne har tre flade tal på
klubobjektet: `att`, `def`, `phy`. **Begge sider går ind i den SAMME
subtraktion** i `myLambdas`: `(min att − hans def)/24` giver mine forventede
mål, `(hans att − min def)/24` giver hans. En styrketabel er altså ikke et nyt
system — det er at VISE det tal, der allerede afgør hver eneste kamp.

Målt ved sæsonstart i League Three: din XI ligger på **att 57,1 / def 58,2**,
ligaens 13 AI-klubber på **att 55,2 (spænd 52-60) / def 54,2**. Du starter
altså bevidst en anelse over gennemsnittet — det svarer til kommentaren i
`genClub` om, at formandens XI bærer en systematisk fordel.

## Hvad styrke KØBER (40.000 kampe pr. punkt gennem spillets egen `myLambdas` + `poisson`)

`diff` = hvor mange point stærkere du er i begge ender. Neutral tilgang, intet vejr.

| diff | hjemme W/D/L | ude W/D/L |
|---|---|---|
| −12 | 18 / 26 / 56 | 11 / 21 / 68 |
| −8 | 25 / 27 / 47 | 16 / 24 / 60 |
| −4 | 33 / 28 / 39 | 23 / 26 / 51 |
| **0** | **41 / 28 / 31** | **30 / 28 / 43** |
| +4 | 50 / 27 / 23 | 38 / 28 / 34 |
| +8 | 59 / 25 / 17 | 46 / 27 / 27 |
| +12 | 67 / 22 / 11 | 55 / 26 / 19 |
| +20 | 82 / 15 / 3 | 71 / 20 / 9 |

**Læsningen:** ~4 styrkepoint ≈ **+9 procentpoint sejrsrate**. Hjemmebanen er
værd ~11 procentpoint. Og hele League Threes spænd er ca. 8 point — så
afstanden fra ligaens bund til dens top er forskellen mellem 25 % og 59 %
hjemmesejre. Motoren er altså *følsom*: trupkvalitet afgør virkelig noget.

## Hullet: forventningen er BLIND for din trup

`DIV_OBJECTIVE` er en **konstant pr. division** — `{L3:8, L2:10, L1:9, PL:7}` —
justeret af medejernes personlighed og fanhumøret. Intet andet.

**Målt bevis:** jeg lagde +25 på ATT, DEF og PHY hos ALLE spillere i truppen og
kaldte `ownerDemandPos()` igen. Kravet var **uændret: top 8**. Bestyrelsen beder
om det samme, uanset om du har ligaens bedste eller ringeste trup. Det er
formentlig spillets største realisme-hul lige nu: en bestyrelse, der ikke kan se
sin egen trup.

(Bemærk også kuriositeten: L2 kræver top 10, men L1 kræver top 9 og PL top 7 —
rækken er ikke monoton. Det er formentlig tunet, men det bør efterses samtidig.)

## Pakke STYRKE-1 — Styrkeindekset: vis tallet, der allerede afgør kampene

**a) Ét stabilt indeks pr. klub, samme skala for dig og AI.** Vigtigt: brug
IKKE `myStrength()` til tabellen — den indeholder form, selvtillid, træner og
anfører, så tabellen ville hoppe hver uge. Byg `squadRating()`: ren evne fra
bedste XI (samme vægte, uden form/conf/coach/leader), så den er sammenlignelig
med AI-klubbernes rå `att`/`def`. Vis eventuelt formen som et separat, lille
udsving ved siden af.

**b) Usikkerhed frem for facitliste.** Du skal ikke kende rivalernes præcise
tal. Vis et **bånd**, der bliver smallere med spejderarbejde/omdømme — præcis
som T2's skjulte potentiale allerede gør for spillere. Ellers bliver
styrketabellen en løsning på spillet frem for information om verden.

**c) Forventet placering.** Ranger ligaen efter indeks → din forventede
placering falder ud af det. Så bliver `ownerDemandPos()`:
*forventet placering justeret af bestyrelsens ambition* (personlighed, humør,
tillid) i stedet for en konstant. Konsekvenser der SKAL tænkes med:
- **Køber du stjerner, stiger barren.** Realistisk og spændingsskabende, men må
  ikke straffe det at bygge: lås forventningen til styrken ved SÆSONSTART
  (ikke løbende), så en januar-forstærkning ikke flytter målet midt i sæsonen.
- Overpræstation mod forventning er dét, der bygger tillid — den kobling
  findes allerede i `finishSeason` og bliver bare mere ærlig.
- Måltallene i `--stats` (oprykning S1 i sit bånd, administrationer lavt) skal
  holde EFTER ændringen; en dynamisk målsætning kan let gøre alle sæsoner lette
  eller alle umulige.

**d) "Forventet resultat" før kampen.** Med den fælles skala kan prematch-arket
vise oddsene — og Mads' egen designreference har præcis "Expected result" på
næste-kamp-kortet. Men jf. designsystemets gyldne regel (premium, ikke
Excel-ark): vis det som en **læsning** ("favorit · jævnbyrdig · underdog") med
tallet tilgængeligt, ikke tre decimaler i ansigtet.

**Afhængighed den kodende agent skal kende:** AI-klubber har INGEN trup — deres
"niveau" ER `att`/`def`. Indekset er derfor broen, hvis man senere vil give
verden rigtige trupper (M5-skala). Direktør-drevne klubber (IMP2) driver
allerede deres `att`/`def`, så indekset forbliver levende af sig selv.

**Invariant `checkStrengthIndex`** (sabotér hver): indekset for din klub og for
en AI-klub ligger på samme skala (byt truppen ud med kendte tal og regn efter) ·
indekset ændrer sig IKKE af form alene, men ÆNDRER sig af rigtige køb/salg ·
forventet placering flytter sig, når truppen forbedres markant (den nuværende
blindhed skal være målbart brudt — det er selve pakkens løfte).

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
