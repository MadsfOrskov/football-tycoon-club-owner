# ARBEJDSKØ — ØJEBLIKKENE OG ØKONOMIEN

*Tolv ændringer, dikteret af Mads 10/8 2026 efter første rigtige gennemspilning af nat 6-versionen, og derefter designet igennem med tolv spørgsmål. **Alle valg herunder er hans.** Intet er bygget. Selvstændig: en frisk session skal kunne udføre den herfra.*

## Den røde tråd

Spillet afgør i dag sine største beslutninger i **en række i en liste.** Et bud på din bedste spiller, et deadline-day-tilbud, en kontraktforlængelse — hver af dem er en knap i en indbakke.

Mads' ord om to af dem: *"Det er de her situationer i spillet som skal gøres gode og fange spillere"* og *"der skal lægges energi i."* Gruppe C er derfor ikke UI-arbejde. Det er dér, spillet enten bliver godt eller bliver en tabel.

---

# A · Straks — rene rettelser

## A1. "Bøger" → "Økonomi"

`const t=[["home","Kontor"],["empire","Imperium"],["books","Bøger"]]` (~4459). Nøglen `books` kan blive; etiketten skal være **Økonomi**. Husk prosaen: fanebeskrivelsen (~4468), `line("Indtjening · bøgernes form…")` (~4909), `"Sæsonens afslutning · bøgerne"` (~5495).

## A2. Beløb i millioner

Formateringsfunktionen hedder **ikke** `kfmt` — find den faktiske, der laver `K`-suffikset, og ret den ét sted. Under £1M → `£950k`. Derover → `£1,02M`. Aldrig `1018K`.

---

# B · Økonomien skal kunne læses

## B1. Formue og kontanter, altid synlige

**Mads' definition (10/8), ordret:** *"Min formue er jo værdien af alle de andele jeg ejer af klubberne relativt til deres værdi. Det er min formue — den kan jeg i princippet ikke bruge til så meget udover et pejlemærke og noget man gerne vil have til at stige. Det er kontanterne man kan købe for der er vigtige, da det er dem der gør det muligt at købe andre klubber. Kontanterne er også en del af ens samlede formue."*

```
formue = Σ (din andel% × klubbens værdi) + kontanter
```

To tal fast i toplinjen — **ikke** kun på Økonomi-fanen, for beslutningen om at købe tages andre steder. **Kontanterne er det handlingsanvisende tal**; formuen er pejlemærket, der skal stige. Klubværdien findes allerede i `clubValuation()` fra pakke 4, og andelen i `G.myShare`.

Bivirkning, der er en fordel: fortyndingen bliver synlig. Bliver du udvandet, falder formuen, selvom klubben vokser.

## B2. Faciliteter er niveauer, ikke køb

**Mads' ord:** *"Der skal være niveau i det og så skal det pr. niveau kunne bidrage til klubben, men også gøre at det er dyrere at drive klubben. Så omkostning og indtjening skal påvirkes."*

I dag er `G.fac` binære flag (`{shop:0,pub:0,screen:0,clinic:0,training:0,basics:0,vip:0}`) med én pris hver.

**Valgt model — driften er fast pr. niveau, indtægten følger fremmødet.** En niveau-3 fanshop i en tom klub er ren udgift; i en fyldt klub er den guld. Det kobler faciliteterne til fanstemningen og byen, og det gør overinvestering til en fejl man kan lave.

**Og de kan lukkes ned.** Mads: *"Det er en fed feature, at man kan 'lukke ned' for noget i en periode, hvis klubben skulle rykke ned og man dermed har færre penge."* Nedlukning sparer driften med det samme — **genåbning tager kampdage som et byggeri** (genbrug byggetiden, der allerede findes). Så er det en ægte nødbremse med en pris: du kan overleve en nedrykning, men ikke tænde og slukke efter behov.

## B3. Sponsorer: tre tilbud, flere slots, bonusser du selv udløser

**Valgt: risikoen er præstationsbaseret, ikke et lotteri.** Lav grundbetaling, store bonusser hvis **du** leverer — oprykning, top 4, en pokalrunde. Du kan spille dig til gevinsten, og det gør sponsoren til en indsats på din egen ambition. **Kobler direkte til forventningsmødet med bestyrelsen:** lover du højt begge steder, hænger to udbetalinger på samme sæson.

- **Tre tilbud** ad gangen med reelle forskelle — ikke tre variationer af samme beløb.
- **Flere slots:** hovedsponsor, trøje, stadionnavn, drikkevarer. GDD'en har 8-10 firma-karakterer med agenda; stadionnavne-dilemmaet står som eget afsnit.

## B4. Prisskalaen flytter sig med divisionen

**Mads' tilføjelse (10/8):** *"Tænk i det her også hele modellen omkring at alting er større når man rykker op. Så billetpriser, mm. jo stiger i pris jo højere man kommer."*

**Valgt: begge** — både det du **kan** kræve og det byen **vil** betale stiger. I League Three sætter du £5-20; i Premier £25-60, og efterspørgslen følger med.

> **Balanceadvarsel, som skal stå her:** det er **to** multiplikatorer på samme tal, og GDD'en gør bevidst `townDemand` til et loft (*"Udbygning er strategi, ikke +kapacitet"*). Mål netto pr. kampdag pr. division før og efter, og hold øje med at Premier ikke bliver en pengemaskine — den ligger i dag på −£5.903 pr. kampdag, altså det dyreste sted at være. Går den til den anden yderlighed, er kuren værre end sygdommen.

---

# C · Øjeblikkene

## C1. Bud på din spiller: en tilbudsside, og et marked du arbejder

Indbakken får **én** knap: *Se tilbud*.

**Siden skal vise:** spilleren (form, alder, kontrakt, hvad han betyder for truppen) · **den bydende klub** (division, placering, hvad de har råd til) · **de andre interesserede** · og forhandlingen.

**Mads' ord om interessen:** *"Man skal kunne se interessen og hvem den er fra. Der skal være flere niveauer af interesse, og man skal kunne række ud til de andre klubber for at høre hvor de er og presse på for et bud. Jeg vil gerne have den her del af spillet til at være omfattende og virkelig fed! Så der må gerne være mange muligheder — det skal bare være struktureret godt."*

Altså: **flere niveauer af interesse** (følger ham · overvejer · klar til at byde), navngivne klubber, og **udgående kontakt** — du kan ringe rundt og presse på for et bud. Salget bliver et marked man arbejder, ikke et tilbud man modtager.

### Prisen for at ringe rundt — og den er tosidet

**Mads' ord:** *"Spilleren og byen finder ud af det — og så skal de klubber der potentielt vil give bud også opsnappe alt dette, så man nogle gange får lidt ekstra ud af det prismæssigt og andre gange vil man se at buddene bliver mindre."*

To omkostninger, og den anden er den interessante:

1. **Det siver.** Han mister selvtillid og føler sig til salg; er han publikumsyndling, falder stemningen. **Har du offentligt sagt, at han ikke skulle sælges, koster det dobbelt** — direkte kobling til formandens ord (`ROADMAP.md`, nat 6).
2. **Markedet reagerer i begge retninger.** Klubberne opsnapper, at du shopper ham. Er han eftertragtet, driver konkurrencen buddene **op**. Lugter de, at du *skal* sælge, falder de **ned**. Hvilken vej det går, skal afhænge af hans værdi og form mod din kassestilling — så et opkald er en risiko, ikke en gratis handling.

## C2. Deadline day som egen side

**Første opgave: find ud af hvad "hold på ham" faktisk gør**, og skriv det, så en spiller kan forstå det. Mads kunne ikke gennemskue knappen — så kan ingen. Er handlingen meningsløs, så fjern den.

**Valgt form: bordet fyldes op mens uret går.** Du starter med det du kender — bud på dine egne, spillere der tilbydes dig, frie agenter — og nye muligheder falder ind i løbet af dagen **uden at de gamle forsvinder**. Det bevarer både overblikket og pulsen, og det er den eneste form, hvor GDD'ens *"sidste-øjebliks kup til halv pris"* kan lande uden at vælte det, du allerede havde planlagt.

Egen side, **kun synlig på deadline day**. Fuld information pr. post: spilleren, klubben, hvad der sker hvis du siger nej, hvor lang tid der er igen. GDD: *"sæsonens teaterforestilling… 3-5 muligheder der KUN findes her."*

## C3. Kontraktforhandling: begge lag

**Valgt: han åbner, du byder frit, han svarer.** Alle tre lag, og det er en hel pakke i sig selv.

1. **Han lægger ud med en holdning**, ikke et tal: *"Jeg har spillet her i fem år. Jeg vil ikke være den dårligst betalte i omklædningsrummet."*
2. **Du byder frit** — løn og år er tal du selv vælger, ikke faste knapper.
3. **Hvert modbud får en replik, der flytter sig med hans humør:** *"Det er tæt. Giv mig et år mere, så skriver jeg."*

**Prisen er ikke fast.** Trivsel, spilletid, rolle, klubbens retning og hvor længe han har været her skal flytte, hvad han accepterer — i **begge** retninger. Er han glad og får han det han vil have, accepterer han mindre.

**Poker-princippet holdes** (GDD, låst): hans krav er skjult i første runde.

## C4. Free agents peger vejen videre

**Valgt: retningen, ikke tallet.** *"Det er for lidt — og jeg vil have mere end to år."* Du ved **hvad** der er galt og i hvilken retning, men ikke hvor meget der mangler. Han **forsvinder ikke**; afslaget er det, der gør næste bud muligt.

Bevarer poker-princippet og gør andet bud til en informeret gamble frem for et gæt.

---

# D · Realisme og hygiejne

## D1. Indbakken renses ved "Næste uge"

**Valgt: alt uden en knap ryddes.** Har beskeden ingen handling, er den læst færdig og ryger ved kampdagsskifte. Plus et **behold-flag**, spilleren selv kan sætte.

> **Beskeder der venter på svar bliver ALTID.** Harness'en skal have en invariant om præcis det, så rydningen aldrig kan tage en ubesvaret beslutning med sig. Det er samme fejlklasse som pakke 0's blindgyde, og den kostede en spiller hele bud-sporet sidst.

## D2. Spillere falder med alderen — og du advares

Faldet anvendes **ved sæsonskift**. GDD linje 195 er præcis: *"udvikling til ~24, peak 25-29, gradvist fald fra ~31 (Fysik falder først — den aldrende playmaker kan stadig noget, men ikke hver 3. dag)."*

**To fejl at rette samtidig.** QA fandt i august, at faldet i dag starter ved **30** for **alle tre** attributter med **samme** rate — så fysik falder ikke først, som GDD'en foreskriver.

**Valgt: gafferen og scouten advarer inden.** *"Han er 32. Han har to gode år i sig, hvis du er heldig."* Faldet kommer ved sæsonskift, men mennesker omkring dig nævner det først. Så bliver det en beslutning — sælg nu, eller behold ham for længe — frem for en overraskelse i regnskabet.

Konsekvens: trupfornyelse bliver en løbende opgave, og ungdom og scouting får et formål. **Mål effekten på trupstørrelse og lønsum** — det rører balancen.

## D3. "Det usexede basale" deles op

I dag: `basics:{n:"Det usexede basale",cost:15000,txt:"parkering, toiletter, lys"}` — én knap til £15.000. Del i **parkering · toiletter · lys**, hver med sin pris og virkning. De fodrer i dag `BAL.demand.basics` (0,05 på byefterspørgslen) og `BAL.mood.basicsOpens` (+4 humør ved åbning); **den samlede virkning skal fordeles, ikke ganges op.** Bliver niveauer som resten (B2).

---

# Rækkefølge

**A** først (minutter). Så **D1 og D3** (afgrænsede). Så **B2** (faciliteter som niveauer — B3 og D3 bygger ovenpå). Så **B1, B3 og B4**. Så **D2**. Og **C til sidst med mest tid.**

**C2 og C3 er de to, Mads udtrykkeligt har bedt om at få gjort gode.** De skal ikke klemmes ind i den sidste halve time — hellere udskyde dem til en egen kørsel end at levere dem halve.

**Balancemåling efter B2, B4 og D2** — alle tre flytter økonomien. Måltal i `Claude.md`.

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
node test-harness.js --seeds=200 --seasons=20 --bot=both
```

Nye modaltyper og skærme SKAL registreres i harness'en (`handleModal` + `HANDLED_MODALS`), ellers stopper den før botten starter. **C1 og C2 tilføjer to sider fulde af knapper** — de skal med i blindgyde-auditten, for det er præcis dér, pakke 0's fejl opstod: otte beskedtyper med handler, to med knapper.
