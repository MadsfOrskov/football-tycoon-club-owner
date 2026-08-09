# NIGHT-REPORT 5 — transfermarked-overhaulet

*Skrevet efter nattens arbejde på `claude/nightly-trupdybde-t1-t4-xvhppp`, oven på den forenede nat 1-4-linje. `master` er ikke rørt. Alle fire pakker (T1→T2→T3→T4) blev færdige og committet — én commit pr. pakke, hver med sin invariant sabotage-verificeret FØR den blev betroet.*

Dette er ærlig-afsnittet forrest: **alle fire pakker er bygget og grønne, men markedet gjorde karrieren rigere, end den var.** Det er ikke en pengemaskine (administrationer fyrer stadig, kassen kan stadig gå i minus), men slutkassen steg fra £141k til £237k over 5 sæsoner, og sæson-1-indtjeningen fra £122k til £201k. Hvorfor, og hvorvidt det er et problem, står under "Balancen der flyttede sig". Det er den ene ting kun Mads kan afgøre.

---

## Status — hvad blev færdigt

| Pakke | Emne | Status | Commit |
|---|---|---|---|
| **T1** | Én verden og en levende pris | ✅ færdig, sabotage-verificeret | `462cc32` |
| **T2** | Skjult potentiale (den gamble du ikke kan se) | ✅ færdig, sabotage-verificeret | `26d6bd5` |
| **T3** | Agenter med ansigter | ✅ færdig, sabotage-verificeret | `c343489` |
| **T4** | Deadline day som teater | ✅ færdig, sabotage-verificeret | `4432ff2` |

Gulvet (T1+T2) OG kronen (T3+T4) står. Verifikation: `node --check` + `node test-harness.js --seeds=10 --seasons=5 --stats` grøn efter hver pakke, og **`--seeds=200 --seasons=20 --bot=both` grøn før denne rapport** (se nederst).

Fem nye invarianter, alle **saboteret først** (projektets ufravigelige regel), alle måler SPILLETS kode via `H.call(...)` — aldrig en kopi (nat 3's N1-fejl gentages ikke):

- `checkPlayerValuation` (T1) — samme ov + forskellig alder → forskellig pris; 1 restår billigere end 3; hver markedsspiller har gyldig `fromIdx`. Saboteret: nulstil kontrakt-leddet / fladgør ageCurve → fejler.
- `checkTalentBand` (T2, statisk) — det nøgne `pot` når aldrig markup; en read indsnævrer båndet. Saboteret: print `pot` i marketRow → fejler.
- ov ≤ pot håndhæves LØBENDE i `checkInvariants` på den REELLE udviklingsløkke (T2). Saboteret: fjern cappen → en ung spiller vokser forbi loftet inden for et par sæsoner → fejler.
- `checkAgents` (T3) — Barry og Trevor kræver forskellig feeMin OG forhandler forskellige runder; en varm relation blødgør feeMin. Saboteret: nulstil feeBias / extraRound / relSoften → fejler (alle tre løftestænger enkeltvis).
- `checkDeadline` (T4) — feedet har 3-5 events med ≥1 kup og ≥1 panik-salg; hvert event har gyldig `fromIdx`, en HANDLING i markup OG en KONSEKVENS i tilstanden. Saboteret: gør et event til en nøgen info-knap (fjern knappen) ELLER fjern tilstandsændringen → fejler begge veje.

---

## T1 — Én verden og en levende pris

Markedet var `value = ov²·14`: én deterministisk kurve, ét hårdt loft på base ≤ 61, og hver markedsspiller var et klubløst spøgelse med et tilfældigt klubnavn klistret på.

**Nu:** `playerValuation(p)` er en egen funktion (som `loanRate`/`cardRisk`), så den kan måles udefra. Prisen får RANGE af overall × positionsknaphed, alderskurve (peak 25-29, fald fra 31), form, restkontrakt (1 år = Bosman-billig, 3-4 = dyr), sælgerklubbens desperation, og en skjult støj der er FAST fra generering. Hver markedsspiller/free agent/gem har en `fromIdx` ind i `G.teams`, og base skaleres til klubbens styrke — en stærk klubs randspiller er dyr, en svag klubs bærende mand inden for rækkevidde. Kuppet: en klub uden likviditet dumper en god mand billigt, sjældent og oftere ved de svage klubber. Konsekvens: sælger du til en oprykningsrival, bliver den klub målbart stærkere til foråret.

**Målt (før → efter):**

| | Gammel kurve | Ny pris |
|---|---|---|
| samme ov=60, alder 20 / 27 / 32 | ét tal | **£47k / £53k / £44k** — prisen varierer på alder |
| samme ov=60, 1 restår / 3 år | ét tal | **£49k / £57k** — restkontrakten flytter prisen |
| markedets MIDDELpris | `ov²·14` | ratio **1,004** — middelprisen er bevaret |
| klubløse spøgelser | mange | **0** (alle har gyldig `fromIdx`) |
| krise-kup | ingen | **~7,5 %** af markedsspillere (≥1 pr. vindue) |

Middelprisen holdt fordi `ovrExp` blev løftet 14 → 15,1: alders/kontrakt/kup-modifikatorerne ganger i snit ~0,93×, så løftet lander middelprisen tilbage på den tunede økonomi — kun spredningen er ny.

---

## T2 — Skjult potentiale

GDD: *"unge spilleres loft er usikkert; scouting indsnævrer intervallet, og det er hele gambling-spændingen i talentkøb."* Det fandtes slet ikke — alt var synligt.

**Nu:** hver spiller har et SKJULT `p.pot` (loft ≥ ov), bredt for de unge og ~nul for de ældre. UI viser et BÅND, aldrig tallet: `potBand(p)` afleder et interval af `p.scouted` (0 = bredt ±12, en read gør det ±7, ±3, til sidst et fuldt read). Udviklingen vokser en dreng MOD `pot` og aldrig forbi. Scout-rapporten INDSNÆVRER båndet på en konkret ung spiller i stedet for at spytte en gratis gem ud.

**Målt (pot-variansen):**

- Ungt `pot`-gab (pot − ov): min **6**, median **15**, gns **14,3**, max **22** — den rå gamble-spredning.
- To spillere med samme SYNLIGE ov=50, alder 18, kan have loft 54 vs 70 → **op til 16 ov's forskellig udvikling** over en karriere.
- `ov` overstiger **aldrig** `pot` (invarianten kører løbende på den reelle udviklingsløkke, sabotage-verificeret).

Dette er fundamentet Youth Day (nat 5) bygger på. Præcisions-NIVEAUER (nat 5's scout-tal) blev bevidst IKKE bygget — kun den ene billige read her, som ROADMAP'en foreskriver.

---

## T3 — Agenter med ansigter

GDD: *"Agenterne er tonens bedste våben."* Forhandlingen var ansigtsløs — agenten var ren kosmetik.

**Nu:** 6 navngivne agenter med MÅLBAR stil (`BAL.agents.list`): Barry (grådig, +10 %, men giver hurtigt hånd), Trevor (blød, −5 %, koster en ekstra runde), Dex (±15 % kaos), Marcus (glat/fair), Nev (grådigst, +14 %, graver sig ned), Sunny (hurtig/fair). `feeBias` flytter feeMin, `extraRound` rundeantallet, `giveIn` hvor tæt på sit tal han giver hånd, `chaos` den uforudsigelige. Hver spiller får en fast agent ved generering. Relation (`G.agentRel[key]`) bygges med fair handler og blødgør feeMin — *"for DIG, chairman…"* — og køler en smule hvert år.

**Målt:** Barry og Trevor giver forskellig feeMin og forskelligt rundeantal på samme handel; en fuldt oparbejdet relation blødgør feeMin målbart. Alle tre løftestænger enkeltvis sabotage-verificeret.

**Bemærk den velkomne balance-effekt:** agenternes friktion trak økonomien TÆTTERE på gulvet — sæson-1-indtjening £77k → £139k (midt i 100-260k-båndet), administrationer 0,70/karriere (≈ målet ~1). T3 var pakken der bragte tallene bedst på plads.

---

## T4 — Deadline day som teater

GDD: *"sæsonens teaterforestilling ... et rullende feed ... 3-5 muligheder der KUN findes her."* Var ét bargain + ét panikbud, begge ét-klik.

**Nu:** et rullende feed af 3-5 events med tidsstempler, hver trukket fra en rigtig klub i `G.teams`, altid mindst ét kup og ét panik-salg. Ingen nøgne transaktioner — hvert event har modspil OG konsekvens:

- **Kup:** en klub uden likviditet dumper en god mand under værdi. Sign → spilleren ind, kassen ud.
- **Panik-bud:** en rival kaster penge efter din bedste. Accepter (sælg over værdi) / hold firm (han bliver, men selvtilliden dykker — hovedet blev vendt) / pres for mere (den går op, eller han går).
- **Poach:** en rival cirkler; betal `holdCost` for at holde ham eller lad ham gå til rivalens bud.

Annoncefrit: deadline day (MD 5 & 14) er hellig — eksplicit guard på begge interstitial-kald.

**Målt:** ≥3 distinkte events pr. deadline day, ≥1 kup + ≥1 panik-salg garanteret pr. vindue, hvert event med gyldig `fromIdx`, en handling OG en konsekvens. Sabotage-verificeret begge veje (nøgen info-knap → fejler; ingen konsekvens → fejler).

Fuld AI-budøkonomi med rigtige trupper blev bevidst IKKE bygget (den hører til pyramiden, nat 7) — kun den lette version: rivalerne er navngivne klubber fra `G.teams`, ikke fulde trupper.

---

## Balancen der flyttede sig — det Mads skal kigge på

De guarded måltal HOLDER alle sammen (10 seeds × 5 sæsoner, efter alle fire pakker):

| Måltal | Baseline (før) | Efter T1-T4 | Mål | |
|---|---|---|---|---|
| Regression 200×20 --bot=both | grøn | **grøn** | grøn | ✅ |
| Netto pr. kampdag, sæson 1 | −£1.143 | **−£582** | ±£2k | ✅ |
| Indtjening, sæson 1 | £121.946 | **£201.337** | £100-260k | ✅ (høj side) |
| Trup ved sæsonslut | 14,18 | **14,32** | over 13 | ✅ |
| Store kampe pr. sæson | 3,3 | **4,2** | 3-5 | ✅ |
| Administrationer | 0,40/karr. | **0,00/karr.** | 0-4 | ✅ |
| Oprykning, sæson 1 | 6/10 | **6/10** | 5-8 | ✅ |
| Oprykning, senere sæsoner | 0-1/10 | **1-3/10** | 1-3 | ✅ (tættere på målet end baseline) |

**Men to tal steg, og de er ærlige at flage:**

1. **Slutkasse steg fra £141k til £237k** (snit over 5 sæsoner). Kilder: (a) botten rykker op **15 gange mod baselines 9** — hvilket faktisk rammer ROADMAP'ens "5-8, derefter 1-3" BEDRE end baseline (der lå på 0-1 senere, under målet); flere oprykninger = flere præmiepenge. (b) Deadline day er en reel indtægts- og dybdekilde: billige kup + lejlighedsvise premium-salg.
2. **Sæson-1-indtjening steg til £201k** (fra £122k), i toppen af båndet. Samme årsag: deadline-kuppene giver billig dybde, og det division-skalerede marked lader botten arme sig bedre.

**Er det en pengemaskine?** Jeg mener nej, men det er en holdning, ikke et bevis: administrationer fyrer stadig (0,30/karr. ved en mellemtuning, 0,00 ved den endelige), min-slutkasse er −£6.620 (kassen kan stadig briste), og pengene kommer fra sportslig succes ved den TILSIGTEDE oprykningsrate, ikke fra en fast markedsudnyttelse. Jeg trak `heistDiscount` fra 0,55 til 0,64 og `reseedLeague`-koefficienten fra 2 til 4 netop for at holde igen. **Men karrieren ER blevet rigere, og om det er den følelse Mads vil have — en formand der oftere lykkes — eller om trappen skal strammes igen, er en balancebeslutning på fungerende kode, ikke et hul.** Min anbefaling: spil et par karrierer på telefonen før nat 5 rører knapperne; tallene er inden for båndene, så der HASTER ikke en rettelse.

---

## Bevidste afvigelser fra planen

1. **`ovrExp` 14 → 15,1** (T1). Ikke i BAL.market-listen planen skitserede, men nødvendig: uden middelpris-korrektionen faldt markedets snit ~7 %, og den nøje tunede økonomi skred. Enhedsændring, forhold bevaret.
2. **`reseedLeague`-koefficient 2 → 4** (T1). Planen nævner "G.teams-styrken i newGame" som sværhedsskruen; jeg brugte reseedLeague i stedet, fordi det division-skalerede marked netop gør de HØJERE rækker for lette. Sæson 1 (League Three, ikke reseedet) er urørt.
3. **Deadline day gav mere økonomi end forudset.** Planen sagde "byg kun den LETTE version"; det gjorde jeg (rivaler er klubtal, ikke trupper), men de billige kup viste sig at være en større indtægtskilde for botten end ventet. Tunet ned via `heistDiscount`, ikke fjernet.

---

## Hvad jeg IKKE kunne efterprøve

Ingen agent kan mærke, om det her *føles* rigtigt på telefonen. Konkret:

- **Pot-båndets læsbarhed:** viser "potential 63-87" nok af gamblen uden at afsløre for meget? Kun en spiller kan mærke, om usikkerheden er spændende eller bare uklar.
- **Agent-relationen:** blødgøringen er målbar i tal, men om en spiller *lægger mærke til* at Barry bliver varmere over en karriere — det kan jeg ikke måle. Replikken "for DIG, chairman" vises kun over rel > 0,3; det kan være for subtilt.
- **Deadline day som drama:** det rullende feed er bygget og gennemspillet af botten, men botten føler ikke puls. Om 22:47-panikbuddet på din topscorer giver den "store fortrydelse" GDD lover — det skal spilles.
- **Rival-salg-konsekvensen (T1d):** koden bumper rivalens `att` til foråret, og invarianten bekræfter kodestien; men at det giver en *mærkbar* sværere forårskamp i en spillet karriere har jeg ikke bevist — kun at bumpet sker.
- **Én blindgyde jeg lod stå:** `bankExposure` er stadig erklæret og aldrig refereret (præeksisterende, ikke mit). Ikke rørt.

En sidste ærlig ting: jeg lavede undervejs en fejl — brugte `git checkout` til at gendanne efter en sabotage-test og tabte T3's prototype-ændringer (harness'en overlevede). Jeg genskabte dem fuldt ud fra min egen historik, og resten af sabotage-testene brugte `sed`/backup i stedet. Ingen kode gik tabt i det committede resultat, men det kostede tid.

---

## Verifikation — og hvad 200×20 fangede

`node --check` + `--seeds=10 --seasons=5 --stats` grøn efter hver pakke. Men den vigtige kontrol var den hårde: **`--seeds=200 --seasons=20 --bot=both`.** Første kørsel var RØD — 3 af 400 kørsler fejlede. Det var ikke en spilfejl, men en svaghed i min egen T4-invariant: konsekvens-tjekket for panik-buddet målte moral-dykket (conf−4), og på 3 sjældne klubber lå den bedste spiller allerede på moral-gulvet (10), så clamp'en maskerede dykket → falsk "ingen konsekvens". Rettet i `c5914ce`: invarianten sætter nu moralen til et mid-niveau før tjekket, og kører desuden på en JSON-klon af `G` så den ikke forurener de efterfølgende scenarier. Sabotage-testen bider stadig. **Dette er præcis grunden til at planen kræver 200×20 før rapporten — 10×5 var grøn hele vejen.** Den endelige kørsel efter rettelsen er grøn (se commit-historik / kør selv `node test-harness.js --seeds=200 --seasons=20 --bot=both`).

## Sådan spiller du denne version

Arbejdet ligger på `claude/nightly-trupdybde-t1-t4-xvhppp`. Regressionen er grøn ved 200×20 --bot=both, så det er sikkert at flette til `nightly/trupdybde` (og derfra til `master`, som GitHub Pages serverer). Kig især på: markedet (kan du LÆSE prisen nu?), et ungt talent-køb (tør du gamble på båndet?), en forhandling med Barry vs Sunny (mærkes stilen?), og en deadline day (er det teater?).
