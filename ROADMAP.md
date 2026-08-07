# ROADMAP — hvad der ligger efter nat 3

*Skrevet 7/8 2026. Arbejdsordren til den aktuelle nat ligger altid i sin egen `WORKPLAN-NAT*.md`; denne fil er køen bagefter. Alle valg herunder er truffet af Mads — hvor der står "besluttet", er der spurgt og svaret.*

Rækkefølgen er styret af afhængigheder, ikke af hvor sjovt noget lyder:

```
nat 3 (i gang) → nedrykning + skalering + forventningsmøde
        ↓
nat 4  konsekvensen: trappen, banken, kontraktrollen, tilgangen
        ↓
nat 5  staben: cheftræner, fysio, ungdomschef, scout
        ↓
nat 6  formandens ord
        ↓
nat 7  pyramiden ────────┬──→ pokal + rival
                         └──→ multi-klub
        ↓
nat 8  byen lever: investeringer, lokale, liganyheder
```

**Pyramiden er flaskehalsen.** Pokal, rival, multi-klub og Legende-væggen afhænger alle af, at de andre divisioner findes som steder. Bygges den efter dem, skal alle fire laves om.

---

# Nat 4 — konsekvensen: dine beslutninger skal koste noget

## Femtrins-trappen

GDD'ens økonomitrappe har fire trin. Tre er bygget. Det fjerde — *"medejerne gennemtvinger salg af klubben = game over med værdighed"* — findes ikke, men spillet **truer med det** op til tretten gange pr. karriere uden at gøre alvor af det.

| Trin | | Din beslutning |
|---|---|---|
| 1 | Surt brev fra medejerne | ingen — en advarsel |
| 2 | Bankens ultimatum | sælg din bedste, eller lån |
| 3 | Administration | hvem ryger, for at få lønsummen ned |
| **4** | **Redningskapital mod andele** | tag pengene og afgiv 5-10 %, eller lad klubben falde |
| **5** | **Under 50 %** | ingen. Du er ikke formand længere |

Fortynding frem for konkurs, fordi maskineriet allerede står der: du ejer 51 %, medejerne har personligheder, humør og kapital. Game over bliver noget du **går ind i med åbne øjne**, én beslutning ad gangen — og du kan altid se hvor mange trin der er tilbage, fordi din ejerandel står på klubskærmen. Du mister ikke klubben, fordi du taber kampe. Du mister den, fordi du solgte den lidt ad gangen for at redde den.

**Features der følger med:** administratoren flytter ind på kontoret og sælger spillere hen over hovedet på dig · brandudsalg med ur (skær £X af lønsummen inden tre kampdage — *du* vælger hvem) · æra-opsummeringen ved game over (*"Din æra: 14 sæsoner, 2 oprykninger, ét pokalmirakel"*).

**Måltal:** administration ~1 gang pr. karriere (målt i dag: 4,5), game over inden for rækkevidde i 5-15 % af karriererne.

## En rigtig bank

I dag: ét fast lån (£50.000 nu, £5.500/kampdag × 10), kun tilgængeligt i krisemodalen når kassen er under −£60.000. **Du kan altså kun låne, når du drukner, og aldrig for at investere.**

Nyt: du vælger beløb og løbetid, banken vælger renten ud fra klubværdi, division, kassestilling og administrationshistorik. Lånet lægges i `G.commitments` fra pakke 3 frem for sit eget `G.loan`-særtilfælde. Så bliver trin 2 i trappen naturligt: **banken siger nej, fordi du allerede skylder.**

En tribune koster £70.000 og en ærlig sæson tjener ~£155.000. Med en bank kan du bygge nu og betale med den gate, tribunen selv skaber — den klassiske formandsgamble, og rebet man hænger sig selv i.

## Kontraktrollen skal betyde noget efter underskrift

`ROLES = {key: ×0.90, rot: ×1.00, pro: ×1.18}`, og `p.role` gør intet mekanisk bagefter. Så "Key player" er både **billigst** og den eneste ambitiøse spillere accepterer; "Prospect" koster 18 % mere for ingenting; 4 år er billigst pr. uge. Det rationelle svar er altid *Key player, 4 år* — GDD'ens centrale forhandlingsmekanik reduceret til en fast indstilling.

Nyt: en `key` der ikke spiller nok mister selvtillid og beder om væk; en `pro` udvikler sig hurtigere men accepteres kun af unge; `rot` er neutral. Lønrabatten på en key-kontrakt betales med en forpligtelse.

## Tilgangen bliver et resultatmål, ikke en taktik

De tre nuværende hedder ting som *"Park it tight, frustrate them, nick something"*. **Det er en taktisk instruks, og formanden vælger aldrig taktik** — mekanikken bryder spillets egen hovedregel.

Nyt: du siger hvilket **resultat** du har brug for — *"vi skal have tre point"* / *"et point rækker her"* / *"din afgørelse"* — og gafferen vælger selv tilgangen og fortæller hvad han gør. Hans `TAC`/`MAN`/stil farver, hvordan han læser ordren: en forsigtig gaffer hedger stadig, når han får besked på at jagte sejren.

**Priser:** at jagte en sejr brænder friskhed og hæver skades- og kortrisiko · at nøjes med et point mod et bundhold koster stemning · kræver du en sejr og taber, husker bestyrelsen og fansene hvad du sagde.

**Vis accept-oddset, før du beder om noget** — og det gælder alt, du beder gafferen om, ikke kun resultatmålet. Tvinger du det igennem, koster det tillid og moral. Grebet er lånt fra Hometown FC og passer til Mads' kaptajn-regel: *du har en stemme, ikke magten* — nu kan du bare se, hvor stærk stemmen er, før du bruger den.

*Nuværende tal, til reference: `caut {own −0.22, opp −0.33}`, `allout {own +0.30, opp +0.28}`, `bal {0,0}`. Begge alternativer har en indbygget nettofordel, Balanced har ingen — derfor er Balanced dårligst i alle seks målte celler (caut 1,429 · allout 1,396 · bal 1,374 point pr. hjemmekamp).*

---

# Nat 5 — staben

**Alle valg besluttet af Mads 7/8 gennem tolv spørgsmål.** Det er en hel nat i sig selv, fordi Mads valgte at bygge **hele staben på én gang** frem for kun cheftræneren.

## Udgangspunktet

`G.coach` sættes én gang i onboardingen og ændres **aldrig**. Der findes ingen fyring, ingen opsigelse, intet trænermarked. De otte trænere fra pakke 6 er otte mulige startkort — du møder én og lever med ham i tyve sæsoner. Og der findes præcis **én** forespørgsel i hele spillet, hårdkodet til kampdag 8, uden frist og uden konsekvens.

GDD'en kalder ham *"din vigtigste relation"*.

Og vigtigere: **træneren er din eneste adgang til, hvordan holdet spiller.** Du vælger ikke taktik — det er præmissen. Så når han er uforanderlig, er dit spillestil-valg truffet én gang af en tilfældig trækning i onboardingen. **Reglen om "ingen taktik" giver kun mening, hvis trænervalget ER det taktiske valg.**

## De besluttede valg

| Spørgsmål | Valgt |
|---|---|
| Kan du fyre ham? | **Ja, og det koster** — resten af kontrakten udbetales, fansene reagerer efter hans popularitet, bestyrelsen noterer uroen |
| Kan han gå selv? | **Begge veje** — han siger op i vrede, og større klubber henter de gode |
| Ansættelse | **Et felt af 3-5 kandidater der selv vurderer dig** |
| Hvad vejer i deres vurdering | **Klubbens tilstand tungest** — division, stemning, kasse, tillid, retning. Løn er sekundær |
| Kontrakt | **Løn og løbetid, forhandles** som en spillerkontrakt: runder, skjult første krav, længde mod pris |
| Hans krav | **Flere typer, hver med en frist** — spiller i en position · budget til vinduet · løfte om ikke at sælge en bestemt mand · en facilitet · spilletid til et ungt talent |
| Konsekvens | **Tålmodighedsmåler 0-100, fodret af navngivne hændelser**, så han kan citere dem: *"Du lovede mig en målmand i januar."* |
| Stil på banen | **Ja, og det skal kunne aflæses** — i mål for/imod og i efterkampsanalysen fra pakke 11 |
| Hans syn på dig | **Egen måler, egne kriterier**, adskilt fra bestyrelsens tillid. Det er den, accept-oddsene aflæser |
| Vakance | **Midlertidig løsning med en pris** — assistent eller klublegende med dårligere tal, indtil du ansætter |
| Op- og nedrykning | **Begge veje** — nedrykning frister ham væk, oprykning tiltrækker bejlere |
| Omfang | **Hele staben på én gang** |

## Staben

Cheftræner (`TAC`/`MAN`/`DEV`) · fysio (skadeshåndtering) · ungdomschef (kuldkvalitet) · scout (rapportpræcision). Alle fire i samme 1-99-talsprog, alle fire med kontrakt, krav og en mening om dig. GDD: *"Ét talsprog i hele spillet gør sammenligning instinktiv."*

Faciliteterne får dermed mennesker knyttet til sig: klinikken er ikke længere en bygning, men en bygning **og** en fysio. Og GDD'ens *"legender kan blive stab"* får et sted at lande — den pensionerede anfører bliver ungdomstræner med et `DEV`-tal.

## Sammenhænge

Tålmodighedsmåleren er den, accept-oddsene i nat 4 aflæser — så **nat 4 bør bygge accept-oddsene mod en måler, der endnu ikke findes.** Enten defineres måleren i nat 4 og fyldes med indhold i nat 5, eller også flyttes accept-oddsene hertil. **Åbent spørgsmål til Mads.**

---

# Nat 6 — formandens ord

**Alle valg besluttet af Mads 7/8 gennem ti spørgsmål.**

GDD'en beder om det tre steder — Maureen Cobb *"HUSKER dine svar"*, fanmødet hvor *"tomme løfter straffes hårdt når de brydes"*, og pressespørgsmål efter store resultater (*ydmyg / kæphøj / kryptisk*). **Intet af det er bygget.** Maureen er flavourtekst to steder i koden.

Og det er værd at bemærke, hvad en formand faktisk laver. Han køber ikke spillere selv, han vælger ikke holdet, han står ikke på sidelinjen. **Han taler.** Det er den ene handling, en formand gør, som en manager ikke gør.

| Spørgsmål | Valgt |
|---|---|
| Hvornår | **Begge dele** — Maureen opsøger dig efter store kampe og kriser, og du kan selv tage initiativet |
| Hvor tit | **Rationeret — få og tunge.** Sjældenheden er det, der giver ordene vægt |
| Registret | **Bredt** — bak træneren op · lov at en spiller ikke sælges · meld en ambition ud · gå efter dommeren · forsvar en spiller · tag skylden selv |
| Hvem reagerer | **Alle fire** — fans, bestyrelse, trup og den navngivne. Én udtalelse kan trække dem i hver sin retning |
| Hukommelse | **Falmer, men kan genopvarmes** — samme princip som had-point i rival-systemet |
| Tavshed | **Koster lidt, men er ofte den billigste udvej.** Uden en pris ville tavshed være gratis optimalt spil |
| Citatet | **Maureen citerer dig ordret med dato**, den dag du bryder det |
| Straffen | **Socialt først, mekanisk ved gentagelse** — første brud er en klumme og et stemningsfald; tredje rammer tillid, selvtillid og andelspriser |
| Truppen | **Hører med, og det binder dig** — offentlig opbakning løfter selvtilliden, men byen tror nu på ham, så et salg bagefter koster dobbelt |
| Bluff | **Tilladt, og ofte fristende.** Spillet dømmer ikke — det husker |

## Formen

En udtalelses-hovedbog på `G` med hvad du sagde, hvornår og om hvem. Kun id'er og primitive værdier — `G` skal forblive et træ. Maureen som fast afsender og modtager. Brud udløser hendes klumme med dit eget citat.

Systemet samler tre målere, der i dag lever hver for sig — `fanMood`, `G.trust` og trænerens syn på dig — i ét socialt system med hukommelse. Maskineriet er delvist der: løftesystemet (`promiseMD`, `appsAtPromise`, straf ved brud) findes allerede, men er låst til spilletid i en privat kontorsamtale.

**Profil:** tekst- og datatung frem for systemtung — samme slags pakke som nat 2's tekstbibliotek, der tog under ti minutter.

---

# Nat 7 — pyramiden

I dag er verden 13 navngivne modstandere, og `G.div` er et heltal fra 0 til 3. De andre divisioner findes ikke som *steder*.

**Nedrykningen i nat 3 har ikke brug for den** — mekanikken virker med `G.div` som tal. Pyramiden gør faldet **synligt**, ikke muligt. Men den skal ligge **før pokal og multi-klub**.

Formen er en **overfladisk** simulering, ikke en fuld motor:

- Tabeller der bevæger sig sæson for sæson, med navngivne klubber
- Op- og nedrykning mellem alle fire niveauer, så klubber faktisk **ankommer** i din liga næste sæson — den klub der sendte dig ned, kan du møde igen på vej op
- De spillere du solgte, dukker op i dem. **`G.soldTo` registrerer allerede navn, klub, position, OVR og om han gik bittert.** Dataene ligger der; ingen læser dem. GDD lover: *"Quigley scorede i går for storklubben, du solgte ham til"*
- Klubber i andre divisioner bliver pokalmodstandere og mulige opkøb

`G` skal forblive et træ: de andre divisioner er tabeller af primitive værdier, ingen delte objektreferencer til `G.teams`.

---

# Efter pyramiden

## Pokal og rival

87 % af alle store kampe kommer i dag fra to tabelafhængige kilder, så jo mere man stabiliserer sig, jo færre får man. **En pokalkamp er uafhængig af tabellen** — netop det, de fire nuværende kilder ikke er. Pakke 17 har allerede lagt røret; pokalen skal kun sætte `big:true` og en etiket.

**Mads' regel (7/8):** møder du din rival fra en anden division i pokalen, er det en *ekstraordinær* situation og må være sæsonens **sjette** store kamp, uden for båndet på 3-5.

Bemærk samtidig at topopgøret (nr. 1 mod nr. 2) fyrer 0,064 gange pr. sæson — én gang hver 16. sæson — og bør enten løsnes eller skrottes, så pokalen ikke bliver den femte kilde ved siden af tre der virker og én der ikke gør.

## Multi-klub

Flere klubber pr. ejer, aldrig to i samme liga. `G` skal have en klub-dimension i roden — en mekanisk refaktorering der rører alt, med harness'en som sikkerhedsnet: 4.000 sæsoner uden et eneste nedbrud er præcis det aktiv, der gør en stor omskrivning forsvarlig.

**Åbne spørgsmål, der skal besvares før den bygges:**

1. **Er kassen fælles?** Det er hele forskellen. Ét holdingselskab med fælles kapital gør klub nummer to til en investering, du kan finansiere med klub nummer et. Adskilte kasser gør dem til to parallelle spil med én ejer. Virkelighedens model — City Football Group — er fælles kapital, adskilt klubøkonomi og myndigheder der holder øje.
2. **Ejer medejerne klubben eller holdingselskabet?** Det afgør, om tillid er én relation eller én pr. klub.
3. **Hvad sker der ved kollisionen?** Rykker din ene klub ned i den andens division — eller den anden op — **skal du sælge en af dem.** Det er et ægte formandsdilemma, det opstår organisk af to systemer der ikke er designet til hinanden, og det skal beholdes.

Og bemærk: **multi-klub er svaret på endgame-hullet.** Fra sæson 8 er der intet at bruge penge på. At købe klub nummer to er et afløb, der aldrig løber tørt.

## Byen lever

Byinvesteringer der **hæver loftet** i stedet for din andel af et fast loft: `townDemand()` kan i dag kun flyttes af division og Family Stand, og 73 % af de sene sæsoner har alt bygget. Samler også de navngivne lokale (GDD har byrådet, den rige bejler, skandalen og naboens konkurs), Maureen, og liganyhederne — målt til **0,09 pr. kampdag mod GDD's lovede 2-3**, faktor 28, med rørene allerede på plads.

## Mennesker

Skjult potentiale findes **slet ikke** i koden — GDD kalder det *"hele gambling-spændingen i talentkøb"*, og det er forudsætningen for både Youth Day og scout-missioner. Scoutens "gem" er i dag en billig spiller med tilfældig alder 18-33. Dertil: `party` og `whinger` som tomme mærkater, og de otte tavse sponsorer.

## Småting

Karantæner pr. turnering, når pokalen kommer.

---

# Dagarbejde med Mads — ikke til en natlig agent

**Det grafiske løft.** En agent kan ikke se en telefon. Gennemgangen af Hometown FC (7/8) viste, at deres UI ikke er bedre end vores — lyst tema, hvide kort, emoji som ikoner — men at **fotografiet gør alt arbejdet**: hver skærm ligger oven på en fotorealistisk rendering med halvgennemsigtige kort ovenpå. Til gengæld er deres by de samme fem faste billeder for alle spillere, mens `stadiumSvg()` tegnes ud fra spillerens egen tilstand.

Konklusionen er derfor **ikke** at jagte fotorealisme — Floodlight-temaet med Barlow Condensed er mere karakterfuldt end deres. Men tre ting ville løfte meget for lidt:

1. Et dæmpet fotografisk baggrundslag bag hovedskærmene, med kortene ovenpå
2. Lys og materialer i `stadiumSvg()`: tidspunkt på dagen, vejr, lysmasternes kegler, tekstur på tribunetaget. Realisme i **belysningen**, ikke i geometrien
3. Byen mangler et billede overhovedet — den er i dag kun tallet `townDemand()`
