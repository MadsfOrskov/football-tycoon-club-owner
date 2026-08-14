/* Måler SPILLETS egen kampmotor: hvad betyder styrkeforskel for resultatet?
   Ingen formel-kopi — vi kalder myLambdas/poisson i spillets egen kode. */
const fs = require('fs'), vm = require('vm');
const SRC = fs.readFileSync('/home/user/football-tycoon-club-owner/proto-extract.js', 'utf8');

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const el=()=>({style:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},appendChild(){},
  set innerHTML(v){},get innerHTML(){return ""},set textContent(v){},get textContent(){return ""},focus(){},querySelector(){return el()},querySelectorAll(){return[]},scrollTo(){},addEventListener(){}});
const document={getElementById(){return el()},querySelector(){return el()},querySelectorAll(){return[]},
  createElement(){return el()},body:{classList:{add(){},remove(){}},style:{}},documentElement:{style:{setProperty(){}}},addEventListener(){}};
const sandbox={document,console:{log(){},warn(){},error(){},info(){}},setInterval(){return 0},clearInterval(){},
  setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){return 0},
  localStorage:(()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v))},removeItem:k=>{m.delete(k)},clear:()=>m.clear(),get length(){return m.size}};})()};
const BRIDGE=`;globalThis.__H={get G(){return G;},set G(v){G=v;},get modal(){return modal;},set modal(v){modal=v;},
  consts:{BAL,DIV_OBJECTIVE,APPROACHES},call(n){const f=globalThis[n];if(typeof f!=="function")throw new Error("ingen "+n);return f.apply(null,Array.prototype.slice.call(arguments,1));}};`;
const ctx=vm.createContext(sandbox);
sandbox.__rnd=mulberry32(4242);
vm.runInContext("Math.random = __rnd;",ctx);
vm.runInContext(SRC+BRIDGE,ctx);
const H=ctx.__H;

H.call("newGame","Prøveklub",85,"dark");
const G=H.G;
const BAL=H.consts.BAL;

// ---- 1) er skalaerne sammenlignelige? ----
const mine=H.call("myStrength");
const liga=G.teams.map(t=>({n:t.name,att:t.att,def:t.def,phy:t.phy}));
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
console.log("=== SKALAEN ===");
console.log("min XI (matchdag, inkl. form/træner/anfører): att " + mine.att.toFixed(1) + " · def " + mine.def.toFixed(1));
console.log("ligaens 13 AI-klubber:                        att " + avg(liga.map(x=>x.att)).toFixed(1) +
  " (spænd " + Math.min(...liga.map(x=>x.att)) + "-" + Math.max(...liga.map(x=>x.att)) + ")" +
  " · def " + avg(liga.map(x=>x.def)).toFixed(1));

// ---- 2) hvad betyder styrkeforskel? mål via spillets myLambdas + poisson ----
console.log("\n=== HVAD KØBER STYRKE? (spillets egen motor, 40.000 kampe pr. punkt) ===");
console.log("diff = min styrke minus modstanderens · neutral tilgang · uden vejr-edge");
console.log("");
console.log("diff   HJEMME  W/D/L        UDE  W/D/L        mål for-imod (hjemme)");
const t0=G.teams[0];
const baseAtt=Math.round(mine.att), baseDef=Math.round(mine.def);
for(const diff of [-12,-8,-4,0,4,8,12,20]){
  const out={};
  for(const home of [true,false]){
    /* Modstanderen sættes så JEG er 'diff' stærkere i BEGGE ender:
       (min att - hans def) = +diff  OG  (hans att - min def) = -diff.
       Første forsøg satte hans att = minDef + diff, hvilket gjorde BEGGE
       angreb bedre på én gang — målene steg i begge ender og W/D/L stod stille. */
    t0.def=baseAtt-diff; t0.att=baseDef-diff; t0.phy=50;
    let w=0,d=0,l=0,gf=0,ga=0;
    const N=40000;
    for(let i=0;i<N;i++){
      const [lm,lo]=H.call("myLambdas",t0,home,false,H.consts.APPROACHES["balanced"]||{own:0,opp:0},{phys:0});
      const a=H.call("poisson",lm), b=H.call("poisson",lo);
      if(a>b)w++;else if(a===b)d++;else l++;
      gf+=a;ga+=b;
    }
    out[home?"h":"a"]={w:100*w/N,d:100*d/N,l:100*l/N,gf:gf/N,ga:ga/N};
  }
  const f=x=>Math.round(x)+"%";
  console.log(String(diff).padStart(3)+"    "+
    (f(out.h.w)+"/"+f(out.h.d)+"/"+f(out.h.l)).padEnd(16)+
    (f(out.a.w)+"/"+f(out.a.d)+"/"+f(out.a.l)).padEnd(16)+
    out.h.gf.toFixed(2)+"-"+out.h.ga.toFixed(2));
}

// ---- 3) hvad SÆTTER forventningen i dag? ----
console.log("\n=== FORVENTNINGEN (bestyrelsens målsætning) ===");
console.log("DIV_OBJECTIVE (fast pr. division): " + JSON.stringify(H.consts.DIV_OBJECTIVE));
const demand=H.call("ownerDemandPos");
console.log("bestyrelsens krav i din division nu: top " + demand);
console.log("→ kender den din trup? " + (String(H.call("ownerDemandPos")).length ? "" : ""));
// test: gør truppen dobbelt så god og se om kravet flytter sig
const before=H.call("ownerDemandPos");
for(const p of G.squad){p.att=Math.min(90,p.att+25);p.def=Math.min(90,p.def+25);p.phy=Math.min(90,p.phy+25);}
const after=H.call("ownerDemandPos");
console.log("krav med NORMAL trup: top "+before+" · krav med +25 på ALLE spillere: top "+after+
  "  → " + (before===after ? "UÆNDRET — forventningen er blind for truppens niveau" : "ændret"));
