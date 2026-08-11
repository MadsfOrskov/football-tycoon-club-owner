#!/usr/bin/env node
/* =====================================================================
   qa-probes.js — UAFHAENGIGE QA-SONDER for FOOTBALL TYCOON: CLUB OWNER
   ---------------------------------------------------------------------
   Skrevet af testagenten natten 7/8 2026. Roerer IKKE test-harness.js og
   IKKE prototypen. Egen sandkasse, egen bot, egne invarianter -- saa de to
   saet kan sammenlignes, og en blind plet i det ene kan ses i det andet.

   Den vigtigste forskel til test-harness.js:
     · harness'ens bot har en HAANDSKREVET switch over modaltyper og en
       politik (sane/lazy). Den naar derfor kun de valg politikken traeffer.
     · qa-probes' bot er en NYSGERRIG KLIKKER: den parser den renderede
       markup, finder hver onclick-udtryk og udfoerer et af dem. Den kan
       derfor naa knapper ingen politik ville trykke paa -- og det er
       praecis dem der er mistaenkte for at vaere doede.

   Brug:
     node qa-probes.js census   --seeds=200 --seasons=20
     node qa-probes.js scale    --seeds=200 --seasons=20
     node qa-probes.js deadends
     node qa-probes.js promises
     node qa-probes.js balance  --seeds=60 --seasons=20
     node qa-probes.js bigstat  --seeds=10 --seasons=5
     node qa-probes.js all

   Flag:
     --seeds=N --seasons=N --file=... --seed0=N --quiet
     --driver=clicker|policy   (clicker = nysgerrig, policy = maalrettet)
     --json=fil.json           (dump raa tal, saa rapporten kan efterproeves)
===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* ---------------- args ---------------- */
const argv = process.argv.slice(2);
const MODE = (argv.find(a => !a.startsWith("--")) || "all").toLowerCase();
const arg = (k, d) => {
  const hit = argv.find(a => a.startsWith("--" + k + "="));
  return hit ? hit.split("=").slice(1).join("=") : d;
};
const flag = k => argv.includes("--" + k);
const HTML_FILE = path.resolve(arg("file", "football-tycoon-club-owner-prototype.html"));
const SEEDS = parseInt(arg("seeds", "50"), 10);
const SEASONS = parseInt(arg("seasons", "20"), 10);
const SEED0 = parseInt(arg("seed0", "1000"), 10);
const SEED_STEP = parseInt(arg("step", "7919"), 10);
const DRIVER = arg("driver", "clicker");
const QUIET = flag("quiet");
const JSON_OUT = arg("json", "");

const SRC = (() => {
  if (!fs.existsSync(HTML_FILE)) { console.error("FEJL: kan ikke finde " + HTML_FILE); process.exit(2); }
  const m = fs.readFileSync(HTML_FILE, "utf8").match(/<script>([\s\S]*?)<\/script>/);
  if (!m) { console.error("FEJL: ingen <script>-blok"); process.exit(2); }
  return m[1];
})();

/* ---------------- seeded RNG (samme familie som harness'en, saa seeds kan
   sammenlignes paa tvaers af de to vaerktoejer) ---------------- */
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
const seedAt = i => SEED0 + i * SEED_STEP;

/* ---------------- min egen DOM-stub ---------------- */
function makeSandbox() {
  const els = new Map();
  const lastHtml = { v: "" };
  function el(id) {
    if (els.has(id)) return els.get(id);
    const e = {
      id, _html: "", value: "", textContent: "",
      style: { setProperty(k, v) { this[k] = v; }, getPropertyValue(k) { return this[k]; }, removeProperty(k) { delete this[k]; } },
      classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); }, toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } },
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = String(v); if (this.id === "app") lastHtml.v = this._html; },
      insertAdjacentHTML(p, h) { this._html += String(h); },
      appendChild() { }, removeChild() { }, remove() { },
      addEventListener() { }, removeEventListener() { },
      setAttribute() { }, getAttribute() { return null; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      focus() { }, blur() { }, click() { }
    };
    els.set(id, e); return e;
  }
  const timers = { list: [], next: 1 };
  const document = {
    documentElement: el("__html"), body: el("__body"),
    getElementById: id => el(id), createElement: () => el("__el" + els.size),
    addEventListener() { }, removeEventListener() { },
    querySelector() { return null; }, querySelectorAll() { return []; }
  };
  document.getElementById("obname").value = "Ashford Rovers";
  const sandbox = {
    document,
    console: { log() { }, warn() { }, error() { }, info() { } },
    setInterval(fn) { const id = timers.next++; timers.list.push({ id, fn }); return id; },
    clearInterval(id) { timers.list = timers.list.filter(t => t.id !== id); },
    setTimeout() { return 0; }, clearTimeout() { }, requestAnimationFrame() { return 0; },
    localStorage: (() => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), clear: () => m.clear(), get length() { return m.size; } }; })()
  };
  return { sandbox, timers, lastHtml };
}

/* Min egen bro. Bevidst en anden end harness'ens: jeg vil ogsaa kunne naa
   nego, tickTimer og de rene datakonstanter. */
const BRIDGE = `
;globalThis.__Q = {
  get G(){return G;}, set G(v){G=v;},
  get modal(){return modal;}, set modal(v){modal=v;},
  get nego(){return nego;}, set nego(v){nego=v;},
  get screen(){return screen;}, set screen(v){screen=v;},
  get obStep(){return obStep;},
  /* Konstanterne hentes DEFENSIVT. Master har omdoebt STANDCOST vaek i
     STADION-10, og en manglende konstant maa ikke goere hele sandkassen
     ubrugelig -- saa kunne sonden ikke laengere sammenligne to udgaver af
     spillet, hvilket er halvdelen af dens formaal. */
  get K(){ const g=n=>{try{return eval(n);}catch(e){return undefined;}};
    return {STANDS:g("STANDS"),STANDCOST:g("STANDCOST"),FACS:g("FACS"),FAC_DETAIL:g("FAC_DETAIL"),
      ROLES:g("ROLES"),APPROACHES:g("APPROACHES"),TRAITS:g("TRAITS"),COACHES:g("COACHES"),
      SPONSORS:g("SPONSORS"),BAL:g("BAL"),AGENTS:g("AGENTS"),
      POOLS:{GOALDESC:g("GOALDESC"),NEARMISS:g("NEARMISS"),FLAVOR:g("FLAVOR"),PENDESC:g("PENDESC"),
        OPPGOAL:g("OPPGOAL"),MOMENTUM:g("MOMENTUM"),GHOSTBITTER:g("GHOSTBITTER"),GHOSTWARM:g("GHOSTWARM")},
      GAFFERTALK:g("GAFFERTALK"),lineText:g("lineText")}; },
  call(n){ const f=globalThis[n]; if(typeof f!=="function") throw new Error("qa: ingen global '"+n+"'"); return f.apply(null,Array.prototype.slice.call(arguments,1)); }
};`;

/* ---------------- klikbare maal i renderet markup ---------------- */
function clickExprs(html) {
  const out = [];
  for (const m of html.matchAll(/onclick="([^"]*)"/g)) {
    const e = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    out.push(e);
  }
  return out;
}
function buttonRecords(html) {
  const out = [];
  for (const b of html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)) {
    const attrs = b[1];
    const label = b[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const t = /onclick="\s*([^"]*)"/.exec(attrs);
    out.push({ label, expr: t ? t[1] : "", disabled: /\bdisabled\b/.test(attrs) });
  }
  return out;
}

/* ---------------------------------------------------------------------
   NAT 7 · C1+C2: de to nye HELSIDER.
   Deadline day og tilbudssiden er ikke modaler -- de er skaerme. En driver
   der kun kender `modal` kan derfor ikke komme ud af dem, og playMatchday()
   returnerer uden at spille saa laenge G.dl staar aabent. Det er ikke en
   fejl i spillet (gaten er meningen), men det er en fejl i enhver test der
   ikke kender den -- og en side med kun EN vej ud vil vaere en blindgyde
   for en spiller ogsaa. Her drives siden som en modal, og HVER side der
   ikke havde et klikbart udtryk noteres som en blindgyde.
--------------------------------------------------------------------- */
const PAGE_SCREENS = ["deadline", "offer"];
function drivePageScreen(Q, B, pick, runExpr, out) {
  if (!PAGE_SCREENS.includes(Q.screen)) return false;
  const scr = Q.screen;
  if (out) { out.pageVisits = out.pageVisits || new Map(); out.pageVisits.set(scr, (out.pageVisits.get(scr) || 0) + 1); }
  Q.call("render");
  const html = B.lastHtml.v;
  const all = clickExprs(html).filter(e => e && !/^skipTicker/.test(e));
  if (!all.length) {
    /* Ingen vej ud af en side uden modal: det ER definitionen paa en
       blindgyde. Noteres, og skaermen tvinges for at kunne fortsaette. */
    if (out) { out.deadEnds = out.deadEnds || []; out.deadEnds.push({ screen: scr, season: Q.G.season, md: Q.G.md }); }
    if (scr === "deadline" && Q.G.dl) Q.G.dl = null;
    if (scr === "offer") Q.G.offerId = null;
    Q.screen = "club";
    return true;
  }
  /* Efter mange runder paa samme side: tag kun de udtryk der forlader den,
     saa en side med 8 aabne poster ikke aeder hele step-budgettet. */
  const nVisits = out && out.pageVisits ? out.pageVisits.get(scr) : 0;
  const exits = all.filter(e => /^(dlClose|closeOffer|offerDecide|go\()/.test(e.trim()));
  const pool = (nVisits % 40 === 39 && exits.length) ? exits : all;
  runExpr(pick(pool));
  return true;
}

/* =====================================================================
   BOOT — én karriere
===================================================================== */
/* En VARIANT af kildeteksten, sat udefra. Bruges til at koere PRAECIS samme
   seeds paa to udgaver af koden hvor kun én konstant er forskellig -- det er
   den eneste maade at attribuere en balanceaendring til ÉN aendring og ikke
   til de elleve andre der blev bygget samme nat. Naar den er null koeres
   branchens egen kode. */
let SRC_VARIANT = null;
function boot(seed) {
  const { sandbox, timers, lastHtml } = makeSandbox();
  const ctx = vm.createContext(sandbox);
  const rnd = mulberry32(seed);
  sandbox.__rnd = rnd;
  vm.runInContext("Math.random = __rnd;", ctx);
  vm.runInContext((SRC_VARIANT || SRC) + BRIDGE, ctx, { filename: "proto-qa.js" });
  return { ctx, Q: ctx.__Q, rnd, timers, lastHtml, sandbox };
}
/* B4's prisskala rullet tilbage: alle fire divisioner faar League Threes
   kolonne, altsaa praecis den skala der gjaldt FOER nat 7. Alt andet i
   koden er uroert. Fejler substitutionen, doer sonden hellere end at
   rapportere en maaling af den samme kode to gange. */
function srcWithFlatTicketScale() {
  const re = /(scale:\s*\{)([\s\S]*?)(\n\s*\}\s*\n\s*\},\s*\n\s*demand:)/;
  const m = re.exec(SRC);
  if (!m) { console.error("FEJL: fandt ikke BAL.ticket.scale — sonden kan ikke rulle B4 tilbage"); process.exit(3); }
  const flat = `
      min:      [ 5,  5,  5,  5],
      max:      [20, 20, 20, 20],
      sweet:    [10, 10, 10, 10],
      moodAbove:[16, 16, 16, 16],
      bigMax:   [ 8,  8,  8,  8]
    `;
  const out = SRC.replace(re, m[1] + flat + m[3]);
  if (out === SRC) { console.error("FEJL: substitutionen aendrede intet"); process.exit(3); }
  return out;
}

/* =====================================================================
   CENSUS — hvad udloeses faktisk, og hvor ofte
===================================================================== */
const CENSUS_FUNCS = [
  // spillerens egne handlinger
  "startScout", "deliverScout", "sponsorBoost", "buildBoost", "grantReward", "withdrawFund",
  "budgetBack", "askCapRaise", "openMidway", "midwayConfirm", "openBudgetMeeting",
  "buyOutOwner", "ownerNegoSubmit", "openChat", "doChat", "setMentor", "pickCaptain", "suggestCaptain",
  "setFocus", "listPlayer", "openSellSheet", "quickRing", "sellPush", "sellAccept", "executeSale",
  "startBuyNego", "startContractTalks", "startRenewal", "openFormalBid", "sendFormalBid",
  "negoSubmit", "negoFinish", "negoAbort", "negoCollapse", "roleRefused", "playerAmbitious",
  "playerRefusesSale", "startStandBuild", "finishStand", "buildFac", "facConfirm", "finishFac",
  "toggleMode", "skipTicker", "tickHT", "prematchBack", "sponsorPick", "sponsorLater",
  // spillets egne begivenheder
  "openBankUltimatum", "resolveBank", "administration", "openDeadline", "dlBuy", "dlSell",
  "playPlayoff", "startPostSeason", "applyRetirements", "applyMentors", "sponsorRenewal",
  "sponsorInbox", "sponsorLifeEvents", "sponsorSettleDemand", "bigGameBonus", "resolveBids",
  "refreshMarket", "expireMessages", "sweepPendingBids", "clearPendingBid", "bookkeeperReport",
  "settleCommitments", "recordDeal", "staleFundTarget", "handleAction", "delMsg", "loadGame", "deleteSave"
];

function censusCareer(seed, seasons, driver) {
  const B = boot(seed);
  const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
  const pick = a => a[Math.floor(rnd() * a.length)];

  const hit = new Map();            // funktion -> antal kald
  const bump = (k, n) => hit.set(k, (hit.get(k) || 0) + (n === undefined ? 1 : n));
  for (const f of CENSUS_FUNCS) {
    const orig = ctx[f];
    if (typeof orig !== "function") { hit.set(f, -1); continue; }  // -1 = findes ikke
    hit.set(f, 0);
    ctx[f] = function () { bump(f); return orig.apply(this, arguments); };
  }

  /* egne taellere, laest af spillets tilstand frem for af kald */
  const ev = {
    inboxKinds: new Map(), newsCats: new Map(), bigWhy: new Map(), protest: [0, 0, 0, 0],
    facs: new Map(), standLvl: new Map(), traitsSeen: new Map(), traitsInSquad: new Map(),
    dealCash: 0, dealInst: 0, clausePromo: 0, clauseGoals: 0, gems: 0,
    md: [], seasons: [], modals: new Map(), approaches: new Map(), htChoices: new Map(),
    errors: []
  };
  const origMsg = ctx.msg;
  ctx.msg = function (from, av, title, body, action) {
    if (action && action.kind) ev.inboxKinds.set(action.kind, (ev.inboxKinds.get(action.kind) || 0) + 1);
    return origMsg.apply(null, arguments);
  };
  const origNews = ctx.addNews;
  ctx.addNews = function (cat) { ev.newsCats.set(cat, (ev.newsCats.get(cat) || 0) + 1); return origNews.apply(null, arguments); };
  const origRec = ctx.recordDeal;
  const origChoose = ctx.choosePrematch;
  ctx.choosePrematch = function (k) { ev.approaches.set(k, (ev.approaches.get(k) || 0) + 1); return origChoose.apply(null, arguments); };
  const origHT = ctx.tickHT;
  ctx.tickHT = function (k) { ev.htChoices.set(String(k), (ev.htChoices.get(String(k)) || 0) + 1); return origHT.apply(null, arguments); };
  const origSettle = ctx.settleFinances;
  ctx.settleFinances = function (res) {
    const before = Q.G.balance;
    const out = origSettle.apply(null, arguments);
    const G = Q.G;
    ev.md.push({
      season: G.season, md: G.md, home: !!res.home, net: G.balance - before,
      gate: res.gate || 0, wages: res.wages || 0, att: res.att || 0, cap: G.capacity,
      squad: G.squad.length, protest: G.protest || 0, mood: Math.round(G.fanMood),
      big: !!res.big, why: res.big ? String(res.label || "?") : null,
      div: G.div, bal: G.balance
    });
    if (res.big) ev.bigWhy.set(String(res.label || "?"), (ev.bigWhy.get(String(res.label || "?")) || 0) + 1);
    ev.protest[Math.min(3, G.protest || 0)]++;
    return out;
  };
  const origFinish = ctx.finishSeason;
  ctx.finishSeason = function (r) {
    const G = Q.G;
    ev.seasons.push({
      season: G.season, div: G.div, balance: G.balance, cap: G.capacity,
      squad: G.squad.length, promoted: !!(r && r.promoted), value: safeCall(Q, "clubValuation"),
      built: Object.values(G.fac).filter(Boolean).length,
      standSum: Object.values(G.stands).reduce((a, b) => a + b, 0),
      owners: G.owners.length, share: G.myShare, loan: G.loan ? G.loan.left || G.loan.amount || 0 : 0,
      admins: G.admins || 0, mood: Math.round(G.fanMood)
    });
    return origFinish.apply(null, arguments);
  };

  /* --- drivning --- */
  let steps = 0;
  const STEP_MAX = 3000000;
  const die = m => { const e = new Error("[seed " + seed + " S" + (Q.G ? Q.G.season : "?") + " MD" + (Q.G ? Q.G.md : "?") + "] " + m); e.qa = true; throw e; };
  const tick = () => { if (++steps > STEP_MAX) die("step-budget opbrugt"); };

  /* onboarding */
  {
    let g = 0;
    while (!Q.G) {
      tick(); if (g++ > 80) die("onboarding haenger");
      const h = B.lastHtml.v;
      const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
      if (hues.length) Q.call("obHue", pick(hues));
      const modes = [...h.matchAll(/obMode\('(\w+)'\)/g)].map(x => x[1]);
      if (modes.length) Q.call("obMode", pick(modes));
      if (typeof ctx.obFinish === "function" && /obFinish\(\)/.test(h)) Q.call("obFinish");
      else Q.call("obNext");
    }
  }

  const runExpr = expr => {
    try { vm.runInContext(expr, ctx, { filename: "click.js" }); }
    catch (e) { ev.errors.push({ expr: expr.slice(0, 60), msg: String(e.message).slice(0, 120), season: Q.G && Q.G.season, md: Q.G && Q.G.md }); }
  };

  function driveTicker() {
    let g = 0;
    if (rnd() < 0.15) Q.call("skipTicker");
    while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
      tick(); if (g++ > 20000) die("ticker blev aldrig faerdig");
      if (B.timers.list.length) B.timers.list[0].fn();
      else if (Q.modal.ht) Q.call("tickHT", rnd() < 0.4 ? null : pick(["steady", "fury"]));
      else die("ticker gik i staa");
    }
    Q.call("closeTicker");
  }

  /* Nysgerrig klikker: render modalen, find alle onclick-udtryk, klik ét.
     Udtryk der lukker/afslutter faavoriseres let, saa vi ikke haenger. */
  const CLOSERS = /^(modal=null|budgetConfirm|midwayConfirm|negoAbort|negoFinish|closeTicker|facConfirm|sponsorPick|sponsorLater|resolveBank|choosePrematch|sellAccept|actMsg|playMatchday|playPlayoff|dlBuy|dlSell|sendFormalBid|ownerNegoSubmit|grantReward|budgetNext|obNext)/;
  function handleModal(sameCount) {
    const t = Q.modal.type;
    ev.modals.set(t, (ev.modals.get(t) || 0) + 1);
    if (t === "ticker") { driveTicker(); return; }
    Q.call("render");
    const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
    if (!all.length) { Q.modal = null; return; }
    // efter mange forsoeg paa samme modal: tag kun de udtryk der lukker den
    const closers = all.filter(e => CLOSERS.test(e.trim()));
    const pool = sameCount > 12 && closers.length ? closers : all;
    runExpr(pick(pool));
    if (Q.modal && Q.modal.type === "ticker") driveTicker();
  }

  /* Maalrettet politik (kontrolgruppe): svarer nogenlunde som harness'ens
     'sane'-bot, men er min egen -- brugt til at vise hvad DRIVEREN bidrager
     med, naar to koersler ellers er identiske. */
  function policyIdle() {
    const G = Q.G;
    if (rnd() < 0.35) Q.screen = pick(["home", "squad", "market", "club", "table", "inbox"]);
    Q.call("render");
    const live = G.inbox.filter(x => x.action && !x.done);
    if (live.length && rnd() < 0.6) {
      const m = pick(live);
      const k = m.action.kind;
      const c = { sellOffer: "reject", bidAccepted: "ok", bidCounter: "accept", bidWar: "raise", callback: "ok", transferReq: "no", stunt: "yes", sponsorChoice: "A" }[k];
      if (c) Q.call("actMsg", m.id, c);
      return;
    }
    if (G.squad.length < 16 && G.balance > 90000 && Q.call("windowOpen") && G.market.length && rnd() < 0.5) {
      Q.call("startBuyNego", Math.floor(rnd() * G.market.length), false);
      return;
    }
    if (!G.standBuild && rnd() < 0.12) {
      const keys = Object.keys(Q.K.STANDS).filter(k => G.stands[k] < 2);
      if (keys.length) Q.call("startStandBuild", pick(keys));
    }
  }

  function clickerIdle() {
    const G = Q.G;
    if (rnd() < 0.55) Q.screen = pick(["home", "squad", "market", "club", "table", "inbox"]);
    Q.call("render");
    const all = clickExprs(B.lastHtml.v);
    // klik-udtryk der starter en kampdag haandteres af hovedloekken
    const safe = all.filter(e => !/playMatchday|playPlayoff|afterMatchday/.test(e));
    if (safe.length && rnd() < 0.85) runExpr(pick(safe));
  }

  /* hovedloekke */
  let prev = null, same = 0, guard = 0;
  const target = Q.G.season + seasons;
  while (Q.G.season < target) {
    tick();
    if (guard++ > 400000) die("hovedloekke haenger");
    if (Q.modal) {
      if (Q.modal === prev) { if (++same > 120) die("modal '" + Q.modal.type + "' haenger fast"); }
      else { prev = Q.modal; same = 0; }
      handleModal(same);
      continue;
    }
    prev = null; same = 0;
    if (driver === "clicker") clickerIdle(); else policyIdle();
    if (Q.modal) continue;
    const G = Q.G;
    if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
    else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
    else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
    else die("gaaet i staa: phase=" + G.phase + " md=" + G.md);
  }

  /* slut-tilstand */
  const G = Q.G;
  for (const k of Object.keys(Q.K.FACS)) if (G.fac[k]) ev.facs.set(k, 1);
  for (const k of Object.keys(Q.K.STANDS)) ev.standLvl.set(k + ":" + G.stands[k], 1);
  for (const p of G.squad) for (const t of p.traits) ev.traitsInSquad.set(t, (ev.traitsInSquad.get(t) || 0) + 1);
  for (const p of G.squad) if (p.gem) ev.gems++;
  const d = G.dealLog || null;
  return { seed, hit, ev, G, steps, final: { balance: G.balance, div: G.div, season: G.season, cap: G.capacity, admins: G.admins || 0 } };
}
function safeCall(Q, n) { try { return Q.call(n); } catch (e) { return null; } }

/* =====================================================================
   INVARIANTER — mine egne, bevidst delvist overlappende med harness'ens
   saa forskellen kan ses
===================================================================== */
function invariants(Q, seed, note, out) {
  const G = Q.G; if (!G) return;
  const bad = m => out.push({ seed, note, msg: m, season: G.season, md: G.md });
  const num = (v, n) => { if (typeof v === "number" && !Number.isFinite(v)) bad(n + " er " + v); };
  num(G.balance, "G.balance"); num(G.capacity, "G.capacity"); num(G.fanMood, "G.fanMood");
  num(G.myShare, "G.myShare"); num(G.ticket, "G.ticket");
  const share = G.myShare + G.owners.reduce((a, o) => a + o.share, 0);
  if (Math.abs(share - 100) > 0.51) bad("ejerandele = " + share.toFixed(2) + "%");
  if (G.squad.length < 11) bad("trup under 11: " + G.squad.length);
  const ids = G.squad.map(p => p.id);
  if (new Set(ids).size !== ids.length) bad("dublet-id i truppen");
  for (const p of G.squad) { num(p.value, "spillerværdi"); num(p.wage, "løn"); if (p.years < 0) bad("negativ kontraktlængde"); }
  if (G.table) {
    const apps = new Map();
    for (const t of G.table) { num(t.pts, "point"); if (t.pts < 0) bad("negative point"); }
  }
  if (G.loan && G.loan.left < -1) bad("negativt laan tilbage: " + G.loan.left);
  if (G.md > G.rounds + 1) bad("md=" + G.md + " > rounds=" + G.rounds);
}

/* =====================================================================
   MODE: census
===================================================================== */
function modeCensus() {
  const runs = [];
  const t0 = Date.now();
  let crashed = [];
  for (let i = 0; i < SEEDS; i++) {
    const s = seedAt(i);
    try { runs.push(censusCareer(s, SEASONS, DRIVER)); }
    catch (e) { crashed.push({ seed: s, msg: e.message }); }
    if (!QUIET && (i + 1) % 25 === 0) process.stderr.write("  census " + (i + 1) + "/" + SEEDS + "\n");
  }
  const N = runs.length;
  console.log("\n══════════ SYSTEMBRUGS-AUDIT (qa-probes, driver=" + DRIVER + ") ══════════");
  console.log("  " + N + " karrierer à " + SEASONS + " saesoner · " + ((Date.now() - t0) / 1000).toFixed(0) + "s" +
    (crashed.length ? " · " + crashed.length + " NEDBRUD" : ""));
  if (crashed.length) for (const c of crashed.slice(0, 12)) console.log("    NEDBRUD seed " + c.seed + ": " + c.msg);

  const rows = [];
  for (const f of CENSUS_FUNCS) {
    const vals = runs.map(r => r.hit.get(f));
    if (vals[0] === -1) { rows.push({ f, pct: -1, tot: 0 }); continue; }
    const careers = vals.filter(v => v > 0).length;
    const tot = vals.reduce((a, b) => a + Math.max(0, b), 0);
    rows.push({ f, pct: 100 * careers / N, tot });
  }
  rows.sort((a, b) => a.pct - b.pct || a.tot - b.tot);
  console.log("\n  MEKANIK                     % af karrierer   kald i alt   pr. karriere");
  for (const r of rows) {
    const mark = r.pct < 0 ? " FINDES IKKE" : r.pct === 0 ? " ← ALDRIG" : r.pct < 1 ? " ← <1%" : r.pct < 10 ? " ← sjaelden" : "";
    console.log("  " + r.f.padEnd(26) + (r.pct < 0 ? "   —" : r.pct.toFixed(1).padStart(8) + "%") +
      String(r.tot).padStart(13) + (r.tot / N).toFixed(1).padStart(15) + mark);
  }

  const agg = (get) => {
    const m = new Map();
    for (const r of runs) for (const [k, v] of get(r)) m.set(k, (m.get(k) || 0) + v);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const careersWith = (get, key) => runs.filter(r => (get(r).get ? get(r).get(key) : 0) > 0).length;

  console.log("\n  ── INDBAKKE-BESKEDER (action.kind) ──");
  for (const [k, v] of agg(r => r.ev.inboxKinds)) {
    const c = runs.filter(r => (r.ev.inboxKinds.get(k) || 0) > 0).length;
    console.log("    " + k.padEnd(16) + String(v).padStart(7) + "   i " + (100 * c / N).toFixed(1) + "% af karrierer");
  }
  console.log("\n  ── NYHEDSKATEGORIER ──");
  for (const [k, v] of agg(r => r.ev.newsCats)) console.log("    " + String(k).padEnd(16) + String(v).padStart(7));
  console.log("\n  ── STORE KAMPE, KILDE ──");
  for (const [k, v] of agg(r => r.ev.bigWhy)) console.log("    " + k.padEnd(26) + String(v).padStart(7));
  console.log("\n  ── PREMATCH-TILGANG (botvalg) ──");
  for (const [k, v] of agg(r => r.ev.approaches)) console.log("    " + k.padEnd(16) + String(v).padStart(7));
  console.log("  ── PAUSETALE ──");
  for (const [k, v] of agg(r => r.ev.htChoices)) console.log("    " + k.padEnd(16) + String(v).padStart(7));
  console.log("\n  ── MODALER SET ──");
  for (const [k, v] of agg(r => r.ev.modals)) console.log("    " + k.padEnd(16) + String(v).padStart(7) + "   i " +
    (100 * runs.filter(r => (r.ev.modals.get(k) || 0) > 0).length / N).toFixed(1) + "%");

  console.log("\n  ── FACILITETER BYGGET (ved karrierens slut) ──");
  {
    const K = runs.length ? Object.keys(runs[0].G.fac) : [];
    for (const k of K) {
      const c = runs.filter(r => r.G.fac[k]).length;
      console.log("    " + k.padEnd(16) + (100 * c / N).toFixed(1).padStart(6) + "% af karrierer" + (c / N < 0.01 ? "  ← <1%" : ""));
    }
  }
  console.log("\n  ── TRIBUNENIVEAU NAAET (ved karrierens slut) ──");
  {
    const K = runs.length ? Object.keys(runs[0].G.stands) : [];
    for (const k of K) for (const lvl of [1, 2]) {
      const c = runs.filter(r => r.G.stands[k] >= lvl).length;
      console.log("    " + (k + " lvl" + lvl).padEnd(16) + (100 * c / N).toFixed(1).padStart(6) + "%" + (c / N < 0.01 ? "  ← <1%" : ""));
    }
  }
  console.log("\n  ── PROTESTTRIN (andel af kampdage) ──");
  {
    const tot = runs.reduce((a, r) => a + r.ev.protest.reduce((x, y) => x + y, 0), 0);
    const lab = ["ro", "bannere", "tavshed", "boykot"];
    for (let i = 0; i < 4; i++) {
      const v = runs.reduce((a, r) => a + r.ev.protest[i], 0);
      const c = runs.filter(r => r.ev.protest[i] > 0).length;
      console.log("    " + lab[i].padEnd(10) + (100 * v / tot).toFixed(1).padStart(6) + "%   naaet i " + (100 * c / N).toFixed(1) + "% af karrierer");
    }
  }
  console.log("\n  ── TRAITS I TRUPPEN VED SLUT ──");
  {
    const T = runs.length ? Object.keys(runs[0].G.squad[0] ? runs[0].hit && {} : {}) : {};
    const m = new Map();
    for (const r of runs) for (const [k, v] of r.ev.traitsInSquad) m.set(k, (m.get(k) || 0) + v);
    for (const [k, v] of [...m.entries()].sort((a, b) => b[1] - a[1])) console.log("    " + k.padEnd(14) + String(v).padStart(6));
  }
  if (runs.some(r => r.ev.errors.length)) {
    console.log("\n  ── FEJL KASTET AF EN KNAP (onclick-udtryk der kastede) ──");
    const m = new Map();
    for (const r of runs) for (const e of r.ev.errors) {
      const k = e.expr.split("(")[0] + " → " + e.msg;
      if (!m.has(k)) m.set(k, { n: 0, seed: r.seed, season: e.season, md: e.md });
      m.get(k).n++;
    }
    for (const [k, v] of [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25))
      console.log("    " + String(v.n).padStart(5) + "×  " + k + "   (fx seed " + v.seed + " S" + v.season + " MD" + v.md + ")");
  }
  if (JSON_OUT) dumpJson(runs);
  return runs;
}

function dumpJson(runs) {
  const slim = runs.map(r => ({
    seed: r.seed, final: r.final,
    hit: [...r.hit.entries()].filter(x => x[1] > 0),
    seasons: r.ev.seasons, md: r.ev.md.length,
    bigWhy: [...r.ev.bigWhy.entries()], inbox: [...r.ev.inboxKinds.entries()]
  }));
  fs.writeFileSync(JSON_OUT, JSON.stringify(slim), "utf8");
  console.log("\n  [json] " + slim.length + " karrierer → " + JSON_OUT);
}

/* =====================================================================
   MODE: scale — nedbrud, invarianter, NaN, fastlaasninger
===================================================================== */
function modeScale() {
  const bugs = [];
  const t0 = Date.now();
  let ok = 0;
  for (let i = 0; i < SEEDS; i++) {
    const s = seedAt(i);
    try {
      const B = boot(s);
      const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
      const pick = a => a[Math.floor(rnd() * a.length)];
      let steps = 0;
      const die = m => { throw new Error(m); };
      // onboarding
      let g = 0;
      while (!Q.G) {
        if (g++ > 80) die("onboarding haenger");
        const h = B.lastHtml.v;
        const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
        if (hues.length) Q.call("obHue", pick(hues));
        const modes = [...h.matchAll(/obMode\('(\w+)'\)/g)].map(x => x[1]);
        if (modes.length) Q.call("obMode", pick(modes));
        if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
      }
      const runExpr = e => { try { vm.runInContext(e, ctx); } catch (err) { bugs.push({ seed: s, kind: "klik kaster", msg: e.split("(")[0] + " → " + err.message, season: Q.G.season, md: Q.G.md }); } };
      const driveTicker = () => {
        let n = 0;
        while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
          if (n++ > 20000) die("ticker haenger");
          if (B.timers.list.length) B.timers.list[0].fn();
          else if (Q.modal.ht) Q.call("tickHT", rnd() < 0.4 ? null : pick(["steady", "fury"]));
          else die("ticker gik i staa");
        }
        Q.call("closeTicker");
      };
      const target = Q.G.season + SEASONS;
      let prev = null, same = 0, guard = 0, lastCheck = 0;
      const CLOSERS = /^(modal=null|budgetConfirm|midwayConfirm|negoAbort|negoFinish|closeTicker|facConfirm|sponsorPick|sponsorLater|resolveBank|choosePrematch|sellAccept|actMsg|dlBuy|dlSell|sendFormalBid|ownerNegoSubmit|grantReward|budgetNext)/;
      while (Q.G.season < target) {
        if (guard++ > 400000) die("hovedloekke haenger (step-budget)");
        if (Q.modal) {
          if (Q.modal === prev) { if (++same > 150) die("modal '" + Q.modal.type + "' haenger fast"); }
          else { prev = Q.modal; same = 0; }
          if (Q.modal.type === "ticker") { driveTicker(); continue; }
          Q.call("render");
          const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
          if (!all.length) { Q.modal = null; continue; }
          const cl = all.filter(e => CLOSERS.test(e.trim()));
          runExpr(pick(same > 15 && cl.length ? cl : all));
          if (Q.modal && Q.modal.type === "ticker") driveTicker();
          continue;
        }
        prev = null; same = 0;
        Q.screen = pick(["home", "squad", "market", "club", "table", "inbox"]);
        Q.call("render");
        // NaN/undefined-scanning paa hver render (min egen, uafhaengig af harness'ens)
        const h = B.lastHtml.v;
        for (const bad of ["NaN", "undefined", "[object Object]"]) {
          if (h.includes(bad)) {
            const ix = h.indexOf(bad);
            bugs.push({ seed: s, kind: "markup", msg: bad + ": …" + h.slice(Math.max(0, ix - 70), ix + 50).replace(/\s+/g, " ") + "…", season: Q.G.season, md: Q.G.md });
            break;
          }
        }
        const ph = h.match(/\{[A-Z][A-Z0-9_]*\}/);
        if (ph) bugs.push({ seed: s, kind: "pladsholder", msg: ph[0], season: Q.G.season, md: Q.G.md });
        invariants(Q, s, "idle", bugs);
        const safe = clickExprs(h).filter(e => !/playMatchday|playPlayoff|afterMatchday/.test(e));
        if (safe.length && rnd() < 0.8) runExpr(pick(safe));
        if (Q.modal) continue;
        const G = Q.G;
        if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
        else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
        else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
        else die("gaaet i staa: phase=" + G.phase + " md=" + G.md);
      }
      // gem/indlaes-runde til sidst
      try {
        Q.call("saveGame");
        const raw = B.sandbox.localStorage.getItem(Object.keys({}).length ? "x" : "ftco_save") || null;
      } catch (e) { }
      ok++;
    } catch (e) {
      bugs.push({ seed: s, kind: "NEDBRUD", msg: e.message });
    }
    if (!QUIET && (i + 1) % 25 === 0) process.stderr.write("  scale " + (i + 1) + "/" + SEEDS + " · " + bugs.length + " fund\n");
  }
  console.log("\n══════════ SKALAKOERSEL: " + SEEDS + " seeds × " + SEASONS + " saesoner ══════════");
  console.log("  gennemfoert: " + ok + "/" + SEEDS + " · " + ((Date.now() - t0) / 1000).toFixed(0) + "s · fund: " + bugs.length);
  const byKind = new Map();
  for (const b of bugs) {
    const k = b.kind + " | " + String(b.msg).slice(0, 110);
    if (!byKind.has(k)) byKind.set(k, []);
    byKind.get(k).push(b);
  }
  for (const [k, list] of [...byKind.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const seeds = [...new Set(list.map(x => x.seed))].slice(0, 6);
    console.log("\n  " + list.length + "× " + k);
    console.log("      seeds: " + seeds.join(", ") + (list[0].season !== undefined ? "  (fx S" + list[0].season + " MD" + list[0].md + ")" : ""));
  }
  if (!bugs.length) console.log("  ingen fund.");
  return bugs;
}

/* =====================================================================
   MODE: deadends — statisk audit, uafhaengig af harness'ens
===================================================================== */
function modeDeadends() {
  console.log("\n══════════ BLINDGYDE-AUDIT (qa-probes, uafhaengig) ══════════");
  const out = [];
  const say = (s) => { console.log(s); out.push(s); };

  /* 1. alle deklarerede funktioner */
  const declared = new Set([...SRC.matchAll(/^\s*function ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]));
  const arrows = new Set([...SRC.matchAll(/^\s*const ([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/gm)].map(m => m[1]));
  say("  funktioner deklareret: " + declared.size + " · arrow-hjaelpere paa oeverste niveau: " + arrows.size);

  /* 2. referencetaelling i kilden (statisk) */
  /* Referencer taelles paa det BARE navn, ikke paa "navn(" -- en funktion der
     gives videre som vaerdi (.map(pt), setTimeout(fn)) er ikke doed, og en
     audit der melder den doed brænder sin egen troværdighed. Deklarationen
     taeller som én forekomst; alt over 1 er en reel reference. */
  const refCount = name => {
    const re = new RegExp("(^|[^.\\w$])" + name.replace(/\$/g, "\\$") + "(?![\\w$])", "g");
    return (SRC.match(re) || []).length;
  };
  const neverRef = [...declared, ...arrows].filter(n => refCount(n) <= 1);
  say("  aldrig refereret nogen steder i kilden: " + (neverRef.length ? neverRef.join(", ") : "ingen"));

  /* 3. modaltyper: sat vs tegnet vs haandteret */
  const set = new Set([...SRC.matchAll(/modal\s*=\s*\{\s*type\s*:\s*"([A-Za-z]+)"/g)].map(m => m[1]));
  const drawn = new Set([...SRC.matchAll(/modal\.type\s*===\s*"([A-Za-z]+)"/g)].map(m => m[1]));
  say("  modaltyper sat: " + set.size + " · tegnet: " + drawn.size);
  const undrawn = [...set].filter(t => !drawn.has(t));
  const unset = [...drawn].filter(t => !set.has(t));
  say("    sat men aldrig tegnet: " + (undrawn.length ? undrawn.join(", ") : "ingen"));
  say("    tegnet men aldrig sat: " + (unset.length ? unset.join(", ") : "ingen"));

  /* 4. inbox-actions: kind sat vs knapper i inboxActions vs grene i handleAction.
     G.commitments bruger ogsaa feltet 'kind' (fee/promo/goals) og er IKKE
     indbakkebeskeder -- de sorteres fra paa konteksten, ellers ville auditten
     melde tre falske blindgyder. */
  const kindsSet = new Set();
  for (const m of SRC.matchAll(/kind\s*:\s*"([A-Za-z]+)"/g)) {
    const before = SRC.slice(Math.max(0, m.index - 90), m.index);
    if (/commitments\.push/.test(before)) continue;
    kindsSet.add(m[1]);
  }
  const inboxBlock = (SRC.match(/function inboxActions[\s\S]*?\n\}/) || [""])[0];
  const kindsBtn = new Set([...inboxBlock.matchAll(/case\s+"([A-Za-z]+)"/g)].map(m => m[1]));
  const handleBlock = (SRC.match(/function handleAction[\s\S]*?\n\}\n/) || [""])[0];
  const kindsHandled = new Set([...handleBlock.matchAll(/a\.kind\s*===\s*"([A-Za-z]+)"/g)].map(m => m[1]));
  say("  inbox-actions sat: " + [...kindsSet].join(", "));
  say("    uden knap i inboxActions: " + ([...kindsSet].filter(k => !kindsBtn.has(k)).join(", ") || "ingen"));
  say("    uden gren i handleAction: " + ([...kindsSet].filter(k => !kindsHandled.has(k)).join(", ") || "ingen"));

  /* 5. TRAITS: hvilke har mekanisk virkning? */
  const traitBlock = (SRC.match(/const TRAITS=\{[^}]*\}/) || [""])[0];
  const traits = [...traitBlock.matchAll(/([a-z]+):"/g)].map(m => m[1]);
  say("\n  TRAITS — mekanisk virkning (forekomster af \"navn\" udenfor TRAITS-definitionen):");
  for (const t of traits) {
    const n = (SRC.match(new RegExp('"' + t + '"', "g")) || []).length - (traitBlock.includes('"' + t + '"') ? 1 : 0);
    const uses = (SRC.match(new RegExp('traits\\.includes\\("' + t + '"\\)', "g")) || []).length;
    say("    " + t.padEnd(12) + "traits.includes: " + String(uses).padStart(2) + (uses === 0 ? "   ← INGEN MEKANISK VIRKNING" : uses === 1 ? "   ← kun ét sted" : ""));
  }

  /* 6. APPROACHES / ROLES / FACS / STANDS — datadrevne lister uden virkning */
  const listUse = (constName, keyRe) => {
    const block = (SRC.match(new RegExp("const " + constName + "\\s*=\\s*[\\[{][\\s\\S]*?\\n(?:\\]|\\})", "m")) || [""])[0];
    return { block, keys: [...block.matchAll(keyRe)].map(m => m[1]) };
  };
  /* 6. DOEDE BALANCEKNAPPER. Claude.md: "BAL indeholder ALLE balancetal. Tun
     dér." En knap der aldrig LAESES i en fuld karriere er en knap Mads kan
     dreje paa uden at der sker noget. Maales ved at erstatte hvert blad i BAL
     med en getter der noterer sig selv, og saa spille en hel karriere. */
  const NBAL = parseInt(arg("balseeds", "6"), 10);
  say("\n  BALANCEKNAPPER DER ALDRIG LAESES (" + NBAL + " karrierer × " + Math.min(SEASONS, 10) + " saesoner, nysgerrig klikker):");
  try {
    let unread = null, values = null, tot = 0;
    for (let i = 0; i < NBAL; i++) {
      const res = balReadProbe(seedAt(i), Math.min(SEASONS, 10));
      values = values || res.values;
      tot = Object.keys(res.values).length;
      unread = unread === null ? new Set(res.unread) : new Set(res.unread.filter(k => unread.has(k)));
    }
    if (!unread.size) say("    ingen — hver knap i BAL blev laest i mindst én karriere.");
    else for (const k of [...unread].sort()) say("    " + k.padEnd(26) + "= " + JSON.stringify(values[k]));
    say("    (aldrig laest i NOGEN af de " + NBAL + " karrierer: " + unread.size + " af " + tot + " blade)");
  } catch (e) { say("    kunne ikke maales: " + e.message); }
  return out;
}

/* =====================================================================
   BAL-LAESESONDE — hvilke balanceknapper roerer spillet faktisk?
===================================================================== */
const BAL_PROBE = `
;globalThis.__balRead = new Set();
;globalThis.__balLeaves = (function leaves(o,p,acc){
  for(const k of Object.keys(o)){
    const v = o[k];
    if(v && typeof v === "object" && !Array.isArray(v)) leaves(v,p+"."+k,acc); else acc[p+"."+k]=v;
  }
  return acc;
})(BAL,"BAL",{});
;(function deep(o,p){
  for(const k of Object.keys(o)){
    let v = o[k];
    if(v && typeof v === "object" && !Array.isArray(v)){ deep(v, p+"."+k); continue; }
    Object.defineProperty(o, k, {
      get(){ globalThis.__balRead.add(p+"."+k); return v; },
      set(nv){ v = nv; },
      configurable:true, enumerable:true
    });
  }
})(BAL, "BAL");`;

function balReadProbe(seed, seasons) {
  const { sandbox, timers, lastHtml } = makeSandbox();
  const ctx = vm.createContext(sandbox);
  const rnd = mulberry32(seed);
  sandbox.__rnd = rnd;
  vm.runInContext("Math.random = __rnd;", ctx);
  vm.runInContext(SRC + BRIDGE + BAL_PROBE, ctx, { filename: "proto-bal.js" });
  const Q = ctx.__Q;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const leaves = ctx.__balLeaves;
  // vaerdier laeses FOER karrieren, saa selve aflaesningen ikke taeller som brug
  const values = {};
  for (const k of Object.keys(leaves)) values[k] = leaves[k];
  ctx.__balRead.clear();

  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", pick(hues));
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  const runExpr = e => { try { vm.runInContext(e, ctx); } catch (err) { } };
  const driveTicker = () => {
    let n = 0;
    while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
      if (n++ > 20000) break;
      if (timers.list.length) timers.list[0].fn();
      else if (Q.modal.ht) Q.call("tickHT", rnd() < 0.4 ? null : pick(["steady", "fury"]));
      else break;
    }
    Q.call("closeTicker");
  };
  const target = Q.G.season + seasons;
  let prev = null, same = 0, guard = 0;
  const CLOSERS = /^(modal=null|budgetConfirm|midwayConfirm|negoAbort|negoFinish|closeTicker|facConfirm|sponsorPick|sponsorLater|resolveBank|choosePrematch|sellAccept|actMsg|dlBuy|dlSell|sendFormalBid|ownerNegoSubmit|grantReward|budgetNext)/;
  while (Q.G.season < target && guard++ < 400000) {
    if (Q.modal) {
      if (Q.modal === prev) { if (++same > 150) { Q.modal = null; continue; } } else { prev = Q.modal; same = 0; }
      if (Q.modal.type === "ticker") { driveTicker(); continue; }
      Q.call("render");
      const all = clickExprs(lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
      if (!all.length) { Q.modal = null; continue; }
      const cl = all.filter(e => CLOSERS.test(e.trim()));
      runExpr(pick(same > 15 && cl.length ? cl : all));
      if (Q.modal && Q.modal.type === "ticker") driveTicker();
      continue;
    }
    prev = null; same = 0;
    Q.screen = pick(["home", "squad", "market", "club", "table", "inbox"]);
    Q.call("render");
    const safe = clickExprs(lastHtml.v).filter(e => !/playMatchday|playPlayoff|afterMatchday/.test(e));
    if (safe.length && rnd() < 0.8) runExpr(pick(safe));
    if (Q.modal) continue;
    const G = Q.G;
    if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
    else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
    else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
    else break;
  }
  const read = ctx.__balRead;
  const unread = Object.keys(values).filter(k => !read.has(k)).sort();
  return { unread, values, readCount: read.size };
}

/* =====================================================================
   MODE: promises — hvert taloefte i teksten mod hvad koden goer
===================================================================== */
function modePromises() {
  console.log("\n══════════ TEKST MOD KODE (qa-probes) ══════════");
  const B = boot(4242);
  const Q = B.Q;
  // gennemfoer onboarding saa G findes
  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = B.lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", hues[0]);
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  const K = Q.K, BAL = K.BAL;
  const findings = [];

  /* 1. Hvert tal der optraeder i en UI-tekst skal kunne genfindes i BAL. */
  const textsOf = obj => {
    const out = [];
    const walk = (o, p) => {
      if (o == null) return;
      if (typeof o === "string") { out.push({ p, s: o }); return; }
      if (typeof o === "object") for (const k of Object.keys(o)) walk(o[k], p + "." + k);
    };
    walk(obj, "");
    return out;
  };
  console.log("\n  ── FACILITETER: FACS[].txt og FAC_DETAIL[].fx ──");
  for (const key of Object.keys(K.FACS)) {
    const f = K.FACS[key], d = K.FAC_DETAIL[key];
    const txts = [f.txt, ...(d && d.fx ? [].concat(d.fx) : [])].filter(Boolean).map(String);
    for (const t of txts) {
      const nums = [...t.matchAll(/([£+]?\d[\d.,]*\s*%?)/g)].map(m => m[1].trim());
      console.log("    " + (key + " ").padEnd(10) + JSON.stringify(t.slice(0, 110)));
      if (nums.length) console.log("        tal i teksten: " + nums.join(" · "));
    }
  }
  console.log("\n  ── TRIBUNER: STANDS[].role ──");
  for (const key of Object.keys(K.STANDS)) {
    const s = K.STANDS[key];
    console.log("    " + (key + " ").padEnd(10) + JSON.stringify(String(s.role || "").slice(0, 130)));
  }
  console.log("\n  ── BAL.stands (hvad koden faktisk giver) ──");
  console.log("    " + JSON.stringify(BAL.stands));
  console.log("\n  ── BAL.big / BAL.fund / BAL.protest ──");
  console.log("    big:     " + JSON.stringify(BAL.big));
  console.log("    fund:    " + JSON.stringify(BAL.fund));
  console.log("    protest: " + JSON.stringify(BAL.protest));
  /* Sponsorernes to adfaerd. Pakke 7 gjorde dem til FELTER frem for navnetjek
     ("med ti sponsorer ville seks vaere ren dekoration"). Feltet findes nu —
     spoergsmaalet er hvor mange af de ti der faktisk har det sat. */
  console.log("\n  ── SPONSORER: hvem har en adfaerd? ──");
  let nStunt = 0, nRisk = 0;
  for (const s of K.SPONSORS) {
    if (s.stunt) nStunt++;
    if (s.risk) nRisk++;
    console.log("    " + String(s.n).padEnd(26) + "£" + String(s.per).padStart(5) + "/w" +
      "   stunt: " + (s.stunt ? "JA " : "nej") + "   kollapsrisiko: " + (s.risk !== undefined ? s.risk : "-"));
  }
  console.log("    ⇒ stunt paa " + nStunt + " af " + K.SPONSORS.length +
    " · kollapsrisiko paa " + nRisk + " af " + K.SPONSORS.length +
    "  (de oevrige " + (K.SPONSORS.length - Math.max(nStunt, nRisk)) + " har hverken det ene eller det andet)");
  return findings;
}

/* =====================================================================
   MODE: balance — 20 saesoners kurver
===================================================================== */
function modeBalance() {
  const runs = [];
  for (let i = 0; i < SEEDS; i++) {
    const s = seedAt(i);
    try { runs.push(censusCareer(s, SEASONS, DRIVER)); }
    catch (e) { if (!QUIET) console.log("  seed " + s + " NEDBRUD: " + e.message); }
    if (!QUIET && (i + 1) % 20 === 0) process.stderr.write("  balance " + (i + 1) + "/" + SEEDS + "\n");
  }
  console.log("\n══════════ BALANCE OVER " + SEASONS + " SAESONER (" + runs.length + " karrierer, driver=" + DRIVER + ") ══════════");
  const bySeason = new Map();
  for (const r of runs) for (const s of r.ev.seasons) {
    if (!bySeason.has(s.season)) bySeason.set(s.season, []);
    bySeason.get(s.season).push(s);
  }
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  console.log("\n  sae  n   kasse(snit)   division  trup  kapacitet   vaerdi     alt bygget  oprykn.  laan  admin  stemning");
  for (const k of [...bySeason.keys()].sort((a, b) => a - b)) {
    const a = bySeason.get(k);
    const allBuilt = a.filter(x => x.built >= 4 && x.standSum >= 8).length;
    console.log("  " + String(k).padStart(3) + String(a.length).padStart(4) +
      ("£" + Math.round(avg(a.map(x => x.balance))).toLocaleString("en-GB")).padStart(14) +
      avg(a.map(x => x.div)).toFixed(2).padStart(10) +
      avg(a.map(x => x.squad)).toFixed(1).padStart(6) +
      Math.round(avg(a.map(x => x.cap))).toLocaleString("en-GB").padStart(11) +
      ("£" + Math.round(avg(a.map(x => x.value || 0)) / 1000) + "k").padStart(10) +
      (100 * allBuilt / a.length).toFixed(0).padStart(10) + "%" +
      (100 * a.filter(x => x.promoted).length / a.length).toFixed(0).padStart(8) + "%" +
      (100 * a.filter(x => x.loan > 0).length / a.length).toFixed(0).padStart(6) + "%" +
      String(a.reduce((s, x) => s + 0, 0)).padStart(6) +
      Math.round(avg(a.map(x => x.mood))).toString().padStart(10));
  }
  /* netto pr. kampdag pr. saeson */
  console.log("\n  netto pr. kampdag (kun ligakampe), pr. saeson:");
  const md = new Map();
  for (const r of runs) for (const e of r.ev.md) {
    if (!md.has(e.season)) md.set(e.season, []);
    md.get(e.season).push(e);
  }
  for (const k of [...md.keys()].sort((a, b) => a - b)) {
    const a = md.get(k);
    const big = a.filter(x => x.big).length;
    console.log("    S" + String(k).padStart(2) + "  n=" + String(a.length).padStart(5) +
      "  netto " + ("£" + Math.round(avg(a.map(x => x.net))).toLocaleString("en-GB")).padStart(10) +
      "  gate " + ("£" + Math.round(avg(a.map(x => x.gate))).toLocaleString("en-GB")).padStart(9) +
      "  fremm. " + Math.round(avg(a.map(x => x.att))).toString().padStart(6) +
      "  store " + (100 * big / a.length).toFixed(1).padStart(5) + "%" +
      "  stemning " + Math.round(avg(a.map(x => x.mood))).toString().padStart(3));
  }
  const totalAdmins = runs.reduce((a, r) => a + (r.G.admins || 0), 0);
  console.log("\n  administrationer i alt: " + totalAdmins + " over " + runs.length + " karrierer (" +
    (totalAdmins / Math.max(1, runs.length)).toFixed(2) + " pr. karriere)");
  const stuck = runs.filter(r => r.G.div === 0).length;
  console.log("  karrierer der ender i oeverste raekke: " + stuck + "/" + runs.length);
  return runs;
}

/* =====================================================================
   MODE: bigstat — genmaal pakke 5's frekvens uden syntetiske kampdage
===================================================================== */
function modeBigstat() {
  console.log("\n══════════ STORE KAMPE — GENMAALT (qa-probes) ══════════");
  const buckets = new Map();
  let tot = 0, bigs = 0, bigGate = 0, bigN = 0, pGate = 0, pN = 0;
  for (let i = 0; i < SEEDS; i++) {
    const s = seedAt(i);
    let r;
    try { r = censusCareer(s, SEASONS, DRIVER); } catch (e) { console.log("  seed " + s + ": NEDBRUD " + e.message); continue; }
    for (const e of r.ev.md) {
      tot++;
      const k = s + "/" + e.season;
      buckets.set(k, (buckets.get(k) || 0) + (e.big ? 1 : 0));
      if (e.big) bigs++;
      if (e.home) { if (e.big) { bigGate += e.gate; bigN++; } else { pGate += e.gate; pN++; } }
    }
  }
  const vals = [...buckets.values()];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner · " + tot + " kampdage");
  console.log("  store kampe pr. saeson: " + avg.toFixed(2) + " (maal 3-5)  " + (avg >= 3 && avg <= 5 ? "OK" : "UDENFOR"));
  console.log("  spaend " + Math.min(...vals) + "–" + Math.max(...vals) + " · saesoner uden en eneste: " +
    vals.filter(v => v === 0).length + " af " + vals.length + " (" + (100 * vals.filter(v => v === 0).length / vals.length).toFixed(1) + "%)");
  console.log("  andel af alle kampdage: " + (100 * bigs / tot).toFixed(1) + "%");
  if (bigN && pN) console.log("  hjemme-gate: stor " + Math.round(bigGate / bigN).toLocaleString("en-GB") +
    " · almindelig " + Math.round(pGate / pN).toLocaleString("en-GB") +
    " (+" + Math.round(100 * (bigGate / bigN / (pGate / pN) - 1)) + "%)");
  // fordeling pr. sæsonnummer
  const bySeason = new Map();
  for (const [k, v] of buckets) {
    const sn = +k.split("/")[1];
    if (!bySeason.has(sn)) bySeason.set(sn, []);
    bySeason.get(sn).push(v);
  }
  console.log("\n  pr. saesonnummer:");
  for (const k of [...bySeason.keys()].sort((a, b) => a - b)) {
    const a = bySeason.get(k);
    console.log("    S" + String(k).padStart(2) + "  " + (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) +
      "   (0 store i " + a.filter(v => v === 0).length + "/" + a.length + ")");
  }
}

/* =====================================================================
   MODE: textdup — hvilke tickerlinjer omgaar tekstbibliotekets dublettvagt?
   Pakke 6's loefte er "ingen linje to gange i samme kamp". Vagten sidder i
   pickLine(...,match.used); enhver linje der pushes DIREKTE ind i ev[] er
   udenfor den. Her simuleres kampe i massevis og dubletter taelles.
===================================================================== */
function modeTextdup() {
  console.log("\n══════════ TICKER-DUBLETTER (uden om pickLine) ══════════");
  const B = bootPlaying(4242, 0);
  const Q = B.Q, G = Q.G;
  const N = parseInt(arg("sims", "200000"), 10);
  const dup = new Map();     // linje -> antal kampe hvor den kom 2+ gange
  const seen = new Map();    // linje -> antal kampe hvor den kom mindst 1 gang
  let dupMatches = 0;
  for (let i = 0; i < N; i++) {
    const m = Q.call("buildMatch", 1 + (i % G.teams.length), true, i % 7 === 0, null);
    m.approach = "bal"; m.h1 = { gf: 2, ga: 1 }; m.used = [];
    const a = Q.call("halfEvents", m, 1, 2, 1), b = Q.call("halfEvents", m, 2, 2, 1);
    const lines = [...a, ...b].flatMap(e => [e.txt, e.sub]).filter(Boolean);
    const c = new Map();
    for (const l of lines) {
      if (/^(GOAL!|PENALTY!|Goal —)/.test(l)) continue;   // maalraab gentages med vilje
      c.set(l, (c.get(l) || 0) + 1);
    }
    let any = false;
    for (const [l, n] of c) {
      seen.set(l, (seen.get(l) || 0) + 1);
      if (n > 1) { dup.set(l, (dup.get(l) || 0) + 1); any = true; }
    }
    if (any) dupMatches++;
  }
  console.log("  " + N.toLocaleString("en-GB") + " kampe simuleret gennem halfEvents() (begge halvlege, som i spillet)");
  console.log("  kampe med mindst én dublet: " + dupMatches + " (" + (100 * dupMatches / N).toFixed(3) + "% = 1 pr. " +
    Math.round(N / Math.max(1, dupMatches)) + " kampe)");
  console.log("  over 20 saesoner (520 kampe): P(mindst én dublet i karrieren) ≈ " +
    (100 * (1 - Math.pow(1 - dupMatches / N, 520))).toFixed(0) + "%");
  if (!dup.size) { console.log("  ingen linje gentog sig — vagten holder."); return; }
  console.log("\n  linjer der gentages i samme kamp:");
  for (const [l, n] of [...dup.entries()].sort((a, b) => b[1] - a[1])) {
    console.log("    " + String(n).padStart(5) + " kampe (" + (100 * n / N).toFixed(3) + "%)  " + JSON.stringify(l.slice(0, 78)));
  }
  console.log("\n  ⇒ hver af disse er pushet direkte ind i ev[] uden om pickLine(...,match.used).");
  console.log("     Samme dublet faar ogsaa harness'ens checkTextLibrary til at fejle tilfaeldigt:");
  console.log("     tre vejrtyper × to halvlege pr. seed ⇒ ~" +
    (100 * (1 - Math.pow(1 - dupMatches / N, 3))).toFixed(2) + "% af alle seeds, uanset antal saesoner.");
}

/* =====================================================================
   MODE: levers — har spillerens valg overhovedet en modvaegt?
   Et valg uden ulempe er ikke et valg; det er en knap man saetter én gang.
===================================================================== */
function bootPlaying(seed, seasons) {
  const B = boot(seed);
  const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
  const pick = a => a[Math.floor(rnd() * a.length)];
  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = B.lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", pick(hues));
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  if (!seasons) return B;
  const runExpr = e => { try { vm.runInContext(e, ctx); } catch (err) { } };
  const driveTicker = () => {
    let n = 0;
    while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
      if (n++ > 20000) break;
      if (B.timers.list.length) B.timers.list[0].fn();
      else if (Q.modal.ht) Q.call("tickHT", null); else break;
    }
    Q.call("closeTicker");
  };
  const target = Q.G.season + seasons;
  let prev = null, same = 0, guard = 0;
  while (Q.G.season < target && guard++ < 300000) {
    if (Q.modal) {
      if (Q.modal === prev) { if (++same > 150) { Q.modal = null; continue; } } else { prev = Q.modal; same = 0; }
      if (Q.modal.type === "ticker") { driveTicker(); continue; }
      Q.call("render");
      const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
      if (!all.length) { Q.modal = null; continue; }
      runExpr(pick(all));
      if (Q.modal && Q.modal.type === "ticker") driveTicker();
      continue;
    }
    prev = null; same = 0;
    /* C1/C2: de to helsider skal drives, ellers spiller playMatchday() aldrig. */
    if (drivePageScreen(Q, B, pick, runExpr, B.pageLog || (B.pageLog = {}))) continue;
    const G = Q.G;
    if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
    else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
    else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
    else break;
  }
  return B;
}

function modeLevers() {
  console.log("\n══════════ SPILLERENS KNAPPER — har de en modvaegt? ══════════");

  /* 1. Storkamps-tillaegget (bigExtra). Teksten paa Klub-skaermen siger
     "fans tolerate ~£3". Findes den taalmodighed i koden? */
  console.log("\n  ── 1. STORKAMPS-TILLAEG (G.bigExtra, 0-8) ──");
  {
    const B = bootPlaying(9001, 3);
    const Q = B.Q, G = Q.G;
    G.fanMood = 70; G.stands.away = 1; G.fac.screen = 1;
    Q.call("recalcCapacity");
    console.log("    tillaeg   fremmoede   gate(stor kamp)   stemningsstraf   sae.kort-salg");
    const atts = [], gates = [];
    for (let x = 0; x <= 8; x++) {
      G.bigExtra = x;
      const att = Q.call("attendance");
      const r = Q.call("gateReceipts", { home: true, big: true });
      // stemningsstraf: updateFormMood straffer kun G.ticket, ikke tillaegget
      const moodPenalty = G.ticket > Q.K.BAL.ticket.moodPenaltyAbove ? -1 : 0;
      atts.push(att); gates.push(r.gate);
      console.log("      +£" + x + "      " + String(att).padStart(6) + "      " +
        ("£" + r.gate.toLocaleString("en-GB")).padStart(10) + "         " + String(moodPenalty).padStart(4) +
        "            " + String(G.seasonTix.sold).padStart(6));
    }
    const flat = atts.every(a => a === atts[0]);
    const mono = gates.every((g, i) => i === 0 || g >= gates[i - 1]);
    console.log("    DOM: fremmoede " + (flat ? "UAENDRET over hele spaendet" : "falder " + atts[0] + " → " + atts[8]) +
      " · gate " + (mono ? "stiger monotont" : "har et toppunkt") +
      (flat && mono ? "  ⇒ tillaegget har INGEN pris: +£8 er strengt bedst" : "  ⇒ tillaegget har en modvaegt"));
  }

  /* 2. Grundprisen til sammenligning: den HAR en modvaegt. */
  console.log("\n  ── 2. GRUNDPRIS (G.ticket, 5-30) — kontrolmaaling ──");
  {
    const B = bootPlaying(9001, 3);
    const Q = B.Q, G = Q.G;
    G.fanMood = 70;
    const keep = G.ticket;
    console.log("    pris   fremmoede   gate   stemningsstraf");
    for (let t = 5; t <= 30; t += 5) {
      G.ticket = t;
      const att = Q.call("attendance");
      const r = Q.call("gateReceipts", { home: true, big: false });
      console.log("      £" + String(t).padStart(2) + "    " + String(att).padStart(6) + "   " +
        ("£" + r.gate.toLocaleString("en-GB")).padStart(9) + "        " +
        (t > Q.K.BAL.ticket.moodPenaltyAbove ? "-1" : " 0"));
    }
    G.ticket = keep;
  }

  /* 3. Tilgangen foer kampen. Er én af de tre altid bedst? */
  console.log("\n  ── 3. TILGANG FOER KAMP (caut/bal/allout) ──");
  {
    const B = bootPlaying(9002, 4);
    const Q = B.Q, G = Q.G;
    const N = parseInt(arg("sims", "4000"), 10);
    for (const home of [true, false]) {
      console.log("    " + (home ? "HJEMME" : "UDE") + "     W/D/L                point/kamp     maal for / imod");
      for (const key of Object.keys(Q.K.APPROACHES)) {
        let w = 0, d = 0, l = 0, gf = 0, ga = 0;
        for (let i = 0; i < N; i++) {
          const m = Q.call("buildMatch", 1 + (i % G.teams.length), home, false, null);
          m.approach = key;
          const h1 = Q.call("simHalf", m, null), h2 = Q.call("simHalf", m, null);
          const a = h1.gf + h2.gf, b = h1.ga + h2.ga;
          gf += a; ga += b;
          if (a > b) w++; else if (a === b) d++; else l++;
        }
        console.log("      " + key.padEnd(9) + (w + "/" + d + "/" + l).padEnd(20) +
          ((3 * w + d) / N).toFixed(3).padStart(8) + "        " + (gf / N).toFixed(2) + " / " + (ga / N).toFixed(2));
      }
    }
    console.log("    (samme modstanderfelt, samme trup, " + N + " simuleringer pr. linje — kun tilgangen skifter)");
    /* Det afgoerende spoergsmaal er ikke "hvilken er bedst i snit", men om
       SVARET SKIFTER med modstanderen. Gør det ikke det, er tilgangen ikke et
       valg -- den er en indstilling man saetter i sæson 1 og aldrig rører. */
    console.log("\n    Skifter svaret med modstanderens styrke? (hjemme, " + N + " sims pr. celle)");
    const strength = t => (t.att + t.def + (t.phy || 50)) / 3;
    const sorted = [...G.teams].map((t, i) => ({ i: i + 1, s: strength(t) })).sort((a, b) => a.s - b.s);
    const bands = [["svage", sorted.slice(0, 4)], ["midt", sorted.slice(4, 9)], ["staerke", sorted.slice(9)]];
    console.log("      modstander" + Object.keys(Q.K.APPROACHES).map(k => k.padStart(10)).join("") + "     bedst");
    for (const [lbl, band] of bands) {
      const pts = {};
      for (const key of Object.keys(Q.K.APPROACHES)) {
        let p = 0;
        for (let i = 0; i < N; i++) {
          const m = Q.call("buildMatch", band[i % band.length].i, true, false, null);
          m.approach = key;
          const h1 = Q.call("simHalf", m, null), h2 = Q.call("simHalf", m, null);
          const a = h1.gf + h2.gf, b = h1.ga + h2.ga;
          p += a > b ? 3 : a === b ? 1 : 0;
        }
        pts[key] = p / N;
      }
      const best = Object.keys(pts).sort((a, b) => pts[b] - pts[a])[0];
      console.log("      " + lbl.padEnd(10) + Object.keys(pts).map(k => pts[k].toFixed(3).padStart(10)).join("") + "     " + best);
    }
  }

  /* 4. Troejevalget ved budgetmoedet: forventet salgsfaktor. */
  console.log("\n  ── 4. TROEJEVALG (classic/modern/wild) ──");
  console.log("    classic  1.00 altid              → forventet 1.000");
  console.log("    modern   60% 1.20 / 40% 0.90     → forventet 1.080");
  console.log("    wild     40% 1.35 / 60% 0.80     → forventet 1.020");
  console.log("    (aflaest af budgetConfirm(); 'classic' er strengt daarligst, 'modern' strengt bedst)");

  /* 5. Kontraktknapper: aar og rolle mod loenkrav. */
  console.log("\n  ── 5. KONTRAKT: AAR × ROLLE mod loenkrav ──");
  {
    const B = bootPlaying(9003, 2);
    const Q = B.Q, G = Q.G;
    /* wageDemandFor(years, role) laeser den globale `nego`. Der stilles derfor
       en rigtig forhandling op, praecis som spillet ville. */
    const p = G.squad.find(x => Q.call("ovr", x) >= 48 && x.age < 26) || G.squad[0];
    Q.nego = { p, agent: Q.K.AGENTS[0], ix: -1, freeAgent: true, renewal: false, round: 0, cround: 0, years: 2, role: "rot", finalUsed: false, wageOffer: p.wage };
    console.log("    spiller: " + p.pos + " ovr " + Q.call("ovr", p) + ", alder " + p.age + ", nuvaerende loen £" + Math.round(p.wage) + "/w");
    console.log("    aar   " + Object.keys(Q.K.ROLES).map(r => (Q.K.ROLES[r].n).padStart(14)).join(""));
    for (const y of [1, 2, 3, 4]) {
      let line = "     " + y + "yr  ";
      for (const r of Object.keys(Q.K.ROLES)) {
        let v = null;
        try { v = Q.call("wageDemandFor", y, r); } catch (e) { v = null; }
        line += (v === null ? "n/a" : "£" + Math.round(v)).padStart(14);
      }
      console.log(line);
    }
    console.log("    faktorer: " + Object.keys(Q.K.ROLES).map(r => r + "×" + Q.K.ROLES[r].f).join(" · "));
    console.log("    afvisninger: 'pro' naegtes ved alder>=26 · 'key' naegtes ved ovr<48");
    console.log("    p.role bruges DEREFTER kun til: prisen ved fornyelse, én linje tekst,");
    console.log("    og at en ambitioes spiller afviser alt andet end 'key'. Ingen anden virkning.");
    Q.nego = null;
  }
}

/* =====================================================================
   NAT 3/4 — traceCareer: en mager driver der foelger DIVISIONEN og
   OEKONOMIEN gennem en hel karriere. Skrevet til pakke 16 og 18, hvor
   spoergsmaalet ikke er "sker det", men "hvilken FORM har kurven".

   Vigtigt: den hooker finishSeason FOER kaldet, saa den ser divisionen
   som den var da sæsonen blev spillet, og udleder divAfter bagefter.
===================================================================== */
function traceCareer(seed, seasons) {
  const B = boot(seed);
  const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const out = { seed, seasons: [], md: [], err: null };

  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = B.lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", pick(hues));
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  if (!Q.G) { out.err = "onboarding"; return out; }

  const wageBill = () => Q.G.squad.reduce((s, p) => s + p.wage, 0);

  /* Systembrugs-audit (mandat 6): hvor ofte fyrer nattens NYE mekanik?
     Talt pr. karriere, saa "under 1 % af karriererne" kan afgoeres. */
  out.fire = new Map();
  const fire = k => out.fire.set(k, (out.fire.get(k) || 0) + 1);
  const origMsg2 = ctx.msg;
  ctx.msg = function (from, av, title, body, action) {
    if (action && action.kind) fire("msg:" + action.kind);
    if (/RELEGATION|Relegation has a price/i.test(String(title) + String(body))) fire("txt:relegationLedger");
    if (/very serious about leaving/i.test(String(body))) fire("txt:dreamerWantsOut");
    if (/Promotion has a price/i.test(String(title))) fire("txt:promotionLedger");
    return origMsg2.apply(this, arguments);
  };
  /* Droemmer-grenen (pakke 16) ligger EFTER kontraktudloeb og applyRetirements()
     inde i finishSeason. Betingelsen skal derfor maales praecis dér, ikke foer
     saesonafslutningen -- ellers maaler man en trup der ikke findes laengere. */
  const origRet = ctx.applyRetirements;
  if (typeof origRet === "function") ctx.applyRetirements = function () {
    const r = origRet.apply(this, arguments);
    out.atCheck = { squad: Q.G.squad.length, dreamers: Q.G.squad.filter(p => p.traits.includes("dreamer")).length };
    return r;
  };
  for (const fn of ["openBank", "takeLoan", "administration", "openBankUltimatum",
    "buyOutOwner", "openBudgetMeeting", "budgetConfirm", "bigGameBonus", "playPlayoff",
    /* nat 7: de nye mekanikker. Mandat 6 -- alt under 1 % af karriererne er
       doedt eller fejltunet, og C1/C2 er de to Mads udtrykkeligt bad om at
       faa gjort GODE. Naar botten aldrig kommer derhen, er DET fundet. */
    "openOffer", "offerCallRound", "offerDecide", "closeOffer",
    "openDeadline", "dlAdvance", "dlClose", "dlHeistSign",
    "dlPanicAccept", "dlPanicReject", "dlPanicPush",
    "dlPoachHold", "dlPoachLet", "dlPoachSnub",
    "closeFac", "reopenFac", "buildFac", "finishFac",
    "freeAgentDirection", "sponsorSign", "startRenewal"]) {
    const o = ctx[fn];
    if (typeof o === "function") ctx[fn] = function () { fire("fn:" + fn); return o.apply(this, arguments); };
  }
  /* Sponsorbonussen udbetales inde i en stoerre funktion; den taelles paa sin
     BESKED, som er det spilleren faktisk ser. */
  const origMsg3 = ctx.msg;
  ctx.msg = function (from, av, title, body, action) {
    const t = String(title || "");
    if (/^BONUS UDL/.test(t)) fire("evt:sponsorBonusPaid");
    if (/^Ingen bonus/.test(t)) fire("evt:sponsorBonusMissed");
    if (/ER LUKKET NED$/.test(t)) fire("evt:facClosed");
    if (/ER ÅBEN IGEN$/.test(t)) fire("evt:facReopened");
    return origMsg3.apply(this, arguments);
  };

  /* B2's tilstandsmaskine, kontrolleret paa HVER kampdag i rigtigt spil.
     Spoergsmaalet fra mandatet: kan en facilitet ende et sted hvor den
     hverken er aaben eller lukket, eller hvor genaabningen aldrig bliver
     faerdig? Det maales her, ikke laeses ud af koden. */
  out.facBad = [];
  out.facStuck = [];
  let buildWatch = null;
  const checkFacState = () => {
    const G = Q.G; if (!G || !G.fac) return;
    const note = (why, k) => { if (out.facBad.length < 40) out.facBad.push({ seed, season: G.season, md: G.md, key: k, why }); };
    for (const k of Object.keys(G.fac)) {
      const lvl = G.fac[k];
      if (typeof lvl !== "number" || !Number.isFinite(lvl) || lvl < 0 || lvl !== Math.round(lvl)) note("niveau er ikke et helt tal: " + lvl, k);
      /* HVERKEN AABEN ELLER LUKKET: nedlukningsflaget staar paa noget der
         ikke er bygget. Kortet viser saa "Genaabn" paa et tomt hus. */
      if (G.facOff && G.facOff[k] && !(lvl > 0)) note("facOff staar, men niveauet er " + lvl + " — hverken aaben eller lukket", k);
    }
    const b = G.facBuild;
    if (b) {
      if (!(b.key in G.fac)) note("byggeri paa en facilitet der ikke findes: " + b.key, b.key);
      else if (!Number.isFinite(b.remain)) note("byggeriets remain er ikke et tal: " + b.remain, b.key);
      /* En genaabning af noget der ikke er lukket rydder ingenting naar den
         bliver faerdig -- byggepladsen er brugt paa ingenting. */
      if (b.reopen && !(G.facOff && G.facOff[b.key])) note("genaabning af en facilitet der ikke er lukket", b.key);
      /* Taeller den ned? Et byggeri der staar stille er et byggeri der
         aldrig bliver faerdigt. */
      if (buildWatch && buildWatch.key === b.key && buildWatch.reopen === !!b.reopen) {
        buildWatch.mds++;
        if (b.remain >= buildWatch.remain) buildWatch.stalled++;
        buildWatch.remain = b.remain;
        if (buildWatch.mds > 40 && out.facStuck.length < 20)
          out.facStuck.push({ seed, season: G.season, md: G.md, key: b.key, reopen: !!b.reopen, mds: buildWatch.mds, stalled: buildWatch.stalled });
      } else buildWatch = { key: b.key, reopen: !!b.reopen, remain: b.remain, mds: 0, stalled: 0 };
    } else buildWatch = null;
  };

  const origSettle = ctx.settleFinances;
  ctx.settleFinances = function (res) {
    const before = Q.G.balance;
    const r = origSettle.apply(this, arguments);
    const G = Q.G;
    checkFacState();
    out.md.push({
      season: G.season, div: G.div, net: G.balance - before,
      wages: res.wages || 0, gate: res.gate || 0, home: !!res.home,
      att: res.att || 0, big: !!res.big, bal: G.balance,
      protest: G.protest || 0, mood: Math.round(G.fanMood)
    });
    return r;
  };

  const origFinish = ctx.finishSeason;
  ctx.finishSeason = function (o) {
    const G = Q.G;
    const rec = {
      season: G.season, divBefore: G.div, pos: G.lastPos || null,
      rawPromoted: !!(o && o.promoted), rawRelegated: !!(o && o.relegated),
      how: o && o.how, wageBillBefore: wageBill(), capBefore: G.wageCap,
      balance: G.balance, mood: Math.round(G.fanMood), admins: G.admins || 0,
      objectivePos: G.objectivePos, squad: G.squad.length,
      objectiveBold: G.objectiveBold || 0, big: null,
      hadDreamer: G.squad.filter(p => p.traits.includes("dreamer")).length,
      squadAt: G.squad.length
    };
    out.atCheck = null;
    const r = origFinish.apply(this, arguments);
    rec.atCheck = out.atCheck;       // truppen som droemmer-grenen faktisk saa den
    rec.divAfter = Q.G.div;
    rec.wageBillAfter = wageBill();
    rec.capAfter = Q.G.wageCap;
    rec.wentDown = rec.divAfter > rec.divBefore;
    rec.wentUp = rec.divAfter < rec.divBefore;
    // hvad staar der i klubbens EGEN historik for denne saeson?
    const h = (Q.G.history || []).filter(x => x.season === rec.season);
    rec.histRelegated = h.length ? !!h[h.length - 1].relegated : null;
    rec.histPos = h.length ? h[h.length - 1].pos : null;
    out.seasons.push(rec);
    return r;
  };

  const runExpr = e => { try { vm.runInContext(e, ctx); } catch (err) { } };
  const driveTicker = () => {
    let n = 0;
    while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
      if (n++ > 20000) break;
      if (B.timers.list.length) B.timers.list[0].fn();
      else if (Q.modal.ht) Q.call("tickHT", null); else break;
    }
    Q.call("closeTicker");
  };
  const target = Q.G.season + seasons;
  let prev = null, same = 0, guard = 0;
  try {
    while (Q.G.season < target && guard++ < 400000) {
      if (Q.modal) {
        if (Q.modal === prev) { if (++same > 150) { Q.modal = null; continue; } } else { prev = Q.modal; same = 0; }
        if (Q.modal.type === "ticker") { driveTicker(); continue; }
        Q.call("render");
        const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
        if (!all.length) { Q.modal = null; continue; }
        runExpr(pick(all));
        if (Q.modal && Q.modal.type === "ticker") driveTicker();
        continue;
      }
      prev = null; same = 0;
      /* C1/C2 (nat 7): to HELSIDER uden modal. En driver der kun kigger paa
         `modal` sidder fast for evigt: playMatchday() ser G.dl, saetter
         screen="deadline" og RETURNERER uden at spille. Fundet ved at denne
         probe kun naaede 5 kampdage pr. karriere. Siden drives nu som en
         modal: render, find onclick-udtryk, klik ét. */
      if (drivePageScreen(Q, B, pick, runExpr, out)) continue;
      const G = Q.G;
      if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
      else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
      else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
      else { out.exit = "ukendt fase: " + G.phase; break; }
    }
  } catch (e) { out.err = String(e.message).slice(0, 120); }
  if (!out.exit) out.exit = guard >= 400000 ? "step-budget" : "naaede maalsaeson";
  out.finalDiv = Q.G ? Q.G.div : null;
  out.lastSeason = Q.G ? Q.G.season : null;
  return out;
}

const DIVN = ["Premier", "League One", "League Two", "League Three"];
const qtl = (a, p) => a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : 0;
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

/* ---------------------------------------------------------------------
   MODE releg — pakke 16: har kurven skiftet FORM?
--------------------------------------------------------------------- */
function modeReleg() {
  console.log("\n══════════ PAKKE 16 — NEDRYKNING, FORMEN PAA KURVEN ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner (qa-probes' egen klikker-driver)\n");
  const runs = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = 1000 + i * 7919;
    const r = traceCareer(seed, SEASONS);
    runs.push(r);
    if (r.err) console.log("  seed " + seed + " FEJL: " + r.err);
  }
  const ok = runs.filter(r => !r.err && r.seasons.length);
  console.log("  karrierer gennemfoert: " + ok.length + " af " + runs.length);

  // 1. gennemsnitsplacering pr. saeson — er den monoton?
  console.log("\n  --- gns. placering, op- og nedrykninger pr. saeson ---");
  console.log("  saeson  gns.plads  gns.div   opryk   nedryk   n");
  const posBySeason = [];
  for (let s = 1; s <= SEASONS; s++) {
    const rows = ok.map(r => r.seasons.find(x => x.season === s)).filter(Boolean);
    if (!rows.length) continue;
    const poss = rows.map(x => x.histPos).filter(x => x != null);
    const ap = mean(poss), ad = mean(rows.map(x => x.divBefore));
    const up = rows.filter(x => x.wentUp).length, dn = rows.filter(x => x.wentDown).length;
    posBySeason.push({ s, ap, ad, up, dn, n: rows.length });
    console.log("  " + String(s).padStart(5) + String(ap.toFixed(2)).padStart(11) +
      String(ad.toFixed(2)).padStart(9) + String(up).padStart(8) + String(dn).padStart(9) +
      String(rows.length).padStart(5));
  }
  // monotoni-test paa gns. placering fra saeson 5 og frem
  const tail = posBySeason.filter(x => x.s >= 5);
  let mono = true;
  for (let i = 1; i < tail.length; i++) if (tail[i].ap < tail[i - 1].ap - 0.01) { mono = false; break; }
  const first = tail.length ? tail[0].ap : 0, last = tail.length ? tail[tail.length - 1].ap : 0;
  console.log("  fra saeson 5: " + first.toFixed(2) + " -> " + last.toFixed(2) +
    "  ·  monotont daarligere? " + (mono ? "JA (advarsel)" : "NEJ (godt)"));

  // 2. jojo: falder klubber og klatrer igen?
  let downThenUp = 0, everDown = 0, everUp = 0, oscTotal = 0;
  for (const r of ok) {
    const dn = r.seasons.filter(x => x.wentDown), up = r.seasons.filter(x => x.wentUp);
    if (dn.length) everDown++;
    if (up.length) everUp++;
    oscTotal += dn.length + up.length;
    if (dn.length && up.some(u => dn.some(d => d.season < u.season))) downThenUp++;
  }
  console.log("\n  --- jojo ---");
  console.log("  karrierer med mindst en nedrykning: " + everDown + " (" + pctOf(everDown, ok.length) + ")");
  console.log("  karrierer med mindst en oprykning : " + everUp + " (" + pctOf(everUp, ok.length) + ")");
  console.log("  RYKKER NED OG SIDEN OP IGEN       : " + downThenUp + " (" + pctOf(downThenUp, ok.length) + ")");
  console.log("  divisionsskift i alt pr. karriere : " + (oscTotal / (ok.length || 1)).toFixed(2));

  // 3. spiralen: naar man foerst er i L3, kommer man saa ud?
  const arrivals = [];
  for (const r of ok) {
    const idx = r.seasons.findIndex(x => x.divAfter === 3 && x.wentDown);
    if (idx < 0) continue;
    const after = r.seasons.slice(idx + 1);
    if (after.length < 3) continue;              // for lidt tid tilbage til at doemme
    arrivals.push({ escaped: after.some(x => x.wentUp), left: after.length });
  }
  console.log("\n  --- den nedadgaaende spiral ---");
  if (arrivals.length < 10) console.log("  for faa ankomster til L3 til at doemme (" + arrivals.length + ")");
  else console.log("  landede i League Three med >=3 saesoner tilbage: " + arrivals.length +
    " · slap ud igen: " + arrivals.filter(a => a.escaped).length +
    " (" + pctOf(arrivals.filter(a => a.escaped).length, arrivals.length) + ")");

  // 4. HAARD BUND: ingen nedrykning fra div 3, hverken i tilstand eller historik
  const floorViol = [];
  const histMismatch = [];
  for (const r of ok) for (const s of r.seasons) {
    if (s.divBefore === 3 && s.wentDown) floorViol.push(r.seed + " S" + s.season);
    if (s.divBefore === 3 && s.rawRelegated) floorViol.push(r.seed + " S" + s.season + " (raw)");
    if (s.divBefore === 3 && s.histRelegated) floorViol.push(r.seed + " S" + s.season + " (historik)");
    if (s.histRelegated !== null && s.histRelegated !== s.wentDown) histMismatch.push(r.seed + " S" + s.season);
    if (s.divAfter < 0 || s.divAfter > 3) floorViol.push(r.seed + " S" + s.season + " div=" + s.divAfter);
  }
  console.log("\n  --- den haarde bund (fra League Three maa man IKKE rykke ned) ---");
  console.log("  overtraedelser: " + (floorViol.length ? floorViol.slice(0, 8).join(", ") : "INGEN ✅"));
  console.log("  historik uenig med faktisk nedrykning: " +
    (histMismatch.length ? histMismatch.length + " (" + histMismatch.slice(0, 5).join(", ") + ")" : "ingen ✅"));

  // 5. slutdivision
  const fin = [0, 0, 0, 0];
  for (const r of ok) if (r.finalDiv != null) fin[r.finalDiv]++;
  console.log("\n  --- slutdivision efter " + SEASONS + " saesoner ---");
  for (let d = 0; d < 4; d++) console.log("  " + DIVN[d].padEnd(14) + String(fin[d]).padStart(5) + "  " + pctOf(fin[d], ok.length));

  // 6. loenkrisen efter nedrykning: baerer klubben en loensum den ikke kan betale?
  const drops = ok.flatMap(r => r.seasons.filter(x => x.wentDown));
  if (drops.length) {
    const overCap = drops.filter(x => x.wageBillAfter > x.capAfter).length;
    console.log("\n  --- krisen efter nedrykning (n=" + drops.length + ") ---");
    console.log("  loensum over det nye loft umiddelbart efter: " + overCap + " (" + pctOf(overCap, drops.length) + ")");
    console.log("  gns. loensum " + Math.round(mean(drops.map(x => x.wageBillBefore))) +
      " -> " + Math.round(mean(drops.map(x => x.wageBillAfter))) +
      " · gns. loft " + Math.round(mean(drops.map(x => x.capBefore))) +
      " -> " + Math.round(mean(drops.map(x => x.capAfter))));
  }
  return { runs: ok, posBySeason };
}
function pctOf(a, b) { return b ? (100 * a / b).toFixed(1) + " %" : "—"; }

/* ---------------------------------------------------------------------
   MODE divecon — pakke 18: samme spredning i div 0 som i div 3?
--------------------------------------------------------------------- */
function modeDivecon() {
  console.log("\n══════════ PAKKE 18 — SKALERING PR. DIVISION (uafhaengig maaling) ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner\n");
  const runs = [];
  for (let i = 0; i < SEEDS; i++) {
    const r = traceCareer(1000 + i * 7919, SEASONS);
    if (!r.err) runs.push(r);
  }
  console.log("  div            kampdage    gns.netto   p25      median   p75      loen/MD   gns/loen  spaend/loen");
  const shape = [];
  for (let d = 0; d < 4; d++) {
    const rows = runs.flatMap(r => r.md.filter(e => e.div === d));
    if (rows.length < 50) { console.log("  " + DIVN[d].padEnd(14) + "  for faa kampdage (" + rows.length + ")"); continue; }
    const nets = rows.map(e => e.net).sort((a, b) => a - b);
    const w = mean(rows.map(e => e.wages)) || 1;
    const iqr = qtl(nets, 0.75) - qtl(nets, 0.25);
    const gl = mean(nets) / w, sl = iqr / w;
    shape.push({ d, gl, sl });
    console.log("  " + DIVN[d].padEnd(14) + String(rows.length).padStart(9) +
      String(Math.round(mean(nets))).padStart(12) +
      String(Math.round(qtl(nets, 0.25))).padStart(9) +
      String(Math.round(qtl(nets, 0.5))).padStart(9) +
      String(Math.round(qtl(nets, 0.75))).padStart(9) +
      String(Math.round(w)).padStart(10) +
      String(gl.toFixed(2)).padStart(10) + String(sl.toFixed(2)).padStart(12));
  }
  if (shape.length === 4) {
    const sls = shape.map(x => x.sl), gls = shape.map(x => x.gl);
    console.log("\n  spaend/loen  min " + Math.min(...sls).toFixed(2) + "  max " + Math.max(...sls).toFixed(2) +
      "  · forhold top:bund " + (shape[0].sl / shape[3].sl).toFixed(2) + " (1,00 = perfekt ens)");
    console.log("  gns/loen     div0 " + gls[0].toFixed(2) + "  div3 " + gls[3].toFixed(2) +
      "  · forskel " + (gls[0] - gls[3]).toFixed(2));
  }

  // saeson for saeson: topper kassen midtvejs og falder bagefter?
  console.log("\n  --- netto pr. kampdag pr. SAESON (er der stadig en pukkel?) ---");
  for (let s = 1; s <= SEASONS; s++) {
    const rows = runs.flatMap(r => r.md.filter(e => e.season === s));
    if (rows.length < 20) continue;
    const m = mean(rows.map(e => e.net));
    const bar = m > 0 ? "+".repeat(Math.min(30, Math.round(m / 200))) : "-".repeat(Math.min(30, Math.round(-m / 200)));
    console.log("  S" + String(s).padStart(2) + " " + String(Math.round(m)).padStart(8) + "  " + bar);
  }

  // andel af SENE saesoner i minus
  const late = runs.flatMap(r => r.seasons.filter(x => x.season > SEASONS * 0.6));
  const lateNeg = late.filter(x => x.balance < 0).length;
  console.log("\n  sene saesoner (efter " + Math.round(SEASONS * 0.6) + ") der slutter med negativ kasse: " +
    lateNeg + " af " + late.length + " (" + pctOf(lateNeg, late.length) + ")");

  // League Three splittet: aldrig rykket ned vs. landet der
  const fresh = [], crashed = [];
  for (const r of runs) {
    for (const e of r.md.filter(x => x.div === 3)) {
      const hadDrop = r.seasons.some(s => s.wentDown && s.season < e.season);
      (hadDrop ? crashed : fresh).push(e);
    }
  }
  const line = (lbl, rows) => rows.length < 50 ? "  " + lbl + ": for faa (" + rows.length + ")"
    : "  " + lbl + ": " + rows.length + " kd · netto " + Math.round(mean(rows.map(e => e.net))) +
    " · loen " + Math.round(mean(rows.map(e => e.wages))) +
    " · netto/loen " + (mean(rows.map(e => e.net)) / (mean(rows.map(e => e.wages)) || 1)).toFixed(2);
  console.log("\n  --- League Three er to forskellige klubber ---");
  console.log(line("aldrig rykket ned ", fresh));
  console.log(line("efter en nedrykning", crashed));
}

/* ---------------------------------------------------------------------
   MODE pages — C1 og C2, de to nye HELSIDER.

   Pakke 0's blindgyde var ikke en fejl i en formel: indbakken havde
   handlere for otte beskedtyper og knapper for to, saa hele bud-sporet
   var doedt i maanedsvis uden at nogen vagt sagde noget. Nu kommer to
   sider fulde af knapper paa én gang. Sonden stiller fire spoergsmaal,
   og maaler dem paa RENDERET markup, ikke paa kildekoden:

     1. kan hver knap NAAS?          (er udtrykket til stede i markup)
     2. GOER hver knap noget?        (aendrer den spillets tilstand)
     3. kan man komme UD af siden?   (findes et udgangs-udtryk)
     4. kan en post ende i en tilstand hvor den hverken kan accepteres
        eller afvises?               (aaben post uden ét eneste knap-udtryk)

   Nr. 4 er den vigtige. Den maales pr. RENDER: for hver post der er
   ANKOMMET og ikke afgjort, skal der findes mindst ét knap-udtryk der
   peger paa netop dens indeks.
--------------------------------------------------------------------- */
function byIdIn(G, pid) {
  return (G.squad || []).some(p => p.id === pid);
}
function stateFingerprint(G, screen) {
  /* Et billigt fingeraftryk af det en knap kan taenkes at flytte. Bevidst
     groft: formaalet er "skete der NOGET", ikke "hvad". */
  try {
    return [G.balance, G.md, G.season, G.squad.length, G.fanMood, G.inbox.length,
      G.dl ? G.dl.shown + ":" + G.dl.events.filter(e => e.done).length : "-",
      G.offerId, G.news.length, G.layer,
      G.squad.reduce((s, p) => s + p.conf, 0),
      JSON.stringify(G.fac), JSON.stringify(G.facOff), screen === undefined ? "" : screen].join("|");
  } catch (e) { return "err"; }
}
function modePages() {
  console.log("\n══════════ C1 + C2 — DE TO NYE SIDER, NYSGERRIG KLIKKER ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner\n");
  const btn = new Map();        // udtryks-skabelon -> {seen, pressed, moved, label}
  const stuck = [];             // aabne poster uden en eneste knap
  const noExit = [];            // side uden vej ud
  const errors = [];
  let dlRenders = 0, offerRenders = 0, careers = 0, offerCareers = 0, dlCareers = 0;
  let openOffers = 0, dlOpenItems = 0;
  /* Hvor MANGE karrierer rammes, og hvor mange beskeder hver af dem samler
     op. En blindgyde der rammer 1 af 200 er en note; én der rammer hver
     tredje karriere og hober sig op i indbakken er noget andet. */
  const stuckMsgs = new Set(), stuckCareers = new Set(), stuckLife = new Map();
  let maxStuckInInbox = 0, endStuckTotal = 0;
  const tmpl = e => e.replace(/\(\s*-?\d+\s*(,[^)]*)?\)/, "(…)").trim();

  for (let i = 0; i < SEEDS; i++) {
    const seed = seedAt(i);
    let B;
    try { B = boot(seed); } catch (e) { errors.push("seed " + seed + ": boot " + e.message); continue; }
    const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const runExpr = e => { try { vm.runInContext(e, ctx, { filename: "click.js" }); } catch (err) { errors.push("seed " + seed + " · " + e.slice(0, 40) + " KASTEDE: " + String(err.message).slice(0, 80)); } };
    let g = 0;
    while (!Q.G && g++ < 80) {
      const h = B.lastHtml.v;
      const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
      if (hues.length) Q.call("obHue", pick(hues));
      if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
    }
    if (!Q.G) { errors.push("seed " + seed + ": onboarding"); continue; }
    careers++;
    let sawOffer = false, sawDl = false;

    /* Granskningen af én renderet side. Kaldes hver gang vi staar paa den. */
    const auditPage = () => {
      const G = Q.G, scr = Q.screen;
      Q.call("render");
      const html = B.lastHtml.v;
      const exprs = clickExprs(html);
      const recs = buttonRecords(html);
      for (const r of recs) if (r.expr) {
        const k = scr + " · " + tmpl(r.expr);
        const cur = btn.get(k) || { seen: 0, pressed: 0, moved: 0, label: r.label.slice(0, 40) };
        cur.seen++; btn.set(k, cur);
      }
      const hasExit = exprs.some(e => /^(dlClose|closeOffer|go\(|offerDecide)/.test(e.trim()));
      if (!hasExit) noExit.push({ seed, screen: scr, season: G.season, md: G.md });

      if (scr === "deadline" && G.dl) {
        dlRenders++;
        const shown = Math.min(G.dl.shown === undefined ? G.dl.events.length : G.dl.shown, G.dl.events.length);
        for (let ix = 0; ix < shown; ix++) {
          const e = G.dl.events[ix];
          if (!e || e.done) continue;
          dlOpenItems++;
          /* Findes der ÉT knap-udtryk der peger paa netop denne post? */
          const re = new RegExp("(dlHeistSign|dlPanicAccept|dlPanicReject|dlPanicPush|dlPoachHold|dlPoachLet|dlPoachSnub)\\(" + ix + "\\)");
          if (!re.test(html))
            stuck.push({ seed, screen: "deadline", season: G.season, md: G.md, kind: e.kind, ix,
              why: "aaben post uden en eneste knap" });
        }
      }
      if (scr === "offer") {
        offerRenders++;
        const m = (G.inbox || []).find(x => x.id === G.offerId);
        if (m && m.action && !m.done) {
          openOffers++;
          const canAccept = /offerDecide\('accept'\)/.test(html);
          const canReject = /offerDecide\('reject'\)/.test(html);
          const canLeave = /closeOffer\(\)/.test(html);
          /* HVORFOR der ikke er nogen knap er hele forskellen paa en
             maalefejl og et fund. De tre mulige aarsager skilles ad. */
          const gone = !byIdIn(G, m.action.pid);
          if (!(canAccept && canReject)) {
            stuck.push({ seed, screen: "offer", season: G.season, md: G.md, kind: "sellOffer", ix: m.id,
              why: gone ? "spilleren er vaek, men beskeden venter stadig paa svar — den kan ikke afgoeres" : "aabent bud uden knapper, og spilleren er i truppen",
              gone });
            stuckMsgs.add(seed + ":" + m.id); stuckCareers.add(seed);
            const lk = seed + ":" + m.id;
            const life = stuckLife.get(lk) || { first: G.season * 100 + G.md, last: 0 };
            life.last = G.season * 100 + G.md; stuckLife.set(lk, life);
          } else if (!canLeave)
            stuck.push({ seed, screen: "offer", season: G.season, md: G.md, kind: "sellOffer", ix: m.id, why: "kan hverken lukkes eller udsaettes", gone });
        }
      }
      return exprs;
    };

    /* Selve driveren: som traceCareer, men den OPSOEGER tilbudssiden. */
    const driveTicker = () => {
      let n = 0;
      while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
        if (n++ > 20000) break;
        if (B.timers.list.length) B.timers.list[0].fn();
        else if (Q.modal.ht) Q.call("tickHT", null); else break;
      }
      Q.call("closeTicker");
    };
    const target = Q.G.season + SEASONS;
    let prev = null, same = 0, guard = 0;
    try {
      while (Q.G.season < target && guard++ < 400000) {
        if (Q.modal) {
          if (Q.modal === prev) { if (++same > 150) { Q.modal = null; continue; } } else { prev = Q.modal; same = 0; }
          if (Q.modal.type === "ticker") { driveTicker(); continue; }
          Q.call("render");
          const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
          if (!all.length) { Q.modal = null; continue; }
          runExpr(pick(all));
          if (Q.modal && Q.modal.type === "ticker") driveTicker();
          continue;
        }
        prev = null; same = 0;
        if (PAGE_SCREENS.includes(Q.screen)) {
          if (Q.screen === "offer") sawOffer = true; else sawDl = true;
          const exprs = auditPage();
          if (!exprs.length) { if (Q.G.dl) Q.G.dl = null; Q.G.offerId = null; Q.screen = "club"; continue; }
          /* Tryk paa ét udtryk og se om spillet flyttede sig. */
          const e = pick(exprs);
          const k = Q.screen + " · " + tmpl(e);
          const before = stateFingerprint(Q.G, Q.screen);
          runExpr(e);
          const rec = btn.get(k);
          if (rec) { rec.pressed++; if (stateFingerprint(Q.G, Q.screen) !== before) rec.moved++; }
          continue;
        }
        /* C1 naas kun fra indbakken. En bot der aldrig aabner et bud maaler
           ingenting om tilbudssiden -- saa den opsoeges her med vilje. */
        const live = (Q.G.inbox || []).filter(x => x.action && !x.done && x.action.kind === "sellOffer");
        if (live.length && rnd() < 0.9) { Q.call("openOffer", pick(live).id); continue; }
        const G = Q.G;
        if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
        else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
        else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
        else break;
      }
    } catch (e) { errors.push("seed " + seed + ": " + String(e.message).slice(0, 100)); }
    if (sawOffer) offerCareers++;
    if (sawDl) dlCareers++;
    /* Ved karrierens slut: hvor mange ubesvarlige bud staar der tilbage i
       indbakken? De er immune baade mod rydningen og mod udloebet, saa de
       aeder plads i loftet paa 18 for evigt. */
    try {
      const left = (Q.G.inbox || []).filter(x => !x.done && x.action && x.action.kind === "sellOffer" && !byIdIn(Q.G, x.action.pid));
      endStuckTotal += left.length;
      if (left.length > maxStuckInInbox) maxStuckInInbox = left.length;
    } catch (e) { }
  }

  console.log("  karrierer gennemfoert            : " + careers);
  console.log("  naaede tilbudssiden (C1)         : " + offerCareers + " (" + pctOf(offerCareers, careers) + ") · " + offerRenders + " renderinger");
  console.log("  naaede deadline day (C2)         : " + dlCareers + " (" + pctOf(dlCareers, careers) + ") · " + dlRenders + " renderinger");
  console.log("  aabne poster granskede           : " + dlOpenItems + " paa deadline day · " + openOffers + " bud");
  console.log("\n  KNAPPERNE — naas de, og goer de noget?\n");
  console.log("  side · udtryk                                        set    trykket   flyttede spillet");
  const rows = [...btn.entries()].sort((a, b) => b[1].seen - a[1].seen);
  const dead = [];
  for (const [k, v] of rows) {
    const rate = v.pressed ? (100 * v.moved / v.pressed).toFixed(0) + " %" : "—";
    console.log("  " + k.slice(0, 50).padEnd(52) + String(v.seen).padStart(6) + String(v.pressed).padStart(10) + rate.padStart(14));
    if (v.pressed >= 5 && v.moved === 0) dead.push(k);
  }
  console.log("\n  ── DOM ──");
  if (!rows.length) console.log("  ⚠  INGEN knapper set overhovedet — siderne blev aldrig naaet.");
  if (dead.length) { console.log("  ⚠  knapper trykket mindst 5 gange UDEN at flytte noget:"); for (const d of dead) console.log("     · " + d); }
  else if (rows.length) console.log("  ✓  hver knap der blev trykket, flyttede spillet mindst én gang.");
  console.log(noExit.length ? "  ✗  " + noExit.length + " renderinger UDEN en vej ud (foerste: seed " + noExit[0].seed + ", " + noExit[0].screen + " S" + noExit[0].season + " md" + noExit[0].md + ")"
    : "  ✓  hver rendering af de to sider havde mindst én vej ud.");
  if (stuck.length) {
    console.log("  ✗  " + stuck.length + " POSTER DER HVERKEN KUNNE ACCEPTERES ELLER AFVISES:");
    for (const s of stuck.slice(0, 12)) console.log("     · seed " + s.seed + " · " + s.screen + " · " + s.kind + " · S" + s.season + " md" + s.md + " · " + s.why);
    if (stuck.length > 12) console.log("     … og " + (stuck.length - 12) + " mere");
  } else console.log("  ✓  ingen aaben post uden mindst ét svar.");
  if (stuckCareers.size) {
    console.log("\n  ── OMFANG af det ubesvarlige bud ──");
    console.log("     karrierer ramt          : " + stuckCareers.size + " af " + careers + " (" + pctOf(stuckCareers.size, careers) + ")");
    console.log("     forskellige beskeder    : " + stuckMsgs.size);
    console.log("     staar tilbage ved slut  : " + endStuckTotal + " i alt · flest i én indbakke: " + maxStuckInInbox + " (loftet er 18)");
    const lives = [...stuckLife.values()].map(v => v.last - v.first).sort((a, b) => a - b);
    console.log("     levetid (saeson*100+md) : median " + qtl(lives, 0.5) + " · laengst " + lives[lives.length - 1]);
  }
  if (errors.length) { console.log("\n  fejl undervejs (" + errors.length + "):"); for (const e of errors.slice(0, 10)) console.log("     · " + e); }
}

/* ---------------------------------------------------------------------
   MODE stuckoffer — det tvungne scenarie bag fundet i `pages`.

   Tilstanden: en sellOffer-besked staar ubesvaret i indbakken, og spilleren
   forlader truppen ad en ANDEN vej (solgt paa deadline day, sluppet i en
   administration, gaaet paa pension ved saesonskiftet). Beskeden venter
   stadig paa svar. Spoergsmaalet er, om den nogensinde kan afgoeres.

   Maales paa BEGGE udgaver af koden, saa det kan afgoeres om C1 indfoerte
   den eller bare arvede den. Kraever --oldfile=.
--------------------------------------------------------------------- */
function stuckOfferOn(srcText, label, seed) {
  const { sandbox, timers, lastHtml } = makeSandbox();
  const ctx = vm.createContext(sandbox);
  const rnd = mulberry32(seed);
  sandbox.__rnd = rnd;
  vm.runInContext("Math.random = __rnd;", ctx);
  vm.runInContext(srcText + BRIDGE, ctx, { filename: "proto-stuck.js" });
  const Q = ctx.__Q, B = { Q, ctx, rnd, timers, lastHtml, sandbox };
  const pick = a => a[Math.floor(rnd() * a.length)];
  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", pick(hues));
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  if (!Q.G) return { label, err: "onboarding" };
  const G = Q.G;

  /* 1) et aegte bud paa en aegte spiller, lavet af spillets egen kode. */
  const p = G.squad[0];
  const bid = Math.max(1000, Math.round((p.value || 50000)));
  let action;
  if (typeof ctx.makeSellOffer === "function") action = Q.call("makeSellOffer", p, bid, 0);
  else action = { kind: "sellOffer", pid: p.id, bid, club: G.teams[0].name, demanded: false };
  Q.call("msg", "En klub", "CL", "Bud paa " + p.name, "De vil have ham.", action);
  const m = G.inbox[0];

  /* 2) han forlader truppen ad en anden vej. Det er ikke et kunstgreb:
     deadline day, administrationen og pensionen goer praecis det her. */
  G.squad = G.squad.filter(x => x.id !== p.id);

  /* 3) kan beskeden afgoeres? Foerst: hvad TILBYDER indbakken? */
  Q.screen = "inbox"; Q.call("render");
  const inboxHtml = lastHtml.v;
  const inboxBtns = clickExprs(inboxHtml).filter(e => new RegExp("\\(" + m.id + "[,)]").test(e));

  /* Og hvad tilbyder tilbudssiden, hvis den findes? */
  let offerBtns = [], hasOfferPage = typeof ctx.openOffer === "function";
  if (hasOfferPage) {
    Q.call("openOffer", m.id);
    Q.call("render");
    offerBtns = clickExprs(lastHtml.v);
  }

  /* 4) overlever beskeden 30 kampdagsskift? */
  let survived = 0;
  for (let i = 0; i < 30; i++) {
    if (typeof ctx.sweepInbox === "function") Q.call("sweepInbox");
    if (typeof ctx.expireMessages === "function") { G.md += 1; Q.call("expireMessages"); }
    if (G.inbox.some(x => x.id === m.id && !x.done)) survived++;
  }
  /* 5) kan en spiller overhovedet trykke den vaek? Proev hver knap der findes. */
  let resolvedBy = null;
  for (const e of [...inboxBtns, ...offerBtns]) {
    if (/delMsg/.test(e)) continue;    // at SLETTE er ikke at BESVARE
    const snapshot = G.inbox.find(x => x.id === m.id);
    if (!snapshot || snapshot.done) break;
    try { vm.runInContext(e, ctx); } catch (err) { }
    const after = G.inbox.find(x => x.id === m.id);
    if (!after || after.done) { resolvedBy = e; break; }
  }
  /* 6) Og hvis man bare SPILLER VIDERE? Det afgoer alvoren: en blindgyde der
     forsvinder af sig selv efter to kampdage er en irritation; én der bliver
     staaende resten af karrieren spiser en plads i loftet paa 18 for evigt. */
  let gone = null, wasDone = false;
  if (G.inbox.some(x => x.id === m.id && !x.done)) {
    const B2 = { Q, ctx, rnd, timers, lastHtml, sandbox };
    for (let md = 1; md <= 120 && gone === null; md++) {
      try { driveCareer(B2, 0); } catch (e) { }
      const before = Q.G.md + Q.G.season * 100;
      try {
        if (Q.G.phase === "season" && Q.G.md < Q.G.rounds) Q.call("playMatchday");
        else if (Q.G.phase === "season") Q.call("afterMatchday");
        else if (/playoff/.test(Q.G.phase)) Q.call("playPlayoff");
      } catch (e) { break; }
      if (PAGE_SCREENS.includes(Q.screen)) { if (Q.G.dl) Q.call("dlClose"); Q.screen = "club"; }
      let g2 = 0;
      while (Q.modal && g2++ < 60) { const t = Q.modal.type; Q.modal = null; if (t === "ticker") break; }
      const found = (Q.G.inbox || []).find(x => x.id === m.id);
      if (!found) { gone = md; }
      else if (found.done) { gone = md; wasDone = true; }
      if (Q.G.md + Q.G.season * 100 === before && md > 60) break;
    }
  }
  return { label, inboxBtns, offerBtns: offerBtns.filter(e => /offerDecide|actMsg/.test(e)),
    hasOfferPage, survived, resolvedBy, gone, wasDone,
    stillOpen: G.inbox.some(x => x.id === m.id && !x.done) };
}
function modeStuckOffer() {
  console.log("\n══════════ ET UBESVARLIGT BUD — tvunget scenarie ══════════");
  console.log("  Et bud staar ubesvaret. Spilleren forlader truppen ad en anden vej.");
  console.log("  Kan beskeden derefter afgoeres?\n");
  const cases = [{ src: SRC, label: "branchen (nightly/oejeblikke)" }];
  const old = arg("oldfile", "");
  if (old) cases.push({ src: srcOf(path.resolve(old)), label: "gammel kode (" + path.basename(old) + ")" });
  for (const c of cases) {
    let bad = 0, n = 0; let sample = null; const res = [];
    for (let i = 0; i < Math.max(1, Math.min(SEEDS, 30)); i++) {
      const r = stuckOfferOn(c.src, c.label, seedAt(i));
      if (r.err) continue;
      n++; if (r.stillOpen) bad++;
      res.push(r);
      if (!sample) sample = r;
    }
    console.log("  ── " + c.label);
    if (!sample) { console.log("     kunne ikke opsaettes\n"); continue; }
    console.log("     indbakkens knapper til beskeden : " + (sample.inboxBtns.length ? sample.inboxBtns.map(x => x.slice(0, 34)).join(" · ") : "INGEN"));
    console.log("     tilbudssidens beslutningsknapper: " + (sample.hasOfferPage ? (sample.offerBtns.length ? sample.offerBtns.join(" · ") : "INGEN") : "(siden findes ikke i denne udgave)"));
    console.log("     overlevede 30 kampdagsskift     : " + sample.survived + " af 30");
    console.log("     kunne besvares ved at trykke    : " + (sample.resolvedBy ? "JA — " + sample.resolvedBy : "NEJ — ingen knap afgoer den"));
    console.log("     stadig ubesvaret bagefter       : " + bad + " af " + n + (bad ? "  ✗ BLINDGYDE" : "  ✅"));
    const lived = res.filter(r => r.stillOpen === false || r.gone !== null);
    const never = res.filter(r => r.stillOpen && r.gone === null).length;
    const gones = res.filter(r => r.gone !== null).map(r => r.gone).sort((a, b) => a - b);
    console.log("     spillet 120 kampdage videre     : forsvandt efter " + (gones.length ? "median " + qtl(gones, 0.5) + " kampdage (" + gones.length + " af " + n + ")" : "aldrig") +
      (never ? " · " + never + " stod stadig ubesvaret efter 120 kampdage" : ""));
    const bydone = res.filter(r => r.wasDone).length;
    if (gones.length) console.log("     ...og forsvandt ved at blive     : " + (bydone ? bydone + " markeret done · " : "") + (gones.length - bydone) + " fjernet fra indbakken");
    console.log("");
  }
}


/* ---------------------------------------------------------------------
   MODE mood — QA's N2: "vejen tilbage" fra vreden.
   easeMood() er trukket ud i egen funktion saa harness'en kan kalde den.
   Men harness'en kalder den SELV -- den maaler altsaa funktionen, ikke at
   spillet bruger den. Denne sonde maaler kun spillets EGEN gennemspilning:
   hvor tit staar klubben i protest, og hvor koldt bliver der.
--------------------------------------------------------------------- */
function modeMood() {
  console.log("\n══════════ N2 — VEJEN TILBAGE FRA VREDEN (kun spillets egen gang) ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner\n");
  const rows = [];
  let careers = 0, everBoycott = 0, everProtest = 0, endProtest = 0;
  for (let i = 0; i < SEEDS; i++) {
    const r = traceCareer(seedAt(i), SEASONS);
    if (r.err || !r.md.length) continue;
    careers++;
    rows.push(...r.md);
    if (r.md.some(e => e.protest >= 3)) everBoycott++;
    if (r.md.some(e => e.protest >= 1)) everProtest++;
    if (r.md[r.md.length - 1].protest >= 1) endProtest++;
  }
  const lvl = [0, 0, 0, 0];
  for (const e of rows) lvl[e.protest || 0]++;
  console.log("  karrierer                   : " + careers + " · " + rows.length + " kampdage");
  console.log("  gennemsnitlig stemning      : " + mean(rows.map(e => e.mood)).toFixed(1));
  console.log("  kampdage pr. protesttrin    : ro " + pctOf(lvl[0], rows.length) + " · bannere " + pctOf(lvl[1], rows.length) +
    " · tavshed " + pctOf(lvl[2], rows.length) + " · boykot " + pctOf(lvl[3], rows.length));
  console.log("  karrierer der naaede protest: " + pctOf(everProtest, careers) + " · boykot " + pctOf(everBoycott, careers));
  console.log("  ...og SLUTTEDE i protest    : " + pctOf(endProtest, careers) +
    (endProtest / Math.max(1, careers) > 0.5 ? "   ⚠ vejen tilbage findes ikke i praksis" : ""));
}

/* ---------------------------------------------------------------------
   MODE b4 — nat 7's farligste aendring, maalt ved A/B paa SAMME seeds.
   Prisskalaen fik hoejere spaend OG hoejere efterspoergsel. Spoergsmaalet
   er ikke "er tallene pæne" men "gik Premier fra dyrest til pengemaskine".
   Derfor koeres hver seed to gange: én gang med branchens skala, én gang
   med League Threes kolonne i alle fire divisioner. Alt andet er ens.
--------------------------------------------------------------------- */
function b4Collect(seeds, seasons) {
  const per = [[], [], [], []];   // kampdage pr. division
  const runs = [];
  for (let i = 0; i < seeds; i++) {
    const r = traceCareer(1000 + i * 7919, seasons);
    if (r.err) continue;
    runs.push(r);
    for (const e of r.md) if (e.div >= 0 && e.div < 4) per[e.div].push(e);
  }
  return { per, runs };
}
function b4Row(rows) {
  if (rows.length < 50) return null;
  const nets = rows.map(e => e.net).sort((a, b) => a - b);
  const w = mean(rows.map(e => e.wages)) || 1;
  return {
    n: rows.length, net: mean(nets), med: qtl(nets, 0.5),
    wage: w, gl: mean(nets) / w, sl: (qtl(nets, 0.75) - qtl(nets, 0.25)) / w,
    att: mean(rows.filter(e => e.home).map(e => e.att)),
    gate: mean(rows.filter(e => e.home).map(e => e.gate))
  };
}
function modeB4() {
  console.log("\n══════════ B4 — PRISSKALAEN PR. DIVISION (A/B paa samme seeds) ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner, hver koert TO gange\n");
  console.log("  ... koerer branchens kode");
  const now = b4Collect(SEEDS, SEASONS);
  console.log("  ... koerer samme seeds med B4 rullet tilbage (flad skala)");
  SRC_VARIANT = srcWithFlatTicketScale();
  const flat = b4Collect(SEEDS, SEASONS);
  SRC_VARIANT = null;

  console.log("\n  netto pr. kampdag — MED B4 (branchen) mod UDEN B4 (flad skala)\n");
  console.log("  div            kampdage   uden B4     med B4    aendring   spaend/loen u→m   tilskuere u→m");
  const verdict = [];
  for (let d = 0; d < 4; d++) {
    const A = b4Row(flat.per[d]), Bn = b4Row(now.per[d]);
    if (!A || !Bn) { console.log("  " + DIVN[d].padEnd(14) + "  for faa kampdage (uden " + flat.per[d].length + " / med " + now.per[d].length + ")"); continue; }
    verdict.push({ d, a: A, b: Bn });
    console.log("  " + DIVN[d].padEnd(14) +
      (A.n + "/" + Bn.n).padStart(10) +
      String(Math.round(A.net)).padStart(10) +
      String(Math.round(Bn.net)).padStart(11) +
      ((Bn.net - A.net >= 0 ? "+" : "") + Math.round(Bn.net - A.net)).padStart(11) +
      ("  " + A.sl.toFixed(2) + "→" + Bn.sl.toFixed(2)).padStart(18) +
      ("  " + Math.round(A.att) + "→" + Math.round(Bn.att)).padStart(16));
  }
  /* Den ene saetning der afgoer om B4 skal rulles tilbage: er TOPPEN blevet
     bedre end BUNDEN at drive klub i? Det er praecis den yderlighed planens
     egen balanceadvarsel udpeger. */
  const top = verdict.find(v => v.d === 0), bot = verdict.find(v => v.d === 3);
  console.log("");
  if (top && bot) {
    const wasTopWorse = top.a.net < bot.a.net, isTopWorse = top.b.net < bot.b.net;
    console.log("  Premier mod League Three, netto pr. kampdag:");
    console.log("    uden B4: " + Math.round(top.a.net) + " mod " + Math.round(bot.a.net) + "  → toppen er " + (wasTopWorse ? "DYREST" : "rigest"));
    console.log("    med B4:  " + Math.round(top.b.net) + " mod " + Math.round(bot.b.net) + "  → toppen er " + (isTopWorse ? "DYREST" : "RIGEST"));
    if (wasTopWorse && !isTopWorse) console.log("\n  ⚠  B4 VENDTE FORTEGNET: toppen gik fra dyrest til rigest. Kuren er vaerre end sygdommen.");
    else if (!isTopWorse) console.log("\n  ⚠  Toppen er rigest — men var det ogsaa uden B4. B4 er ikke ene aarsag.");
    else console.log("\n  ✓  Toppen er stadig det dyreste sted at drive klub.");
  }
  /* Og formen: spaend÷loen skal vaere den SAMME i alle fire divisioner, for
     det er den paastand nat 7 bygger hele forsvaret for B4 paa. */
  if (verdict.length >= 3) {
    const sls = verdict.map(v => v.b.sl), sla = verdict.map(v => v.a.sl);
    console.log("\n  spaend/loen (kurvens FORM — nat 7 paastaar den er ens i alle divisioner):");
    console.log("    uden B4: " + sla.map(x => x.toFixed(2)).join("  ") + "   top:bund " + (sla[0] / sla[sla.length - 1]).toFixed(2));
    console.log("    med B4:  " + sls.map(x => x.toFixed(2)).join("  ") + "   top:bund " + (sls[0] / sls[sls.length - 1]).toFixed(2));
  }
  return { now, flat, verdict };
}

/* ---------------------------------------------------------------------
   MODE usage — mandat 6: hvor ofte fyrer hver mekanik? Alt under 1 %
   af KARRIERERNE er dodt eller fejltunet.
--------------------------------------------------------------------- */
function modeUsage() {
  console.log("\n══════════ SYSTEMBRUGS-AUDIT — fyrer nattens mekanik overhovedet? ══════════");
  console.log("  " + SEEDS + " seeds × " + SEASONS + " saesoner\n");
  const runs = [];
  for (let i = 0; i < SEEDS; i++) {
    const r = traceCareer(1000 + i * 7919, SEASONS);
    if (!r.err) runs.push(r);
  }
  const n = runs.length;
  const keys = new Set();
  for (const r of runs) for (const k of r.fire.keys()) keys.add(k);

  const rows = [...keys].map(k => {
    const careers = runs.filter(r => (r.fire.get(k) || 0) > 0).length;
    const total = runs.reduce((s, r) => s + (r.fire.get(k) || 0), 0);
    return { k, careers, pct: 100 * careers / n, total, per: total / n };
  }).sort((a, b) => a.pct - b.pct);

  console.log("  mekanik                            karrierer   andel     i alt   pr.karriere");
  for (const r of rows) {
    const flag = r.pct < 1 ? "  ← DOEDT (<1 %)" : r.pct < 10 ? "  ← sjaeldent" : "";
    console.log("  " + r.k.padEnd(34) + String(r.careers).padStart(8) +
      String(r.pct.toFixed(1) + " %").padStart(10) + String(r.total).padStart(9) +
      String(r.per.toFixed(2)).padStart(12) + flag);
  }

  /* B2's tilstandsmaskine, samlet op fra alle karrierer. */
  const facBad = runs.flatMap(r => r.facBad || []);
  const facStuck = runs.flatMap(r => r.facStuck || []);
  console.log("\n  --- B2: kan en facilitet ende hverken aaben eller lukket? ---");
  if (!facBad.length) console.log("  ingen ugyldig facilitetstilstand paa nogen kampdag i nogen karriere ✅");
  else {
    console.log("  " + facBad.length + " ugyldige tilstande ✗");
    const by = new Map();
    for (const f of facBad) by.set(f.why.replace(/\d+/g, "N"), (by.get(f.why.replace(/\d+/g, "N")) || 0) + 1);
    for (const [w, c] of by) console.log("     · " + c + "× " + w);
    for (const f of facBad.slice(0, 5)) console.log("       seed " + f.seed + " S" + f.season + " md" + f.md + " · " + f.key + " · " + f.why);
  }
  console.log("  --- B2: bliver genaabningen faerdig? ---");
  if (!facStuck.length) console.log("  intet byggeri og ingen genaabning stod aabent i over 40 kampdage ✅");
  else {
    console.log("  " + facStuck.length + " byggerier/genaabninger staaende i over 40 kampdage ✗");
    for (const f of facStuck.slice(0, 5)) console.log("     · seed " + f.seed + " S" + f.season + " md" + f.md + " · " + f.key + (f.reopen ? " (genaabning)" : " (byggeri)") + " · " + f.mds + " kampdage, " + f.stalled + " uden fremdrift");
  }

  // forventningsmoedet (pakke 19): bliver maalsaetningen faktisk forhandlet?
  const seasons = runs.flatMap(r => r.seasons);
  const bold = seasons.filter(s => s.objectiveBold > 0).length;
  const timid = seasons.filter(s => s.objectiveBold < 0).length;
  const asIs = seasons.filter(s => s.objectiveBold === 0).length;
  console.log("\n  --- pakke 19: forventningsmoedets tre veje (pr. saeson, n=" + seasons.length + ") ---");
  console.log("  modig (accepterer hoejere krav) : " + bold + "  " + pctOf(bold, seasons.length));
  console.log("  presser maalsaetningen ned      : " + timid + "  " + pctOf(timid, seasons.length));
  console.log("  tager den som den er            : " + asIs + "  " + pctOf(asIs, seasons.length));
  const hitBold = seasons.filter(s => s.objectiveBold > 0 && s.histPos != null && s.histPos <= s.objectivePos).length;
  const hitTimid = seasons.filter(s => s.objectiveBold < 0 && s.histPos != null && s.histPos <= s.objectivePos).length;
  const hitAsIs = seasons.filter(s => s.objectiveBold === 0 && s.histPos != null && s.histPos <= s.objectivePos).length;
  console.log("  rammer maalet: modig " + pctOf(hitBold, bold) + " · presset " + pctOf(hitTimid, timid) +
    " · som den er " + pctOf(hitAsIs, asIs));

  // karrierens levetid: hvor mange naar overhovedet slutningen?
  const full = runs.filter(r => r.seasons.length >= SEASONS - 1).length;
  console.log("\n  karrierer der naaede saeson " + SEASONS + ": " + full + " af " + n + " (" + pctOf(full, n) + ")");
  const lens = runs.map(r => r.seasons.length).sort((a, b) => a - b);
  console.log("  saesoner spillet: median " + qtl(lens, 0.5) + " · p10 " + qtl(lens, 0.1) + " · p90 " + qtl(lens, 0.9));
  const ex = new Map();
  for (const r of runs) ex.set(r.exit, (ex.get(r.exit) || 0) + 1);
  // pakke 16: hvorfor beder droemmeren aldrig om at komme vaek?
  const dropSeasons = seasons.filter(s => s.wentDown);
  if (dropSeasons.length) {
    const withDreamer = dropSeasons.filter(s => s.hadDreamer > 0).length;
    const bigSquad = dropSeasons.filter(s => s.squadAt > 13).length;
    const both = dropSeasons.filter(s => s.hadDreamer > 0 && s.squadAt > 13).length;
    console.log("\n  --- pakke 16: droemmerens transferanmodning ved nedrykning ---");
    console.log("  nedrykninger i alt          : " + dropSeasons.length);
    console.log("  ...med en droemmer i truppen: " + withDreamer + "  " + pctOf(withDreamer, dropSeasons.length));
    console.log("  ...med trup > 13            : " + bigSquad + "  " + pctOf(bigSquad, dropSeasons.length));
    console.log("  ...BEGGE (betingelsen holder): " + both + "  " + pctOf(both, dropSeasons.length));
    const at = dropSeasons.filter(s => s.atCheck);
    if (at.length) {
      const atBoth = at.filter(s => s.atCheck.dreamers > 0 && s.atCheck.squad > 13).length;
      console.log("  MAALT PAA SELVE TJEKPUNKTET (efter kontraktudloeb + applyRetirements):");
      console.log("    gns. trup dér " + (mean(at.map(s => s.atCheck.squad))).toFixed(2) +
        " · droemmer til stede " + pctOf(at.filter(s => s.atCheck.dreamers > 0).length, at.length) +
        " · trup>13 " + pctOf(at.filter(s => s.atCheck.squad > 13).length, at.length) +
        " · BEGGE " + atBoth + " (" + pctOf(atBoth, at.length) + ")");
    }
    console.log("  faktisk udsendt (maalt paa teksten): " +
      runs.reduce((s, r) => s + (r.fire.get("txt:dreamerWantsOut") || 0), 0));
  }
  console.log("  hvorfor karrieren stoppede:");
  for (const [k, v] of [...ex].sort((a, b) => b[1] - a[1])) console.log("    " + String(k).padEnd(28) + v + "  " + pctOf(v, n));
}

/* ---------------------------------------------------------------------
   MODE floor — TVUNGET bundtest: saet klubben sidst i League Three
--------------------------------------------------------------------- */
function modeFloor() {
  console.log("\n══════════ TVUNGET BUNDTEST — kan man rykke ud af League Three? ══════════");
  let bad = 0, n = 0;
  for (let i = 0; i < Math.min(SEEDS, 40); i++) {
    const seed = 5000 + i * 104729;
    const B = bootPlaying(seed, 0);
    const Q = B.Q;
    if (!Q.G) continue;
    n++;
    Q.G.div = 3;
    const rows = Q.G.teams.length + 1;
    // sidsteplads, naestsidste, og tredjesidste
    for (const pos of [rows, rows - 1, rows - 2]) {
      const spot = Q.call("relegationSpot", pos, rows);
      if (spot) { bad++; console.log("  seed " + seed + ": relegationSpot(" + pos + "," + rows + ") = true i div 3 ✗"); }
    }
    // og at det ogsaa gaelder for de tre andre divisioner (dér SKAL den vaere true)
    if (i === 0) {
      for (let d = 0; d <= 3; d++) {
        Q.G.div = d;
        console.log("  div " + d + " (" + DIVN[d] + ") · sidsteplads " + rows + " af " + rows +
          " -> rykker ned: " + Q.call("relegationSpot", rows, rows));
      }
      Q.G.div = 3;
    }
  }
  console.log("  " + n + " seeds afproevet paa de tre nederste pladser i League Three · overtraedelser: " +
    (bad ? bad + " ✗" : "0 ✅"));
}

/* =====================================================================
   MIGRATE (nat 7) — kan en RIGTIG gammel gemmefil indlaeses af koden efter
   R1a-R1c? NIGHT-REPORT-6 paastaar at loadGame folder gamle fondspenge
   tilbage i kassen. Det er en paastand om en migrering, og en migrering kan
   kun efterproeves med en gemmefil der er skrevet af den GAMLE kode.
   Metoden: spil en karriere i den gamle prototype (--oldfile=), tag den
   raa localStorage-blob den selv skrev, plant den i en frisk sandkasse med
   den NYE prototype, kald loadGame() og spil videre.
===================================================================== */
function bootFile(srcText, seed) {
  const { sandbox, timers, lastHtml } = makeSandbox();
  const ctx = vm.createContext(sandbox);
  const rnd = mulberry32(seed);
  sandbox.__rnd = rnd;
  vm.runInContext("Math.random = __rnd;", ctx);
  vm.runInContext(srcText + BRIDGE, ctx, { filename: "proto-migrate.js" });
  return { ctx, Q: ctx.__Q, rnd, timers, lastHtml, sandbox };
}
function srcOf(file) {
  const m = fs.readFileSync(file, "utf8").match(/<script>([\s\S]*?)<\/script>/);
  if (!m) { console.error("FEJL: ingen <script>-blok i " + file); process.exit(2); }
  return m[1];
}
/* Samme klikker-driver som bootPlaying, men mod en vilkaarlig sandkasse. */
function driveCareer(B, seasons) {
  const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
  const pick = a => a[Math.floor(rnd() * a.length)];
  let g = 0;
  while (!Q.G && g++ < 80) {
    const h = B.lastHtml.v;
    const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
    if (hues.length) Q.call("obHue", pick(hues));
    if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
  }
  if (!Q.G || !seasons) return B;
  const runExpr = e => { try { vm.runInContext(e, ctx); } catch (err) { } };
  const driveTicker = () => {
    let n = 0;
    while (Q.modal && Q.modal.type === "ticker" && !Q.modal.ft) {
      if (n++ > 20000) break;
      if (B.timers.list.length) B.timers.list[0].fn();
      else if (Q.modal.ht) Q.call("tickHT", null); else break;
    }
    Q.call("closeTicker");
  };
  const target = Q.G.season + seasons;
  let prev = null, same = 0, guard = 0;
  while (Q.G.season < target && guard++ < 300000) {
    if (Q.modal) {
      if (Q.modal === prev) { if (++same > 150) { Q.modal = null; continue; } } else { prev = Q.modal; same = 0; }
      if (Q.modal.type === "ticker") { driveTicker(); continue; }
      Q.call("render");
      const all = clickExprs(B.lastHtml.v).filter(e => e && !/^skipTicker/.test(e));
      if (!all.length) { Q.modal = null; continue; }
      runExpr(pick(all));
      if (Q.modal && Q.modal.type === "ticker") driveTicker();
      continue;
    }
    prev = null; same = 0;
    /* C1/C2: de to helsider skal drives, ellers spiller playMatchday() aldrig. */
    if (drivePageScreen(Q, B, pick, runExpr, B.pageLog || (B.pageLog = {}))) continue;
    const G = Q.G;
    if (G.phase === "season" && G.md < G.rounds) Q.call("playMatchday");
    else if (G.phase === "playoff_semi" || G.phase === "playoff_final") Q.call("playPlayoff");
    else if (G.phase === "season" && G.md >= G.rounds) Q.call("afterMatchday");
    else break;
  }
  return B;
}

function modeMigrate() {
  const OLD_FILE = path.resolve(arg("oldfile", ""));
  if (!arg("oldfile", "")) { console.error("modeMigrate kraever --oldfile=<gammel prototype.html>"); process.exit(2); }
  const OLD_SRC = srcOf(OLD_FILE);
  const NEW_SRC = SRC;
  const SEASONS_OLD = parseInt(arg("oldseasons", "3"), 10);
  console.log("\n══════════ GEMMEFIL-MIGRERING — gammel karriere ind i ny kode ══════════");
  console.log("  gammel: " + path.basename(OLD_FILE) + "   ny: " + path.basename(HTML_FILE));

  let made = 0, withFund = 0, loaded = 0, crashed = 0, foldedOk = 0, foldedBad = 0, played = 0, playCrash = 0;
  /* En migreringsprøve er kun værd noget hvis den gamle gemmefil FAKTISK
     indeholder det der skal migreres. Uden de her tællere kan sonden vaere
     groen fordi den gamle bot aldrig byggede en facilitet. */
  let oldHadBasics = 0, oldHadAnyFac = 0, basicsCarried = 0, basicsLost = 0, oldHadFacOff = 0;
  const notes = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = seedAt(i);
    /* ---- 1) skriv en gemmefil med den GAMLE kode ---- */
    let raw = null, oldG = null;
    try {
      const A = bootFile(OLD_SRC, seed);
      driveCareer(A, SEASONS_OLD);
      if (!A.Q.G) { notes.push("seed " + seed + ": gammel kode naaede aldrig et spil"); continue; }
      A.Q.call("saveGame");
      raw = A.sandbox.localStorage.getItem("ftco.save.v1");
      oldG = raw ? JSON.parse(raw).G : null;
    } catch (e) { notes.push("seed " + seed + ": gammel kode kastede (" + e.message + ")"); continue; }
    if (!raw || !oldG) { notes.push("seed " + seed + ": ingen gemmefil skrevet"); continue; }
    made++;
    const fund = (oldG.fund || 0), fundBonus = (oldG.fundBonus || 0);
    const balBefore = oldG.balance;
    if (fund > 0 || fundBonus > 0) withFund++;
    const oldFac = oldG.fac || {};
    const oldBasics = Number(oldFac.basics) || 0;
    if (oldBasics > 0) oldHadBasics++;
    if (Object.keys(oldFac).some(k => Number(oldFac[k]) > 0)) oldHadAnyFac++;
    if (oldG.facOff && Object.keys(oldG.facOff).some(k => oldG.facOff[k])) oldHadFacOff++;

    /* ---- 2) plant den i en frisk sandkasse med den NYE kode ---- */
    let B;
    try {
      B = bootFile(NEW_SRC, seed + 1);
      B.sandbox.localStorage.setItem("ftco.save.v1", raw);
      const ok = B.Q.call("loadGame");
      if (!ok) { notes.push("seed " + seed + ": loadGame returnerede false"); crashed++; continue; }
      loaded++;
    } catch (e) { crashed++; notes.push("seed " + seed + ": loadGame KASTEDE — " + e.message); continue; }

    /* ---- 3) blev fondens penge foldet ind, krone for krone? ---- */
    const g2 = B.Q.G;
    const expect = balBefore + Math.round(fund + fundBonus);
    if (g2.balance === expect) foldedOk++;
    else { foldedBad++; notes.push("seed " + seed + ": kasse " + balBefore + " + fond " + fund + "+" + fundBonus + " = forventet " + expect + ", men fik " + g2.balance); }
    for (const dead of ["fund", "fundBonus", "fundTarget", "fundRaided", "mentors", "stuntDone"])
      if (g2[dead] !== undefined) notes.push("seed " + seed + ": dødt felt overlevede loadGame: G." + dead);

    /* ---- 3b) NAT 7's FORMAENDRINGER. B2 aendrer FORMEN paa G.fac fra flag
       til niveauer, og det er en anden slags aendring end at tilfoeje et
       felt: en gammel `true` skal blive til et TAL, og det gamle `basics`
       skal blive til TRE huse. Bliver et flag staaende som boolean, regner
       facLvl() paa det, og en facilitet kan ende paa et niveau der ikke
       findes i BAL-tabellerne. Det maales her, ikke antages. */
    const facKeys = Object.keys(g2.fac || {});
    for (const k of facKeys) {
      const v = g2.fac[k];
      if (typeof v !== "number" || !Number.isFinite(v))
        notes.push("seed " + seed + ": G.fac." + k + " er ikke et tal efter loadGame (" + JSON.stringify(v) + ")");
      else if (v < 0 || v > 12 || v !== Math.round(v))
        notes.push("seed " + seed + ": G.fac." + k + " = " + v + " — uden for et gyldigt niveau");
    }
    if (g2.fac && g2.fac.basics !== undefined)
      notes.push("seed " + seed + ": det gamle samlede G.fac.basics overlevede migreringen");
    /* Kernen i B2's formaendring: de £15.000 der var betalt for "det basale"
       skal staa paa ALLE TRE huse bagefter. Bliver de vaek, mister karrieren
       efterspoergsel, humoer og omsaetning pr. hoved uden at nogen trykkede. */
    if (oldBasics > 0) {
      const got = ["parking", "toilets", "lights"].map(k => (g2.fac || {})[k] | 0);
      if (got.every(v => v === oldBasics)) basicsCarried++;
      else { basicsLost++; notes.push("seed " + seed + ": det basale stod paa niveau " + oldBasics + " i den gamle fil, men blev til [" + got.join(",") + "]"); }
    }
    for (const three of ["parking", "toilets", "lights"])
      if (g2.fac && g2.fac[three] === undefined)
        notes.push("seed " + seed + ": D3's " + three + " findes ikke i G.fac efter loadGame");
    /* Nedlukningen: facOff maa aldrig pege paa noget der ikke er bygget, og
       en genaabning der ikke taeller ned er en facilitet der aldrig aabner. */
    const off = g2.facOff || {};
    for (const k of Object.keys(off)) {
      if (!off[k]) continue;
      if (!(g2.fac || {})[k]) notes.push("seed " + seed + ": facOff." + k + " er sat, men niveauet er 0 — hverken aaben eller lukket");
    }
    if (g2.facBuild && (!Number.isFinite(g2.facBuild.remain) || g2.facBuild.remain < 0))
      notes.push("seed " + seed + ": facBuild.remain = " + (g2.facBuild && g2.facBuild.remain) + " — byggeriet kan ikke blive faerdigt");
    for (const f of ["dl", "offerId", "sponsors", "loans"])
      if (g2[f] === undefined) notes.push("seed " + seed + ": G." + f + " er undefined efter loadGame");
    if (g2.dl && !Array.isArray(g2.dl.events))
      notes.push("seed " + seed + ": G.dl uden events-array — deadline-siden ville vaere tom");
    if ((g2.squad || []).some(p => p.since === undefined))
      notes.push("seed " + seed + ": C3's p.since mangler paa mindst én spiller efter loadGame");
    if ((g2.squad || []).some(p => p.focus !== undefined)) notes.push("seed " + seed + ": p.focus overlevede paa mindst én spiller");
    if ((g2.inbox || []).some(m => m.action && m.action.kind === "stunt")) notes.push("seed " + seed + ": stunt-besked overlevede i indbakken");

    /* ---- 4) kan den indlaeste karriere SPILLES videre? ---- */
    try {
      let html = "";
      B.Q.call("render");
      html = B.lastHtml.v;
      if (/NaN|undefined/.test(html)) notes.push("seed " + seed + ": NaN/undefined i markup umiddelbart efter loadGame");
      driveCareer(B, 2);
      played++;
      /* HVER skaerm, ikke bare den man tilfaeldigvis stod paa -- og med
         konteksten med, saa "NaN" kan spores til det tal der mangler. */
      for (const scr of ["home", "empire", "books", "squad", "market", "club", "table", "inbox"]) {
        try { B.Q.screen = scr; B.Q.call("render"); } catch (e) { notes.push("seed " + seed + ": skaerm '" + scr + "' KASTEDE — " + e.message); continue; }
        const h = B.lastHtml.v;
        const hits = [...h.matchAll(/.{0,45}(NaN|undefined).{0,25}/g)].map(m => m[0].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        for (const x of [...new Set(hits)].slice(0, 2))
          notes.push("seed " + seed + " · skaerm " + scr + ": …" + x + "…");
      }
    } catch (e) { playCrash++; notes.push("seed " + seed + ": KRAK under videre spil — " + e.message); }
  }
  console.log("  gemmefiler skrevet af gammel kode : " + made + " af " + SEEDS);
  console.log("  ...med penge i stadionfonden      : " + withFund);
  console.log("  ...med mindst én facilitet bygget : " + oldHadAnyFac);
  console.log("  ...med \"det basale\" betalt        : " + oldHadBasics + (oldHadBasics ? "" : "  ⚠ INTET at migrere — proeven siger intet om B2"));
  console.log("  ...med en facilitet lukket ned    : " + oldHadFacOff);
  if (oldHadBasics) console.log("  det basale baaret over paa 3 huse : " + basicsCarried + (basicsLost ? "  · TABT: " + basicsLost + " ✗" : "  ✅"));
  console.log("  loadGame lykkedes i ny kode       : " + loaded + (crashed ? "  · fejlede/kastede: " + crashed + " ✗" : "  ✅"));
  console.log("  fondens penge foldet KORREKT ind  : " + foldedOk + (foldedBad ? "  · forkert: " + foldedBad + " ✗" : "  ✅"));
  console.log("  spillede 2 saesoner videre        : " + played + (playCrash ? "  · krak: " + playCrash + " ✗" : "  ✅"));
  if (notes.length) { console.log("\n  bemaerkninger:"); for (const n of notes.slice(0, 40)) console.log("   · " + n); if (notes.length > 40) console.log("   … og " + (notes.length - 40) + " mere"); }
  else console.log("\n  ingen bemaerkninger.");
}

/* =====================================================================
   DILUTION (nat 7) — hvor langt kan ejerandelen falde, og hvad sker der saa?
   Gaten viser "ejerandel ved karrierens slut: min 1 %". Denne sonde folger
   andelen sæson for sæson i hver karriere og optaeller HVOR mange der ender
   under flertal, under 25 og under 10 -- og om spillet nogensinde erklaerer
   det for slut.
===================================================================== */
function modeDilution() {
  console.log("\n══════════ FORTYNDING — hvor langt ned gaar ejerandelen? ══════════");
  const L = [], ends = [];
  let rescueOffers = 0, fatalOffers = 0, accepted = 0, lost = 0, careers = 0;
  let minorityCareers = 0, u25 = 0, u10 = 0, u2 = 0, seasonsAsMinority = 0, seasonsTotal = 0;
  let fatalCareers = 0, offerCareers = 0, overCareers = 0, negShare = 0;
  const worst = { share: 101, seed: 0, season: 0 };
  for (let i = 0; i < SEEDS; i++) {
    const seed = seedAt(i);
    let B, sawFatal = false, sawOffer = false;
    try { B = boot(seed); } catch (e) { continue; }
    const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
    /* instrumentér de tre doere ind og ud af trappen */
    for (const [fn, bump] of [["rescueOffer", null], ["rescueAccept", null], ["loseControl", null]]) {
      const orig = ctx[fn];
      if (typeof orig !== "function") continue;
      ctx[fn] = function () {
        const r = orig.apply(this, arguments);
        if (fn === "rescueOffer" && r === true && Q.modal && Q.modal.type === "rescue") { rescueOffers++; sawOffer = true; if (Q.modal.fatal) { fatalOffers++; sawFatal = true; } }
        if (fn === "rescueAccept") accepted++;
        if (fn === "loseControl") lost++;
        return r;
      };
    }
    try { driveCareer(B, 0); } catch (e) { continue; }
    if (!Q.G) continue;
    careers++;
    let minSeen = Q.G.myShare, minSeason = Q.G.season, wasMinority = false;
    /* spil sæson for sæson, saa andelen kan aflaeses undervejs */
    for (let s = 0; s < SEASONS; s++) {
      try { driveCareer(B, 1); } catch (e) { break; }
      if (!Q.G) break;
      seasonsTotal++;
      const sh = Q.G.myShare;
      if (sh < minSeen) { minSeen = sh; minSeason = Q.G.season; }
      if (sh <= 50) { seasonsAsMinority++; wasMinority = true; }
      if (Q.G.gameOver || Q.G.lost) break;
    }
    ends.push(Q.G ? Q.G.myShare : 0);
    L.push({ seed, min: minSeen, minSeason, end: Q.G ? Q.G.myShare : 0 });
    if (wasMinority) minorityCareers++;
    if (sawFatal) fatalCareers++;
    if (sawOffer) offerCareers++;
    if (Q.G && Q.G.phase === "over") overCareers++;
    if (Q.G && Q.G.myShare < 0) negShare++;
    if (minSeen < 25) u25++;
    if (minSeen < 10) u10++;
    if (minSeen <= 2) u2++;
    if (minSeen < worst.share) { worst.share = minSeen; worst.seed = seed; worst.season = minSeason; }
  }
  ends.sort((a, b) => a - b);
  console.log("  karrierer                          : " + careers + " × op til " + SEASONS + " sæsoner");
  console.log("  redningstilbud i alt               : " + rescueOffers + "  (heraf FATALE: " + fatalOffers + " = " +
    (rescueOffers ? Math.round(100 * fatalOffers / rescueOffers) : 0) + " %)");
  console.log("  redninger taget imod               : " + accepted + "  · klubben faktisk tabt: " + lost);
  console.log("\n  ── DET TAL HARNESS'EN BURDE VISE ──");
  console.log("  karrierer med MINDST ÉT redningstilbud   : " + offerCareers + " af " + careers + " = " +
    (careers ? Math.round(100 * offerCareers / careers) : 0) + " %   <- det harness'en kalder \"trin 5 inden for raekkevidde\"");
  console.log("  karrierer med mindst ét FATALT tilbud    : " + fatalCareers + " af " + careers + " = " +
    (careers ? Math.round(100 * fatalCareers / careers) : 0) + " %   <- det der FAKTISK er inden for raekkevidde (ROADMAP: 5-15 %)");
  console.log("  karrierer der endte i phase=\"over\"      : " + overCareers + " af " + careers);
  console.log("  karrierer med NEGATIV ejerandel          : " + negShare + " af " + careers + "\n");
  console.log("  karrierer der har vaeret i mindretal: " + minorityCareers + " af " + careers +
    " = " + (careers ? Math.round(100 * minorityCareers / careers) : 0) + " %");
  console.log("  laveste andel < 25 %               : " + u25 + "   < 10 %: " + u10 + "   ≤ 2 %: " + u2);
  console.log("  sæsoner spillet som mindretalsejer : " + seasonsAsMinority + " af " + seasonsTotal +
    " = " + (seasonsTotal ? Math.round(100 * seasonsAsMinority / seasonsTotal) : 0) + " %");
  if (ends.length) console.log("  andel ved karrierens slut          : min " + ends[0] + " % · median " +
    ends[Math.floor(ends.length / 2)] + " % · max " + ends[ends.length - 1] + " %");
  if (worst.seed) console.log("  VAERSTE: seed " + worst.seed + " naaede " + worst.share + " % i sæson " + worst.season);
  const deep = L.filter(x => x.min <= 25).sort((a, b) => a.min - b.min).slice(0, 12);
  if (deep.length) { console.log("\n  de dybest fortyndede karrierer (seed · laveste andel · sæson · slutandel):"); for (const d of deep) console.log("   · seed " + d.seed + " · " + d.min + " % · sæson " + d.minSeason + " · slut " + d.end + " %"); }
}

/* =====================================================================
   LOANS (nat 7) — hvor stort er undercountet i "laan optaget"?
   QA's N3 (8/8) konstaterede at harness'ens stats.loansTaken KUN taelles i
   bottens frivillige "loan"-gren, mens resolveBank() kalder samme
   takeLoan(...,"crisis") uden at taelle. Jeg kunne dengang konstatere at
   undercountet fandtes, ikke hvor stort det var -- harness'ens sandkasse
   stubber console. Her instrumenteres takeLoan i MIN sandkasse, hvor jeg ejer
   baade broen og stubbene, saa fordelingen kan laeses direkte.
===================================================================== */
function modeLoans() {
  console.log("\n══════════ LÅNETÆLLEREN — frivillige mod kriselån ══════════");
  let vol = 0, crisis = 0, other = 0, careers = 0, volCash = 0, crisisCash = 0;
  const perCareer = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = seedAt(i);
    let B;
    try { B = boot(seed); } catch (e) { continue; }
    const Q = B.Q, ctx = B.ctx;
    let v = 0, c = 0;
    const orig = ctx.takeLoan;
    if (typeof orig !== "function") { console.log("  takeLoan findes ikke"); return; }
    ctx.takeLoan = function (amount, termMD, kind) {
      if (kind === "crisis") { c++; crisis++; crisisCash += (amount || 0); }
      else if (kind === undefined || kind === null) { v++; vol++; volCash += (amount || 0); }
      else other++;
      return orig.apply(this, arguments);
    };
    try { driveCareer(B, SEASONS); } catch (e) { }
    if (!Q.G) continue;
    careers++;
    perCareer.push({ seed, v, c });
  }
  const tot = vol + crisis + other;
  console.log("  karrierer maalt (min klikker)      : " + careers + " × " + SEASONS + " sæsoner");
  console.log("  takeLoan-kald i alt                : " + tot);
  console.log("   · frivillige (bankmodalen)        : " + vol + "  = " + (tot ? Math.round(100 * vol / tot) : 0) + " %   " + fmtGbpQ(volCash));
  console.log("   · KRISELÅN (resolveBank)          : " + crisis + "  = " + (tot ? Math.round(100 * crisis / tot) : 0) + " %   " + fmtGbpQ(crisisCash));
  if (other) console.log("   · anden kind=                     : " + other);
  console.log("");
  console.log("  harness'ens stats.loansTaken taeller KUN den frivillige gren.");
  console.log("  => undercount: " + crisis + " af " + tot + " laan = " +
    (tot ? Math.round(100 * crisis / tot) : 0) + " % af alle laan er usynlige for --stats.");
  const withCrisisOnly = perCareer.filter(p => p.c > 0 && p.v === 0).length;
  console.log("  karrierer med UDELUKKENDE kriselaan (rapporteres som 0): " + withCrisisOnly + " af " + careers);
}
function fmtGbpQ(n) { return "£" + Math.round(n).toLocaleString("en-GB"); }

/* =====================================================================
   R2 (nat 7) — overlever karrieren eksport/import, og holder loeftet om at
   en oedelagt kode ikke koster noget?
   WORKPLAN-ROBUST's invariant: "eksport->import af en koerende karriere er
   tabsfri ... en oedelagt kode afvises UDEN AT ROERE det eksisterende gem".
   Modalen siger det samme til spilleren: "Intet er ændret — dit eksisterende
   gem er urørt." Det er praecis den slags loefte der skal efterproeves med
   koder der er onde paa den rigtige maade -- ikke bare med rent gibberish.
===================================================================== */
function modeR2() {
  console.log("\n══════════ R2 — EKSPORT/IMPORT OG LØFTET OM DET URØRTE GEM ══════════");
  let rt = 0, rtBad = 0, n = 0;
  const sizes = [];
  /* onde koder: hver enkelt SKAL afvises uden at oedelaegge det gemte */
  const EVIL = [
    ["rent gibberish", "ikke json overhovedet"],
    ["tom streng", ""],
    ["gyldig json, forkert form", '{"hello":"world"}'],
    ["v-feltet forkert", '{"v":2,"G":{"club":"X","squad":[],"teams":[]}}'],
    ["G mangler", '{"v":1}'],
    ["SKALLET GYLDIG, indmad tom", '{"v":1,"G":{"club":"Spøgelse FC","squad":[],"teams":[]}}'],
    ["SKALLET GYLDIG, squad er skrald", '{"v":1,"G":{"club":"Spøgelse FC","squad":[null,3,"x"],"teams":[],"market":[],"freeAgents":[]}}']
  ];
  for (let i = 0; i < Math.min(SEEDS, 25); i++) {
    const seed = seedAt(i);
    let B;
    try { B = boot(seed); driveCareer(B, 2); } catch (e) { continue; }
    const Q = B.Q;
    if (!Q.G) continue;
    n++;
    /* --- 1) tabsfri rundtur --- */
    const code = Q.call("exportCareerText");
    sizes.push(String(code).length);
    const before = JSON.stringify(Q.G);
    let ok = false;
    try { ok = Q.call("importCareerText", code); } catch (e) { }
    const after = Q.G ? JSON.stringify(Q.G) : "";
    if (ok && after === before) rt++;
    else { rtBad++; if (rtBad <= 3) console.log("   ✗ seed " + seed + ": rundturen er IKKE tabsfri (ok=" + ok + ", ens=" + (after === before) + ")"); }

    /* --- 2) hver ond kode: bliver det gemte roert? --- */
    for (const [label, evil] of EVIL) {
      const savedBefore = B.sandbox.localStorage.getItem("ftco.save.v1");
      let res = null, threw = null;
      try { res = Q.call("importCareerText", evil); } catch (e) { threw = e.message; }
      const savedAfter = B.sandbox.localStorage.getItem("ftco.save.v1");
      const touched = savedBefore !== savedAfter;
      const key = label + (res === true ? " · ACCEPTERET" : "") + (threw ? " · KASTEDE" : "") + (touched ? " · GEMMET ØDELAGT" : "");
      EVILRES.set(key, (EVILRES.get(key) || 0) + 1);
      /* saet gemmet tilbage saa naeste onde kode maales rent */
      if (touched && savedBefore != null) B.sandbox.localStorage.setItem("ftco.save.v1", savedBefore);
    }
  }
  sizes.sort((a, b) => a - b);
  console.log("  karrierer afproevet                : " + n);
  console.log("  eksport->import TABSFRI            : " + rt + " af " + n + (rtBad ? "  ✗ " + rtBad + " fejlede" : "  ✅"));
  if (sizes.length) console.log("  karriere-kodens LAENGDE i tegn     : min " + sizes[0].toLocaleString("en-GB") +
    " · median " + sizes[Math.floor(sizes.length / 2)].toLocaleString("en-GB") +
    " · max " + sizes[sizes.length - 1].toLocaleString("en-GB") + "   (WORKPLAN sagde base64; det er raa JSON)");
  console.log("\n  onde koder — hvad skete der (over " + n + " karrierer):");
  for (const [k, v] of [...EVILRES].sort()) console.log("   " + String(v).padStart(4) + " × " + k);

  /* --- 3) SPRAENGRADIUS: hvis gemmet blev oedelagt, hvad har spilleren saa
     tilbage? Baade den koerende session OG naeste opstart maales. --- */
  console.log("\n  ── spraengradius for den vaerste kode ('SKALLET GYLDIG, indmad tom') ──");
  const EVIL1 = '{"v":1,"G":{"club":"Spøgelse FC","squad":[],"teams":[]}}';
  let liveLost = 0, bootLost = 0, bootThrew = 0, tried = 0;
  for (let i = 0; i < Math.min(SEEDS, 25); i++) {
    const seed = seedAt(i);
    let B;
    try { B = boot(seed); driveCareer(B, 2); } catch (e) { continue; }
    const Q = B.Q;
    if (!Q.G) continue;
    tried++;
    const realClub = Q.G.club;
    try { Q.call("importCareerText", EVIL1); } catch (e) { }
    /* a) den koerende session */
    const nowClub = Q.G ? Q.G.club : "(intet G)";
    if (nowClub !== realClub) liveLost++;
    /* b) naeste opstart: frisk sandkasse, samme localStorage-indhold */
    const raw = B.sandbox.localStorage.getItem("ftco.save.v1");
    const C = bootFile(SRC, seed + 77);
    C.sandbox.localStorage.setItem("ftco.save.v1", raw);
    let loaded = null;
    try { loaded = C.Q.call("loadGame"); } catch (e) { bootThrew++; loaded = "KASTEDE: " + e.message.slice(0, 60); }
    const bClub = C.Q.G ? C.Q.G.club : "(intet G)";
    if (bClub !== realClub) bootLost++;
    if (i < 3) console.log("   seed " + seed + ": klub var '" + realClub + "' → i sessionen '" + nowClub +
      "' → efter genstart '" + bClub + "' (loadGame: " + loaded + ")");
  }
  console.log("   karrierer proevet                 : " + tried);
  console.log("   den KOERENDE karriere gik tabt    : " + liveLost + " af " + tried);
  console.log("   karrieren var vaek efter genstart : " + bootLost + " af " + tried +
    (bootThrew ? "  (loadGame kastede i " + bootThrew + ")" : ""));
  console.log("   ...og modalen sagde imens: \"Intet er ændret — dit eksisterende gem er urørt.\"");
}
const EVILRES = new Map();
const SURFACE = new Map();

/* =====================================================================
   DANISH (nat 7) — hvor dansk er UI'et efter R5, MÅLT?
   R5 paastaar "hele spillets overflade taler dansk", med flavor bevidst
   udestaaende. Jeg kan ikke bedoemme TONEN -- men jeg kan hoeste hver eneste
   tekst der faktisk bliver renderet i #app under en spillet karriere, og
   skille de danske fra de engelske. Metoden er bevidst konservativ: en
   sætning taelles kun som engelsk hvis den indeholder et engelsk funktionsord
   der ikke ogsaa er dansk, og den taelles kun som dansk hvis den indeholder
   æ/ø/å eller et dansk funktionsord. Resten staar som "neutral" (navne, tal,
   forkortelser) og indgaar ikke i broekken.
===================================================================== */
/* Kun ord der er ENTYDIGT engelske -- ord som "for", "at", "over", "under",
   "her", "man" findes i begge sprog og gjorde foerste udgave af denne maaling
   ubrugelig (den stemplede rene danske saetninger som "blandede"). */
const EN_MARKERS = /\b(the|and|you|your|yours|with|that|this|these|those|will|would|should|could|have|has|been|they|their|them|there|what|when|where|which|about|into|after|before|because|every|never|always|another|through|without|between|against|isn't|don't|won't|can't|it's|she|his|him|we|our|are|was|were|not|but|any|two|three|off|out|down|then|than|too|very|just|only|more|most|much|many|some|such|own|same|other|new|old|good|bad|first|last|next|back|still|even|also|here|how|why|who|whose|if|does|did|got|goes|going|come|came|make|made|took|give|gave|said|saw|knew|thought|want|wanted|need|needed|like|looked|kept|let|paid|sold|bought|played|won|lost|ran|called|asked|told|found|leave|moved|turned|started|ended|stopped|opened|closed|held|brought|built|sent|spent|stood|walked|talked|worked|lived|felt|seemed|became|remained|welcome|gaffer's|keys|debts|dreams?)\b/i;
const DA_MARKERS = /[æøåÆØÅ]|\b(og|eller|men|ikke|det|den|de|der|du|dig|din|dit|dine|jeg|mig|min|mit|mine|vi|os|vores|han|hun|ham|hende|hans|hendes|som|er|var|har|havde|kan|kunne|skal|skulle|vil|ville|bliver|blev|blevet|til|fra|med|uden|efter|mellem|mod|hos|ved|om|en|et|dette|disse|hver|alle|nogen|noget|ingen|intet|mere|mest|meget|mange|flere|kun|ogsaa|nu|hvad|hvor|hvem|hvorfor|hvordan|naar|hvis|fordi|siden|klub|klubben|kamp|kampen|saeson|saesonen|holdet|spiller|spillere|penge|kasse|kassen|tribune|bestyrelsen|banken|laan|loen|stemning|ejer|andel|udbytte|dig|selv)\b/i;

function harvestText(html) {
  /* Kun det brugeren FAKTISK ser: fjern script/style, tag-attributter og
     entiteter. Attributter droppes med vilje -- en onclick er ikke tekst. */
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
  h = h.replace(/<[^>]*>/g, "\n");
  h = h.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return h.split("\n").map(s => s.replace(/\s+/g, " ").trim()).filter(s => s.length > 2);
}
function modeDanish() {
  console.log("\n══════════ R5 — HVOR DANSK ER OVERFLADEN, MÅLT ══════════");
  console.log("  (tonen kan jeg IKKE bedoemme. Kun hvilket sprog strengene er skrevet paa.)");
  const seen = new Map();   // tekst -> antal gange set
  for (let i = 0; i < SEEDS; i++) {
    const seed = seedAt(i);
    let B;
    try { B = boot(seed); } catch (e) { continue; }
    const Q = B.Q, ctx = B.ctx, rnd = B.rnd;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const grab = (surface) => { for (const t of harvestText(B.lastHtml.v)) { seen.set(t, (seen.get(t) || 0) + 1); if (!SURFACE.has(t)) SURFACE.set(t, surface); } };
    /* onboarding hoestes skaerm for skaerm — R6 vendte raekkefoelgen om */
    let g = 0;
    while (!Q.G && g++ < 80) {
      grab("ONBOARDING");
      const h = B.lastHtml.v;
      const hues = [...h.matchAll(/obHue\((\d+)\)/g)].map(x => +x[1]);
      if (hues.length) Q.call("obHue", pick(hues));
      if (/obFinish\(\)/.test(h)) Q.call("obFinish"); else Q.call("obNext");
    }
    if (!Q.G) continue;
    /* alle skaerme i begge lag */
    for (const sc of ["home", "club", "squad", "ground", "market", "office", "board", "empire", "books", "inbox", "table", "invest"]) {
      try { Q.screen = sc; Q.call("render"); grab("SKAERM:" + sc); } catch (e) { }
    }
    try { driveCareer(B, SEASONS); } catch (e) { }
    grab("I SPIL");
    try { Q.call("render"); grab("I SPIL"); } catch (e) { }
  }
  let da = 0, en = 0, neutral = 0;
  const english = [];
  for (const [t, n] of seen) {
    const isDa = DA_MARKERS.test(t), isEn = EN_MARKERS.test(t);
    if (isDa && !isEn) { da++; }
    else if (isEn && !isDa) { en++; english.push([t, n]); }
    else if (isEn && isDa) { en++; english.push([t + "  [blandet]", n]); }
    else neutral++;
  }
  const scored = da + en;
  console.log("  distinkte tekstlinjer set i #app : " + seen.size);
  console.log("   · dansk                         : " + da + "  = " + (scored ? Math.round(100 * da / scored) : 0) + " % af de sprogbaerende");
  console.log("   · engelsk (eller blandet)       : " + en + "  = " + (scored ? Math.round(100 * en / scored) : 0) + " %");
  console.log("   · neutral (navne, tal, kode)    : " + neutral);
  english.sort((a, b) => b[1] - a[1]);
  console.log("\n  de hyppigst sete ENGELSKE linjer (antal · tekst):");
  for (const [t, n] of english.slice(0, 60)) console.log("   " + String(n).padStart(5) + " · [" + (SURFACE.get(t.replace("  [blandet]", "")) || "?") + "] " + t.slice(0, 140));
  if (english.length > 60) console.log("   … og " + (english.length - 60) + " flere distinkte engelske linjer");
  const obEn = english.filter(([t]) => (SURFACE.get(t.replace("  [blandet]", "")) || "") === "ONBOARDING");
  console.log("\n  ── ENGELSK I ONBOARDINGEN (R5 lovede dansk UI, R6 byggede introen om) ──");
  if (!obEn.length) console.log("   ingen ✅");
  else for (const [t, n] of obEn) console.log("   · " + t.slice(0, 200));
}

/* =====================================================================
   main
===================================================================== */
const t0 = Date.now();
switch (MODE) {
  case "census": modeCensus(); break;
  case "scale": modeScale(); break;
  case "deadends": modeDeadends(); break;
  case "promises": modePromises(); break;
  case "balance": modeBalance(); break;
  case "bigstat": modeBigstat(); break;
  case "levers": modeLevers(); break;
  case "textdup": modeTextdup(); break;
  case "releg": modeReleg(); break;
  case "divecon": modeDivecon(); break;
  case "b4": modeB4(); break;
  case "pages": modePages(); break;
  case "stuckoffer": modeStuckOffer(); break;
  case "mood": modeMood(); break;
  case "floor": modeFloor(); break;
  case "usage": modeUsage(); break;
  case "migrate": modeMigrate(); break;
  case "dilution": modeDilution(); break;
  case "loans": modeLoans(); break;
  case "danish": modeDanish(); break;
  case "r2": modeR2(); break;
  case "all":
    modeDeadends(); modePromises(); modeBigstat(); modeCensus(); modeScale();
    break;
  default:
    console.error("ukendt mode '" + MODE + "'. Brug: census|scale|deadends|promises|balance|bigstat|levers|textdup|all");
    process.exit(2);
}
console.log("\n[qa-probes færdig · " + ((Date.now() - t0) / 1000).toFixed(1) + "s]");
