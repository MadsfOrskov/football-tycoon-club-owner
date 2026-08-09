# ARBEJDSKØ — MOGUL-OMBYGNINGEN: spillet er personen, klubben er et aktiv

*Skrevet efter designafklaring med Mads. Dette er den STORE omlægning: spillet omstruktureres omkring ejeren — et helt ejerlag med mange sider, investeringer, finansoverblik, portefølje af klubber med præstation og omtale — og man klikker IND i en klub for at drive den. Selvstændig: læs `Claude.md`, GDD og `WORKPLAN-OWNER.md` (O1-O3 er bygget) først.*

## Beslutninger låst med Mads (9/8 2026)
1. **Fuld simulation af alle ejede klubber** — men med **tilstedeværelses-modellen**: du har én krop. Hver uge vælger du HVOR du er; den besøgte klub får fuld dybde (kamp, ordrer, forhandlinger). Fraværende klubber drives af en **ansat direktør** med et mandat (budget, transferlinje, målsætning) og eskalerer kun store beslutninger til dit skrivebord ("bestyrelsespapirer"). Frit hop pr. kampdag er bevidst FRAVALGT — opmærksomhed er mogul-ressourcen. Direktører er personer med stil (genbrug agent/gaffer-skabelonen); at overrule dem koster.
2. **Tid: en global "næste uge"-knap.** Ejerlaget har sin egen fremdrift; alt afvikles (alle ligaer, investeringer, events), og du dykker kun ned i det du vil se.
3. **Fuld persistent pyramide.** Alle 4 divisioner × 14 klubber eksisterer PERMANENT: alle rykker op/ned, har værdi, form og omtale. Ingen reseed — verden husker. **På sigt: ligaer i hele verden** (flere lande) — byg pyramiden så den kan blive til flere.
4. **Klubkøb ad alle fire veje:** klubmægler med tilbud på skrivebordet (kriseklubber billigt — T1's desperation på klubniveau) · frit bud på enhver klub i pyramiden · adgangskrav før køb nr. 2+ (formue/omdømme/succes) · interessekonflikt-regler (ikke to KONTROLLEREDE klubber i samme division; kollision efter oprykning tvinger salg).
5. **Vindermål: blanding af net worth og dynasti** — formuen OG fodboldmagten (klubber i topdivisioner, mesterskaber på tværs, omdømme) måles begge; æra-opsummeringen vægter begge.

## Ufravigelig ramme (som T/N/O-serierne)
Én pakke ad gangen · `node --check` + 10×5 `--stats` grøn pr. pakke · én commit pr. pakke · alle tal i BAL · nye modaler i handleModal OG HANDLED_MODALS (sat+tegnet) · **sabotér hver invariant først** (mål spillets kode via `H.call`) · 200×20 `--bot=both` før rapport · klubøkonomiens måltal må ikke skride (ejerlagets penge er `personalWealth`, aldrig `G.balance`).

---

# Pakke M1 — Den persistente pyramide (verdens-ombygningen) ✅ *bygget i session 9/8*
`G.worldRest` (42 klubber i de tre andre divisioner) + persistente `wid`/`press` på alle klubber. Alle divisioner spiller runder (`simWorldRound` i `simRestOfRound`). Sæsonskift: `applyPyramidExchange` — top-2 op / bund-2 ned i ALLE nabopar, klubberne BEHOLDER identitet (±`BAL.world.moveAdj` styrke ved flytning, så sværhedstrappen holder). `reseedLeague()` er død. Tabel-skærmen får divisionsvælger. Save-migration for gamle karrierer. Invariant `checkWorld`: 55 AI-klubber, 13 i min division/14 i andre, unikke wid'er, exchange flytter de rigtige og identiteten overlever — sabotage-verificeret.

# Pakke M2 — Ejerlagets sider: portefølje, andele, investeringer, finanser
**a) You-fanens undersider:** `Desk` (nuværende viewOwner) · `Empire` (portefølje) · `Invest` · `Books` (personlige finanser: udbytter ind, forbrug ud, net worth-graf fra `netWorthHistory`).
**b) Empire:** kort pr. ejet klub/andel (division, placering, værdi, din andel, omtale/press). Gennemse pyramiden → klubside med værdi/omtale/ejerens vilje → **frit bud**. Andele (minoritet) i enhver klub: pris = klubværdi-proxy × premium; værdi følger klubbens resultater/press; udbytte pr. sæson = andel × abstrakt sæsonnetto (division + placering, tal i BAL). KONTROL (>50%) af klub nr. 2 kræver adgangskravene og respekterer konflikt-reglen; en kontrolleret klub nr. 2 er *direktør-drevet abstrakt* indtil M3 (kaster udbytte og værdi, kan endnu ikke besøges).
**c) Klubmægleren:** en personlighed der sender tilbud til skrivebordet; kriseklubber (lav abstrakt kasse/press) kommer med rabat.
**d) Omtale:** press-tallet (M1) vises på alle kort; dit eget omdømme (O1) er personens omtale.
**Invariant:** en andel koster personalWealth (aldrig G.balance), udbytter lander i personalWealth, netWorth() medregner andele; konflikt-reglen blokerer kontrol-køb i egen division; adgangskrav blokerer under tærsklen. Sabotér hver.

# Pakke M2.5 — Det todelte interface (skallen, med ÉN klub)
*Designet er låst med Mads 9/8 (aften) og mocket op: artifact "Football Tycoon — To lag: Dig & Klubben" (claude.ai/code/artifact/03249c8f-9436-47f6-af34-e2f1bd8f1590). Byg skallen FØR M3 — den virker allerede med én klub.*

**De fire låste beslutninger:**
1. **Tiden bor hos DIG:** én "▶ Næste uge"-knap på Kontoret driver hele verden frem. Står du inde i en klub når ugen ruller, spilles DENS kamp for øjnene af dig (prematch-ordrer, halvleg, ticker); alle andre kampe afvikles abstrakt.
2. **Implicit tilstedeværelse:** du ER i den klub du senest er "gået ind i". Ingen ugentligt ritual-valg. (Rejseomkostning kan tilføjes senere hvis zapping bliver et problem.)
3. **Kun eskaleringer hjemmefra:** direktøren driver fraværende klubber efter mandat og lægger kun STORE ting på dit bord (profil-salg, krise, klubkøbstilbud). Alt andet kræver at du går ind. Et besøg BETYDER noget.
4. **Dørklokke-modellen (revideret 9/8 aften — afløser "delt post"):** Ejer-laget har INGEN mailboks. Kontoret ER overfladen: alt der kræver DIG (mægler-tilbud, direktør-eskaleringer, beslutninger) står som **kort på bordet** til de er håndteret; udbytter/historik bor i Bøger. Klubbens indbakke forbliver klubbens og besvares KUN derinde. **Dørklokken:** hastende klubpost (fx et bud der udløber) giver en linje på bordet — et tryk **hopper dig ind** i klubben, direkte på indbakken (tilstedeværelsen flytter med; bordet er en dørklokke, ikke en svarknap — intet kan fjernstyres ad den vej). **M3-reglen:** direktøren i fraværende klubber besvarer selv rutinepost efter sit mandat (beløbsgrænser i BAL); kun det mandatet forbyder, ringer på din dør. Begrundelsen for revisionen: den rene deling modsagde sig selv — tidskritisk klubpost (bud udløber på 2 kampdage) ville dø usét, når tiden drives fra Kontoret, og spilleren ville skulle patruljere sine klubber; præcis det bordet skulle overflødiggøre. Invariant-krav: intet tidskritisk inbox-item kan udløbe uden at have haft en dørklokke-linje på bordet (sabotér: fjern dørklokken → et bud udløber usét → fejler).

**UI-sproget (fra mock-uppen):** Guld = ejer-laget (egen nav: Kontor · Imperium · Invest · Bøger · Post). Klubbens farve = klublaget (nuværende nav: Klub · Trup · Marked · Tabel · Indbakke). Man GÅR IND i en klub fra et imperium-kort ("GÅ IND I KLUBBEN ▸") og hjem via en tynd guld-linje øverst: **"‹ DIG · formue · uge N"** — altid synlig inde i klubben, aldrig i vejen. Skiftet skal MÆRKES (farve + ramme).

**Byggeplan for skallen:** `G.layer` ("owner"/"club") styrer hvilken nav+skærmsæt der tegnes. Ejer-nav genbruger O2/M2-indholdet (Desk→Kontor, Empire→Imperium, Books→Bøger; Post udskilles fra klub-indbakken ved afsender-typen). "Næste uge" = playMatchday flyttet op (med én klub er ugens kamp altid "din klubs kamp — vises fordi du står i den" ELLER afvikles quick hvis du står hjemme; quick-afvikling af egen kamp genbruger quickMode-vejen). Harness: botten skal spille BEGGE veje (hjemme→afvikl, inde→fuld kamp); invariant: at spille ugen hjemmefra og inde giver samme verdens-fremdrift (md++, alle divisioner spiller).

# Pakke M3 — Tilstedeværelse & direktører (multi-klub for alvor)
Flere FULDE klub-tilstande (G omstruktureres: `P` = personen, `P.clubs[]` = fulde klub-verdener, aktive klub = den du besøger). Ugentligt tilstedeværelses-valg · direktører som personer med mandat og tålmodighed · eskaleringspapirer på skrivebordet · den globale "næste uge"-knap afløser "Play matchday" som fremdrift. Dette er den tungeste pakke — kræver sit eget nat-design (harness'ens bot skal drive to klubber!).

# Pakke M4 — Vindermål & æraen
Dynasti-måling (klubber pr. division, samlede trofæer på tværs, omdømme-toppe) + net worth i æra-opsummeringen; milepæle ("første £1M", "to klubber i Premier"). Balancemål for hele mogul-økonomien.

# Pakke M5 (senere nætter) — Verden vokser
Flere lande/ligaer oven på pyramide-strukturen (M1 er bygget generisk nok: divisioner er data, ikke kode). Kontinentale turneringer som drøm.

---

# Verifikation
Grøn = REGRESSION_OK. Efter HVER pakke: `--stats` — klubbens måltal (netto/indtjening/store kampe/admin/oprykning) må ikke skride; M-lagets penge går udenom klubkassen. 200×20 `--bot=both` før rapport. Natrapport med målte tal, afvigelser og det uafprøvede.
