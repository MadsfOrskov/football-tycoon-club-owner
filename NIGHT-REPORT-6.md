# NATRAPPORT 6 — Robusthedsrunden: R1-R7 bygget

*Session 9-10/8 2026 · branch `claude/nightly-trupdybde-t1-t4-xvhppp` · syv pakker fra WORKPLAN-ROBUST, hver med egen commit, hver målt.*

## TL;DR — hvad kan du mærke med det samme

- **Hele spillet taler dansk** (R5). Nav, knapper, modaler, beslutninger, systemtekst — alt. Kampkommentarens replikker og flavor er stadig engelske MED VILJE (egen pakke, se "det udestående").
- **Kampkommentaren er halveret** (R4): median 8 linjer pr. kamp mod ~12-18 før. Mål og kort/skader vises altid; det er kun flavour der viger.
- **Introen starter med DIG** (R6): navn, portræt og baggrund før klubben overhovedet får navn.
- **Tre systemer er væk** (R1): stadionfonden (banken ER finansieringsvejen), træningsfokus, mentor-par og sponsor-stuntet. Færre knapper, ingen dobbelt bogholderi. Gamle karrierer beholder fondens penge — de foldes ind i kassen ved indlæsning.
- **Premier er en kamp nu** (R7): de to øverste divisioner er markant stærkere, og topklubberne køber selv hvert sæsonskifte.
- **Udbyttet blinker** sidst på sæsonen (R3-finpuds fra tidligere i aftes) og budgetmødet er ét trin kortere.

## Pakkerne

| Pakke | Hvad | Målt |
|---|---|---|
| R1b | Stadionfonden fjernet — banken er eneste finansieringsvej. Budgetmødet 5→4 trin. loadGame folder gamle fondspenge tilbage i kassen | tillidstrappen uændret (15/10/11/12% mod 15/12/4/11%); tribune bygget 20/20 seeds; indtjening S1 £178k |
| R1c | Træningsfokus, mentor-par og sponsor-stunt ud (tre knapper uden reelle valg) | trup-snit 14.43 mod 14.56; alle måltal i bånd; ingen kompensation nødvendig |
| R4 | Kommentar-loft: BAL.text.tickerMax=8, nearmiss/momentum udtyndet, flavor-puljer strammet til én sætning, sub-linjer kun på mål | linjer pr. kamp median 8 (før ~12-18) — ny fast måling i --stats |
| R5 | Dansk UI over hele fladen (begge lag, alle modaler, onboarding, crash-skærm). Harness-tekstkoblinger fulgte med i samme commit | 6×4 og 20×5 grønne med UÆNDREDE seed-resultater — ren tekst, ingen RNG-berøring |
| R6 | Intro-rækkefølgen vendt: (1) dig → (2) arven/klubnavn → (3) farve → (4) look → (5) gaffer | onboarding-driveren i harness gik selv igennem |
| R7 | topLift {1:+3, 0:+8} oven i divisions-trappen · topBuy: div 0-1 klubber forstærkes hvert sæsonskifte (loft 88) · flytninger bærer løftet som DELTA | Premier-slut 6/19 → 3/20 på samme seeds; Premier-slutkasser fra op til £1.1M ned til £131-506k; ingen karriere over £570k; S1-økonomi urørt |

Dertil fra tidligere på aftenen (samme branch, allerede rapporteret løbende): R2 (crash-skærm + karriere-koder) og R3 (udbyttet som kort, variant B+).

## Sabotagerne — hvad der faktisk blev efterprøvet

- **R4:** tre veje: trimTicker som no-op → rød; en trim der dropper mål → rød; kaldet fjernet fra choosePrematch → den levende kobling i driveTicker rød. Alle tre efterprøvet før pakken blev committet.
- **R7:** to LÆRERIGE runder. Første udgave af invarianten målte divLift mod divLift — og bestod sin egen sabotage (koden mod sig selv beviser ingenting). Forventningen bygges nu af BAL direkte. Og toppen-køber-tjekket krævede skarpt `>` før det kunne fange en død topBuy-løkke ('>=' lod en no-op bestå).
- **R1/R5/R6** er fjernelser/tekst/omrækkefølge — eksisterende invarianter (inkl. R3's udbytte-kort og M2.5's to-lags-tjek) blev opdateret og holdt pakkerne ærlige; R5 væltede fem tekst-koblede invarianter undervejs, som alle blev rettet i samme commit som teksten.

## Fundet undervejs (ikke bestilt, men rettet)

- **Budgetmødets replikker stod forskudt** efter R1b: fondstrinnets ordlyd ("The ground, chairman") lå på målsætningstrinnet. Rettet i R5-committet.
- **checkObjectiveDeal pegede på det gamle trinnummer** (step 3 → 2) — fundet af 6×4-kørslen umiddelbart efter R1b.

## Det udestående — ærligt

1. **Flavor på engelsk** (R5's anden halvdel): kampkommentar-puljerne, gaffer/agent/bestyrelses-replikker, aviser, fan-citater, storkamps-etiketterne (FINAL DAY, SIX-POINTER …) og vejrnavnene. Vejret og etiketterne er NØGLET i tag-systemet og harness'en — de skal flyttes samlet i én pakke med tonecheck ("kunne det stå i en ægte dansk lokalavis?").
2. **R8-R11 venter:** FA Cup i kalenderen (egen nat — rører fixtures-invarianterne), klubmægler + Invest-fanen, karriere-arkiv & milepæle, PWA + 3 gemmepladser.
3. **M3** (direktører + klub nr. 2 for alvor) står stadig i WORKPLAN-MOGUL.
4. **R7 er strammet ved 20 sæsoner** — 12-20-sæsoners-karrierer ser rigtige ud, men den halve nat kan ikke bevise 30+. topBuy gør toppen hårdere år for år; hold øje med om League One-playoffs bliver FOR hårde i meget lange karrierer.

## Verifikation

- Hver pakke: `node --check` + 6×4/10×5 grøn før commit; balancefølsomme pakker (R1b/R1c/R4/R7) målt med 20×5 eller 20×12/20×20 `--stats` mod gulvtallene.
- Gulvtal ved sidste måling: netto S1 −£897 (mål ±£2k) · indtjening S1 £184k (mål £100-260k) · store kampe 4.1 (mål 3-5) · admin 0 · oprykning S1 12/20 · linjer pr. kamp median 8.
- **Slutgate: 200×20 `--bot=both` GRØN — 0 fejl af 400 kørsler.** Første gate-forsøg fandt 2/400 falske røde i den nye R7-invariant (støjtolerance på én verdensfødsel); invarianten måler nu over tre fødsler (~5 sigma til begge sider), sabotagen blev efterprøvet igen, og hele gaten kørte forfra — grøn.
- Slutdivision ved 20 sæsoner efter R7: sane-bot Premier **15 %** (før 37 %), lazy-bot **45 %** (før 59 % i M2.5-gaten). Begge profiler klatrer stadig — de bliver bare ikke længere kronet pr. automatik.
