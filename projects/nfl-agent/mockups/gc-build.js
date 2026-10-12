// Build the Game Center "all features" mockup from real BAL@ATL data.
const fs = require("fs");
const D = JSON.parse(fs.readFileSync("gc-data.json", "utf8"));

// --- Pool picks for this matchup -------------------------------------------
// MOCK ALLOCATION. Real picks live in the `picks` table; this is illustrative
// only so the Pool Angle section has something representative to render.
const POOL = {
  BAL: ["Chris", "Mercedez", "Casi", "Sean Neely", "Conner"],
  ATL: ["George", "Donna Pryor", "Marion Box", "Stephanie", "Ralph", "Kelly Watts"],
};

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Game Center — all proposed features</title>
<style>
:root{
  --bg:#0f1115; --card:#171a21; --card2:#1d212a; --line:#272c38;
  --text:#e8ebf2; --text-dim:#8e97ab; --text-muted:#5f6779;
  --accent:#ffc83d; --good:#3ddc84; --bad:#ff6b6b; --live:#ff3b30; --blue:#2f7bff;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font:14px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text",Segoe UI,Roboto,sans-serif;
  padding:16px;max-width:460px;margin:0 auto}
h1{font-size:15px;margin:0 0 4px;letter-spacing:.3px}
.sub{color:var(--text-dim);font-size:12px;margin-bottom:14px}
.note{background:#1a1d26;border:1px solid var(--line);border-left:3px solid var(--accent);
  border-radius:8px;padding:9px 11px;font-size:11.5px;color:var(--text-dim);margin-bottom:14px}

/* ---- collapsed scoreboard card (ships today) ---- */
.live-card{background:var(--card);border:1px solid var(--line);border-radius:12px;
  padding:11px 13px;margin-bottom:10px}
.live-card.is-live{border-color:#3a2a2a;box-shadow:0 0 0 1px rgba(255,59,48,.18)}
.live-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:9px}
.live-status{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--text-dim);
  font-weight:600;letter-spacing:.2px}
.live-badge{color:var(--live);font-weight:800;font-size:10.5px;letter-spacing:.4px}
.live-tv{font-size:10.5px;color:var(--text-muted)}
.live-team{display:flex;justify-content:space-between;align-items:center;padding:3px 0}
.live-team-left{display:flex;align-items:center;gap:8px;min-width:0}
.live-abbr{font-size:15px;font-weight:800;letter-spacing:.4px}
.live-record{font-size:10.5px;color:var(--text-muted)}
.live-score{font-size:19px;font-weight:800;font-variant-numeric:tabular-nums}
.poss-dot{font-size:11px}
.tap{margin-top:9px;padding-top:9px;border-top:1px dashed var(--line);
  text-align:center;color:var(--accent);font-size:11.5px;font-weight:700}

/* ---- expanded detail ---- */
.detail{background:var(--card);border:1px solid var(--line);border-top:none;
  border-radius:0 0 12px 12px;margin:-11px 0 18px;padding:0 13px 13px}
.sec{border-top:1px solid var(--line);padding:13px 0 11px}
.sec:first-child{border-top:none}
.sec-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.sec-t{font-size:11px;font-weight:800;letter-spacing:.9px;color:var(--text-dim);text-transform:uppercase}
.pill{font-size:9.5px;font-weight:800;letter-spacing:.4px;padding:2px 7px;border-radius:99px;
  background:#20242e;color:var(--text-muted);border:1px solid var(--line)}
.pill.new{background:rgba(255,200,61,.1);color:var(--accent);border-color:rgba(255,200,61,.3)}

/* ---- 1. virtual field ---- */
.field{position:relative;width:100%;aspect-ratio:2.4/1;border-radius:9px;overflow:hidden;
  background:linear-gradient(90deg,#15351f 0%,#1b4428 8.33%,#1b4428 91.67%,#15351f 100%);
  border:1px solid #24402c}
.ez{position:absolute;top:0;bottom:0;width:8.33%;background:rgba(0,0,0,.34);
  display:flex;align-items:center;justify-content:center}
.ez.l{left:0}.ez.r{right:0}
.ez span{font-size:8.5px;font-weight:800;color:rgba(255,255,255,.52);letter-spacing:.5px;
  writing-mode:vertical-rl;transform:rotate(180deg)}
.ez.r span{transform:none}
.yl{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.13)}
.yl.mid{background:rgba(255,255,255,.3)}
.ynum{position:absolute;bottom:3px;transform:translateX(-50%);font-size:8px;
  color:rgba(255,255,255,.4);font-weight:700}
.los{position:absolute;top:0;bottom:0;width:2px;background:var(--blue);
  box-shadow:0 0 7px var(--blue)}
.fd{position:absolute;top:0;bottom:0;width:2px;background:var(--accent);
  box-shadow:0 0 7px var(--accent)}
.move{position:absolute;top:50%;height:7px;transform:translateY(-50%);border-radius:3px;
  background:linear-gradient(90deg,rgba(61,220,132,.75),rgba(61,220,132,.16))}
.move.loss{background:linear-gradient(90deg,rgba(255,107,107,.75),rgba(255,107,107,.16))}
.ball{position:absolute;top:50%;width:14px;height:9px;border-radius:50%;
  background:#8b4513;border:1.5px solid #fff;transform:translate(-50%,-50%);
  box-shadow:0 1px 5px rgba(0,0,0,.6);transition:left .3s ease}
.fmeta{display:flex;justify-content:space-between;margin-top:7px;font-size:11px;
  color:var(--text-dim)}
.fmeta b{color:var(--text);font-weight:700}
.legend{display:flex;gap:11px;margin-top:6px;font-size:9.5px;color:var(--text-muted);flex-wrap:wrap}
.legend i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px;
  vertical-align:middle}

/* drive strip */
.drives{display:flex;gap:4px;overflow-x:auto;margin-top:10px;padding-bottom:5px;
  -webkit-overflow-scrolling:touch;scrollbar-width:thin;
  -webkit-mask-image:linear-gradient(90deg,#000 0,#000 94%,transparent 100%);
  mask-image:linear-gradient(90deg,#000 0,#000 94%,transparent 100%)}
.dchip{flex:0 0 auto;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:700;
  background:var(--card2);border:1px solid var(--line);color:var(--text-dim);cursor:pointer;
  white-space:nowrap}
.drives::after{content:"";flex:0 0 10px}
.drives::before{content:"";flex:0 0 1px}
.dchip.sel{border-color:var(--accent);color:var(--accent)}
.dchip.sc{border-color:rgba(61,220,132,.4);color:var(--good)}
.plays{margin-top:9px;max-height:180px;overflow-y:auto;
  -webkit-mask-image:linear-gradient(180deg,#000 0,#000 90%,transparent 100%);
  mask-image:linear-gradient(180deg,#000 0,#000 90%,transparent 100%)}
.play{display:flex;gap:8px;padding:6px 7px;border-radius:6px;font-size:11px;cursor:pointer;
  border:1px solid transparent}
.play:hover{background:var(--card2)}
.play.sel{background:var(--card2);border-color:var(--accent)}
.play.sc{border-left:2px solid var(--good)}
.pdd{flex:0 0 76px;color:var(--text-muted);font-size:9px;font-weight:700;padding-top:1px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ptx{flex:1;color:var(--text-dim);line-height:1.35}
.pgn{flex:0 0 32px;text-align:right;font-weight:800;font-size:10.5px}
.pgn.g{color:var(--good)}.pgn.l{color:var(--bad)}

/* ---- 2. scoring ---- */
.score-row{display:flex;gap:9px;align-items:flex-start;padding:7px 0;
  border-bottom:1px solid rgba(39,44,56,.5)}
.score-row:last-child{border-bottom:none}
.sq{flex:0 0 52px;font-size:9.5px;color:var(--text-muted);font-weight:700;padding-top:2px;
  white-space:nowrap}
.sab{flex:0 0 30px;font-size:11px;font-weight:800}
.stx{flex:1;font-size:11px;color:var(--text-dim);line-height:1.35}
.ssc{flex:0 0 46px;text-align:right;font-size:11px;font-weight:800;font-variant-numeric:tabular-nums}

/* ---- 3. pool angle ---- */
.pool{display:flex;gap:9px}
.pcol{flex:1;background:var(--card2);border:1px solid var(--line);border-radius:9px;padding:9px}
.pcol.win{border-color:rgba(61,220,132,.45);background:rgba(61,220,132,.05)}
.pcol.lose{opacity:.72}
.ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;
  padding-bottom:6px;border-bottom:1px solid var(--line)}
.pab{font-size:12.5px;font-weight:800}
.pct2{font-size:10px;color:var(--text-muted);font-weight:700}
.pname{font-size:11.5px;padding:3px 0;color:var(--text-dim);display:flex;
  justify-content:space-between;align-items:center}
.pname.me{color:var(--accent);font-weight:700}
.tag{font-size:8.5px;font-weight:800;padding:1px 5px;border-radius:99px}
.tag.w{background:rgba(61,220,132,.16);color:var(--good)}
.tag.l{background:rgba(255,107,107,.14);color:var(--bad)}
.tie-note{margin-top:8px;padding:7px 9px;border-radius:7px;background:rgba(255,200,61,.08);
  border:1px solid rgba(255,200,61,.25);font-size:10.5px;color:var(--accent);font-weight:600}

/* ---- 4. stat bars ---- */
.stat{margin-bottom:9px}
.sl{display:flex;justify-content:space-between;font-size:10.5px;margin-bottom:3px}
.sl .lab{color:var(--text-muted);font-weight:600}
.sl .v{font-weight:800;font-variant-numeric:tabular-nums;font-size:11px}
.bar{display:flex;height:5px;border-radius:3px;overflow:hidden;background:#0c0e13}
.bar .a{background:#6b7fd4}.bar .h{background:#d4746b}

/* ---- 5. leaders ---- */
.lead{display:flex;gap:9px}
.lcol{flex:1}
.lt{font-size:11px;font-weight:800;margin-bottom:6px;padding-bottom:5px;
  border-bottom:1px solid var(--line)}
.lrow{margin-bottom:7px}
.lcat{font-size:8.5px;color:var(--text-muted);font-weight:800;letter-spacing:.5px}
.lath{font-size:11px;font-weight:700}
.lval{font-size:10px;color:var(--text-dim)}

/* ---- 6. footer meta ---- */
.meta{display:flex;flex-wrap:wrap;gap:7px}
.mchip{flex:1 1 calc(50% - 4px);background:var(--card2);border:1px solid var(--line);
  border-radius:8px;padding:7px 9px}
.mk{font-size:8.5px;color:var(--text-muted);font-weight:800;letter-spacing:.5px;
  text-transform:uppercase}
.mv{font-size:11.5px;font-weight:700;margin-top:2px}
.foot{margin-top:16px;padding-top:12px;border-top:1px solid var(--line);
  font-size:10.5px;color:var(--text-muted);line-height:1.6}
kbd{background:var(--card2);border:1px solid var(--line);border-radius:4px;padding:0 4px;
  font-size:9.5px;font-family:inherit}
</style>

<h1>🏈 GAME CENTER — all proposed features</h1>
<div class="sub">Real data · Ravens @ Falcons · Week 5 · fetched live during OT</div>

<div class="note">
  <b>Mockup only.</b> Section 1 (field) is ported from the Sept mockup. Sections
  marked <span class="pill new">NEW</span> are the additions being proposed.
  Pool picks shown are <b>illustrative</b> — real picks come from the picks table.
</div>

<!-- ============ COLLAPSED CARD (what ships today) ============ -->
<div class="live-card is-live">
  <div class="live-card-head">
    <span class="live-status"><span class="live-badge">● LIVE</span>${esc(D.status.detail)}</span>
    <span class="live-tv">FOX</span>
  </div>
  <div class="live-team">
    <span class="live-team-left">
      <span class="live-abbr">${esc(D.away.abbr)}</span>
      <span class="poss-dot">🏈</span>
      <span class="live-record">${esc(D.away.record)}</span>
    </span>
    <span class="live-score">${D.away.score}</span>
  </div>
  <div class="live-team">
    <span class="live-team-left">
      <span class="live-abbr">${esc(D.home.abbr)}</span>
      <span class="live-record">${esc(D.home.record)}</span>
    </span>
    <span class="live-score">${D.home.score}</span>
  </div>
  <div class="tap">▲ tap to collapse</div>
</div>

<!-- ============ EXPANDED DETAIL ============ -->
<div class="detail">

  <!-- 1. FIELD -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">① Virtual field &amp; drive</span>
      <span class="pill">built Sept</span></div>
    <div class="field" id="field">
      <div class="ez l"><span>${esc(D.away.abbr)}</span></div>
      <div class="ez r"><span>${esc(D.home.abbr)}</span></div>
      <div class="move" id="move"></div>
      <div class="los" id="los"></div>
      <div class="fd" id="fd"></div>
      <div class="ball" id="ball"></div>
    </div>
    <div class="fmeta">
      <span id="fdd">—</span>
      <span id="fres">—</span>
    </div>
    <div class="legend">
      <span><i style="background:var(--blue)"></i>line of scrimmage</span>
      <span id="lg-fd"><i style="background:var(--accent)"></i>first down</span>
      <span><i style="background:var(--good)"></i>gain</span>
      <span><i style="background:var(--bad)"></i>loss</span>
    </div>
    <div class="drives" id="drives"></div>
    <div class="plays" id="plays"></div>
  </div>

  <!-- 2. SCORING -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">② Scoring summary</span>
      <span class="pill new">NEW</span></div>
    <div id="scoring"></div>
  </div>

  <!-- 3. POOL ANGLE -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">③ Pool angle — who picked this</span>
      <span class="pill new">NEW · ours alone</span></div>
    <div class="pool" id="pool"></div>
    <div class="tie-note" id="tienote"></div>
  </div>

  <!-- 4. STATS -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">④ Team comparison</span>
      <span class="pill new">NEW</span></div>
    <div id="stats"></div>
  </div>

  <!-- 5. LEADERS -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">⑤ Game leaders</span>
      <span class="pill new">NEW</span></div>
    <div class="lead" id="leaders"></div>
  </div>

  <!-- 6. META -->
  <div class="sec">
    <div class="sec-h"><span class="sec-t">⑥ Conditions &amp; line</span>
      <span class="pill new">NEW</span></div>
    <div class="meta" id="meta"></div>
  </div>
</div>

<div class="foot">
  Tap a drive chip or play to move the ball. <kbd>↑</kbd><kbd>↓</kbd> step plays.<br>
  Data: ESPN summary endpoint, event 401872993, ${D.drives.length} drives /
  ${D.drives.reduce((a, d) => a + d.plays.length, 0)} plays.
</div>

<script>
const G = ${JSON.stringify(D)};
const POOL = ${JSON.stringify(POOL)};
const esc = s => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- field geometry (proven Sept 10) ----------
   ESPN yardLine is ABSOLUTE 0-100 from the away endzone and each team's
   direction of travel is CONSTANT for the whole game. No quarter flip. */
const EZ = 8.333, PLAY = 83.333;

/* ⚠️ CORRECTED 2026-10-11 (was wrong in the Sept mockup).
   ESPN's play.start.yardLine is measured from the HOME team's goal line, NOT
   from the away endzone. Verified against downDistanceText on BAL@ATL:
     YL 68 -> "BAL 32"   YL 59 -> "BAL 41"   YL 51 -> "BAL 49"
   i.e. (100 - yardLine) is the distance from the AWAY endzone, which is what
   our left-to-right field needs. Rendering yardLine directly mirrored every
   ball position about midfield. */
const toAxis = yl => 100 - yl;
const pct = yl => EZ + (Math.max(0,Math.min(100,toAxis(yl)))/100)*PLAY;

/* ESPN reports OT as period 5+. Label it OT, not Q5. */
const perLabel = p => !p ? "" : p <= 4 ? "Q"+p : (p === 5 ? "OT" : (p-4)+"OT");

/* Direction of travel.
   yardLine is absolute 0-100 from the away endzone. Each team's direction is
   CONSTANT for the whole game (verified 2026-09-10 vs DAL@PHI, and again here).
   Derive it empirically: on a play with positive yardage the yardLine must move
   toward that team's goal, so sign(endYL-startYL)*sign(gain) votes the axis.
   Majority vote over every offensive play immunises us against odd single plays
   (returns, penalties enforced from spot, replay reversals).
   Measured on BAL@ATL: BAL desc 67/asc 3, ATL asc 52/desc 0. */
const TEAM_DIR = (() => {
  const t = {};
  for (const d of G.drives){
    for (const p of d.plays){
      if (!(p.down > 0) || !p.gain) continue;
      if (p.startYL == null || p.endYL == null) continue;
      const dAxis = toAxis(p.endYL) - toAxis(p.startYL);
      if (!dAxis) continue;
      const v = Math.sign(dAxis) * Math.sign(p.gain);
      t[d.abbr] = t[d.abbr] || { asc: 0, desc: 0 };
      if (v > 0) t[d.abbr].asc++; else t[d.abbr].desc++;
    }
  }
  const out = {};
  for (const k in t) out[k] = t[k].asc >= t[k].desc ? +1 : -1;
  return out;
})();
const driveDir = dr => TEAM_DIR[dr.abbr] || +1;

const f = document.getElementById("field");
for (let y=10; y<=90; y+=10){
  const left = EZ + (y/100)*PLAY;   // y here is already axis-space
  const d=document.createElement("div");
  d.className="yl"+(y===50?" mid":""); d.style.left=left+"%"; f.appendChild(d);
  const n=document.createElement("div");
  n.className="ynum"; n.style.left=left+"%";
  n.textContent = y===50?"50":(y<50?y:100-y); f.appendChild(n);
}

/* ---------- drive chips ---------- */
const dEl=document.getElementById("drives"), pEl=document.getElementById("plays");
G.drives.forEach((dr,i)=>{
  const c=document.createElement("div");
  c.className="dchip"+(dr.isScore?" sc":"");
  c.textContent=(dr.abbr||"?")+" · "+(dr.result||(dr.current?"IN PROGRESS":"End of Period"));
  c.onclick=()=>selDrive(i);
  dEl.appendChild(c);
});

let cd=0, cp=0;
function selDrive(i){
  cd=i; cp=0;
  [...dEl.children].forEach((c,j)=>c.classList.toggle("sel",j===i));
  const dr=G.drives[i];
  pEl.innerHTML="";
  dr.plays.forEach((p,j)=>{
    const row=document.createElement("div");
    row.className="play"+(p.score?" sc":"");
    const g=p.gain||0;
    row.innerHTML='<span class="pdd">'+esc(p.ddText||(p.type||""))+'</span>'+
      '<span class="ptx">'+esc(p.text)+'</span>'+
      '<span class="pgn '+(g>0?"g":g<0?"l":"")+'">'+(g>0?"+"+g:g||"")+'</span>';
    row.onclick=()=>selPlay(j);
    pEl.appendChild(row);
  });
  selPlay(0);
  dEl.children[i].scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
}
function selPlay(j){
  cp=j;
  const dr=G.drives[cd], p=dr.plays[j];
  if(!p) return;
  [...pEl.children].forEach((r,k)=>r.classList.toggle("sel",k===j));
  const s=p.startYL, e=p.endYL;
  const los=document.getElementById("los"), ball=document.getElementById("ball"),
        fd=document.getElementById("fd"), mv=document.getElementById("move");
  if(s!=null){los.style.display="block";los.style.left=pct(s)+"%";}else los.style.display="none";
  if(e!=null){ball.style.left=pct(e)+"%";}
  // First-down marker: use the DRIVE's constant direction, not the play's own
  // travel (a sack or loss would otherwise flip the marker to the wrong side).
  // Suppressed on kickoffs/punts/timeouts (down<=0) and goal-to-go.
  const dir = driveDir(dr);
  if(s!=null && p.down>0 && p.dist>0 && p.startYTE!=null && p.dist < p.startYTE){
    fd.style.display="block";
    // dir is expressed on the rendered axis, so convert, step, convert back.
    fd.style.left=(EZ + (Math.max(0,Math.min(100, toAxis(s) + dir*p.dist))/100)*PLAY)+"%";
  } else fd.style.display="none";
  // Gain bar spans LOS -> end spot. That rule only holds for scrimmage plays;
  // on a kickoff/punt the ball travels downfield and comes BACK on the return,
  // so a single bar would paint territory the returner never covered.
  const isKick = p.down<=0 || /kick|punt/i.test(p.type||"");
  if(!isKick && s!=null && e!=null && e!==s){
    const a=Math.min(pct(s),pct(e)), b=Math.max(pct(s),pct(e));
    mv.style.display="block"; mv.style.left=a+"%"; mv.style.width=(b-a)+"%";
    mv.className="move"+((p.gain||0)<0?" loss":"");
  } else mv.style.display="none";
  // Legend should not advertise a marker that isn't drawn for this play.
  const lgFd=document.getElementById("lg-fd");
  if(lgFd) lgFd.style.opacity = (fd.style.display==="block") ? "1" : ".3";
  document.getElementById("fdd").innerHTML=
    "<b>"+esc(p.ddText||p.type||"—")+"</b>"+(p.clock?" · "+perLabel(p.period)+" "+esc(p.clock):"");
  document.getElementById("fres").innerHTML=
    esc(dr.abbr)+" · <b>"+esc(dr.result||"in progress")+"</b>"+(dr.desc?" · "+esc(dr.desc):"");
  pEl.children[j].scrollIntoView({block:"nearest",behavior:"smooth"});
}
document.addEventListener("keydown",ev=>{
  if(ev.key==="ArrowDown"){ev.preventDefault();if(cp<G.drives[cd].plays.length-1)selPlay(cp+1);}
  if(ev.key==="ArrowUp"){ev.preventDefault();if(cp>0)selPlay(cp-1);}
});

/* ---------- scoring ---------- */
document.getElementById("scoring").innerHTML = G.scoringPlays.map(p=>
  '<div class="score-row">'+
    '<span class="sq">'+perLabel(p.q)+"&nbsp;"+esc(p.clock)+'</span>'+
    '<span class="sab">'+esc(p.abbr)+'</span>'+
    '<span class="stx">'+esc(p.text)+'</span>'+
    '<span class="ssc">'+p.a+"-"+p.h+'</span>'+
  '</div>').join("") || '<div style="color:var(--text-muted);font-size:11px">No scoring yet.</div>';

/* ---------- pool angle ---------- */
const aw=G.away, hm=G.home;
const aWin=aw.score>hm.score, hWin=hm.score>aw.score;
const col=(t,names,winning)=>
  '<div class="pcol '+(winning?"win":(aw.score===hm.score?"":"lose"))+'">'+
    '<div class="ph"><span class="pab">'+esc(t.abbr)+'</span>'+
      '<span class="pct2">'+names.length+"/"+(POOL.BAL.length+POOL.ATL.length)+'</span></div>'+
    names.map(n=>'<div class="pname'+(n==="Chris"?" me":"")+'">'+esc(n)+
      '<span class="tag '+(winning?"w":"l")+'">'+(winning?"UP":"DOWN")+'</span></div>').join("")+
  '</div>';
document.getElementById("pool").innerHTML =
  col(aw,POOL[aw.abbr]||[],aWin) + col(hm,POOL[hm.abbr]||[],hWin);
document.getElementById("tienote").textContent =
  aw.score===hm.score
    ? "⚠️ Tied in OT — a tie counts for NOBODY. All "+(POOL.BAL.length+POOL.ATL.length)+
      " picks on this game are dead if it ends level."
    : "Live swing: "+( aWin?POOL[aw.abbr].length:POOL[hm.abbr].length)+" members currently winning this pick.";

/* ---------- stats ---------- */
document.getElementById("stats").innerHTML = G.stats.map(s=>{
  const pa=parseFloat(s.away)||0, ph=parseFloat(s.home)||0, tot=pa+ph;
  const wa=tot?Math.round(pa/tot*100):50;
  return '<div class="stat"><div class="sl">'+
    '<span class="v">'+esc(s.away)+'</span>'+
    '<span class="lab">'+esc(s.label)+'</span>'+
    '<span class="v">'+esc(s.home)+'</span></div>'+
    '<div class="bar"><div class="a" style="width:'+wa+'%"></div>'+
      '<div class="h" style="width:'+(100-wa)+'%"></div></div></div>';
}).join("");

/* ---------- leaders ---------- */
const CAT={passingYards:"PASS",rushingYards:"RUSH",receivingYards:"REC"};
document.getElementById("leaders").innerHTML = G.leaders.map(L=>
  '<div class="lcol"><div class="lt">'+esc(L.abbr)+'</div>'+
    L.cats.map(c=>'<div class="lrow"><div class="lcat">'+(CAT[c.cat]||c.cat)+'</div>'+
      '<div class="lath">'+esc(c.ath)+'</div>'+
      '<div class="lval">'+esc(c.val)+'</div></div>').join("")+
  '</div>').join("");

/* ---------- meta ---------- */
const M=[];
if(G.venue) M.push(["Venue",G.venue.name+" · "+G.venue.city+", "+G.venue.state]);
if(G.weather) M.push(["Weather",G.weather.temp+"° "+G.weather.cond+" · gust "+G.weather.gust+"mph"]);
if(G.odds) M.push(["Line",G.odds.details+" · O/U "+G.odds.ou],["Book",G.odds.prov]);
document.getElementById("meta").innerHTML = M.map(([k,v])=>
  '<div class="mchip"><div class="mk">'+esc(k)+'</div><div class="mv">'+esc(v)+'</div></div>').join("");

// Open the most recent drive and land on a real scrimmage play so the
// first-down marker is visible on load rather than a kickoff.
selDrive(G.drives.length-1);
(function(){
  const pl=G.drives[cd].plays;
  const i=pl.findIndex(p=>p.down>0 && p.dist>0);
  if(i>=0) selPlay(i);
})();
</script>`;

fs.writeFileSync("game-center-all-features.html", html);
console.log("wrote game-center-all-features.html", fs.statSync("game-center-all-features.html").size, "bytes");
