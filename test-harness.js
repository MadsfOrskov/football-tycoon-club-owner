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
  consts:{STANDS,STANDCOST,FACS,FAC_DETAIL,ROLES,APPROACHES,SWATCHES,TRAITS,COACHES,SPONSORS},
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
    localStorage: { getItem() { return null; }, setItem() { }, removeItem() { } }
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
  const stats = { md: [], seasonEnd: [] };
  const origSettle = ctx.settleFinances;
  ctx.settleFinances = function (res) {
    const before = H.G.balance;
    const out = origSettle(res);
    stats.md.push({
      season: H.G.season, md: H.G.md, home: !!res.home,
      net: H.G.balance - before, gate: res.gate || 0, wages: res.wages || 0,
      att: res.att || 0, cap: H.G.capacity
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
      for (const k of ["att", "def", "phy", "wage", "value", "conf", "age", "years", "form"]) {
        if (!Number.isFinite(p[k])) fail("spiller " + p.name + "." + k + " = " + p[k]);
      }
    }
    for (const k of Object.keys(H.consts.STANDS)) {
      if (G.stands[k] < 0 || G.stands[k] > 2) fail("stand " + k + " niveau " + G.stands[k]);
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

  /* ---------------- bot-handlinger ---------------- */
  function processInbox() {
    const G = H.G;
    const live = G.inbox.filter(x => x.action && !x.done);
    if (!live.length) return;
    const msg = pick(live);
    const kind = msg.action.kind;
    const choice = {
      sellOffer: () => pick(["accept", "demand", "reject"]),
      bidAccepted: () => "ok",
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
    } else if (G.freeAgents.length && chance(0.35)) {
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
    const ix = Math.floor(rnd() * G.squad.length);
    const p = G.squad[ix];
    const opts = [];
    if (hasFn("openPlayer")) opts.push(() => H.call("openPlayer", ix));
    if (G.talkCooldown <= 0) opts.push(() => H.call("openChat", ix));
    if (p.age >= 28) opts.push(() => H.call("setMentor", ix));
    if (!G.captSuggested && p.name !== G.captain) opts.push(() => H.call("suggestCaptain", ix));
    if (p.years <= 1) opts.push(() => H.call("startRenewal", ix));
    if (H.call("windowOpen") && G.squad.length > 13) opts.push(() => H.call("openSellSheet", ix));
    if (p.age < 28) opts.push(() => { p.focus = pick(["att", "def", "phy", null]); H.call("render"); });
    if (opts.length) pick(opts)();
  }

  function doOwnerBuyout() {
    const G = H.G;
    if (!G.owners.length) return;
    if (G.balance < 200000) return;
    H.call("buyOutOwner", Math.floor(rnd() * G.owners.length));
  }

  function renderAllScreens() {
    const keep = H.screen;
    for (const s of ["home", "inbox", "squad", "market", "club", "table"]) {
      H.screen = s;
      H.call("render");
      where = "render:" + s;
      checkHtml();
      maybeEcho("screen:" + s);
    }
    H.screen = keep;
    H.call("render");
  }

  function botIdle() {
    if (chance(0.55)) { processInbox(); if (H.modal) return; }
    if (chance(0.35)) { doTransfer(); if (H.modal) return; }
    if (chance(0.30)) { doBuild(); if (H.modal) return; }
    if (chance(0.25)) { doSquadStuff(); if (H.modal) return; }
    if (chance(0.06)) { doOwnerBuyout(); if (H.modal) return; }
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
    if (md.type === "nego" && H.nego && H.nego.stage === "contract" && !H.nego.doneDeal && !H.nego.dead) {
      const seen = !!H.nego.renewal || H.nego.cround >= 1;
      maybeEcho("nego:" + (seen ? "seen" : "blind"));
      if (H.nego.renewal) maybeEcho("nego:renewal");
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
          myShare: H.G.myShare
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
        if (hasFn("budgetNext")) H.call("budgetNext");
        else H.call("budgetConfirm");
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
        if (n.__tries > 16) { H.nego = null; H.modal = null; H.call("render"); break; }
        if (n.doneDeal || n.dead) { H.call("negoFinish"); break; }
        if (n.stage === "fee") {
          n.fee = Math.max(1000, Math.round(n.p.value * (1.03 + 0.07 * n.round) / 1000) * 1000);
          if (H.G.balance < n.fee + 15000) { H.nego = null; H.modal = null; H.call("render"); break; }
          H.call("negoSubmit", n.round >= 2);
        } else {
          const o = Math.round((n.p.att + n.p.def + n.p.phy) / 3);
          n.years = pick([1, 2, 3, 4]);
          if (o >= 48 || n.__tries >= 4) n.role = "key";
          else if (n.p.age < 24 && chance(0.4)) n.role = "pro";
          else n.role = "rot";
          n.wageOffer = Math.max(100, Math.round(n.p.wage * (1.02 + 0.13 * n.cround) / 100) * 100);
          const wagesNow = H.G.squad.reduce((s, p) => s + p.wage, 0);
          if (H.G.myShare < 100 && wagesNow + n.wageOffer > H.G.wageCap) {
            H.nego = null; H.modal = null; H.call("render"); break;
          }
          H.call("negoSubmit", n.cround >= 2);
        }
        break;
      }

      case "formalBid":
        H.call("sendFormalBid");
        break;

      case "sellChoice":
        if (chance(0.6)) H.call("quickRing", md.ix);
        else H.call("listPlayer", md.ix);
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
        if (H.G.balance < md.offer) { H.modal = null; H.call("render"); break; }
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
        if (hasFn("setFocus")) acts.push(() => H.call("setFocus", md.ix, pick(["att", "def", "phy"])));
        if (hasFn("openChat")) acts.push(() => H.call("openChat", md.ix));
        if (hasFn("openSellSheet")) acts.push(() => H.call("openSellSheet", md.ix));
        if (hasFn("startRenewal")) acts.push(() => H.call("startRenewal", md.ix));
        if (hasFn("setMentor")) acts.push(() => H.call("setMentor", md.ix));
        if (hasFn("suggestCaptain") && !H.G.captSuggested) acts.push(() => H.call("suggestCaptain", md.ix));
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
  renderAllScreens();
  checkInvariants();

  return { seed, stats, G: H.G, steps };
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

  const finals = runs.map(r => r.G.balance);
  const caps = runs.map(r => r.G.capacity);
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  console.log("\n  Slutkasse: min " + fmtGbp(Math.min(...finals)) +
    " · snit " + fmtGbp(avg(finals)) + " · max " + fmtGbp(Math.max(...finals)));
  console.log("  Slutkapacitet: min " + Math.min(...caps) + " · snit " + Math.round(avg(caps)) + " · max " + Math.max(...caps));
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
    console.log("  seed " + String(seed).padEnd(6) + " OK   S" + r.G.season + " · " + r.G.divNames[r.G.div] +
      " · kasse " + fmtGbp(r.G.balance) + " · " + r.steps + " steps · " + (Date.now() - t0) + "ms");
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
