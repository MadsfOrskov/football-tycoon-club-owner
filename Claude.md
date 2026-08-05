# HANDOVER — FOOTBALL TYCOON: CLUB OWNER
*Overdragelsesnote til ny chat · 5/8 2026 · Læs denne først, filerne bagefter.*

## Hvad projektet er
Mobilspil (iPhone, portrait): **lower league chairman sim** — man ejer og driver en engelsk klub fra bunden af pyramiden (klubformand, IKKE træner/taktik). Kernefantasien: bygge klubben op — stadion, faciliteter, økonomi, fans, medejere. Navn endeligt besluttet: **FOOTBALL TYCOON: CLUB OWNER** (US App Store: *Soccer Tycoon: Club Owner*; undertitel *Lower league chairman sim*). Ejer: Mads Ørskov. Slutmål: rigtigt spil i **Godot**; nuværende fase: HTML-prototype der spilles på iPhone via GitHub Pages.

## Filerne i pakken
1. **koncept-football-tycoon-club-owner.md** — GDD v5.0, den fulde sandhed om alt spildesign (økonomi-formler, forhandlinger, medejere, sæsonstruktur, monetisering: gratis + TYCOON PRO engangskøb, ingen pay-to-win). Ved tvivl: GDD'en gælder.
2. **football-tycoon-club-owner-prototype.html** — spilbar prototype v2, ÉN selvstændig fil (~310 KB, fonte indlejret som base64). **Dette er nu den kanoniske kildekode** — redigér direkte i den (den gamle src-fil med font-placeholders er droppet for at spare bygge-trin).
3. **test-harness.js** — Node-regressionstest: udtræk `<script>`-blokken af HTML-filen til en .js-fil, kør harness (den simulerer 3 hele sæsoner med en bot: onboarding→kampe→transfers→byggeri). Grøn = "REGRESSION_OK". Kør ALTID `node --check` + harness efter ændringer. Harness'ens bot håndterer modaltyper via en switch — nye modaltyper skal tilføjes dér, ellers klikker botten dem bare væk.

## Prototypens arkitektur (kort)
Vanilla JS, ingen frameworks. Global state i `G` (gem/indlæs = JSON). Alt UI renderes af `render()` ud fra `G.view` + `modal`-variablen (modaler er `{type:...}`-objekter). Kampe simuleres minut-for-minut med events. Vigtige funktioner: `playMatchday()`, `choosePrematch()`, `afterMatchday()` (kø af popups: bank, sponsor, interstitial), `settleFinances()`, `wageDemand()` (kontraktforhandling, poker-princip: modpartens krav er skjult 1. runde), `buyOutOwner()`/`ownerNegoSubmit()`, `stadiumSvg()` (stadion-tegning), `windowOpen()`/`windowLabel()` (transfervinduer), onboarding via `obStep`, budgetmøde-modal ved sæsonstart (`budgetConfirm()`).

## Mads' 9 ændringsønsker — STATUS: kun nr. 9 er lavet
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
