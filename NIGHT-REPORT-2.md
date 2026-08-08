# NIGHT-REPORT 2 — nightly/trupdybde

*Kørt 6.-7./8 2026, 20:30–22:20 UTC. Branch `nightly/trupdybde` oven på `ef74911`. `master` er ikke rørt.*

Rækkefølgen var som foreskrevet: **5 → 6 → 7 → 8 → 9 → 10 → 11**. **Alle syv pakker blev færdige**, hver med sin egen commit, hver committet på grøn harness (`REGRESSION_OK`). Ingen rød kode er committet. Der var knap to timer tilbage til den hårde stop kl. 02:00 UTC, som derfor aldrig blev relevant.

| Pakke | Emne | Status |
|---|---|---|
| 5 | Ingen kamp er nogensinde stor | ✅ `8c2acd5` |
| 6 | Tekstbiblioteket | ✅ `1f47e51` |
| 7 | Tekst mod kode | ✅ `9d755d5` |
| 8 | Blindgyde-auditten gøres permanent | ✅ `e3a2a13` |
| 9 | To botprofiler | ✅ `f38d396` |
| 10 | Endgame-balance, sæson 10-20 | ✅ `7377ca3` |
| 11 | Efter kampen | ✅ `9daf6e1` |
| — | Oprydning efter pakke 11 (fundet af auditten selv) | ✅ `d379939` |
| — | Efterprøvning af pakke 8's nedgraderingsfejl | ✅ `a831a46` |

Verifikation efter hver pakke: `node --check proto-extract.js` og `node test-harness.js --seeds=10 --seasons=5 --stats`. Slutverifikation også med `--bot=both` og med **50 seeds × 20 sæsoner × begge profiler = 100 karrierer**, alle grønne.

---

## Måltal FØR og EFTER

FØR er `nightly/trupdybde` ved `ef74911` (nat 1's slutpunkt), målt i nat med det samme instrument — ikke tal fra hukommelsen. Begge kolonner: 10 seeds × 5 sæsoner, botprofil `sane`.

| Måltal | FØR (nat 1) | EFTER (nat 2) | Mål | |
|---|---|---|---|---|
| Netto pr. kampdag, sæson 1 | −£666 | **−£1.170** | ±£2.000 | ✅ |
| Indtjening sæson 1 | £118.591 | **£105.735** | £100-260k | ✅ |
| Administrationer | 4 | **1** | 0-4 | ✅ |
| Bank-ultimatummer | 47 | 32 | — | |
| Trup ved sæsonslut | 14,35 | **14,60** | over 13 | ✅ |
| Trup pr. kampdag | 16,2-16,8 | **16,5-17,0** | 16-17 | ✅ |
| Kampdage med under 11 friske | 34 % | **27 %** | — | ✅ |
| Klubværdi S1 → S4 | £1,04 mio → £1,59 mio | £0,99 mio → £1,82 mio | — | |
| Sæsoner hvor værdien FALDT | 11 af 30 | 12 af 30 | >0 | ✅ |
| Køb på rater | 32 % | 29 % | — | |
| Oprykninger i alt (S1-5) | 14 | **19** | — | |
| Oprykninger sæson 1 | 6/10 | 6/10 | 5-8 | ✅ |
| Oprykninger sæson 5 | 0/10 | **4/10** | 1-3 | ✅ |
| **Store kampe pr. sæson** | **0 af 26** | **3,4 af 26** | 3-5 | ✅ |
| **Ticker- og nyhedslinjer** | **20** | **268** | GDD: 300-500 | ⚠️ se nedenfor |
| **Sponsorer / trænere** | 4 / 3 | **10 / 8** | 10 / 8 | ✅ |
| Protest: ro / bannere / tavshed / boykot | 82 / 9 / 8 / 1 % | 81 / 6 / 9 / 4 % | — | |

**Nat 1's åbne afvigelse er lukket af sig selv.** Administrationer faldt 4 → 1 og sæson 5's oprykninger 0/10 → 4/10, uden at jeg rørte `BAL.protest`. Årsagen er pakke 5: 3-4 store kampe om året bærer pristillæg og de to gate-multiplikatorer, og den gate-indtægt er nok til at holde klubberne ude af spiralen. Det er ikke en tuning, det er en mekanik der begyndte at virke.

### Pr. pakke, det tal der er pakkens bevis

- **Pakke 5:** 0 → 3,4 store kampe pr. sæson (spænd 1-8, 0 af 50 sæsoner uden). Alle fire kilder leverer: sidste spilledag 29, nr. 1 mod nr. 2 13, sekser 102, returopgør 27. Hjemme-gate ved stor kamp £35.951 mod £23.637 (+52 %).
- **Pakke 6:** 20 → 268 linjer. 24 af 65 målbeskrivelser, 16 af 48 nærchancer og 27 af 65 klubnyheder er kontekst-tagget. **32 af 32 tags produceres faktisk i spil.**
- **Pakke 7:** 17 talløfter bygges nu af `BAL` i stedet for at være skrevet af. Adfærdsneutral: samtlige måltal identiske før/efter.
- **Pakke 8:** 52 onclick-mål verificeres, 268 funktioner gennemgås statisk, 53 knapper spores. Fandt 1 død funktion og 1 rigtig fejl (se nedenfor).
- **Pakke 9:** trup ved sæsonslut 14,60 (sane) mod **13,00** (lazy) — samme spilkode, samme frø.
- **Pakke 10:** 58 % af sæsonerne efter sæson 10 slutter i minus mod 19 % tidligt; 60 % af de sene sæsoner har alt bygget.
- **Pakke 11:** analyselinjen indeholder nu tal; hver af de otte trænerstile har replikker kun den kan sige.

---

## De to største fund — begge er ting jeg ikke gik efter

### 1. Endgame er ikke for let. Det er tomt, og klubben kvæles langsomt.

Målt over 50 seeds × 20 sæsoner med begge profiler:

| | sæson 1-5 | sæson 10+ |
|---|---|---|
| sæsoner der slutter i MINUS | 19 % | **58 %** |
| sæsoner med et lån hængende | — | 27 % |
| sæsoner hvor ALT er bygget | — | **60 %** |
| sæsoner som eneejer | — | 15 % |

Klubben klatrer, bygger færdigt omkring sæson 6-8, topper økonomisk, og synker derefter. Lønsummen ganges opad ved hver oprykning (`promotionRise` 1,35 pr. gang plus loftet), mens indtægten har et **loft**: `townDemand()` er byen, ikke betonen. Fra omkring sæson 12 er klubben strukturelt underskudsgivende, truppen falder tilbage til gulvet på 13, og administrationerne stabler sig op (269 over 100 karrierer). Der er ingen nedrykning, så divisionen kan kun gå én vej — man sidder fast i toppen med en økonomi der ikke kan bære den, og intet at bruge penge på.

Jeg har **ikke** bygget noget for at fylde hullet. Tre spørgsmål ligger i `DECISIONS-NEEDED.md` punkt 5: nedrykning, løn mod by, og om der skal være noget at bygge efter sæson 8. Værd at vide: *endgame-tomheden er den bedste begrundelse for køen til de kommende nætter* — bedre end at pokal og museum er sjove.

### 2. `silentHome` er ikke den knap den ligner.

Nat 1 spurgte "hvor mange administrationer må en karriere tåle" og pegede på `BAL.protest.silentHome` og `easing` som skruerne. Jeg målte tre niveauer og skilte derefter de to skruer ad (12 seeds × 12 sæsoner):

| `silentHome` | `easing` | kampdage i ro | administrationer |
|---|---|---|---|
| 0,04 | 0,04 | — | 25 |
| **0,13 (nu)** | **0,08** | ~78 % | **24** |
| 0,13 | 0,14 | 74,5 % | 17 |
| **0,20** | 0,08 | **98,6 %** | **2** |

`silentHome` er ikke en "hvor meget koster tavshed"-skrue. Den er **forstærkningen i en selvsvingende sløjfe**: tavshed koster hjemmebanefordel → hjemmenederlag → stemningen falder → dybere protest. Ved 0,13 tænder sløjfen. Ved 0,20 tænder den ikke, og klubben når så godt som **aldrig** trappen overhovedet — 98,6 % ro, hvilket gør nat 1's arbejde med trin og hysterese til dekoration. Der er et vippepunkt mellem 0,13 og 0,20, og spillet er fundamentalt forskelligt på hver side. `easing` er til sammenligning mild.

Intet er tunet. Spørgsmålet er omformuleret i `DECISIONS-NEEDED.md` punkt 2, med målingerne.

---

## Fejl fundet og rettet undervejs (ikke bestilt, men rigtige)

1. **`G.sponsor.stunt` var et delt objekt.** Min egen fejl fra pakke 6: `{...o}` er en shallow kopi, så den underskrevne aftale og det tilbud der stadig lå i indbakken pegede på **samme** objekt. `assertSerialisable` kræver et træ. Optrådte i 1 af 100 karrierer over 20 sæsoner og aldrig ved fem. Rettet med `sponsorCopy()`. **Efterprøvet ved at rulle rettelsen tilbage: samme seed (254408) fejler igen.**
2. **Fondens mål kunne pege på et passeret niveau.** Sæt målet på en tribune, betal derefter niveauerne kontant → `STANDCOST[3]` findes ikke (£NaN i budgetmodalen), og når fonden blev fuld, startede den et byggeri på det forældede niveau. `finishStand()` sætter `G.stands[key]=b.lvl` direkte, så **en færdig tribune blev nedgraderet og regningen betalt.** Rettet tre steder med én fælles regel.
3. **Klubværdiens indtjenings-assertion fejlede på en klub der sad fast på værdigulvet** — `max()` spiser begge veje. Nat 1 noterede faren og satte vagten på de *øvrige* assertions, men ikke på denne.
4. **`commitmentsPerSeason()`** blev aldrig kaldt fra nogen steder. Slettet.
5. **Modalerne var aldrig blevet skannet.** `checkHtml()` kørte kun på de seks skærme, og modalerne er den største del af UI'et. Det er grunden til at fejl 2 kunne overleve.

---

## Hvor jeg afveg fra `WORKPLAN-NAT2.md` — og hvorfor

1. **Pakke 5, sekserens definition.** WORKPLAN'en skriver "mod klubben lige over eller under dig". Præcis ±1 plads gav **1,5 store kampe pr. sæson** og 8 af 50 sæsoner helt uden én — langt under kravet om 3-5. Sekseren kræver nu at modstanderen er inden for `rivalGap` pladser **og** `rivalPts` point. Begge skal passe: plads alene gør et 9-points hul til en sekser, point alene parrer dig med en klub elleve pladser væk. Endte på 3,4. `lateFrom` gik samtidig 18 → 14, så "sent i sæsonen" er returhalvdelen.

2. **Pakke 5, ingen fremmøde-bonus ved store kampe.** GDD nævner "ekstra tilskuere" om derbyet, men WORKPLAN'en beder om målbar effekt på *gate*, ikke om et nyt efterspørgselsled — og enhver ny multiplikator på fremmødet skulle balanceres mod `townDemand()`s loft, som er hele grunden til at tribuner ikke er en pengemaskine. Ikke gjort. Spørgsmålet ligger i `DECISIONS-NEEDED.md` punkt 3.

3. **Pakke 6 nåede 268 linjer, ikke GDD'ens 300-500.** WORKPLAN'ens egne puljemål er alle nået eller overgået (GOALDESC 65 mod 60, NEARMISS 48 mod 40, FLAVOR 65 mod 60, SPONSORS 10, COACHES 8). Jeg tilføjede fire puljer WORKPLAN'en ikke nævner — straffespark, modstandermål, momentum og den bortsolgte spillers to toner — fordi de alle fire var **hardkodede enkeltlinjer** i tickeren, altså præcis den fejl pakken retter. Men jeg nåede ikke GDD'ens samlede tal, og jeg har ikke skrevet det op til 300 for tallets skyld.

4. **Pakke 7 rettede også koden, ikke kun teksten.** Sponsorernes to adfærd (kollaps, stunt) var *navnetjek* inde i logikken. Med fire sponsorer gik det an; med ti ville seks være ren dekoration. De er felter nu.

5. **Pakke 9 gik videre end `--bot=lazy|sane`.** `--bot=both` kører hver seed med begge profiler og stiller dem op mod hinanden, og en manglende forskel giver **exit-kode 1**. Uden det ville profilen kunne blive til dekoration uden at nogen bemærkede det.

6. **Pakke 10 målte ikke tre niveauer af *begge* skruer, men fem kombinationer.** Det var nødvendigt for at opdage, at de to skruer ikke er ligeværdige.

7. **`Claude.md`s måltal er genformuleret**, som WORKPLAN'en beder om — og også rettet ét sted hvor den var direkte forkert: den sagde "Sæson = 16 kampe", koden har altid kørt 26.

---

## Sabotage — 43 forsøg, og hvad de fangede

Sabotageforsøget var **første** skridt for hver ny invariant. Sammenlagt 43 bevidste ødelæggelser. De vigtigste er dem der **bestod**, for det er dem der viser, at en invariant målte det forkerte:

1. **Pakke 5, to assertions bestod mod død kode.** "Sidste spilledag gav en stor kamp" og "naboen gav en sekser" spurgte kun, om der *kom* et resultat — og en flad tabel udløser også de andre regler. Begge bestod med reglen slået fra. De prøver nu på hvert sit mærkat.
2. **Pakke 6, den tomme pulje.** Mit første forsøg taggede to linjer snævert, hvilket ikke kunne tømme noget. **Sabotagen var forkert, ikke testen.**
3. **Pakke 9, salgsgulvet.** Første prøve var trupstørrelsen ved sæsonslut — og den bestod med gaten **helt åben**, fordi de tre andre politikker tynder truppen alligevel. Tælles nu direkte: vil botten sælge fra en trup på 14-16? sane 0, lazy 252.
4. **Pakke 11, to maskede opsætninger.** Modstanderen var enten overlegen på alt eller underlegen på alt, så rækkefølgen kunne slet ikke afgøres, og begge bestod med vægtningen fjernet. Der skal konstrueres et tilfælde hvor de rå forskelle er næsten lige store (+20 god mod +18 dårlig).
5. **Pakke 11, en test der målte to tilstande.** Jeg læste faktorerne i én tilstand og sætningen i en anden, fordi jeg rullede opsætningen tilbage én linje for tidligt.

Og én **kontrolprøve der skal bestå**: ændrer man `BAL.matchday.shop` og lader teksten være genereret, forbliver pakke 7's test grøn. Uden den kontrol kunne invarianten være en frossen konstant der bare tilfældigvis matchede.

**Auditten fangede sin egen forfatter to gange.** Pakke 6's tag-rapport meldte `late` som aldrig produceret (jeg byggede konteksten et sted instrumenteringen ikke kunne se), og efter pakke 11 meldte den de otte trænerstile plus tre tags jeg havde tilføjet spekulativt og aldrig brugt. Begge rettet.

---

## Hvad jeg var i tvivl om

**Om pakke 5's frekvens er tunet eller fundet.** 3,4 pr. sæson ligger midt i WORKPLAN'ens bånd, men jeg nåede det ved at justere fire tærskler i træk og måle efter hver. Jeg mener, hver enkelt justering kan forsvares på sin egen formulering — men jeg justerede *indtil tallet passede*, og det er ikke det samme som at tallet faldt ud af mekanikken. **Det ærligste modargument til mig selv:** over 20 sæsoner falder tallet til 2,4, altså under båndet. Frekvensen er ikke en egenskab ved reglerne alene; den afhænger af, om klubben stadig har noget at spille om.

**Om trupdybde-måltallet nogensinde var spillets.** Pakke 9 giver nat 1's forbehold et tal: 14,60 mod 13,00 med samme spilkode. "Trup ved sæsonslut over 13" måler i vid udstrækning **botten**. De tal der ligger tæt (trup pr. kampdag −6 %, store kampe −2 %) er til gengæld troværdige på en måde de ikke var i går.

**Om `analysisMin: 3` er den rigtige grænse.** Under 3 point er en forskel støj, over er den værd at nævne — men den grænse er valgt af mig, ikke målt. Den bestemmer hvor tit analysen siger noget konkret frem for at falde tilbage på "nothing separated these two".

**Om det var rigtigt at slette `commitmentsPerSeason()`.** Den var utvivlsomt ureferereret. Men den beregnede noget en fremtidig funktion kunne have villet have.

---

## Hvad jeg IKKE kunne efterprøve

1. **Intet af det er set med øjne.** Jeg kan ikke se en telefon. Det gælder pakke 11's nye nøgletalskort og analyselinjen på hjemmeskærmen, pakke 5's `biglabel` på prematch-arket og tickeren, og pakke 6's linjer i deres faktiske typografi. Harness'en beviser at markuppen er velformet, at der ikke er NaN, undefined eller uudskiftede pladsholdere, og at ingen knap peger på en funktion der ikke findes — den beviser **ingenting** om hvordan det ser ud. Nat 1 noterede det samme om protest-trappens stadion-tegning; det er stadig uefterprøvet.

2. **Om 268 linjer *føles* som nok, og om tonen holder.** Jeg har verificeret at ingen linje gentages i samme kamp, at ingen klubnyhed gentages inden for en sæson, og at alle 32 kontekst-tags faktisk opstår i spil. Jeg har **ikke** læst en fuld sæsons ticker igennem som en spiller ville, og jeg kan ikke bedømme om linjerne rammer GDD'ens "kunne det stå i en ægte lokalavis?" for et engelsk øre. Det er den ene del af pakke 6 der kun kan afgøres ved at læse den.

3. **Om en stor kamp *føles* stor.** Jeg kan måle at 3,4 om året får et mærkat, et pristillæg, to gate-multiplikatorer og en langsommere ticker. Om spilleren mærker forskellen, når han sidder med telefonen, er ikke et tal.

4. **Endgame-fundet er bottens karriere, ikke et menneskes.** Sane-botten bygger i en bestemt rækkefølge og køber medejere sent. En spiller der droppede stadionfonden og gik efter kontrol i sæson 1, eller som bevidst blev i League Two for at tjene penge, ville få en anden kurve. At **begge** profiler viser samme form (58 % og 45 % underskud sent) gør fundet mere robust, men to bots er ikke et menneske.

5. **Vippepunktet for `silentHome` er ikke lokaliseret.** Jeg målte 0,13 og 0,20 og ved at der sker noget imellem. Jeg har ikke målt 0,16-0,17, som er det interval der ville give en sløjfe der tænder *sjældent*.

6. **Om nogen af de syv mekanikker botten aldrig rører faktisk virker.** Pakke 8 rapporterer dem: `startScout`, `deliverScout`, `withdrawFund`, `budgetBack`, `buildBoost`, `sponsorBoost`, `grantReward`. Knapperne findes og peger på funktioner der findes — det er alt jeg ved. **Hele scout-sporet og fondens udbetaling er utestet ved spil.** Det er den mest oplagte kandidat til en fremtidig nats pakke 0.

---

## Ufravigelige krav

**Formanden udtager stadig aldrig holdet.** Ingen af de syv pakker kommer i nærheden. Pakke 5 udleder `big` af tabellen, ikke af et valg. Pakke 11's analyselinje *forklarer* elleveren bagefter; den lader ingen ændre den. Spillerens eneste svar på en træt trup er stadig at skaffe flere spillere.

**Ingen nye systemer.** Hver pakke er noget der allerede fandtes og ikke virkede godt nok: `big` blev aldrig sat, teksten var slidt igennem, løfterne løj, auditten var engangsscripts, botpolitikken var blandet ind i målingerne, endgame var umålt, og analyselinjen havde ingen tal. Ingen pokal, ingen rival, ingen Youth Day, intet museum, ingen stab, ingen leje.

**`G` er stadig et træ.** `assertSerialisable` er grøn — og fangede undervejs min egen delte objektreference i `G.sponsor.stunt`. Alt nyt (`revenge`, `flavourSeen`) er indekser, strenge og tal. Spillere nøgles på `id`.

**Ingen nye modaltyper.** Ingen af de syv pakker havde brug for én. Harness'en tjekker nu også, at enhver modaltype der kan *sættes*, også bliver *tegnet*.

**Fire designbeslutninger er ikke truffet af mig.** De står i `DECISIONS-NEEDED.md` med målinger og med det valg der er truffet imens, så koden er kørende og grøn.
