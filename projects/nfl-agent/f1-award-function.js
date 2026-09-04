const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function awardF1Points(weekScores) {
  const entries = Object.entries(weekScores);
  if (entries.length === 0) return {};
  const distinct = [...new Set(entries.map(([, s]) => s.correct))].sort((a, b) => b - a);
  const out = {};
  let idx = 0;
  for (const val of distinct) {
    const tied = entries.filter(([, s]) => s.correct === val);
    let pot = 0;
    for (let i = idx; i < idx + tied.length; i++) pot += F1_POINTS[i] ?? 0;
    const share = Math.round((pot / tied.length) * 10) / 10;
    for (const [key] of tied) out[key] = share;
    idx += tied.length;
  }
  return out;
}

// --- tests ---
const mk = o => Object.fromEntries(Object.entries(o).map(([k,v])=>[k,{correct:v}]));
function show(label, scores){
  const r = awardF1Points(mk(scores));
  const total = Object.values(r).reduce((a,b)=>a+b,0);
  console.log(label);
  console.log('  scores:', JSON.stringify(scores));
  console.log('  points:', JSON.stringify(r), '| pot total:', total.toFixed(1));
}

show('no ties (10 players)', {a:14,b:13,c:12,d:11,e:10,f:9,g:8,h:7,i:6,j:5});
show('2-way tie for 1st',    {a:14,b:14,c:12,d:11,e:10,f:9,g:8,h:7,i:6,j:5});
show('3-way tie for 1st',    {a:14,b:14,c:14,d:11,e:10,f:9,g:8,h:7,i:6,j:5});
show('everyone ties',        {a:10,b:10,c:10,d:10,e:10});
show('11+ players (tail=0)', {a:14,b:13,c:12,d:11,e:10,f:9,g:8,h:7,i:6,j:5,k:4,l:3});
show('small pool (3)',       {a:12,b:10,c:9});
