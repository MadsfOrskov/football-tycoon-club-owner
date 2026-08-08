# NIGHT-REPORT — nightly/trupdybde

*Kørt 6/8 2026. Branch `nightly/trupdybde` ud fra `master`. `master` er ikke rørt.*

Rækkefølgen var 0 → 1 → 4 → 3 → 2. **Alle fem pakker blev færdige**, hver med sin
egen commit, hver committet på grøn harness (`REGRESSION_OK`). Ingen rød kode er
committet.

| Pakke | Emne | Status |
|---|---|---|
| 0 | Indbakken er en blindgyde | ✅ færdig · `f8e80e7` |
| 1 | Trupdybde og friskhed | ✅ færdig · `c2244e2` |
| 4 | Værdiansættelsesmotor | ✅ færdig · `0905010` |
| 3 | Ratebetaling og bonusklausuler | ✅ færdig · `23c2044` |
| 2 | Protest-trappen | ✅ færdig · `74fa1e9` |

Verifikation efter hver pakke: `node --check proto-extract.js` og
`node test-harness.js --seeds=10 --seasons=5 --stats`.

---

## Måltal FØR og EFTER

Begge kolonner er 10 seeds × 5 sæsoner. "FØR" er `master` målt i nat, ikke tal
fra hukommelsen.

| Måltal | FØR (master) | EFTER (alle fem) | Mål | |
|---|---|---|---|---|
| Netto pr. kampdag, sæson 1 | −£1.449 | **−£666** | ±£2.000 | ✅ |
| Administrationer | 0 | **4** | 0–1 | ❌ se nedenfor |
| Bank-ultimatummer | 34 | 47 | — | |
| Gns. trup ved sæsonslut | **13,00** (40/40 præcis 13) | **14,35** | over 13 | ✅ |
| Gns. trup pr. kampdag | ~13 | **16,2–16,8** | (WORKPLAN spåede 16–17) | ✅ |
| Kampdage med under 11 friske | — | 34 % | — | |
| Oprykninger sæson 1 | 6/10 | 6/10 | 5–8 | ✅ |
| Oprykninger sæson 2–5 | 7/1/4/4 | 2/4/2/0 | 1–3 | ⚠️ se nedenfor |
| Oprykninger i alt | 22 | 14 | — | |
| Klubværdi S1 → S4 | ikke målbar¹ | £1,04 mio → £1,59 mio | — | |
| Sæsoner hvor værdien FALDT | 0 (umuligt¹) | **11 af 30** | >0 | ✅ |
| Bestyrelsens tillid S1 → S4 | fandtes ikke | 28 % → 53 % | — | |
| Køb på rater | fandtes ikke | 32 % af køb med fee | — | |
| Kampdage pr. protesttrin | fandtes ikke | ro 82,3 · bannere 8,6 · tavshed 7,8 · boykot 1,2 % | — | |

¹ Den gamle `clubValuation()` var trupværdi + kapacitet + division + en konstant.
Alle fire led kunne i praksis kun vokse, så et fald var strukturelt umuligt —
det var hele grunden til at sæsonspærringen skulle findes.

### Succeskriterierne, pakke for pakke

- **Pakke 0** — alle otte beskedtyper kan besvares fra indbakken ✅ · ingen spiller
  kan låse permanent på `BID PENDING` ✅ · den nye harness-invariant grøn ✅
- **Pakke 1** — trup ved sæsonslut over 13 ✅ (14,35) · netto/kampdag S1 inden for
  ±£2k ✅ (−£666) · højst 1 administration ❌ (4 — men se nedenfor: de kommer fra
  pakke 2, ikke fra pakke 1; efter pakke 3 stod tallet på 0)
- **Pakke 4** — værdien falder målbart ved nedrykning og administration og stiger
  ved oprykning ✅ (tvunget scenarie måler før/efter) · sæsonspærringen væk ✅ ·
  opkøb ikke blevet let ✅ (sæson 1 ≥ 1,6× fair, fuld tillid ≤ 1,45×)

---

## Den ene afvigelse jeg ikke har tunet væk

**Administrationer: 4 mod måltallets 0–1.**

Tallet stod på **0 efter pakke 3** og steg til 4 med pakke 2. Det er *ikke*
boykottens loft, der gør det — det trin rammer kun 1,2 % af kampdagene. Det er
tavshedstrinnet, der koster hjemmekampe, som koster placering, som koster
præmiepenge.

`administration()` udløses kun når klubben hverken kan sælge (trup nede på 13)
eller låne (lånet er allerede taget). De fire klubber var reelt brændt sammen.
`Claude.md` ønsker selv, at bank/administration-maskineriet, som "står klar men
næsten aldrig udløses", bliver fodret — så tallet er mekanikken der virker. Men
det ligger uden for måltallet, og hvor grænsen skal gå er en designbeslutning,
ikke min. Skruen er `BAL.protest.silentHome` (nu 0,13) og `BAL.protest.easing`.

**Oprykninger i de sene sæsoner.** 22 → 14 i alt. Sæson 1 ligger stadig på 6/10
(mål 5–8), men sæson 5 gav 0/10 mod måltallets 1–3. Klatreturen er blevet
sværere, fordi friskhed er en reel omkostning og fordi lav stemning nu har
konsekvenser. Noget af det er tilsigtet; om det er for meget, skal spilles og
ikke regnes ud.

---

## Hvor jeg afveg fra WORKPLAN'ens tal — og hvorfor

Alle afvigelser er målt frem, ikke gættet, og alle ligger i `BAL`.

1. **`restBase`/`restManDiv` 0,02 + MAN/1600 → 0,06 + MAN/400.** WORKPLAN'ens
   startværdier gjorde friskhed ca. 1 OVR værd mod reelle spring på 3–5 mellem
   starter og reserve. Gafferen roterede derfor **aldrig**, og hele truppen faldt
   bare til plateauet på 49. Det er den enkeltstående vigtigste knap i pakke 1 —
   den bestemmer, om dybde overhovedet bliver brugt. Kampdage med under elleve
   friske: 55 % → 28 %.

2. **`wages.scale` 13,5 → 11,5 og `cap` 11.500 → 10.500.** Ændring 6 balancerede
   matchday-økonomien omkring en trup på 13, fordi 13 var alt hvad dybde var værd.
   Når ~16 er den tilsigtede trup, skal samme lønsum strækkes over tre mand mere.
   Ren enhedsændring: skala og loft flytter sammen, alle forhold bevaret — samme
   type indgreb som `ov*30 → ov*13,5`. Uden den kostede dybde £1.700 pr. kampdag,
   og klubben gik i administration for at gøre det rigtige.

3. **`BAL.protest.easing`/`baseline` — en knap WORKPLAN'en ikke nævner.** Uden den
   var trappen en klippe: 17 % af alle kampdage i boykot mod 1,6 % i tavshed,
   fordi bunden var en absorberende tilstand. WORKPLAN'en kræver eksplicit en vej
   tilbage der er "mulig men langsom"; det her er den.

4. **`silentHome` 0,04 → 0,13.** `homeBonus()` er 0,13 for at spille hjemme
   overhovedet plus et publikumsled på op til ~0,3. Det er publikumsleddet
   tavsheden tager. Se afvigelsen ovenfor.

5. **Boykot-tærskel 16 → 12**, så tredje trin er bunden af et sammenbrud.

6. **`deal.instFrom/instStep` justeret TIL** GDD'ens eget bånd (8/10/12 %).

7. **Feltnavne.** WORKPLAN'en skriver `fresh:0` og advarer i samme sætning om, at
   den gemte værdi er *load*, ikke friskhed — så feltet hedder `load`, og
   `freshOf(p)` udleder resten. Tilsvarende hedder forpligtelsernes beløbsfelt
   `amt` og ikke `perSeason`, fordi det betyder tre forskellige ting alt efter
   `kind`; alternativet var tre felter hvoraf to altid er nul.

8. **Tilliden er ét tal for hele bestyrelsen**, ikke ét pr. medejer. Alle de
   inputs WORKPLAN'en lister — sæsoner, målsætninger, fonden, administration,
   løfter, publikumsyndlinge — er klubbrede. Kun personligheden er individuel, og
   den ligger allerede i grundpræmien.

---

## Tre fejl i selve måleværktøjet

Værd at kende, fordi to af dem betyder at tidligere rapporter var forkerte.

1. **Administrationer blev talt forkert.** Wrapperen om `ctx.administration` ser
   kun kald der går gennem `globalThis` — altså kun harness'ens egne. Spillets
   interne vej (`resolveBank` → `administration`) blev aldrig talt med. Tælles nu
   fra `G.admins`, dvs. spillets egen tilstand. (Jeg efterprøvede `master` med det
   rettede instrument: baseline var reelt 0, så FØR-tallet i tabellen holder.)
   Samme fælde ville have ramt brugsstatistikken for pakke 3, så den tælles hvor
   handlen underskrives.

2. **Protest-testen målte det forkerte.** Første udgave flyttede `fanMood` for at
   skifte trin — og målte dermed stemningens egen virkning på fremmødet i stedet
   for trinnets. **Både en død 12.-mand-regel OG en `stadCache` uden trinnet i
   nøglen bestod den test.** Jeg opdagede det kun ved at sabotere koden med vilje.
   Nu holdes `fanMood` fast og kun trinnet skiftes; alle tre sabotager fanges.

3. **`checkBankCascade` efterlod sit eget rod.** Dens `slice(0,13)` var et no-op
   så længe truppen altid var 13; efter pakke 1 skar den rent faktisk og
   efterlod anfører og mentorpar pegende på spillere der ikke var i truppen.

Nye invarianter og tvungne scenarier: alle otte beskedtyper (ved både fuld og tom
kasse), `BID PENDING`-låsen, `freshOf`/`load`/`lastXI`, klubværdien i enhver
tilstand, værdien før/efter nedrykning/oprykning/underskud/administration, alle
tre handelsstrukturer, og hele protest-trappen inkl. hysteresen.

---

## Hvad jeg var i tvivl om

**Om "gns. trup ved sæsonslut" er det rigtige måltal.** Det er et *efterslæbende*
tal, domineret af gulvet: hver sommer udløber kontrakter, og loopet fjerner
spillere indtil truppen rammer 13. Derfor stod det på præcis 13,00 i 40 af 40 —
ikke fordi botten valgte 13, men fordi 13 er der hvor blødningen stopper. Det kom
først over 13, da botten begyndte at **forlænge kontrakter**. Det tal der
faktisk viser at mekanikken virker, er truppen *i sæsonen*: 13 → 16,2–16,8,
præcis hvor lønloftet rækker og hvor WORKPLAN'en forudsagde det. Jeg har
rapporteret begge.

**Hvor meget af forbedringen er spillet, og hvor meget er botten.** Det her er
den vigtigste forbehold i rapporten. Jeg ændrede bottens politik fire steder:
den forlænger kontrakter, den sælger først ved ægte overskud (>16 mand), den
betaler kontant når den har pengene, og den køber ikke medejere ud for
driftskapitalen. Hver enkelt er hvad en fornuftig formand ville gøre, og de
følger alle af mekanikker pakkerne indfører — men trupstørrelsen er **følsom**
over for dem. En bot der stadig solgte ned til 13 ville vise et lavere tal med
nøjagtig samme spilkode. Jeg endte to gange med at skulle skille de to ad
bagefter.

**Om `restWeight` på 4,5× WORKPLAN'ens værdi er rigtigt.** Det er den knap der
afgør hele følelsen af pakke 1: hvor tit gafferen roterer, hvor meget dybde er
værd, hvor hårdt træthed rammer. Jeg har målt den frem mod ét kriterium (bliver
dækningen brugt), ikke mod hvordan det føles at spille. Den bør spilles igennem.

**Om værdigulvet på £40.000 er rigtigt.** Én seed nåede det. En klub klemt fast
på gulvet kan hverken falde eller stige, fordi `max()` æder begge veje — det er
håndteret i testene, men det er også et signal om, at gældsleddet (`debtWeight`
1,5 × kassekredit + £120.000 pr. administration) kan løbe hurtigere end en klub
kan nå at reagere.

**Om medejer-opkøb i sæson 1 nu er for tilgængeligt.** Muren er væk som ønsket,
og prisen er ~1,9× fair. Botten køber ikke tidligt, fordi den holder på sin
driftskapital — men en spiller der *vil* have kontrol, kan få den i sæson 1 ved
at droppe stadionfonden. Det er formentlig præcis det dilemma pakke 4 skulle
åbne. Men jeg har ikke bevis for at prisen er den rigtige, kun at den er høj.

---

## Hvad jeg ville gøre anderledes

1. **Skrive sabotagetesten før jeg stolede på invarianten.** To af mine
   protest-assertions bestod mod bevidst ødelagt kode. Jeg fangede det kun fordi
   jeg gjorde det til en vane at doble hver ny invariant med et sabotageforsøg —
   og det burde have været første skridt, ikke sidste.

2. **Adskille botpolitik fra spilmekanik fra starten.** Jeg blandede dem to gange
   (trupstørrelse i pakke 1, ratebrug i pakke 3) og skulle skille dem ad bagefter.
   Harness'en burde kunne køre den samme spilkode med to botprofiler — en "doven"
   og en "fornuftig" — så et måltal ikke kan flyttes ved et uheld ved at gøre
   botten klogere.

3. **Genskrive økonomimåltallene i `Claude.md` samtidig med pakke 1.** "Netto pr.
   kampdag ±£2k" og "0–1 administration" er formuleret for en trup på 13. Efter
   pakke 1 er den tilsigtede trup ~16, og efter pakke 2 findes der en mekanik hvis
   eksplicitte formål er økonomisk konsekvens. Måltallene bør genformuleres med
   vilje frem for at blive ved med at være dem man klemmer sig ind under.

4. **Taget pakke 2 før pakke 3.** Protest-trappen ændrer økonomien mest af de fem,
   og jeg balancerede ratebetalingen mod en verden uden den. Havde jeg vendt dem
   om, ville jeg have justeret én gang i stedet for to.

5. **Bygget en `--echo=protest3`-visning og faktisk kigget på stadion-tegningen.**
   Jeg verificerede at SVG'en *ændrer sig* på hvert trin og at den er velformet,
   men jeg har ikke set på om protestlagnerne og de tomme blokke rent faktisk ser
   godt ud. Det er den ene del af nattens arbejde, der ikke er efterprøvet med
   øjnene.

---

## Ufravigelige krav

Formanden udtager stadig aldrig holdet. Friskhed er noget **gafferen** vægter,
når han vælger elleveren — spilleren ser tilstande (*Fresh / Used / Flat*), aldrig
tal, og har ingen knap der sætter nogen på banen. Hans eneste svar på en træt trup
er at skaffe flere spillere. `G` er stadig et træ: `assertSerialisable` er grøn,
og alt nyt (`load`, `lastXI`, `commitments`, `valHistory`, `trust`, `protest`) er
id'er og primitive værdier. Spillere nøgles på `id`. Alle nye modaltyper: ingen —
ingen af de fem pakker havde brug for én.
