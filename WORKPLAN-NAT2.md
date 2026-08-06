# ARBEJDSKØ — NAT 2: dybde, ingen nye systemer

*Skrevet 6/8 2026 kl. 22:15, efter at nat 1 tømte `WORKPLAN.md`. Selvstændig: en frisk session skal kunne udføre den herfra uden yderligere kontekst.*

Læs `Claude.md` først, og derefter `NIGHT-REPORT.md` på `nightly/trupdybde` — den indeholder nat 1's måltal, afvigelser og tre fejl i selve måleværktøjet, som du skal kende, før du måler noget.

**Arbejdsform:** én pakke ad gangen, `node --check proto-extract.js` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn, én commit pr. pakke. Alle balancetal i `BAL`. Nye modaltyper i **både** `handleModal` og `HANDLED_MODALS`.

**Branch:** fortsæt på `nightly/trupdybde` oven på `ef74911`. Første handling: `git merge origin/master` for at hente denne fil — der kan ikke opstå konflikt, den er ny.

## Ufravigelig ramme

> **Ingen nye systemer i nat.** Hver pakke skal kunne forsvares som: *noget der allerede findes, virker ikke godt nok.* Ingen pokal, ingen rival, ingen Youth Day, intet museum, ingen stab, ingen leje. De står i kø til de kommende nætter og er bevidst valgt fra.

> **Formanden udtager ALDRIG holdet.** Ingen opstilling, ingen taktik. Enhver mekanik der kommer i nærheden, er implementeret forkert.

- **Ingen designbeslutninger.** Er `Claude.md` og GDD'en tavse, og betyder valget noget: skriv spørgsmålet i `DECISIONS-NEEDED.md`, vælg imens den mest GDD-konsistente mulighed, og begrund den i commit-beskeden. **Tun aldrig et måltal væk i stilhed** — rapportér afvigelsen i stedet.
- **Sabotér hver ny invariant, før du stoler på den.** Nat 1's egen lektie: to protest-assertions bestod mod bevidst ødelagt kode. En invariant der ikke fejler, når du med vilje knækker det den påstår at måle, måler ingenting. Gør sabotageforsøget til første skridt, ikke sidste.
- **Hold botpolitik adskilt fra spilmekanik.** Nat 1 blandede dem to gange og måtte skille dem ad bagefter. Se pakke 9 — den gør adskillelsen til værktøj.
- **Hård stop kl. 04:00 dansk (02:00 UTC)**, uanset hvor langt køen er nået. Skriv `NIGHT-REPORT-2.md` og push. En halv kø gennemført ordentligt er mere værd end syv halve pakker.

---

# Pakke 5 — Ingen kamp er nogensinde stor

## Fejlen, verificeret

`buildMatch()` kaldes med `big=false` for **alle 26 ligakampdage** (`playMatchday`, ~linje 863). `big=true` sættes kun i playoff (~linje 1199). Fem ting er døde på én gang:

| Det døde | Hvad det lover | Hvad det koster spilleren |
|---|---|---|
| Storskærmen | *"+10% gate in big matches"* | £25.000 |
| Away End | *"Bigger gates in big matches"* | op til £150.000 |
| `bigExtra` | Prisknap formanden selv skruer på | et valg der aldrig gælder |
| `biggame`-traiten | *"Big-game player"* | en spillerværdi der ikke findes |
| Quick mode | GDD: store kampe spilles altid fuldt | `!M.big` er altid sandt |

To byggerier til £175.000 og en pristrappe uden effekt. Det er samme fejlklasse som indbakkens blindgyde: mekanikken er bygget, den bliver bare aldrig kaldt.

## Implementering

**Ingen nye turneringer.** `big` udledes af tabellen, som allerede findes:

- sidste spilledag, når oprykning eller nedrykning stadig kan afgøres
- topopgør mellem nr. 1 og 2 efter kampdag ~18
- mod klubben lige over eller under dig i tabellen sent i sæsonen
- returopgøret mod det hold der ydmygede dig værst i første halvdel

Tærskler i `BAL.big`. Frekvensen skal ramme **3-5 pr. sæson**: bliver hver anden kamp stor, er ingen af dem det. Harness'en rapporterer andelen, og tallet er pakkens bevis.

Kontrollér at quick mode nu faktisk spiller store kampe fuldt ud (GDD linje 216), og at `bigGameBonus()` får noget at virke på.

## Færdig når

3-5 kampe pr. sæson er store, storskærm og Away End har **målbar** effekt på gate (mål før/efter i et tvunget scenarie — ikke bare "koden kaldes"), og økonomimåltallene holder. Flere store kampe betyder mere gate; hvis nettoet flytter sig, skal det stå i rapporten.

*Rydder vejen for pokal og derby, som er de kanoniske kilder til store kampe — de bliver nye kilder til `big`, ikke nye rør.*

---

# Pakke 6 — Tekstbiblioteket

GDD linje 214 foreskriver **300-500 event-linjer**. Der er otte målbeskrivelser. En sæson giver 35-40 mål, så hver linje læses fem gange pr. sæson og hundredvis af gange over en karriere.

| Pulje | Nu | Mål |
|---|---|---|
| `GOALDESC` | 8 | 60+ |
| `NEARMISS` | 5 | 40+ |
| `FLAVOR` | 7 | 60+ |
| `SPONSORS` | 4 | 10, hver med agenda (GDD linje 121) |
| `COACHES` | 3 | 8, med stil og personlighed |

Puljerne **kontekst-tagges**, så tonen følger situationen: stillingen, vejret, divisionen, sen scoring, øretæve, stor kamp (efter pakke 5 findes de). Tonegrænsen er GDD linje 180 — *"kunne det stå i en ægte lokalavis?"* Jordnær skævhed, aldrig magi, aldrig fjerde væg.

**Harness:** ingen linje gentaget inden for samme kamp, ingen tom pulje efter filtrering på kontekst (fælden: et snævert tag der matcher nul linjer), og enhver `{P}`-placeholder altid udskiftet — en ubehandlet `{`-placeholder i renderet HTML skal fejle testen.

## Færdig når

En fuld sæsons ticker kan læses igennem uden at samme sætning optræder to gange.

---

# Pakke 7 — Tekst mod kode

Fejlklassen fra sponsorklausulen: teksten lovede 20 %, koden tog intet. Gennemgå hvert løfte i `FAC_DETAIL.fx`, `STANDS[].role`, `FACS[].txt` og de BAL-drevne UI-tekster mod hvad koden faktisk gør. Ret enten koden eller teksten — og skriv i commit'en hvilken vej der blev valgt, og hvorfor.

**Medtag dokumentationen — nat 1 anbefalede det selv.** `Claude.md`s økonomimåltal ("netto/kampdag ±£2k", "0-1 administration") er formuleret for en trup på 13. Efter pakke 1 er den tilsigtede trup ~16, og efter pakke 2 findes en mekanik hvis eksplicitte formål er økonomisk konsekvens. Genformulér måltallene med vilje, med den nye trupstørrelse som forudsætning, frem for at blive ved med at klemme sig ind under gamle tal. `Claude.md` påstår også "Sæson = 16 kampe"; koden kører `rounds:26`. Den slags skævhed er, hvordan en fremtidig session træffer en forkert beslutning.

---

# Pakke 8 — Blindgyde-auditten gøres permanent

Engangsscripts fra 6/8 bliver faste invarianter i `test-harness.js`:

- hver `onclick="fn(...)"` i renderet markup peger på en funktion der findes
- hver modaltype der kan sættes, bliver også tegnet
- hver inbox-besked med `action && !done` har mindst én knap
- funktioner der aldrig kaldes i en fuld gennemspilning, listes
- knapper der er deaktiverede i **alle** tilstande, listes

De to sidste er rapporter, ikke fejl — en liste i `--stats`, så døde mekanikker bliver synlige i stedet for at skulle findes ved spiltest.

Husk sabotagereglen: knæk hver af dem med vilje og se den fejle, før du committer.

---

# Pakke 9 — To botprofiler

Nat 1's egen anbefaling, og en forudsætning for pakke 10. Botten blev klogere fire steder samtidig med at spillet blev bedre, og trupstørrelsen er følsom over for begge. En bot der stadig solgte ned til 13, ville vise et lavere tal med nøjagtig samme spilkode.

Gør profilen til et flag: `--bot=lazy|sane` (standard `sane`, så eksisterende kald ikke skifter betydning).

- **lazy** — nat 0's politik: sælger overskud, forlænger ikke, betaler kontant
- **sane** — nat 1's politik: forlænger kontrakter, sælger først over 16 mand, bruger rater, rører ikke driftskapitalen

Rapportér begge i `--stats`. **Forskellen mellem dem er botpolitikkens bidrag; det de har til fælles, er spillets.** Uden den adskillelse kan ingen fremtidig balancemåling stole på sit eget resultat.

---

# Pakke 10 — Endgame-balance, sæson 10-20

Måltallene dækker kun sæson 1-6. Kør 50 seeds × 20 sæsoner med **begge** botprofiler og mål:

- Bliver klubben uovervindelig? Holder pengene op med at betyde noget?
- Er der noget tilbage at lave i sæson 18?
- **Oprykninger i de sene sæsoner.** Nat 1 målte sæson 5 til 0/10 mod måltallets 1-3. Er klatreturen blevet for hård, eller er 5 sæsoner bare for tidligt at dømme på? 20 sæsoner svarer på det.
- **Administrationer: 4 mod måltallets 0-1.** Nat 1 lod bevidst tallet stå. Skruerne er `BAL.protest.silentHome` og `BAL.protest.easing`. Hvor grænsen skal gå er en **designbeslutning** — mål konsekvensen af tre forskellige niveauer, skriv spørgsmålet i `DECISIONS-NEEDED.md`, og lad Mads vælge. Tun det ikke væk.

**Opfind ikke systemer for at fylde hullet.** Er endgame tomt, er det et fund til rapporten, ikke en undskyldning for at bygge Dynastiet i nat. Kommer efter pakke 5, fordi store kampe flytter gate-indtægten.

---

# Pakke 11 — Efter kampen

GDD linje 210 kræver en **analyselinje**, der forklarer resultatet ud fra attributter og valg ("deres midtbane var 8 point bedre, og mudderet tog jeres teknikere"), 2-3 kampnøgletal og gafferens citat tonet efter resultat *og* personlighed. Man of the Match findes; resten er tyndt. Man skal lære noget af hver kamp — ellers er tilgangsvalget før kampen en gætteleg.

---

# Hvad der bevidst IKKE laves

**Ingen visuel omlægning af UI.** Du kan ikke se en telefon. Objektive tjek hører til i pakke 8 — overløb, afkortet tekst, evigt deaktiverede knapper — men smag og layout venter, til Mads kan kigge. Det gælder også protest-trappens stadion-tegning, som nat 1 selv noterede som uefterprøvet med øjnene.

**Køen til de kommende nætter**, i den rækkefølge afhængighederne peger på. Pakke 5 gør de to første billigere:

1. Drama: pokalen + organisk rival/derby
2. Verden: liganyheder + Maureen + de fire dilemmaer
3. Mennesker: Youth Day + stab + scout-missioner
4. Hukommelse: klubmuseum + mærkedage + årsgalla

---

# Verifikation

```
node --check proto-extract.js
node test-harness.js --seeds=10 --seasons=5 --stats
```

Grøn = `REGRESSION_OK`. Kontrollér måltallene efter hver pakke og rapportér afvigelser i commit-beskeden frem for at tune dem væk.

Afslut med `NIGHT-REPORT-2.md`: hvad blev færdigt, målte tal før og efter pr. pakke, hvor du afveg fra denne plan og hvorfor, hvad du var i tvivl om, og hvad du ikke kunne efterprøve. Skriv den som **sidste** handling — testagenten bruger den som færdigmarkør.
