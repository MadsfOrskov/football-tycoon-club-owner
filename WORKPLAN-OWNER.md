# ARBEJDSKØ — EJER-REDESIGNET: home er DIG, ikke klubben

*Skrevet efter en designsamtale med Mads. Spillet skifter linse: fra "styr denne klub" til "vær en fodbold-mogul, og klubben er ét aktiv i dit liv." Selvstændig: en frisk session skal kunne bygge herfra. Læs `Claude.md` og `koncept-...md` (GDD) først.*

## Vision (låst med Mads)
- **Home = mogulen (dig).** Øverst: dit navn + portræt + dit **Imperium** (samlet nettoformue) med trend. Derunder omdømme, relationer, ejer-beslutninger der venter, og en lille **"▶ Spil kampdag"-strip** (kampen kan stadig startes fra home, men er ikke helten).
- **Ny Klub-fane = holdet + anlæg.** Det gamle home-indhold (kamp-hero, stjerne, form, objektiv, sidste resultat, klubnyheder) flytter hertil, sammen med N8's Ground/Money/Board som underfaner.
- **RPG-dybde: ejer-livet.** En hel ny strøm af **events om DIG** — forfængeligheds-/livsstilsforbrug, rivaliserende ejere, velgørenhed, personlige omdømme-valg. Klubben er ét aktiv i et større mogul-liv.
- **Ejer-identitet: navn + portræt + startbaggrund.** Ved start navngiver du dig selv, vælger et portræt, og en baggrund (arving / selfmade / lokal helt) der giver en lille start-forskel.

## Ufravigelig ramme (samme som T/N-serien)
- Én pakke ad gangen. `node --check` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn, én commit pr. pakke. Alle tal i `BAL`.
- **Sabotér hver ny invariant først** (mål SPILLETS kode via `H.call`, aldrig en kopi).
- Nye modaltyper i **både** `handleModal` (spillet) OG `HANDLED_MODALS` (harness), sat + tegnet.
- **Økonomien er tunet.** Ejer-livets forbrug tager af DIN personlige formue (`personalWealth`), ikke klubkassen, så den tunede klubøkonomi ikke skrider. Efter hver pakke: `--stats`, bekræft netto/indtjening/store kampe/admin/oprykning holder.
- Før rapport: 200×20 `--bot=both` grønt.

## Genbrug frem for nyt (fundamentet findes)
- `G.personalWealth` (N5) = din kontante formue. `clubValuation()` × `myShare` = din equity.
- **Imperium/nettoformue** = `personalWealth + round(clubValuation()*myShare/100)`. Egen funktion `netWorth()` så den kan måles.
- Relationer findes: bestyrelsestillid (`trustLevel()`), fanstemning (`G.fanMood`), agent-forhold (`G.agentRel`, T3). Home ruller dem op.
- Omdømme (`G.reputation`, ny primitiv 0-100): drives af trofæer, fair handler, udbytte-grådighed, fyringer OG ejer-livets valg. Sælgere/agenter/bestyrelse kan reagere på den.

---

# Pakke O1 — Ejer-identitet + Imperium + omdømme (fundamentet)
*Backbone. Lav risiko. Alt andet hænger på den.*

**a) Ejer-identitet.** `G.owner={name, avatar, background}` (save-sikre primitiver). Onboarding får et trin: navngiv dig selv, vælg portræt (initial-badge i klubfarve eller en lille ansigts-liste), vælg baggrund.
**b) Baggrunde** (`BAL.owner.backgrounds`): fx `heir` (mere startkapital, lavere start-omdømme), `selfmade` (balanceret, hurtigere omdømme-optjening), `localhero` (fanstemning +, mindre kapital). Hver en lille, målbar start-forskel.
**c) Imperium.** `netWorth()` = personlig formue + equity. `G.netWorthHistory` (pr. sæson, som `valHistory`) til trend.
**d) Omdømme.** `G.reputation` (0-100). `reputationRead()` samler et tal/etiket. Bumpes af trofæer (+), fyringer (−), grådigt udbytte (−), fair agent-handler (+), velgørenhed (+, O3).

**BAL.owner (ny blok):** `backgrounds{...}`, `repStart`, `repTrophy`, `repDividendGreedy`, `repFairDeal`, `repFire`, `repCap`.

**Invariant (sabotér først):** to baggrunde giver målbart forskellig starttilstand (kapital/omdømme); `netWorth()` = personalWealth + equity (skift myShare → netWorth flytter); `reputation` clampet 0-100 og bumpes af en trofæ-handling. Sabotér ved at nulstille baggrunds-forskellen / equity-leddet → fejler.

---

# Pakke O2 — Mogul-home + Klub-fane (den store reframe)
*UI-restrukturering. Ingen ny økonomi.*

**a) Nav:** `Dig` (home) · `Klub` · `Trup` · `Marked` · `Tabel` · `Inbox`.
**b) Home (Dig):** portræt + navn + **Imperium** (netWorth + trend), **omdømme**, **relationer** (bestyrelse/fans/bedste+værste agent), **ejer-beslutninger der venter** (udbytte, opkøb, bank), lille **kampdags-strip**.
**c) Klub-fane:** ny "Hold"-underfane (det gamle home-indhold: kamp-hero, stjerne, form, objektiv, sidste resultat, nyheder) + N8's Ground/Money/Board.

**Invariant:** home indeholder IKKE længere kamp-hero'en som helt (den bor på Klub); `netWorth`/omdømme vises på home. Harness: `renderAllScreens` auditerer den nye nav + Klub-underfaner (som N8). Sabotér ved at fjerne netWorth fra home → fejler.

---

# Pakke O3 — Ejer-livet: events om DIG
*RPG-kødet. Store model.*

**a) En ejer-livstrøm** (fx 1 event pr. 2-4 kampdage, doseret): forfængeligheds-/livsstilsforbrug (køb en yacht/kunst → −personlig formue, +omdømme/prestige), **rivaliserende ejere** (en rival håner dig / byder på din klub / dueller om en spiller), **velgørenhed** (giv til lokalsamfundet → −formue, +omdømme +fanstemning), **personlige omdømme-valg** (presse-interview, skandale-håndtering).
**b) Alt tager af DIN formue** (ikke klubkassen), så klubøkonomien er urørt. Omdømme er valutaen der bygges.
**c) Konsekvens:** omdømme flytter priser/premier (opkøb, agenter) og bestyrelsespres — mærkbart, ikke kosmetisk.

**BAL.ownerLife (ny blok):** `every{min,max}`, event-vægte, forbrug/omdømme-tal pr. type.

**Invariant (sabotér først):** hvert ejer-event har en handling OG en konsekvens (som deadline-events), trukket fra rigtige entiteter (rivaler fra `G.teams`/andre ejere). Et forbrugs-event flytter `personalWealth` (ikke `G.balance`) og `reputation` målbart. Sabotér ved at gøre et event til en ren info-knap / lade det tage af klubkassen → fejler.

---

# Verifikation
Grøn = `REGRESSION_OK`. 200×20 `--bot=both` før rapport. `--stats`: bekræft at klub-økonomiens måltal (netto/indtjening/store kampe/admin/oprykning) er URØRT — ejer-livet må kun flytte personlig formue/omdømme. Afslut med en natrapport (målte tal, afvigelser, hvad der ikke kunne efterprøves) og push.
