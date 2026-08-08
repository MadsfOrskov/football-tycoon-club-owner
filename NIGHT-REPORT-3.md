# NIGHT-REPORT-3 — nat 3, og hele nat 4 bagefter

*Udviklingsagent, 7/8 2026. Branch `nightly/trupdybde`, oven på `02455dc`. Skrevet som allersidste handling.*

**Kort:** nat 3's ti pakker (12-21) er færdige. Derefter gik jeg videre i køen og lavede også alle fire af nat 4's (22-25). Atten commits. Alt er grønt ved **200 seeds × 20 sæsoner med begge botprofiler, nul fejl**.

**Hvis du kun læser to afsnit: læs 6 og 8.** Det er dér jeg er ærlig om hvad tallene ikke viser, og om en time jeg brugte på at tune mod ren stikprøvestøj.

---

## 1. Hvad blev færdigt

| Kø | Pakke | |
|---|---|---|
| nat 3 | 12 · reparér instrumentet | ✅ |
| nat 3 | 13 · dublet-tickerlinjen | ✅ |
| nat 3 | 14 · protest-trappens form og hviletilstand | ✅ |
| nat 3 | 15 · Main Stand får en rolle | ✅ |
| nat 3 | 16 · nedrykning | ✅ |
| nat 3 | 17 · store kampe: tilskuere, og en pris for tillægget | ✅ |
| nat 3 | 18 · endgame-skalering | ✅ |
| nat 3 | 19 · forventningsmødet med medejerne | ✅ |
| nat 3 | 20 · resultatet står fast | ✅ + rettelse |
| nat 3 | 21 · oprydning | ✅ |
| **nat 4** | **22 · femtrins-trappen** | ✅ |
| **nat 4** | **23 · en rigtig bank** | ✅ |
| **nat 4** | **24 · kontraktrollen efter underskrift** | ✅ |
| **nat 4** | **25 · tilgangen som resultatmål** | ✅ + rettelse |

Intet er efterladt uncommittet. **Nat 5 og senere er ikke rørt.**

Én commit pr. pakke, plus tre rettelser og én ren harness-tilføjelse. `git log --oneline 02455dc..HEAD` giver rækkefølgen; hver commit-besked forklarer hvorfor og hvad der blev målt.

---

## 2. Nat 3: målt før og efter

Alle "før"-tal er QA's egne målinger på `02455dc` (200×20). Alle "efter"-tal er min verifikation af nat 3 — også 200 seeds × 20 sæsoner, botprofil `sane`, kørt **før** nat 4 blev bygget.

| | før (QA) | efter nat 3 | mål |
|---|---|---|---|
| **Store kampe pr. sæson** | 2,4 **UDENFOR** | **4,0 OK** | 3-5 |
| sæsoner uden en eneste stor kamp | 5,8 % | **1,8 %** | — |
| de to dominerende kilders andel | 87 % | **52 %** | — |
| topopgøret pr. sæson | 0,064 | **0,27** | — |
| **Oprykninger i alt (10×5, sane/lazy)** | 19 mod 29 i samme kørsel | **19 mod 19** | identiske |
| Regressionsstatus ved 200×20 | **RØD** (dublet-tickerlinje) | **GRØN** | — |
| gns. placering, sæson 20 | 12,2 (monotont fald) | **10,8**, fladt fra sæson 9 | ikke monotont |
| oprykninger i sæson 20 | 1 af 60 | **6 af 60** | — |
| **Administrationer pr. karriere** | 4,5 | **2,3** | — |
| sene sæsoner der slutter i minus | 45 % | **21 %** | — |
| gns. stemning ved 20 sæsoner | 59 | **75** | — |
| kampdage i ro / bannere / tavshed / boykot | 61,9 / 7,0 / 15,5 / 15,5 | **82,2 / 7,6 / 6,6 / 3,5** | — |
| netto pr. kampdag ÷ lønsum, Premier | −0,04 | **+0,05** | ≈ League Three |
| spænd ÷ lønsum, Premier mod League Three | 0,95 / 0,88 | **1,03 / 0,92** | ens |
| trup ved sæsonslut | 13,89 (sæson 19) | **15,48** | over 13 |
| ticker-, nyheds- og gafferlinjer | 268 | **276** | 300-500 (stadig under) |
| nedrykninger pr. karriere | findes ikke | **2,50** · 184 af 200 karrierer | målbart |

**De tre ting jeg er mest tilfreds med:**

1. **Instrumentet (pakke 12).** Det var ikke bare en fejlrettelse. Tvungne scenarier forurenede `stats.md` og `G.history`, så pakke 5 stod som 2,9 "UDENFOR" i stedet for 3,4 "OK", og der var opfundet ti "sæsoner uden en eneste stor kamp" som aldrig blev spillet. Alt hvad jeg har målt i nat, hviler på at det blev rettet først. Seglets selvtjek kører allersidst, efter samtlige scenarier — også dem en fremtidig nat tilføjer.
2. **Nedrykningen (pakke 16) brækkede den monotone nedtur.** Placeringen flader ud omkring 9,1-9,8 fra sæson 9 til 15 i stedet for at glide mod 12,2, og der rykkes op igen: 133 oprykninger fra sæson 6 og frem mod 89. Lønsummen i sæson 20 blev næsten halveret, fordi en klub ikke længere kan bære en Premier-lønsum i det uendelige.
3. **Skaleringen (pakke 18) ramte sit måltal, og måltallet var en fordeling.** Toppen gik fra at være en fælde (−0,04 netto pr. lønkrone) til at gå i nul. Spændet er nu 1,03 i Premier mod 0,92 i League Three — samme udfordring, flere nuller, som Mads' princip forlanger.

---

## 3. Nat 4: målt

Nat 4's fire pakker er bygget efter nat 3 var verificeret. Tallene her er den **endelige** kørsel: 200 seeds × 20 sæsoner, begge profiler.

| | `sane` | `lazy` | ROADMAP's mål |
|---|---|---|---|
| administrationer pr. karriere | **3,69** | **0,63** | ~1 |
| trin 4 (redningskapital) tilbudt pr. karriere | 3,48 | 0,69 | — |
| trin 5 **inden for rækkevidde** | 56 % | **29 %** | 5-15 % |
| trin 5 **faktisk nået** (klubben tabt) | 0 % | **13 %** | — |
| lån optaget pr. karriere | 2,31 | 0,00 | — |
| ordrer: tre point / et point / din afgørelse | 20 / 20 / 60 % | 20 / 20 / 60 % | — |
| gafferens tålmodighed ved karrierens slut (median) | 89 | 96 | — |
| store kampe pr. sæson | 3,5 OK | 3,9 OK | 3-5 |
| trup ved sæsonslut | 14,93 | 13,03 | over 13 |
| gns. stemning | **55** | 59 | — |
| slutdivision: Premier / L1 / L2 / **L3** | 29 / 20 / 25 / **126** | 19 / 36 / 45 / **100** | — |

**Det vigtigste tal i tabellen er forskellen mellem de to søjler.** `lazy` — botten der ikke låner, ikke forlanger og ikke bygger — ligger på 0,63 administrationer og rammer ROADMAP'ens game over-bånd præcist (13 %). `sane` ligger på 3,69. Det er altså ikke spillet der er blevet umuligt efter nat 4; **det er aktivt spil der er blevet dyrt.**

Om det er den rigtige pris er en designbeslutning, ikke en fejl, og den ligger i `DECISIONS-NEEDED.md` punkt 12 med tallene ved siden af.

**Bemærk også at stemningen faldt fra 75 til 55** mellem nat 3 og nat 4 for `sane`. Det er den direkte pris på pakke 25: "vi skal have tre point" og så tabe koster stemning hver gang, og botten siger det i 20 % af kampene. Jeg har ikke tunet det væk — se afsnit 8.

---

## 4. Hvor jeg afveg fra planen, og hvorfor

1. **Jeg lavede hele nat 4.** Arbejdsordren tillod det udtrykkeligt efter verifikation, og verifikationen kom først (afsnit 5). Nat 5 og senere er ikke rørt.
2. **Pakke 19: forventningsmødet ligger som trin 4 af 5, ikke sidst.** Arbejdsordren sagde "femte trin". Opsummeringen skal kunne vise hvad man gik med til, så forhandlingen kommer før den. Den er femte i antal og fjerde i rækken.
3. **Pakke 23: lånene ligger i deres egen liste, ikke i `G.commitments`.** ROADMAP'en beder om det sidste. Det går ikke, og grunden er kadencen: `settleCommitments()` kører én gang pr. sæson, mens et lån afdrages pr. kampdag. Enten skulle lånet skifte takt — og så forsvinder det drypvise pres der er hele dets karakter — eller også skulle `settleCommitments` have en afregningsvej ved siden af sin egen. Lånene har derfor samme *form* som en forpligtelse, men afregnes i `settleFinances`, hvor de allerede blev afregnet.
4. **Pakke 25: `G.gafferPatience` defineres i nat 4.** ROADMAP'en stiller to muligheder op for accept-oddsene ("enten defineres måleren i nat 4 og fyldes med indhold i nat 5, eller også flyttes accept-oddsene hertil") og kalder det et åbent spørgsmål. Jeg valgte den første. Måleren findes nu, den bevæger sig begge veje, og nat 5 kan fodre den med navngivne hændelser uden at røre accept-oddsene.
5. **Pakke 17c: jeg løsnede topopgøret i stedet for at skrotte det.** Arbejdsordren sagde "enten løsnes eller skrottes". Det fyrer nu 0,27 gange pr. sæson mod 0,064 og står for 8 % af alle store kampe.

Alle fem er begrundet i den commit de hører til.

---

## 5. Verifikationen

Arbejdsordrens efter-alle-ti-punkt blev fulgt i den rækkefølge der stod: **verificér først, byg bagefter.**

- **`node test-harness.js --seeds=200 --seasons=20 --bot=both --stats` på nat 3's færdige kode: `REGRESSION_OK`, nul fejl af 400 kørsler.** Det er den kørsel afsnit 2's "efter"-tal kommer fra.
- **Samme kørsel igen på den endelige kode efter nat 4: `REGRESSION_OK`, nul fejl af 400 kørsler.** Afsnit 3's tal.
- **Sabotage-sweep af samtlige invarianter mod den FÆRDIGE kode: 55 af 58 fanget.**

Sweepet er værd at fremhæve som metode, for det fandt noget ingen enkeltkørsel gjorde: **en invariant er kun efterprøvet mod den kode der stod der dengang.** To af nat 3's sabotager kunne ikke længere anvendes, fordi mønsteret var væk — og den ene af dem afslørede en rigtig fejl: pakke 19 havde gjort pakke 16's nulstilling af `G.objectivePos` redundant, så **tre steder håndhævede samme regel**, og man kunne slette et af dem uden at noget fejlede. Det er rettet til ét sted (commit `3792559`).

De tre sabotager der slap igennem er alle dokumenteret **inde i kontrollen** med grunden:

| Slap igennem | Hvorfor, og hvad kontrollen så beviser |
|---|---|
| pakke 18: `rateDivision` fjernet fra lånerenten | Ikke isoleret. Øverste række har også flere TV-penge, så `seasonIncome` stiger og eksponeringsleddet falder af sig selv. Påstanden "en topklub låner billigere" er sand og måles; at det er netop `rateDivision` der gør det, er den ikke bevis for. De tre andre rentelegemer er isolerede. |
| pakke 25: vagten `order==="free"` fjernet | Redundant. `if/else if`-kæden under den rammer kun `"win"` og `"point"`, så der sker ingenting alligevel. Benet står som regressionsvagt hvis kæden en dag får en `else`, ikke som bevis. |
| pakke 16: `G.objectivePos` fjernet fra nedrykningsgrenen | Mønsteret findes ikke længere — se ovenfor. Efter oprydningen er den ene tilbageværende linje sabotage-efterprøvet på ny og fejler. |

Dertil: **QA's punkt om gamle gemmefiler er nu dækket.** QA kaldte det *"den mest sandsynlige uopdagede fejl i hele projektet"*. Nat 3 og 4 tilføjede syv felter til `G`, og pakke 23 rev `G.loan` ned. Harness'en bygger nu en gemmefil som den så ud før i nat, indlæser den med den nye kode, og kræver at gælden overlever migreringen, at det gamle felt ikke bliver hængende, at alle seks skærme kan tegnes og at en kampdag kan afregnes. Sabotage-efterprøvet begge veje. **Den blev skrevet efter 200×20-kørslen var startet, så den kørsel indeholder den ikke** — den er verificeret ved 10×5 og indgår i alt herefter.

---

## 6. Hvad jeg IKKE kunne efterprøve

Dette afsnit er ikke en formalitet. Nat 1, nat 2 og QA skrev alle sammen det samme, og det er stadig sandt.

1. **Intet af det er set med øjne.** Der er ingen browser. Men i nat gjorde jeg noget nat 1 og 2 ikke gjorde: jeg **læste den renderede markup** med `--echo` og oversatte den til tekst. Det fandt en fejl ingen invariant fangede — se afsnit 7's punkt om trænerstilen. Markup kan altså læses, og det burde gøres hver nat. Det siger stadig intet om **layout**: de nye ark (redningskapital, ærens opgørelse, banken, budgetmødets femte trin) tilføjer rækker til allerede lange sheets, og om de kan rulles med en tommelfinger på en iPhone i portrait ved jeg ikke.
2. **Om noget er sjovt.** Jeg har målt at forventningsmødets tre veje rammer målet i 26 %, 49 % og 57 % af sæsonerne — altså en ægte afvejning. Om det *føles* som en forhandling, og om gafferen der siger nej føles som en person eller en terning, er ikke et tal.
3. **Om ærens opgørelse lander.** Trin 5 er bygget til at være et punktum man kan leve med. Jeg kan bevise at den tegnes, at tallene er tal og at den overlever en genstart. Jeg kan ikke vide om den gør et tab til en historie.
4. **Tempo.** Uændret siden nat 1: jeg driver tickeren i en løkke og aner ikke om 750 ms føles rigtigt.
5. **Alle balancetal kommer fra to botpolitikker.** Det er nattens vigtigste forbehold, og jeg har to gange bevist at det betød noget: `sane` sagde ja til den *fatale* redning i 85 % af tilfældene og producerede "40 % af karriererne mistet", og den lånte 11,7 gange pr. karriere uden at ville noget med pengene. Begge tal sagde mere om politikken end om spillet. Jeg rettede politikken begge gange — men det betyder også, at **ethvert tal i afsnit 3 er en funktion af hvordan jeg har fået botten til at opføre sig.** Pakke 9's to profiler er guld værd netop derfor: forskellen mellem søjlerne er politikkens bidrag, og det de har til fælles er spillets.
6. **Jeg har ikke kørt QA's `qa-probes.js`.** Den ligger på `nightly/qa` og er testagentens værktøj. Jeg har kun brugt harness'en. Det betyder at den nysgerrige klikker — den der finder knapper ingen politik trykker på — ikke har set nogen af nattens fjorten pakker.
7. **Jeg har ikke efterprøvet at nat 3's tal stadig holder efter nat 4.** Afsnit 2 og afsnit 3 er to forskellige kørsler af to forskellige kodebaser. Store kampe, trupdybde og skaleringens form holder (de står i afsnit 3), men fx protest-trappens fordeling og stemningen har flyttet sig, og jeg har ikke gennemgået nat 3's måltal ét for ét mod slutkoden.

---

## 7. Fejl jeg fandt i mit eget arbejde undervejs

Jeg skriver dem her, fordi de to forrige rapporter var mest værdifulde dér hvor de var ærlige om det de ikke kunne bevise — og fordi mønsteret er lærerigt.

- **Jeg committede rødt kode én gang.** Pakke 20 var grøn ved 10×6 og **rød ved 60×20** (29 af 60), og jeg committede på den korte kørsel. Det er præcis den fejl arbejdsordren advarer om og præcis den QA fandt hos nat 2. Koden var i orden; det var min egen invariant der målte forkert — den sammenlignede et gemmepunkt med en levende tilstand der var kommet et skridt videre. Rettelsen står som sin egen commit (`61cb34d`), så historikken viser det.
- **To gange målte jeg min egen kopi i stedet for spillet.** Pakke 24's prospect-ben regnede udviklingsformlen efter *inde i harness'en* og ville have bestået mod hvilken som helst kode. Og key-benet kaldte `postMatchMessages()`, mens gennemgangen lå i `finalizeMatch()` — den målte et sted hvor koden ikke var, og fejlede derfor på **korrekt** kode, hvorefter alle syv sabotager så ud til at blive "fanget". Begge dele blev fundet af sabotagen, ikke af kørslen.
- **To kontroller sprang deres egne ben over.** De skrev "hvis vi tilfældigvis står på en spilbar kampdag" — og botten står som regel lige efter et sæsonskifte. Sabotagerne slap igennem. Kontroller skal **tvinge** deres forudsætninger frem, som alle de tvungne scenarier gør.
- **Trænerens stil farvede ingenting hos seks af otte trænere.** `gafferLean()` sniffede stilnavnet med en regex, og den ramte `attacking` og `defensive`. De seks andre faldt igennem til 0, så "tre point" og "et point" viste **nøjagtig samme accept-odds** hos tre fjerdedele af alle gaffere. Det så jeg kun fordi jeg læste den renderede markup. En regex der ikke matcher ser ud som om alt er i orden; en **tabel** kan mangle en nøgle, og det kan en invariant se. Det er nu en tabel med en invariant på.
- **Fem eksisterende invarianter havde en præmis mine pakker gjorde forkert**, og de skal nævnes, fordi de alle sammen bestod indtil noget ændrede sig under dem: `checkBigSources` påstod at et bundopgør *aldrig* måtte være stort ("der er ingen nedrykning at spille om" — sandt indtil pakke 16); `checkBankCascade` antog at "hverken salg eller lån" førte direkte i administration (sandt indtil pakke 22 skød trin 4 ind); klubværdiens gulv og bestyrelsens tillidsbund klemte begge et *strengt* fald, hvilket først blev nåeligt da nedrykningen gav −14 tillid; og `ownerPremium`'s loft gjorde det samme fra oven.

---

## 8. Det jeg var mest i tvivl om

**Den time jeg brugte på at tune mod støj.** Efter pakke 25 målte jeg administrationer på **20 seeds × 20 sæsoner** og så tallet svinge 2,75 → 3,40 → 5,10 på parameterændringer der burde have flyttet lidt. Jeg behandlede det som signal og tunede efter det i næsten en time, før jeg indså at 20 karrierer er alt for få. Jeg kasserede de tre mellemregninger, valgte parametrene på princip i stedet, og målte én gang ordentligt på 60 og siden 200 seeds. **Tun ikke nat 4 på 20 seeds.** Det er den vigtigste praktiske ting jeg lærte i nat.

De øvrige tvivlsspørgsmål ligger som punkt 6-12 i `DECISIONS-NEEDED.md` med tal ved siden af. De tre tungeste:

- **Punkt 8: to tredjedele af karriererne ender i League Three** (126 af 200 for `sane`). Nedrykningen virker efter hensigten, men jojo'en har en nedadgående skævhed. Jeg har ikke tunet den væk; mekanismen er at `capOnRelegation` (0,68) er hårdere end `relegationDrop` (0,82), og det er *med vilje* — det er dét, der gør nedrykning til en krise frem for en gratis nulstilling. Harness'en fejler bevidst hvis den bliver en nulstilling.
- **Punkt 10: på 51 % er den første redning også den sidste.** 51 − 5 = 46. Trin 4 og trin 5 falder sammen i én beslutning, indtil man har *købt* sig plads ved at købe medejere ud — hvilket giver medejer-opkøb en helt ny grund til at eksistere. Jeg prøvede varianten hvor skiven skæres ned; den gør trappen blødere og trin 5 næsten uopnåelig.
- **Punkt 12: nat 4's fire pakker trækker samme vej.** Gæld gør skrøbelig, et brudt key-løfte koster tillid, en jagtet sejr koster ben, og trin 4 samler regningen op. Hver for sig er de rigtige; tilsammen sender de administrationer fra 2,3 til 3,69 for den aktive bot. Den knap jeg tror på, hvis det skal ned, er at lade `loanHeadroom()` skalere med `G.netEwma` — *banken låner mod indtjening, ikke mod håb*. Det er en ny regel, ikke en justering, så jeg har ikke bygget den.

Og ét jeg vil fremhæve, fordi det **ligner** en fejl og ikke er det: League Three har det dårligste netto pr. lønkrone af alle fire divisioner (−0,26). Splittet ad er en klub der *aldrig* er rykket ned på −0,12 med en lønsum på £11.176, mens en der er *landet* der bærer £15.936 rundt. Det er pakke 16's krise, der virker. **Havde jeg kun set totalen, ville jeg have skruet bunden op og fjernet nedrykningens konsekvens uden at opdage det.** Splittet står nu fast i `--stats`.

---

## 9. Til den næste nat

- **Nat 5 (staben) er ikke rørt**, som aftalt. `G.gafferPatience` findes nu og bevæger sig begge veje; den venter på navngivne hændelser.
- **Køen efter nat 4 ligger i `ROADMAP.md`.** Nat 5 er den næste.
- **Kør sabotage-sweepet mod den færdige kode, ikke kun mod koden som den så ud da invarianten blev skrevet.** Det fandt en redundant regel i nat, og det er billigt: 58 sabotager tog under en time.
- **Læs den renderede markup med `--echo`.** Det fandt en død mekanik som fire invarianter og 4.000 sæsoner ikke fangede.
- **Og hvis nogen skal måle noget: brug mindst 60 seeds.** Helst 200.
