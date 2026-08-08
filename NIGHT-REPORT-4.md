# NIGHT-REPORT 4 — nat 4 lukket af

*Skrevet efter en uafhængig audit af nat 4's arbejde. Branch `claude/koersler-distance-twax19`, oven på `nightly/trupdybde` ved `aafd867` (nat 4, pakke 25). `master` og `nightly/trupdybde` er ikke rørt.*

Denne rapport er **færdigmarkøren nat 3 og nat 4 aldrig fik.** Udviklingsagenten committede pakke 12–25 pakke for pakke, men stoppede efter pakke 25 uden at skrive en natrapport for hverken nat 3 eller nat 4 — så testagenten havde ingen markør at handle på og står stadig på nat 2. Denne rapport lukker af, og forklaringen på hvorfor er ærlig: pakke 22–25 er udviklingsagentens, ikke mine. Jeg har auditeret dem, målt dem, og bygget de underfeatures der manglede (pakke 26–28). Hvor noget stadig ikke er efterprøvet, står det nedenfor.

---

## Status — de to kørsler

| Kørsel | Nået til | Færdigmarkør |
|---|---|---|
| Udvikling (`nightly/trupdybde`) | Nat 4, pakke 25 | manglede — denne rapport erstatter den |
| QA (`nightly/qa`) | Nat 2 | står stadig dér; har intet målt på pakke 12–28 |

**Nat 3 (pakke 12–21)** blev committet fuldt ud og er dækket af den grønne regression nedenfor, men har aldrig fået en selvstændig rapport eller en QA-måling. Den er ikke rørt i denne omgang ud over verifikation.

---

## Hvad nat 4 satte sig for — og hvad auditten fandt

Nat 4's fire emner fra `ROADMAP.md` var alle **grundlæggende** bygget (pakke 22–25). Men hvert emne havde underfeatures i specen, som ikke var koblet. Fire parallelle auditter mod specen fandt:

| Emne | Kerne bygget | Reelle huller |
|---|---|---|
| Femtrins-trappen (22) | Trin 1,2,4,5 + æra-opsummering ✅ | ❌ administratoren solgte ingen spillere · ❌ intet brandudsalg med ur · trin 3 var kun et fladt løncut |
| En rigtig bank (23) | Beløb+løbetid, dynamisk rente, "nej pga. gæld", invester-lån ✅ | ⚠️ klubværdi manglede i renten (koden matchede ikke sin egen kommentar) · ⚠️ kriseknap viste et hardkodet, forkert lånebeløb |
| Kontraktrollen (24) | Alle fire punkter komplette ✅ | ⚠️ dødzone: en 24-25-årig kunne signes som "pro", betale 18% ekstra og aldrig udvikle sig |
| Tilgangen (25) | Resultatordre, gaffer vælger, dele af priserne + odds ✅ | ⚠️ kortrisiko ikke koblet til ordren · ⚠️ tvang kostede kun tålmodighed, ikke tillid+moral · ⚠️ HT-valg viste ingen odds · ⚠️ tac/man-tal blev ikke brugt |

---

## Hvad der blev bygget for at lukke hullerne

| Pakke | Hvad det gør for spillet | Status |
|---|---|---|
| **26** | Banken læser klubbens værdi ind i renten (en klub med et stadion er en bank mindre bange for); kriseknappen viser nu det lån du faktisk får | ✅ `feb4d3d` |
| **24-opf.** | Pro-rollens to aldersgrænser bliver ét tal — dødzonen for 24-25-årige er lukket | ✅ `058dddc` |
| **27** | At jagte en sejr hæver nu kortrisikoen (ikke kun skader); at tvinge gafferen koster tillid og moral; hans man/tac-tal afgør hvor stædig han er; "riv dem et nyt et" i pausen viser hans vilje før du trykker | ✅ `a4c04d0` |
| **28** | **Brandudsalg med ur:** i administration skal £X af lønsummen væk på 3 kampdage — du vælger hvem. **Administratoren sælger selv** hen over hovedet på dig, hvis uret løber ud | ✅ `cb812e4` |

Alle nye invarianter er **saboteret først** (projektets ufravigelige regel): hver test er set fejle mod bevidst ødelagt kode, før den blev betroet. Det gælder klubværdi-renten, kortrisikoen, tac/man-oddsene, insist-prisen (tillid+moral) og brandudsalgets to ben (dine salg krediteres via `detachPlayer`; administratoren sælger selv og stopper præcis ved den spilbare trup).

---

## Hvor de to agenter er uenige

Der er ingen ny uenighed mellem dev og QA at afgøre — **QA har ikke målt noget siden nat 2.** Til gengæld har jeg efterprøvet ét af QA's hårde nat-2-fund og det holder ikke længere:

- **QA's F: "store kampe er UDENFOR båndet (2,9 mod mål 3-5)."** Måler nu **3,6 pr. sæson ved 10×5 og 3,5 ved 200×20 — OK.** Nat 3's pakke 12 reparerede instrumentet (de tvungne scenarier forurenede målingen), og pakke 17 gav bundstriden som ny kilde. Det fund er lukket.
- **QA's F: harness rød ved 200 seeds (dublet-tickerlinje, seed 1022551).** Seed 1022551 er nu **OK**; nat 3's pakke 13 sendte den hardkodede offside-linje gennem dublettvagten. 200×20 er grøn.

---

## Måltal — målt på nat 4's kode (denne branch)

Kanonisk måling `--seeds=10 --seasons=5 --stats`, plus den hårde `--seeds=200 --seasons=20`:

| Måltal | Målt (10×5) | Målt (200×20) | Mål | |
|---|---|---|---|---|
| Regression | `REGRESSION_OK` | `REGRESSION_OK` (0 af 200 fejlede) | grøn | ✅ |
| Store kampe pr. sæson | 3,6 | 3,5 | 3-5 | ✅ |
| Administrationer | 0,60 pr. karriere | 3,82 pr. karriere (20 sæsoner) | 0-4 (10×5) | ✅ |
| Lån optaget | — | 2,79 pr. karriere · 36/200 slutter med gæld | — | |
| Ordrer (win/point/free) | — | 20% / 20% / 60% | — | |
| Ordrer gennemtvunget | — | 4,14 pr. karriere | — | |
| Brandudsalg (økonomisk effekt) | trappe-tal **eksakt som før** (2,5 adm./karriere ved 20×12) | uændret | neutral | ✅ |

Brandudsalget blev bygget så det er **økonomisk neutralt**: kontraktnedslaget (den tunede, vedvarende lettelse) blev bevaret, og brandudsalget lagt oveni som "hvem ryger"-dramaet. Et første forsøg der erstattede nedslaget fik administrationer til at eksplodere fra 2,5 til 21 pr. karriere — det er rullet tilbage, og de identiske trappe-tal før/efter er beviset på at mekanikken ikke flytter balancen.

---

## Venter på din beslutning

**Trin 5 "inden for rækkevidde" er 61% mod ROADMAP'ens mål på 5-15%.** Dette er **præeksisterende** i nat 4's egen pakke 22 — jeg målte det identisk på koden *før* mine ændringer, så det er ikke noget jeg indførte. Bemærk to ting: "faktisk nået (klubben tabt)" er **0 af 200** — bottens politik accepterer aldrig fortynding til døden, så tallet siger mest noget om botten, ikke om spillet. Men 61% af karriererne når *til kanten* af trin 5, hvilket er langt over designmålet.

Spørgsmålet er dit: **skal nat 5 tune trappen ned mod 5-15%** (fx via `BAL.ladder`/`BAL.bank.crisisAt`), eller er "på kanten men sjældent tabt" den følelse du vil have? Min anbefaling: tun den ned — 61% på kanten udvander dramaet i at være på kanten. Men det er en balancebeslutning på eksisterende kode, ikke et hul, så jeg har ladet den stå til dig.

---

## To bevidste afvigelser fra specen (noteret, ikke rettet)

1. **Lånet ligger i `G.loans`, ikke `G.commitments`** som ROADMAP'en skrev. Udviklingsagenten dokumenterede hvorfor: afdragskadencen er pr. kampdag, mens commitments afregnes pr. sæson. Målet — væk fra enkelt-lån-særtilfældet — er nået. Jeg er enig i afvigelsen.
2. **Game over rammer ved præcis 50%, ikke "under 50%".** Bevidst: fra start-51% gør det den første redning til en reel beslutning. Fornuftigt.

---

## Kun du kan afgøre det

Ingen agent kan teste, om det her *føles* rigtigt på telefonen. Kig især på:

- **Brandudsalget:** åbn en karriere, kør den i administration, og se om uret + "£X/uge tilbage" på finansskærmen er tydeligt nok, og om det er en beslutning du *vil* træffe eller bare klikker væk. Prøv både at vælge selv og at lade uret løbe ud, så administratoren sælger for dig.
- **Gafferens tålmodighed:** median-tålmodighed ved karrierens slut er **3** ved 200×20 — botten tvinger ordrer igennem 4 gange pr. karriere og brænder ham helt ned. En rigtig spiller gør det næppe så hårdt, men se efter, om det føles som om han "husker", eller bare er en bar der tømmes.
- **Kortrisikoen ved "tre point":** mærkes det som en pris værd at overveje, eller er det usynligt?

---

## Sådan spiller du denne version

Arbejdet ligger på `claude/koersler-distance-twax19` oven på `nightly/trupdybde`. Vil du spille det, kan det flettes ind i `nightly/trupdybde` (eller derfra til `master`, som GitHub Pages serverer). Regressionen er grøn ved 200×20, så det er sikkert at flette — men QA har stadig ikke målt nat 3+4 uafhængigt.

## Mit forslag til i dag

**Sæt QA-agenten på nat 3+4 før du fletter til `master`.** Koden er sund (200×20 grøn, alle fund sabotage-verificeret), men dev's tal for pakke 12–28 er stadig kun målt af udviklingssiden og af mig — ikke af den uafhængige testagent, hvis hele værdi er at måle et andet sted end den der byggede. Derefter: beslut trin 5-balancen (ovenfor), så nat 5 kan bygge staben videre på et afklaret fundament.
