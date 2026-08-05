# FOOTBALL TYCOON: CLUB OWNER — Game Design Document (v5.0 · komplet)

**NAVNET (endeligt besluttet 5/8 2026):** FOOTBALL TYCOON: CLUB OWNER (27 tegn) — fire søgeord i én titel: football, tycoon, club, owner. Undertitel bærer nichen: *"Lower league chairman sim"* (rammer "lower league" + "chairman"). US-titel via App Stores lokale titler: *"Soccer Tycoon: Club Owner"*. OBS ved lancering: gencheck kollisioner (Soccer Tycoon findes som selvstændigt spil — vores fulde kombination var fri ved research 5/8-2026) + sikr domæne og sociale handles tidligt. De stemningsfulde navne (Pies & Glory, The Shed End, Grassroots) lever videre INDE i spillet som steder og sjæl. *(Tidligere arbejdstitler: GRASSROOTS, Football Club Tycoon.)*

*Arbejdstitel. August 2026. Alle designvalg herunder er truffet af Mads i fuld gennemgang — dette er spillets bibel. Roadmap-faserne (v1.0 → v1.4) er byggerækkefølge, ikke ambitionsloft.*

---

## Vision

**"Byg en glemt fodboldklub op fra ingenting — med hjertet i den engelske gruspyramide og et glimt i øjet."**

Du er ejer og sportsdirektør: manden der bygger tribunerne, skriver under med bryggeriet, ansætter og fyrer træneren — og finder guldfuglen på en fri transfer før alle andre. Fire divisioner op. Ét livsværk.

**De fem søjler:** Charmerende tone med glimt i øjet · Ejeren møder sportsdirektøren · Fra bunden, én vej op · Engelsk-inspireret 100% fiktivt univers · Minimalistisk, moderne, indbydende design.

**Designsystemet (låst 4/8 2026): "Floodlight & Matchday".** To tilstande af samme design: **Floodlight** (mørk — aftenkamp under projektørerne, standard) og **Matchday** (lys — eftermiddagskamp i dagslys). Spilleren vælger frit i indstillinger, eller følger telefonens lys/mørk automatisk. Stadion-illustrationen skifter med: tændte projektører og lysende vinduer om natten, sol og skygger om dagen. Mørk aftenkamp-æstetik med glødende accenter, kursiveret condensed sportstypografi (Barlow Condensed 900 italic til display, Inter til UI), klub-badges, glas-paneler og projektørlys i baggrunden. **Temaet følger klubfarverne:** spilleren vælger klubfarve ved oprettelse, og en palette-motor udleder hele temaet automatisk (baggrund, paneler, glød, kanter — bevist med rød/tangerine/violet). Faste regler i motoren: græsset er ALTID grønt; kommercielle handlinger (ads/køb) har altid deres egen accent, der roteres væk hvis klubfarven kolliderer; semantiske farver (sejr/nederlag i form-visning) skal holdes adskilt fra klubfarven — vundne kampe markeres med form/ikon, ikke kun farve, så en rød klub stadig kan aflæse W fra L.

---

## LOV: Ingen nøgne transaktioner (Mads' regel, 5/8 2026)

Intet i spillet er bare en "køb"- eller "sælg"-knap. Enhver transaktion åbner et vindue med kontekst, konsekvens og helst modspil: salg af en spiller finder INTERESSEREDE KLUBBER (måske ingen!) med bud, der kan presses; medejer-opkøb er en FORHANDLING i runder, hvor livsværket koster premium, og et kollaps låser døren sæsonen ud; faciliteter viser PRÆCIS hvad de gør (tal, byggetid, formandens forbehold) før underskriften. Reglen gælder alt fremtidigt design: hvis en handling kan reduceres til ét klik uden information eller modstand, er den ikke færdigdesignet.

## Navet: Klub-indbakken

Alt vigtigt lander som beskeder i klubbens indbakke, som behandles mellem kampdage: bud på dine spillere, kontraktkrav, sponsortilbud, trænerens ønsker, scoutrapporter, dilemmaer, nyheder. Én skærm at lære, ét sted at kigge — minimalismens rygrad. Indbakken har afsendere med ansigter (agenter, firmaer, træneren, kommunen), så hver besked er et møde med en karakter, ikke en systemnotifikation.

## Forhandlingsmekanikken (genbruges overalt) — FULDT SPECIFICERET 5/8 2026

**Grundformen: 3 tilbudsrunder + Final Offer.** Du lægger et bud → modparten svarer med modkrav, accept eller fornærmelse → op til 3 runder. Én gang pr. forhandling kan et bud markeres som **FINAL OFFER**: modparten svarer straks ja/nej (højere accept-chance end normalt bud på samme niveau — men afslag = kollaps). Samme mekanik bruges til spillerkøb, salg, kontrakter, forlængelser og sponsorater.

**Information (poker-reglen):** Første bud er blindt. Efter runde 1 giver agenten et hint om smertegrænsen. Aldrig synlige intervaller — at lære markedet er en færdighed.

**To spor at byde på (Mads' design):** **Quick-forhandling** — live runder her og nu, men med hastværkstillæg (~+5-10% på smertegrænsen). Eller **formelt bud** — sendes fra indbakken, svar ankommer efter en kampdag; billigere, men åbent for verden: AI-klubber kan byde imod, og så står du i **budkrig** — eller mister ham. Tempo koster, tålmodighed risikerer.

**Kollaps har et efterliv:** Bryder forhandlingen sammen, forsvinder spilleren fra listen — men er han usolgt senere, kan agenten ringe tilbage i indbakken ("Barry her. Han er blevet… billigere."). Ved forlængelser kan BEGGE parter parkere forhandlingen og genoptage den senere ("vi tales ved efter jul").

**Kontrakt-trinnet (efter pris):** Længde (1-4 år) + løn + **lovet spilletid** (Key player / Rotation / Prospect). Vilkårene taler sammen: bærende rolle → lavere lønkrav; prospect-stempel → dyrere (og fornærmende for spillere over 25); kort kontrakt → dyrere, lang → rabat. **Løftet HÅNDHÆVES:** spillet simulerer minutter mod løftet, og brud eskalerer — agent-besked → formfald → transferkrav. Et løfte er en forpligtelse, ikke en forhandlingsrabat.

**Handelsstrukturer (forhandlingskort):** **Ratebetaling** (køb over 2-4 rater — køb større end kassen, bind fremtiden) og **bonusklausuler** (+£ ved oprykning / pr. mål — flyt risikoen til fremtiden). Rå pris er altid muligt; strukturer er værktøjer, ikke krav.

**Lønloft fra medejerne:** Et samlet lønbudget pr. sæson (vokser med divisionen, kan forhandles op). Kontrakter skal passe i rammen — "plads under loftet" bliver en valuta i sig selv.

**Agenter: mekanik + relation.** Hver agent har målbar stil (Barry: +10% men hurtig accept; Trevor: blød men koster en ekstra runde; Dex: ±15% uforudsigelig) — OG en relation, der bygges op: handler du ofte og fair med en agent, blødgøres han over tid ("for DIG, chairman…").

**Ambitioner låser spillere — traits dirker låsen:** Spillere fra højere niveau afviser små klubber blankt, uanset løn; klubbens vækst låser gradvist bedre spillere op. MEN visse traits omgår ambitionen — Lejesvenden (Mercenary) følger pengene, uanset division. Det gør både de umulige handler og undtagelserne til historier.

**Forlængelser: magtbalancen lever.** Under 12 mdr. tilbage = spilleren ved, han kan gå gratis, og kræver markant mere (indbakken varsler ved 18 og 12 mdr.). Aldrende spillere på vej ned accepterer MINDRE (de ved det godt selv — eller deres agent gør); spillere efter en stor sæson kræver MERE ("Barry her. Min klient har bemærket sine 18 mål…") og kan selv kræve forhandling. Timing er en disciplin: forlæng tidligt og billigt, eller gambl.

---

## SPORTSDIREKTØREN

### SPILLERHANDLER — DEN KOMPLETTE PROCES (låst 5/8 2026)

**Én verden:** Alle spillere på markedet TILHØRER navngivne ligaklubber. Sælger du, spiller manden videre i ligaen — og I mødes igen. Køber du, møder din nye mand sin gamle klub. Ingen klubløse spøgelser.

**KØB — to tempo-spor:** *Quick* (live forhandlingsrunder med agenten, +7% hastværkstillæg) eller *Formelt bud* (fax → svar efter næste kampdag: accept / modbud / budkrig / afvist — billigere, men åbent for rivaler). Begge ender i kontrakt-trinnet: år, løn, lovet spilletid. Final Offer-kortet kan spilles én gang pr. forhandling.

**SALG — to spejlvendte spor:** *Hurtig rundringning* (Reg finder bud NU — hastværk lugtes, bud ~10% lavere) eller *Sæt på listen* (bud ankommer i indbakken over kampdage — bedre priser, men risiko for nul interesse, og en spiller der VED han er til salg mister selvtillid). Interessen afhænger af kvalitet, alder og held — nogle gange ringer ingen tilbage.

**GRATIS:** Frie agenter (kontraktudløbne fra ligaens klubber) kan hentes året rundt — ingen pris, højere lønkrav, direkte til kontraktforhandling.

**Kontrakt-uret:** Kontrakter ticker ned ved sæsonskift; startttruppen har restkontrakter fra dag 1. Indbakken varsler i sidste år; udløb = Bosman-exit medmindre du forlænger — og magtbalancen følger restløbetiden.

**Spillerens stemme — I BEGGE RETNINGER (Mads' præcisering):** Ved SALG: Lokal Helte og loyale kan NÆGTE flytningen (handlen kollapser, fansene elsker ham mere); sælges en mand, du har lovet spilletid, eksploderer det; utilfredse kan selv kræve at komme væk. Ved KØB: spillere klart over klubbens niveau kan sige nej til DIG — de kræver Key player-status OG toppløn for at træde et niveau ned, ellers "stays where the football is better". Drømmeren er undtagelsen begge veje: let at miste, villig at hente. Ingen handel er færdig, før spilleren selv har sagt ja.

**Gensyns-drama:** Solgte spillere husker — optakten nævner det, tickeren ved det, og fejringen (eller den demonstrative mangel på samme) afhænger af, hvordan salget endte. Købte spillere får +motivation mod deres gamle klub. Gensynskampe er mærkedage.

**Prisklarsyn skaleret:** Reg vurderer hver handel — scoutnetværk lvl 1 giver vage mærkater (dyr/fair/kup), lvl 3 præcise procenter. Klarsyn bygges.

**Levende marked & AI-økosystem:** 1-2 nye navne ind (og ud — købt af AI) hver vindues-kampdag; frie agenter trickler. AI-klubber handler også indbyrdes med news og MÅLBARE styrkeændringer — at sælge din topscorer til en oprykningsrival har en pris, du møder i foråret.

### Transfermarkedet
- **To vinduer** (sommer + januar). Udenfor vinduerne: kun frie spillere. Vinduerne er højtider.
- **Tre spillertyper:** Klubspillere (to forhandlinger: pris med klubben, så kontrakt med spilleren — to steder det kan gå galt), frie spillere (gratis, men de VED de er gratis og kræver mere i løn — fattigmandens våben), scoutede gems (billige, usikre, spændende).
- **Bud på dine spillere** lander i indbakken — afvis, forhandl op, eller accepter og indbyg en videresalgsklausul. Stjernen der sælges med 20% videresalg kan blive gaven, der bliver ved med at give.
- **Lejeaftaler:** lej stjernen ind for en halv sæson, lej talenterne ud og få dem hjem som bedre spillere.

### Deadline day — sæsonens teaterforestilling
Sidste vinduesdag er en kurateret event-scene: et rullende feed time for time med 3-5 muligheder der KUN findes her — panikbud på din topscorer 22:47, en storklubs reserve tilbudt til leje, et sidste-øjebliks kup til halv pris fordi sælgerklubben mangler likviditet. Høj puls, store fortrydelser, bedre historier.

### Agenterne
5-6 navngivne agenter med personlighed repræsenterer spillerne: Den Grådige (elsker procenter), Den Flæbende (hans klienter er ALTID uretfærdigt behandlet), Den Kaotiske (ringer om den forkerte spiller). Al forhandling får et ansigt og en replik. Agenterne er tonens bedste våben.

### Kontrakter
Løn + længde forhandles i runder. Kontrakter tikker: under 12 måneder tilbage = spilleren kan gå gratis, og indbakken minder dig nådesløst om det. Forlæng dyrt nu, sælg i panik, eller gambl og tab ham frit — hver sæson, flere spillere, aldrig et let svar. Form & skader (v1.2) gør truppens dybde til en reel bekymring, og moral (v1.3) giver bænken en stemme.

### Scouting — missioner
Send scouts på missioner: vælg region og fokus ("find en billig angriber i det skotske"), rapporten lander i indbakken efter 3-5 kampdage med 2-3 fund og Regs vurdering ("bedste venstrefod siden krigen — hvilken krig er uklart"). Scoutnetværkets niveau (1-3, bygherre-investering) afgør antal samtidige missioner og vurderingernes præcision. Rewarded video = én ekstra akut mission.

### Trup, udvikling & mennesker (FULDT SPECIFICERET 5/8 2026)

**Udvikling: auto + ét fokusvalg.** Unge udvikles af alder + træningsanlæg + trænerens DEV — men du sætter ÉT træningsfokus pr. spiller (ATT/DEF/PHY vokser dobbelt). DU formede ham. **Kampe udvikler:** spillere under 22 vokser kun rigtigt med spilletid — bænken er en væksthemmer, og udlejede talenters kampe tæller (v1.2). Dermed lever genrens bedste dilemma: spil talentet eller køb færdigt.

**Potentiale kommunikeres kun gennem mennesker:** scoutens interval ("kan blive 65-80"), trænerens mavefornemmelse — præcisionen afhænger af scoutnetværkets niveau, og dybere klarsyn er et fair betalingspunkt (rewarded video = én ekstra dyb rapport).

**Youth Day med begrænsede pladser:** kuldet præsenteres, men akademiet har kun 2-3 kontraktpladser — resten slippes for evigt, og "ham vi slap" kan hjemsøge dig hos rivalen. Fortrydelse er en feature.

**Karrierer slutter:** spillere vælger stop ~34-37 — afskedskampen er en mærkedag (tifo, museum). **Legender kan blive stab:** ungdomstræner med DEV-tal, scout, assistent — klubben får generationer, og talsproget (1-99) følger dem over i den nye rolle.

**Truppen holdes trimmet af blødt loft:** op til ~22 mand, men medejerne brokker sig over lønspild ved 20+, og spillere uden for de bedste ~16 ruster på bænken (form/selvtillid falder).

**Kaptajnen vælges af TRÆNEREN — du har en stemme, ikke magten (Mads' regel):** du kan give din holdning til kende ("giv drengen båndet"), og træneren lytter… eller vælger noget andet og skriver hvorfor. Rollefordelingen holdes ren: du ejer klubben, han ejer omklædningsrummet.

**Mentor-par med arv:** par en veteran (28+) med et talent i samme position — talentet udvikles hurtigere og ARVER tendenser, også de dårlige (Lederen avler ledere; Festaben avler problemer). Veteranens sidste år får formål.

**To mentale lag:** FORM (kamp til kamp) + SELVTILLID (langsomt: måltørke tærer, hattricks bygger; høj selvtillid hæver formens loft). Forklarer fodboldens gåde — "hvor blev vores topscorer af?" — og giver ros, spilletid og mentorer noget at trykke på.

**Kontorsamtaler, én ad gangen:** kald en spiller ind — ros (selvtillid +, men tom ros gennemskues), skideballe (tænder eller knækker, afhængigt af traits) eller lov spilletid (kobler til løftesystemet). Sjældenheden gør samtalen værdifuld.

### Akademiet — Youth Day (v1.1)
Én gang om året: **Youth Day.** Årets kuld på 5-8 drenge præsenteres som event — hver med navn, baggrund og usikkert potentiale ("lokal knægt, faren står i fanshoppen", "flyttede hertil fra Wales, rasende venstrefod"). Du vælger 2-3 at satse på; resten slippes. Akademiets niveau (investering) afgør kuldets kvalitet. Lokale drenge der slår igennem giver varig fanstemnings-bonus — og talentet du solgte for tidligt, vil hjemsøge dig fra Premier Division. Følelser + gambling i ét system.

---

## EJEREN

### Sponsor-universet
8-10 fiktive firma-karakterer med agenda følger dig gennem karrieren: det stolte lokale bryggeri (solid betaling, kræver top 8, elsker klubben), madraskongen (vil have sit navn på ALT), krypto-startup'en (betaler vildt, kan gå konkurs midt i aftalen — læs det med småt). Aftaler har længde, krav og bonusser og forhandles i runder. Flere slots: hovedsponsor, trøjesponsor — og stadionnavnet.

### Stadionnavne-dilemmaet
Sent i karrieren: sælg stadionnavnet for en formue ("Mattress Kingdom Arena") — men fanstemningen tager et varigt hit, og banneret "IT WILL ALWAYS BE THE COTTAGE" hænger på tribunen resten af karrieren. Penge vs. sjæl. Spillet dømmer ikke — det husker bare.

### Stadionet — den levende illustration
Appens visuelle kronjuvel: en stiliseret, minimalistisk 2D-illustration af stadionet, der synligt vokser gennem karrieren — tribune for tribune, storskærm, lysmaster, fyldte/tomme sæder efter fremmøde, fansenes bannere malet på tribunerne. Karrierens fremskridt som ÉT billede, delbart som screenshot ("mit stadion efter 12 sæsoner").

**Byggerier tager tid** (4-10 kampdage) og afsluttes med indvielses-event. Faciliteter: fanshop, grillbar/pub, storskærm, VIP-bokse (kommercielle indtægtslinjer pr. hjemmekamp) + træningsanlæg og lægeklinik (sportslig gevinst — kobler ejeren til sportsdirektøren).
**Monetisering (Mads' idé):** byggetid er et fair speed-up-punkt — rewarded video barberer en kampdag af ("entreprenøren fandt et sjak mere"), lille convenience-køb færdiggør straks. Aldrig nødvendigt, altid fristende, blokerer aldrig spillet.

### Cheftræneren — din vigtigste relation
Navngivne trænere med stil (offensiv, defensiv, ungdomsudvikler), kvalitet og personlighed. Træneren SKRIVER til dig: "Skaf mig en målmand i januar, eller lad være med at klage over resultaterne." Opfyld ønsker → loyalitet og overpræstation. Ignorér dem → surhed, og i værste fald opsigelse midt i oprykningskampen. Fyr ham i utide og fansene har en mening. Ansæt akademi-typen og dine unge blomstrer.

### Fansene — synlig fankultur
Én tydelig stemningsmåler — men dommen SES: tifo og sange på stadion-illustrationen når det kører, hjemmelavede protestskilte når det skrider, tavshed og tomme sæder når de har opgivet dig. Stemningen styrer tilskuertal, sæsonkortsalg og presset på dine beslutninger (billetpriser, stadionnavn, solgte darlings). Fansene er klubbens samvittighed og spillets moralske feedback-system.

---

## EJERENS HVERDAG — stadion, økonomi & sponsorer (FULDT SPECIFICERET 5/8 2026)

**Navngivne tribuner med roller:** The Shed End (atmosfære — føder 12. mand-fordelen), Main Stand (VIP-indtægt pr. sæde), Family Stand (fanvækst), Away End (gate i store kampe). Udbygning er strategi, ikke +kapacitet — og stadion-illustrationen fortæller valgene visuelt.

**Billetøkonomi med tre håndtag:** grundpris, sæsonkort (sælges før sæsonen — likviditet nu mod rabat, sikrer bundfremmøde) og storkamps-tillæg (derby/playoff — fansene accepterer det… til en grænse).

**Levende sponsorer:** 2-3 events pr. sæson pr. aftale — bryggeriet følger op på top 8-kravet midtvejs, NimbusCoin kan gå konkurs midt i aftalen, madraskongen får skøre bonus-ideer. En sponsoraftale er et forhold, ikke en betalingslinje.

**Økonomisk overblik gennem fiktionen:** kassen + ugentligt netto altid synligt; månedsrapport fra bogholderen i indbakken — med personlighed ("Jeg har vedlagt en tegning af et synkende skib"). Ingen regneark-skærme.

**Faciliteter (alle valgt ind over roadmappen):** kommercielle (fanshop, grillbar/pub, storskærm), sportslige (træningsanlæg → udvikling/form, lægeklinik → kortere/færre skader), VIP-bokse (stor indtægt, fan-skepsis: "prawn sandwich brigade") og de usexede basics (parkering, toiletter, lys — ren League Three-romantik med små stemnings-/gate-løft).

**Stadionfonden — projekt-opsparing (justeret 5/8 2026):** Ved budget-/midtvejsmødet vælges et KONKRET projekt ("Shed End niveau 2 — £150k") og indskud sættes ind. Fonden optjener **1,5% pr. kampdag (max +15%)** — tålmodighed betaler, indskud-og-byg-straks giver intet (lukker gaming-hullet). Fremskridtsbar på Klub-skærmen; når målet nås, starter byggeriet AUTOMATISK, og fansene har allerede set landmålerne ("rygtet siger: ny tribune!"). Udtræk er altid muligt — men bonussen nulstilles, og medejerne noterer planløsheden (−15% på næste lønlofts-anmodning). I krise er fonden BANKENS FØRSTE KRAV: den tømmes uden bonus, før tvangssalg eller lån kommer på tale — opsparing er dermed også din buffer. Kontant-byggeri uden fond er stadig muligt, men til fuld pris. (Akademifond følger samme model i v1.1.)

**Stejl pengekurve + TV-penge:** hver division ~2,5× forrige i samlet økonomi; TV-aftalen ankommer som event fra League One ("kameraerne kommer!"). Oprykning er et kvantespring, nedrykning et ægte tab.

**Merchandise:** følger succes automatisk (stemning × stjerner × division) med ét årligt valg: trøjedesignet ved sæsonstart (klassisk/moderne/vild — fansene DØMMER, og dommen påvirker årets salg).

**Medejerne er karakterer — og et endgame:** 2-3 navngivne medejere (slagteren med 20%, Whitmore med 15%…) med hver sin dagsorden; de skriver, roser, brokker sig, og én kan tilbyde kapitalindskud i krise — mod indflydelse. Over karrieren kan de KØBES UD: dyrt, langsigtet, og belønningen er frihed (lønloftet forhandles ikke længere — det er dit). Ejerskabets politik er et spil i spillet.

**Sæsonens strategiske ramme:** BUDGETMØDET åbner hver sæson — medejerne præsenterer rammen (lønloft, forventninger), og du fordeler frie midler mellem transferpulje, tribunefond og akademi (tre skydere, én skærm). MIDTVEJSMØDET i januar justerer — og medejerne fælder dom over første halvsæson. Strategien lægges på forhånd og mærkes hele vejen.

## VERDENEN

### VERDENEN — FULDT SPECIFICERET 5/8 2026

**De fire store dilemmaer (1-2 pr. sæson, alle i puljen):** Byrådet & grunden (stedets sjæl mod kompensation), Den rige bejler (kapital mod indflydelse — fansene stoler aldrig på ham), Skandalen (lokalavisen graver — benægt, indrøm eller køb tid) og Naboens konkurs (gribbe-køb billigt eller ræk hånden ud). **Konsekvenserne er varige flags med kryds-effekter:** kæmpede du mod byrådet, støtter de dig aldrig i byggesager; afviste du bejleren, vender han tilbage tre sæsoner senere — som RIVALENS ejer. Karrieren får et personligt ar-landskab.

**Den organiske rival — had-points fra:** sportslige sår (playoff-nederlag +3, købte din spiller +2, snuppede oprykningen +3, nedlagde din stjerne +2) og fan-drevne sår (sange og tifo-provokationer kan starte rivaliseringen NEDEFRA, før tabellen ved det). **Had kan falme** over 5+ år uden nye sår — og genopstå ved det næste.

**Derbyet får alt:** optakts-uge (Maureen skriver op, bannere males, du vælger trænerens tilgang 3 kampdage før), håneret med eftervirkning (sæsonlang news-serie for vinderen, krav om reaktion hos taberen), derby-specifik ticker (romerlys, tilråb, flere kort) og derby-økonomi (udsolgt uanset form, dobbelt merchandise — og bøde-risiko ved uro).

**Pokalen — klassisk FA Cup-struktur:** du træder ind i runde 1, storklubberne først i runde 3, så et cup-run BYGGER sig op: småklubber → ligarivaler → giganten på dit stadion. Lodtrækning som indbakke-event. **Giant-killing udløser fuld pakke:** kæmpe gate, varig fanstemnings-bonus, Maureens forside, spillerværdier stiger (udstillingsvinduet) og en mærkedag i Klubmuseet.

**Medierne: én journalist-karakter.** Maureen Cobb fra Gazette følger klubben hele karrieren — referater med kant, spørgsmål efter store resultater (ydmyg/kæphøj/kryptisk — påvirker fans og medejere), og hun HUSKER dine svar. Én relation, dyb frem for bred.

**Fansene skaber selv indhold:** det årlige FANMØDE (3 spørgsmål fra salen med svar-valg — ærlighed belønnes over tid, tomme løfter straffes hårdt når de brydes), fan-initiativer ved høj stemning (crowdfundet tifo, udebusture, malet klubhus) og PROTEST-TRAPPEN ved lav: først bannere, så tavshed (uhyggeligst), så boykot med økonomisk konsekvens. Vrede har trin, ikke bare et tal.

**Levende liga:** 2-3 liganyheder pr. kampdag — managerfyringer, rivalens krise, transfers — så tabellen er 14 klubber med liv, ikke 13 navne.

**Tonegrænsen: jordnær skævhed.** Alt skævt kunne næsten ske: klubkatten, lamaen, Regs græsslåmaskine. Aldrig magi, aldrig 4. væg. Testen: "kunne det stå i en ægte lokalavis?"

### Kampene — altid ticker, ekstra lir til de store
ALLE kampe afvikles som en kort tekst-ticker (10-15 sek., kan altid skippes): minutterne tikker, chancer, mål, forløsning. Store kampe (derby, pokal, oprykningsafgørelser, sidste spilledag) får det store show: længere ticker, tættere begivenheder, kommentarspor med kant og fansene på illustrationen der reagerer live. Spænding hver dag — gåsehud når det gælder.

### Dilemmaerne — få store, mange små (v1.3)
1-2 STORE dilemmaer pr. sæson med varige konsekvenser: byrådet vil råde over grunden, en rig køber vil ind i klubben, lokalavisen graver i din transferpolitik. Små charmerende events hver 3.-4. kampdag bygger tone uden beslutningstræthed (kløveren på midtbanen har købt en lama; lamaen er nu maskot; merchandise-salget stiger).

### Rivalen — organisk fjendskab
Spillet udpeger ikke rivalen — den OPSTÅR. Systemet sporer "had-point": klubben der slog dig i playoff-finalen, der købte din stjerne, der fulgte dig op gennem rækkerne. Ved tærskel forfremmes klubben organisk til ærkerival: derby-atmosfære, ekstra tilskuere, fans der ALDRIG tilgiver nederlag, ekstra had-point i begge retninger. Din rival er DIN historie — ingen to karrierer får samme fjende.

---

## MASKINRUMMET (mekanik-biblen, besluttet 4/8 2026)

### Spillermodellen
Hver spiller: **Angreb / Forsvar / Fysik (1-99)** + form (±10, bevæger sig kamp for kamp). **Skjult potentiale**: unge spilleres loft er usikkert — scouting indsnævrer intervallet, og det er hele gambling-spændingen i talentkøb. **Alderskurve**: udvikling til ~24, peak 25-29, gradvist fald fra ~31 (Fysik falder først — den aldrende playmaker kan stadig noget, men ikke hver 3. dag). **Traits (0-2 pr. spiller)**: Lederen (+form til holdet), Brokkehovedet (dræner moral på bænken), Glaskroppen (skadesrisiko), Storkampsspilleren (+niveau i derby/cup/playoff), Lokal Helt (fanstemning ved salg!), Festaben (event-generator), Arbejdshesten (mindre formfald), Drømmeren (vil væk ved storklub-interesse). Traits gør truppen til personer og føder dilemmaer.

### Trænere & stab — samme talsprog som spillerne (regel: INGEN stjerner)
Alt i spillet kvantificeres 1-99 — aldrig stjerner eller andre skalaer. Cheftræneren har **TAC** (taktik — vægt i kampmotoren), **MAN** (man-management — form, moral, kampmotor) og **DEV** (udvikling — spillervækst og akademi). Kommende stab følger samme model: fysioen får sit tal (skadeshåndtering), ungdomschefen sit (kuldkvalitet), scouten sit (rapportpræcision). Ét talsprog i hele spillet gør sammenligning instinktiv: en DEV 66-træner OG en ung trup er en strategi, man kan FØLE i tallene.

### Kampmotoren & kampdagen — FULDT SPECIFICERET 5/8 2026
**Grundmotor: moderat tilfældighed (favorit vinder ~60-65%),** beregnet af bedste XI's attributter, trænerens TAC/MAN + stil-match, form og traits.

**Før kampen — Gaffer's Read + ét valg:** Gafferen læser modstanderen ("svage bagude, hurtige på kontra — og det bliver en mudderkamp, godt for os") og du vælger tilgang: **Forsigtig / Balanceret / All-out** — vinkler motoren og gør resultatet til DIT. Én skærm, ét tryk.

**Under kampen:** Alle kampe kører ticker (skippable); store kampe får det store show. **Halvlegs-valg når det brænder** (bagud eller lige stilling): "Rolig nu" vs. "Riv dem et nyt et". **Momentum-motor:** mål ændrer kampens psykologi — scoringsboost, desperations-bonus sidst i kampen, comebacks og kollaps som fortællinger ("de dufter blod nu"). **Events:** røde kort (karantæne næste kamp), straffespark (høj-dramatisk ticker-øjeblik), skader (ude 2-5 kampdage — trupdybde bliver reel fra v1.0), og sjældne dramaer (annulleret mål, målmandsdrøn i overtiden). **Vejr som mekanik:** regn/mudder/frost favoriserer FYSIK-tunge hold, straffer teknikere — og indgår i gafferens læsning som taktisk information.

**Atmosfæren er den 12. mand:** Hjemmebanefordelen er dynamisk — fremmøde × fanstemning. Et propfyldt, syngende stadion flytter kampe; et halvtomt, surt et gør ikke. Ejerens arbejde (tribuner, billetpriser, fansenes tillid) bliver målbart på banen.

**Efter kampen:** Analyse-linjen (forklarer resultatet ud fra attributter og valg — man lærer noget hver kamp), Man of the Match med ratings, 2-3 kamp-nøgletal, og gafferens citat tonet efter resultat og personlighed.

**Sæsonstatistik:** Liga-topscorerliste (inkl. AI-spillere — kapløb som sæsonhistorie), fuld spillerstatistik (kampe/mål/assists/snitrating — føder kontraktkrav, priser og museet), Sæsonens Hold + Årets Spiller som prisshow ved sæsonafslutning, og klubrekorder der kan slås undervejs ("største sejr NOGENSINDE").

**Sproget er grafikken:** Stort tekstbibliotek (300-500 event-linjer), tonet efter kontekst — derby, bundkamp, regn, rival — så selv 0-0 har karakter. Ingen døde perioder i tickeren.

**Adaptivt tempo:** Skipper du 3 kampe i træk, tilbyder spillet hurtig-tilstand (instant + højdepunkter) — kan altid slås fra, og STORE kampe afspilles altid fuldt. Respekt for både nye og garvede uden indstillingsjungle.

### Økonomiens trin-eskalation
Kassen kan gå i minus — og så eskalerer det i trin, altid med en vej tilbage: **1)** Medejerne advarer (indbakke-brev, tonen er britisk-passivt-aggressiv). **2)** Banken kræver handling: tvangssalg af mest værdifulde spiller ELLER lån med renter. **3)** Fortsat kaos: administration — pointstraf (à la England) og transferforbud. **4)** Kun ved total ligegyldighed over flere sæsoner: medejerne gennemtvinger salg af klubben = game over med værdighed ("Din æra: 14 sæsoner, 2 oprykninger, ét pokalmirakel"). Penge har vægt, men én dårlig sæson dræber ingen.

### Sæsonstruktur & karriere
**26 ligakampe** + 2-5 cupkampe + deadline days ≈ 4-8 aftener pr. sæson. Transfervinduer: kampdag 1-4 (sommer) og 13-16 (januar), cup-runder flettet ind imellem. **Oprykning: nr. 1-2 direkte + playoff (3.-6.: semifinaler + FINALE)** — sæsonen lever til sidste spillerunde, og playoff-finalen er årets største kamp og gate. **Ejerskab: du ejer 51%** — ingen kan fyre dig for resultater; kun økonomisk katastrofe (trin 4) kan tage klubben. **Én gennembalanceret sværhedsgrad** — udfordringen ER klubben, du overtager; gennemført karriere låser udfordringsklubber op ("Konkursboet: start med −£50k og pointstraf").

### Vane & minde
**Push: få & meningsfulde** (max 2-3/uge, opt-in, diegetiske: "Reg her — East Stand står færdig i morgen"). **Verden venter**: intet sker, når appen er lukket — nul FOMO, sæson-rytmen er spillerens egen. **Onboarding: "Overtagelsesdagen"** — advokaten overrækker nøglerne til en fallit klub, spilleren navngiver den og vælger farver (temaet skifter live — det magiske øjeblik), træneren præsenterer truppen med tre hårde sandheder, første beslutning inden 60 sekunder. Ingen tooltips — fiktionen ER tutorialen. **Klubmuseet**: trofæskab, klubrekorder, sæson-for-sæson-historik og Legender — solgte profiler følges i deres videre karriere ("Quigley scorede i går for storklubben, du solgte ham til"). Fuld historik = PRO-feature.

## SÆSON, KARRIERE & META (FULDT SPECIFICERET 5/8 2026)

**Klubmuseet — alt valgt ind:** Mærkedags-kort (giant-killings, oprykninger, finaler, afskedskampe — auto-genereret med dato, score og én linje fortælling), trofæskab MED tomme hylder (ambitionen synlig), Legende-væggen (pensionerede/solgte med karrieretal og "hvad laver han nu"), og Rekordtavlen der kan slås live. **Museet deles:** hver mærkedag genererer et delbart milestone-card i klubfarver — museet er samtidig spillets gratis markedsføring.

**Årsgallaen:** Sæsonen slutter i klubhuset — Årets Spiller, Målkongen, Årets Unge, Fansenes Favorit — og ÉN interaktion: FORMANDENS PRIS, som du selv overrækker (conf-boost + signal til truppen).

**Endgame = Dynastiet:** Efter Premier Division-titlen åbner legacy-tavlen: forsvar titlen, vind pokalen, køb medejerne ud, byg 20.000-stadionet, få en akademidreng til landsholdet. Spillet slutter ikke — det modnes.

**Udfordringsklubber (alle fire):** Konkursboet (−£50k + pointstraf), Den Faldne Gigant (tomt kæmpestadion, lønbyrde), Derby-byen (rivalen ejer byen — tag den) og Akademi-eden (permanent transferforbud, alt avles).

**Achievements:** Platform (Game Center/Play Games) + in-game badges i museet — to lag, samme data.

**Gemmer:** Gratis = 1 karriere. PRO = 3 sideløbende. **Cloud-backup for ALLE** (iCloud/Google) — ingen mister sit livsværk; det ville være utilgiveligt.

**GRASSROOTS PRO (49 kr.):** Ingen reklamer + 3 karriere-slots + fuld museumshistorik (gratis: seneste 3 sæsoner) + **Reg Pro** (præcise potentiale-intervaller og prisvurderinger fra dag 1 — ren information, aldrig gameplay-fordel i kampene). Temaer er IKKE bag betalingsmur — de låses op ved bedrifter (vind pokalen → Claret & Gold), så kosmetik er en trofæ-følelse.

## ANNONCE-RYTMEN — det endelige framework (oplæg godkendt-afventende)

**Grundlov:** En annonce må aldrig koste en sletning. LTV = retention × visninger, og retention vægter 10×. Deraf fire lag af værn på interstitials:

1. **Rytme-ankeret:** hver 4. kampdag, placeret EFTER FT-opsummeringen (naturlig pause, høj viewability, bedst betalte placering). Forudsigelighed skaber accept — spillere lærer rytmen og planlægger med den.
2. **Tidsgulvet:** aldrig to interstitials inden for 3 minutter (beskytter quick-mode, hvor kampdage komprimeres).
3. **Følelsesværnet:** aldrig efter et NEDERLAG (udskydes til næste kampdag — man sparker ikke på liggende mænd, og vrede spillere sletter). Og **hellige dage er annoncefrie:** deadline day, playoff-kampe, derby og Årsgallaen. De ~15% mistede visninger tjenes hjem i retention og anmeldelser.
4. **Session-loftet:** max 3 pr. session, og session 1-2 er HELT annoncefrie (D1-retention er det dyrebareste, der findes).

**Rewarded:** ingen loft på synlighed (frivillighed er pointen), men grants doseret: scout-mission 1/sæson, sponsorbonus 1/sæson, klarsyns-rapport 1/vindue, byggeboost frit ved aktivt byggeri. **Beta-måling:** slet-rate omkring første interstitial + ad-fatigue-kurven; justér ét håndtag ad gangen.

## Monetiseringskortet (opdateret)

| Punkt | Type | Diegetisk indpakning |
|---|---|---|
| Interstitial hver 4. kampdag | Ad | Naturlig pause mellem kampdage; aldrig i kamp, aldrig i session 1 |
| Scoutrapport / ekstra mission | Rewarded | "Reg har hørt om en spiller…" |
| Sponsorbonus | Rewarded | "Hør madraskongens nye idé" |
| Sæsonbonus-fordobling | Rewarded | Ved sæsonafslutning |
| Bygge-speedup (-1 kampdag) | Rewarded | "Entreprenøren fandt et sjak mere" |
| Byggeri færdigt nu | Convenience-køb | Lille engangskøb pr. byggeri |
| **GRASSROOTS PRO · 49 kr.** | Engangskøb | Ingen reklamer + 3 gemmepladser + karrierehistorik — tilbydes efter sæsonafslutning og oprykning |

## Informationsarkitektur (skærme)

**Hjem** (næste kamp, ticker, seneste, bestyrelse) · **Indbakke** (navet: alt der kræver svar) · **Trup** (spillere, kontrakter, akademi-fane) · **Marked** (transfers, scouting, vinduer) · **Klub** (stadion-illustrationen, byggerier, sponsorer, træner/stab, fans) · **Tabel** (liga + cup). Seks faner, én primær handling pr. skærm.

## Roadmap (byggerækkefølge — uændret logik, optimistisk tempo)

**v1.0 MVP:** Kerneloop + vinduer/deadline day + frie transfers + forhandlingsrunder + agenter + indbakken + sponsoraftaler + tribuner m. byggetid + træner m. krav + fanstemning + ticker. **v1.1 Akademiet:** Youth Day + sportslige faciliteter + stab. **v1.2 Transfermarkedet:** leje + AI-bud + klausuler + scout-missioner + form/skader. **v1.3 Drama:** cup + organisk rival + dilemmaer + moral. **v1.4 Forretningen:** kommercielle faciliteter + sponsor-slots + stadionnavn.
*Med Claude som medudvikler er timetallene fra business casen konservative — dine timer er beslutninger, test og balancering. Vertical slice-porten i måned 3 gælder stadig: loopet skal bevise sig på rigtige mennesker, før vi bygger paladset.*

## Næste skridt

1. **Designrunden:** 3 visuelle retninger på "minimalistisk, moderne, indbydende" som mockups af Hjem + Klub (med stadion-illustrationen) → Mads vælger.
2. **Prototype v2:** indbakke, forhandlingsrunder, en simpel deadline day og ticker bygges ind, så det nye hjerte kan mærkes.
3. GitHub Pages-link, så prototypen kan spilles på iPhone og deles med testere.
