# HANDOVER — FOOTBALL TYCOON: CLUB OWNER
*Overdragelsesnote til ny chat · 5/8 2026 · Læs denne først, filerne bagefter.*

## Hvad projektet er
Mobilspil (iPhone, portrait): **lower league chairman sim** — man ejer og driver en engelsk klub fra bunden af pyramiden (klubformand, IKKE træner/taktik). Kernefantasien: bygge klubben op — stadion, faciliteter, økonomi, fans, medejere. Navn endeligt besluttet: **FOOTBALL TYCOON: CLUB OWNER** (US App Store: *Soccer Tycoon: Club Owner*; undertitel *Lower league chairman sim*). Ejer: Mads Ørskov. Slutmål: rigtigt spil i **Godot**; nuværende fase: HTML-prototype der spilles på iPhone via GitHub Pages.

## Filerne i pakken
1. **koncept-football-tycoon-club-owner.md** — GDD v5.0, den fulde sandhed om alt spildesign (økonomi-formler, forhandlinger, medejere, sæsonstruktur, monetisering: gratis + TYCOON PRO engangskøb, ingen pay-to-win). Ved tvivl: GDD'en gælder.
2. **football-tycoon-club-owner-prototype.html** — spilbar prototype v2, ÉN selvstændig fil (~310 KB, fonte indlejret som base64). **Dette er nu den kanoniske kildekode** — redigér direkte i den (den gamle src-fil med font-placeholders er droppet for at spare bygge-trin).
3. **test-harness.js** — Node-regressionstest. Kør blot `node test-harness.js` (den udtrækker selv `<script>`-blokken til `proto-extract.js`, syntakstjekker og kører). Grøn = "REGRESSION_OK". Nyttige flag: `--seeds=N --seasons=N --stats` (økonomirapport m. måltallene fra ændring 6) og `--echo=<modaltype|budgetN|screen:navn|ground:...>` som dumper renderet markup til en fil, så UI kan inspiceres uden browser.
   Botten spiller hele sæsoner (onboarding→kampe→transfers→byggeri→sæsonskift) med seedet RNG. Ud over gennemspilningen tjekker den: NaN/undefined i renderet HTML, velformet SVG, ejerandele = 100%, **ligaintegritet (14 hold-optrædener pr. kampdag — fanger dobbeltsimulering af AI-runden)**, samt tvungne scenarier for stadion-tegningen (30 byggetilstande × 2 temaer), medejer-opkøb og bank→lån→administration.
   **Bottens modal-switch KASTER på ukendte modaltyper** — nye modaler skal registreres bevidst i `handleModal`, ellers fejler harness'en med "UNKNOWN MODAL TYPE".

## Prototypens arkitektur (kort)
Vanilla JS, ingen frameworks. Global state i `G` (gem/indlæs = JSON). Alt UI renderes af `render()` ud fra `G.view` + `modal`-variablen (modaler er `{type:...}`-objekter). Kampe simuleres minut-for-minut med events. Vigtige funktioner: `playMatchday()`, `choosePrematch()`, `afterMatchday()` (kø af popups: bank, sponsor, interstitial), `settleFinances()`, `wageDemand()` (kontraktforhandling, poker-princip: modpartens krav er skjult 1. runde), `buyOutOwner()`/`ownerNegoSubmit()`, `stadiumSvg()` (stadion-tegning), `windowOpen()`/`windowLabel()` (transfervinduer), onboarding via `obStep`, budgetmøde-modal ved sæsonstart (`budgetConfirm()`).

## Mads' 9 ændringsønsker — STATUS: alle 9 er lavet (5/8 2026)
Hver ændring har sin egen commit med begrundelse. Git er initialiseret; `git log --oneline` giver overblikket. Beskrivelserne nedenfor er bevaret som reference for HVAD der blev bedt om.

**Efter de 9 ændringer er der lavet en review-runde** (commits `d053326` → `849cbd2`) med fejlrettelser, persistens og balance. Se `git log` for begrundelserne. Det vigtigste at kende:

- **`BAL`-objektet øverst i JS'en indeholder ALLE balancetal.** Matchday-satser, sæsonkort, billetpris, lønskala/-loft, `townDemand`, medejerpriser, præmier, bank. Tun dér — ikke inde i logikken.
- **Spillere identificeres på `id`, aldrig navn.** Navnepuljen er kun 728 kombinationer, så dubletter er uundgåelige. `byId()`, `nameOf()`, `detachPlayer()`. Alle veje ud af truppen SKAL gå gennem `detachPlayer()`.
- **Karrieren gemmes i localStorage** ved hver kampdag og hvert skærmskift. Kun `G` gemmes — modal/nego/screen bevidst ikke. `G` skal forblive et TRÆ: ingen funktioner, ingen delte objektreferencer (harness'en håndhæver det).
- **To ting i ændring 6 gik ud over det, du bad om, og mangler stadig din blåstempling:** (a) lønskalaen er sænket (`ov*30`→`ov*13,5`, loft £26k→£11,5k), fordi dine fem multiplikatorer kun skruede ned for indtægterne og botten derefter gik i administration ~2× pr. karriere; (b) `townDemand()` gør fanbasen (division + Family Stand) til loft for både fremmøde og sæsonkortsalg, fordi begge var ganget med KAPACITET — det gjorde tribuner til en pengemaskine.
- **Måltal nu** (10 seeds × 4-6 sæsoner): netto/kampdag sæson 1 ≈ −£1,5k (mål ±2k ✓), indtjening sæson 1 ≈ £155k (≈ 2 tribuner), oprykning 5-8 af 10 i sæson 1 og derefter 1-3 af 10, 0-1 administration. Skruerne: `BAL.demand.perDivision` (0,85) for sen-økonomien, `G.teams`-styrken i `newGame` for sværhedsgraden.

1. **Onboarding: færre valg pr. skærm + konsekvensforklaring.** Split farve og lys/mørk i to trin; split budgetmødet i 4 sekventielle trin (billetpris → trøje → stadionfond → opsummering/kapital), hvert med 1 linje om konsekvensen. Billetpris-trinnet skal vise live-estimat af solgte sæsonkort/kontant nu (genbrug formlen i budget-koden).
2. **Squad-siden mere overskuelig.** Gruppér efter position (GK/DF/MF/FW) med sektionsoverskrifter; slanke rækker (pos, navn, alder, OVR, ATT/DEF/PHY kompakt, statuschips: C/INJ/SUSP/LISTED/GEM, kontraktår); ALLE handlinger (sælg, chat, fokus, mentor, forny, anfører) flyttes til et spiller-detaljeark (modal) der åbnes ved tryk på rækken. Husk: ny modaltype → tilføj i harness-switchen.
3. **Lønkrav skal reagere synligt på kontraktlængde/rolle.** `wageDemand()` vægter allerede år+rolle, men vis det: efter 1. modbud (eller fra start ved forlængelser) vises live "på disse vilkår forventer han ~£X/uge", som opdateres når man ændrer år/rolle. 1. runde forbliver blind (poker-princippet, GDD).
4. **Stadion-visualisering markant bedre.** Omskriv `stadiumSvg()`: perspektiv-bane m. klippestriber, tribuner i niveauer m. tag, publikum som prikker (tæthed = fremmøde/kapacitet), Shed End med banner, lysmaster, storskærm/VIP/pie-bod når faciliteten er bygget, byggekran under opførelse, stiplede "BUILD"-skygger for ubyggede.
5. **Svært at købe medejere ud.** Gates: umuligt før sæson 3 ("de vil se retningen"); max ét opkøb pr. sæson (`G.ownerBoughtSeason`); minimumspris 1,35–1,6× fair værdi (før: 1,08–1,2), åbningskrav ~1,8×; kollaps låser i 2 sæsoner.
6. **Balancér matchday-indtægter vs. omkostninger.** Mål: tidlig netto pr. kamp ≈ ±2k; en tribune (70k) ≈ ~1 sæsons opsparing. Justering: kiosk-basis 3,5→2,4, shop 1,4→1,2, pub 0,9→0,8, merch 0,6→0,45, sæsonkort-andel 0,28→0,25. Kør harness efter og kig på bottens slutkasse over 3 sæsoner — den må ikke gå konkurs eller svømme i penge.
7. **Sponsortilbud som popup, ikke indbakke.** Sæt `G.sponsorDue={offers:[a,b]}` i stedet for inbox-besked; `afterMatchday()` viser modal `{type:"sponsorOffer"}` med to tilbudskort + "beslut senere" (falder tilbage til indbakken). Sæsonslut-fornyelse: vis efter budgetmødet.
8. **Tilbage-knap på prematch-skærmen.** VIGTIG FÆLDE: AI-kampene simuleres i dag i `playMatchday()` FØR prematch-modalen — flyt AI-simuleringen ind i `choosePrematch()` (gem runden på modal-objektet), ellers dobbeltsimuleres ligaen når man går tilbage. Derefter er "‹ Tilbage"-knappen triviel (`modal=null`).
9. ✅ **Transfervinduer** (ALLEREDE I FILEN): sommer = MD 0–5 (langt, ind over sæsonstart), januar = MD 12–14. Deadline-days: MD 5 og MD 14.

## Vigtige beslutninger der IKKE må skride (kort)
Ingen taktik/opstilling (formanden vælger kun *approach* før kamp + taler med truppen). Kontraktforhandling er blind i 1. runde. Medejere har personligheder + humør; deres kapital er lån-lignende med indflydelseskrav. PRO (engangskøb, "TYCOON PRO") giver flere gemmepladser/statistik/QoL — aldrig spilfordele. Sæson = 16 kampe + evt. playoff; budgetmøde mellem sæsoner. Stemningsnavne (The Shed End, Pies & Glory) lever inde i spillet. Designsprog: "Floodlight" mørkt tema m. klubfarve-akcent, Barlow Condensed til tal/overskrifter.

## Arbejdsform (for at holde forbruget nede)
Én arbejdspakke pr. chat. Redigér med målrettede søg/erstat-edits — genlæs ALDRIG hele filen. Byg ikke om til flere filer endnu (single-file er bevidst pga. GitHub Pages-simplicitet). Test: syntaks-check + harness, ikke manuelle gennemspilninger i chatten. Store model kun til designbeslutninger; mekaniske ændringer på mindre model.
