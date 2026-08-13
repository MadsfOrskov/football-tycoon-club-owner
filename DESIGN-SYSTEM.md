# FOOTBALL TYCOON — UI/UX DESIGN SYSTEM (låst med Mads 13/8 2026)

*Dette dokument er STYRENDE for alt visuelt arbejde. Enhver ny skærm, modal
eller komponent skal følge det. Den overordnede visuelle stil må IKKE ændres
uden Mads' accept. Kerneidentiteten: **Dark Navy + Premium + Football +
Business + Clean + Modern.***

## 1. Retning
Spilleren er ejer/direktør for en professionel fodboldklub. Designet skal være
premium, moderne, professionelt, minimalistisk, sportsorienteret, let at
forstå, mobiltilpasset og visuelt tilfredsstillende uden at være overfyldt.
IKKE tegnefilmsagtigt eller børnevenligt. Originalt — ingen direkte kopi af
eksisterende spil.

## 2. Farvepalette (bruges KONSEKVENT — kun via CSS-tokens)
| Token | Hex | Rolle |
|---|---|---|
| `--bg1` | `#08111F` | Primær baggrund |
| `--bg0` | `#101C2D` | Sekundær baggrund |
| `--panelSolid` | `#142338` | Cards |
| `--ink` | `#FFFFFF` | Primær tekst |
| `--muted` | `#8FA1B7` | Sekundær tekst |
| `--pos` | `#35D07F` | Positive værdier |
| `--neg` | `#FF5C67` | Negative værdier |
| `--acc` | `#3D8BFF` | Accent (interaktion, CTA, aktiv nav) |
| `--gold` | `#F5C451` | Premium/guld — EJER-LAGET (M2.5's guld-sprog) |

Klubbens valgte farve (introens AKT 2) lever videre som IDENTITET — skjold,
trøje, små detaljer (`--club`) — aldrig som hele UI'ets tema. Lys tilstand
findes ikke: primær UI er mørk navy, altid.

## 3. Cards
Centrale. Bløde hjørner (ikke overdrevent runde), diskrete borders, meget let
shadow/elevation, god spacing. Professionelle dashboard-komponenter — bruges
til spillere, kampe, økonomi, transfers, sponsorer, stadion, klubværdi, fans,
nyheder, milepæle.

## 4. Typografi
Maks 2 fontfamilier (i dag: Inter + BarlowCN til tal — behold). Tydelige
overskrifter, STORE tal (økonomi, ratings), korte labels, klart hierarki.

## 5. Navigation
Ekstremt enkel. Bottom nav med 4-5 hovedområder. Spilleren skal altid vide:
hvor er jeg, hvad er vigtigt, hvad kan jeg gøre, hvad er næste handling.
Diskret og premium. (To-lags-modellen består: guld-nav = ejeren, klub-nav =
klubben.)

## 6. Home Dashboard
Spillets vigtigste skærm — et professionelt CEO-dashboard: klub-header (navn,
omdømme, værdi, kasse) · næste kamp · klubbens form (placering, form, fans,
indtægt) · ACTION CENTER (papirerne på bordet: tilbud, sponsor, skade,
bestyrelse, scouting).

## 7. Football identity
Business-orienteret, men stadig fodbold: baner, trøjer, spillerportrætter,
klublogoer, stadion, match cards, tabeller, transfer cards, statistik — brugt
elegant og minimalistisk.

## 8. Animationer
Korte og tilfredsstillende, altid som feedback (beløb der tæller, værdi der
stiger med +%), aldrig så meget at spillet føles langsomt.

## 9. Monetisering
Skal føles som en naturlig, eksklusiv del af spillet ("premium kluboplevelse")
— aldrig aggressiv "BUY NOW"-æstetik.

## 10. Konsistens (ekstremt vigtigt)
Nye skærme GENBRUGER komponenter, farver, spacing, typografi, knapper, cards
og navigation. Ingen nye visuelle stilarter uden meget god grund — og nye
elementer designes ind i systemet.

## 11. Hierarki
Én tydelig fokuspunkt pr. skærm. Eksempel transfer: spilleren → beløbet →
accept/afvis → støtteinfo. Aldrig alt lige vigtigt.

## 12. Mobile-first
Touch-optimeret, store touch targets, ingen små tekstfelter, minimal
scrolling, vertikale cards, tydelige CTA-knapper, iPhone + Android.

## 13. Golden rule
I tvivl mellem (A) flere funktioner/mere info og (B) enklere og mere elegant:
**vælg B.** Premium football ownership simulator — ikke et Excel-regneark.

## 14. Før enhver ny skærm
Hvor passer den i systemet? Hvilke komponenter genbruges? Hvad er vigtigst
for spilleren? Hvad er primær CTA? Hvordan gøres den så enkel som muligt?
