# NATRAPPORT 7 — Imperie-natten: øjeblikkene, ejeren og multi-klub

*Session 11-13/8 2026 · branch `claude/nightly-trupdybde-t1-t4-xvhppp` · tre runder i én rapport: C-serien (øjeblikkene), E-serien (ejeren) og IMP-natten (E0+M3). Hver pakke egen commit, hver invariant saboteret først.*

## TL;DR — hvad kan du mærke med det samme

- **Salget er et marked, du arbejder** (C1): "Se tilbud" åbner tilbudssiden med interessent-kartotek i tre niveauer, rundringning med tosidet pris, og "ikke til salg" som offentligt ord med indbygget indsats.
- **Deadline day-bordet bliver liggende** (C2) — og tavshed koster: en ignoreret rival går til kamp med hovedet et andet sted. "Hold på ham" giver mening nu, for alle tre udgange har en pris.
- **Forlængelsen taler** (C3): han åbner med sin stærkeste sandhed ("Jeg kan gå GRATIS til sommer"), tallet kommer først efter dit bud, og "Giv mig et år mere, så skriver jeg" er en ægte replik der regner rigtigt.
- **Balancepinden** (E2): vælg 51-100 % ejerskab ved start — pengene fra det solgte er DINE, klubbens budget er ens for alle. Og pinden er permanent: sælg 5 %-skiver når du vil.
- **IMPERIET** (IMP1-3): køb kontrol med en klub i en anden division, gå IND i den (temaet skifter, truppen fødes af det verden ved), lad en direktør drive den mens du er væk (udbytte minus hans grådighed, krise-papirer på bordet) — og **at miste en klub er aldrig game over**: klubben spiller videre i pyramiden, du fortsætter som investor, og en klub i knæ tager imod enhver ejer. Gamle game-over-gemmer vækkes til live ved indlæsning.

## Arkitekturvalget (IMP1) — det der gør multi-klub muligt

G ER den klub, du står i. Andre kontrollerede klubber lever som verdensklubber i pyramiden (spiller runder, rykker op/ned via den eksisterende exchange) med den dybe tilstand — trup, kasse, tribuner, indbakke — pakket i `G.holdings[wid].deep`. DIG (formue, omdømme, andele, kalender, agent-relationer) bor uden for `CLUB_FIELDS` og følger med gennem hver dør. Skiftet er exchange-mønsteret: alle klubber i én pulje, min nye division bliver `teams`, resten `worldRest`. Ligaintegriteten (14 × kampdag) holder matematisk, fordi verdens-sim altid parrer alle 14.

**Lærdommen natten fandt selv:** pakkede `teams/me/fixtures` var ALIASER til levende verdensobjekter — samme klub bogført to steder, og gem/indlæs splittede identiteten. De pakkes ikke længere (de genbygges af verdens viden ved hvert besøg). Det er stadionfonds-lektionen i ny form: ingenting må bo to steder.

## Gaten — og de tolv den fandt

**Slutgate 200×20 `--bot=both`: GRØN — 0 fejl af 400.** Vejen derhen fandt 12 ægte huller, alle i kapitel-vejen (lazy-bots der MISTER klubben og spiller videre):

1. Pakkede aliaser (7/400) — rettet ved at udelade teams/me/fixtures af pakken + migration af gamle gemmer.
2. Invarianterne kendte ikke investor-tilstanden (trup 0, div −1, ejerandele 0, verden 56/0) — tilstanden består nu HELE invariant-sættet, og økonomitrappens trin 5-probe kører det selv i hver kørsel, så gaten aldrig igen skal finde næste assert i kæden.
3. Trup-sidens loftbjælke dividerede med nul-loftet (NaN i markup).
4. Bottens idle-løkke greb i en tom trup mellem klubber.
5. Nedryknings-proben målte ratio med tolerance — på små lønninger æder 10-krones-afrundingen faldet (£10 → £10), så korrekt kode målte ×0,938. Proben regner nu den præcise BAL-formel.

De to kapitel-seeds (167299, 452383) nåede dybere for hver gate-runde — invarianter → skærme → bot-løkke — til de gik hele vejen igennem: mistet klub, investor-uger, comeback-køb, formand igen.

## Målt

- S1-gulvtal (20×5, efter hver pakke): netto −£1,0-1,8k (mål ±2k) · indtjening £121-183k (mål 100-260k) · store kampe 4,0-4,7 (mål 3-5) · admin 0-1/20 · oprykning S1 8-14/20.
- Imperiet leves (6×15 sane): 2 af 6 karrierer købte klub nr. 2; klubskift i live spil; slut-ejerandel i karriererne spænder 51-100 % (balancepinden bruges).
- Slutdivision ved 20 sæsoner: sane Premier 8,5 % · lazy 9,5 % — toppen er stadig en kamp efter alle tre runder.
- Sabotager i alt denne rapport: **28** (C-serien 14, E-serien 14 inkl. IMP) — alle røde som de skulle, før hver commit.

## Det udestående — ærligt

1. **Direktørens mandat er v1**: han betaler udbytte, driver klubben frem, ælder truppen og ringer ved krise — men eskaleringspapirerne kender kun krisen (stjerne-bud på fraværende klubbers spillere venter), og hans "mandat" er ikke justerbart endnu.
2. **E5** (skjult potentiale som ejer-beslutning) og **B3/D2** (sponsorer, aldring med varsel) står stadig.
3. **R-resten**: dansk flavor, R8 FA Cup (egen nat), R9 mægler + Invest-aktiver, R10 arkiv, R11 PWA + 3 slots.
4. **Investor-tilstandens UI er nøgternt** (Ugen-kort + Imperium) — den kunne fortjene sit eget "mellem klubber"-liv (presseomtale, tilbud der kommer til DIG) når R9-mægleren bygges.
5. **20 sæsoner beviser ikke 40**: multi-klub-formuer vokser med direktør-udbytter over tid — hold øje med om imperie-økonomien løber fra klubøkonomien i meget lange karrierer (M4's balancemål er næste skridt).
