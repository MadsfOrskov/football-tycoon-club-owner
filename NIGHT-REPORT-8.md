# NATRAPPORT 8 — Vindermålet, den nye intro og navy-skinnet

*Session 13/8 2026 (fortsat) · branch `claude/nightly-trupdybde-t1-t4-xvhppp` · fem pakker i én udgivelse: M4 (milepæle & æraen), to gate-fixpakker, INTRO-1 (tre akter) og DESIGN-1 (design-systemet). Hver pakke egen commit, hver ny invariant saboteret først.*

## TL;DR — hvad kan du mærke

- **Karrieren har mærker nu** (M4): fem milepæle — den første million, net worth 10M, klub nr. 2, to klubber i toppen, comeback efter en tabt klub — fejres ÉN gang, bygger navnet og står i æra-opgørelsen sammen med formuens fulde billede, klubtallet og milepælstælleren.
- **Introen er tre akter** (INTRO-1, låst med Mads): DIG (navn med terning, portræt, baggrunds-arketyper) → ARVEN (klubnavn + farve på samme ark) → EJERSKABET (balancepinden, alene på arket). Mørk/lys og gaffer-infoskærmen er ude — **gafferen banker på som spillets første øjeblik** efter budgetmødet, med kassens ægte tal i replikkerne.
- **Navy-skinnet** (DESIGN-1): Mads' design system ligger i `DESIGN-SYSTEM.md` og er lov. Fast premium-palette (#08111F/#101C2D/#142338, accent #3D8BFF, pos/neg #35D07F/#FF5C67, guld #F5C451 = ejer-laget). Klubfarven er identitet (skjoldet), aldrig UI-tema. Lys tilstand findes ikke længere. Verificeret med rigtige skærmbilleder (Chromium, iPhone-mål) hele vejen fra intro til stadion.

## Gatens fund — to ægte spilfejl og tre prober der målte sig selv

**Slutgate 200×20 `--bot=both --stats`: GRØN — 0 fejl af 400.** To gates før den:

1. **Stablede skiver gjorde kontrollen negativt prissat** (2/400, ægte fejl): buyStake kan stable en minoritetspost OVER kontrolgrænsen uden at den bliver kontrol — og buyControl regnede så behovet negativt, så "købet" BETALTE køberen. Nu klippes behovet i nul, konverteringen er gratis (du ejer den jo), posten bærer HELE den stablede andel, og mæglerens handel har samme værn.
2. **Tre prober målte deres egen opstilling** (5/400): checkRenewals egne kald taltes som bottens politik (auditten kører kun under `--stats` — denne gate var den første fulde med `--stats` siden C3), checkStakes valgte købs-mål blandt klubber botten allerede ejede, og C4-probens faste 40'er kunne overhale en døende S21-trup. Alle tre bygger nu opstillingen relativt til karrieren.

## Målt (200×20, imperie-balancemålenes første baseline)

- Klubtallene står: netto S1 −£0,8–1,1k (mål ±2k) · indtjening S1 £117–172k (mål 100–260k) · store kampe 4,0–4,2 (mål 3–5) · admin ~0 · oprykning S1 12/20.
- **Imperiet leves** (sane, 200 karrierer à 20 sæsoner): 83 kontrolkøb · 230 klubskift · 63 af 200 karrierer ejede klub nr. 2.
- **Formuens fordeling ved S21** (sane): privat p25 £0,6M · median £1,8M · p75 £6,5M · max £704M. Net worth: p25 £4,7M · median £12,0M · p75 £30,2M. Lazy ligger lidt HØJERE (median £2,6M/£16,1M) — den der aldrig geninvesterer i truppen, sparer op; den der bygger, ejer kapacitet i stedet. Halen (max £0,7-1,3 mia.) er Premier-dynastierne — det er pengetrappens 80× i arbejde, ikke en fejl, men den skal holdes under opsyn når direktør-udbytter får flere sæsoner.
- **Milepælene virker som replay-krog**: 2,7–2,9 pr. karriere, 191–197 af 200 når mindst én.
- Politik-gates målt aktive for første gang i en fuld gate: fornyelser 36.546/0 · rater 3.283/0 · tynde salg 0/46.121.
- Sabotager denne runde: **8** (M4: 3 · gafferen: 2 · kontrol-klippet: 2 + pct-bæringen: 1) — alle røde som de skulle, før commit.

## Rettet efter Mads' playtest (samme aften)

Ejerskabs-arket var vokset ud over skærmkanten: intro-beholderen var `position:fixed`
og lodret centreret **uden scroll**, så låseknappen lå uden for kanten og ikke kunne
trykkes — man kom ikke videre i spillet. Reproduceret i browser på iPhone-mål (knappen
lå på y=864 i en 844px skærm, klikket timede ud), rettet ved at lade arket rulle
(`overflow-y:auto` + `margin:auto`, som centrerer når der er plads og aldrig klipper
når der ikke er). Verificeret på 320×568, hvor arket fylder 950px: det kan rulles, og
knappen virker. Samtidig røg de tre arketype-kort ud igen efter Mads' ord — **pinden
skal stå alene**.

## Det udestående — ærligt

1. **DESIGN-2 venter på Mads' referencebillede** (ChatGPT-linket er blokeret af miljøets netværkspolitik — billedet skal vedhæftes direkte).
2. Direktør-mandat v2 · E5 skjult potentiale · B3 sponsorer · D2 aldring med varsel · dansk flavor · R8 FA Cup · R10 arkiv · R11 PWA+3 slots · M5 (verden vokser).
3. Imperie-økonomien over 40+ sæsoner er stadig ubevist — baseline-kvartilerne her er målestokken næste gang.
