#!/usr/bin/env node
/* =====================================================================
   test-harness.js — regressionstest for FOOTBALL TYCOON: CLUB OWNER
   ---------------------------------------------------------------------
   Udtrækker <script>-blokken fra HTML-prototypen, kører den i en Node-
   sandbox med DOM-stubbe, og lader en bot spille N hele sæsoner:
   onboarding → kampe → transfers → byggeri → sæsonskift.

   Grøn = "REGRESSION_OK".

   Brug:
     node test-harness.js                     (5 seeds × 3 sæsoner)
     node test-harness.js --seeds=1 --seasons=3 --stats
     node test-harness.js --file=anden.html

   VIGTIGT: Botten håndterer modaler via en switch (handleModal).
   Nye modaltyper SKAL tilføjes dér — ellers fejler harness'en med
   "UNKNOWN MODAL TYPE", i stedet for bare at klikke dem væk.
===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* ---------------- args ---------------- */
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const hit = argv.find(a => a.startsWith("--" + k + "="));
  return hit ? hit.split("=").slice(1).join("=") : d;
};
const flag = k => argv.includes("--" + k);

const HTML_FILE = path.resolve(arg("file", "football-tycoon-club-owner-prototype.html"));
const SEEDS = parseInt(arg("seeds", "5"), 10);
const SEASONS = parseInt(arg("seasons", "3"), 10);
const SHOW_STATS = flag("stats");
const EXTRACT_TO = path.join(path.dirname(HTML_FILE), "proto-extract.js");
/* --echo=budget,player,screen:club  → skriv den renderede markup ud første gang
   den optræder, så man kan inspicere den uden en browser. */
const ECHO = new Set(arg("echo", "").split(",").filter(Boolean));
const ECHO_DIR = arg("echodir", require("os").tmpdir());

/* ---------------- extract + syntax check ---------------- */
if (!fs.existsSync(HTML_FILE)) {
  console.error("FEJL: kan ikke finde " + HTML_FILE);
  process.exit(2);
}
const html = fs.readFileSync(HTML_FILE, "utf8");
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) {
  console.error("FEJL: ingen <script>-blok fundet i " + path.basename(HTML_FILE));
  process.exit(2);
}
const SRC = m[1];
fs.writeFileSync(EXTRACT_TO, SRC, "utf8");

try {
  new vm.Script(SRC, { filename: "proto-extract.js" });
} catch (e) {
  console.error("SYNTAKSFEJL i <script>-blokken:");
  console.error("  " + e.message);
  console.error("  (udtrukket til " + path.basename(EXTRACT_TO) + " — kør: node --check " + path.basename(EXTRACT_TO) + ")");
  process.exit(1);
}

/* Modaltyper botten kender. Sammenholdes med kildekoden NEDENFOR, så en ny
   modal fejler med det samme — ikke først når botten tilfældigvis rammer den. */
const HANDLED_MODALS = new Set(["prematch", "ticker", "quickOffer", "interstitial", "info",
  "rewarded", "seasonDone", "budget", "midway", "bank", "deadline", "nego", "formalBid",
  "sellChoice", "sell", "ownerNego", "facConfirm", "chat", "player", "sponsorOffer"]);
{
  const found = new Set([...SRC.matchAll(/modal\s*=\s*\{\s*type\s*:\s*"([A-Za-z]+)"/g)].map(m => m[1]));
  const missing = [...found].filter(t => !HANDLED_MODALS.has(t));
  const stale = [...HANDLED_MODALS].filter(t => !found.has(t));
  if (missing.length) {
    console.error("FEJL: modaltyper i koden som botten ikke håndterer: " + missing.join(", "));
    console.error("  → tilføj dem i handleModal-switchen OG i HANDLED_MODALS øverst i test-harness.js");
    process.exit(1);
  }
  if (stale.length) console.log("  bemærk: harness kender modaltyper der ikke længere findes: " + stale.join(", "));
}

/* Bro til script-scopede let/const (G, modal, nego, screen, obStep …)
   samt en generisk call() der slår funktioner op på sandbox-globalen. */
const BRIDGE = `
;globalThis.__H = {
  get G(){return G;}, set G(v){G=v;},
  get modal(){return modal;}, set modal(v){modal=v;},
  get nego(){return nego;}, set nego(v){nego=v;},
  get screen(){return screen;}, set screen(v){screen=v;},
  get obStep(){return obStep;}, set obStep(v){obStep=v;},
  get obData(){return obData;},
  consts:{STANDS,STANDCOST,FACS,FAC_DETAIL,ROLES,APPROACHES,SWATCHES,TRAITS,COACHES,SPONSORS,BAL,
    // pakke 6: tekstbiblioteket skal kunne inspiceres udefra
    LINE_TAGS,POOLS:{GOALDESC,NEARMISS,FLAVOR,PENDESC,OPPGOAL,MOMENTUM,GHOSTBITTER,GHOSTWARM},lineText,lineOk},
  call(name){
    const f = globalThis[name];
    if(typeof f !== "function") throw new Error("harness: ingen global funktion '"+name+"'");
    return f.apply(null, Array.prototype.slice.call(arguments,1));
  }
};`;

/* ---------------- seeded RNG ---------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- DOM-stub ---------------- */
function makeSandbox() {
  const els = new Map();
  const lastHtml = { v: "" };

  function el(id) {
    if (els.has(id)) return els.get(id);
    const e = {
      id, _html: "", value: "", textContent: "",
      style: {
        setProperty(k, v) { this[k] = v; },
        getPropertyValue(k) { return this[k]; },
        removeProperty(k) { delete this[k]; }
      },
      classList: {
        _s: new Set(),
        add(c) { this._s.add(c); },
        remove(c) { this._s.delete(c); },
        contains(c) { return this._s.has(c); },
        toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }
      },
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = String(v); if (this.id === "app") lastHtml.v = this._html; },
      insertAdjacentHTML(pos, h) { this._html += String(h); },
      appendChild() { }, removeChild() { }, remove() { },
      addEventListener() { }, removeEventListener() { },
      setAttribute() { }, getAttribute() { return null; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      focus() { }, blur() { }, click() { }
    };
    els.set(id, e);
    return e;
  }

  const timers = { list: [], next: 1 };

  const document = {
    documentElement: el("__html"),
    body: el("__body"),
    getElementById: id => el(id),
    createElement: t => el("__el" + els.size),
    addEventListener() { }, removeEventListener() { },
    querySelector() { return null; }, querySelectorAll() { return []; }
  };
  // giv klubnavne-inputtet en værdi, som onboarding læser
  document.getElementById("obname").value = "Ashford Rovers";

  const sandbox = {
    document,
    console: { log() { }, warn() { }, error() { }, info() { } },
    setInterval(fn) { const id = timers.next++; timers.list.push({ id, fn }); return id; },
    clearInterval(id) { timers.list = timers.list.filter(t => t.id !== id); },
    setTimeout(fn) { return 0; },
    clearTimeout() { },
    requestAnimationFrame() { return 0; },
    // ægte (in-memory) localStorage, så gem/indlæs rent faktisk kan afprøves
    localStorage: (() => {
      const m = new Map();
      return {
        getItem: k => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => { m.set(k, String(v)); },
        removeItem: k => { m.delete(k); },
        clear: () => m.clear(),
        get length() { return m.size; }
      };
    })()
  };
  return { sandbox, timers, lastHtml, els };
}

/* ---------------- én kørsel ---------------- */
function runSeed(seed) {
  const { sandbox, timers, lastHtml } = makeSandbox();
  const ctx = vm.createContext(sandbox);
  sandbox.__rnd = mulberry32(seed);
  vm.runInContext("Math.random = __rnd;", ctx, { filename: "seed.js" });
  vm.runInContext(SRC + BRIDGE, ctx, { filename: "proto-extract.js" });

  const H = ctx.__H;
  const rnd = sandbox.__rnd;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const chance = p => rnd() < p;

  /* --- instrumentering: fang netto pr. kampdag (til økonomibalancering) --- */
  const stats = { md: [], seasonEnd: [], bank: 0, admin: 0, startBalance: 0, build: 0 };
  /* "Opsparing" målt som balanceændring undervurderer indtjeningen, fordi
     botten bruger pengene på anlæg undervejs. Byggeforbruget spores separat,
     så spørgsmålet "hvor længe tager en tribune at spare op?" kan besvares. */
  for (const fn of ["startStandBuild", "facConfirm"]) {
    const orig = ctx[fn];
    ctx[fn] = function () {
      const b = H.G.balance, r = orig.apply(null, arguments);
      const spent = b - H.G.balance; if (spent > 0) stats.build += spent;
      return r;
    };
  }
  for (const fn of ["budgetConfirm", "midwayConfirm"]) {
    const orig = ctx[fn];
    ctx[fn] = function () {
      stats.build += (H.modal && H.modal.fundAdd) || 0;   // indskud i stadionfonden
      return orig.apply(null, arguments);
    };
  }
  /* Pakke 3: hvor tit bruges strukturerne? Taelles hvor handlen UNDERSKRIVES,
     ikke med en wrapper om recordDeal -- en wrapper paa ctx ser kun kald der
     gaar gennem globalThis, og negoFinish kalder recordDeal leksikalsk. Det er
     samme faelde som den der gjorde administrationstallet forkert. */
  stats.deals = { cash: 0, inst: 0, promo: 0, goals: 0 };
  /* Pakke 6: opsaml de tags spillet faktisk producerer over en hel karriere.
     Et tag der aldrig opstaar goer hver linje med det tag til doed tekst --
     samme fejlklasse som pakke 5 rettede, bare i teksten. */
  stats.tagsSeen = new Set();
  for (const fn of ["matchCtx", "flavourCtx", "eventCtx"]) {
    const orig = ctx[fn];
    ctx[fn] = function () {
      const out = orig.apply(null, arguments);
      if (Array.isArray(out)) for (const t of out) stats.tagsSeen.add(t);
      return out;
    };
  }
  for (const [fn, key] of [["openBankUltimatum", "bank"], ["administration", "admin"]]) {
    const orig = ctx[fn];
    ctx[fn] = function () { stats[key]++; return orig.apply(null, arguments); };
  }
  const origSettle = ctx.settleFinances;
  ctx.settleFinances = function (res) {
    const before = H.G.balance;
    const out = origSettle(res);
    stats.md.push({
      season: H.G.season, md: H.G.md, home: !!res.home,
      net: H.G.balance - before, gate: res.gate || 0, wages: res.wages || 0,
      att: res.att || 0, cap: H.G.capacity,
      // pakke 1: dybde og friskhed maales pr. kampdag, ikke kun ved saesonslut
      squad: H.G.squad.length, fresh: H.call("freshCount"),
      avail: H.call("available").length,
      protest: H.G.protest || 0, mood: Math.round(H.G.fanMood),   // pakke 2
      big: !!res.big, bigWhy: res.big ? String(res.label || "?") : null   // pakke 5
    });
    return out;
  };

  /* --- fejl/kontrol --- */
  let where = "boot";
  const fail = msg => { throw new Error("[seed " + seed + " · " + where + "] " + msg); };

  let steps = 0;
  const STEP_BUDGET = 400000;
  const tick = () => { if (++steps > STEP_BUDGET) fail("step-budget opbrugt (uendelig løkke?)"); };

  const BAD_HTML = ["NaN", "undefined", "[object Object]"];
  function checkHtml() {
    const h = lastHtml.v;
    for (const bad of BAD_HTML) {
      if (h.includes(bad)) {
        const i = h.indexOf(bad);
        fail("renderet HTML indeholder '" + bad + "': …" +
          h.slice(Math.max(0, i - 90), i + 60).replace(/\s+/g, " ") + "…");
      }
    }
    /* Pakke 6: en pladsholder der aldrig blev udskiftet. .replace("{P}",x) tager
       kun den FOERSTE forekomst, saa en linje med to pladsholdere efterlod den
       anden staaende i den faerdige HTML. Moenstret er snaevert ({ + STORE
       bogstaver + }) saa CSS og inline-JS ikke giver falske udslag. */
    const ph = h.match(/\{[A-Z][A-Z0-9_]*\}/);
    if (ph) {
      const i = h.indexOf(ph[0]);
      fail("uudskiftet pladsholder '" + ph[0] + "' i renderet HTML: …" +
        h.slice(Math.max(0, i - 90), i + 60).replace(/\s+/g, " ") + "…");
    }
  }

  /* Simpel tag-stak: fanger uafsluttede eller forkert lukkede elementer i den
     genererede SVG (stadion-tegningen er nu den stoerste markup i filen). */
  const VOIDISH = new Set(["polygon", "circle", "rect", "line", "ellipse", "path", "stop", "use", "image", "polyline"]);
  function checkSvg(html) {
    const svgs = html.match(/<svg[\s\S]*?<\/svg>/g) || [];
    if (!svgs.length) fail("ingen <svg> fundet i renderet markup");
    for (const svg of svgs) {
      const stack = [];
      const re = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
      let mm;
      while ((mm = re.exec(svg))) {
        const [, close, name, attrs, self] = mm;
        if (close) {
          const open = stack.pop();
          if (open !== name) fail("SVG: </" + name + "> lukker '" + open + "'");
        } else if (!self && !VOIDISH.has(name)) {
          stack.push(name);
        } else if (!self && VOIDISH.has(name)) {
          fail("SVG: <" + name + "> er ikke selvlukkende");
        }
        if (/=\s*"[^"]*(undefined|NaN)/.test(attrs)) fail("SVG: attribut med undefined/NaN i <" + name + ">");
      }
      if (stack.length) fail("SVG: uafsluttet <" + stack.join("><") + ">");
    }
  }

  /* Kør stadion-tegningen gennem alle byggetilstande — det er den mest
     forgrenede markup i spillet (4 tribuner × 3 niveauer × faciliteter). */
  function checkGroundStates() {
    const G = H.G;
    const keys = Object.keys(H.consts.STANDS);
    const facs = Object.keys(H.consts.FACS);
    const snap = { stands: { ...G.stands }, fac: { ...G.fac }, build: G.standBuild, mode: G.mode };
    const states = [];
    for (const lvl of [0, 1, 2]) states.push({ lbl: "alle tribuner lvl " + lvl, stands: keys.reduce((o, k) => (o[k] = lvl, o), {}) });
    states.push({ lbl: "blandet", stands: { shed: 2, main: 0, family: 1, away: 0 } });
    for (const k of keys) states.push({ lbl: "bygger " + k, stands: keys.reduce((o, x) => (o[x] = x === k ? 0 : 1, o), {}), build: { key: k, remain: 3, lvl: 1 } });
    for (const f of facs) states.push({ lbl: "facilitet " + f, stands: { shed: 1, main: 1, family: 1, away: 1 }, fac: { [f]: 1 } });
    states.push({ lbl: "alt bygget", stands: keys.reduce((o, k) => (o[k] = 2, o), {}), fac: facs.reduce((o, f) => (o[f] = 1, o), {}) });

    for (const st of states) {
      for (const mode of ["dark", "light"]) {
        G.stands = { ...st.stands };
        G.fac = facs.reduce((o, f) => (o[f] = (st.fac && st.fac[f]) ? 1 : 0, o), {});
        G.standBuild = st.build || null;
        G.mode = mode;
        H.call("recalcCapacity");
        H.screen = "club";
        where = "ground:" + st.lbl + "/" + mode;
        H.call("render");
        checkHtml();
        checkSvg(lastHtml.v);
        maybeEcho("ground:" + st.lbl.replace(/ /g, "_") + ":" + mode);
      }
    }
    G.stands = snap.stands; G.fac = snap.fac; G.standBuild = snap.build; G.mode = snap.mode;
    H.call("recalcCapacity");
    H.screen = "home";
    H.call("render");
  }

  /* Medejer-opkoeb er gated saa haardt, at botten sjaeldent naar dertil af sig
     selv. Her tvinges scenariet igennem og reglerne efterproeves direkte. */
  function checkOwnerBuyout() {
    const G = H.G;
    if (!G.owners.length) return;
    where = "ownerBuyout";
    const snap = { balance: G.balance, season: G.season, bought: G.ownerBoughtSeason };

    const expectInfo = (label) => {
      if (!H.modal || H.modal.type !== "info") fail(label + ": forventede info-modal, fik " + (H.modal ? H.modal.type : "ingen"));
      H.modal = null;
    };

    /* Pakke 4: saesonspaerringen er VAEK. Et opkoeb i saeson 1 skal vaere
       MULIGT -- men dyrt. Doeren er erstattet af en pris. */
    const snapTrust = G.trust, snapHist = G.valHistory;
    G.season = 1; G.ownerBoughtSeason = 0; G.owners[0].lockedUntil = 0;
    G.trust = H.consts.BAL.owners.trustStart; G.valHistory = [];
    G.balance = 5000000;
    H.call("buyOutOwner", 0);
    if (!H.modal || H.modal.type !== "ownerNego") {
      fail("saeson 1: opkoeb er stadig spaerret (fik " + (H.modal ? H.modal.type : "ingen modal") + ") — OWNER_GATE skulle vaere erstattet af en pris");
    }
    {
      const s1 = H.modal.min / H.modal.fair;
      if (s1 < 1.6) fail("saeson 1 er for billig: " + s1.toFixed(2) + "x fair — opkoeb maa ikke blive let");
      // ... og en betroet formand efter fem saesoner skal slippe billigere
      H.modal = null;
      G.trust = 100;
      H.call("buyOutOwner", 0);
      const s5 = H.modal.min / H.modal.fair;
      if (s5 >= s1) fail("tillid saenker ikke prisen: saeson 1 " + s1.toFixed(2) + "x vs betroet " + s5.toFixed(2) + "x");
      if (s5 > 1.45) fail("selv fuld tillid giver " + s5.toFixed(2) + "x — kurven flader ikke nok ud");
      H.modal = null;
    }
    G.trust = snapTrust; G.valHistory = snapHist;

    G.season = 4; G.ownerBoughtSeason = 4;
    H.call("buyOutOwner", 0);
    expectInfo("ét opkoeb pr. saeson");

    G.season = 4; G.ownerBoughtSeason = 0; G.owners[0].lockedUntil = 6;
    H.call("buyOutOwner", 0);
    expectInfo("laast efter kollaps");

    // pris-gulv og aabningskrav
    G.owners[0].lockedUntil = 0; G.balance = 5000000;
    H.call("buyOutOwner", 0);
    if (!H.modal || H.modal.type !== "ownerNego") fail("buyOutOwner aabnede ikke ownerNego");
    const { fair, min, ask } = H.modal;
    if (min <= fair) fail("minimumsprisen er ikke over fair vaerdi: min=" + min + " fair=" + fair);
    if (min > Math.round(fair * (H.consts.BAL.owners.premiumCap + 0.05))) fail("minimumspris over praemieloftet: " + (min / fair).toFixed(2) + "x — uden for kurven");
    if (ask <= min) fail("aabningskravet ligger ikke over minimumsprisen: " + ask + " vs " + min);

    // kollaps skal laase i 2 saesoner
    H.modal.offer = Math.round(min * 0.4);
    H.call("ownerNegoSubmit");
    const locked = G.owners[0].lockedUntil;
    if (locked !== G.season + 2) fail("kollaps laaser ikke 2 saesoner: lockedUntil=" + locked + ", saeson " + G.season);
    H.modal = null;

    // og en gennemfoert handel skal saette ownerBoughtSeason
    G.owners[0].lockedUntil = 0; G.ownerBoughtSeason = 0;
    const nOwners = G.owners.length;
    H.call("buyOutOwner", 0);
    let g = 0;
    while (H.modal && H.modal.type === "ownerNego") {
      if (g++ > 8) fail("ownerNego afsluttes ikke");
      handleModal();
    }
    if (G.owners.length === nOwners - 1) {
      if (G.ownerBoughtSeason !== G.season) fail("ownerBoughtSeason blev ikke sat efter opkoeb");
    }
    if (H.modal) { H.modal = null; }
    checkInvariants();

    G.balance = snap.balance; G.season = snap.season; G.ownerBoughtSeason = snap.bought;
    H.screen = "home"; H.call("render");
  }

  /* Pakke 4's hele pointe: den gamle formel kunne i praksis kun STIGE, og saa
     er det altid billigst at koebe kontrol tidligst muligt. Vaerdien skal
     kunne falde -- ellers er der ingen klemme, kun en mur. Maalt foer/efter. */
  function checkValuationDirection() {
    const G = H.G;
    where = "klubvaerdi reagerer";
    const v = () => H.call("clubValuation");
    if (!Number.isFinite(v()) || v() <= 0) fail("clubValuation() = " + v() + " (skal vaere endelig og > 0)");

    const snap = { div: G.div, admins: G.admins, trust: G.trust, balance: G.balance,
      mood: G.fanMood, pts: G.me.pts, wages: G.squad.map(p => p.wage), md: G.md, loan: G.loan };
    const FLOOR = H.consts.BAL.val.floor;
    const base = v();
    /* En klub hvis raa vaerdi ligger under gulvet er KLEMT FAST paa gulvet:
       den kan hverken falde eller stige, for max() spiser begge veje. Saa
       maaler vi ingenting, og sammenligner kun naar klemmen ikke er aktiv. */
    const loose = base > FLOOR * 1.5;

    if (G.div < 3) { G.div++; const down = v(); G.div = snap.div;
      if (loose && down >= base) fail("nedrykning saenkede ikke klubvaerdien: " + base + " -> " + down); }
    if (G.div > 0) { G.div--; const up = v(); G.div = snap.div;
      if (loose && up <= base) fail("oprykning haevede ikke klubvaerdien: " + base + " -> " + up); }

    /* Indtjeningsleddet maales mod et NEUTRALT nulpunkt, ikke mod klubbens
       egen netEwma -- den kan i forvejen vaere vaerre end proevevaerdien. */
    const ewma = G.netEwma;
    G.netEwma = 0; const neutral = v();
    G.netEwma = -8000; const losing = v();
    G.netEwma = 8000; const earning = v();
    G.netEwma = ewma;
    if (losing >= earning) fail("indtjeningsleddet virker ikke: taber " + losing + " vs tjener " + earning);
    if (neutral > FLOOR * 1.5 && losing >= neutral) fail("et vedvarende underskud saenker ikke vaerdien: " + neutral + " -> " + losing);

    // og administration skal efterlade et ar
    G.md = 0;                                    // undgaa at administration() starter efterspillet
    H.call("administration");
    H.modal = null;
    const after = v();
    if (loose && after >= base) fail("administration saenkede ikke klubvaerdien: " + base + " -> " + after);
    if (!(G.admins > snap.admins)) fail("administration blev ikke talt med (G.admins)");
    if (!(G.trust < snap.trust)) fail("administration kostede ikke tillid i bestyrelsen");

    G.div = snap.div; G.admins = snap.admins; G.trust = snap.trust; G.balance = snap.balance;
    G.fanMood = snap.mood; G.me.pts = snap.pts; G.md = snap.md; G.loan = snap.loan;
    G.squad.forEach((p, i) => { p.wage = snap.wages[i]; });
    checkInvariants();
    H.screen = "home"; H.call("render");
  }

  /* Pakke 6: tekstbiblioteket. Tre faelder, og de er alle tre stille:
       (a) en linje gentaget i samme kamp -- man laeser den to gange og
           illusionen falder sammen,
       (b) et snaevert tag der matcher NUL linjer, saa puljen er tom efter
           filtrering og alle situationer af den slags faar samme fallback,
       (c) en {P} der aldrig blev udskiftet (checkHtml faenger den i markup).
     Dertil: et TAG kan vaere doed tekst paa to maader -- stavet forkert paa
     linjen, eller aldrig produceret af nogen situation. Begge veje tjekkes. */
  function checkTextLibrary() {
    const G = H.G;
    where = "tekstbibliotek";
    const C = H.consts, POOLS = C.POOLS, TAGS = C.LINE_TAGS;
    const txt = C.lineText, ok = C.lineOk;

    // 1) stoerrelserne: WORKPLAN'ens maal pr. pulje
    const MIN = { GOALDESC: 60, NEARMISS: 40, FLAVOR: 60, PENDESC: 10, OPPGOAL: 10, MOMENTUM: 10 };
    for (const k of Object.keys(MIN))
      if (POOLS[k].length < MIN[k])
        fail(k + " har " + POOLS[k].length + " linjer, maalet er " + MIN[k]);
    if (C.SPONSORS.length < 10) fail("SPONSORS har " + C.SPONSORS.length + " af 10 (GDD linje 121)");
    if (C.COACHES.length < 8) fail("COACHES har " + C.COACHES.length + " af 8");
    for (const sp of C.SPONSORS) if (!sp.agenda) fail("sponsor uden agenda: " + sp.n);
    for (const co of C.COACHES) if (!co.line || !co.style) fail("traener uden stil/replik: " + co.n);

    // 2) ingen dubletter i en pulje -- to identiske linjer er den samme fejl
    for (const k of Object.keys(POOLS)) {
      const seen = new Set();
      for (const e of POOLS[k]) {
        const t = txt(e);
        if (seen.has(t)) fail(k + " indeholder samme linje to gange: " + t.slice(0, 50));
        seen.add(t);
      }
    }

    // 3) hvert tag paa hver linje skal findes i LINE_TAGS -- en stavefejl goer
    //    linjen uopnaaelig, og det er praecis pakke 5's fejlklasse igen
    for (const k of Object.keys(POOLS))
      for (const e of POOLS[k])
        if (typeof e !== "string")
          for (const t of e.c)
            if (TAGS.indexOf(t) < 0)
              fail(k + ": ukendt tag '" + t + "' paa \"" + txt(e).slice(0, 40) + "\" -- linjen kan aldrig vaelges");

    /* 4) den tomme pulje. Proeves mod HVER enkelt tag alene OG mod de
          bredeste realistiske kombinationer. Kravet er ikke "mindst en linje"
          men et forsvarligt udvalg: en pulje der er nede paa to linjer i regn
          laeses to gange pr. kamp. */
    const combos = [[]];
    for (const t of TAGS) combos.push([t]);
    for (const w of ["mud", "rain", "frost", "wind", "clear"])
      for (const st of ["lead", "level", "behind"])
        for (const extra of [[], ["big"], ["late"], ["big", "late", "rout"], ["silent"]])
          combos.push([w, st].concat(extra, ["home", "low"]));
    const FLOOR = 6;
    for (const k of Object.keys(POOLS))
      for (const ctx of combos) {
        const n = POOLS[k].filter(e => ok(e, ctx)).length;
        if (n < FLOOR)
          fail(k + " har kun " + n + " mulige linjer i kontekst [" + ctx.join(",") + "] -- under gulvet paa " + FLOOR);
      }

    /* 5) ingen gentagelse inden for samme kamp. Tvinger en kamp med mange maal
          gennem halfEvents og laeser den faktiske ticker: dubletter i sub- og
          txt-felterne er det spilleren ser. */
    const snap = { md: G.md, w: G.mdWeather };
    for (const weather of ["Mudbath", "Frost", "Clear skies"]) {
      const match = H.call("buildMatch", 1, true, true, "TESTKAMP");
      match.weather = { n: weather, phys: 0.5, txt: "test" };
      match.approach = "balanced";
      match.h1 = { gf: 4, ga: 3 };
      const ev1 = H.call("halfEvents", match, 1, 4, 3);
      const ev2 = H.call("halfEvents", match, 2, 4, 3);
      const lines = [];
      for (const e of ev1.concat(ev2)) { if (e.sub) lines.push(e.sub); if (e.txt) lines.push(e.txt); }
      if (lines.length < 12) fail("tvunget kamp gav kun " + lines.length + " ticker-linjer -- for lidt at maale paa");
      const seen = new Set();
      for (const l of lines) {
        // maalraab ("GOAL! HOBBS!") og modstandermaal gentages med vilje
        if (/^(GOAL!|PENALTY!|Goal —)/.test(l)) continue;
        if (seen.has(l)) fail("samme ticker-linje to gange i EN kamp (" + weather + "): " + l.slice(0, 60));
        seen.add(l);
      }
      for (const l of lines)
        if (/\{[A-Z][A-Z0-9_]*\}/.test(l)) fail("uudskiftet pladsholder i ticker-linje: " + l.slice(0, 60));
    }
    G.md = snap.md; G.mdWeather = snap.w;

    // 6) klubnyheder gentages ikke inden for en saeson
    G.flavourSeen = [];
    const news = [], want = Math.min(20, POOLS.FLAVOR.length);
    for (let i = 0; i < want; i++) news.push(H.call("flavourLine"));
    const dup = news.filter((x, i) => news.indexOf(x) !== i);
    if (dup.length) fail(want + " klubnyheder i traek gav " + dup.length + " gentagelser: " + dup[0].slice(0, 50));

    checkInvariants();
    H.screen = "home"; H.call("render");
  }

  /* Pakke 5: 'big' blev sat for NUL af de 26 ligakampdage, saa fem lovede
     mekanikker var doede paa en gang. Her maales de tre oekonomiske hver for
     sig -- og, vigtigere, at de er GATED paa big. En storskaerm der havde
     virket paa alle kampe ville bestaa en naiv "storskaerm haever gate"-test,
     saa hver af de tre proeves ogsaa i en almindelig kamp hvor den IKKE maa
     flytte noget. Sabotage der skal fange den:
       - fjern `res.big &&` i bigMult   -> normalkamp-assertionen fejler
       - fjern hele bigMult             -> skaerm/away-assertionerne fejler
       - byt `res.big?G.bigExtra:0` ud med 0 -> pristillaeg-assertionen fejler
     Alle tre er efterproevet ved at knaekke koden med vilje. */
  function checkBigGate() {
    const G = H.G;
    where = "store kampe flytter gate";
    const snap = { screen: G.fac.screen, away: G.stands.away, extra: G.bigExtra,
      sold: G.seasonTix.sold, ticket: G.ticket };
    // saesonkortholdere betaler ikke ved laagen -- med et solgt hus er gate 0
    // og alle tre forhold ville vaere 1:1 uden at noget virkede.
    G.seasonTix.sold = 0; G.bigExtra = 3; G.ticket = 10;
    const gate = big => H.call("gateReceipts", { home: true, big: big }).gate;
    if (gate(false) <= 0) fail("gate er 0 i testopsaetningen -- maalingen ville vaere tom");

    // 1) pristillaegget gaelder kun store kampe
    G.fac.screen = 0; G.stands.away = 0;
    const plainNoScreen = gate(false), bigNoScreen = gate(true);
    if (!(bigNoScreen > plainNoScreen))
      fail("bigExtra flytter ikke gate i en stor kamp: " + plainNoScreen + " -> " + bigNoScreen);

    // 2) storskaermen: +10% i store kampe, INTET i almindelige
    G.fac.screen = 1;
    const plainScreen = gate(false), bigScreen = gate(true);
    if (!(bigScreen > bigNoScreen))
      fail("storskaermen (£25.000) haever ikke gate i en stor kamp: " + bigNoScreen + " -> " + bigScreen);
    if (plainScreen !== plainNoScreen)
      fail("storskaermen virker paa ALMINDELIGE kampe (" + plainNoScreen + " -> " + plainScreen + ") -- den er ikke gated paa big");

    // 3) Away End: +6% pr. niveau i store kampe, intet i almindelige
    G.fac.screen = 0; G.stands.away = 2;
    const plainAway = gate(false), bigAway = gate(true);
    if (!(bigAway > bigNoScreen))
      fail("Away End haever ikke gate i en stor kamp: " + bigNoScreen + " -> " + bigAway);
    if (plainAway !== plainNoScreen)
      fail("Away End virker paa ALMINDELIGE kampe -- den er ikke gated paa big");

    G.fac.screen = snap.screen; G.stands.away = snap.away; G.bigExtra = snap.extra;
    G.seasonTix.sold = snap.sold; G.ticket = snap.ticket;
    checkInvariants();
    H.screen = "home"; H.call("render");
  }

  /* De fire kilder til `big` udledes af tabellen, saa de kan hver isaer vaere
     uopnaaelige uden at nogen bemaerker det. Her tvinges hver kilde frem med
     en konstrueret tabel og en konstrueret sæsonhistorie -- fejler en af dem,
     er en af de fire regler doed kode. */
  function checkBigSources() {
    const G = H.G;
    where = "big-kilder";
    const snap = { md: G.md, pts: G.me.pts, revenge: G.revenge,
      teamPts: G.teams.map(t => t.pts), teamGd: G.teams.map(t => t.gd) };
    const B = H.consts.BAL.big;
    const reason = i => H.call("bigMatchReason", i);
    // en flad tabel: alle modstandere paa 0 point, mig paa 0 -> jeg staar 1. paa navn
    const flat = () => { G.teams.forEach(t => { t.pts = 0; t.gd = 0; }); G.me.pts = 0; G.me.gd = 0; };

    // 1) tidligt i saesonen er INGEN kamp stor (bortset fra 1-mod-2, som en flad
    //    tabel ikke kan lave) -- ellers ville frekvensen loebe loebsk
    flat(); G.md = 4; G.revenge = null;
    for (let i = 1; i <= G.teams.length; i++)
      if (reason(i)) fail("kampdag 4 gav en stor kamp (" + reason(i) + ") -- tidlige tabeller lyver");

    /* 2) sidste spilledag med point taet paa en oprykningsstreg.
          HVER kilde proeves paa sit EGET maerkat, ikke paa "der kom noget".
          Foerste udgave af denne test spurgte kun om reason(i) var sand, og saa
          bestod den mod BAADE en doed regel 1 OG en doed regel 3, fordi en flad
          tabel ogsaa udloeser sekseren og nr.1-mod-nr.2. Opdaget ved at knaekke
          hver regel med vilje -- praecis nat 1's fejl gentaget. */
    G.md = G.rounds - 1;
    let found = null;
    for (let i = 1; i <= G.teams.length && !found; i++) {
      const r = reason(i); if (r && r.indexOf("FINAL DAY") === 0) found = r;
    }
    if (!found) fail("sidste spilledag med alle paa lige point gav ingen 'FINAL DAY'-kamp");

    // 3) sidste spilledag hvor alt er afgjort: jeg er langt fra hver streg
    flat(); G.md = G.rounds - 1;
    G.teams.forEach(t => { t.pts = 90; });      // alle 13 over mig, jeg er 14. paa 0
    G.me.pts = 0;
    for (let i = 1; i <= G.teams.length; i++) {
      const r = reason(i);
      if (r && r.indexOf("FINAL DAY") === 0)
        fail("sidste spilledag var stor selvom intet kunne afgoeres: " + r);
    }

    // 4) nr. 1 mod nr. 2, sent -- eget maerkat
    flat(); G.md = B.lateFrom + 1;
    G.me.pts = 40; G.teams[0].pts = 43;         // team 1 er 1., jeg er 2.
    G.teams.slice(1).forEach(t => { t.pts = 5; });
    if (String(reason(1)).indexOf("TOP OF THE TABLE") !== 0)
      fail("nr. 2 mod nr. 1 sent i saesonen gav ikke 'TOP OF THE TABLE': " + reason(1));

    /* 5) sekseren. Skal ligge et sted hvor regel 2 IKKE kan naa: to klubber
          over os begge, saa vi er nr. 3 og nr. 4 og kaemper om playoff-pladsen. */
    flat(); G.md = B.lateFrom + 1;
    G.teams.forEach((t, i) => { t.pts = i < 2 ? 70 : 5; });
    G.me.pts = 40; G.teams[2].pts = 42;         // team 3 lige over mig, vi er 3. og 4.
    if (String(reason(3)).indexOf("SIX-POINTER") !== 0)
      fail("naboen i tabellen sent i saesonen gav ingen sekser: " + reason(3));
    G.teams[2].pts = 40 + B.rivalPts + 3;       // samme plads, men uden for pointvinduet
    if (reason(3)) fail("sekseren ignorerer pointafstanden: " + reason(3));

    // 6) samme opstilling, men hos en klub uden for raekkevidde: rivalTop
    flat(); G.md = B.lateFrom + 1;
    G.me.pts = 5; G.teams[0].pts = 6;           // vi er nr. 13 og 14 -- betyder intet
    G.teams.slice(1).forEach(t => { t.pts = 60; });
    if (reason(1)) fail("bundopgoer blev stort (" + reason(1) + ") -- der er ingen nedrykning at spille om");

    /* 7) returopgoeret. Tabellen skal vaere tavs her, ellers maaler man en af de
          tre andre regler: alle 13 modstandere langt over mig, saa jeg er nr. 14
          -- uden for rivalTop, ikke nr. 1 eller 2, og ikke sidste spilledag. */
    flat(); G.md = 20;
    G.teams.forEach(t => { t.pts = 90; }); G.me.pts = 0;
    for (let i = 1; i <= G.teams.length; i++)
      if (reason(i)) fail("tabellen var ikke tavs i revenge-opsaetningen: " + reason(i));
    G.revenge = { opp: 3, md: 6, by: 5 };
    if (String(reason(3)).indexOf("THE RETURN") !== 0)
      fail("returopgoeret mod den der ydmygede dig gav ingen stor kamp: " + reason(3));
    if (reason(4)) fail("returopgoeret smittede af paa en anden modstander");
    G.revenge = { opp: 3, md: 22, by: 5 };      // 'foerste' kamp ligger EFTER nu
    if (reason(3)) fail("revenge udloeste foer den kamp den haevner");

    G.md = snap.md; G.me.pts = snap.pts; G.revenge = snap.revenge;
    G.teams.forEach((t, i) => { t.pts = snap.teamPts[i]; t.gd = snap.teamGd[i]; });
    checkInvariants();
    H.screen = "home"; H.call("render");
  }

  /* Med en balanceret oekonomi naar botten aldrig krisemaskineriet, saa
     bank-ultimatum -> laan -> administration proeves eksplicit. */
  function checkBankCascade() {
    const G = H.G;
    where = "bankCascade";
    const snap = { balance: G.balance, loan: G.loan, fund: G.fund, bonus: G.fundBonus, target: G.fundTarget, pts: G.me.pts, squad: G.squad.slice(), wages: G.squad.map(p => p.wage), captain: G.captain, mentors: G.mentors.slice() };

    // 1) banken toemmer stadionfonden foerst
    G.balance = -70000; G.fund = 30000; G.fundBonus = 5000; G.fundTarget = null; G.loan = null;
    H.call("openBankUltimatum");
    if (G.fund !== 0) fail("banken toemte ikke stadionfonden (fund=" + G.fund + ")");
    if (G.fundBonus !== 0) fail("fondens bonus blev ikke nulstillet");

    // 2) noedlaan
    if (H.modal && H.modal.type === "bank") {
      H.call("resolveBank", false);
      if (!G.loan) fail("noedlaan blev ikke oprettet");
    }
    H.modal = null;

    // 3) hverken salg (trup 13) eller laan (allerede taget) => administration
    G.balance = -90000; G.fund = 0; G.fundBonus = 0;
    // Foer pakke 1 var truppen altid praecis 13, saa denne slice var et no-op.
    // Nu skaerer den rent faktisk -- og maa ikke efterlade anfoerer eller
    // mentorpar pegende paa nogen der ikke laengere er i truppen.
    G.squad = G.squad.slice(0, 13);
    const ids = new Set(G.squad.map(p => p.id));
    if (!ids.has(G.captain)) G.captain = G.squad[0].id;
    G.mentors = G.mentors.filter(m => ids.has(m.vet) && ids.has(m.kid));
    const before = G.me.pts;
    H.call("openBankUltimatum");
    if (G.me.pts !== Math.max(0, before - 6)) fail("administration gav ikke -6 point (" + before + " -> " + G.me.pts + ")");
    H.modal = null;
    checkInvariants();

    G.balance = snap.balance; G.loan = snap.loan; G.fund = snap.fund; G.fundBonus = snap.bonus;
    G.fundTarget = snap.target; G.me.pts = snap.pts; G.squad = snap.squad;
    G.captain = snap.captain; G.mentors = snap.mentors;
    snap.squad.forEach((p, i) => { p.wage = snap.wages[i]; });
    H.call("render");
  }

  /* Priskurver SKAL have ét toppunkt og derefter falde. En bundgrænse i en
     efterspørgselsformel får indtægten til at stige igen ved absurde priser —
     dvs. gratis penge ved bare at skrue prisen op. Både sæsonkort og
     billetpris har haft præcis den fejl. */
  /* `tol` er stoejgulvet. Antal solgte saesonkort er et HELTAL, saa kontanten
     kan tikke op med under én kortpris hen over et pristrin uden at der er
     nogen exploit -- det er gitteret, ikke kurven. En stigning paa mere end ét
     kort er derimod aegte gratis penge. tol kan vaere et tal eller en liste. */
  function assertUnimodal(a, label, tol) {
    const t = i => (Array.isArray(tol) ? tol[i] : tol) || 1;
    let peak = 0;
    for (let i = 1; i < a.length; i++) if (a[i] > a[peak]) peak = i;
    for (let i = peak + 1; i < a.length; i++) {
      if (a[i] > a[i - 1] + t(i)) fail(label + ": stiger igen efter toppunktet (" + a[i - 1] + " → " + a[i] + ") — prisen kan skrues op i det uendelige");
    }
    return peak;
  }
  function assertNonIncreasing(a, label) {
    for (let i = 1; i < a.length; i++) if (a[i] > a[i - 1]) fail(label + ": stiger ved højere pris (" + a[i - 1] + " → " + a[i] + ")");
  }
  function checkPriceCurves() {
    where = "priskurver";
    // Sweep RELATIVT til den "fair" pris — den skalerer med kampdagsbilletten,
    // så en fast £-øvre grænse ville teste noget forskelligt fra spil til spil.
    const fair = H.call("seasonTixFair");
    const lo = Math.max(10, Math.round(fair * 0.15)), hi = Math.round(fair * 3);
    const step = Math.max(5, Math.round((hi - lo) / 40));
    const cash = [], sold = [], prices = [];
    for (let p = lo; p <= hi; p += step) { const e = H.call("seasonTixEstimate", p); cash.push(e.cash); sold.push(e.sold); prices.push(p); }
    assertUnimodal(cash, "sæsonkort: kontant", prices);
    assertNonIncreasing(sold, "sæsonkort: solgte");
    if (sold[sold.length - 1] !== 0) fail("sæsonkort: der sælges stadig ved 3x fair pris (£" + hi + " → " + sold[sold.length - 1] + " solgte)");
    // og inden for det interval UI'et faktisk tillader, skal toppunktet være nåeligt
    const uiCash = [], uiPrices = [];
    for (let p = 20; p <= 400; p += 10) { uiCash.push(H.call("seasonTixEstimate", p).cash); uiPrices.push(p); }
    assertUnimodal(uiCash, "sæsonkort: kontant i UI-intervallet £20-400", uiPrices);

    const keep = H.G.ticket, rev = [], att = [];
    for (let t = 5; t <= 30; t++) { H.G.ticket = t; const a = H.call("attendance"); att.push(a); rev.push(Math.max(0, a - H.G.seasonTix.sold) * t); }
    H.G.ticket = keep;
    assertUnimodal(rev, "gate-indtægt");
    assertNonIncreasing(att, "fremmøde ved stigende billetpris");
    H.call("render");
  }

  /* Gem/indlæs skal være tabsfri. Fanger den klasse fejl hvor state indeholder
     funktioner eller objektreferencer, der ikke overlever JSON. */
  /* Funktioner forsvinder over JSON, og en DELT objektreference bliver til to
     uafhængige kopier — så `G.market.includes(bid.p)` pludselig er falsk.
     Begge dele er tavse fejl, så de fanges strukturelt her. */
  function assertSerialisable(root) {
    const seen = new Map();
    (function walk(v, path) {
      if (v === null || typeof v !== "object") {
        if (typeof v === "function") fail("state indeholder en funktion: " + path + " — overlever ikke JSON");
        return;
      }
      if (seen.has(v)) fail("state indeholder samme objekt to steder: " + seen.get(v) + " og " + path +
        " — JSON gør dem til to kopier, og identitetstjek holder op med at virke");
      seen.set(v, path);
      for (const k of Object.keys(v)) walk(v[k], path + "." + k);
    })(root, "G");
  }
  function checkSaveLoad() {
    where = "saveLoad";
    assertSerialisable(H.G);
    H.call("saveGame");
    const before = JSON.stringify(H.G);
    const beforeIds = H.G.squad.map(p => p.id).join(",");
    const beforeCaptain = H.G.captain;
    if (!H.call("loadGame")) fail("loadGame() kunne ikke læse det, saveGame() lige skrev");
    const after = JSON.stringify(H.G);
    if (before !== after) {
      let i = 0; while (i < before.length && before[i] === after[i]) i++;
      fail("gem/indlæs er ikke tabsfri — første forskel ved tegn " + i + ":\n      før:  …" +
        before.slice(Math.max(0, i - 60), i + 80) + "\n      efter:…" + after.slice(Math.max(0, i - 60), i + 80));
    }
    if (H.G.squad.map(p => p.id).join(",") !== beforeIds) fail("spiller-id'er ændrede sig over gem/indlæs");
    if (H.G.captain !== beforeCaptain) fail("anføreren ændrede sig over gem/indlæs");
    // et nyt id må aldrig kollidere med et indlæst
    const maxId = Math.max(...H.G.squad.concat(H.G.market, H.G.freeAgents).map(p => p.id));
    const fresh = H.call("genPlayer", "MF", 50, 1);
    if (fresh.id <= maxId) fail("PID blev ikke gendannet ved load: nyt id " + fresh.id + " ≤ eksisterende " + maxId);
    checkInvariants();
    // og spillet skal kunne fortsætte bagefter
    H.screen = "home"; H.call("render"); checkHtml();
  }

  /* Oprykning uden sponsor kastede TypeError og dræbte hele karrieren.
     Botten tegner næsten altid en sponsor, så scenariet tvinges igennem. */
  function checkPromotionWithoutSponsor() {
    where = "oprykning uden sponsor";
    H.G.sponsor = null;
    if (H.G.div === 0) H.G.div = 1;              // der skal være noget at rykke op til
    H.call("finishSeason", { promoted: true, how: "champions" });
    if (H.modal && H.modal.type === "seasonDone") H.modal = null;
    checkInvariants();
    H.screen = "home"; H.call("render"); checkHtml();
  }

  /* Botten moeder ikke alle otte beskedtyper i hver koersel, saa RNG maa ikke
     afgoere om blindgyden opdages. Her tvinges én af hver igennem, plus de to
     veje der lod spilleren haenge: sletning og udloeb. */
  function checkAllMessageKinds() {
    const G = H.G;
    where = "alle beskedtyper";
    const keepInbox = G.inbox.slice(), keepScreen = H.screen, keepMd = G.md, keepBal = G.balance;
    const p = G.market[0];
    if (!p) fail("intet marked at proeve beskedtyperne paa");
    const squadId = G.squad[0].id;
    const kinds = [
      { kind: "sellOffer", pid: squadId, bid: 20000, club: "Testfield United" },
      { kind: "sponsorChoice", offers: [{ n: "A", per: 400 }, { n: "B", per: 700 }] },
      { kind: "bidAccepted", pid: p.id, fee: 30000 },
      { kind: "bidCounter", pid: p.id, ask: 35000 },
      { kind: "bidWar", pid: p.id, raise: 40000, club: "Testfield United" },
      { kind: "callback", pid: p.id },
      { kind: "transferReq", pid: squadId },
      { kind: "stunt" }
    ];
    // ogsaa med tom kasse: en daempet knap maa ikke vaere den ENESTE udvej
    for (const balance of [5000000, 0]) {
      G.balance = balance;
      for (const action of kinds) {
        G.inbox = [];
        H.call("msg", "Test", "T", "Test " + action.kind, "body", { ...action });
        H.screen = "inbox"; H.call("render");
        const m = G.inbox[0];
        if (!lastHtml.v.includes("actMsg(" + m.id + ",")) {
          fail("beskedtypen '" + action.kind + "' kan ikke besvares fra indbakken ved kasse " +
            balance + " — tilfoej den i inboxActions()");
        }
      }
    }

    // sletning skal frigive spilleren igen
    G.inbox = []; p.pendingBid = true;
    H.call("msg", "Test", "T", "Counter", "body", { kind: "bidCounter", pid: p.id, ask: 35000 });
    H.call("delMsg", G.inbox[0].id);
    if (p.pendingBid) fail("delMsg() ryddede ikke pendingBid — spilleren er laast paa BID PENDING");

    // og en ubesvaret budbesked skal doe af sig selv
    G.inbox = []; p.pendingBid = true;
    H.call("msg", "Test", "T", "War", "body", { kind: "bidWar", pid: p.id, raise: 40000, club: "X" });
    const live = G.inbox[0];
    if (!Number.isFinite(live.action.expires)) fail("budbesked fik ingen frist (action.expires)");
    G.md = live.action.expires;
    H.call("expireMessages");
    if (!live.done) fail("budbeskeden udloeb ikke ved fristen");
    if (p.pendingBid) fail("udloebet budbesked ryddede ikke pendingBid");

    G.inbox = keepInbox; G.md = keepMd; G.balance = keepBal;
    H.screen = keepScreen; H.call("render");
    checkNoOrphanBids();
    checkInvariants();
  }

  /* Pakke 3: botten rammer ikke alle tre strukturer i hver koersel, og en
     klausul der aldrig udloeses ville se ud som om den virkede. Tvinges igennem. */
  function checkDealStructures() {
    const G = H.G;
    where = "handelsstrukturer";
    const keep = { commitments: G.commitments.slice(), balance: G.balance, div: G.div, inbox: G.inbox.slice() };
    const fee = 100000;

    const cash = H.call("dealTerms", fee, 1, null);
    if (cash.down !== cash.total) fail("kontanthandel: down != total (" + cash.down + " vs " + cash.total + ")");
    if (cash.total !== fee) fail("kontanthandel aendrer prisen: " + cash.total + " vs " + fee);

    let prevSur = -1;
    for (const plan of [2, 3, 4]) {
      const t = H.call("dealTerms", fee, plan, null);
      if (t.total <= fee) fail(plan + " rater koster ikke et tillaeg: " + t.total + " vs " + fee);
      if (t.sur <= prevSur) fail("tillaegget stiger ikke med antallet af rater (" + plan + " saesoner)");
      prevSur = t.sur;
      if (t.down >= t.total) fail(plan + " rater: hele beloebet forfalder i dag");
      if (Math.abs(t.down + t.perSeason * (plan - 1) - t.total) > 2) {
        fail(plan + " rater summer ikke til totalen: " + t.down + " + " + (plan - 1) + "x" + t.perSeason + " != " + t.total);
      }
    }
    for (const cl of ["promo", "goals"]) {
      const t = H.call("dealTerms", fee, 1, cl);
      if (t.total >= fee) fail(cl + "-klausul giver ingen rabat i dag: " + t.total + " vs " + fee);
      if ((cl === "promo" ? t.promo : t.perGoal) <= 0) fail(cl + "-klausul uden beloeb");
    }

    // ratebetaling: afdrages og doer ud
    const p = G.squad[0];
    G.commitments = [{ pid: p.id, name: p.name, club: "Testfield", kind: "fee", amt: 20000, seasonsLeft: 2 }];
    let b = G.balance;
    H.call("settleCommitments", false);
    if (G.balance !== b - 20000) fail("raten blev ikke betalt: " + b + " -> " + G.balance);
    if (G.commitments[0].seasonsLeft !== 1) fail("raten talte ikke ned");
    H.call("settleCommitments", false);
    if (G.commitments.length) fail("raten doede aldrig ud: " + JSON.stringify(G.commitments));

    // oprykningsklausul: udloeses KUN ved oprykning, og udloeber ellers
    G.commitments = [{ pid: p.id, name: p.name, club: "Testfield", kind: "promo", amt: 30000, seasonsLeft: 2 }];
    b = G.balance;
    H.call("settleCommitments", false);
    if (G.balance !== b) fail("oprykningsklausul betalte uden oprykning");
    H.call("settleCommitments", true);
    if (G.balance !== b - 30000) fail("oprykningsklausul udloestes ikke ved oprykning");
    if (G.commitments.length) fail("oprykningsklausul blev staaende efter udbetaling");

    // maalklausul: betales pr. maal, foer sommeren nulstiller p.sg
    const sg = p.sg; p.sg = 3;
    G.commitments = [{ pid: p.id, name: p.name, club: "Testfield", kind: "goals", amt: 2000, seasonsLeft: 1 }];
    b = G.balance;
    H.call("settleCommitments", false);
    if (G.balance !== b - 6000) fail("maalklausul betalte ikke 3 x 2.000: " + b + " -> " + G.balance);
    if (G.commitments.length) fail("maalklausul doede ikke ud");
    p.sg = sg;

    // og gaelden skal vaere synlig i klubvaerdien
    G.commitments = [{ pid: p.id, name: p.name, club: "Testfield", kind: "fee", amt: 25000, seasonsLeft: 3 }];
    if (H.call("commitmentsOwed") !== 75000) fail("commitmentsOwed() = " + H.call("commitmentsOwed") + ", forventet 75000");
    const withDebt = H.call("clubValuation");
    G.commitments = [];
    const without = H.call("clubValuation");
    if (without > H.consts.BAL.val.floor && without <= withDebt) fail("forpligtelser saenker ikke klubvaerdien: " + withDebt + " vs " + without);

    G.commitments = keep.commitments; G.balance = keep.balance; G.div = keep.div; G.inbox = keep.inbox;
    checkInvariants();
    H.screen = "home"; H.call("render");
  }

  /* Pakke 2: protest-trappen. Botten vinder for meget til at naa bunden af egen
     kraft, saa alle tre trin tvinges igennem -- inkl. den faelde WORKPLAN'en
     selv advarer om: stadCache-noeglen skal indeholde trinnet. */
  function checkProtestLadder() {
    const G = H.G;
    where = "protest-trappen";
    const P = H.consts.BAL.protest;
    const keep = { mood: G.fanMood, protest: G.protest, inbox: G.inbox.slice(), news: G.news.slice(), screen: H.screen };

    const at = mood => { G.fanMood = mood; H.call("updateProtest"); return H.call("protestLevel"); };

    /* Traersklerne: hvert trin skal faktisk udloeses. */
    G.protest = 0;
    if (at(80) !== 0) fail("glade fans giver alligevel protest");
    if (at(P.banners - 1) !== 1) fail("bannere (trin 1) udloeses ikke ved stemning " + (P.banners - 1));
    if (at(P.silence - 1) !== 2) fail("tavshed (trin 2) udloeses ikke");
    if (at(P.boycott - 1) !== 3) fail("boykot (trin 3) udloeses ikke");

    /* Virkningerne maales med fanMood HOLDT FAST og kun trinnet skiftet.
       Ellers maaler man stemningens egen effekt paa fremmoedet og tror at
       trappen virker -- begge de foerste forsoeg paa denne test gjorde netop
       det og lod baade en doed 12.-mand-regel og en stadCache uden trinnet
       slippe igennem. */
    G.fanMood = P.silence - 1;
    const eff = lvl => { G.protest = lvl; H.screen = "club"; H.call("render"); checkSvg(lastHtml.v);
      return { home: H.call("homeBonus"), town: H.call("townDemand"), svg: H.call("stadiumSvg") }; };
    const e1 = eff(1), e2 = eff(2), e3 = eff(3);
    if (e2.home >= e1.home) fail("12. mand falder ikke bort ved tavshed: " + e2.home + " vs " + e1.home + " (samme stemning)");
    if (e2.svg === e1.svg) fail("stadion tegnes uaendret fra trin 1 til 2 — staar trinnet i stadCache-noeglen?");
    if (e3.town >= e1.town) fail("boykot saenker ikke townDemand(): " + e3.town + " vs " + e1.town + " (samme stemning)");
    if (e3.svg === e2.svg) fail("stadion tegnes uaendret fra trin 2 til 3 — staar trinnet i stadCache-noeglen?");
    checkHtml();

    // vejen tilbage: mulig, men langsom. At roere linjen er ikke nok.
    if (at(P.boycott + 1) !== 3) fail("trinnet forlades allerede ved at roere linjen — hysteresen virker ikke");
    if (at(P.boycott + P.hysteresis + 1) !== 2) fail("man kan ikke komme OP ad trappen igen");
    if (at(95) !== 0) fail("fuld opbakning fjerner ikke protesten");

    G.fanMood = keep.mood; G.protest = keep.protest; G.inbox = keep.inbox; G.news = keep.news;
    H.screen = keep.screen; H.call("render");
    checkInvariants();
  }

  function checkInvariants() {
    const G = H.G;
    if (!G) return;
    if (!Number.isFinite(G.balance)) fail("balance er ikke et tal: " + G.balance);
    if (!Number.isFinite(G.fanMood)) fail("fanMood er ikke et tal");
    if (!Number.isFinite(G.capacity)) fail("capacity er ikke et tal");
    if (G.squad.length < 11) fail("truppen er for lille: " + G.squad.length);
    if (G.md < 0 || G.md > G.rounds) fail("md uden for interval: " + G.md);
    if (G.myShare < 0 || G.myShare > 100) fail("myShare = " + G.myShare);
    const shares = G.owners.reduce((s, o) => s + o.share, 0) + G.myShare;
    if (shares !== 100) fail("ejerandele summer til " + shares + " (skal være 100)");
    for (const p of G.squad) {
      for (const k of ["att", "def", "phy", "wage", "value", "conf", "age", "years", "form", "load"]) {
        if (!Number.isFinite(p[k])) fail("spiller " + p.name + "." + k + " = " + p[k]);
      }
      // pakke 1: belastning er det gemte tal, friskhed er det afledte
      if (p.load < 0) fail("spiller " + p.name + " har negativ belastning: " + p.load);
      const f = H.call("freshOf", p);
      if (!Number.isFinite(f) || f < 0 || f > 100) fail("freshOf(" + p.name + ") = " + f + " (skal vaere 0-100)");
    }
    // pakke 4: vaerdien maa vaere endelig og positiv i ENHVER tilstand
    const val = H.call("clubValuation");
    if (!Number.isFinite(val) || val <= 0) fail("clubValuation() = " + val + " (skal vaere endelig og > 0)");
    if (!Number.isFinite(G.netEwma)) fail("G.netEwma er ikke et tal: " + G.netEwma);
    if (!Number.isFinite(G.trust) || G.trust < 0 || G.trust > 100) fail("G.trust = " + G.trust);
    if (!Number.isFinite(G.protest) || G.protest < 0 || G.protest > 3) fail("G.protest = " + G.protest);
    // pakke 3: forpligtelser er kun id'er og primitive vaerdier, og de doer ud
    if (!Array.isArray(G.commitments)) fail("G.commitments er ikke en liste");
    for (const c of G.commitments) {
      if (!Number.isFinite(c.pid)) fail("forpligtelse uden spiller-id: " + JSON.stringify(c));
      if (!Number.isFinite(c.amt) || c.amt < 0) fail("forpligtelse med ugyldigt beloeb: " + JSON.stringify(c));
      if (!Number.isFinite(c.seasonsLeft) || c.seasonsLeft <= 0) fail("forpligtelse der aldrig doer ud: " + JSON.stringify(c));
      if (!["fee", "promo", "goals"].includes(c.kind)) fail("ukendt forpligtelsestype: " + c.kind);
    }
    if (!Number.isFinite(H.call("commitmentsOwed"))) fail("commitmentsOwed() er ikke et tal");
    if (!Array.isArray(G.lastXI)) fail("G.lastXI er ikke en liste");
    if (G.lastXI.some(id => !Number.isFinite(id))) fail("G.lastXI indeholder andet end id'er");
    for (const k of Object.keys(H.consts.STANDS)) {
      if (G.stands[k] < 0 || G.stands[k] > 2) fail("stand " + k + " niveau " + G.stands[k]);
    }
    // spiller-id'er: unikke på tværs af trup/marked/frie agenter, og alle
    // referencer (anfører, mentorer) skal pege på nogen der findes
    const seen = new Set(), squadIds = new Set();
    for (const [list, label] of [[G.squad, "trup"], [G.market, "marked"], [G.freeAgents, "frie agenter"]]) {
      for (const p of list) {
        if (!Number.isFinite(p.id)) fail(label + ": spiller uden id (" + p.name + ")");
        if (seen.has(p.id)) fail("dublet spiller-id " + p.id + " (" + p.name + ") i " + label);
        seen.add(p.id);
        if (label === "trup") squadIds.add(p.id);
      }
    }
    if (G.captain !== null && !squadIds.has(G.captain)) fail("anfører-id " + G.captain + " findes ikke i truppen");
    for (const m of G.mentors) {
      if (!squadIds.has(m.vet) || !squadIds.has(m.kid)) fail("mentor-par peger på ukendt id (" + m.vet + "/" + m.kid + ")");
    }
  }

  /* Samme fejlklasse som en uregistreret modaltype: handleAction() kunne otte
     beskedtyper, men viewInbox() tegnede kun knapper for to. Botten kaldte
     actMsg() direkte og opdagede det aldrig — en rigtig spiller sad fast.
     Derfor: hver besked med action && !done SKAL kunne besvares fra skærmen. */
  function checkInboxActionable() {
    const G = H.G;
    if (!G) return;
    const live = G.inbox.filter(m => m.action && !m.done);
    if (!live.length) return;
    const keep = H.screen, keepWhere = where;
    where = "indbakke-knapper";
    H.screen = "inbox"; H.call("render");
    const h = lastHtml.v;
    for (const m of live) {
      if (!h.includes("actMsg(" + m.id + ",")) {
        fail("indbakken tegner INGEN knap for besked #" + m.id + " af typen '" + m.action.kind +
          "' — den kan ikke besvares. Tilfoej den i inboxActions().");
      }
    }
    H.screen = keep; where = keepWhere; H.call("render");
  }

  /* Foelgefejlen: en ubesvaret budbesked lader p.pendingBid staa, og
     marketRow() tegner 'BID PENDING' i stedet for knapper — for evigt. */
  function checkNoOrphanBids() {
    const G = H.G;
    if (!G) return;
    where = "BID PENDING-laas";
    for (const p of G.market) {
      if (!p.pendingBid) continue;
      if (G.bids.some(b => b.pid === p.id)) continue;
      if (G.inbox.some(m => m.action && !m.done && m.action.pid === p.id)) continue;
      fail("spiller " + p.name + " (#" + p.id + ") staar paa BID PENDING uden hverken bud i luften " +
        "eller en aaben besked — han kan aldrig koebes igen");
    }
  }

  /* Ligaens integritet: hver kampdag = 7 kampe = 14 hold-optrædener.
     Fanger dobbeltsimulering af AI-runden (fælden i ændring 8). */
  function checkFixtureIntegrity() {
    const G = H.G;
    if (!G || G.phase !== "season") return;
    const total = G.me.pl + G.teams.reduce((s, t) => s + t.pl, 0);
    if (total !== 14 * G.md) {
      fail("ligaintegritet brudt: " + total + " hold-optrædener, forventet " + (14 * G.md) +
        " (md=" + G.md + ") — simuleres AI-runden to gange?");
    }
  }

  const hasFn = name => lastHtml.v.includes(name + "(");

  const echoed = new Set();
  function maybeEcho(tag) {
    if (!ECHO.has(tag) || echoed.has(tag)) return;
    echoed.add(tag);
    const f = path.join(ECHO_DIR, "echo-" + tag.replace(/[:\\/]/g, "-") + ".html");
    fs.writeFileSync(f, lastHtml.v, "utf8");
    console.log("  [echo] " + tag + " (S" + H.G.season + " MD" + H.G.md + ") → " + f);
  }

  /* ---------------- onboarding ---------------- */
  where = "onboarding";
  {
    let guard = 0;
    while (!H.G) {
      tick();
      if (guard++ > 60) fail("onboarding hænger (obStep=" + H.obStep + ")");
      const h = lastHtml.v;
      const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
      if (hues.length) H.call("obHue", pick(hues));
      const modes = [...h.matchAll(/obMode\('(\w+)'\)/g)].map(x => x[1]);
      if (modes.length) H.call("obMode", pick(modes));
      checkHtml();
      if (hasFn("obFinish")) H.call("obFinish");
      else if (hasFn("obNext")) H.call("obNext");
      else fail("onboarding-skærm uden obNext/obFinish (obStep=" + H.obStep + ")");
    }
  }
  if (!H.G) fail("newGame blev aldrig kaldt");
  stats.startBalance = H.G.balance;

  /* --curve: dump prisernes kurver, så man kan se at de har et reelt knæk og
     ikke bare vokser i det uendelige. */
  if (flag("curve") && !runSeed.curveShown) {
    runSeed.curveShown = true;   // kurverne er de samme hver gang — vis dem én gang
    console.log("\n  sæsonkort (fair ~" + fmtGbp(H.call("seasonTixFair")) + ") — pris → solgte → kontant nu → afgivet drejekors/kamp");
    let best = { cash: -1 };
    for (let p = 20; p <= 400; p += 20) {
      const e = H.call("seasonTixEstimate", p);
      if (e.cash > best.cash) best = { p, cash: e.cash };
      console.log("      £" + String(p).padStart(3) + " → " + String(e.sold).padStart(5) + " → " +
        fmtGbp(e.cash).padStart(9) + " → " + fmtGbp(e.sold * H.G.ticket).padStart(8));
    }
    console.log("      toppunkt: £" + best.p + " (" + fmtGbp(best.cash) + ")");
    console.log("\n  billetpris — pris → fremmøde → gate/hjemmekamp");
    const keep = H.G.ticket; let bestT = { rev: -1 };
    for (let t = 5; t <= 30; t++) {
      H.G.ticket = t;
      const at = H.call("attendance"), rev = Math.max(0, at - H.G.seasonTix.sold) * t;
      if (rev > bestT.rev) bestT = { t, rev };
      if (t % 2 === 1 || t === 30) console.log("      £" + String(t).padStart(2) + " → " + String(at).padStart(5) + " → " + fmtGbp(rev).padStart(9));
    }
    H.G.ticket = keep;
    console.log("      toppunkt: £" + bestT.t + " (" + fmtGbp(bestT.rev) + ")\n");
  }

  /* ---------------- bot-handlinger ---------------- */
  function processInbox() {
    const G = H.G;
    const live = G.inbox.filter(x => x.action && !x.done);
    if (!live.length) return;
    const msg = pick(live);
    const kind = msg.action.kind;
    const choice = {
      sellOffer: () => hasSurplus() ? pick(["accept", "demand", "reject"]) : pick(["demand", "reject"]),
      bidAccepted: () => pick(["ok", "ok", "die"]),
      bidCounter: () => pick(["accept", "die"]),
      bidWar: () => pick(["raise", "walk"]),
      callback: () => "ok",
      transferReq: () => pick(["list", "no"]),
      stunt: () => pick(["yes", "no"]),
      sponsorChoice: () => pick(["A", "B"])
    }[kind];
    if (!choice) fail("UKENDT INBOX-ACTION: '" + kind + "' — tilføj den i harness'ens processInbox");
    H.call("actMsg", msg.id, choice());
  }

  /* Pakke 1 gav dybde en pris OG en vaerdi. Botten skal svare paa det samme
     signal som en spiller: gafferen brokker sig, benene er flade, der er ingen
     at saette ind. Foer pakke 1 var spiller nr. 12 ren loenudgift, og botten
     solgte derfor helt ned til gulvet paa 13 — hver eneste saeson. */
  function wantsDepth() {
    const G = H.G;
    return G.squad.length < 15 ||
      H.call("squadFreshness") < H.consts.BAL.fresh.gafferMoans ||
      H.call("freshCount") < 13;
  }
  // saelg kun ægte overskud: elleve paa banen + reel rotationsdaekning
  function hasSurplus() { return H.G.squad.length > 16; }

  function doTransfer() {
    const G = H.G;
    if (G.squad.length >= 19) return;
    const wagesNow = G.squad.reduce((s, p) => s + p.wage, 0);
    const room = G.myShare >= 100 ? Infinity : G.wageCap - wagesNow;
    if (room < 1200) return;
    if (H.call("windowOpen") && G.market.length && G.balance > 90000) {
      const ix = Math.floor(rnd() * G.market.length);
      if (G.market[ix].pendingBid) return;
      if (chance(0.5)) H.call("startBuyNego", ix, false, { quick: true });
      else H.call("openFormalBid", ix);
    } else if (G.freeAgents.length && chance(wantsDepth() ? 0.6 : 0.35)) {
      H.call("startBuyNego", Math.floor(rnd() * G.freeAgents.length), true);
    }
  }

  function doBuild() {
    const G = H.G;
    const { STANDS, STANDCOST, FACS } = H.consts;
    if (!G.standBuild && chance(0.5)) {
      const keys = Object.keys(STANDS).filter(k => G.stands[k] < 2);
      if (keys.length) {
        const k = pick(keys);
        const cost = STANDCOST[G.stands[k] + 1];
        if (G.balance > cost + 50000) { H.call("startStandBuild", k); return; }
      }
    }
    if (!G.facBuild) {
      const keys = Object.keys(FACS).filter(k => !G.fac[k]);
      if (keys.length) {
        const k = pick(keys);
        if (G.balance > FACS[k].cost + 45000) H.call("buildFac", k);
      }
    }
  }

  function doSquadStuff() {
    const G = H.G;
    // en rigtig spiller står på trup-skærmen, når han rører en spiller
    H.screen = "squad";
    H.call("render");
    checkHtml();
    const p = G.squad[Math.floor(rnd() * G.squad.length)];
    const id = p.id;
    const opts = [];
    if (hasFn("openPlayer")) opts.push(() => H.call("openPlayer", id));
    if (G.talkCooldown <= 0) opts.push(() => H.call("openChat", id));
    if (p.age >= 28) opts.push(() => H.call("setMentor", id));
    if (!G.captSuggested && p.id !== G.captain) opts.push(() => H.call("suggestCaptain", id));
    // en trup der skal rotere holder paa sine kontrakter og saelger kun overskud
    if (p.years <= 1) { opts.push(() => H.call("startRenewal", id)); opts.push(() => H.call("startRenewal", id)); }
    if (H.call("windowOpen") && hasSurplus()) opts.push(() => H.call("openSellSheet", id));
    if (p.age < 28) opts.push(() => H.call("setFocus", id, pick(["att", "def", "phy"])));
    if (opts.length) pick(opts)();
  }

  /* Bosman toemte truppen hver sommer: alle med udloebet kontrakt gik gratis,
     og gulvet paa 13 var det eneste der stoppede blodet. Modtraekket findes i
     spillet allerede -- forlaengelser -- men botten brugte det kun tilfaeldigt. */
  function doRenewals() {
    const G = H.G;
    const due = G.squad.filter(p => p.years <= 1 && G.md >= p.renewLockMD);
    if (!due.length) return;
    const wagesNow = G.squad.reduce((s, p) => s + p.wage, 0);
    if (G.myShare < 100 && wagesNow > G.wageCap * 0.94) return;   // ingen plads under loftet
    H.call("startRenewal", pick(due).id);
  }

  /* Pakke 4 fjernede saesonspaerringen, og botten begyndte straks at toemme
     kassen paa en andel i saeson 1 -- 8 administrationer mod 1. En formand med
     forstand paa sit eget budget koeber ikke magt med driftskapitalen. Det tal
     har spillet allerede et navn for: loennen ganget med de kampdage der er
     tilbage, praecis som budgetmoedet formulerer raaderummet. */
  function workingCapital() {
    const G = H.G;
    const wages = G.squad.reduce((s, p) => s + p.wage, 0);
    return wages * Math.max(6, G.rounds - G.md);
  }
  function doOwnerBuyout() {
    const G = H.G;
    if (!G.owners.length) return;
    if (G.balance < workingCapital() + 150000) return;
    H.call("buyOutOwner", Math.floor(rnd() * G.owners.length));
  }

  function renderAllScreens() {
    const keep = H.screen;
    for (const s of ["home", "inbox", "squad", "market", "club", "table"]) {
      H.screen = s;
      H.call("render");
      where = "render:" + s;
      checkHtml();
      if (s === "club") checkSvg(lastHtml.v);
      maybeEcho("screen:" + s);
    }
    H.screen = keep;
    H.call("render");
  }

  function botIdle() {
    if (chance(0.55)) { processInbox(); if (H.modal) return; }
    if (chance(0.35)) { doTransfer(); if (H.modal) return; }
    if (chance(0.30)) { doRenewals(); if (H.modal) return; }
    if (chance(0.30)) { doBuild(); if (H.modal) return; }
    if (chance(0.25)) { doSquadStuff(); if (H.modal) return; }
    if (chance(0.06)) { doOwnerBuyout(); if (H.modal) return; }
    // billetprisen var utestet: hele elasticitetskurven og stemningsstraffen
    // over £16 blev aldrig ramt, fordi botten lod prisen stå på £10
    if (chance(0.10)) {
      // hold dig inden for det interval en spiller ville overveje (£8-18, dvs.
      // hen over både toppunktet ~£14 og stemningsstraffen ved £16). De
      // absurde priser dækkes analytisk af checkPriceCurves, ikke ved at lade
      // botten ødelægge sin egen økonomi undervejs.
      H.G.ticket = Math.max(8, Math.min(18, H.G.ticket + (chance(0.5) ? -1 : 1) * (1 + Math.floor(rnd() * 3))));
      if (chance(0.3)) H.G.bigExtra = Math.max(0, Math.min(8, H.G.bigExtra + (chance(0.5) ? -1 : 1)));
      H.call("render");
    }
    if (chance(0.25)) renderAllScreens();
  }

  /* ---------------- ticker ---------------- */
  function driveTicker() {
    if (chance(0.18)) H.call("skipTicker");
    let g = 0;
    while (H.modal && H.modal.type === "ticker" && !H.modal.ft) {
      tick();
      if (g++ > 6000) fail("ticker blev aldrig færdig");
      if (timers.list.length) timers.list[0].fn();
      else if (H.modal.ht) H.call("tickHT", chance(0.4) ? null : pick(["steady", "fury"]));
      else fail("ticker gik i stå (ingen timere, ikke HT, ikke FT)");
    }
    H.call("closeTicker");
  }

  /* ---------------- modal-switch ---------------- */
  function handleModal() {
    const md = H.modal;
    where = "modal:" + md.type;
    maybeEcho(md.type);
    if (md.type === "budget") maybeEcho("budget" + (md.step || 0));
    if (md.type === "sponsorOffer") maybeEcho("sponsor:" + (H.G.sponsorDue && H.G.sponsorDue.renewal ? "renewal" : "first") + ":" + (md.after || "?"));
    if (md.type === "nego" && H.nego && H.nego.stage === "contract" && !H.nego.doneDeal && !H.nego.dead) {
      const seen = !!H.nego.renewal || H.nego.cround >= 1;
      maybeEcho("nego:" + (seen ? "seen" : "blind"));
      if (H.nego.renewal) maybeEcho("nego:renewal");
      // GDD: poker-princippet — første runde er blind (undtagen forlængelser)
      const h = lastHtml.v;
      if (!seen && h.includes("he expects")) {
        fail("poker-reglen brudt: lønkravet vises allerede i runde 1 (cround=" + H.nego.cround + ")");
      }
      if (seen && !h.includes("he expects")) {
        fail("lønkravet vises ikke efter modbud/ved forlængelse — ændring 3 er gået i stykker");
      }
    }
    switch (md.type) {

      case "prematch":
        if (hasFn("prematchBack") && chance(0.15)) { H.call("prematchBack"); break; }
        H.call("choosePrematch", pick(Object.keys(H.consts.APPROACHES)));
        break;

      case "ticker":
        driveTicker();
        break;

      case "quickOffer":
        if (chance(0.5)) H.G.quickMode = true;
        H.modal = null;
        H.call("afterMatchday");
        break;

      case "interstitial":
      case "info":
        H.modal = null;
        H.call("render");
        break;

      case "rewarded":
        if (chance(0.8)) H.call("grantReward", md.reward);
        else { H.modal = null; H.call("render"); }
        break;

      case "seasonDone":
        stats.seasonEnd.push({
          season: md.pos !== undefined ? H.G.season - 1 : H.G.season,
          pos: md.pos, promoted: !!md.promoted, div: H.G.div,
          balance: H.G.balance, capacity: H.G.capacity,
          stands: { ...H.G.stands }, squad: H.G.squad.length,
          wages: H.G.squad.reduce((s, p) => s + p.wage, 0),
          fund: Math.round(H.G.fund), mood: Math.round(H.G.fanMood),
          myShare: H.G.myShare, build: stats.build,
          value: H.call("clubValuation"), trust: Math.round(H.G.trust)   // pakke 4
        });
        H.modal = null;
        H.call("openBudgetMeeting");
        break;

      case "budget": {
        if (md.tixPrice !== undefined && chance(0.5)) {
          md.tixPrice = Math.max(60, md.tixPrice + (chance(0.5) ? -10 : 20));
        }
        if (!md.jersey) md.jersey = pick(["classic", "modern", "wild"]);
        if (!md.target) {
          const keys = Object.keys(H.consts.STANDS).filter(k => H.G.stands[k] < 2);
          if (keys.length && chance(0.75)) md.target = pick(keys);
        }
        if (md.fundAdd !== undefined && chance(0.6)) {
          md.fundAdd = Math.min(Math.max(0, H.G.balance), Math.floor(rnd() * 7) * 10000);
        }
        if (hasFn("askCapRaise") && !H.G.capRaiseUsed && chance(0.6)) { H.call("askCapRaise"); break; }
        if (hasFn("budgetNext")) { H.call("budgetNext"); break; }
        // Ændring 1 lovede at live-estimatet og det faktiske salg deler formel.
        const predicted = H.call("seasonTixEstimate", md.tixPrice).sold;
        H.call("budgetConfirm");
        if (H.G.seasonTix.sold !== predicted) {
          fail("budgetguidens live-estimat (" + predicted + " sæsonkort) matcher ikke det faktiske salg (" +
            H.G.seasonTix.sold + ") — formlerne er skredet fra hinanden");
        }
        break;
      }

      case "midway":
        if (md.fundAdd !== undefined && chance(0.5)) {
          md.fundAdd = Math.min(Math.max(0, H.G.balance), Math.floor(rnd() * 5) * 10000);
        }
        if (hasFn("askCapRaise") && !H.G.capRaiseUsed && chance(0.5)) { H.call("askCapRaise"); break; }
        H.call("midwayConfirm");
        break;

      case "bank":
        if (md.canLoan && chance(0.6)) H.call("resolveBank", false);
        else if (md.canSell) H.call("resolveBank", true);
        else H.call("resolveBank", false);
        break;

      case "deadline":
        if (!md.done.buy && chance(0.5) && H.G.balance > md.bargain.value + 40000) H.call("dlBuy");
        else if (!md.done.sell && chance(0.3)) H.call("dlSell");
        else { H.modal = null; H.call("playMatchday"); }
        break;

      case "nego": {
        const n = H.nego;
        if (!n) { H.modal = null; H.call("render"); break; }
        n.__tries = (n.__tries || 0) + 1;
        if (n.__tries > 16) { H.call("negoAbort"); break; }
        if (n.doneDeal || n.dead) {
          const plan = n.payPlan || 1, cl = n.clause, paid = n.doneDeal && n.agreedFee && !n.freeAgent;
          const before = H.G.commitments.length;
          H.call("negoFinish");
          if (H.G.commitments.length > before) {
            if (plan > 1) stats.deals.inst++;
            if (cl === "promo") stats.deals.promo++;
            if (cl === "goals") stats.deals.goals++;
          } else if (paid && H.G.squad.some(p => p.id === n.p.id)) stats.deals.cash++;
          break;
        }
        if (n.stage === "fee") {
          n.fee = Math.max(1000, Math.round(n.p.value * (1.03 + 0.07 * n.round) / 1000) * 1000);
          if (H.G.balance < n.fee + 15000) { H.call("negoAbort"); break; }
          H.call("negoSubmit", n.round >= 2);
        } else {
          /* Pakke 3: strukturen vaelges i samme ark som vilkaarene. En spiller
             der ikke har kontanterne straekker handlen -- det er hele pointen
             med rater ("koeb stoerre end kassen"). */
          if (n.agreedFee && !n.freeAgent) {
            // GDD: "strukturer er vaerktoejer, ikke krav". En formand der HAR
            // pengene betaler kontant -- rater koster et tillaeg han saa slipper
            // for. Strukturen er den straekkede klubs redskab, ikke standarden.
            const stretched = H.G.balance < n.agreedFee * 1.6;
            n.payPlan = stretched ? pick([2, 3, 4]) : pick([1, 1, 1, 1, 2]);
            n.clause = stretched ? pick([null, "promo", "goals"]) : pick([null, null, null, "promo"]);
          }
          const o = Math.round((n.p.att + n.p.def + n.p.phy) / 3);
          n.years = pick([1, 2, 3, 4]);
          if (o >= 48 || n.__tries >= 4) n.role = "key";
          else if (n.p.age < 24 && chance(0.4)) n.role = "pro";
          else n.role = "rot";
          n.wageOffer = Math.max(100, Math.round(n.p.wage * (1.02 + 0.13 * n.cround) / 100) * 100);
          const wagesNow = H.G.squad.reduce((s, p) => s + p.wage, 0);
          if (H.G.myShare < 100 && wagesNow + n.wageOffer > H.G.wageCap) {
            H.call("negoAbort"); break;
          }
          H.call("negoSubmit", n.cround >= 2);
        }
        break;
      }

      case "formalBid":
        H.call("sendFormalBid");
        break;

      case "sellChoice":
        if (chance(0.6)) H.call("quickRing", md.pid);
        else H.call("listPlayer", md.pid);
        break;

      case "sell": {
        const live = md.buyers.map((b, i) => ({ b, i })).filter(x => !x.b.gone);
        if (!live.length) { H.modal = null; H.call("render"); break; }
        live.sort((a, b) => b.b.bid - a.b.bid);
        const best = live[0];
        if (!best.b.pushed && chance(0.4)) H.call("sellPush", best.i);
        else H.call("sellAccept", best.i);
        break;
      }

      case "ownerNego": {
        md.__t = (md.__t || 0) + 1;
        if (md.__t > 6) { H.modal = null; H.call("render"); break; }
        md.offer = Math.round((md.ask || md.offer) * 1.02 / 1000) * 1000;
        // gaa hjem hvis handlen ville aede driftskapitalen -- ikke bare hvis den ville toemme kontoen
        if (H.G.balance - md.offer < workingCapital()) { H.modal = null; H.call("render"); break; }
        H.call("ownerNegoSubmit");
        break;
      }

      case "facConfirm":
        H.call("facConfirm");
        break;

      case "chat":
        H.call("doChat", pick(["praise", "hairdryer", "promise"]));
        break;

      case "player": {
        const acts = [];
        if (hasFn("setFocus")) acts.push(() => H.call("setFocus", md.pid, pick(["att", "def", "phy"])));
        if (hasFn("openChat")) acts.push(() => H.call("openChat", md.pid));
        if (hasFn("openSellSheet")) acts.push(() => H.call("openSellSheet", md.pid));
        if (hasFn("startRenewal")) acts.push(() => H.call("startRenewal", md.pid));
        if (hasFn("setMentor")) acts.push(() => H.call("setMentor", md.pid));
        if (hasFn("suggestCaptain") && !H.G.captSuggested) acts.push(() => H.call("suggestCaptain", md.pid));
        if (acts.length && chance(0.7)) pick(acts)();
        else { H.modal = null; H.call("render"); }
        break;
      }

      case "sponsorOffer":
        if (hasFn("sponsorPick") && chance(0.8)) H.call("sponsorPick", chance(0.5) ? 0 : 1);
        else if (hasFn("sponsorLater")) H.call("sponsorLater");
        else { H.modal = null; H.call("afterMatchday"); }
        break;

      default:
        fail("UNKNOWN MODAL TYPE: '" + md.type + "' — tilføj den i harness'ens handleModal-switch");
    }
  }

  /* ---------------- hovedløkke ---------------- */
  const targetSeason = H.G.season + SEASONS;
  let prevModal = null, sameModal = 0;

  while (H.G.season < targetSeason) {
    tick();
    checkInvariants();

    if (H.modal) {
      if (H.modal === prevModal) {
        if (++sameModal > 90) fail("modal '" + H.modal.type + "' hænger fast (90 forsøg)");
      } else { prevModal = H.modal; sameModal = 0; }
      handleModal();
      continue;
    }
    prevModal = null; sameModal = 0;

    checkFixtureIntegrity();
    checkInboxActionable();
    checkNoOrphanBids();
    where = "idle S" + H.G.season + " MD" + H.G.md;
    botIdle();
    if (H.modal) continue;

    where = "advance S" + H.G.season + " MD" + H.G.md + " phase=" + H.G.phase;
    if (H.G.phase === "season" && H.G.md < H.G.rounds) H.call("playMatchday");
    else if (H.G.phase === "playoff_semi" || H.G.phase === "playoff_final") H.call("playPlayoff");
    else if (H.G.phase === "season" && H.G.md >= H.G.rounds) H.call("afterMatchday");
    else fail("botten er gået i stå: phase=" + H.G.phase + " md=" + H.G.md);
  }

  where = "slut";
  /* Øjebliksbillede FØR de tvungne scenarier. checkPromotionWithoutSponsor()
     spiller en ekstra sæson færdig og ville ellers snige et falsk mesterskab
     ind i fremdriftstallene og forvride slutkassen. */
  stats.final = {
    balance: H.G.balance, capacity: H.G.capacity, div: H.G.div,
    season: H.G.season, divName: H.G.divNames[H.G.div], seasons: H.G.history.length,
    /* Administrationer taelles nu fra spillets EGEN tilstand. Wrapperen om
       ctx.administration ser kun kald der gaar gennem globalThis, dvs. kun dem
       harness'en selv laver -- spillets interne kald (resolveBank ->
       administration) blev aldrig talt med, saa tallet har altid vaeret for
       lavt. Snapshottet tages her, FOER de tvungne scenarier. */
    admins: H.G.admins || 0
  };
  /* Pakke 5's frekvenskrav er 3-5 pr. saeson af 26. Et haardt krav PR. SAESON
     ville vaere forkert: en klub der ender 14. med alt afgjort og uden en
     oedelaeggende nederlag i efteraaret SKAL kunne have en saeson uden en
     eneste stor kamp. Baandet her er derfor det absurde: nul over hele
     karrieren betyder at mekanikken er doed igen, og over 30% betyder at
     ingen af dem er store. Det maalte tal staar i --stats og er beviset. */
  {
    const league = stats.md.length, bigs = stats.md.filter(e => e.big).length;
    if (league >= 26) {
      if (bigs === 0) fail("ingen af " + league + " ligakampe var stor -- 'big' er doed kode igen");
      if (bigs / league > 0.30) fail("for mange store kampe: " + bigs + " af " + league +
        " (" + Math.round(bigs / league * 100) + "%) -- bliver hver anden kamp stor, er ingen af dem det");
    }
  }
  renderAllScreens();
  checkInvariants();
  checkAllMessageKinds();
  checkDealStructures();
  checkProtestLadder();
  checkSaveLoad();
  checkPriceCurves();
  checkGroundStates();
  checkValuationDirection();
  checkBigGate();
  checkBigSources();
  checkTextLibrary();
  checkOwnerBuyout();
  checkBankCascade();
  checkPromotionWithoutSponsor();   // sidst: den rykker sæsonen frem

  return { seed, stats, G: H.G, steps, consts: H.consts };
}

/* ---------------- rapport ---------------- */
function fmtGbp(n) {
  const s = Math.abs(Math.round(n)).toLocaleString("en-GB");
  return (n < 0 ? "-£" : "£") + s;
}

function report(runs) {
  console.log("\n─── ØKONOMI (gennemsnit over " + runs.length + " seed" + (runs.length > 1 ? "s" : "") + ") ───");
  const bySeason = new Map();
  for (const r of runs) {
    for (const e of r.stats.md) {
      if (!bySeason.has(e.season)) bySeason.set(e.season, { home: [], away: [] });
      bySeason.get(e.season)[e.home ? "home" : "away"].push(e);
    }
  }
  const seasons = [...bySeason.keys()].sort((a, b) => a - b);
  console.log("sæson  hjemmekampe: netto/kamp   gate/kamp   |  udekampe: netto/kamp  |  løn/uge");
  for (const s of seasons) {
    const d = bySeason.get(s);
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const hn = avg(d.home.map(e => e.net));
    const hg = avg(d.home.map(e => e.gate));
    const an = avg(d.away.map(e => e.net));
    const w = avg(d.home.concat(d.away).map(e => e.wages));
    console.log("  " + String(s).padEnd(5) +
      String(fmtGbp(hn)).padStart(14) + String(fmtGbp(hg)).padStart(12) +
      "   |" + String(fmtGbp(an)).padStart(19) + "  |" + String(fmtGbp(w)).padStart(10));
  }

  console.log("\n─── SÆSONSLUT PR. SEED ───");
  for (const r of runs) {
    const rows = r.stats.seasonEnd;
    const line = rows.map(e =>
      "S" + e.season + ": " + fmtGbp(e.balance) + " · " + e.pos + "." + (e.promoted ? "↑" : "") +
      " · kap " + e.capacity + " · trup " + e.squad + " · andel " + e.myShare + "%"
    ).join("\n           ");
    console.log("  seed " + String(r.seed).padEnd(4) + " " + (line || "(ingen sæsonskift)"));
  }

  const finals = runs.map(r => r.stats.final.balance);
  const caps = runs.map(r => r.stats.final.capacity);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  console.log("\n  Slutkasse: min " + fmtGbp(Math.min(...finals)) +
    " · snit " + fmtGbp(avg(finals)) + " · max " + fmtGbp(Math.max(...finals)));
  console.log("  Slutkapacitet: min " + Math.min(...caps) + " · snit " + Math.round(avg(caps)) + " · max " + Math.max(...caps));

  /* ── Mads' to måltal for matchday-økonomien (ændring 6) ── */
  const perSeason = new Map();     // sæson → [netto pr. kampdag]
  const save = new Map();          // sæson → [opsparing]
  let built = 0, bank = 0, admin = 0;
  for (const r of runs) {
    for (const e of r.stats.md) {
      if (!perSeason.has(e.season)) perSeason.set(e.season, []);
      perSeason.get(e.season).push(e.net);
    }
    let prev = r.stats.startBalance, prevBuild = 0;
    r.stats.seasonEnd.forEach(e => {
      if (!save.has(e.season)) save.set(e.season, []);
      // indtjeningsevne = hvad kassen ændrede sig + hvad der blev bygget for
      save.get(e.season).push((e.balance - prev) + (e.build - prevBuild));
      prev = e.balance; prevBuild = e.build;
    });
    if (r.stats.final.capacity > 1500) built++;
    bank += r.stats.bank; admin += (r.stats.final.admins || 0);
  }
  const verdict = ok => ok ? "OK" : "UDENFOR";
  console.log("\n─── MÅLTAL (ændring 6) ───");
  console.log("  netto pr. kampdag (hjem+ude), pr. sæson — mål ±£2k tidligt:");
  for (const s of [...perSeason.keys()].sort((a, b) => a - b)) {
    const v = avg(perSeason.get(s));
    console.log("      sæson " + s + " : " + fmtGbp(v).padStart(9) + (s === 1 ? "   ← 'tidlig'  " + verdict(Math.abs(v) <= 2000) : ""));
  }
  console.log("  indtjening pr. sæson (balanceændring + byggeforbrug) — mål ~£70k (= én tribune):");
  for (const s of [...save.keys()].sort((a, b) => a - b)) {
    const v = avg(save.get(s));
    console.log("      sæson " + s + " : " + fmtGbp(v).padStart(9) +
      (s === 1 ? "   ← 1-3 tribuner værd  " + verdict(v > 60000 && v < 260000) : ""));
  }
  console.log("  tribune bygget undervejs      : " + built + " af " + runs.length + " seeds");
  console.log("  bank-ultimatum " + bank + " · administration " + admin + " (0 = ingen gik konkurs)");

  /* ── Pakke 1: trupdybde og friskhed ──
     Truppen stod på PRÆCIS 13 i 40 af 40 sæsonafslutninger: dybde var ren
     lønudgift. Stiger tallet her, virker pakken; gør det ikke, gør den ikke. */
  const depth = new Map();         // sæson → [trupstørrelse pr. kampdag]
  const endSquad = new Map();      // sæson → [trupstørrelse ved sæsonslut]
  let mdTotal = 0, mdThin = 0;
  for (const r of runs) {
    for (const e of r.stats.md) {
      if (e.squad === undefined) continue;
      if (!depth.has(e.season)) depth.set(e.season, []);
      depth.get(e.season).push(e.squad);
      mdTotal++; if (e.fresh < 11) mdThin++;
    }
    for (const e of r.stats.seasonEnd) {
      if (!endSquad.has(e.season)) endSquad.set(e.season, []);
      endSquad.get(e.season).push(e.squad);
    }
  }
  if (mdTotal) {
    console.log("\n─── TRUPDYBDE OG FRISKHED (pakke 1) ───");
    console.log("  sæson   trup ved sæsonslut   trup pr. kampdag   (mål: sæsonslut OVER 13)");
    const allEnd = [];
    for (const s of [...endSquad.keys()].sort((a, b) => a - b)) {
      const es = endSquad.get(s); allEnd.push(...es);
      const d = depth.get(s) || [];
      console.log("    " + String(s).padEnd(6) + avg(es).toFixed(2).padStart(14) +
        String(d.length ? avg(d).toFixed(2) : "–").padStart(19));
    }
    const m = avg(allEnd);
    console.log("  gennemsnit ved sæsonslut: " + m.toFixed(2) + " spillere   " + verdict(m > 13));
    console.log("  kampdage med under 11 friske: " + Math.round(100 * mdThin / mdTotal) + "% (" + mdThin + " af " + mdTotal + ")");
  }

  /* ── Pakke 4: klubværdi og ejerandele ── */
  {
    const val = new Map(), tr = new Map();
    for (const r of runs) for (const e of r.stats.seasonEnd) {
      if (e.value === undefined) continue;
      if (!val.has(e.season)) { val.set(e.season, []); tr.set(e.season, []); }
      val.get(e.season).push(e.value); tr.get(e.season).push(e.trust);
    }
    if (val.size) {
      console.log("\n─── KLUBVÆRDI (pakke 4) ───");
      console.log("  sæson   gns. klubværdi   spænd (min–max)        bestyrelsens tillid");
      for (const s of [...val.keys()].sort((a, b) => a - b)) {
        const a = val.get(s);
        console.log("    " + String(s).padEnd(6) + fmtGbp(avg(a)).padStart(14) +
          ("  " + fmtGbp(Math.min(...a)) + " – " + fmtGbp(Math.max(...a))).padEnd(26) +
          Math.round(avg(tr.get(s))) + "%");
      }
      // faldt vaerdien nogensinde? det er hele forskellen fra den gamle formel
      let drops = 0, pairs = 0;
      for (const r of runs) {
        const rows = r.stats.seasonEnd.filter(e => e.value !== undefined);
        for (let i = 1; i < rows.length; i++) { pairs++; if (rows[i].value < rows[i - 1].value) drops++; }
      }
      console.log("  sæsoner hvor værdien FALDT: " + drops + " af " + pairs +
        " (den gamle formel kunne kun stige — " + verdict(drops > 0) + ")");
    }
  }

  /* ── Pakke 3: ratebetaling og bonusklausuler ── */
  {
    const d = { cash: 0, inst: 0, promo: 0, goals: 0 };
    for (const r of runs) for (const k of Object.keys(d)) d[k] += (r.stats.deals ? r.stats.deals[k] : 0);
    const bought = d.cash + d.inst;
    if (bought) {
      console.log("\n─── HANDELSSTRUKTURER (pakke 3) ───");
      console.log("  køb med fee: " + bought + " · kontant " + d.cash +
        " · rater " + d.inst + " (" + Math.round(100 * d.inst / bought) + "%)");
      console.log("  klausuler: oprykning " + d.promo + " · pr. mål " + d.goals);
    }
  }

  /* ── Pakke 5: store kampe ── */
  {
    const perSeason = new Map(); let bigs = 0, tot = 0;
    let bigGate = 0, bigN = 0, plainGate = 0, plainN = 0;
    for (const r of runs) for (const e of r.stats.md) {
      if (e.big === undefined) continue;
      tot++;
      const k = r.seed + "/" + e.season;
      perSeason.set(k, (perSeason.get(k) || 0) + (e.big ? 1 : 0));
      if (e.big) bigs++;
      if (e.home) { if (e.big) { bigGate += e.gate; bigN++; } else { plainGate += e.gate; plainN++; } }
    }
    if (tot) {
      const counts = [...perSeason.values()];
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const zero = counts.filter(c => c === 0).length;
      console.log("\n─── STORE KAMPE (pakke 5) ───");
      console.log("  store kampe pr. sæson: " + avg.toFixed(1) + " af 26 (mål 3-5) " +
        verdict(avg >= 3 && avg <= 5));
      console.log("  spænd " + Math.min(...counts) + "–" + Math.max(...counts) +
        " · sæsoner uden en enkelt stor kamp: " + zero + " af " + counts.length +
        " · andel af alle kampdage " + Math.round(1000 * bigs / tot) / 10 + "%");
      if (bigN && plainN) console.log("  gns. hjemme-gate: stor kamp " + fmtGbp(bigGate / bigN) +
        " · almindelig " + fmtGbp(plainGate / plainN) +
        " (+" + Math.round(100 * (bigGate / bigN / (plainGate / plainN) - 1)) + "%)");
      /* Hvilken af de fire regler leverer? En kilde der aldrig fyrer er doed
         kode, som er praecis den fejlklasse pakke 5 selv retter. */
      const why = new Map();
      for (const r of runs) for (const e of r.stats.md)
        if (e.bigWhy) {
          const k = e.bigWhy.indexOf("FINAL DAY") === 0 ? "sidste spilledag"
            : e.bigWhy.indexOf("TOP OF") === 0 ? "nr. 1 mod nr. 2"
            : e.bigWhy.indexOf("SIX-POINTER") === 0 ? "sekser (naboen)"
            : e.bigWhy.indexOf("THE RETURN") === 0 ? "returopgoer" : e.bigWhy;
          why.set(k, (why.get(k) || 0) + 1);
        }
      console.log("  kilder: " + ["sidste spilledag", "nr. 1 mod nr. 2", "sekser (naboen)", "returopgoer"]
        .map(k => k + " " + (why.get(k) || 0)).join(" · "));
    }
  }

  /* ── Pakke 6: tekstbiblioteket ── */
  {
    const C = runs[0].consts;
    if (C && C.POOLS) {
      const names = Object.keys(C.POOLS);
      let tot = 0;
      console.log("\n─── TEKSTBIBLIOTEKET (pakke 6) ───");
      console.log("  " + names.map(k => {
        const n = C.POOLS[k].length; tot += n;
        const tagged = C.POOLS[k].filter(e => typeof e !== "string").length;
        return k + " " + n + " (" + tagged + " taggede)";
      }).join(" · "));
      console.log("  ticker- og nyhedslinjer i alt: " + tot +
        " · sponsorer " + C.SPONSORS.length + " · traenere " + C.COACHES.length);
      /* Et tag som ingen situation nogensinde producerer goer hver linje med
         det tag til doed tekst. Rapport, ikke fejl: en karriere paa 10 seeds
         behoever ikke ramme hver kombination. */
      const seen = new Set();
      for (const r of runs) if (r.stats.tagsSeen) for (const t of r.stats.tagsSeen) seen.add(t);
      const never = C.LINE_TAGS.filter(t => !seen.has(t));
      console.log("  tags produceret i spil: " + seen.size + " af " + C.LINE_TAGS.length +
        (never.length ? " · ALDRIG set: " + never.join(", ") : " · ingen doede tags"));
    }
  }

  /* ── Pakke 2: protest-trappen ── */
  {
    const rung = [0, 0, 0, 0]; let tot = 0, moodSum = 0;
    for (const r of runs) for (const e of r.stats.md) {
      if (e.protest === undefined) continue;
      rung[e.protest]++; tot++; moodSum += e.mood;
    }
    if (tot) {
      const names = ["ro", "bannere", "tavshed", "boykot"];
      console.log("\n─── PROTEST-TRAPPEN (pakke 2) ───");
      console.log("  gns. stemning " + Math.round(moodSum / tot) + " · kampdage pr. trin:");
      for (let i = 0; i < 4; i++) {
        console.log("    " + String(i + " " + names[i]).padEnd(12) +
          String(rung[i]).padStart(5) + "  " + (100 * rung[i] / tot).toFixed(1) + "%");
      }
    }
  }

  /* Sportslig fremdrift: er sværhedsgraden "gennembalanceret" (GDD)?
     Rykker alle op med det samme, er der ingen klatretur at fortælle om. */
  const byS = new Map();
  let promos = 0, titles = 0;
  for (const r of runs) {
    for (const h of r.G.history.slice(0, r.stats.final.seasons)) {
      if (!byS.has(h.season)) byS.set(h.season, []);
      byS.get(h.season).push(h);
      if (h.promoted) promos++;
    }
    titles += r.G.titles || 0;
  }
  console.log("\n─── SPORTSLIG FREMDRIFT ───");
  for (const s of [...byS.keys()].sort((a, b) => a - b)) {
    const rows = byS.get(s), up = rows.filter(h => h.promoted).length;
    console.log("  sæson " + s + ": gns. placering " + (avg(rows.map(h => h.pos))).toFixed(1) +
      " · oprykning " + up + "/" + rows.length);
  }
  console.log("  oprykninger i alt " + promos + " · mesterskaber i øverste række " + titles);
}

/* ---------------- main ---------------- */
console.log("test-harness · " + path.basename(HTML_FILE) + " · " + SEEDS + " seed(s) × " + SEASONS + " sæson(er)");
console.log("syntaks: OK (udtrukket til " + path.basename(EXTRACT_TO) + ")");

const runs = [];
let failed = 0;
for (let i = 0; i < SEEDS; i++) {
  const seed = 1000 + i * 7919;
  const t0 = Date.now();
  try {
    const r = runSeed(seed);
    runs.push(r);
    console.log("  seed " + String(seed).padEnd(6) + " OK   S" + r.stats.final.season + " · " + r.stats.final.divName +
      " · kasse " + fmtGbp(r.stats.final.balance) + " · " + r.steps + " steps · " + (Date.now() - t0) + "ms");
  } catch (e) {
    failed++;
    console.error("  seed " + String(seed).padEnd(6) + " FEJL");
    console.error("    " + e.message);
    if (e.stack && !/^\[seed/.test(e.message)) {
      console.error(e.stack.split("\n").slice(1, 6).join("\n"));
    }
  }
}

if (SHOW_STATS && runs.length) report(runs);

if (failed) {
  console.error("\nREGRESSION_FAILED — " + failed + " af " + SEEDS + " seeds fejlede");
  process.exit(1);
}
console.log("\nREGRESSION_OK");
