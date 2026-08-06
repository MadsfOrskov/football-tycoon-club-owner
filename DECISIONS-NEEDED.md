# BESLUTNINGER DER MANGLER — til Mads

*Spørgsmål hvor `Claude.md` og GDD'en er tavse, og hvor valget betyder noget. Hver post har det valg der er truffet **imens**, så koden er kørende og grøn — men valget er ikke mit at træffe permanent.*

Skrevet af nat 2 (7/8 2026), branch `nightly/trupdybde`.

---

## 1. Skal Main Stand gøre noget i bestyrelsen? (pakke 7)

**Fundet:** `STANDS.main.role` lovede *"Seats & boardroom gravitas"*. Koden rører intet uden for kapaciteten. Der var ingen `trust`-effekt, ingen medejer-effekt, ingenting. Nøjagtig samme fejlklasse som sponsorklausulen: en lovning ingen kode indfrier.

**Valgt imens:** teksten er rettet til *"Seats — the biggest capacity step per tier"*, som er sandt. Harness'en fejler nu hvis nogen skriver "gravitas" eller "boardroom" tilbage uden at bygge mekanikken.

**Spørgsmålet til dig:** Efter pakke 4 findes `G.trust` (bestyrelsens tillid, 0-100), og en hovedtribune med direktionsboks er et helt rimeligt sted at bygge lidt af den. Skal Main Stand give tillid — og hvor meget? Fx `+4 trust pr. niveau ved opførelse`, eller en løbende `+0,1 pr. kampdag` mens den står?

**Hvorfor jeg ikke bare gjorde det:** det er en ny virkning på et system (tillid → medejerpriser → kontrol over klubben), ikke en tekstrettelse. Nattens ramme var eksplicit: ingen nye systemer, ingen designbeslutninger.

**Bemærk også:** VIP-bokse giver deres flade beløb uanset om Main Stand står, men stadion-*tegningen* tegner dem kun hvis `G.stands.main>=1`. Enten skal VIP kræve en hovedtribune, eller tegningen skal placere dem et andet sted. Det er samme beslutning som ovenstående, og hænger sammen med den.

---

## 2. Hvor mange administrationer må en karriere tåle? (pakke 2 → 7 → 10)

**Historik:** Nat 1 målte 4 administrationer over 10 seeds × 5 sæsoner, mod det gamle måltal 0-1, og lod bevidst tallet stå frem for at tune det væk. Nat 2 har målt det igen efter pakke 5-7 og set det svinge mellem **1 og 4** afhængigt af hvor meget gate-indtægt store kampe leverer.

**Valgt imens:** `Claude.md`s måltal er genformuleret til **0-4** med en eksplicit note om at grænsen er åben. Skruerne er urørte: `BAL.protest.silentHome` (0,13) og `BAL.protest.easing` (0,08).

**Spørgsmålet til dig:** en administration er GDD'ens trin 3 af 4 — pointstraf og transferforbud, med trin 4 (tvangssalg) som game over. Skal den ramme:

- **(a) næsten aldrig** (0-1 pr. 50 sæsoner) — så er den en skræk, ikke en risiko, og mekanikken er reelt dekoration igen;
- **(b) som nu** (1-4 pr. 50 sæsoner) — en klub der mister byen kan gå ned, men det kræver at flere ting går galt på én gang;
- **(c) oftere** (5-8) — økonomien er en reel modstander, og protest-trappen har tænder man frygter.

Det er en beslutning om, hvad spillet handler om, ikke et tal der kan måles frem. Jeg har ikke rørt den.

---

## 3. Skal en stor kamp trække flere tilskuere, eller kun dyrere billetter? (pakke 5)

**Fundet:** Efter pakke 5 findes store kampe (3-5 pr. sæson, udledt af tabellen). Gate-indtægten stiger fra `bigExtra` (formandens pristillæg) og fra to multiplikatorer (storskærm +10 %, Away End +6 % pr. niveau). Men `attendance()` er *uændret* på en stor kamp: der kommer ikke én tilskuer mere.

**Valgt imens:** ingenting. Jeg tilføjede med vilje ikke et fremmøde-led, fordi WORKPLAN'en beder om målbar effekt på gate og ikke om et nyt efterspørgselsled, og fordi enhver ny multiplikator på fremmødet ville skulle balanceres mod `townDemand()`s loft — som er selve grunden til at tribuner ikke er en pengemaskine.

**Spørgsmålet til dig:** GDD'en siger om store kampe *"fansene på illustrationen der reagerer live"* og *"ekstra tilskuere"* om derbyet. Skal en stor kamp hæve fremmødet, fx `townDemand() × 1,1` med `G.capacity` som loft — eller er det rigtigt at det kun er billetprisen og faciliteterne der flytter sig, så en stor kamp belønner den der har *bygget*?

---

## 4. Hvad er en "sæson uden en eneste stor kamp"? (pakke 5)

Målt: 0 af 50 sæsoner endte uden en stor kamp, gennemsnit 3,5, spænd 1-8.

Jeg lod med vilje være med at hårdkode et minimum pr. sæson: en klub der ender 14. med alt afgjort og uden en ordentlig øretæve i efteråret **skal** kunne have en stille sæson. Men spændet går til 8, hvilket er over målbåndets 3-5 i toppen.

**Spørgsmålet:** er 8 store kampe i en enkelt sæson i orden (det var en tæt oprykningskamp hele vejen), eller skal der være et loft pr. sæson? Et loft ville betyde, at den syvende sekser i en dramatisk sæson bliver *nedgraderet* — hvilket er sin egen slags løgn.
