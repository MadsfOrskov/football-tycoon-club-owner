# ARBEJDSKØ — EJEREN OG DE TO KASSER

*Fire ændringer, dikteret af Mads 10/8 2026 mens `WORKPLAN-OEJEBLIKKE.md` var under opbygning på `nightly/oejeblikke`. **Ikke bygget.** Designspørgsmålene nedenfor er endnu ikke alle besvaret — se markeringerne.*

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

Et trin i onboardingen — naturligt efter R6, hvor introen nu starter med **dig** før klubben får navn. Pinden går fra **51 % til 100 %**, og prisen pr. procent følger `clubValuation()`. Ejer du alt, har du intet; sælger du ned, får du kontanter.

**Hele maskineriet findes:** `G.myShare`, medejerne med personligheder og humør, `clubValuation()` fra pakke 4.

### Hvorfor dette er den vigtigste af de fire

**Det lukker `DECISIONS-NEEDED.md` punkt 10.** Punktet har stået åbent med *"trin 4 er fatalt fra start, fordi du kun ejer 51 %"*: fortyndingstrappen fra nat 4 antog en luft over 50 %-grænsen, spilleren ikke havde. **Med balancepinden køber han selv den luft.**

| Start | Kontanter | Fortyndingsluft |
|---|---|---|
| 100 % | ingen | fire-fem redningsrunder |
| 51 % | mest muligt | **én** redning fra at miste klubben |

Det gør femtrins-trappen levende fra sæson 1 frem for teoretisk, og det giver et ægte strategisk valg med en pris i begge ender. Og det gør formuen fra B1 læsbar med det samme: pinden flytter andel og kontanter i modsat retning, så tallene *betyder* noget fra første skærm.

### Åbne spørgsmål

1. **Hvem køber de andele, du sælger fra start?** Medejerne findes som karakterer med personlighed og humør. Får man tildelt dem, vælger man imellem dem, eller er de bare "byens folk" indtil de får ansigt? Sælger man ned til 51 %, sidder man fra dag ét med en bestyrelse, der ejer 49 % — og deres personligheder betyder så noget med det samme.
2. **Kan man sælge yderligere ned senere?** Er pinden kun i onboardingen, eller er den en permanent kapitalkilde? Kan man sælge ned midt i en krise, er det en femte vej ud af økonomitrappen — og den skal i så fald forenes med trin 4, som handler om præcis det.

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
