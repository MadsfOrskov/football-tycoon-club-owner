# ARBEJDSKØ — EJEREN OG DE TO KASSER

*Fire ændringer, dikteret af Mads 10/8 2026 mens `WORKPLAN-OEJEBLIKKE.md` var under opbygning på `nightly/oejeblikke`. **Ikke bygget.** Designspørgsmålene nedenfor er endnu ikke alle besvaret — se markeringerne.*

---

# ⭐ GRUNDPRINCIPPET: DIG og KLUBBEN er to ting

**Mads, 10/8, og det er en arkitektonisk regel frem for en mekanik:**

> *"Klubben er jo ikke gået nedenom og hjem bare fordi du har under 50%. Det der skal ske er, at man skal miste kontrollen med klubben og man kan derfor kun se den på samme måde som med andre klubber, hvor man ejer 5% f.eks. Der kan man stadig få udbytte og opbygge en personlig både formue og kontantbeholdning og dermed på sigt købe sig tilbage i kontrol af enten den klub eller en anden. Det er **MEGA vigtigt**, at du adskiller DIG og KLUBBEN."*

## Der findes kun én relationsmodel

**Dig og en klub, med en procentsats.**

| Din andel | Din rolle |
|---|---|
| **over 50 %** | formand — du træffer beslutningerne |
| **under 50 %** | investor — du modtager udbytte og ser på |

Det er hele forskellen. **Ingen særtilfælde.** At miste flertallet i din første klub skal bruge **præcis samme kodevej** som at eje 5 % af en fremmed klub — for det *er* det samme.

## Hvad det betyder for trin 5

Trin 5 er **ikke** game over, og klubben går ikke under. Du **mister kontrollen**:

- Klubben kører videre under majoritetsejeren. Den kan klare sig godt uden dig — og det er en del af ydmygelsen.
- **Du modtager stadig udbytte** af din post. R3's udbyttekort er dermed ikke pynt, men den måde en investor tjener.
- Du bygger videre på **din** formue og **dine** kontanter.
- Og du kan **købe dig tilbage i kontrol** — af den klub, eller en anden.

Karrieren fortsætter, fordi **du** er kontinuiteten i spillet, ikke klubben. Det er også det egentlige svar på, at spillet er uendeligt: der findes ingen tilstand, hvor der ikke er noget at gøre.

## Konsekvensen for arkitekturen — læs denne før du koder

`G` **er** i dag klubben. Ejerens penge, formue og historik bor inde i klubbens tilstand.

**Adskillelsen af DIG og KLUBBEN er derfor den samme refaktorering som multi-klub** (`ROADMAP.md`, nat 6): `G` skal have en klub-dimension, og ejeren skal ligge uden for den. Det flytter refaktoreringen **frem i køen** — den er ikke længere en senere pakke, men forudsætningen for at trin 5, ejerandele, udbytte og formuen overhovedet kan betyde noget.

Tre ting er allerede på vej i den rigtige retning og skal bruges:

- **M2.5's todelte interface** er UI-udtrykket for adskillelsen. Ejer-laget (guld) er *dig*; klublaget er *klubben*. UI'et er foran modellen.
- **B1** (`WORKPLAN-OEJEBLIKKE.md`, bygges netop nu) er det første synlige stykke: formue og kontanter som dine tal.
- **E2's balancepind** er den første beslutning, hvor de to adskiller sig — klubbens budget er uændret, pengene er dine.

---

> ## ⚠️ KOLLISION MED ARBEJDE I FLUGT
>
> **E4 (pengekasse mod lønbudget) ændrer, hvad "kontanter" betyder — og `WORKPLAN-OEJEBLIKKE.md` punkt B1 gør netop nu "kontanter" til ét fast tal i toplinjen.** De to skal forenes, ikke bygges oven på hinanden. Læs B1 som den blev bygget, før du rører E4.
>
> Samme gælder E2: startkapital rører den kasse, B1 viser.

---

## E1. Ejer-mulighederne skal afspejle, hvor man er

**Mads' ord:** *"De muligheder der dukker op som 'ejer' f.eks. køb noget kunst, skal afspejle hvor man er. Det duer ikke, at man bliver tilbudt noget til 150.000 når man ikke har haft mulighed for at få nogle penge endnu."*

Ejer-lagets tilbud (kunst, bil, bolig — `WORKPLAN-MOGUL.md`-materialet) prissættes i dag uafhængigt af spillerens situation. Resultatet er en butik, man kigger på i tyve sæsoner uden at kunne handle i den, og et første indtryk af ejer-laget som noget, der ikke er til dig.

**Valgt: lås op i trin efter formue.** Butikken viser kun det, du er i nærheden af at kunne købe, og nye kategorier åbner når formuen vokser. Det tidlige ejer-lag har billige, små ting på hylderne — og det, du ikke kan nå, kan du **se** er der, så det bliver et mål frem for en hån.

Bevidst valgt fra: priser der skalerer med formuen. Et maleri, der koster 5 % af din formue uanset om du har tusind eller ti millioner, er ikke et maleri — det er en skatteprocent.

## E2. Startkapital — balancepinden mellem kontrol og kapital

**Mads' ord:** *"Vi skal have løst hele den udfordring. Man skal have startkapital, så man kan lidt helt fra start."*

**Og hans egen løsning (10/8), som er bedre end de tre muligheder der blev stillet op:**

> *"Kunne man lave det sådan, at spillet starter med at man får en balancepind, hvor man kan styre hvor stor en andel af klubben man ejer (fra 51% til 100%). Hvis man ejer 100% har man ingen penge til at starte med, men man kan få penge ved at sætte sin ejerandel ned fra start."*

Et trin i onboardingen — naturligt efter R6, hvor introen nu starter med **dig** før klubben får navn. Pinden går fra **51 % til 100 %**, og prisen pr. procent følger `clubValuation()`.

### ⚠️ Det vigtigste at forstå — pengene er DINE, ikke klubbens

**Mads' præcisering (10/8), efter at det blev misforstået første gang:**

> *"Lad os bruge et eksempel omkring en klub der er 1 mio værd. Hvis jeg vælger 51% ejerskab, så vil jeg så have 490.000 som kontanter på **mig — ikke klubben**. Vælger jeg derimod 100% ejerskab, ejer jeg hele klubben og har ingen kontanter. De kontanter er ikke nogen der er i klubben. **Alle skal starte med det samme budget i klubben** — det her handler om hvor mange muligheder man vil have som spiller fra start."*

| Valg | Klubbens budget | Dine personlige kontanter |
|---|---|---|
| 100 % | **uændret** | £0 |
| 51 % (klub til £1M) | **uændret** | £490.000 |

**Klubbens økonomi er identisk uanset hvad du vælger.** Det er ikke en startkapital til truppen — det er kapital til **dig som investor.**

### Hvad valget så handler om

**Mads:** *"Tænker man, at man skal gøre sin klub stor og så købe andre klubber — eller vil man købe en masse klubber og vokse antallet i stedet?"*

Det er **på-rampen til imperiet fra minut ét**, og den strategiske akse er:

- **100 %** — én klub, hele vejen. Du har ingen kapital, men du ejer alt, og alt hvad klubben tjener er dit. Den tålmodige rute.
- **51 %** — kapital nu. Du kan købe dig ind i andre klubber fra sæson 1, men du ejer under halvdelen af din egen, og bestyrelsen ejer resten.

**Hele maskineriet findes:** `G.myShare`, medejerne med personligheder og humør, `clubValuation()` fra pakke 4. Og E2 er dermed også forudsætningen for ejerandele i andre klubber (`ROADMAP.md`) — det er dér, pengene skal bruges.

### Bivirkningen: `DECISIONS-NEEDED.md` punkt 10

Punktet har stået åbent med *"trin 4 er fatalt fra start, fordi du kun ejer 51 %"*: fortyndingstrappen fra nat 4 antog en luft over 50 %-grænsen, spilleren ikke havde.

**Balancepinden gør den luft til et valg.** Starter du på 100 %, har du fire-fem redningsrunder at give af. Starter du på 51 % for at komme i gang som investor, er du **én** redning fra at miste kontrollen over din egen klub. Det gør femtrins-trappen levende fra sæson 1 — og risikoen er nu noget, spilleren selv har valgt, hvilket er hele forskellen mellem en straf og en beslutning.

Og det gør formuen fra B1 læsbar fra første skærm: pinden flytter andel og kontanter i modsat retning, så de to tal betyder noget med det samme.

### Åbne spørgsmål — BESVARET af Mads 11/8

1. **Hvem køber de andele, du sælger fra start?** ✅ **Tildelte medejere med personlighed** (de eksisterende karakterer). Du ser HVEM de er, FØR du låser pinden — så valget om at sælge ned også er et valg om hvem du får til bords.
2. **Kan man sælge yderligere ned senere?** ✅ **Ja — pinden er altid en kapitalkilde.** Du kan altid sælge en skive af din klub til medejerne til clubValuation-pris. Skal FORENES med økonomitrappens trin 4: et frivilligt nedsalg i god tid er den billige udgave, tvangsredningen den dyre. (Husk gate-fundet 11/8: skiven kan aldrig være større end det du ejer.)

## E3. Ejeren må ikke misse de store begivenheder

**Mads' ord:** *"Det er vigtigt at man som ejer får besked omkring de store begivenheder i sit ejervindue. Jeg skal ikke misse et transfervindue, f.eks."*

Dette er et **strukturelt hul, som M2.5's todelte interface selv skabte:** kan man sidde i ejer-laget, kan man sidde der mens klubben har brug for en beslutning. Transfervinduet åbner og lukker, deadline day kommer og går, sæsonen starter — og ejeren ser det ikke.

**Valgt: ejer-laget får sin egen røde tråd.** Et fast felt, der altid siger, hvad der venter i klubben: *"Transfervinduet lukker om 2 kampdage"* · *"Deadline day i morgen"* · *"Bud på Hobbs venter svar"*. Du kan ignorere det, men du kan ikke **ikke** se det.

Bevidst valgt fra: modaler der stopper dig. Spillet har rigeligt med modaler, man skal klikke væk, og ejer-lagets ro er hele pointen med det.

Kilderne findes allerede: `windowOpen()` kender vinduerne, `G.md` kender deadline day, og indbakken kender de ubesvarede beslutninger.

## E4. Klubbens økonomi deles i to: pengekasse og lønbudget

**Mads' ord:** *"Klubbens økonomi skal deles op i 2. Der er en pengekasse og et lønbudget. Dette skal være noget man kan justere, så hvis man ikke har lyst til at bruge så mange penge på spillere, men bare betale meget i løn til dem man har, så skal man kunne skubbe frem og tilbage mellem penge og lønkroner."*

To potter: **pengekassen** (køb, byggeri, faciliteter) og **lønbudgettet** (hvad truppen må koste om ugen). Og en skyder imellem, så man kan vælge sin strategi: køb billigt og betal godt, eller køb dyrt og hold lønnen nede.

Det er en ægte formandsbeslutning, og den findes halvt allerede: `G.wageCap` er der, og `BAL.wages.capOnPromotion` flytter den ved oprykning. Det nye er, at loftet bliver **noget man selv skubber på**, mod pengekassen.

**Valgt: fra penge til løn er billigt, den anden vej dyrt.** Du kan altid love mere i løn — men at tage lønkroner **tilbage** betyder, at nogen skal væk, og det koster.

Asymmetrien er den ærlige: **en lønforpligtelse er skrevet under, en transferkasse er bare penge.** Og den gør skyderen til noget, man skubber med omtanke, i stedet for frem og tilbage efter behov. Uden den ville de to potter være én pot med to etiketter — og så var der ingen beslutning.

---

---

# E5. Skjult potentiale som en EJER-beslutning

*Besluttet 10/8. Hører hjemme her frem for i Mennesker-natten, fordi Mads' krav gør det til en investeringsmekanik, ikke en trænermekanik.*

Skjult potentiale findes **slet ikke** i koden i dag. GDD kalder det *"hele gambling-spændingen i talentkøb"*, og scoutens "gem" er en billig spiller med tilfældig alder 18-33.

## Kravet: ejer, ikke træner

**Mads' ord:** *"Du skal tænke dine muligheder mere som at man er en ejer/formand. Vi skal derfor væk fra, at man er nede i de små beslutninger (mentor) i en klub, da man forhåbentlig på et tidspunkt ejer 20 klubber. Derfor kan man ikke tage sig af alle de beslutninger, men man skal kunne se et potentiale på en spiller man vil købe (og dem man ejer) og se om det er en investering man gerne vil gøre sig. Der skal så være en masse ting i forhold til træner, faciliteter, division osv som gør at den spiller nogle gange når sit højeste potentiale og andre gange skuffer."*

Det er en vigtig korrektion, og den skalerer: **ejerens greb på en spillers udvikling er strukturelle, ikke daglige.** Du klikker ikke "mentorér ham" — du har bygget et træningsanlæg på niveau 3, ansat en gaffer med DEV 70, og spiller i en division, der udfordrer ham. Derfor virker det også, når du ejer tyve klubber: du sætter miljøet, ikke kalenderen.

Bemærk at mentor-par og træningsfokus blev **fjernet i R1c** som "knapper uden reelle valg". Det var den rigtige retning; dette er hvad der skal stå i stedet.

## Modellen

- Hver ung spiller har et **skjult loft** og et **synligt interval**, som scouting indsnævrer.
- Om han nærmer sig loftet afgøres af **det miljø, du har bygget**: trænerens `DEV` og stil · træningsanlæggets niveau · klinikken (skader hæmmer vækst) · divisionen han spiller i · truppens niveau omkring ham.
- **De fleste skuffer.** Med middelmådig træner, intet anlæg og en klub i League Three lander de fleste i den nederste tredjedel. Bygger du miljøet, flytter du **fordelingen** opad — ikke garantien.

## Kalibreringen, som er det svære

**Mads:** *"Du bliver dog nødt til at ramme en balance i forhold til, at man som lille klub godt kan ramme noget godt uden at spilleren rammer sit loft. Køber jeg et talent som en 3. div klub og spilleren bliver 70-75, er det et virkelig godt køb — også selvom han havde potentiale til 90."*

**Skuffelse må ikke føles som fiasko på klubbens eget niveau.** En 19-årig med loft 90, der ender på 73, er et fremragende køb for en League Three-klub — han bærer dig to divisioner op. At han kunne være blevet 90 er ikke dit nederlag; det er en anden klubs gevinst.

Og dér ligger den følelsesmæssige motor, som GDD'en allerede har skrevet halvt: **han når sit loft hos den klub, du solgte ham til.** Legende-væggen lover det ordret — *"Quigley scorede i går for storklubben, du solgte ham til."* Kombineret med pyramiden bliver det spillets bedste tilbagevendende historie: du fandt ham, du fik det bedste ud af ham *for din størrelse*, og en større klub fik hans bedste år.

**Måltal:** andelen af unge der når over 80 % af deres loft skal stige målbart med miljøet (træner-DEV, anlæg, division) og forblive et mindretal i en klub uden dem.

---

# Rækkefølge

**E2 før E1** — startkapitalen er årsagen, prissætningen er symptomet. **E4 efter at B1 er bygget og læst**, fordi de rører samme tal. **E3 er uafhængig** og kan tages hvornår som helst.

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
node test-harness.js --seeds=200 --seasons=20 --bot=both
```

**E2 og E4 flytter økonomien og skal måles** mod måltallene i `Claude.md`. Særligt E4: et lønbudget spilleren selv sætter, er en ny måde at gå konkurs på — og en ny måde at spille sig fri af lønloftet. Mål trupstørrelse, lønsum og administrationer før og efter.

**E3 skal have en harness-invariant:** hver stor begivenhed skal frembringe en besked i ejer-laget. Det er samme fejlklasse som pakke 0's blindgyde — en begivenhed uden en besked er en begivenhed, spilleren aldrig ser.
