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

## 2. Hvor hårdt skal tavsheden ramme? — og `silentHome` er ikke den knap den ligner (pakke 2 → 7 → 10)

**Historik:** Nat 1 målte 4 administrationer over 10 seeds × 5 sæsoner mod det gamle måltal 0-1, og lod bevidst tallet stå. Nat 2 har målt det igen over **12 seeds × 12 sæsoner** — og tallet er et helt andet: **24 administrationer.** Ved fem sæsoner ligger det på 1. Administrationer er altså næsten udelukkende et **sent** fænomen, og de hører mere sammen med punkt 5 nedenfor (endgame-underskuddet) end med protest-trappen.

**Det vigtige fund er dog et andet.** Jeg målte tre niveauer og skilte derefter de to skruer ad:

| `silentHome` | `easing` | kampdage i ro | administrationer (12×12) |
|---|---|---|---|
| 0,04 | 0,04 | — | 25 |
| **0,13 (nu)** | **0,08** | ~78 % | **24** |
| 0,13 | 0,14 | 74,5 % | 17 |
| **0,20** | 0,08 | **98,6 %** | **2** |
| 0,20 | 0,14 | — | 2 |

Læg mærke til springet i den fede række. `silentHome` er **ikke** en "hvor meget koster tavshed"-skrue. Den er **forstærkningen i en selvsvingende sløjfe**: tavshed koster hjemmebanefordel → hjemmenederlag → stemningen falder → dybere protest → flere hjemmenederlag. Ved 0,13 tænder sløjfen; ved 0,20 tænder den ikke, og klubben når så godt som **aldrig** protest-trappen overhovedet (98,6 % af kampdagene i ro — trappen bliver reelt dekoration igen). Der er et vippepunkt et sted mellem 0,13 og 0,20, og spillet føles fundamentalt forskelligt på hver side af det.

`easing` er til sammenligning en mild skrue: fordoblet fra 0,08 til 0,14 flytter den kun 24 → 17.

**Spørgsmålet til dig — og det er nu et andet spørgsmål end nat 1 stillede:** ikke "hvor mange administrationer", men **skal protest-trappen være selvsvingende?**

- **(a) `silentHome` 0,20 — sløjfen tænder ikke.** Trappen er en advarsel med en skramme, ikke en spiral. 98,6 % ro betyder til gengæld at nat 1's arbejde med trin og hysterese næsten aldrig bliver set.
- **(b) som nu, 0,13 — sløjfen tænder.** ~22 % af kampdagene i protest, og en klub der mister byen kan reelt gå under. Det er dramatisk, og det er også den eneste tilstand hvor GDD'ens "tavshed er uhyggeligst" har vægt.
- **(c) et sted midt imellem, 0,16-0,17** — uprøvet. Vippepunktet ligger derinde, og det er værd at måle præcist, hvis du vil have sløjfen til at tænde *sjældent* i stedet for enten altid eller aldrig.

**Valgt imens:** intet rørt. `silentHome` står på 0,13 og `easing` på 0,08 — nat 1's værdier. `Claude.md`s måltal er genformuleret til 0-4 administrationer over 10 seeds × 5 sæsoner, med grænsen markeret som åben.

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

**Tilføjet efter pakke 10:** over **20** sæsoner falder gennemsnittet til **2,4 pr. sæson** — under målbåndet. Grunden er strukturel og hænger sammen med punkt 5: sent i karrieren sidder klubben fast midt i en række den ikke kan forlade, og så er der hverken oprykningsstreg, topopgør eller sekser at spille om. Måltallet 3-5 gælder altså den *stigende* klub. Om det er et problem, afhænger helt af hvad du vælger i punkt 5.

---

## 5. Endgame er tomt, og økonomien vender — hvad skal en klub lave i sæson 18? (pakke 10)

**Målt: 50 seeds × 20 sæsoner, begge botprofiler, 100 karrierer i alt.** Det her er nattens største enkeltfund, og det er ikke et tal der kan tunes — det er en form.

| | tidligt (sæson 1-5) | sent (sæson 10+) |
|---|---|---|
| sæsoner der slutter i MINUS | 19 % | **58 %** |
| sæsoner der slutter med et lån hængende | — | 27 % |
| sæsoner hvor ALT er bygget (4 tribuner + 7 faciliteter) | — | **60 %** |
| sæsoner som eneejer | — | 15 % |

Administrationer over 100 karrierer: **269** (sane) / 168 (lazy) — altså 3-5 pr. karriere. Mesterskaber: 20 på 50 karrierer.

**Hvad der faktisk sker.** Klubben klatrer, bygger færdigt omkring sæson 6-8, topper økonomisk — og begynder så at synke. Lønsummen sammensættes opad ved hver oprykning (`BAL.wages.promotionRise` 1,35 pr. gang plus loftet), mens indtægten har et **loft**: `townDemand()` er byen, ikke betonen, og den vokser kun med divisionen (`perDivision` 0,85) og Family Stand. Efter tre-fire oprykninger er lønnen ganget med ~2,5, mens byen er ganget med ~3,5 og allerede har fyldt stadion. Fra omkring sæson 12 er klubben strukturelt underskudsgivende, truppen falder tilbage til gulvet på 13, og administrationerne stabler sig op.

**Svaret på WORKPLAN'ens tre spørgsmål er altså:**
- *Bliver klubben uovervindelig?* **Nej — den gør det modsatte.** Den bliver langsomt kvalt. Sportsligt kan den til gengæld ikke falde: der er ingen nedrykning, så divisionen kan kun gå én vej. Man sidder fast i toppen med en økonomi der ikke kan bære den.
- *Holder pengene op med at betyde noget?* **Nej. De begynder at betyde for meget** — men der er intet at bruge dem på. 60 % af de sene sæsoner har alt bygget.
- *Er der noget tilbage at lave i sæson 18?* **Meget lidt.** Alt er bygget, medejerne kan kun købes én pr. sæson og kun 15 % når eneejerskab, oprykning findes ikke mere, og der er ingen nedrykning at frygte. Tilbage er mesterskabet — og at holde hovedet oven vande.

**Jeg har med vilje IKKE bygget noget for at fylde hullet.** WORKPLAN'en er eksplicit: er endgame tomt, er det et fund til rapporten, ikke en undskyldning for at bygge Dynastiet. Så det her er fundet.

**Spørgsmålene til dig, i den rækkefølge jeg tror de skal besvares:**

1. **Skal der være nedrykning?** Uden den er der ingen sportslig spænding tilbage, når man er nået op — og den strukturelle økonomi ville få en naturlig ventil (fald ned, løn falder, byg op igen). Det er den enkeltstående ændring der ville give flest sene sæsoner mening. Det er også en stor ændring.
2. **Skal lønnen kunne følge med byen, eller skal byen kunne følge med lønnen?** Enten skal `promotionRise` dæmpes i de øverste rækker, eller også skal en klub i Premier Division have en indtægtskilde der ikke er loftet af `townDemand` (GDD nævner TV-penge; `tvMoney()` giver £25.000 i øverste række og har ikke fulgt med).
3. **Skal der være noget at bygge efter sæson 8?** Køen til de kommende nætter (pokal, rival, museum, stab, ungdom) er alle sammen ting der ville fylde her. Det er værd at vide, at *endgame-tomheden* er den bedste begrundelse for dem — bedre end at de er sjove.

Jeg har ingen anbefaling. Det er tre forskellige spil.

---

*Tilføjet af nat 3 (7/8 2026), samme branch.*

## 6. Byens hviletilstand: `baseline` blev hævet 37 → 44 (pakke 14b)

**Fundet (QA's F4, efterprøvet).** At forlade protesttrin 1 kræver `banners + hysteresis = 43`. `easing` trækker kun stemningen op **mod** `baseline`, aldrig over. Med `baseline: 37` var 37 < 43, og der fandtes derfor ingen mængde tid der kunne løfte en klub af protestbannerne — kun sejre. Målt af QA: **100 % af alle karrierer nåede trin 1**, og byens hviletilstand var altså "protestbannere". `BAL`-kommentaren lovede selv at easing var *"fast enough to be a way out"*; det var den for to trin af tre.

**Valgt imens:** `baseline: 44`, dvs. lige over `banners + hysteresis`. Det er QA's egen første anbefaling og den mindste ændring der gør påstanden i kommentaren sand. Harness'en har nu en invariant der kører **kun** easing fra stemning 5 uden et eneste resultat og kræver at klubben ender helt ude af protesten; med `baseline: 37` fejler den med det samme.

**Spørgsmålet til dig:** den anden vej var at **sænke `banners`** (fx 38 → 31) i stedet. Forskellen er ikke kosmetisk:

- **Hæv `baseline` (valgt):** byen er som udgangspunkt *tilfreds*, og protest er noget man forårsager. Gulvet under stemningsnedturen flyttes op.
- **Sænk `banners`:** byen bliver ved med at sidde omkring 37, men grænsen for hvornår det tæller som protest rykker væk. Trappen bliver sjældnere, men hviletilstanden er stadig en utilfreds by.

Jeg valgte den første, fordi den flytter hviletilstanden, og det var hviletilstanden QA pegede på. Målt over 60 seeds × 10 sæsoner, kun denne ændring plus 14a:

| | før | efter |
|---|---|---|
| kampdage i ro | 77,3 % | **80,3 %** |
| bannere | 6,6 % | 7,8 % |
| tavshed | 9,3 % | **7,6 %** |
| boykot | 6,8 % | **4,3 %** |
| gns. stemning | 70 | 71 |
| administrationer | 50 | 46 |

## 7. `silentCrowd` står på 0 — er tavsheden for hård eller for blød? (pakke 14a)

`silentHome` er slettet. Tavsheden er nu en multiplikator på **publikumsleddet alene** (`BAL.protest.silentCrowd`), så den tager den tolvte mand og aldrig banen, sengene eller Shed End. Det gør straffen proportional — man kan kun miste et publikum man havde — og det fjerner den fejl QA fandt, hvor tavshed kunne være en *fordel* for en klub med fuldt hus.

**Vigtigt: QA's vippepunkt på 0,16-0,17 kan ikke overføres.** Det var målt på den gamle, fladt formede knap. Den nye har et andet interval og et andet fortegn: `silentCrowd: 0` er den **hårdeste** indstilling, `1` fjerner straffen helt.

**Valgt imens: 0** — GDD'en kalder tavsheden *"uhyggeligst"*, og at den tager hele den tolvte mand er den mest GDD-konsistente læsning. Den er samtidig mildere end den gamle knap for enhver klub med en Shed End, fordi Shed End-leddet nu overlever protesten (det gjorde det ikke før — se QA's F7, hvor en færdigbygget Shed End til £220.000 var værdiløs på 31 % af kampdagene).

**Spørgsmålet til dig:** skal der være en rest af publikum tilbage i tavsheden (fx `silentCrowd: 0,3`)? Det er nu en ren, monoton skrue: 0 = hårdest, 1 = ingen straf, og alt derimellem er forudsigeligt. Den kan tunes uden at ændre form, hvilket var hele problemet før.
