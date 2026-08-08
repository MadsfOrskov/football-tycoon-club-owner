# ARBEJDSKØ — TRANSFERMARKED-OVERHAULET: markedet skal blive et sted man glæder sig til

*Skrevet 8/8 2026 efter en kortlægning af det nuværende marked og en gennemgang af GDD'ens transfervision. Selvstændig: en frisk session skal kunne udføre den herfra uden yderligere kontekst.*

Læs `Claude.md` først. Læs derefter GDD'ens transfer-afsnit i `koncept-football-tycoon-club-owner.md` — den er sandheden, og dette overhaul indfrier dens egen vision, ikke nye idéer. `NIGHT-REPORT-4.md` er sidste nats status; koden på denne branch er den forenede nat 1-4-linje (nat 3+4 + completions + N1-rettelsen), grøn ved 200×20 på begge botprofiler.

**Arbejdsform:** én pakke ad gangen, `node --check proto-extract.js` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn, én commit pr. pakke. Alle balancetal i `BAL`. Nye modaltyper i **både** `handleModal` (spillet) og `HANDLED_MODALS` (harness), og de skal både SÆTTES og TEGNES (harness'ens statiske tjek fejler ellers).

## GDD'ens grundlov — gælder hver eneste linje
> **"Ingen nøgne transaktioner."** Hvis en handling kan reduceres til ét klik uden information eller modstand, er den ikke færdigdesignet. Hvert køb/salg er et vindue med kontekst, modspil og konsekvens.

## Ufravigelig ramme
- **Sabotér hver ny invariant, før du stoler på den.** Gør sabotageforsøget til første skridt: sæt den nye BAL-knap til 0 (eller neutralisér mekanikken) og bekræft at invarianten FEJLER, gendan, bekræft grøn. En invariant der ikke er set fejle, beviser intet. (Nat 3's N1 var netop en invariant der målte sin egen kopi og aldrig ramte spillet — gentag ikke den fejl: mål SPILLETS kode via `H.call(...)`.)
- **Økonomien er nøje tunet.** Markedet fodrer den (administration ~1/karriere ved 10×5, indtjeningsmål, trup-tal). Efter HVER pakke: kør `--stats` og bekræft at trappens og indtjeningens måltal ikke skrider. Et rigere/billigere marked må ikke blive en pengemaskine botten udnytter.
- **Hård stop kl. 04:00 dansk (02:00 UTC).** Skriv `NIGHT-REPORT-5.md` og push som allersidste handling — testagenten bruger den som færdigmarkør. (Sidste nat blev der IKKE skrevet en rapport, og QA stod stille i et døgn. Gentag ikke det.)
- **Du når måske ikke alle fire, og det er planlagt. T1 og T2 er gulvet** — de to der forvandler markedet. T3 og T4 er kronen. **To solide pakker slår fire halve.**

## Afhængigheder — byg IKKE på det, der hører til senere nætter
- **Scout-*præcision* i niveauer** hører til staben (nat 5's scout-tal). T2 bygger usikkerheds-substratet; læg en billig "read" ind, men byg ikke et scout-niveausystem.
- **Spiller-lån (ind/ud), Youth Day/akademi** er egne nætter. Youth Day KRÆVER T2 (skjult potentiale) som fundament — byg T2 rent, så den nat er let bagefter.
- **Fuld AI-budøkonomi med rigtige trupper** hører til pyramiden (nat 7). Byg kun den LETTE version her (rivaler snupper markedsspillere / byder på dine stjerner via de klubtal der allerede findes i `G.teams`).

---

# Pakke T1 — Én verden og en levende pris
*Den vigtigste pakke. Alt hænger på den. Store model.*

I dag genereres markedet af `genPlayer()` med `value = ov*ov*14 + støj` — en ren deterministisk kurve. Markedsspillere er anonyme, og prisen kan ikke læres. GDD: *"Alle spillere på markedet TILHØRER navngivne ligaklubber ... Ingen klubløse spøgelser"* og *"at lære markedet er en færdighed."*

**a) Spillere tilhører rigtige klubber.** Hver markedsspiller og hvert bud skal referere en klub i `G.teams` (felt `from`/`fromIdx`), skaleret til den klubs division/styrke. `refreshMarket()`/`marketFlow()` trækker fra navngivne klubber, så kvaliteten får RANGE i stedet for det hårde loft på base ≤ 61: en stærk klubs randspiller er dyr, en svag klubs bærende mand er inden for rækkevidde.

**b) En levende værdi.** Erstat `value = ov²·14` med en `playerValuation(p)`-funktion (egen funktion, så den kan MÅLES udefra — som `loanRate`, `cardRisk`, `easeMood`). Den skal læse:
- **overall × positionsknaphed** (er der mangel på angribere på markedet lige nu?),
- **alderskurve** (peak 25-29, fald fra ~31 — GDD's kurve),
- **form/selvtillid**,
- **restkontrakt** (1 år tilbage = billig, Bosman-presset; 3-4 år = dyr),
- **sælgerklubbens desperation** (kasse/behov — kilden til kuppet),
- skjult støj.

Forhandlingens `feeMin` afledes af den. **Rå pris findes stadig; strukturer (`BAL.deal`) er værktøjer.**

**c) Kuppet.** En klub i krise (lav kasse) kan dumpe en god mand billigt — sjældent og situationsbestemt, ikke en fast rabat. Det er *"et sidste-øjebliks kup fordi sælgerklubben mangler likviditet."*

**d) Konsekvens (seed til én verden).** `G.soldTo` registrerer allerede solgte spillere. Sælger du til en oprykningsrival, så lad den klub blive målbart stærkere til foråret (`att +`), som GDD lover: *"at sælge din topscorer til en oprykningsrival har en pris, du møder i foråret."*

**BAL.market (ny blok):** `posScarcity`, `ageCurve{peakLo,peakHi,declineFrom,declineRate}`, `contractYearsWeight`, `desperation{cashFloor,discount,chance}`, `noise`, `poolSize`, `freshPerWindow`, `rivalSaleAtt`.

**Succeskriterium (måles med --stats):** prisen varierer målbart på tværs af alder OG restkontrakt ved samme overall (ikke én fast kurve); ≥1 krise-kup optræder pr. N vinduer; markedsspillere har alle en `from`-klub der findes i `G.teams`.

**Invariant (sabotér først):** to spillere med samme `ov` men forskellig alder (fx 20 vs 32) har forskellig `playerValuation`; en spiller med 1 restår er billigere end samme mand med 3 år. Sabotér ved at fjerne alders-/kontraktleddet → invarianten skal fejle. Plus: hver `G.market`-spiller og hvert bud har en gyldig `fromIdx` ind i `G.teams`.

---

# Pakke T2 — Den skjulte gamble: potentiale du ikke kan se
*Den største enkelt-oplåsning af sjov. Store model. Forudsætning for Youth Day.*

GDD: *"Skjult potentiale: unge spilleres loft er usikkert — scouting indsnævrer intervallet, og det er hele gambling-spændingen i talentkøb."* I dag findes det slet ikke; alt er synligt.

**a) Skjult loft.** Unge spillere (alder < `talent.youngUnder`, fx 23) får et **skjult** `p.pot` (potentiale-loft over nuværende `ov`). Det tildeles ved generering (bredt spænd for de unge, smalt/nul for de ældre).

**b) Usikkerheds-bånd, ikke et tal.** Spilleren viser aldrig `pot`. UI viser et **interval** afledt af `p.scouted` (0 = bredt "kan blive 58-82", højere = smallere), bygget af BAL. Aldrig et præcist tal uden fuld read. (Præcisions-*niveauer* venter på nat 5's scout — byg kun den ene billige read her.)

**c) Udvikling respekterer loftet.** Udviklingsløkken (sæsonovergang, der hvor unge <24 allerede udvikles) skal bruge `pot` som loft: en spiller vokser mod `pot`, aldrig forbi. To spillere med identiske SYNLIGE stats kan derfor udvikle sig vidt forskelligt — gamblen.

**d) En billig read.** Genbrug det eksisterende `startScout`/`deliverScout`-spor (rewarded), men lad det nu INDSNÆVRE båndet på en konkret ung spiller i stedet for at spytte en billig gem ud. (Doseret som GDD: 1/vindue.)

**BAL.talent (ny blok):** `youngUnder`, `potSpread{young,old}`, `bandByScout[…]` (bånd-bredde pr. scouted-niveau), `devToCeiling`, `readNarrow`.

**Succeskriterium:** to spillere med samme synlige `ov` og alder har målbart forskellig faktisk udvikling over 5 sæsoner (pot-variansen slår igennem); en read indsnævrer båndet målbart; ingen spiller udvikler sig forbi sit `pot`.

**Invariant (sabotér først):** kør en ung spiller med lavt `pot` gennem udviklingen mange gange — `ov` overstiger ALDRIG `pot`. Sabotér ved at lade dev ignorere loftet → fejler. Og: `pot` må ALDRIG optræde i renderet markup (kun båndet) — statisk tjek som blindgyde-auditten, sabotér ved at printe `pot` → fejler.

---

# Pakke T3 — Agenter med ansigter
*Ren tone, uafhængig, høj værdi pr. indsats. Kan køres på mindre model.*

GDD: *"Agenterne er tonens bedste våben."* I dag er forhandlingen ansigtsløs.

**a) 5-6 navngivne agenter** med målbar stil, fx: Barry (+10% på smertegrænsen, men hurtig accept), Trevor (blød, men koster en ekstra runde), Dex (±15% uforudsigelig), Grådige, Flæbende, Kaotiske. Hver markedsspiller/handel får en agent, og forhandlingens replikker kommer fra ham.

**b) Relation der bygges.** Handler du ofte og fair med en agent, blødgøres han over tid (`G.agentRel[navn]`, save-sikker primitiv). *"for DIG, chairman…"*

**BAL.agents (ny blok):** liste af `{navn, feeBias, accept, extraRound, chaos}` + `relGain`, `relDecay`, `relSoften`.

**Succeskriterium:** agentens stil flytter `feeMin`/accept-odds og rundeantal målbart (Barry vs Trevor giver forskellige tal på samme handel); relationen blødgør målbart efter N fair handler.

**Invariant (sabotér først):** to identiske handler med hhv. Barry og Trevor giver forskellig `feeMin`/rundeadfærd. Sabotér ved at nulstille `feeBias`/`extraRound` → forskellen forsvinder → fejler.

---

# Pakke T4 — Deadline day som teater
*Kronen på vinduet. Bygger oven på T1's rigtige klubber. Store model.*

GDD: *"Deadline day — sæsonens teaterforestilling ... et rullende feed time for time med 3-5 muligheder der KUN findes her ... Høj puls, store fortrydelser, bedre historier."* I dag: ét bargain + ét panikbud, ét-klik.

**a) Et rullende feed** af 3-5 deadline-only events med tidsstempler, hver med modspil OG konsekvens (ingen nøgne knapper): panikbud på din topscorer 22:47 (accepter/afvis/pres), et kup til halv pris fra en klub uden likviditet (T1's desperation), en rival der prøver at snuppe din mand — som du kan modbyde og betale for at holde.

**b) Annoncefrit.** Deadline day er en hellig dag i GDD'en — ingen interstitials her.

**BAL.deadline (udvid):** `slots{min,max}`, `heistDiscount`, `panicPremium`, `poachChance`, `holdCost`.

**Succeskriterium:** ≥3 distinkte events pr. deadline day, hver med en handling og en følge; ≥1 kup-klasse og ≥1 panik-salg optræder over N vinduer; events trækkes fra `G.teams` (ingen spøgelser).

**Invariant (sabotér først):** hvert deadline-event har en `fromIdx` i `G.teams` og både en handling OG en konsekvens (fx accept af panikbud fjerner spilleren OG giver kassen). Sabotér ved at gøre et event til en ren info-knap → fejler ("nøgen transaktion").

---

# Verifikation
Grøn = `REGRESSION_OK`. **Kør 200×20 mindst én gang før rapporten** (og gerne `--bot=both`) — sidste nat viste at 10×5 kan være grøn mens 200×20 fanger en fejl. Kør `--stats` og bekræft at trappe- og indtjeningsmåltallene HOLDER efter overhaulet — det er den vigtigste balancekontrol.

Afslut med `NIGHT-REPORT-5.md`: hvilke pakker blev færdige, målte tal før/efter pr. pakke (særligt prisvariationen i T1 og pot-variansen i T2), hvor du afveg fra planen og hvorfor, hvad du var i tvivl om, og hvad du IKKE kunne efterprøve. Nat 1's og 4's rapporter var mest værdifulde dér, hvor de var ærlige om det, de ikke kunne bevise. Push rapporten som allersidste handling.
