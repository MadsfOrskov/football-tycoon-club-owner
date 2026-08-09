# ARBEJDSKØ — ROBUST & GODT AT SPILLE: fjern, ændr, tilføj

*Afklaret med Mads 9/8 (aften, runde 2). Selvstændig: en frisk session bygger herfra. Læs `Claude.md` først; `WORKPLAN-MOGUL.md` (M3+) består ved siden af. Arbejdsform som altid: én pakke ad gangen · `node --check` + 10×5 `--stats` grøn pr. pakke · alle tal i BAL · nye modaler i handleModal OG HANDLED_MODALS · **sabotér hver ny invariant først** (mål spillets kode via H.call) · 200×20 `--bot=both` før rapport · klubøkonomiens måltal må ikke skride.*

## Beslutninger låst med Mads
- **FJERN:** quick mode (dubleret af Next week) · stadionfonden (banken er finansieringsvejen) · småsystemerne træningsfokus, mentor-par og sponsor-stunt. **AD/IAP-placeholders BEHOLDES.**
- **ÆNDR:** udbyttet → **variant B+**: kort på bordet ("Erklær udbytte", én gang pr. sæson, frivilligt; mindretals-udbytte sker automatisk som meddelelse) og kortet **markeres/blinker de sidste uger** af sæsonen så man ikke glemmer at betale sig selv. Mock-up: artifact 03249c8f, sektionen "Udbyttet — tre måder", variant B. · **Kampkommentaren gøres kortere og færre** (se R4) — det er OGSÅ forudsætningen for dansk flavor. · **Dansk i hele spillet** (UI først, flavor efter R4-trimmet). · **Intro starter med DIG** (ejer-identiteten før klubben). · **Sen-spillet strammes** (League One+ skal sidde hårdere; botten ender for ofte i Premier med millioner).
- **TILFØJ:** FA Cup **indflættet i kalenderen** (4-5 cup-runder som ekstra kampdage, hele pyramiden deltager, giantkilling + ekstra gate + lodtrækning på bordet) · M3 (direktører + klub nr. 2, se WORKPLAN-MOGUL) · klubmægleren + Invest-aktiver · karriere-arkiv & milepæle.
- **ROBUSTHED:** eksport/import af karrieren · global fejl-skærm (aldrig hvid død) · rigtig PWA (manifest + offline) · 3 gemmepladser. Baggrund: iOS Safari kan slette localStorage efter ~7 dages inaktivitet — karrieren SKAL kunne overleve det.

## Pakkerne (rækkefølge = byggerækkefølge)

*Status efter natten 9-10/8: R2 ✅ · R3 ✅ · R1a/b/c ✅ · R4 ✅ · R5 ✅ (UI — flavor venter som egen pakke) · R6 ✅ · R7 ✅. Tilbage: R5-flavor, R8, R9, R10, R11 (+ M3 i WORKPLAN-MOGUL).*

### R2 — Fejl-skærm + eksport/import *(bygges først: beskytter spillere NU, additiv, lav risiko)* ✅
window.onerror/unhandledrejection → pæn "Noget gik galt"-skærm med [Genindlæs] og [Gendan sidste gemte] (læs SAVE_KEY igen) — aldrig hvid/frossen side. Eksport: knap på titelskærm + Books der lægger karrieren som base64-tekst til kopiering (navigator.clipboard + synligt tekstfelt-fallback). Import: indsæt kode på titelskærmen → valider (JSON.parse + v-felt + G.club) → gem + load. Invariant: eksport→import af en kørende karriere er tabsfri (samme JSON efter normalisering); en ødelagt kode afvises uden at røre det eksisterende gem. Sabotér: spring valideringen over → korrupt kode overskriver gemmet → fejler.

### R3 — Udbyttet som kort på bordet (variant B+) ✅
Fjern dividendDue-gaten i openBudgetMeeting (sæsonstart: seasonDone → budget, ét trin kortere). Kortet "Erklær udbytte" på Kontorets bord når G.dividendTaken!==G.season && isMajority(); klik åbner den eksisterende dividend-modal (uændret indhold). Fra BAL.owners.dividendRemindFrom (fx uge 20) markeres kortet (comm-farve + "sidste chance"). Mindretal: boardDividend afregnes automatisk ved sæsonskift med meddelelse på bordet — ingen modal. Harness: bot tager kortet af og til (begge grene), dividend-modal-casen består. Invariant: majoritets-kort på bordet når ikke taget; efter uge remindFrom er det markeret; mindretals-udbytte sker uden modal og flytter penge korrekt (genbrug checkDividend, tilpasset). Sabotér: fjern kortet → fejler; fjern auto-afregningen → fejler.

### R1 — FJERN-pakken (den store oprydning; muligvis 2-3 commits) ✅ *(a+b+c, tre commits)*
a) **Quick mode ud:** G.quickMode/quickOffered/skipStreak, quickOffer-modalen (også ud af HANDLED_MODALS + harness-case), "quick results"-grenene i ticker/kamp. Next week hjemmefra ER hurtigvejen; inde i klubben spilles fuldt (skip-knappen i tickeren BEVARES).
b) **Stadionfonden ud:** G.fund/fundBonus/fundTarget/fundRaided, withdrawFund, fondstrin i budget/midway-modalerne, fondskort på Ground, BAL.fund, checkStaleFundTarget (slet invarianten), stats.build-hooken for fundAdd, trustFundKept-leddet (bestyrelses-tillid: erstat med neutralt 0 eller flyt værdien ind i trustPerSeason — MÅL trappen før/efter!). Banken er nu eneste vej til at bygge før man har kontanter.
c) **Småsystemer ud:** træningsfokus (p.focus, setFocus, dev-bonus, UI), mentor-par (G.mentors, setMentor, applyMentors, invariant-linjer, UI), sponsor-stunt (stunt-besked/handling, stuntDone/stuntMD/stuntFee). Ryd også bot-grene og blindgyde-ankre.
**Balancevagt:** fonden og fokus/mentor bidrog til udvikling og byggeri — kør --stats før/efter hvert delcommit; især indtjening/tribune-tal og trup-udvikling må ikke skride mærkbart. Justér om nødvendigt (fx training-facilitetens dev-bonus op med det fokus/mentor gav i snit).

### R4 — Kampkommentaren: kortere og færre ✅ *(median 8 linjer/kamp, loft + sabotage-verificeret invariant)*
Beslutning: "Lav kampkommentar kortere og fjern at der kommer så mange." To greb: (1) **færre events i tickeren** — BAL.text.tickerMax (fx 6-8 linjer pr. kamp mod nu ~12-18): mål-events beholdes altid, flavor/nearmiss/momentum udtyndes hårdt (vægt i BAL); (2) **kortere linjer** — biblioteket beskæres til én sætning pr. linje (de lange to-sætnings-linjer strammes), og `sub`-underlinjer fjernes uden for mål. Tag-systemet og tonereglen består. Harness: checkTextLibrary-tallene opdateres; ny måling i --stats: linjer pr. kamp (mål: median ≤8). Invariant: mål vises ALTID; ticker-linjeantal ≤ BAL-loft. Sabotér: sæt loftet ud af kraft → fejler.

### R5 — Dansk UI ✅ *(UI-delen; flavor er bevidst udestående — kampkommentar-puljer, replikker, aviser, storkamps-etiketter og vejrnavne, der er nøglet i tag-systemet)*
Alt UI/knapper/beslutninger/systemtekst på dansk (nav, modaler, kort, bestyrelse/bank/marked-tekst). Flavor (kampkommentar efter R4-trim, agent-replikker, aviser) som EGEN efterfølgende pakke med tonecheck ("kunne det stå i en ægte dansk lokalavis?"). Promises-matcher-kode-tjekket (checkPromisesMatchCode) skal opdateres samtidig — den asserterer tekststrenge!

### R6 — Intro starter med DIG ✅
Onboarding-rækkefølgen vendes: (1) dit navn+portræt+baggrund → (2) "du arver klubben": klubnavn → (3) farve → (4) look → (5) gaffer. Teksten ejer-først.

### R7 — Sen-spillet strammes ✅ *(topLift/topBuy i BAL.world; Premier-slut 6/19 → 3/20 på samme seeds, slutkasser i Premier fra op til £1.1M ned til £131-506k)*
Mål: Premier skal være en kamp, ikke en kroning. Skruer (mål før/efter ved 20×12+): moveAdj/divisionsstyrke-lift for div 0-1, lønpres (promotionRise/cap-trappen), prize/tv-kurven i toppen, evt. stærkere AI-forstærkning i toppen (worldRest top-klubber køber også). Målepunkt: slutdivision-fordelingen ved 200×20 — Premier-slut skal ned, og slutkassen i Premier-karrierer markant ned.

### R8 — FA Cup, indflættet i kalenderen
4-5 cup-runder som ekstra kampdage (sæson ~30-31 uger). Hele pyramiden deltager (M1 gør det muligt); seedning så lavere divisioner møder højere (giantkilling-chance via styrkeformlen). Lodtrækning lander på bordet; cup-kampe er altid "store" (fuld afvikling, big-gate). Præmier pr. runde i BAL.cup (skal IKKE gøre ligaøkonomien skæv — mål!). Deadline-day/vindues-kadencen (md 5/14) genberegnes mod den nye kalender. Harness: fixtures-invarianterne (checkFixtureIntegrity) udvides til cup-dage; bot spiller cuppen. Stor pakke — egen nat.

### R9 — Klubmægleren + Invest-fanen
Mægler-personlighed der lægger klubtilbud på bordet (kriseklubber billigt — press/abstrakt kasse som trigger). Invest-fanen (4. ejer-fane) med fodbold-aktiver: agentur/akademi/pub-kæde — afkastprofiler i BAL, alt via personalWealth. (Andele bor allerede i Empire.)

### R10 — Karriere-arkiv & milepæle
Bøger udvides: sæson-for-sæson historik på tværs (div, placering, trofæer, netto, udbytter), formuekurven tegnet, milepæle ("første £1M", "første kontrol-klub", "to klubber i Premier", "cup-vinder") med bord-fejring.

### R11 — PWA + 3 gemmepladser
manifest.json + service worker (cache-first for de to filer) + ikoner → installérbar, offline, mere permanent iOS-lagring. Titelskærm med 3 slots (SAVE_KEY suffix), flyt/kopiér mellem slots, eksport/import pr. slot.

## Verifikation
Grøn = REGRESSION_OK. Efter HVER pakke: --stats mod gulv-tallene (netto S1 ±£2k · indtjening S1 £100-260k · store kampe 3-5 · admin 0-4/10×5 · oprykning S1 50-80%, senere 10-30%). R1 og R7 er balance-følsomme: mål før/efter, dokumentér skred. Før natrapport: 200×20 --bot=both.
