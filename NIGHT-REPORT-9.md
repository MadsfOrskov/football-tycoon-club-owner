# NATRAPPORT 9 — Porteføljen, styrken og navnene

*Session 14/8 2026 · branch `claude/nightly-trupdybde-t1-t4-xvhppp` · seks pakker efter en lang brainstorm med Mads. Hver pakke egen commit, hver ny invariant saboteret først.*

## TL;DR — hvad kan du mærke

- **Pengene har fået deres eget liv** (PENGE-1): tre klasser med hver sin rytme — **kæder** du bygger op niveau for niveau (hoteller, pubber, fitness), **projekter** der låser kapitalen i 3-5 sæsoner og afgøres i én stor beslutning, og et rullende marked af **hurtige handler**, der falder på plads midt i sæsonen. Og du kan tabe penge nu.
- **Gearing som valg, ikke system**: hvert projekt kan finansieres af egen kasse, med partner eller **gearet** — hvor kortet siger det med rene ord: *du kan tabe MERE end du lægger*.
- **Bestyrelsen kan se sin egen trup** (STYRKE-1): tabellen har en Niveau-kolonne (dit tal præcist, rivalernes som et bånd), prematch-arket siger favorit/jævnbyrdig/underdog, og målsætningen bygger på din forventede placering i stedet for en konstant.
- **Står du hjemme, spørger ingen dig** (PENGE-4): kampen simuleres — også i store kampe og playoffs. Vil du være der, går du ind i klubben.
- **Navnene er rene og lyder engelske** (NAV-1/2): étords-navne som i virkeligheden, ingen eksisterende klubber i puljen — og **du kan omdøbe enhver af dine klubber**.
- **Køber du aktier, betaler du selv** (Mads' punkt 4). Og du kan bruge penge på dit navn: én gestus pr. sæson.

## Mads' regel nr. 1, gjort testbar

*"Man skal kunne tabe det hele — men det skal være ens egen skyld, altså fordi man træffer satsede valg, hvor det er belyst, at man kan tabe det hele."*

Det er oversat til en kontrakt, harness'en håndhæver: hvert aktiv bærer sit **risikoniveau** og sit **udfaldsrum** på kortet, og invarianten kører **400 sæsonopgørelser pr. aktiv** med to krav — et *risikabelt* aktiv SKAL have både gode og dårlige år, og et *solidt* må aldrig æde formuen. Den gamle model kunne slet ikke tabe penge: udsvinget lå oven på et positivt afkast, så agenturets værste år stadig gav 9 % i plus. "Fede år og magre år" var tekst, ikke matematik.

## Sabotagen fandt fejlen, rettelsen ikke fandt

Præsens-reglen (PENGE-4) så ud som tre undtagelser, der skulle fjernes. Da de var væk, saboterede jeg prematch-grenen — og testen blev **grøn**, hvilket ikke gav mening. Årsagen: **playoffkampe går slet ikke gennem `playMatchday`.** `playPlayoff()` sætter arket direkte og kendte overhovedet ikke reglen, så playoff-aftener spurgte *altid*, også hjemmefra. Havde jeg kun rettet det oplagte sted, var Mads' fund ikke blevet rettet. Reglen står nu, hvor kampen faktisk startes.

## Kalibrering frem for gæt (STYRKE-1)

Skærmbilledet afslørede skævheden. Første udgave skar trænerbonus og anfører væk sammen med formen — men de er vedvarende fordele, motoren regner med hver uge, så indekset forudsagde **12. plads** for et hold, der rykker op i halvdelen af karriererne. Med den fulde bonus forudsagde det **1. plads**, hvilket er lige så forkert: AI-ligaen afgør sine egne kampe med andre konstanter end spillerens (base 1,15 og /22 mod 1,05 og /24).

Broen mellem de to skalaer blev **målt**: faktor 0,5 gav afvigelse +2,8 placeringer · 0,85 gav +1,1 · **0,95 gav +0,9**, og den står. For at kunne måle ærligt bærer hver sæson i historikken nu den forventning, der stod *før* netop den sæson — første måling holdt slutstatens forventning op mod alle sæsoner, æbler mod pærer.

**Hvad styrke køber** (målt gennem spillets egen `myLambdas` + `poisson`, 40.000 kampe pr. punkt): ~4 styrkepoint ≈ **+9 procentpoint sejrsrate**; hjemmebanen ~11 point; hele League Threes spænd er ca. 8 point, altså forskellen mellem 25 % og 59 % hjemmesejre.

## Licens-hygiejnen (NAV-1/2)

Den gamle navnepulje kunne producere **Harlow Town, Ashford United, Eastleigh og Tilbury** — alle eksisterende engelske klubber. Puljen er skiftet ud, og `clubName(div)` vægter étords-navne efter division, som virkeligheden gør det. Bloklisten bor i harness'en, ikke i spillet: det er en test af, hvad spillet *må* lave. Første udgave så kun på de 56 navne, der tilfældigvis blev trukket, og sabotagen slap igennem — proben trækker nu 2.000 navne gennem generatoren.

Og svaret på licens-spørgsmålet er blevet en feature: **omdøb klub**. Spillet udgives med opdigtede navne; spilleren skriver selv resten.

## Målt (20×5 efter hver pakke)

- Gulvtal hele vejen: netto S1 −£0,2-1,2k (mål ±2k) · store kampe 3,8-4,3 (mål 3-5) · administrationer 0-0,19 pr. karriere · oprykning S1 i båndet.
- Forventet placering mod faktisk: **+0,1 til +0,9** — kalibreringen holder.
- Sabotager denne runde: **14** (præsens 3 · styrke 3 · navne 2 · omdøb 2 · portefølje 3 · gestus 1), alle røde som de skulle.
- Probefund undervejs (rettet, ikke skjult): skala-testen antog en komplet trup (bestXI falder bevidst tilbage til 35 for en tom position) · kortets bånd er *grundbåndet*, så byen skal neutraliseres før det måles · M4-proben faldt over, at porteføljen nu kan tabe penge før milepælen tjekkes · opkøbs-proben greb i tomt, når første handel tømte medejerlisten · forventningsmødets probe havde ikke plads, da kravet blev dynamisk.

## Det udestående — ærligt

1. **Porteføljens langtidsbalance**: NIGHT-REPORT-8's baseline (median net worth £12M ved S21) er målestokken. Gaten bag denne rapport er det første tal at holde den op imod.
2. Direktør-mandat v2 · E5 skjult potentiale · B3 sponsorer · D2 aldring med varsel · dansk flavor · R8 FA Cup · R10 arkiv · R11 PWA+3 slots · M5.
3. **Omdøbning dækker dine egne klubber** (egen + kontrollerede). Vil man omdøbe en vilkårlig klub i pyramiden, mangler den vej stadig.
4. Den grå investor (billige penge mod en tjeneste senere) er skrevet ned, men ikke bygget — den kræver sit eget indhold.
