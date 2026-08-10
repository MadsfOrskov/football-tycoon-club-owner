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

Tilbuddene skal skaleres til, hvad du faktisk har — eller låses op i trin, så det tidlige ejer-lag har noget på hylderne, du kan nå.

## E2. Startkapital

**Mads' ord:** *"Vi skal have løst hele den udfordring. Man skal have startkapital, så man kan lidt helt fra start."*

Roden under E1: ejeren starter uden personlige penge, så hele ejer-laget er tomt indtil et udbytte falder. Der skal være **startkapital**, så man kan gøre lidt fra dag ét.

Bemærk sammenhængen med onboardingen efter R6: introen starter nu med **dig** — navn, portræt, baggrund — før klubben får navn. Startkapitalen hører naturligt til dér, og baggrundsvalget kunne bestemme, hvor meget man kommer med.

## E3. Ejeren må ikke misse de store begivenheder

**Mads' ord:** *"Det er vigtigt at man som ejer får besked omkring de store begivenheder i sit ejervindue. Jeg skal ikke misse et transfervindue, f.eks."*

Dette er et **strukturelt hul, som M2.5's todelte interface selv skabte:** kan man sidde i ejer-laget, kan man sidde der mens klubben har brug for en beslutning. Transfervinduet åbner og lukker, deadline day kommer og går, sæsonen starter — og ejeren ser det ikke.

Ejer-laget skal have sin egen besked-kanal for de store ting. Vinduer, deadline day, sæsonstart, budgetmøde, bud på dine spillere.

## E4. Klubbens økonomi deles i to: pengekasse og lønbudget

**Mads' ord:** *"Klubbens økonomi skal deles op i 2. Der er en pengekasse og et lønbudget. Dette skal være noget man kan justere, så hvis man ikke har lyst til at bruge så mange penge på spillere, men bare betale meget i løn til dem man har, så skal man kunne skubbe frem og tilbage mellem penge og lønkroner."*

To potter: **pengekassen** (køb, byggeri, faciliteter) og **lønbudgettet** (hvad truppen må koste om ugen). Og en skyder imellem, så man kan vælge sin strategi: køb billigt og betal godt, eller køb dyrt og hold lønnen nede.

Det er en ægte formandsbeslutning, og den findes halvt allerede: `G.wageCap` er der, og `BAL.wages.capOnPromotion` flytter den ved oprykning. Det nye er, at loftet bliver **noget man selv skubber på**, mod pengekassen.

**Åbent designspørgsmål:** hvad koster det at flytte skyderen? Kan man flytte frit, er de to potter i praksis én pot med to etiketter — og så er der ingen beslutning. Begrænsningen er det, der gør den til en.

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
