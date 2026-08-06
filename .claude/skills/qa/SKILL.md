---
name: qa
description: Morgenrapport over de natlige agenters arbejde på Football Tycoon. Henter branchene, læser udviklingsagentens NIGHT-REPORT og testagentens QA-REPORT, efterprøver stikprøvevis og præsenterer det hele i ét fast format. Brug når Mads siger "QA", "natrapport", "hvad skete der i nat", "hvad nåede de", eller på anden måde spørger til nattens kørsel.
---

# Morgenrapport — nattens agenter

Mads står op og vil vide, hvad natten gav. Han skal kunne læse svaret med kaffe i hånden og derefter beslutte én ting: hvad der skal ske i dag. **Lever en syntese, ikke en videreformidling** — rapporterne er lange, og hans tid er kort.

## Trin 1 — hent tilstanden

```bash
git fetch origin --prune
git log --oneline --format='%h %ad %s' --date=format:'%H:%M' origin/nightly/trupdybde -15
git log --oneline origin/nightly/qa -5
git diff --stat master...origin/nightly/trupdybde
```

Findes en branch ikke, eller mangler dens rapport, **sig det rent ud**. En agent der ikke kørte, er den vigtigste oplysning i hele rapporten — pak det ikke ind.

## Trin 2 — læs

- `NIGHT-REPORT-2.md` på `nightly/trupdybde` — hvad udviklingsagenten påstår
- `QA-REPORT.md` på `nightly/qa` — hvad testagenten målte
- `DECISIONS-NEEDED.md`, hvis den findes — spørgsmål der venter på Mads
- Commit-beskederne — de rummer begrundelserne, rapporterne rummer tallene

Læs dem med `git show <branch>:<fil>` frem for at tjekke brancher ud, så Mads' arbejdstræ ikke skifter under ham.

## Trin 3 — efterprøv, før du videreformidler

**Obligatorisk. Referér aldrig et fund, du ikke har set holde.**

Vælg de **to alvorligste fund** fra QA-rapporten og reproducér dem lokalt med det angivne seed. Kan de ikke reproduceres, er det i sig selv den vigtigste sætning i din rapport — så er QA-rapporten ikke til at handle på.

Kør også selv den grundlæggende regression mod nattens kode, i stedet for at tage agenternes ord for at den er grøn:

```bash
node test-harness.js --seeds=10 --seasons=5 --stats
```

Vær opmærksom på **uenighed mellem de to agenter**. Udviklingsagenten måler sit eget arbejde og har en interesse i at det ser godt ud; testagenten måler uafhængigt. Hvor de to er uenige om et tal, er der næsten altid noget at lære — det er rapportens mest værdifulde afsnit, ikke en fodnote.

## Trin 4 — præsentér i dette format

Udelad et afsnit, hvis det er tomt — skriv ikke "ingen fund" seks gange. Tal skal være tal, ikke "forbedret".

---

**# Natten \<dato\>**

**Status** — én linje pr. agent: kørte den, blev den færdig, hvor stoppede den, hvor mange commits.

**## Hvad der blev bygget**
Tabel: pakke · hvad det gør for spillet (ikke hvad koden gør) · status. Én linje pr. pakke.

**## Hvor de to agenter er uenige**
Dev påstod X, QA målte Y. Hvem der har ret, og hvordan du afgjorde det. Er der ingen uenighed, så sig det — det er en god nyhed, der er værd at nævne.

**## Fejl, rangeret efter alvor**
Hver med seed, hvad der sker, og hvorfor det betyder noget for en spiller. Markér tydeligt hvilke to du selv har efterprøvet.

**## Måltal**
Før og efter, i tabel. Med mål-kolonne og ✅/❌, som nattens rapporter selv gør.

**## Venter på din beslutning**
Fra `DECISIONS-NEEDED.md`. Formulér hvert spørgsmål så det kan besvares med én sætning, og giv din anbefaling — men gør det tydeligt at valget er hans.

**## Kun du kan afgøre det**
Det ingen agent kunne teste: følelse, tempo, UI på telefonen, om noget er sjovt. Vær konkret om hvad han skal kigge efter, og hvor.

**## Sådan spiller du nattens version**
Nattens arbejde ligger på `nightly/trupdybde`; GitHub Pages serverer `master`. Skal han spille det på telefonen, skal det flettes:

```bash
git checkout master && git merge nightly/trupdybde && git push origin master
```

Foreslå det kun, når regressionen er grøn og du har efterprøvet fundene. Er der en alvorlig fejl i nattens arbejde, så sig det og lad være med at foreslå fletningen — `pre-night-backup` findes netop derfor.

**## Mit forslag til i dag**
Én anbefaling, ikke en menu. Typisk ét af: flet og spil den · ret fejl X først · besvar beslutning Y, så næste nat kan bygge videre.

---

## Tone

Samme som resten af projektet: dansk, direkte, ingen opblødning. Er noget gået galt, står det først. Nat 1's rapport var værdifuld, netop fordi den var ærlig om fire ting, den ikke kunne bevise — hold den standard, også når du refererer den.
