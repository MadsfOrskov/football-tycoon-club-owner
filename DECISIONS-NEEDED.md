# BESLUTNINGER DER MANGLER — til Mads

*Spørgsmål hvor `Claude.md` og GDD'en er tavse, og hvor valget betyder noget. Hver post har det valg der er truffet **imens**, så koden er kørende og grøn — men valget er ikke mit at træffe permanent.*

Skrevet af nat 2 (7/8 2026), branch `nightly/trupdybde`.

---

## 1. Skal Main Stand gøre noget i bestyrelsen? (pakke 7) — ✅ BESVARET, bygget i pakke 15

> **Mads svarede 7/8: begge virkninger.** Bygget i nat 3's pakke 15. VIP-bokse kræver nu Main Stand ≥ 1 (både knappen og udbetalingen — en gammel gemmefil med VIP uden hovedtribune får heller ikke pengene), og en færdig Main Stand giver `BAL.owners.trustMainStand` = +4 tillid pr. niveau. Harness'en måler begge dele og skelner hovedtribunen fra de andre tribuner, så virkningen ikke bare er "byggeri giver tillid". Spørgsmålet nedenfor er bevaret som reference for hvad der blev spurgt om.


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

## 8. Nedrykningen virker — men to tredjedele af karriererne ender på gulvet (pakke 16)

**Målt over 60 seeds × 20 sæsoner, kun pakke 16 til forskel:**

| | uden nedrykning | med nedrykning |
|---|---|---|
| gns. placering, sæson 20 | 12,2 | **10,8** |
| oprykninger, sæson 20 | 1 af 60 | **6 af 60** |
| oprykninger i alt | 185 | **231** |
| oprykninger fra sæson 6 og frem | 89 | **133** |
| lønsum/uge, sæson 20 | £56.626 | **£30.275** |
| sene sæsoner der slutter i minus | 45 % | **39 %** |
| slutkasse, snit | £131.005 | £346.297 |
| sene sæsoner i øverste række | 60 % | **19 %** |
| **slutdivision efter 20 sæsoner** | — | **Premier 9 · L1 6 · L2 5 · League Three 40** |
| nedrykninger pr. karriere | — | 2,57 (60 af 60 karrierer har mindst én) |

**Det gode:** den monotone nedtur er brudt. Placeringen flader ud omkring 9,1-9,8 fra sæson 9 til 15 i stedet for at glide støt mod 12,2, og der rykkes op igen — 133 oprykninger fra sæson 6 og frem mod 89. Nedrykningen er også præcis den økonomiske ventil QA efterlyste: lønsummen i sæson 20 er næsten halveret, fordi en klub ikke længere kan bære en Premier-lønsum i det uendelige.

**Det jeg er i tvivl om:** **40 af 60 karrierer ender i League Three.** Klubben jojoer, men med en nedadgående skævhed. Mekanismen er sandsynligvis at `capOnRelegation` (0,68) er hårdere end `relegationDrop` (0,82) — det er *med vilje*, for det er dét, der gør nedrykning til en krise frem for en gratis nulstilling — men kombineret med at indtægtssiden ikke skalerer (pakke 18's emne) betyder det, at en nedrykket klub er ukonkurrencedygtig og rykker ned igen.

**Jeg har IKKE tunet det væk.** Pakke 18 er bygget til at rette netop indtægtssiden, og den kommer efter med vilje. Tallene ovenfor er målt FØR pakke 18. Hvis fordelingen stadig er så skæv efter 18, er der to knapper:

1. **Blødgør nedrykningen:** `relegationDrop` ned mod 0,74 (= 1/`promotionRise`), så lønnen falder helt tilbage. Prisen er, at nedrykning bliver en gratis nulstilling — og så er der ingen krise at spille sig ud af. Harness'en fejler i dag med vilje, hvis det sker.
2. **Accepter det:** en lower league chairman sim, hvor klubben *hører til* i League Three og hvor de fem sæsoner i Premier Division er karrierens højdepunkt frem for dens hviletilstand, er ikke åbenlyst forkert. GDD'ens kernefantasi er "bygge klubben op fra bunden", ikke "blive der".

Det er et spørgsmål om hvilket spil det skal være, og derfor ikke mit.

## 9. Pengene virker nu — og der er stadig intet at bruge dem på (pakke 18)

**Målt over 60 seeds × 20 sæsoner, kun pakke 18 til forskel.** TV-pengene er gjort geometriske (`BAL.tv`, `base × (perDivision^(3−div) − 1)`) i stedet for to hårdkodede spring, og præmiepengene skalerer nu med divisionen (`BAL.prize.perDivision`) i stedet for at være League Three-penge i alle fire rækker.

| | før 18 | efter 18 |
|---|---|---|
| netto/kampdag ÷ lønsum, Premier | −0,04 | **−0,00** |
| spænd/lønsum, Premier mod League Three | 0,95 mod 0,88 | 0,95 mod 0,90 |
| sene sæsoner der slutter i minus | 43 % | **23 %** |
| administrationer | 249 | **147** |
| slutdivision Premier · L1 · L2 · L3 | 4 · 9 · 10 · 37 | **12 · 14 · 5 · 29** |
| slutkasse, snit | £191.353 | **£706.809** |

Måltallet for pakke 18 var en *fordeling*: samme spredning i division 0 som i division 3. Det er ramt (0,95 mod 0,90), og toppen er gået fra at være en fælde til at gå i nul.

**Det jeg ikke kan tune væk, og som ikke er et balanceproblem:** pengene betyder nu mere, og der er mindre at bruge dem på.

| | før 18 | efter 18 |
|---|---|---|
| sene sæsoner hvor ALT er bygget | 65 % | **79 %** |
| sene sæsoner som eneejer | 21 % | **36 %** |
| største slutkasse | £3,1 mio | **£5,4 mio** |

Det er præcis den anden af QA's to endgame-fejlmåder: *"den ene bot køber sig ihjel, den anden ender med £4,7 millioner den ikke kan bruge på noget."* Pakke 18 har flyttet klubben fra den første til den anden. **Det er efter min vurdering en forbedring** — at have råd og mangle noget at købe er et bedre problem end at blive kvalt — men det er ikke løst, og det kan ikke løses med et tal. QA skrev det selv: køen af indhold (pokal, stab, ungdom, museum) *"giver noget at lave, ikke noget at leve af"*. Nu er det omvendte tilfældet.

**Spørgsmålet til dig:** skal `BAL.prize.perDivision` (0,55) ned igen, når der kommer noget at bruge pengene på? Jeg har valgt at lade den stå, fordi at gøre spilleren fattigere ikke gør endgame mindre tomt — det gør ham bare fattig *og* uden noget at lave.

**Og et fund jeg vil fremhæve, fordi det ligner en fejl og ikke er det.** League Three har det dårligste netto pr. lønkrone af alle fire divisioner (−0,23). Det er ikke bundens økonomi. Splittet ad:

| League Three | kampdage | gns. netto | lønsum | netto/løn |
|---|---|---|---|---|
| aldrig rykket ned | 3.458 | −£1.464 | £11.171 | **−0,13** |
| efter en nedrykning | 8.996 | −£4.268 | £16.330 | **−0,26** |

En klub der *starter* i League Three har en normal økonomi. En klub der *lander* der efter en nedrykning bærer en lønsum på £16.330 hvor divisionen betaler for £11.171 — og det er pakke 16's krise, der virker efter hensigten. Havde jeg kun set totalen, ville jeg have tunet bunden op og dermed fjernet nedrykningens konsekvens uden at opdage det.

---

*Tilføjet af nat 3's overtid, som gik ind i nat 4's kø (pakke 22).*

## 10. Trin 4 er fatalt fra start, fordi du kun ejer 51 % (nat 4, pakke 22)

Femtrins-trappen er bygget. Trin 4 er redningskapital mod andele; trin 5 er at miste kontrollen under 50 %. Medejerne forlanger **5 % hvis de stoler på dig, 10 % hvis de ikke gør** (`BAL.ladder.rescueShare`, tærskel `rescueTrustFloor`).

**Konsekvensen af at starte på 51 %:** den første redning er også den sidste. 51 − 5 = 46, altså under 50. Trin 4 og trin 5 falder sammen i én beslutning, indtil spilleren har købt medejere ud og dermed *købt sig plads til at blive fortyndet*.

**Jeg har valgt at lade det stå sådan**, og at lade modalen sige det ligeud (*"This one ends it. Take this and you are a shareholder, not the chairman."*). Begrundelsen er GDD-konsistens: ROADMAP'en siger *"game over bliver noget du går ind i med åbne øjne, én beslutning ad gangen"* og *"du kan altid se hvor mange trin der er tilbage, fordi din ejerandel står på klubskærmen"*. På 51 % er svaret "ét trin", og det er ærligt. `buyOutOwner()` findes allerede og er den eneste vej til mere plads — hvilket giver medejer-opkøb en helt ny grund til at eksistere.

**Alternativet, hvis du synes det er for hårdt:** lad skiven blive skåret ned, så den aldrig tager dig under 50 med det samme (fx `Math.min(myShare − 50 + 1, share)`). Så bliver trin 4 en rigtig mellemstation — men prisen er, at redningen på 51 % kun koster 2 %, og at trin 5 aldrig kan nås direkte. Jeg prøvede den variant først; den gør trappen blødere og trin 5 nærmest uopnåelig.

**Målt (20 seeds × 20 sæsoner, botprofil `sane`):**

| | før nat 4 | efter pakke 22 | ROADMAP's mål |
|---|---|---|---|
| administrationer pr. karriere | 2,45 | **1,05** | ~1 |
| trin 4 tilbudt pr. karriere | — | 0,30 | — |
| karrierer der når trin 5 | — | **20 %** | 5-15 % |

Administrationstallet rammer plet. **Game over-tallet ligger over båndet**, og jeg vil gerne være tydelig om hvorfor jeg ikke bare har skruet på det: botten tager imod redningen i **85 %** af tilfældene i `sane`-profilen, også når modalen udtrykkeligt advarer om at den er fatal. Det er en botpolitik, ikke en spillerbeslutning — et menneske der læser *"This one ends it"* ville formentlig sige nej og tage administrationen. Tallet er altså et **loft** for hvor tit det sker, ikke et estimat. Skal det ned uanset, er knappen `BAL.ladder.rescueShare` (mindre skive) eller `controlAt` (lavere grænse).

## 11. Banken gør klubben skrøbeligere — og det trækker trappens måltal ud af båndet (nat 4, pakke 23)

Den rigtige bank er bygget: du vælger beløb og løbetid, banken vælger renten ud fra division, klubværdi, kassestilling, hvor meget du allerede skylder og hver administration på papiret. Lån er en **liste**, så du kan bygge på kredit og stadig have en nødlinje — og trin 2 i trappen bliver ægte, fordi banken siger nej *fordi du allerede skylder*.

**Prisen, målt over 20 seeds × 20 sæsoner:**

| | efter pakke 22 | efter pakke 23 | mål |
|---|---|---|---|
| administrationer pr. karriere | 1,05 | **1,95** | ~1 |
| trin 4 tilbudt pr. karriere | 0,30 | **1,70** | — |
| karrierer hvor trin 5 er inden for rækkevidde | — | **35 %** | 5-15 % |

Gæld gør klubben skrøbelig. Det er ikke en fejl — det er hele meningen med et lån — men det flytter to af nat 4's egne måltal ud af båndet, og **jeg har ikke tunet det væk i stilhed.**

**Hvad jeg prøvede:** `BAL.bank.exposureCap` fra 0,40 ned til 0,26. Det flyttede ingenting (1,70 → 1,90 trin 4-tilbud, dvs. støj). Loftet er altså ikke det, der driver tallet — det er, at en klub med en trup på 13 og et åbent kriselån ikke har nogen udvej tilbage. Jeg satte den tilbage på 0,40 og lod tallet stå.

**Hvad jeg rettede undervejs, fordi det var botten og ikke spillet:**
- Botten lånte hver 20. tomgangsrunde uden at ville noget med pengene: 11,7 lån pr. karriere, gæld uden gevinst. Nu låner den kun når der er noget at bygge og kassen ikke rækker — som pakken er bygget til. 3,25 lån pr. karriere.
- Botten sagde ja til den *fatale* redning i 85 % af tilfældene, også når modalen skriver "This one ends it". Det tal (40 % af karriererne mistet) sagde mere om politikken end om spillet. `sane` vælger nu administrationen når alternativet er at aflevere klubben.

**Spørgsmålet til dig:** skal banken være sværere at komme til for en klub der allerede taber penge? Den mest oplagte knap er at lade `loanHeadroom()` skalere med `G.netEwma` — *"banken låner mod indtjening, ikke mod håb"*. Det ville ramme præcis de klubber der i dag låner sig ind i trappen, uden at røre den klub der låner for at bygge en tribune den kan betale af. Jeg har ikke bygget den, fordi det er en ny regel og ikke en justering.

## 12. Nat 4's fire pakker gør tilsammen klubben markant skrøbeligere (pakke 22-25)

Målt over **60 seeds × 20 sæsoner, begge botprofiler**, med hele nat 4 bygget:

| | nat 3 færdig (200×20) | nat 4 færdig (60×20) |
|---|---|---|
| administrationer pr. karriere, `sane` | 2,3 | **4,15** |
| administrationer pr. karriere, `lazy` | 0,45 | **0,63** |
| trin 4 tilbudt pr. karriere, `sane` | — | 4,07 |
| karrierer hvor trin 5 er inden for rækkevidde, `sane` | — | 63 % |
| kampdage med under 11 friske | 31 % | **40 %** |
| sene sæsoner i minus, `sane` | 21 % | 35 % |
| store kampe pr. sæson | 4,0 | 3,4 ✅ |
| trup ved sæsonslut | 15,5 | 14,7 ✅ |

**ROADMAP'ens mål for nat 4 var administration ~1 gang pr. karriere.** Vi er på 4,15 for den aktive bot — altså tilbage ved det tal QA klagede over (4,5), efter at nat 3 havde fået det ned på 2,3.

**Hvorfor, og hvorfor jeg ikke bare har skruet det væk:** de fire pakker trækker samme vej, hver for sig med god grund.

- **pakke 23** giver gæld, og gæld gør skrøbelig.
- **pakke 24** lader et brudt key-løfte koste bestyrelsestillid, og lav tillid gør både lån og andele dyrere.
- **pakke 25** lader "vi skal have tre point" koste ben og skader, så en aktiv formand har en tyndere trup.
- **pakke 22** samler regningen op: når der hverken er en mand at sælge eller et lån at tage, står trin 4 der.

Bemærk at `lazy` — botten der ikke låner, ikke forlanger og ikke bygger — ligger på **0,63**. Det er altså ikke spillet der er blevet umuligt; det er **aktiv spil der er blevet dyrt.** Om det er den rigtige pris er en designbeslutning, ikke en fejl.

**Det jeg vil advare imod:** jeg brugte en time på at tune pakke 25 mod målinger på **20 seeds × 20 sæsoner**, og tallene svingede 2,75 → 3,40 → 5,10 administrationer på parameterændringer der burde have flyttet lidt. Det var **stikprøvestøj**, ikke signal — 20 karrierer er for få til at tune på, og jeg opdagede det for sent. Alle tal ovenfor er derfor målt på 60 seeds × 20 sæsoner med begge profiler, og de tre mellemregninger er kasseret. **Tun ikke nat 4 på 20 seeds.**

**Den knap jeg tror på, hvis det skal ned:** `loanHeadroom()` skal skalere med `G.netEwma` (punkt 11). Det rammer præcis den klub der låner sig ind i trappen, uden at røre den der låner for at bygge en tribune den kan betale af — og det er den ene af de fire tråde der ikke har en naturlig bremse i dag.

---

## 13. A2: decimaltegnet i millioner er dansk, resten af tallene er en-GB (nat 7)

`WORKPLAN-OEJEBLIKKE.md` A2 dikterer formen ordret: under £1M → `£950k`, derover
→ `£1,02M`. Jeg har bygget den præcis så, med **dansk decimalkomma**, fordi hele
fladen er dansk og fordi valget er dit.

**Men det støder mod resten af talformateringen**, og det skal du kende:

| funktion | eksempel | komma betyder |
|---|---|---|
| `gbp()` (fulde beløb) | `£276,028` | **tusinder** (en-GB) |
| `kfmt()` k-grenen | `£12.5k` | punktum er decimal (en-GB) |
| `kfmt()` M-grenen (ny) | `£1,02M` | **decimal** (dansk) |

Står `£1,02M` og `£276,028` på samme skærm — og det gør de, fx på Økonomi-fanen
— kan samme tegn læses som to ting. `£1,02M` kan læses som "1020 millioner".

**Jeg har ikke lavet dit valg om.** Alternativerne, hvis du vil flytte det:

1. **Behold som nu** (dansk komma). Konsekvent med prosaen, kolliderer med tallene.
2. **`£1.02M`** — ét tegn i `mnum()` (fjern `.replace(".",",")`). Konsekvent med
   `£12.5k` og `£276,028`; mindre dansk.
3. **`£1,02 mio.`** — utvetydigt dansk, men længere, og toplinjen er smal på en iPhone.

Ændringen er ét sted: `mnum()` lige over `kfmt()` i prototypen. Sig til, så retter
jeg den på et minut. Jeg har **ikke** rørt k-grenens punktum, for den har stået
sådan siden pakke 1 og harness'ens `kOf()` spejler den.

---

## 14. B2's drift gør League Three ~4× strammere — er det prisen du vil betale? (nat 7)

B2 er bygget som du dikterede: driften er **fast pr. niveau**, indtægten følger
fremmødet, og nedlukning er en ægte nødbremse. Modellen virker præcis som
beskrevet — målt på spillets egen `gateReceipts()` + `facUpkeep()`:

| shop+pub+basics, netto pr. hjemmekampdag | niveau 1 | niveau 3 |
|---|---|---|
| fuld klub (kap 7.800 · 7.439 tilskuere) | +£18.723 | **+£32.918** |
| arveklubben (kap 1.500 · 916 tilskuere) | +£1.697 | **−£3.017** |

Overinvestering **er** en fejl man kan lave. Det er den ønskede figur.

**Men prisen rammer den division der spilles mest.** Netto pr. kampdag i
League Three, 10 seeds × 5 sæsoner:

| | netto/kampdag i League Three | efter en nedrykning |
|---|---|---|
| før B2 | **−£835** | −£432 |
| kun niveauer, drift = 0 | −£1.780 | −£5.028 |
| kun drift, loft = niveau 1 | −£2.562 | −£3.495 |
| **B2 som bygget** | **−£3.356** | **−£6.502** |

Altså cirka **halvdelen fra den faste drift** og **halvdelen fra at der nu altid
er et næste niveau at købe** — botten geninvesterer, hvor den før var færdig.
Begge halvdele er tilsigtede virkninger af B2.

**Tre ting, ærligt:**

1. **Alle måltal i `Claude.md` holder stadig.** Netto sæson 1 −£1.842 (mål ±£2k),
   indtjening sæson 1 £145k (mål £100-260k), trup 16,7/14,7, administrationer 0,
   store kampe 4,5, oprykninger 7/10 i sæson 1.
2. **Tallet er et loft for smerten, ikke smerten.** Botten bruger nødbremsen
   dårligt — den lukker kun ned med 30 % sandsynlighed når kassen er *under nul*,
   og genåbner ved £120k. En spiller der lukker ned, når han rykker ned, får et
   markant bedre tal end −£6.502. Jeg kan ikke måle en spiller.
3. **Det trækker samme vej som QA's advarsel.** QA (§6) målte at aktivt spil
   allerede straffes: `sane` −£149/kampdag mod `lazy` +£7.123. B2's drift betales
   kun af den, der bygger. Det gør forskellen større, ikke mindre.

**Skruen er én linje:** `BAL.fac.upkeepOfBuild` (0,011 nu). Jeg målte 0,009 og
0,007 også. Bemærk at de **ikke** hjalp på League Three (−£3.334 og −£3.604 —
billigere drift fik botten til at bygge mere), og at 0,007 gør niveau 3 i
arveklubben til −£85, altså praktisk taget gratis: så forsvinder hele pointen om
at man kan overinvestere. **0,011 er det tal hvor din model er tydeligst.** Jeg
har ikke tunet det væk, men du skal kende regningen.

Den anden skrue, hvis League Three skal have luft uden at modellen mister form:
lad driften **skalere med divisionen** (en shop i Premier koster mere i løn end
en shop i League Three). Det er B4's tema, og de to bør designes sammen — derfor
har jeg ikke gjort det på egen hånd.
