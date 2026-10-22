// scalp-lab · modelių varikliai (ištrauka iš code_boot, SHA-256 eca319ce…) · 2026-10-22
// Tik 12 modelių ir 13 modelio funkcijos su priklausomybėmis; sugeneruota istrauka.js (Function.toString).
// Vienintelis pakeitimas — laiko konstantos per window.__BARMS / __SUBMS / __DAYMS / __D19 (kai nenustatyta — originalios 4H reikšmės).
window.__EQLH4I = function(sym){ const b=__B4[sym], h=__B1[sym], N=b.T.length, H1=(window.__SUBMS||3600000), out=new Int32Array(N).fill(-1); if(!h) return out;
  const m=new Map(); for(let i=0;i<h.T.length;i++) m.set(h.T[i],i);
  for(let q=0;q<N;q++){ const i=m.get(b.T[q]); if(i===undefined||i+3>=h.T.length) continue; if(h.T[i+1]===b.T[q]+H1&&h.T[i+2]===b.T[q]+2*H1&&h.T[i+3]===b.T[q]+3*H1) out[q]=i; }
  return out; };
window.__MNG1X = function(b,h,h4i,en,st,tg,exitFn){ const H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), N=b.T.length; let fb=0; const out=(x,why,tX)=>({x,why,tX,fb});
  let q=en.fq; if(en.mode==='A'){ const i=h4i[q]; if(en.fi>=0){ if(h.L[en.fi]<=st) return out(st,'sl',h.T[en.fi]+H1); for(let k=en.fi+1;k<i+4;k++){ if(h.L[k]<=st) return out(Math.min(h.O[k],st),'sl',h.T[k]+H1); if(h.H[k]>=tg) return out(tg,'tp',h.T[k]+H1); } } else { fb++; if(b.L[q]<=st) return out(st,'sl',b.T[q]+H4); } }
  if(exitFn){ const ex=exitFn(q); if(ex!=null) return out(ex,'rule',b.T[q]+H4); }
  for(q=en.fq+1;q<N;q++){ if(b.T[q]-b.T[q-1]!==H4) return out(b.C[q-1],'gap',b.T[q-1]+H4); const i=h4i[q];
    if(i>=0){ for(let k=i;k<i+4;k++){ if(h.L[k]<=st) return out(Math.min(h.O[k],st),'sl',h.T[k]+H1); if(h.H[k]>=tg) return out(tg,'tp',h.T[k]+H1); } } else { fb++; if(b.L[q]<=st) return out(Math.min(b.O[q],st),'sl',b.T[q]+H4); if(b.H[q]>=tg) return out(tg,'tp',b.T[q]+H4); }
    if(exitFn){ const ex=exitFn(q); if(ex!=null) return out(ex,'rule',b.T[q]+H4); }
    if(q-en.fq>=180) return out(b.C[q],'time',b.T[q]+H4); }
  return out(b.C[N-1],'eod',b.T[N-1]+H4); };
window.__RUN1 = function(Uday,o,evfn){
  const DAY=(window.__DAYMS||86400000), t0=__M.T[0], D19=(window.__D19||Date.UTC(2019,0,1)); const tr=[];
  for(const sym of Object.keys(__B4)){ const b=__B4[sym], h=__B1[sym]; const h4i=__EQLH4I(sym); const cand=evfn(sym,o,b,h,h4i); cand.sort((x,y)=>x.en.tEo-y.en.tEo||(x.ord||0)-(y.ord||0)); let busyEnd=-Infinity;
    for(const c of cand){ const d=Math.round((Math.floor(c.en.tEo/DAY)*DAY-t0)/DAY)-1; if(d<0||d>=Uday.length||!Uday[d].has(sym)) continue; if(c.en.tEo<D19) continue; if(c.en.tEo<busyEnd) continue; if(!(c.en.e>c.st)||!(c.tg>c.en.e)) continue;
      const r=__MNG1X(b,h,h4i,c.en,c.st,c.tg,c.exitFn||null); busyEnd=r.tX; tr.push(Object.assign({s:sym,tE:c.en.mode==='A'?c.en.tEo:c.en.tEo+(window.__BARMS||14400000),tEo:c.en.tEo,tX:r.tX,e:c.en.e,st:c.st,tg:c.tg,x:r.x,why:r.why,R:(r.x-c.en.e)/(c.en.e-c.st),fb:r.fb},c.meta||{})); } }
  tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); return tr; };
window.__SX = function(sym,Uday,o,model){
  const b=__B4[sym], h=__B1[sym]; if(!b) return []; const N=b.T.length, H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), DAY=(window.__DAYMS||86400000), t0=__M.T[0], D19=(window.__D19||Date.UTC(2019,0,1));
  const hs=new Int32Array(N).fill(-1); if(h){ let i=0; for(let q=0;q<N;q++){ while(i<h.T.length && h.T[i]<b.T[q]) i++; if(i+3<h.T.length && h.T[i]===b.T[q] && h.T[i+1]===b.T[q]+H1 && h.T[i+2]===b.T[q]+2*H1 && h.T[i+3]===b.T[q]+3*H1) hs[q]=i; } }
  const inU=t=>{ const d=Math.round((Math.floor(t/DAY)*DAY-t0)/DAY)-1; return d>=0 && d<Uday.length && Uday[d].has(sym); };
  let pos=null, lastExitEnd=-Infinity; const trades=[]; const api={armed:[],q:0};
  const close=(x,why,tX)=>{ pos.x=x; pos.why=why; pos.tX=tX; pos.R=(x-pos.e)/(pos.e-pos.st); trades.push(pos); lastExitEnd=tX; pos=null; };
  api.enter=(e,st,tg,meta,q)=>{ const t=b.T[q]; if(!inU(t)||t<D19||pos||t<lastExitEnd||!(e>st)||!(tg>e)) return false; pos=Object.assign({s:sym,tE:t+H4,tEo:t,e,st,tg,fq:q,fillT:-1},meta); return true; };
  const state=model.init(b,o,api);
  for(let q=0;q<N;q++){
    if(q>0 && b.T[q]-b.T[q-1]!==H4){ if(pos) close(b.C[q-1],'gap',b.T[q-1]+H4); api.armed=[]; model.reset&&model.reset(state); }
    api.q=q; model.preBar&&model.preBar(q,state,api);
    for(const a of api.armed){ if(a.actFn && !a.act){ if(a.actFn(q,a)){ a.act=true; if(a.postAct && a.postAct(q,a)===false) a.drop=true; } } } api.armed=api.armed.filter(a=>!a.drop);
    const sub=[]; if(hs[q]>=0){ for(let k=hs[q];k<hs[q]+4;k++) sub.push([h.T[k],H1,h.O[k],h.H[k],h.L[k]]); } else sub.push([b.T[q],H4,b.O[q],b.H[q],b.L[q]]);
    for(const [t,u,op,hi,lo] of sub){
      if(pos && pos.fillT!==t){ if(lo<=pos.st) close(Math.min(op,pos.st),'sl',t+u); else if(hi>=pos.tg) close(pos.tg,'tp',t+u); }
      if(api.armed.length){ const keep=[];
        for(const a of api.armed){ if(a.from!=null && q<a.from){ keep.push(a); continue; } if(a.actFn && !a.act){ keep.push(a); continue; }
          if(lo<=a.lvl){ if(!inU(t)||t<D19||pos||t<lastExitEnd){ continue; } const e=Math.min(op,a.lvl); if(e<=a.st) continue; if(a.minE!=null && e<=a.minE) continue; if(!(a.tg>a.lvl)) continue;
            pos=Object.assign({s:sym,tE:t,tEo:t,e,st:a.st,tg:a.tg,fq:q,fillT:t},a.meta||{}); if(lo<=a.st) close(a.st,'sl',t+u); continue; }
          if(hi>=(a.cancel!=null?a.cancel:a.tg)) continue; keep.push(a); }
        api.armed=keep; }
    }
    if(pos){ const ex=model.exit?model.exit(pos,q,state):null; if(ex!=null) close(ex,'rule',b.T[q]+H4); }
    if(pos && q-pos.fq>=180) close(b.C[q],'time',b.T[q]+H4);
    api.armed=api.armed.filter(a=>q<a.until);
    model.onBar(q,state,api);
  }
  if(pos) close(b.C[N-1],'eod',b.T[N-1]+H4);
  return trades; };
window.__SXRUN = function(Uday,o,model){ const tr=[]; for(const sym of Object.keys(__B4)) tr.push(...__SX(sym,Uday,o,model)); tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); return tr; };
window.__CMP = function(a,b,key2){ key2=key2||'tSw'; const key=x=>x.s+'|'+x.tE; const mb=new Map(b.map(x=>[key(x),x])); let same=0,bad=0; const ex=[]; for(const x of a){ const y=mb.get(key(x)); if(y && y.tX===x.tX && y.why===x.why && Math.abs(y.R-x.R)<1e-9 && y[key2]===x[key2]) same++; else { bad++; if(ex.length<3) ex.push({x,y}); } } return {nA:a.length,nB:b.length,same,bad,ex}; };
window.__PIV = function(b,P){ const N=b.T.length, ph=[], pl=[]; for(let p=P;p<N-P;p++){ let hi=true, lo=true; for(let z=1;z<=P;z++){ if(!(b.H[p]>b.H[p-z] && b.H[p]>=b.H[p+z])) hi=false; if(!(b.L[p]<b.L[p-z] && b.L[p]<=b.L[p+z])) lo=false; } if(hi) ph.push(p); if(lo) pl.push(p); } return {ph,pl}; };
window.__FILL0 = function(b,h,h4i,q0,lvl,tg,win){ const H4=(window.__BARMS||14400000), N=b.T.length; for(let z=q0; z<Math.min(N,q0+win); z++){ if(z>q0 && b.T[z]-b.T[z-1]!==H4) return null; const i=h4i[z];
  if(i>=0){ for(let k=i;k<i+4;k++){ if(h.L[k]<=lvl) return {mode:'A',e:Math.min(h.O[k],lvl),fq:z,fi:k,tEo:h.T[k]}; if(h.H[k]>=tg) return null; } } else { if(b.L[z]<=lvl) return {mode:'A',e:Math.min(b.O[z],lvl),fq:z,fi:-1,tEo:b.T[z]}; if(b.H[z]>=tg) return null; } } return null; };
window.__ATR4 = function(b,n){ const a=new Float64Array(b.T.length); let v=0; for(let i=0;i<b.T.length;i++){ const tr=i?Math.max(b.H[i],b.C[i-1])-Math.min(b.L[i],b.C[i-1]):b.H[i]-b.L[i]; v= i<n ? (v*i+tr)/(i+1) : v+(tr-v)/n; a[i]=v; } return a; };
window.__EQLMNG1 = function(b,h,h4i,en,st,tg,lvl,nr){ const H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), N=b.T.length; let reacted=false, fb=0;
  const out=(x,why,tX)=>({x,why,tX,fb});
  let q=en.fq;
  if(en.mode==='A'){
    const i=h4i[q];
    if(en.fi>=0){ if(h.L[en.fi]<=st) return out(st,'sl',h.T[en.fi]+H1);
      for(let k=en.fi+1;k<i+4;k++){ if(h.L[k]<=st) return out(Math.min(h.O[k],st),'sl',h.T[k]+H1); if(h.H[k]>=tg) return out(tg,'tp',h.T[k]+H1); } }
    else { fb++; if(b.L[q]<=st) return out(st,'sl',b.T[q]+H4); }
  }
  if(nr && b.C[en.fq]>lvl) reacted=true;
  for(q=en.fq+1;q<N;q++){
    if(b.T[q]-b.T[q-1]!==H4) return out(b.C[q-1],'gap',b.T[q-1]+H4);
    const i=h4i[q];
    if(i>=0){ for(let k=i;k<i+4;k++){ if(h.L[k]<=st) return out(Math.min(h.O[k],st),'sl',h.T[k]+H1); if(h.H[k]>=tg) return out(tg,'tp',h.T[k]+H1); } }
    else { fb++; if(b.L[q]<=st) return out(Math.min(b.O[q],st),'sl',b.T[q]+H4); if(b.H[q]>=tg) return out(tg,'tp',b.T[q]+H4); }
    if(nr && q<=en.fq+nr){ if(b.C[q]>lvl) reacted=true; if(q===en.fq+nr && !reacted) return out(b.C[q],'nr',b.T[q]+H4); }
    if(q-en.fq>=180) return out(b.C[q],'time',b.T[q]+H4);
  }
  return out(b.C[N-1],'eod',b.T[N-1]+H4); };
window.__EQLFILL1 = function(b,h,h4i,ev){ const H4=(window.__BARMS||14400000), N=b.T.length;
  for(let q=ev.sw;q<Math.min(N,ev.sw+6);q++){ if(q>ev.sw && b.T[q]-b.T[q-1]!==H4) break;
    const i=h4i[q];
    if(i>=0){ for(let k=i;k<i+4;k++){ if(h.L[k]<=ev.top) return {mode:'A',e:Math.min(h.O[k],ev.top),fq:q,fi:k,tEo:h.T[k]}; } }
    else if(b.L[q]<=ev.top) return {mode:'A',e:Math.min(b.O[q],ev.top),fq:q,fi:-1,tEo:b.T[q]}; }
  return null; };
window.__EQLEV = function(sym,o){
  o=Object.assign({piv:3,tolATR:0.2,minSep:6,maxSpan:120,riseATR:2.0,obBack:60,obGapATR:3.0,obGapMin:0,disp:3,maxAge:120,tapN:6},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv;
  const isPiv=[]; for(let p=P;p<N-P;p++){ let ok=true; for(let q=1;q<=P;q++){ if(!(b.L[p]<b.L[p-q] && b.L[p]<=b.L[p+q])){ ok=false; break; } } if(ok) isPiv.push(p); }
  const contig=(a,z)=>{ for(let q=a+1;q<=z;q++) if(b.T[q]-b.T[q-1]!==H4) return false; return true; };
  const bySweep=new Map();
  for(let ii=0; ii<isPiv.length; ii++){
    const p2=isPiv[ii]; const tol=o.tolATR*A[p2];
    let touches=[p2];
    for(let jj=ii-1; jj>=0; jj--){ const p=isPiv[jj]; if(p<p2-o.maxSpan) break; if(p2-p<o.minSep) continue; if(Math.abs(b.L[p]-b.L[p2])<=tol) touches.push(p); }
    if(touches.length<2) continue;
    touches.sort((x,y)=>x-y);
    let p1=null, lvl=null;
    for(let t=0;t<touches.length-1;t++){ const a=touches[t]; const lv=Math.min(...touches.slice(t).map(q=>b.L[q])); let ok=true, mx=-Infinity;
      for(let q=a+1;q<p2;q++){ if(b.L[q]<lv){ ok=false; break; } mx=Math.max(mx,b.H[q]); }
      if(ok && contig(a,p2) && mx-lv>=o.riseATR*A[p2]){ p1=a; lvl=lv; touches=touches.slice(t); break; } }
    if(p1===null) continue;
    const conf=p2+P; if(conf>=N) continue;
    let sw=-1; for(let q=p2+1;q<Math.min(N,p2+o.maxAge);q++){ if(b.T[q]-b.T[q-1]!==H4) break; if(b.L[q]<lvl){ sw=q; break; } }
    if(sw<0 || sw<=conf) continue;
    let ob=null;
    for(let j=p1-1;j>=Math.max(1,p1-o.obBack);j--){
      if(b.T[j+1]-b.T[j]!==H4) break;
      if(!(b.C[j]<b.O[j])) continue;
      const top=b.H[j], bot=b.L[j]; if(!(top<lvl)) continue; if(lvl-top>o.obGapATR*A[p1]) continue; if(lvl-top<o.obGapMin*A[p1]) continue;
      let base=true; for(let q=j+1;q<p1;q++){ if(b.L[q]<bot){ base=false; break; } } if(!base) continue;
      let d=-1; for(let q=j+1;q<=Math.min(p1,j+o.disp);q++){ if(b.C[q]>top){ d=q; break; } } if(d<0) continue;
      let untapped=true; for(let q=d+1;q<sw;q++){ if(b.L[q]<=top){ untapped=false; break; } } if(!untapped) continue;
      ob={j,top,bot}; break; }
    if(!ob) continue;
    const ev={p1,p2,sw,lvl,top:ob.top,bot:ob.bot,obJ:ob.j,touches:touches.length,span:p2-p1};
    const prev=bySweep.get(sw); if(!prev || ev.touches>prev.touches || (ev.touches===prev.touches && ev.span>prev.span)) bySweep.set(sw,ev);
  }
  const out=[];
  for(const ev of [...bySweep.values()].sort((a,c)=>a.sw-c.sw)){
    let tap=-1; for(let q=ev.sw;q<Math.min(N,ev.sw+o.tapN);q++){ if(q>ev.sw && b.T[q]-b.T[q-1]!==H4) break; if(b.L[q]<=ev.top){ tap=q; break; } }
    if(tap<0) continue;
    let rh=-Infinity; for(let q=ev.p1;q<ev.sw;q++) rh=Math.max(rh,b.H[q]);
    ev.tap=tap; ev.rh=rh; out.push(ev); }
  return out; };
window.__EQLRUN1 = function(Uday,o){ o=Object.assign({ent:'A',tgt:'rh',nr:0},o);
  const DAY=(window.__DAYMS||86400000), t0=__M.T[0], H4=(window.__BARMS||14400000), D19=(window.__D19||Date.UTC(2019,0,1)); const tr=[]; const sk={gapThru:0,noTp:0,noRc:0,busy:0};
  for(const sym of Object.keys(__B4)){ const b=__B4[sym], h=__B1[sym], N=b.T.length; const h4i=__EQLH4I(sym); const evs=__EQLEV(sym,o); const cand=[];
    for(const ev of evs){ let en, st;
      if(o.ent==='A'){ en=__EQLFILL1(b,h,h4i,ev); if(!en) continue; st=ev.bot; if(en.e<=st){ sk.gapThru++; continue; } }
      else { let qe=-1; for(let q=ev.tap;q<Math.min(N,ev.tap+3);q++){ if(q>ev.tap && b.T[q]-b.T[q-1]!==H4) break; if(b.C[q]>ev.lvl){ qe=q; break; } }
        if(qe<0){ sk.noRc++; continue; } let lo=ev.bot; for(let q=ev.sw;q<=qe;q++) lo=Math.min(lo,b.L[q]); st=lo; en={mode:'C',e:b.C[qe],fq:qe,fi:-1,tEo:b.T[qe]}; }
      cand.push({ev,en,st}); }
    cand.sort((x,y)=>x.en.tEo-y.en.tEo||x.ev.sw-y.ev.sw);
    let busyEnd=-Infinity;
    for(const c of cand){ const d=Math.round((Math.floor(c.en.tEo/DAY)*DAY-t0)/DAY)-1; if(d<0||d>=Uday.length||!Uday[d].has(sym)) continue; if(c.en.tEo<D19) continue;
      if(c.en.tEo<busyEnd){ sk.busy++; continue; }
      const e=c.en.e, st=c.st; const tg = o.tgt==='rh' ? c.ev.rh : e+(o.tgt==='r2'?2:3)*(e-st); if(!(tg>e)){ sk.noTp++; continue; }
      const r=__EQLMNG1(b,h,h4i,c.en,st,tg,c.ev.lvl,o.nr); busyEnd=r.tX;
      tr.push({s:sym,tSw:b.T[c.ev.sw],tS:b.T[c.ev.p1],tE:c.en.mode==='A'?c.en.tEo:b.T[c.en.fq]+H4,tEo:c.en.tEo,tX:r.tX,e,st,tg,lvl:c.ev.lvl,x:r.x,why:r.why,R:(r.x-e)/(e-st),fb:r.fb}); } }
  tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); tr.sk=sk; return tr; };
window.__EQLENG2 = function(sym,Uday,o){
  o=Object.assign({piv:3,tolATR:0.2,minSep:6,maxSpan:120,riseATR:2.0,obBack:60,obGapATR:3.0,obGapMin:0,disp:3,maxAge:120,tapN:6,ent:'A',tgt:'rh',nr:0},o);
  const b=__B4[sym], h=__B1[sym]; if(!b) return [];
  const N=b.T.length, H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), DAY=(window.__DAYMS||86400000), t0=__M.T[0], P=o.piv, D19=(window.__D19||Date.UTC(2019,0,1));
  const hs=new Int32Array(N).fill(-1);
  if(h){ let i=0; for(let q=0;q<N;q++){ while(i<h.T.length && h.T[i]<b.T[q]) i++; if(i+3<h.T.length && h.T[i]===b.T[q] && h.T[i+1]===b.T[q]+H1 && h.T[i+2]===b.T[q]+2*H1 && h.T[i+3]===b.T[q]+3*H1) hs[q]=i; } }
  const inU=t=>{ const d=Math.round((Math.floor(t/DAY)*DAY-t0)/DAY)-1; return d>=0 && d<Uday.length && Uday[d].has(sym); };
  const A=new Float64Array(N); let atr=0;
  const pivs=[]; let watch=[], armed=[]; let pos=null, lastExitEnd=-Infinity, ord=0; const trades=[];
  const tgOf=(e,st,rh)=> o.tgt==='rh' ? rh : e+(o.tgt==='r2'?2:3)*(e-st);
  const close=(x,why,tX)=>{ pos.x=x; pos.why=why; pos.tX=tX; pos.R=(x-pos.e)/(pos.e-pos.st); trades.push(pos); lastExitEnd=tX; pos=null; };
  for(let q=0;q<N;q++){
    const tr=q?Math.max(b.H[q],b.C[q-1])-Math.min(b.L[q],b.C[q-1]):b.H[q]-b.L[q]; atr = q<14 ? (atr*q+tr)/(q+1) : atr+(tr-atr)/14; A[q]=atr;
    if(q>0 && b.T[q]-b.T[q-1]!==H4){ if(pos) close(b.C[q-1],'gap',b.T[q-1]+H4); watch=[]; armed=[]; }
    { const swept=[], rest=[]; for(const w of watch){ if(q>=w.p2+o.maxAge) continue; if(b.L[q]<w.lvl) swept.push(w); else rest.push(w); } watch=rest;
      if(swept.length){ let best=swept[0]; for(const w of swept){ if(w.touches>best.touches || (w.touches===best.touches && (w.span>best.span || (w.span===best.span && w.ord<best.ord)))) best=w; }
        let rh=-Infinity; for(let z=best.p1;z<q;z++) if(b.H[z]>rh) rh=b.H[z];
        armed.push({p1:best.p1,p2:best.p2,lvl:best.lvl,top:best.top,bot:best.bot,sw:q,rh,tap:-1}); } }
    const sub=[]; if(hs[q]>=0){ for(let k=hs[q];k<hs[q]+4;k++) sub.push([h.T[k],H1,h.O[k],h.H[k],h.L[k]]); } else sub.push([b.T[q],H4,b.O[q],b.H[q],b.L[q]]);
    for(const [t,u,op,hi,lo] of sub){
      if(pos && pos.fillT!==t){ if(lo<=pos.st) close(Math.min(op,pos.st),'sl',t+u); else if(hi>=pos.tg) close(pos.tg,'tp',t+u); }
      if(o.ent==='A' && armed.length){
        const hit=armed.filter(a=>lo<=a.top).sort((x,y)=>x.sw-y.sw); if(hit.length) armed=armed.filter(a=>!(lo<=a.top));
        for(const a of hit){
          if(!inU(t) || t<D19) continue;
          if(pos || t<lastExitEnd) continue;
          const e=Math.min(op,a.top), st=a.bot; if(e<=st) continue;
          const tg=tgOf(e,st,a.rh); if(!(tg>e)) continue;
          pos={s:sym,tSw:b.T[a.sw],tS:b.T[a.p1],tE:t,tEo:t,e,st,tg,lvl:a.lvl,fq:q,fillT:t,reacted:false};
          if(lo<=st) close(st,'sl',t+u); }
      }
    }
    if(pos){ if(o.nr && q<=pos.fq+o.nr){ if(b.C[q]>pos.lvl) pos.reacted=true; if(q===pos.fq+o.nr && !pos.reacted) close(b.C[q],'nr',b.T[q]+H4); }
      if(pos && q-pos.fq>=180) close(b.C[q],'time',b.T[q]+H4); }
    if(o.ent==='A'){ armed=armed.filter(a=>q<a.sw+o.tapN-1); }
    else {
      const go=[];
      for(const a of armed){ if(a.tap<0 && q<=a.sw+o.tapN-1 && b.L[q]<=a.top) a.tap=q; if(a.tap>=0 && q<=a.tap+2 && b.C[q]>a.lvl) go.push(a); }
      armed=armed.filter(a=>!go.includes(a) && (a.tap>=0 ? q<a.tap+2 : q<a.sw+o.tapN-1));
      go.sort((x,y)=>x.sw-y.sw);
      for(const a of go){ const t=b.T[q]; if(!inU(t) || t<D19) continue; if(pos || t<lastExitEnd) continue;
        let st=a.bot; for(let z=a.sw;z<=q;z++) if(b.L[z]<st) st=b.L[z]; const e=b.C[q]; const tg=tgOf(e,st,a.rh); if(!(tg>e)) continue;
        pos={s:sym,tSw:b.T[a.sw],tS:b.T[a.p1],tE:t+H4,tEo:t,e,st,tg,lvl:a.lvl,fq:q,fillT:-1,reacted:false}; }
    }
    const p=q-P;
    if(p>=P){ let isP=true; for(let z=1;z<=P;z++){ if(!(b.L[p]<b.L[p-z] && b.L[p]<=b.L[p+z])){ isP=false; break; } }
      if(isP){
        const tol=o.tolATR*A[p]; let tch=[p];
        for(let z=pivs.length-1;z>=0;z--){ const v=pivs[z]; if(v<p-o.maxSpan) break; if(p-v<o.minSep) continue; if(Math.abs(b.L[v]-b.L[p])<=tol) tch.push(v); }
        if(tch.length>=2){ tch.sort((x,y)=>x-y); let p1=-1, lvl=0;
          for(let t=0;t<tch.length-1 && p1<0;t++){ const a=tch[t]; let lv=Infinity; for(let z=t;z<tch.length;z++) if(b.L[tch[z]]<lv) lv=b.L[tch[z]];
            let ok=true, mx=-Infinity; for(let z=a+1;z<p;z++){ if(b.L[z]<lv){ ok=false; break; } if(b.H[z]>mx) mx=b.H[z]; }
            if(ok){ for(let z=a+1;z<=p;z++) if(b.T[z]-b.T[z-1]!==H4){ ok=false; break; } }
            if(ok && mx-lv>=o.riseATR*A[p]){ p1=a; lvl=lv; tch=tch.slice(t); } }
          let cont=true; for(let z=p+1;z<=q;z++) if(b.T[z]-b.T[z-1]!==H4){ cont=false; break; }
          if(p1>=0 && cont){ let ob=null;
            for(let j=p1-1;j>=Math.max(1,p1-o.obBack) && !ob;j--){ if(b.T[j+1]-b.T[j]!==H4) break; if(!(b.C[j]<b.O[j])) continue;
              const top=b.H[j], bot=b.L[j]; if(!(top<lvl) || lvl-top>o.obGapATR*A[p1] || lvl-top<o.obGapMin*A[p1]) continue;
              let base=true; for(let z=j+1;z<p1;z++) if(b.L[z]<bot){ base=false; break; } if(!base) continue;
              let d=-1; for(let z=j+1;z<=Math.min(p1,j+o.disp);z++) if(b.C[z]>top){ d=z; break; } if(d<0) continue;
              let un=true; for(let z=d+1;z<p1;z++) if(b.L[z]<=top){ un=false; break; } if(!un) continue;
              ob={top,bot}; }
            if(ob) watch.push({p1,p2:p,lvl,top:ob.top,bot:ob.bot,touches:tch.length,span:p-p1,ord:ord++}); } }
        pivs.push(p); } }
  }
  if(pos) close(b.C[N-1],'eod',b.T[N-1]+H4);
  return trades; };
window.__EQLRUN2 = function(Uday,o){ const tr=[]; for(const sym of Object.keys(__B4)) tr.push(...__EQLENG2(sym,Uday,o)); tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); return tr; };
window.__EQLCMP = function(a,b){ const key=x=>x.s+'|'+x.tE; const mb=new Map(b.map(x=>[key(x),x])); let same=0,bad=0; const ex=[];
  for(const x of a){ const y=mb.get(key(x)); if(y && y.tX===x.tX && y.why===x.why && Math.abs(y.R-x.R)<1e-9 && y.tSw===x.tSw) same++; else { bad++; if(ex.length<3) ex.push({x,y}); } }
  return {nA:a.length,nB:b.length,same,bad,ex}; };
window.__SSLPV = function(h){ const H1=(window.__SUBMS||3600000), pv=[]; if(!h) return pv; for(let p=2;p<h.T.length-2;p++){ if(h.T[p+2]-h.T[p-2]!==4*H1) continue; if(h.H[p]>h.H[p-1]&&h.H[p]>h.H[p-2]&&h.H[p]>=h.H[p+1]&&h.H[p]>=h.H[p+2]) pv.push(p); } return pv; };
window.__SSLEV = function(sym,o){ o=Object.assign({wickATR:1.0,wickBody:2,minGap:3,reclaimN:3,maxAge:360,tgt:'tp1'},o); const b=__B4[sym]; if(!b) return [];
  const A=__ATR4(b,14), h=__B1[sym], pv=__SSLPV(h); const N=b.T.length, H4=(window.__BARMS||14400000); const bySweep=new Map();
  for(let i=20;i<N-1;i++){ const body=Math.abs(b.C[i]-b.O[i]), lw=Math.min(b.O[i],b.C[i])-b.L[i]; if(!(lw>=o.wickATR*A[i] && lw>=o.wickBody*body)) continue;
    const sL=b.L[i], sH=b.H[i]; let moved=false, j=-1;
    for(let q=i+1;q<Math.min(N,i+o.maxAge);q++){ if(b.T[q]-b.T[q-1]!==H4) break; if(b.L[q]<sL){ j=q; break; } if(b.H[q]>sH) moved=true; }
    if(j<0 || j-i-1<o.minGap || !moved) continue;
    let k=-1; for(let q=j;q<Math.min(N,j+o.reclaimN);q++){ if(b.C[q]>sL){ k=q; break; } } if(k<0) continue;
    const ev={i,j,k,w:lw/A[i]}; const prev=bySweep.get(j); if(!prev||ev.w>prev.w) bySweep.set(j,ev); }
  const out=[]; for(const ev of [...bySweep.values()].sort((a,c)=>a.k-c.k||a.j-c.j)){ const {i,j,k}=ev; let st=Infinity; for(let q=j;q<=k;q++) st=Math.min(st,b.L[q]); const e=b.C[k];
    let bsl=-Infinity; for(let q=i+1;q<j;q++) bsl=Math.max(bsl,b.H[q]);
    let tp1=NaN; if(h){ let lo=0,hi=pv.length; while(lo<hi){ const m=(lo+hi)>>1; if(h.T[pv[m]]<b.T[j]) lo=m+1; else hi=m; } for(let z=lo-1; z>=0; z--){ const p=pv[z]; if(h.T[p]<=b.T[i]+H4) break; if(h.H[p]>e){ tp1=h.H[p]; break; } } }
    let tg = o.tgt==='tp1'?tp1 : o.tgt==='bsl'?bsl : o.tgt==='r2'? e+2*(e-st) : e+3*(e-st);
    if(!(tg>e)) tg=NaN; out.push({s:sym,i,j,k,tS:b.T[i],tE:b.T[k]+H4,e,st,tg,tp1,bsl}); }
  return out; };
window.__SSLRUN = function(Uday,o){ o=o||{}; const DAY=(window.__DAYMS||86400000), H4=(window.__BARMS||14400000), t0=__M.T[0]; const tr=[]; let skipNoTp=0;
  for(const sym of Object.keys(__B4)){ const b=__B4[sym]; const evs=__SSLEV(sym,o); let busyTo=-1;
    for(const ev of evs){ const d=Math.round((Math.floor(b.T[ev.k]/DAY)*DAY-t0)/DAY)-1; if(d<0||d>=Uday.length||!Uday[d].has(sym)) continue; if(b.T[ev.k]<(window.__D19||Date.UTC(2019,0,1))) continue;
      if(ev.k<=busyTo) continue; if(!(ev.tg===ev.tg)){ skipNoTp++; continue; }
      let x=NaN, why='', qx=-1; const N=b.T.length;
      for(let q=ev.k+1;q<N;q++){ if(b.T[q]-b.T[q-1]!==H4){ x=b.C[q-1]; why='gap'; qx=q-1; break; }
        if(b.L[q]<=ev.st){ x=Math.min(ev.st,b.O[q]); why='sl'; qx=q; break; } if(b.H[q]>=ev.tg){ x=ev.tg; why='tp'; qx=q; break; } if(q-ev.k>=180){ x=b.C[q]; why='time'; qx=q; break; } }
      if(qx<0){ qx=N-1; x=b.C[N-1]; why='eod'; }
      busyTo=qx; tr.push({s:sym,k:ev.k,tS:ev.tS,tE:ev.tE,tX:b.T[qx]+H4,e:ev.e,st:ev.st,tg:ev.tg,x,why,R:(x-ev.e)/(ev.e-ev.st)}); } }
  tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); tr.skipNoTp=skipNoTp; return tr; };
window.__SSLENG2 = function(sym,Uday,o){ o=Object.assign({wickATR:1.0,wickBody:2,minGap:3,reclaimN:3,maxAge:360,tgt:'tp1'},o);
  const b=__B4[sym], h=__B1[sym]; if(!b) return []; const N=b.T.length, H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), DAY=(window.__DAYMS||86400000), t0=__M.T[0];
  // 1H pivotai: einant į priekį, tikrinant kiekvieną tarpą atskirai
  const PT=[], PH=[]; if(h){ for(let p=2;p+2<h.T.length;p++){ let ok=true; for(let q=p-1;q<=p+2;q++) if(h.T[q]-h.T[q-1]!==H1){ ok=false; break; } if(!ok) continue; const v=h.H[p]; if(v>h.H[p-1]&&v>h.H[p-2]&&v>=h.H[p+1]&&v>=h.H[p+2]){ PT.push(h.T[p]); PH.push(v); } } }
  let atr=0; const act=[], pend=[], groups=new Map(); const events=[];
  for(let q=0;q<N;q++){ const O=b.O[q],H=b.H[q],L=b.L[q],C=b.C[q]; const tr=q?Math.max(H,b.C[q-1])-Math.min(L,b.C[q-1]):H-L; atr= q<14 ? (atr*q+tr)/(q+1) : atr+(tr-atr)/14;
    if(q>0 && b.T[q]-b.T[q-1]!==H4) act.length=0;
    // laukiantys reclaim
    for(let z=pend.length-1;z>=0;z--){ const p=pend[z]; if(C>p.sL){ const g=groups.get(p.j)||[]; g.push({i:p.i,j:p.j,k:q,w:p.w,sL:p.sL}); groups.set(p.j,g); pend.splice(z,1); } else if(q-p.j+1>=o.reclaimN){ pend.splice(z,1); } }
    // aktyvūs SSL
    for(let z=act.length-1;z>=0;z--){ const s=act[z]; if(q-s.i>=o.maxAge){ act.splice(z,1); continue; }
      if(L<s.sL){ act.splice(z,1); if(q-s.i-1>=o.minGap && s.moved){ if(C>s.sL){ const g=groups.get(q)||[]; g.push({i:s.i,j:q,k:q,w:s.w,sL:s.sL}); groups.set(q,g); } else if(o.reclaimN>1) pend.push({i:s.i,j:q,w:s.w,sL:s.sL}); } continue; }
      if(H>s.sH) s.moved=true; }
    // grupių uždarymas: kai visi tos nušlavimo žvakės SSL išspręsti
    for(const [j,g] of [...groups]){ if(q>=j+o.reclaimN-1 || !pend.some(p=>p.j===j)){ if(pend.some(p=>p.j===j)) continue; let best=null; for(const e of g) if(!best||e.w>best.w) best=e; events.push(best); groups.delete(j); } }
    // nauja SSL žvakė
    if(q>=20 && q<N-1){ const body=Math.abs(C-O), lw=Math.min(O,C)-L; if(lw>=o.wickATR*atr && lw>=o.wickBody*body) act.push({i:q,sL:L,sH:H,moved:false,w:lw/atr}); }
  }
  for(const [j,g] of groups){ let best=null; for(const e of g) if(!best||e.w>best.w) best=e; events.push(best); }
  events.sort((a,c)=>a.k-c.k||a.j-c.j);
  // prekyba
  const trades=[]; let pos=null, ei=0; let skipNoTp=0;
  const evAt=new Map(); for(const e of events){ (evAt.get(e.k)||evAt.set(e.k,[]).get(e.k)).push(e); }
  for(let q=0;q<N;q++){
    if(pos){ let x=NaN,why=''; if(b.T[q]-b.T[q-1]!==H4){ x=b.C[q-1]; why='gap'; trades.push(Object.assign(pos,{tX:b.T[q-1]+H4,x,why,R:(x-pos.e)/(pos.e-pos.st)})); pos=null; }
      else { if(b.L[q]<=pos.st){ x=Math.min(pos.st,b.O[q]); why='sl'; } else if(b.H[q]>=pos.tg){ x=pos.tg; why='tp'; } else if(q-pos.k>=180){ x=b.C[q]; why='time'; }
        if(x===x){ trades.push(Object.assign(pos,{tX:b.T[q]+H4,x,why,R:(x-pos.e)/(pos.e-pos.st)})); pos=null; continue; } } }
    if(pos) continue;
    const list=evAt.get(q); if(!list) continue;
    for(const ev of list){ if(pos) break; const d=Math.round((Math.floor(b.T[q]/DAY)*DAY-t0)/DAY)-1; if(d<0||d>=Uday.length||!Uday[d].has(sym)) continue; if(b.T[q]<(window.__D19||Date.UTC(2019,0,1))) continue;
      let st=Infinity; for(let z=ev.j;z<=q;z++) st=Math.min(st,b.L[z]); const e=b.C[q];
      let tg; if(o.tgt==='tp1'){ tg=NaN; let lo=0,hi=PT.length; while(lo<hi){ const m=(lo+hi)>>1; if(PT[m]<b.T[ev.j]) lo=m+1; else hi=m; } for(let z=lo-1;z>=0;z--){ if(PT[z]<=b.T[ev.i]+H4) break; if(PH[z]>e){ tg=PH[z]; break; } } }
      else if(o.tgt==='bsl'){ tg=-Infinity; for(let z=ev.i+1;z<ev.j;z++) tg=Math.max(tg,b.H[z]); } else tg=e+(o.tgt==='r2'?2:3)*(e-st);
      if(!(tg>e)){ skipNoTp++; continue; }
      pos={s:sym,k:q,tS:b.T[ev.i],tE:b.T[q]+H4,e,st,tg}; }
  }
  if(pos){ const x=b.C[N-1]; trades.push(Object.assign(pos,{tX:b.T[N-1]+H4,x,why:'eod',R:(x-pos.e)/(pos.e-pos.st)})); }
  trades.skipNoTp=skipNoTp; return trades; };
window.__SSLRUN2 = function(Uday,o){ const tr=[]; let sk=0; for(const sym of Object.keys(__B4)){ const t=__SSLENG2(sym,Uday,o); sk+=t.skipNoTp; tr.push(...t); } tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); tr.skipNoTp=sk; return tr; };
window.__SSLCMP = function(a,b){ const key=x=>x.s+'|'+x.tE; const mb=new Map(b.map(x=>[key(x),x])); let same=0,bad=0; const ex=[]; for(const x of a){ const y=mb.get(key(x)); if(y&&y.tX===x.tX&&y.why===x.why&&Math.abs(y.R-x.R)<1e-9&&y.tS===x.tS) same++; else { bad++; if(ex.length<3) ex.push({x,y}); } } return {nA:a.length,nB:b.length,same,bad,ex,skipA:a.skipNoTp,skipB:b.skipNoTp}; };
window.__BOSEV = function(sym,o){
  o=Object.assign({piv:3,maxBos:60,ctx:0.25,ctxWin:180,dev:true,useCtx:true},o);
  const b=__B4[sym], N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const ph=[], pl=[];
  for(let p=P;p<N-P;p++){ let hi=true, lo=true; for(let z=1;z<=P;z++){ if(!(b.H[p]>b.H[p-z] && b.H[p]>=b.H[p+z])) hi=false; if(!(b.L[p]<b.L[p-z] && b.L[p]<=b.L[p+z])) lo=false; } if(hi) ph.push(p); if(lo) pl.push(p); }
  const byQ=new Map();
  for(let a=1;a<ph.length;a++){ const W=ph[a], W0=ph[a-1]; if(!(b.H[W0]>b.H[W])) continue;
    let pl0=-1, lo2=0, hi2=pl.length-1; while(lo2<=hi2){ const m=(lo2+hi2)>>1; if(pl[m]<W0){ pl0=pl[m]; lo2=m+1; } else hi2=m-1; }
    if(pl0<0) continue;
    let Lr=Infinity; for(let z=pl0;z<=W;z++) if(b.L[z]<Lr) Lr=b.L[z];
    let q=-1, D=Infinity, iD=-1;
    for(let z=W+1; z<Math.min(N,W+1+o.maxBos); z++){ if(b.T[z]-b.T[z-1]!==H4) break; if(b.L[z]<D){ D=b.L[z]; iD=z; } if(b.C[z]>b.H[W]){ q=z; break; } }
    if(q<0) continue;
    const dev=D<Lr; if(o.dev && !dev) continue;
    let RH=-Infinity, RL=Infinity; for(let z=Math.max(0,q-o.ctxWin); z<q; z++){ if(b.H[z]>RH) RH=b.H[z]; if(b.L[z]<RL) RL=b.L[z]; }
    const pos=(D-RL)/(RH-RL); if(o.useCtx && !(pos<=o.ctx)) continue;
    let ob=-1; for(let z=q-1; z>=iD; z--){ if(b.C[z]<b.O[z]){ ob=z; break; } }
    const ev={W,W0,pl0,q,iD,Lr,D,Hw:b.H[W],obH:ob>=0?b.H[ob]:NaN,RH,RL,pos,dev};
    const prev=byQ.get(q); if(!prev || W>prev.W) byQ.set(q,ev); }
  return [...byQ.values()].sort((x,y)=>x.q-y.q); };
window.__BOSFILL1 = function(b,h,h4i,q,lvl,tg,retWin){ const H4=(window.__BARMS||14400000), N=b.T.length;
  for(let z=q+1; z<Math.min(N,q+1+retWin); z++){ if(b.T[z]-b.T[z-1]!==H4) return null;
    const i=h4i[z];
    if(i>=0){ for(let k=i;k<i+4;k++){ if(h.L[k]<=lvl) return {mode:'A',e:Math.min(h.O[k],lvl),fq:z,fi:k,tEo:h.T[k]}; if(h.H[k]>=tg) return null; } }
    else { if(b.L[z]<=lvl) return {mode:'A',e:Math.min(b.O[z],lvl),fq:z,fi:-1,tEo:b.T[z]}; if(b.H[z]>=tg) return null; } }
  return null; };
window.__BOSRUN1 = function(Uday,o){ o=Object.assign({ent:'Lr',tgt:'rh',retWin:30},o);
  const DAY=(window.__DAYMS||86400000), t0=__M.T[0], D19=(window.__D19||Date.UTC(2019,0,1)); const tr=[]; const sk={badLvl:0,noTp:0,noFill:0,gapThru:0,busy:0};
  for(const sym of Object.keys(__B4)){ const b=__B4[sym], h=__B1[sym]; const h4i=__EQLH4I(sym); const evs=__BOSEV(sym,o); const cand=[];
    for(const ev of evs){ const lvl = o.ent==='Lr' ? ev.Lr : o.ent==='W' ? ev.Hw : ev.obH;
      if(!(lvl>ev.D) || !(lvl<b.C[ev.q])){ sk.badLvl++; continue; }
      const tg = o.tgt==='rh' ? ev.RH : lvl+(o.tgt==='r2'?2:3)*(lvl-ev.D); if(!(tg>lvl)){ sk.noTp++; continue; }
      const en=__BOSFILL1(b,h,h4i,ev.q,lvl,tg,o.retWin); if(!en){ sk.noFill++; continue; } if(en.e<=ev.D){ sk.gapThru++; continue; }
      cand.push({ev,en,lvl,tg}); }
    cand.sort((x,y)=>x.en.tEo-y.en.tEo||x.ev.q-y.ev.q);
    let busyEnd=-Infinity;
    for(const c of cand){ const d=Math.round((Math.floor(c.en.tEo/DAY)*DAY-t0)/DAY)-1; if(d<0||d>=Uday.length||!Uday[d].has(sym)) continue; if(c.en.tEo<D19) continue;
      if(c.en.tEo<busyEnd){ sk.busy++; continue; }
      const r=__EQLMNG1(b,h,h4i,c.en,c.ev.D,c.tg,NaN,0); busyEnd=r.tX;
      tr.push({s:sym,tW:b.T[c.ev.W],tQ:b.T[c.ev.q],tE:c.en.tEo,tEo:c.en.tEo,tX:r.tX,e:c.en.e,st:c.ev.D,tg:c.tg,lvl:c.lvl,x:r.x,why:r.why,R:(r.x-c.en.e)/(c.en.e-c.ev.D),fb:r.fb}); } }
  tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); tr.sk=sk; return tr; };
window.__BOSENG2 = function(sym,Uday,o){
  o=Object.assign({piv:3,maxBos:60,ctx:0.25,ctxWin:180,dev:true,useCtx:true,ent:'Lr',tgt:'rh',retWin:30},o);
  const b=__B4[sym], h=__B1[sym]; if(!b) return [];
  const N=b.T.length, H4=(window.__BARMS||14400000), H1=(window.__SUBMS||3600000), DAY=(window.__DAYMS||86400000), t0=__M.T[0], P=o.piv, D19=(window.__D19||Date.UTC(2019,0,1));
  const hs=new Int32Array(N).fill(-1);
  if(h){ let i=0; for(let q=0;q<N;q++){ while(i<h.T.length && h.T[i]<b.T[q]) i++; if(i+3<h.T.length && h.T[i]===b.T[q] && h.T[i+1]===b.T[q]+H1 && h.T[i+2]===b.T[q]+2*H1 && h.T[i+3]===b.T[q]+3*H1) hs[q]=i; } }
  const inU=t=>{ const d=Math.round((Math.floor(t/DAY)*DAY-t0)/DAY)-1; return d>=0 && d<Uday.length && Uday[d].has(sym); };
  const phs=[], pls=[]; let watch=[], armed=[]; let pos=null, lastExitEnd=-Infinity; const trades=[];
  const close=(x,why,tX)=>{ pos.x=x; pos.why=why; pos.tX=tX; pos.R=(x-pos.e)/(pos.e-pos.st); trades.push(pos); lastExitEnd=tX; pos=null; };
  for(let q=0;q<N;q++){
    if(q>0 && b.T[q]-b.T[q-1]!==H4){ if(pos) close(b.C[q-1],'gap',b.T[q-1]+H4); watch=[]; armed=[]; }
    const sub=[]; if(hs[q]>=0){ for(let k=hs[q];k<hs[q]+4;k++) sub.push([h.T[k],H1,h.O[k],h.H[k],h.L[k]]); } else sub.push([b.T[q],H4,b.O[q],b.H[q],b.L[q]]);
    for(const [t,u,op,hi,lo] of sub){
      if(pos && pos.fillT!==t){ if(lo<=pos.st) close(Math.min(op,pos.st),'sl',t+u); else if(hi>=pos.tg) close(pos.tg,'tp',t+u); }
      if(armed.length){ const keep=[];
        for(const a of armed){
          if(lo<=a.lvl){
            if(!inU(t) || t<D19) continue; if(pos || t<lastExitEnd) continue;
            const e=Math.min(op,a.lvl); if(e<=a.st) continue;
            pos={s:sym,tW:b.T[a.W],tQ:b.T[a.q],tE:t,tEo:t,e,st:a.st,tg:a.tg,lvl:a.lvl,fq:q,fillT:t};
            if(lo<=a.st) close(a.st,'sl',t+u);
            continue; }
          if(hi>=a.tg) continue;
          keep.push(a); }
        armed=keep; }
    }
    if(pos && q-pos.fq>=180) close(b.C[q],'time',b.T[q]+H4);
    armed=armed.filter(a=>q<a.q+o.retWin);
    { const hits=[], rest=[];
      for(const w of watch){ if(q>w.W+o.maxBos){ continue; }
        if(b.L[q]<w.D){ w.D=b.L[q]; w.iD=q; }
        if(b.C[q]>w.Hw) hits.push(w); else rest.push(w); }
      watch=rest; const ok=[];
      for(const w of hits){ const dev=w.D<w.Lr; if(o.dev && !dev) continue;
        let RH=-Infinity, RL=Infinity; for(let z=Math.max(0,q-o.ctxWin); z<q; z++){ if(b.H[z]>RH) RH=b.H[z]; if(b.L[z]<RL) RL=b.L[z]; }
        const ps=(w.D-RL)/(RH-RL); if(o.useCtx && !(ps<=o.ctx)) continue;
        let obH=NaN; for(let z=q-1; z>=w.iD; z--){ if(b.C[z]<b.O[z]){ obH=b.H[z]; break; } }
        ok.push({W:w.W,q,D:w.D,Lr:w.Lr,Hw:w.Hw,obH,RH}); }
      if(ok.length){ let best=ok[0]; for(const c of ok) if(c.W>best.W) best=c;
        const lvl = o.ent==='Lr' ? best.Lr : o.ent==='W' ? best.Hw : best.obH;
        if(lvl>best.D && lvl<b.C[q]){ const tg = o.tgt==='rh' ? best.RH : lvl+(o.tgt==='r2'?2:3)*(lvl-best.D);
          if(tg>lvl) armed.push({W:best.W,q,lvl,tg,st:best.D}); } } }
    const p=q-P;
    if(p>=P){ let hiP=true, loP=true; for(let z=1;z<=P;z++){ if(!(b.H[p]>b.H[p-z] && b.H[p]>=b.H[p+z])) hiP=false; if(!(b.L[p]<b.L[p-z] && b.L[p]<=b.L[p+z])) loP=false; }
      if(loP) pls.push(p);
      if(hiP){
        if(phs.length){ const W=p, W0=phs[phs.length-1];
          if(b.H[W0]>b.H[W]){ let pl0=-1; for(let z=pls.length-1;z>=0;z--){ if(pls[z]<W0){ pl0=pls[z]; break; } }
            if(pl0>=0){ let Lr=Infinity; for(let z=pl0;z<=W;z++) if(b.L[z]<Lr) Lr=b.L[z];
              let cont=true; for(let z=W+1;z<=q;z++) if(b.T[z]-b.T[z-1]!==H4){ cont=false; break; }
              if(cont){ let D=Infinity, iD=-1; for(let z=W+1;z<=q;z++) if(b.L[z]<D){ D=b.L[z]; iD=z; }
                watch.push({W,Hw:b.H[W],Lr,D,iD}); } } } }
        phs.push(p); } }
  }
  if(pos) close(b.C[N-1],'eod',b.T[N-1]+H4);
  return trades; };
window.__BOSRUN2 = function(Uday,o){ const tr=[]; for(const sym of Object.keys(__B4)) tr.push(...__BOSENG2(sym,Uday,o)); tr.sort((a,c)=>a.tE-c.tE||(a.s<c.s?-1:1)); return tr; };
window.__BOSCMP = function(a,b){ const key=x=>x.s+'|'+x.tE; const mb=new Map(b.map(x=>[key(x),x])); let same=0,bad=0; const ex=[];
  for(const x of a){ const y=mb.get(key(x)); if(y && y.tX===x.tX && y.why===x.why && Math.abs(y.R-x.R)<1e-9 && y.tQ===x.tQ) same++; else { bad++; if(ex.length<3) ex.push({x,y}); } }
  return {nA:a.length,nB:b.length,same,bad,ex}; };
window.__RLSEV = function(sym,o){
  o=Object.assign({piv:3,tol:0.3,devMin:0.5,hold:18,rise:4.0,maxSweep:120,need2:true,tapFrac:0.25,maxBelow:12,minAge:12,win:12},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const pv=__PIV(b,P), ph=pv.ph, pl=pv.pl;
  const contig=(a,z)=>{ for(let q=a+1;q<=z;q++) if(b.T[q]-b.T[q-1]!==H4) return false; return true; };
  const bySweep=new Map();
  for(let i=0;i<pl.length;i++){ const P1=pl[i]; const RL=b.L[P1];
    for(let j=i+1;j<pl.length;j++){ const P2=pl[j]; if(P2-P1>o.maxSweep) break; if(P2-P1<o.hold) continue; if(Math.abs(b.L[P2]-RL)>o.tol*A[P2]) continue;
      let D=Infinity, iD=-1, nb=0; for(let z=P1+1;z<P2;z++){ if(b.L[z]<D){ D=b.L[z]; iD=z; } if(b.L[z]<RL) nb++; }
      if(o.need2){ if(!(D<RL-o.devMin*A[P2])) continue; if(nb>o.maxBelow) continue; } else { if(D<RL) continue; }
      if(!contig(P1,P2)) continue;
      let mx=-Infinity; for(let z=P1;z<=P2;z++) if(b.H[z]>mx) mx=b.H[z]; if(mx-RL<o.rise*A[P2]) continue;
      const conf=P2+P; if(conf>=N) break; const lvl=Math.min(RL,b.L[P2]); const atr=A[conf]; const zoneTop=lvl, zoneBot=o.need2?D:lvl-o.devMin*atr;
      let sw=-1; for(let z=P2+1; z<Math.min(N,P2+o.maxSweep); z++){ if(b.T[z]-b.T[z-1]!==H4) break; if(z>conf && b.L[z]<lvl){ sw=z; break; } if(b.H[z]>mx) mx=b.H[z]; }
      if(sw<0) break; if(sw-P2<o.minAge) break;
      let lastPH=-1; for(let k=ph.length-1;k>=0;k--){ if(ph[k]<=sw-4){ lastPH=ph[k]; break; } } if(lastPH<P1) break;
      const ev={sym,P1,P2,iD,conf,sw,RL:lvl,D:zoneBot,zoneTop,zoneBot,RH:mx,supply:b.H[lastPH],iPH:lastPH,atr,tapLvl:zoneTop-o.tapFrac*(zoneTop-zoneBot),midLvl:zoneTop-0.5*(zoneTop-zoneBot)};
      const prev=bySweep.get(sw); if(!prev||(P2-P1)>(prev.P2-prev.P1)) bySweep.set(sw,ev); break; } }
  return [...bySweep.values()].sort((x,y)=>x.sw-y.sw); };
window.__RLS1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'A',lvl:'tap',tgt:'sup',need2:true},o); const evs=__RLSEV(sym,o); const out=[];
  for(const ev of evs){ const st=ev.zoneBot-0.25*ev.atr;
    if(o.ent==='A'){ const lvl=o.lvl==='mid'?ev.midLvl:ev.tapLvl; const tg=o.tgt==='sup'?ev.supply:o.tgt==='rh'?ev.RH:lvl+2*(lvl-st); if(!(tg>lvl)||!(lvl>st)) continue;
      const en=__FILL0(b,h,h4i,ev.sw,lvl,tg,12); if(!en) continue; out.push({en,st,tg,meta:{tSw:b.T[ev.sw],tP1:b.T[ev.P1],lvl,RL:ev.RL}}); }
    else { let qe=-1; for(let z=ev.sw; z<Math.min(b.T.length,ev.sw+3); z++){ if(z>ev.sw && b.T[z]-b.T[z-1]!==(window.__BARMS||14400000)) break; if(b.C[z]>ev.RL){ qe=z; break; } } if(qe<0) continue;
      let lo=Infinity; for(let z=ev.sw;z<=qe;z++) lo=Math.min(lo,b.L[z]); const stB=lo-0.25*ev.atr; const e=b.C[qe]; const tg=o.tgt==='sup'?ev.supply:e+2*(e-stB); if(!(tg>e)||!(e>stB)) continue;
      out.push({en:{mode:'C',e,fq:qe,fi:-1,tEo:b.T[qe]},st:stB,tg,meta:{tSw:b.T[ev.sw],tP1:b.T[ev.P1],lvl:e,RL:ev.RL}}); } }
  return out; };
window.__RLSM2 = {
init(b,o,api){ o=Object.assign({piv:3,tol:0.3,devMin:0.5,hold:18,rise:4.0,maxSweep:120,need2:true,tapFrac:0.25,maxBelow:12,minAge:12,win:12,ent:'A',lvl:'tap',tgt:'sup'},o); return {b,o,A:__ATR4(b,14),ph:[],pl:[],used:new Set(),gapAt:0,flag:false}; },
reset(s){ s.ph.length=0; s.pl.length=0; s.used.clear(); s.flag=true; },
preBar(q,s,api){ const {b,o}=s; if(s.flag){ s.gapAt=q; s.flag=false; }
    const cand=[];
    for(const a of api.armed){ if(a.act||a.bMode) continue; if(q>=a.P2+o.maxSweep){ a.drop=true; continue; }
      if(q>a.conf && b.L[q]<a.lvlRL){ let ok=(q-a.P2>=o.minAge); let sup=null; if(ok){ const k=s.ph.length-1; if(k>=0 && s.ph[k]>=a.P1) sup=b.H[s.ph[k]]; if(sup==null) ok=false; }
        if(ok){ a.supply=sup; a.touched=q; cand.push(a); } else a.drop=true; } }
    if(cand.length){ let best=cand[0]; for(const a of cand) if((a.P2-a.P1)>(best.P2-best.P1)) best=a; for(const a of cand) if(a!==best) a.drop=true; }
    api.armed=api.armed.filter(a=>!a.drop);
    api.armed.sort((x,y)=>(x.touched==null?Infinity:x.touched)-(y.touched==null?Infinity:y.touched)); },
onBar(q,s,api){ const {b,o,A}=s, P=o.piv;
    for(const a of api.armed){ if(a.bMode && a.act){ if(q<=a.sw+2){ if(b.C[q]>a.lvlRL){ let lo=Infinity; for(let z=a.sw;z<=q;z++) lo=Math.min(lo,b.L[z]); const st=lo-0.25*a.atr, e=b.C[q]; const tg=o.tgt==='sup'?a.supply:e+2*(e-st); if(tg>e && e>st) api.enter(e,st,tg,{tSw:b.T[a.sw],tP1:b.T[a.P1],lvl:e,RL:a.lvlRL},q); a.drop=true; } } else a.drop=true; } }
    api.armed=api.armed.filter(a=>!a.drop);
    for(const a of api.armed){ if(!a.act && b.H[q]>a.RH) a.RH=b.H[q]; }
    const k=q-P; if(k<s.gapAt || k<P) return;
    let hi=true, lo=true; for(let z=1;z<=P;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) hi=false; if(!(b.L[k]<b.L[k-z] && b.L[k]<=b.L[k+z])) lo=false; }
    if(hi) s.ph.push(k);
    if(lo){ const P2=k, conf=q;
      for(const P1 of s.pl){ if(s.used.has(P1)) continue; const RL=b.L[P1]; if(P2-P1>o.maxSweep){ s.used.add(P1); continue; } if(P2-P1<o.hold) continue; if(Math.abs(b.L[P2]-RL)>o.tol*A[P2]) continue;
        let D=Infinity, nb=0; for(let z=P1+1;z<P2;z++){ if(b.L[z]<D) D=b.L[z]; if(b.L[z]<RL) nb++; }
        if(o.need2){ if(!(D<RL-o.devMin*A[P2])) continue; if(nb>o.maxBelow) continue; } else { if(D<RL) continue; }
        let mx=-Infinity; for(let z=P1;z<=P2;z++) if(b.H[z]>mx) mx=b.H[z]; if(mx-RL<o.rise*A[P2]) continue;
        s.used.add(P1); const lvl=Math.min(RL,b.L[P2]); const atr=A[conf]; const zoneTop=lvl, zoneBot=o.need2?D:lvl-o.devMin*atr; let mx2=mx; for(let z=P2+1;z<=conf;z++) if(b.H[z]>mx2) mx2=b.H[z];
        api.armed.push({P1,P2,conf,lvlRL:lvl,zoneBot,atr,st:zoneBot-0.25*atr,tapLvl:zoneTop-o.tapFrac*(zoneTop-zoneBot),midLvl:zoneTop-0.5*(zoneTop-zoneBot),RH:mx2,lvl:-Infinity,tg:Infinity,until:Infinity,
          actFn:(qq,a)=>a.touched===qq,
          postAct:(qq,a)=>{ if(o.ent==='A'){ const L=o.lvl==='mid'?a.midLvl:a.tapLvl; const tg=o.tgt==='sup'?a.supply:o.tgt==='rh'?a.RH:L+2*(L-a.st); if(!(tg>L)||!(L>a.st)) return false; a.lvl=L; a.tg=tg; a.until=qq+o.win-1; a.meta={tSw:b.T[qq],tP1:b.T[a.P1],lvl:L,RL:a.lvlRL}; return true; }
            else { a.bMode=true; a.sw=qq; a.lvl=-Infinity; a.tg=Infinity; a.until=qq+3; return true; } } }); }
      s.pl.push(P2); } }
};
window.__RLSSH = {
"R1": {"ent":"A","lvl":"tap","tgt":"sup"},
"R2": {"ent":"A","lvl":"tap","tgt":"rh"},
"R3": {"ent":"A","lvl":"tap","tgt":"r2"},
"R4": {"ent":"A","lvl":"mid","tgt":"r2"},
"R5": {"ent":"B","tgt":"sup"},
"R6": {"ent":"B","tgt":"r2"},
"R7": {"ent":"A","lvl":"tap","tgt":"r2","need2":false}
};
window.__DAILY = function(sym){ return (window.__B4===window.__B4S)?((__DDA&&__DDA[sym])||(__DD&&__DD[sym])):((__DD&&__DD[sym])||(__DDA&&__DDA[sym])); };
window.__HTFSUP = function(sym,b,conf,RH,cap){ const D=__DAILY(sym); if(!D) return null; const DAY=(window.__DAYMS||86400000), P=5; const dayStart=Math.floor(b.T[conf]/DAY)*DAY; let dEnd=-1; { let lo=0,hi=D.T.length-1; while(lo<=hi){ const m=(lo+hi)>>1; if(D.T[m]<=dayStart-DAY){ dEnd=m; lo=m+1; } else hi=m-1; } } if(dEnd<P) return null;
  let mx4=-Infinity; for(let z=conf; z>=0 && b.T[z]>=dayStart; z--) if(b.H[z]>mx4) mx4=b.H[z];
  let best=null; let runMax=mx4;
  for(let k=dEnd; k>=Math.max(P,dEnd-365); k--){ if(k<=dEnd-P){ const S=D.H[k]; if(S>RH && S<=cap && runMax<S){ let piv=true; for(let j=1;j<=P;j++){ if(!(D.H[k]>D.H[k-j] && D.H[k]>=D.H[k+j])) piv=false; } if(piv && (!best||S<best.S)) best={S,k}; } } if(D.H[k]>runMax) runMax=D.H[k]; }
  return best; };
window.__RHFEV = function(sym,o){
  o=Object.assign({look:180,minAge:12,depth:4.0,leg:1.0,pbWin:30,pbTol:0.25,pbMax:1.0,piv:2,hiWin:60,win:30},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const out=[]; let lastB=-Infinity;
  for(let q=o.look;q<N-1;q++){
    if(!(b.C[q]>b.C[q-1])) continue; if(q-lastB<o.pbWin) continue;
    let ok=true; for(let z=q-o.look+1; z<=q; z++){ if(b.T[z]-b.T[z-1]!==H4){ ok=false; break; } } if(!ok) continue;
    let RH=-Infinity, iRH=-1, lo=Infinity; for(let z=q-o.look; z<q; z++){ if(b.H[z]>RH){ RH=b.H[z]; iRH=z; } if(b.L[z]<lo) lo=b.L[z]; }
    if(!(b.C[q]>RH) || b.C[q-1]>RH) continue;
    const atr=A[q]; if(q-iRH<o.minAge) continue; if(RH-lo<o.depth*atr) continue;
    const B=q; lastB=B;
    let L1=-1; for(let z=B+1; z<=Math.min(N-1-P,B+o.pbWin); z++){ if(b.T[z]-b.T[z-1]!==H4) break; let piv=true; for(let k=1;k<=P;k++){ if(!(b.L[z]<b.L[z-k] && b.L[z]<=b.L[z+k])) piv=false; } if(!piv) continue; if(b.L[z]<RH-o.pbTol*atr) break; if(b.L[z]>RH+o.pbMax*atr) break; L1=z; break; }
    if(L1<0) continue;
    let legHi=-Infinity; for(let z=B; z<=L1; z++) if(b.H[z]>legHi) legHi=b.H[z]; if(legHi-RH<o.leg*atr) continue;
    let H1=-1, bad=false; for(let z=L1+P+1; z<=Math.min(N-1-P,L1+o.hiWin); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(b.C[z]<RH){ bad=true; break; } let piv=true; for(let k=1;k<=P;k++){ if(!(b.H[z]>b.H[z-k] && b.H[z]>=b.H[z+k])) piv=false; } if(piv && b.H[z]>legHi){ H1=z; break; } }
    if(bad||H1<0) continue;
    const conf=H1+P; const ZT=b.L[L1], ZB=RH-o.pbTol*atr; if(!(ZT>ZB)) continue;
    out.push({sym,B,iRH,L1,H1,conf,RH,ZT,ZB,legHi,recHi:b.H[H1],atr:A[conf],atrB:atr,st1:RH-0.5*A[conf],lo}); }
  return out; };
window.__RHF1 = function(sym,o,b,h,h4i){ o=Object.assign({lvl:'zt',tgt:'rec',ex:'stop',f08:false,win:30},o); const evs=__RHFEV(sym,o); const out=[];
  for(const ev of evs){ if(o.f08){ const cap=ev.RH+2*(ev.recHi-ev.RH); if(__HTFSUP(sym,b,ev.conf,ev.RH,cap)) continue; }
    const lvl=o.lvl==='rh'?ev.RH:ev.ZT; const st1=ev.st1; const R1=lvl-st1; if(!(R1>0)) continue; const tg=o.tgt==='rec'?ev.recHi:o.tgt==='r3'?lvl+3*R1:lvl+2*R1; if(!(tg>lvl)) continue;
    const rule=o.ex==='rule'; const st=rule?lvl-1.5*R1:st1; const en=__FILL0(b,h,h4i,ev.conf+1,lvl,tg,o.win); if(!en) continue; if(rule && en.e<=st1) continue;
    const RH=ev.RH, fq=en.fq; const exitFn=rule?(q=>(q>=fq+1 && b.C[q]<RH && b.C[q-1]<RH)?b.C[q]:null):null;
    out.push({en,st,tg,exitFn,meta:{tB:b.T[ev.B],tQ:b.T[ev.conf],tSw:b.T[ev.conf],RH,ZT:ev.ZT,recHi:ev.recHi,st1,lvl,rule}}); }
  return out; };
window.__RHFM2 = {
init(b,o,api){ o=Object.assign({look:180,minAge:12,depth:4.0,leg:1.0,pbWin:30,pbTol:0.25,pbMax:1.0,piv:2,hiWin:60,win:30,lvl:'zt',tgt:'rec',ex:'stop',f08:false},o); const sym=Object.keys(__B4).find(k=>__B4[k]===b); return {b,o,A:__ATR4(b,14),sets:[],lastB:-Infinity,gapAt:0,flag:false,sym}; },
reset(s){ s.sets.length=0; s.flag=true; },
preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } },
exit(pos,q,s){ if(!pos.rule) return null; const b=s.b; return (q>=pos.fq+1 && b.C[q]<pos.RH && b.C[q-1]<pos.RH)?b.C[q]:null; },
onBar(q,s,api){ const {b,o,A}=s, P=o.piv, H4=(window.__BARMS||14400000), N=b.T.length; const keep=[];
    for(const S of s.sets){
      if(S.phase===1){ const z=q-P; if(z<=S.B){ keep.push(S); continue; } if(z>S.B+o.pbWin) continue; if(z>N-1-P) continue;
        let piv=true; for(let k=1;k<=P;k++){ if(!(b.L[z]<b.L[z-k] && b.L[z]<=b.L[z+k])) piv=false; } if(!piv){ keep.push(S); continue; }
        if(b.L[z]<S.RH-o.pbTol*S.atr || b.L[z]>S.RH+o.pbMax*S.atr) continue;
        let legHi=-Infinity; for(let y=S.B;y<=z;y++) if(b.H[y]>legHi) legHi=b.H[y]; if(legHi-S.RH<o.leg*S.atr) continue; S.L1=z; S.legHi=legHi; S.phase=2; keep.push(S); continue; }
      if(S.phase===2){ const z=q-P; if(z<S.L1+P+1){ keep.push(S); continue; } if(z>S.L1+o.hiWin) continue; if(b.C[z]<S.RH) continue;
        let piv=true; for(let k=1;k<=P;k++){ if(!(b.H[z]>b.H[z-k] && b.H[z]>=b.H[z+k])) piv=false; } if(!(piv && b.H[z]>S.legHi)){ keep.push(S); continue; }
        const conf=q, ZT=b.L[S.L1], ZB=S.RH-o.pbTol*S.atr; if(!(ZT>ZB)) continue; const recHi=b.H[z]; const atr=A[conf]; const st1=S.RH-0.5*atr;
        if(o.f08){ const cap=S.RH+2*(recHi-S.RH); if(__HTFSUP(s.sym,b,conf,S.RH,cap)) continue; }
        const lvl=o.lvl==='rh'?S.RH:ZT; const R1=lvl-st1; if(!(R1>0)) continue; const tg=o.tgt==='rec'?recHi:o.tgt==='r3'?lvl+3*R1:lvl+2*R1; if(!(tg>lvl)) continue;
        const rule=o.ex==='rule'; const st=rule?lvl-1.5*R1:st1;
        api.armed.push({lvl,st,tg,minE:rule?st1:null,from:conf+1,until:conf+o.win,meta:{tB:b.T[S.B],tQ:b.T[conf],tSw:b.T[conf],RH:S.RH,ZT,recHi,st1,lvl,rule}}); continue; } }
    s.sets=keep;
    if(q>=o.look && q-s.lastB>=o.pbWin && b.C[q]>b.C[q-1]){ let ok=true; for(let z=q-o.look+1; z<=q; z++){ if(b.T[z]-b.T[z-1]!==H4){ ok=false; break; } } if(ok){
      let RH=-Infinity, iRH=-1, lo=Infinity; for(let z=q-o.look; z<q; z++){ if(b.H[z]>RH){ RH=b.H[z]; iRH=z; } if(b.L[z]<lo) lo=b.L[z]; }
      if(b.C[q]>RH && !(b.C[q-1]>RH)){ const atr=A[q]; if(q-iRH>=o.minAge && RH-lo>=o.depth*atr){ s.lastB=q; s.sets.push({phase:1,B:q,RH,atr,iRH}); } } } } }
};
window.__RHFPOST = function(tr){ for(const t of tr){ if(t.rule) t.R=(t.x-t.e)/(t.e-t.st1); } return tr; };
window.__RHFSH = {
"F1": {"lvl":"zt","tgt":"rec","ex":"stop"},
"F2": {"lvl":"zt","tgt":"rec","ex":"rule"},
"F3": {"lvl":"zt","tgt":"r2","ex":"rule"},
"F4": {"lvl":"zt","tgt":"r2","ex":"stop"},
"F5": {"lvl":"rh","tgt":"rec","ex":"rule"},
"F6": {"lvl":"zt","tgt":"r3","ex":"rule"},
"F7": {"lvl":"zt","tgt":"rec","ex":"rule","f08":true}
};
window.__GPEV = function(sym,o){ o=Object.assign({piv:3,legMax:24,rise:5.0,fvgMin:0.5,gpFvg:true,win:60,look:180,posMax:null},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const pv=__PIV(b,P); const out=[];
  for(const H0 of pv.ph){ const conf=H0+P; if(conf>=N) break; let ok=true; for(let z=H0-o.legMax+1; z<=conf; z++){ if(z<=0||b.T[z]-b.T[z-1]!==H4){ ok=false; break; } } if(!ok) continue;
    let L0=-1, lo=Infinity; for(let z=H0-o.legMax; z<=H0; z++){ if(b.L[z]<lo){ lo=b.L[z]; L0=z; } } const Hh=b.H[H0], atr=A[H0]; const h=Hh-lo; if(h<o.rise*atr) continue;
    const fvgs=[]; for(let i=L0+1;i<H0;i++){ const g=b.L[i+1]-b.H[i-1]; if(g>=o.fvgMin*atr && g>0) fvgs.push({i,top:b.L[i+1],bot:b.H[i-1]}); } if(!fvgs.length) continue;
    const P618=Hh-0.618*h, P706=Hh-0.706*h, P79=Hh-0.79*h, P382=Hh-0.382*h, P50=Hh-0.5*h;
    if(o.gpFvg){ let inside=false; for(const f of fvgs){ if(f.top>P706 && f.bot<P618){ inside=true; break; } } if(!inside) continue; }
    let early=false; for(let z=H0+1; z<=conf; z++){ if(b.L[z]<=P618){ early=true; break; } } if(early) continue;
    let rlo=Infinity, rhi=-Infinity; for(let z=Math.max(0,L0-o.look); z<L0; z++){ if(b.L[z]<rlo) rlo=b.L[z]; if(b.H[z]>rhi) rhi=b.H[z]; } const pos=(rhi>rlo)?(lo-rlo)/(rhi-rlo):NaN;
    if(o.posMax!=null && !(pos<=o.posMax)) continue;
    out.push({sym,L0,H0,conf,lo,Hh,h,atr,P618,P706,P79,P382,P50,fvgs,pos}); }
  let lastH0=-1; return out.filter(e=>{ if(e.L0<=lastH0) return false; lastH0=e.H0; return true; }); };
window.__GP1 = function(sym,o,b,h,h4i){ o=Object.assign({lvl:'618',tgt:'382',win:60},o); const evs=__GPEV(sym,o); const out=[];
  for(const ev of evs){ const lvl=o.lvl==='706'?ev.P706:ev.P618; const st=ev.P79-0.1*ev.atr; const R1=lvl-st; if(!(R1>0)) continue; const tg=o.tgt==='0'?ev.Hh:o.tgt==='50'?ev.P50:o.tgt==='r2'?lvl+2*R1:ev.P382; if(!(tg>lvl)) continue;
    const en=__FILL0(b,h,h4i,ev.conf+1,lvl,ev.Hh,o.win); if(!en) continue; out.push({en,st,tg,meta:{tQ:b.T[ev.conf],tSw:b.T[ev.conf],tH0:b.T[ev.H0],tL0:b.T[ev.L0],lvl,h:ev.h,pos:ev.pos}}); } return out; };
window.__GPM2 = {
init(b,o,api){ o=Object.assign({piv:3,legMax:24,rise:5.0,fvgMin:0.5,gpFvg:true,win:60,look:180,posMax:null,lvl:'618',tgt:'382'},o); return {b,o,A:__ATR4(b,14),lastH0:-1}; },
onBar(q,s,api){ const {b,o,A}=s, P=o.piv, H4=(window.__BARMS||14400000); const k=q-P; if(k<P) return;
    let piv=true; for(let z=1;z<=P;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) piv=false; } if(!piv) return;
    for(let z=k-o.legMax+1; z<=q; z++){ if(z<=0||b.T[z]-b.T[z-1]!==H4) return; }
    let L0=-1, lo=Infinity; for(let z=k-o.legMax; z<=k; z++){ if(b.L[z]<lo){ lo=b.L[z]; L0=z; } } const Hh=b.H[k], atr=A[k]; const h=Hh-lo; if(h<o.rise*atr) return;
    const fvgs=[]; for(let i=L0+1;i<k;i++){ const g=b.L[i+1]-b.H[i-1]; if(g>=o.fvgMin*atr && g>0) fvgs.push({top:b.L[i+1],bot:b.H[i-1]}); } if(!fvgs.length) return;
    const P618=Hh-0.618*h, P706=Hh-0.706*h, P79=Hh-0.79*h, P382=Hh-0.382*h, P50=Hh-0.5*h;
    if(o.gpFvg){ let inside=false; for(const f of fvgs){ if(f.top>P706 && f.bot<P618){ inside=true; break; } } if(!inside) return; }
    for(let z=k+1; z<=q; z++){ if(b.L[z]<=P618) return; }
    let rlo=Infinity, rhi=-Infinity; for(let z=Math.max(0,L0-o.look); z<L0; z++){ if(b.L[z]<rlo) rlo=b.L[z]; if(b.H[z]>rhi) rhi=b.H[z]; } const pos=(rhi>rlo)?(lo-rlo)/(rhi-rlo):NaN;
    if(o.posMax!=null && !(pos<=o.posMax)) return;
    if(L0<=s.lastH0) return; s.lastH0=k;
    const lvl=o.lvl==='706'?P706:P618; const st=P79-0.1*atr; const R1=lvl-st; if(!(R1>0)) return; const tg=o.tgt==='0'?Hh:o.tgt==='50'?P50:o.tgt==='r2'?lvl+2*R1:P382; if(!(tg>lvl)) return;
    api.armed.push({lvl,st,tg,cancel:Hh,from:q+1,until:q+o.win,meta:{tQ:b.T[q],tSw:b.T[q],tH0:b.T[k],tL0:b.T[L0],lvl,h,pos}}); }
};
window.__GPSH = {
"G1": {"lvl":"618","tgt":"0"},
"G2": {"lvl":"618","tgt":"382"},
"G3": {"lvl":"618","tgt":"r2"},
"G4": {"lvl":"706","tgt":"382"},
"G5": {"lvl":"618","tgt":"382","gpFvg":false},
"G6": {"lvl":"618","tgt":"382","posMax":0.25},
"G7": {"lvl":"618","tgt":"50"}
};
window.__FLEV = function(sym,o){ o=Object.assign({piv:3,tol:0.3,hold:12,maxLvl:120,brkMax:120,brkTol:0.1,pole:2.0,poleMax:18,fp:2,flagMax:36,flagMin:6,flagHold:0.25,brk2Max:30,look:180},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv, F=o.fp; const pv=__PIV(b,P), ph=pv.ph; const ph2=__PIV(b,F).ph;
  const contig=(a,z)=>{ for(let q=a+1;q<=z;q++) if(b.T[q]-b.T[q-1]!==H4) return false; return true; };
  const cands=[];
  for(let i=0;i<ph.length;i++){ const Ha=ph[i];
    for(let j=i+1;j<ph.length;j++){ const Hb=ph[j]; if(Hb-Ha>o.maxLvl) break; if(Hb-Ha<o.hold) continue; if(Math.abs(b.H[Hb]-b.H[Ha])>o.tol*A[Hb]) continue; const L=Math.max(b.H[Ha],b.H[Hb]);
      let bad=false; for(let z=Ha+1;z<Hb;z++){ if(b.C[z]>L){ bad=true; break; } } if(bad) continue; if(!contig(Ha,Hb)) continue;
      const c0=Hb+P; if(c0>=N) break;
      let B=-1; for(let z=c0+1; z<Math.min(N,Hb+o.brkMax); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(b.C[z]>L+o.brkTol*A[z]){ B=z; break; } if(b.C[z]>L){ bad=true; break; } } if(bad||B<0) break;
      cands.push({Ha,Hb,L,B}); break; } }
  cands.sort((x,y)=>x.B-y.B||x.Ha-y.Ha); const out=[]; let lastB=-1;
  for(const c of cands){ if(c.B<=lastB) continue; lastB=c.B; const {Ha,Hb,L,B}=c; const atr=A[B];
    let PH=-1; for(const p of ph2){ if(p<B) continue; if(p>B+o.poleMax) break; if(b.H[p]>=L+o.pole*atr){ PH=p; break; } } if(PH<0) continue;
    const conf1=PH+F; if(conf1>=N) continue; if(!contig(B,conf1)) continue; let bad2=false; for(let z=B+1;z<=conf1;z++){ if(b.C[z]<L){ bad2=true; break; } } if(bad2) continue;
    let rlo=Infinity, ilo=-1, rhi=-Infinity; for(let z=Math.max(0,B-o.look); z<B; z++){ if(b.L[z]<rlo){ rlo=b.L[z]; ilo=z; } if(b.H[z]>rhi) rhi=b.H[z]; }
    let h1=-1,h2=-1; for(const p of ph2){ if(p<=PH) continue; if(p>PH+o.flagMax) break; if(h1<0){ if(b.H[p]<b.H[PH]) h1=p; else break; } else { if(b.H[p]<b.H[h1]){ h2=p; break; } else break; } }
    let flag=null; if(h1>=0&&h2>=0&&h2-PH>=o.flagMin){ const conf2=h2+F; if(conf2<N && contig(PH,conf2)){ let flo=Infinity; for(let z=PH+1;z<=conf2;z++){ if(b.L[z]<flo) flo=b.L[z]; } if(flo>=L-o.flagHold*atr){ const slope=(b.H[h2]-b.H[h1])/(h2-h1); const line=q=>b.H[h1]+slope*(q-h1); let Bf=-1; for(let z=conf2+1; z<=Math.min(N-1,conf2+o.brk2Max); z++){ if(b.T[z]-b.T[z-1]!==H4) break; if(b.C[z]>line(z)){ Bf=z; break; } } flag={h1,h2,conf2,flo,slope,Bf,lineBf:Bf>=0?line(Bf):NaN}; } } }
    out.push({sym,Ha,Hb,L,B,PH,conf1,atr,poleHi:b.H[PH],rlo,ilo,rhi,sweepAge:B-ilo,flag}); }
  return out; };
window.__FL1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'sr',tgt:'pole',needFlag:false,ctx:false,win1:30,win2:12,ctxAge:90},o); const evs=__FLEV(sym,o); const out=[];
  for(const ev of evs){ if(o.ctx && !(ev.sweepAge<=o.ctxAge)) continue;
    if(o.ent==='sr'){ if(o.needFlag && !ev.flag) continue; const start=(o.needFlag?ev.flag.conf2:ev.conf1)+1; const lvl=ev.L, st=ev.L-ev.atr; const R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:ev.poleHi; if(!(tg>lvl)) continue;
      const en=__FILL0(b,h,h4i,start,lvl,ev.poleHi,o.win1); if(!en) continue; out.push({en,st,tg,meta:{tQ:b.T[start-1],tSw:b.T[ev.B],tB:b.T[ev.B],tL:b.T[ev.Hb],lvl,L:ev.L,poleHi:ev.poleHi,ent:'sr'}}); }
    else { if(!ev.flag||ev.flag.Bf<0) continue; const f=ev.flag; const lvl=f.lineBf, st=f.flo-0.25*ev.atr; const R1=lvl-st; if(!(R1>0)) continue; const tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='pole'?ev.poleHi:lvl+(ev.poleHi-ev.L); if(!(tg>lvl)) continue;
      const en=__FILL0(b,h,h4i,f.Bf+1,lvl,tg,o.win2); if(!en) continue; out.push({en,st,tg,meta:{tQ:b.T[f.Bf],tSw:b.T[ev.B],tB:b.T[ev.B],tL:b.T[ev.Hb],lvl,L:ev.L,poleHi:ev.poleHi,ent:'flag'}}); } }
  return out; };
window.__FLM2 = {
"init": function init(b,o,api){ o=Object.assign({piv:3,tol:0.3,hold:12,maxLvl:120,brkMax:120,brkTol:0.1,pole:2.0,poleMax:18,fp:2,flagMax:36,flagMin:6,flagHold:0.25,brk2Max:30,look:180,ent:'sr',tgt:'pole',needFlag:false,ctx:false,win1:30,win2:12,ctxAge:90},o); return {b,o,A:__ATR4(b,14),ph:[],used:new Set(),lv:[],ev:[],gapAt:0,flag:false,lastB:-1}; },
"reset": function reset(s){ s.ph.length=0; s.used.clear(); s.lv.length=0; s.ev.length=0; s.flag=true; },
"preBar": function preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } },
"onBar": function onBar(q,s,api){ const {b,o,A}=s, P=o.piv, F=o.fp, H4=(window.__BARMS||14400000); const isPH=(k,n)=>{ if(k<s.gapAt||k<n) return false; for(let z=1;z<=n;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) return false; } return true; };
    // 1) level setups: wait breakout
    const keepLv=[]; const brk=[];
    for(const S of s.lv){ if(q<=S.c0){ keepLv.push(S); continue; } if(q>=S.Hb+o.brkMax){ continue; } if(b.C[q]>S.L+o.brkTol*A[q]){ brk.push(S); continue; } if(b.C[q]>S.L){ continue; } keepLv.push(S); }
    s.lv=keepLv;
    if(brk.length && q>s.lastB){ brk.sort((x,y)=>x.Ha-y.Ha); const S=brk[0]; s.lastB=q; const atr=A[q]; let rlo=Infinity, ilo=-1, rhi=-Infinity; for(let z=Math.max(0,q-o.look); z<q; z++){ if(b.L[z]<rlo){ rlo=b.L[z]; ilo=z; } if(b.H[z]>rhi) rhi=b.H[z]; }
      s.ev.push({Ha:S.Ha,Hb:S.Hb,L:S.L,B:q,atr,ilo,sweepAge:q-ilo,phase:'pole',PH:-1,h1:-1,h2:-1}); }
    // 2) events: pole / flag / flag breakout
    const keepEv=[];
    for(const E of s.ev){
      if(E.phase==='pole'){ if(q>E.B && b.C[q]<E.L) continue; const k=q-F; if(k<E.B){ keepEv.push(E); continue; } if(k>E.B+o.poleMax) continue;
        if(isPH(k,F) && b.H[k]>=E.L+o.pole*E.atr){ E.PH=k; E.conf1=q; E.poleHi=b.H[k]; E.phase='flag';
          if(o.ent==='sr' && !o.needFlag && (!o.ctx || E.sweepAge<=o.ctxAge)){ const lvl=E.L, st=E.L-E.atr, R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:E.poleHi; if(tg>lvl) api.armed.push({lvl,st,tg,cancel:E.poleHi,from:q+1,until:q+o.win1,meta:{tQ:b.T[q],tSw:b.T[E.B],tB:b.T[E.B],tL:b.T[E.Hb],lvl,L:E.L,poleHi:E.poleHi,ent:'sr'}}); }
          keepEv.push(E); continue; }
        keepEv.push(E); continue; }
      if(E.phase==='flag'){ const k=q-F; if(k<=E.PH){ keepEv.push(E); continue; } if(k>E.PH+o.flagMax) continue;
        if(!isPH(k,F)){ keepEv.push(E); continue; }
        if(E.h1<0){ if(b.H[k]<E.poleHi){ E.h1=k; keepEv.push(E); } continue; }
        if(b.H[k]<b.H[E.h1]){ E.h2=k; if(k-E.PH<o.flagMin) continue; E.conf2=q; let flo=Infinity; for(let z=E.PH+1;z<=q;z++){ if(b.L[z]<flo) flo=b.L[z]; } if(flo<E.L-o.flagHold*E.atr) continue; E.flo=flo; E.slope=(b.H[E.h2]-b.H[E.h1])/(E.h2-E.h1); E.phase='brk2';
          if(o.ent==='sr' && o.needFlag && (!o.ctx || E.sweepAge<=o.ctxAge)){ const lvl=E.L, st=E.L-E.atr, R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:E.poleHi; if(tg>lvl) api.armed.push({lvl,st,tg,cancel:E.poleHi,from:q+1,until:q+o.win1,meta:{tQ:b.T[q],tSw:b.T[E.B],tB:b.T[E.B],tL:b.T[E.Hb],lvl,L:E.L,poleHi:E.poleHi,ent:'sr'}}); }
          if(o.ent!=='flag') continue; keepEv.push(E); continue; }
        continue; }
      if(E.phase==='brk2'){ if(q>E.conf2+o.brk2Max) continue; const lineq=b.H[E.h1]+E.slope*(q-E.h1); if(b.C[q]>lineq){ const lvl=lineq, st=E.flo-0.25*E.atr, R1=lvl-st; if(R1>0){ const tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='pole'?E.poleHi:lvl+(E.poleHi-E.L); if(tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.win2,meta:{tQ:b.T[q],tSw:b.T[E.B],tB:b.T[E.B],tL:b.T[E.Hb],lvl,L:E.L,poleHi:E.poleHi,ent:'flag'}}); } continue; } keepEv.push(E); continue; } }
    s.ev=keepEv;
    // 3) new pivot high (3/3) at k=q-P -> level pairs
    const k=q-P; if(k>=P && isPH(k,P)){ const Hb=k;
      for(const Ha of s.ph){ if(s.used.has(Ha)) continue; if(Hb-Ha>o.maxLvl){ s.used.add(Ha); continue; } if(Hb-Ha<o.hold) continue; if(Math.abs(b.H[Hb]-b.H[Ha])>o.tol*A[Hb]) continue; const L=Math.max(b.H[Ha],b.H[Hb]); let bad=false; for(let z=Ha+1;z<Hb;z++){ if(b.C[z]>L){ bad=true; break; } } if(bad) continue;
        s.used.add(Ha); s.lv.push({Ha,Hb,L,c0:q}); }
      s.ph.push(Hb); } }
};
window.__FLSH = {
"P1": {"ent":"sr","tgt":"pole"},
"P2": {"ent":"sr","tgt":"r2"},
"P3": {"ent":"sr","tgt":"pole","needFlag":true},
"P4": {"ent":"flag","tgt":"mm"},
"P5": {"ent":"flag","tgt":"r2"},
"P6": {"ent":"sr","tgt":"pole","ctx":true},
"P7": {"ent":"flag","tgt":"pole"}
};
window.__MOEV = function(sym,o){ o=Object.assign({piv:3,fp:2,hold:12,maxCons:120,brkTol:0.1,minLH:1,obMax:1.5,pbWin:30,hiWin:36,look:180},o);
  const b=__B4[sym], A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv, F=o.fp; const ph=__PIV(b,P).ph; const pv2=__PIV(b,F); const ph2=pv2.ph, pl2=pv2.pl; const cands=[];
  const contig=(a,z)=>{ for(let q=a+1;q<=z;q++) if(b.T[q]-b.T[q-1]!==H4) return false; return true; };
  for(const Hs of ph){ const L=b.H[Hs]; const c0=Hs+P; if(c0>=N) break;
    let B=-1, bad=false; for(let z=c0+1; z<Math.min(N,Hs+o.maxCons); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(b.C[z]>L+o.brkTol*A[z]){ B=z; break; } if(b.C[z]>L){ bad=true; break; } } if(bad||B<0) continue; if(B-Hs<o.hold) continue; cands.push({Hs,L,B}); }
  cands.sort((x,y)=>x.B-y.B||x.Hs-y.Hs); const out=[]; let lastB=-1;
  for(const c of cands){ if(c.B<=lastB) continue; lastB=c.B; const {Hs,L,B}=c;
    let nLH=0; for(const p of ph2){ if(p<=Hs) continue; if(p>=B) break; if(b.H[p]<L) nLH++; } if(nLH<o.minLH) continue;
    const atr=A[B];
    let L1=-1; for(const p of pl2){ if(p<=B) continue; if(p>B+o.pbWin) break; L1=p; break; } if(L1<0) continue; if(b.L[L1]<L) continue; if(b.L[L1]>L+o.obMax*atr) continue; if(!contig(B,L1+F)) continue;
    let legHi=-Infinity; for(let z=B; z<=L1; z++) if(b.H[z]>legHi) legHi=b.H[z];
    let H1=-1; for(let z=L1+F+1; z<=Math.min(N-1-F,L1+o.hiWin); z++){ if(b.T[z]-b.T[z-1]!==H4) break; if(b.C[z]<L) break; let piv=true; for(let k=1;k<=F;k++){ if(!(b.H[z]>b.H[z-k] && b.H[z]>=b.H[z+k])) piv=false; } if(piv && b.H[z]>legHi){ H1=z; break; } }
    let rhi=-Infinity; for(let z=Math.max(0,B-o.look); z<B; z++) if(b.H[z]>rhi) rhi=b.H[z];
    out.push({sym,Hs,B,L,L1,ob:b.L[L1],legHi,H1,conf:H1>=0?H1+F:-1,recHi:H1>=0?b.H[H1]:NaN,atr,rhi,nLH,confL1:L1+F}); }
  return out; };
window.__MO1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'ob',tgt:'rec',stop:'sr',first:false,win:60},o); const evs=__MOEV(sym,o); const out=[];
  for(const ev of evs){ let lvl,st,tg,cancel,start,tQ; if(!o.first && ev.H1<0) continue;
    if(o.first){ lvl=ev.ob; st=ev.L-0.25*ev.atr; const R1=lvl-st; tg=lvl+2*R1; cancel=ev.legHi; start=ev.confL1+1; tQ=b.T[ev.confL1]; }
    else { lvl=o.ent==='sr'?ev.L:ev.ob; st=o.ent==='sr'?ev.L-ev.atr:(o.stop==='ob'?ev.ob-0.5*ev.atr:ev.L-0.25*ev.atr); const R1=lvl-st; tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='rh'?Math.max(ev.recHi,ev.rhi):ev.recHi; cancel=ev.recHi; start=ev.conf+1; tQ=b.T[ev.conf]; }
    if(!(lvl>st)||!(tg>lvl)) continue; const en=__FILL0(b,h,h4i,start,lvl,cancel,o.win); if(!en) continue;
    out.push({en,st,tg,meta:{tQ,tSw:b.T[ev.B],tB:b.T[ev.B],tHs:b.T[ev.Hs],lvl,L:ev.L,ob:ev.ob,recHi:ev.recHi}}); } return out; };
window.__MOM2 = {
"init": function init(b,o,api){ o=Object.assign({piv:3,fp:2,hold:12,maxCons:120,brkTol:0.1,minLH:1,obMax:1.5,pbWin:30,hiWin:36,look:180,ent:'ob',tgt:'rec',stop:'sr',first:false,win:60},o); return {b,o,A:__ATR4(b,14),ph2:[],hs:[],ev:[],gapAt:0,flag:false,lastB:-1}; },
"reset": function reset(s){ s.ph2.length=0; s.hs.length=0; s.ev.length=0; s.flag=true; },
"preBar": function preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } },
"onBar": function onBar(q,s,api){ const {b,o,A}=s, P=o.piv, F=o.fp; const isPH=(k,n)=>{ if(k<s.gapAt||k<n) return false; for(let z=1;z<=n;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) return false; } return true; }; const isPL=(k,n)=>{ if(k<s.gapAt||k<n) return false; for(let z=1;z<=n;z++){ if(!(b.L[k]<b.L[k-z] && b.L[k]<=b.L[k+z])) return false; } return true; };
    // 2/2 pivot high registry (for lower-high count)
    const k2=q-F; if(k2>=F && isPH(k2,F)) s.ph2.push(k2);
    // swing highs waiting breakout
    const keepHs=[]; const brk=[];
    for(const S of s.hs){ if(q<=S.c0){ keepHs.push(S); continue; } if(q>=S.Hs+o.maxCons) continue; if(b.C[q]>S.L+o.brkTol*A[q]){ brk.push(S); continue; } if(b.C[q]>S.L) continue; keepHs.push(S); }
    s.hs=keepHs;
    const brk2=brk.filter(S=>q-S.Hs>=o.hold); if(brk2.length && q>s.lastB){ brk2.sort((x,y)=>x.Hs-y.Hs); const S=brk2[0]; s.lastB=q; { let nLH=0; for(const p of s.ph2){ if(p<=S.Hs) continue; if(p>=q) break; if(b.H[p]<S.L) nLH++; } if(nLH>=o.minLH){ let rhi=-Infinity; for(let z=Math.max(0,q-o.look); z<q; z++) if(b.H[z]>rhi) rhi=b.H[z]; s.ev.push({Hs:S.Hs,L:S.L,B:q,atr:A[q],rhi,phase:'pb',L1:-1,legHi:-Infinity}); } } }
    const keepEv=[];
    for(const E of s.ev){
      if(E.phase==='pb'){ const k=q-F; if(k<=E.B){ keepEv.push(E); continue; } if(k>E.B+o.pbWin) continue; if(!isPL(k,F)){ keepEv.push(E); continue; }
        if(b.L[k]<E.L || b.L[k]>E.L+o.obMax*E.atr) continue; E.L1=k; E.ob=b.L[k]; E.confL1=q; let lh=-Infinity; for(let z=E.B;z<=k;z++) if(b.H[z]>lh) lh=b.H[z]; E.legHi=lh; E.phase='hi';
        if(o.first){ const lvl=E.ob, st=E.L-0.25*E.atr, R1=lvl-st, tg=lvl+2*R1; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,cancel:E.legHi,from:q+1,until:q+o.win,meta:{tQ:b.T[q],tSw:b.T[E.B],tB:b.T[E.B],tHs:b.T[E.Hs],lvl,L:E.L,ob:E.ob,recHi:NaN}}); continue; }
        keepEv.push(E); continue; }
      if(E.phase==='hi'){ const z=q-F; if(z<E.L1+F+1){ keepEv.push(E); continue; } if(z>E.L1+o.hiWin) continue; if(b.C[z]<E.L) continue; if(!(isPH(z,F) && b.H[z]>E.legHi)){ keepEv.push(E); continue; }
        const recHi=b.H[z]; const lvl=o.ent==='sr'?E.L:E.ob; const st=o.ent==='sr'?E.L-E.atr:(o.stop==='ob'?E.ob-0.5*E.atr:E.L-0.25*E.atr); const R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='rh'?Math.max(recHi,E.rhi):recHi;
        if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,cancel:recHi,from:q+1,until:q+o.win,meta:{tQ:b.T[q],tSw:b.T[E.B],tB:b.T[E.B],tHs:b.T[E.Hs],lvl,L:E.L,ob:E.ob,recHi}}); continue; } }
    s.ev=keepEv;
    const k=q-P; if(k>=P && isPH(k,P)) s.hs.push({Hs:k,L:b.H[k],c0:q}); }
};
window.__MOSH = {
"M1": {"ent":"ob","tgt":"rec"},
"M2": {"ent":"ob","tgt":"r2"},
"M3": {"ent":"sr","tgt":"rec"},
"M4": {"ent":"ob","tgt":"rec","stop":"ob"},
"M5": {"ent":"ob","tgt":"rh"},
"M6": {"first":true},
"M7": {"ent":"ob","tgt":"rec","minLH":2}
};
window.__OBZ = function(sym,o){ o=Object.assign({impD:1.0,body:false},o); const b=__B4[sym]; const D=__DAILY(sym); if(!D||!b) return []; const AD=__ATR4(D,14); const DAY=(window.__DAYMS||86400000), N=b.T.length; const out=[];
  const first4=t=>{ let lo=0,hi=N-1,r=-1; while(lo<=hi){ const m=(lo+hi)>>1; if(b.T[m]>=t){ r=m; hi=m-1; } else lo=m+1; } return r; };
  for(let k=15;k<D.T.length-4;k++){ if(!(D.C[k]<D.C[k-1])) continue; const zTop=o.body?Math.max(D.C[k-1],D.C[k]):D.H[k], zBot=o.body?Math.min(D.C[k-1],D.C[k]):D.L[k]; if(!(zTop>zBot)) continue; const ad=AD[k];
    let mx=-Infinity; for(let j=k+1;j<=k+3;j++) mx=Math.max(mx,D.H[j]); if(mx<D.H[k]+o.impD*ad) continue;
    const t0=D.T[k+3]+DAY; const q0=first4(t0); if(q0<0) continue; out.push({k,tOB:D.T[k],zTop,zBot,ad,impHi:mx,t0,q0}); }
  return out; };
window.__OBEV = function(sym,o){ o=Object.assign({impD:1.0,farD:1.5,minAge:2,maxAge:90,fp:2,bWin:30,bMin:0.25,body:false,win:60,gapM:30},o);
  const b=__B4[sym]; if(!b) return []; const A4=__ATR4(b,14); const DAY=(window.__DAYMS||86400000), H4=(window.__BARMS||14400000), N=b.T.length, F=o.fp; const out=[];
  const isPH=(k,n)=>{ if(k<n||k+n>=N) return false; for(let z=1;z<=n;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) return false; } return true; };
  const cands=[];
  for(const Z of __OBZ(sym,o)){ const {k,tOB,zTop,zBot,ad,q0}=Z;
    let M=-1, far=false; for(let q=q0;q<N;q++){ if(q>q0 && b.T[q]-b.T[q-1]!==H4){ break; } const ageD=(b.T[q]-tOB)/DAY; if(ageD>o.maxAge) break; if(b.H[q]>=zTop+o.farD*ad) far=true; if(b.L[q]<=zTop){ if(ageD>=o.minAge && far){ M=q; } break; } }
    if(M<0) continue; cands.push({k,tOB,zTop,zBot,ad,M}); }
  cands.sort((x,y)=>x.M-y.M||x.k-y.k); let lastM=-Infinity;
  for(const c of cands){ if(c.M-lastM<o.gapM) continue; const {k,tOB,zTop,zBot,ad,M}=c; lastM=M;
    let PH=-1, bad=false, lo=Infinity, ilo=-1; for(let z=M; z<=Math.min(N-1-F,M+o.bWin); z++){ if(z>M && b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(b.L[z]<lo){ lo=b.L[z]; ilo=z; } if(lo<zBot){ bad=true; break; } if(z>M && isPH(z,F) && b.H[z]>=zTop+o.bMin*A4[z]){ PH=z; break; } } if(bad||PH<0) continue;
    const conf=PH+F; for(let z=PH+1;z<=conf;z++){ if(b.L[z]<lo){ lo=b.L[z]; ilo=z; } } if(lo<zBot) continue;
    if(!(lo<=zTop-0.25*A4[conf])) continue; const obTop=Math.max(b.O[ilo],b.C[ilo]), ltfTop=Math.min(obTop,zTop), ltfBot=b.L[ilo], inside=obTop<=zTop;
    let bsl=-Infinity; for(let z=M;z<=conf;z++) bsl=Math.max(bsl,b.H[z]);
    const pls=[]; for(let z=M+F; z<=conf-F; z++){ let p=true; for(let j=1;j<=F;j++){ if(!(b.L[z]<b.L[z-j] && b.L[z]<=b.L[z+j])) p=false; } if(p) pls.push(z); }
    let eq=false; for(let i=0;i<pls.length;i++) for(let j=i+1;j<pls.length;j++){ if(Math.abs(b.L[pls[i]]-b.L[pls[j]])<=0.3*A4[conf]) eq=true; }
    out.push({sym,k,tOB,zTop,zBot,ad,M,PH,conf,ilo,obTop,ltfTop,ltfBot,inside,bsl,atr:A4[conf],eq,nPL:pls.length}); }
  return out; };
window.__OB1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'top',tgt:'bsl',eq:false,inside:false,htf:false,win:60,maxAge:90},o); const out=[];
  if(o.htf){ const A=__ATR4(b,14); const W=o.maxAge*6; for(const z of __OBZ(sym,o)){ const lvl=z.zTop, st=z.zBot-0.25*A[z.q0], tg=z.impHi; if(!(lvl>st)||!(tg>lvl)) continue; const en=__FILL0(b,h,h4i,z.q0,lvl,Infinity,W); if(!en) continue;
      out.push({en,st,tg,ord:z.k,meta:{tQ:b.T[z.q0],tB:z.tOB,tOB:z.tOB,lvl,zTop:z.zTop,zBot:z.zBot,k:z.k}}); } return out; }
  for(const ev of __OBEV(sym,o)){ if(o.inside && !ev.inside) continue; if(o.eq && !ev.eq) continue;
    const lvl=o.ent==='bot'?ev.ltfBot:o.ent==='min'?ev.ltfTop:ev.obTop; const st=ev.zBot-0.25*ev.atr; const R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='r3'?lvl+3*R1:ev.bsl;
    if(!(lvl>st)||!(tg>lvl)) continue; const en=__FILL0(b,h,h4i,ev.conf+1,lvl,tg,o.win); if(!en) continue;
    out.push({en,st,tg,ord:ev.conf,meta:{tQ:b.T[ev.conf],tB:b.T[ev.M],tOB:ev.tOB,lvl,zTop:ev.zTop,zBot:ev.zBot,obTop:ev.obTop,ltfBot:ev.ltfBot,bsl:ev.bsl,eq:ev.eq,inside:ev.inside}}); }
  return out; };
window.__OBM2 = {
"init": function init(b,o,api){ o=Object.assign({impD:1.0,farD:1.5,minAge:2,maxAge:90,fp:2,bWin:30,bMin:0.25,body:false,win:60,gapM:30,ent:'top',tgt:'bsl',eq:false,inside:false,htf:false},o);
    const sym=Object.keys(__B4).find(k=>__B4[k]===b); return {b,o,sym,A:__ATR4(b,14),Z:__OBZ(sym,o),zi:0,pend:[],ev:[],lastM:-Infinity,gapAt:0,flag:false}; },
"reset": function reset(s){ s.pend.length=0; s.ev.length=0; s.flag=true; },
"preBar": function preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } const {b,o}=s;
    while(s.zi<s.Z.length && s.Z[s.zi].t0<=b.T[q]){ const z=s.Z[s.zi++];
      if(o.htf){ const lvl=z.zTop, st=z.zBot-0.25*s.A[q], tg=z.impHi; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,cancel:Infinity,from:q,until:q+o.maxAge*6-1,meta:{tQ:b.T[q],tB:z.tOB,tOB:z.tOB,lvl,zTop:z.zTop,zBot:z.zBot,k:z.k}}); }
      else s.pend.push({k:z.k,tOB:z.tOB,zTop:z.zTop,zBot:z.zBot,ad:z.ad,far:false}); } },
"onBar": function onBar(q,s,api){ const {b,o,A}=s, F=o.fp, DAY=(window.__DAYMS||86400000); if(o.htf) return;
    const isPH=(k,n)=>{ if(k<s.gapAt||k<n) return false; for(let z=1;z<=n;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) return false; } return true; };
    const keep=[], mit=[];
    for(const z of s.pend){ const ageD=(b.T[q]-z.tOB)/DAY; if(ageD>o.maxAge) continue; if(b.H[q]>=z.zTop+o.farD*z.ad) z.far=true; if(b.L[q]<=z.zTop){ if(ageD>=o.minAge && z.far) mit.push(z); continue; } keep.push(z); }
    s.pend=keep;
    if(mit.length && q-s.lastM>=o.gapM){ mit.sort((x,y)=>x.k-y.k); const z=mit[0]; s.lastM=q; s.ev.push({k:z.k,tOB:z.tOB,zTop:z.zTop,zBot:z.zBot,ad:z.ad,M:q,lo:Infinity,ilo:-1}); }
    const keepEv=[];
    for(const E of s.ev){ if(b.L[q]<E.lo){ E.lo=b.L[q]; E.ilo=q; } if(E.lo<E.zBot) continue;
      const z=q-F; if(z<=E.M){ keepEv.push(E); continue; } if(z>E.M+o.bWin) continue;
      if(!(isPH(z,F) && b.H[z]>=E.zTop+o.bMin*A[z])){ keepEv.push(E); continue; }
      const conf=q; if(!(E.lo<=E.zTop-0.25*A[conf])) continue; const obTop=Math.max(b.O[E.ilo],b.C[E.ilo]), ltfTop=Math.min(obTop,E.zTop), ltfBot=b.L[E.ilo], inside=obTop<=E.zTop;
      let bsl=-Infinity; for(let j=E.M;j<=conf;j++) bsl=Math.max(bsl,b.H[j]);
      const pls=[]; for(let j=E.M+F; j<=conf-F; j++){ let p=true; for(let i=1;i<=F;i++){ if(!(b.L[j]<b.L[j-i] && b.L[j]<=b.L[j+i])) p=false; } if(p) pls.push(j); }
      let eq=false; for(let i=0;i<pls.length;i++) for(let j=i+1;j<pls.length;j++){ if(Math.abs(b.L[pls[i]]-b.L[pls[j]])<=0.3*A[conf]) eq=true; }
      if(o.inside && !inside) continue; if(o.eq && !eq) continue;
      const lvl=o.ent==='bot'?ltfBot:o.ent==='min'?ltfTop:obTop; const st=E.zBot-0.25*A[conf]; const R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:o.tgt==='r3'?lvl+3*R1:bsl;
      if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.win,meta:{tQ:b.T[conf],tB:b.T[E.M],tOB:E.tOB,lvl,zTop:E.zTop,zBot:E.zBot,obTop,ltfBot,bsl,eq,inside}}); }
    s.ev=keepEv; }
};
window.__OBSH = {
"O1": {"inside":true,"ent":"top","tgt":"bsl"},
"O2": {"inside":true,"ent":"top","tgt":"r2"},
"O3": {"inside":true,"ent":"top","tgt":"r3"},
"O4": {"htf":true},
"O5": {"ent":"min","tgt":"bsl"},
"O6": {"ent":"min","tgt":"bsl","eq":true},
"O7": {"ent":"bot","tgt":"bsl"}
};
window.__AMEV = function(sym,o){ o=Object.assign({look:180,accN:12,accW:2.0,accQ:0.25,accWin:18,minH:4,maxDepth:3,rWin:12,acc:true},o);
  const b=__B4[sym]; if(!b) return []; const A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000); const out=[];
  const accQ=new Uint8Array(N), accLo=new Float64Array(N); let gapAt=0;
  for(let q=0;q<N;q++){ if(q>0 && b.T[q]-b.T[q-1]!==H4) gapAt=q; if(q-o.accN+1<gapAt||q<o.accN-1) continue; let hi=-Infinity,lo=Infinity; for(let z=q-o.accN+1;z<=q;z++){ hi=Math.max(hi,b.H[z]); lo=Math.min(lo,b.L[z]); } if(hi-lo<=o.accW*A[q]){ accQ[q]=1; accLo[q]=lo; } }
  gapAt=0; let E=null;
  for(let q=0;q<N;q++){ if(q>0 && b.T[q]-b.T[q-1]!==H4){ gapAt=q; E=null; }
    if(E){ if(b.L[q]<E.mLow) E.mLow=b.L[q]; if(E.mLow<E.RL-o.maxDepth*E.atr){ E=null; } else if(b.C[q]>E.RL){ E.C=q; out.push(E); E=null; } else if(q>=E.S+o.rWin){ E=null; } continue; }
    if(q-o.look<gapAt) continue; let RL=Infinity,RH=-Infinity; for(let z=q-o.look;z<q;z++){ if(b.L[z]<RL) RL=b.L[z]; if(b.H[z]>RH) RH=b.H[z]; }
    if(!(b.L[q]<RL)) continue; if(RH-RL<o.minH*A[q]) continue;
    let a1=-1; if(o.acc){ for(let z=q-1;z>=q-o.accWin;z--){ if(accQ[z] && accLo[z]<=RL+o.accQ*(RH-RL)){ a1=z; break; } } if(a1<0) continue; }
    E={sym,S:q,C:-1,a1,RL,RH,mLow:b.L[q],atr:A[q]}; if(b.C[q]>E.RL){ E.C=q; out.push(E); E=null; } }
  return out; };
window.__AM1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'mkt',tgt:'rh',win:30,fp:2,pbWin:18,lazyD:1.0,lazyS:2.5,look:180,accN:12,accW:2.0,accQ:0.25,accWin:18,minH:4},o); const out=[]; const H4=(window.__BARMS||14400000), N=b.T.length, F=o.fp;
  if(o.ent==='lazy'){ const A=__ATR4(b,14); let gapAt=0, lastOrd=-Infinity;
    for(let q=0;q<N;q++){ if(q>0 && b.T[q]-b.T[q-1]!==H4) gapAt=q; if(q-o.look<gapAt||q-o.accN+1<gapAt) continue; if(q<lastOrd+o.accWin) continue;
      let hi=-Infinity,lo=Infinity; for(let z=q-o.accN+1;z<=q;z++){ hi=Math.max(hi,b.H[z]); lo=Math.min(lo,b.L[z]); } if(hi-lo>o.accW*A[q]) continue;
      let RL=Infinity,RH=-Infinity; for(let z=q-o.look;z<q;z++){ if(b.L[z]<RL) RL=b.L[z]; if(b.H[z]>RH) RH=b.H[z]; } if(RH-RL<o.minH*A[q]) continue; if(!(lo<=RL+o.accQ*(RH-RL))) continue;
      lastOrd=q; const lvl=RL-o.lazyD*A[q], st=RL-o.lazyS*A[q], tg=RH; if(!(lvl>st)||!(tg>lvl)) continue; const en=__FILL0(b,h,h4i,q+1,lvl,tg,o.accWin); if(!en) continue;
      out.push({en,st,tg,ord:q,meta:{tQ:b.T[q],tB:b.T[q],tS:b.T[q],lvl,RL,RH}}); }
    return out; }
  for(const ev of __AMEV(sym,o)){ const st=ev.mLow-0.25*ev.atr; let en=null, lvl=NaN, tg=NaN, tQ=b.T[ev.C];
    if(o.ent==='mkt'){ const e=b.C[ev.C]; if(!(e>st)) continue; en={mode:'C',e,fq:ev.C,fi:-1,tEo:b.T[ev.C]}; tg=o.tgt==='r2'?e+2*(e-st):ev.RH; }
    else if(o.ent==='rl'){ lvl=ev.RL; tg=o.tgt==='r2'?lvl+2*(lvl-st):ev.RH; if(!(lvl>st)||!(tg>lvl)) continue; en=__FILL0(b,h,h4i,ev.C+1,lvl,tg,o.win); if(!en) continue; }
    else if(o.ent==='pb'){ let p=-1, bad=false; for(let z=ev.C+1; z<=Math.min(N-1-F,ev.C+o.pbWin); z++){ for(let k=ev.C+1;k<=z+F;k++){ if(b.T[k]-b.T[k-1]!==H4){ bad=true; break; } } if(bad) break; let ok=true; for(let k=1;k<=F;k++){ if(!(b.L[z]<b.L[z-k] && b.L[z]<=b.L[z+k])) ok=false; } if(ok){ p=z; break; } }
      if(bad||p<0) continue; if(!(b.L[p]>ev.mLow)) continue; const c2=p+F; const e=b.C[c2]; if(!(e>st)) continue; en={mode:'C',e,fq:c2,fi:-1,tEo:b.T[c2]}; tQ=b.T[c2]; tg=o.tgt==='r2'?e+2*(e-st):ev.RH; }
    if(!(tg>en.e)) continue;
    out.push({en,st,tg,ord:ev.C,meta:{tQ,tB:b.T[ev.C],tS:b.T[ev.S],tA:b.T[ev.a1>=0?ev.a1:ev.S],lvl:isNaN(lvl)?en.e:lvl,RL:ev.RL,RH:ev.RH,mLow:ev.mLow,depth:+((ev.RL-ev.mLow)/ev.atr).toFixed(2),below:ev.C-ev.S}}); }
  return out; };
window.__AMM2 = {
"init": function init(b,o,api){ o=Object.assign({look:180,accN:12,accW:2.0,accQ:0.25,accWin:18,minH:4,maxDepth:3,rWin:12,acc:true,ent:'mkt',tgt:'rh',win:30,fp:2,pbWin:18,lazyD:1.0,lazyS:2.5},o);
    return {b,o,A:__ATR4(b,14),gapAt:0,flag:false,accEnd:[],E:null,pb:[],lastOrd:-Infinity}; },
"reset": function reset(s){ s.flag=true; s.accEnd.length=0; s.E=null; s.pb.length=0; },
"preBar": function preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } },
"onBar": function onBar(q,s,api){ const {b,o,A}=s, H4=(window.__BARMS||14400000), F=o.fp;
    // accumulation window ending at q
    let accLo=NaN; if(q-o.accN+1>=s.gapAt && q>=o.accN-1){ let hi=-Infinity,lo=Infinity; for(let z=q-o.accN+1;z<=q;z++){ hi=Math.max(hi,b.H[z]); lo=Math.min(lo,b.L[z]); } if(hi-lo<=o.accW*A[q]) accLo=lo; }
    s.accEnd.push([q,accLo]); if(s.accEnd.length>o.accWin+1) s.accEnd.shift();
    const rng=()=>{ let RL=Infinity,RH=-Infinity; for(let z=q-o.look;z<q;z++){ if(b.L[z]<RL) RL=b.L[z]; if(b.H[z]>RH) RH=b.H[z]; } return [RL,RH]; };
    if(o.ent==='lazy'){ if(q-o.look<s.gapAt||isNaN(accLo)||q<s.lastOrd+o.accWin) return; const [RL,RH]=rng(); if(RH-RL<o.minH*A[q]) return; if(!(accLo<=RL+o.accQ*(RH-RL))) return; s.lastOrd=q;
      const lvl=RL-o.lazyD*A[q], st=RL-o.lazyS*A[q], tg=RH; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.accWin,meta:{tQ:b.T[q],tB:b.T[q],tS:b.T[q],lvl,RL,RH}}); return; }
    // pending pivot-low entries (ent 'pb')
    const keepPb=[]; for(const P of s.pb){ const z=q-F; if(z<=P.C){ keepPb.push(P); continue; } if(z>P.C+o.pbWin) continue; let ok=z-F>=s.gapAt; for(let k=1;k<=F&&ok;k++){ if(!(b.L[z]<b.L[z-k] && b.L[z]<=b.L[z+k])) ok=false; } if(!ok){ keepPb.push(P); continue; }
      if(!(b.L[z]>P.mLow)) continue; const st=P.mLow-0.25*P.atr, e=b.C[q]; if(!(e>st)) continue; const R1=e-st; const tg=o.tgt==='r2'?e+2*R1:P.RH; if(tg>e) api.enter(e,st,tg,{tQ:b.T[q],tB:b.T[P.C],tS:b.T[P.S],tA:b.T[P.a1>=0?P.a1:P.S],lvl:e,RL:P.RL,RH:P.RH,mLow:P.mLow,depth:+((P.RL-P.mLow)/P.atr).toFixed(2),below:P.C-P.S},q); }
    s.pb=keepPb;
    const fire=(E)=>{ const st=E.mLow-0.25*E.atr; const meta=(tQ,lvl)=>({tQ,tB:b.T[E.C],tS:b.T[E.S],tA:b.T[E.a1>=0?E.a1:E.S],lvl,RL:E.RL,RH:E.RH,mLow:E.mLow,depth:+((E.RL-E.mLow)/E.atr).toFixed(2),below:E.C-E.S});
      if(o.ent==='mkt'){ const e=b.C[E.C]; if(!(e>st)) return; const R1=e-st; const tg=o.tgt==='r2'?e+2*R1:E.RH; if(tg>e) api.enter(e,st,tg,meta(b.T[E.C],e),E.C); }
      else if(o.ent==='rl'){ const lvl=E.RL; const R1=lvl-st; const tg=o.tgt==='r2'?lvl+2*R1:E.RH; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.win,meta:meta(b.T[E.C],lvl)}); }
      else if(o.ent==='pb'){ s.pb.push(E); } };
    if(s.E){ const E=s.E; if(b.L[q]<E.mLow) E.mLow=b.L[q]; if(E.mLow<E.RL-o.maxDepth*E.atr){ s.E=null; } else if(b.C[q]>E.RL){ E.C=q; s.E=null; fire(E); } else if(q>=E.S+o.rWin){ s.E=null; } return; }
    if(q-o.look<s.gapAt) return; const [RL,RH]=rng(); if(!(b.L[q]<RL)) return; if(RH-RL<o.minH*A[q]) return;
    let a1=-1; if(o.acc){ for(let i=s.accEnd.length-2;i>=0;i--){ const [z,lo]=s.accEnd[i]; if(z<q-o.accWin) break; if(!isNaN(lo) && lo<=RL+o.accQ*(RH-RL)){ a1=z; break; } } if(a1<0) return; }
    const E={S:q,C:-1,a1,RL,RH,mLow:b.L[q],atr:A[q]}; if(b.C[q]>RL){ E.C=q; fire(E); } else s.E=E; }
};
window.__AMSH = {
"A1": {"ent":"rl"},
"A2": {"ent":"mkt"},
"A3": {"ent":"lazy"},
"A4": {"ent":"mkt","tgt":"r2"},
"A5": {"ent":"pb"},
"A6": {"ent":"mkt","acc":false},
"A7": {"ent":"mkt","maxDepth":1,"rWin":6}
};
window.__SFEV = function(sym,o){ o=Object.assign({piv:3,dropMin:1.5,brkWin:120,rtWin:60,upMin:1.0,htf:false,look:180},o);
  const b=__B4[sym]; if(!b) return []; const A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const ph=__PIV(b,P).ph; const cands=[];
  for(const Hs of ph){ const zTop=b.H[Hs], zBot=Math.min(Math.max(b.O[Hs],b.C[Hs]),zTop-0.25*A[Hs]); if(!(zTop>zBot)) continue;
    if(o.htf){ if(Hs-o.look<0) continue; let mx=-Infinity; for(let z=Hs-o.look;z<Hs;z++) mx=Math.max(mx,b.H[z]); if(zTop<mx) continue; }
    let minLow=Infinity, B=-1, bad=false; for(let z=Hs+1; z<Math.min(N,Hs+o.brkWin); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(z>=Hs+P+1 && b.C[z]>zTop){ B=z; break; } minLow=Math.min(minLow,b.L[z]); }
    if(bad||B<0) continue; if(!(minLow<=zBot-o.dropMin*A[Hs])) continue; cands.push({Hs,zTop,zBot,B}); }
  cands.sort((x,y)=>x.B-y.B||y.zTop-x.zTop); const out=[]; let lastB=-1;
  for(const c of cands){ if(c.B===lastB) continue; lastB=c.B; const {Hs,zTop,zBot,B}=c; const atr=A[B];
    let recHi=b.H[B], R=-1, bad=false; for(let z=B+1; z<Math.min(N,B+o.rtWin+1); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(b.L[z]<=zTop){ R=z; break; } recHi=Math.max(recHi,b.H[z]); }
    if(bad||R<0) continue; if(!(recHi>=zTop+o.upMin*atr)) continue; if(!(b.C[R]>=zBot)) continue;
    out.push({sym,Hs,zTop,zBot,B,R,recHi,atr}); }
  return out; };
window.__SFEVB = function(sym,o){ o=Object.assign({piv:3,dropMin:1.5,brkWin:120,htf:false,look:180},o);
  const b=__B4[sym]; if(!b) return []; const A=__ATR4(b,14), N=b.T.length, H4=(window.__BARMS||14400000), P=o.piv; const ph=__PIV(b,P).ph; const cands=[];
  for(const Hs of ph){ const zTop=b.H[Hs], zBot=Math.min(Math.max(b.O[Hs],b.C[Hs]),zTop-0.25*A[Hs]); if(!(zTop>zBot)) continue;
    if(o.htf){ if(Hs-o.look<0) continue; let mx=-Infinity; for(let z=Hs-o.look;z<Hs;z++) mx=Math.max(mx,b.H[z]); if(zTop<mx) continue; }
    let minLow=Infinity, B=-1, bad=false; for(let z=Hs+1; z<Math.min(N,Hs+o.brkWin); z++){ if(b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(z>=Hs+P+1 && b.C[z]>zTop){ B=z; break; } minLow=Math.min(minLow,b.L[z]); }
    if(bad||B<0) continue; if(!(minLow<=zBot-o.dropMin*A[Hs])) continue; cands.push({sym,Hs,zTop,zBot,B}); }
  cands.sort((x,y)=>x.B-y.B||y.zTop-x.zTop); const out=[]; let lastB=-1; for(const c of cands){ if(c.B===lastB) continue; lastB=c.B; out.push(c); } return out; };
window.__SF1 = function(sym,o,b,h,h4i){ o=Object.assign({ent:'mkt',stop:'rt',tgt:'rec',rule:false,inZone:false,htf:false,win:60,rtWin:60,upMin:1.0},o); const out=[]; const H4=(window.__BARMS||14400000), N=b.T.length;
  if(o.ent==='lim'){ const A=__ATR4(b,14); const evs=__SFEVB(sym,o); // pramušimai be retesto sąlygos
    for(const ev of evs){ const {zTop,zBot,B}=ev; const atr=A[B]; let U=-1, bad=false, recHi=-Infinity; for(let z=B; z<Math.min(N,B+o.rtWin+1); z++){ if(z>B && b.T[z]-b.T[z-1]!==H4){ bad=true; break; } if(z>B && b.L[z]<=zTop){ bad=true; break; } recHi=Math.max(recHi,b.H[z]); if(b.H[z]>=zTop+o.upMin*atr){ U=z; break; } }
      if(bad||U<0) continue; const lvl=zTop, st=zBot-0.5*atr, tg=recHi; if(!(lvl>st)||!(tg>lvl)) continue; const en=__FILL0(b,h,h4i,U+1,lvl,tg,o.win); if(!en) continue;
      out.push({en,st,tg,ord:-lvl,meta:{tQ:b.T[U],tB:b.T[B],tHs:b.T[ev.Hs],lvl,zTop,zBot,recHi,rule:false}}); } // ord: aukštesnis limit užsipildo pirmas
    return out; }
  for(const ev of __SFEV(sym,o)){ if(o.inZone && !(b.L[ev.R]>=ev.zBot)) continue; const e=b.C[ev.R]; const st1=o.stop==='zone'?ev.zBot-0.25*ev.atr:b.L[ev.R]-0.25*ev.atr; if(!(e>st1)) continue; const R1=e-st1; const tg=o.tgt==='r2'?e+2*R1:ev.recHi; if(!(tg>e)) continue;
    const st=o.rule?e-1.5*R1:st1; const en={mode:'C',e,fq:ev.R,fi:-1,tEo:b.T[ev.R]}; const fq=ev.R; const exitFn=o.rule?(q=>(q>=fq+1 && b.C[q]<st1)?b.C[q]:null):null;
    out.push({en,st,tg,exitFn,ord:ev.R,meta:{tQ:b.T[ev.R],tB:b.T[ev.B],tHs:b.T[ev.Hs],tR:b.T[ev.R],lvl:e,zTop:ev.zTop,zBot:ev.zBot,recHi:ev.recHi,st1,rule:o.rule}}); }
  return out; };
window.__SFM2 = {
"init": function init(b,o,api){ o=Object.assign({piv:3,dropMin:1.5,brkWin:120,rtWin:60,upMin:1.0,htf:false,look:180,ent:'mkt',stop:'rt',tgt:'rec',rule:false,inZone:false,win:60},o); return {b,o,A:__ATR4(b,14),sup:[],ev:[],gapAt:0,flag:false}; },
"reset": function reset(s){ s.sup.length=0; s.ev.length=0; s.flag=true; },
"preBar": function preBar(q,s,api){ if(s.flag){ s.gapAt=q; s.flag=false; } api.armed.sort((x,y)=>y.lvl-x.lvl); },
"exit": function exit(pos,q,s){ if(!pos.rule) return null; const b=s.b; return (q>=pos.fq+1 && b.C[q]<pos.st1)?b.C[q]:null; },
"onBar": function onBar(q,s,api){ const {b,o,A}=s, P=o.piv; const isPH=(k,n)=>{ if(k<s.gapAt||k<n) return false; for(let z=1;z<=n;z++){ if(!(b.H[k]>b.H[k-z] && b.H[k]>=b.H[k+z])) return false; } return true; };
    // 1) pending supplies: breakout check (bars q >= Hs+P+1), then minLow update
    const brk=[]; const keepS=[];
    for(const S of s.sup){ if(q>=S.Hs+o.brkWin) continue; if(q>=S.Hs+P+1 && b.C[q]>S.zTop){ if(S.minLow<=S.zBot-o.dropMin*A[S.Hs]) brk.push(S); continue; } S.minLow=Math.min(S.minLow,b.L[q]); keepS.push(S); }
    s.sup=keepS;
    if(brk.length){ brk.sort((x,y)=>y.zTop-x.zTop); const S=brk[0]; const E={Hs:S.Hs,zTop:S.zTop,zBot:S.zBot,B:q,atr:A[q],recHi:b.H[q]};
      if(o.ent==='lim'){ if(b.H[q]>=E.zTop+o.upMin*E.atr){ const lvl=E.zTop, st=E.zBot-0.5*E.atr, tg=E.recHi; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.win,meta:{tQ:b.T[q],tB:b.T[q],tHs:b.T[E.Hs],lvl,zTop:E.zTop,zBot:E.zBot,recHi:tg,rule:false}}); } else s.ev.push(E); }
      else s.ev.push(E); }
    // 2) active events (bars q > B)
    const keepE=[];
    for(const E of s.ev){ if(E.B===q){ keepE.push(E); continue; } if(q>E.B+o.rtWin) continue;
      if(o.ent==='lim'){ if(b.L[q]<=E.zTop) continue; E.recHi=Math.max(E.recHi,b.H[q]); if(b.H[q]>=E.zTop+o.upMin*E.atr){ const lvl=E.zTop, st=E.zBot-0.5*E.atr, tg=E.recHi; if(lvl>st && tg>lvl) api.armed.push({lvl,st,tg,from:q+1,until:q+o.win,meta:{tQ:b.T[q],tB:b.T[E.B],tHs:b.T[E.Hs],lvl,zTop:E.zTop,zBot:E.zBot,recHi:tg,rule:false}}); continue; } keepE.push(E); continue; }
      if(b.L[q]<=E.zTop){ if(!(E.recHi>=E.zTop+o.upMin*E.atr)) continue; if(!(b.C[q]>=E.zBot)) continue; if(o.inZone && !(b.L[q]>=E.zBot)) continue;
        const e=b.C[q]; const st1=o.stop==='zone'?E.zBot-0.25*E.atr:b.L[q]-0.25*E.atr; if(!(e>st1)) continue; const R1=e-st1; const tg=o.tgt==='r2'?e+2*R1:E.recHi; if(!(tg>e)) continue; const st=o.rule?e-1.5*R1:st1;
        api.enter(e,st,tg,{tQ:b.T[q],tB:b.T[E.B],tHs:b.T[E.Hs],tR:b.T[q],lvl:e,zTop:E.zTop,zBot:E.zBot,recHi:E.recHi,st1,rule:o.rule},q); continue; }
      E.recHi=Math.max(E.recHi,b.H[q]); keepE.push(E); }
    s.ev=keepE;
    // 3) register pivot high confirmed at q (Hs = q-P)
    const k=q-P; if(k>=P && isPH(k,P)){ const zTop=b.H[k], zBot=Math.min(Math.max(b.O[k],b.C[k]),zTop-0.25*A[k]); if(zTop>zBot){ let ok=true; if(o.htf){ if(k-o.look<0) ok=false; else { let mx=-Infinity; for(let z=k-o.look;z<k;z++) mx=Math.max(mx,b.H[z]); if(zTop<mx) ok=false; } }
      if(ok){ let minLow=Infinity; for(let z=k+1;z<=q;z++) minLow=Math.min(minLow,b.L[z]); s.sup.push({Hs:k,zTop,zBot,minLow}); } } } }
};
window.__SFPOST = function(tr){ for(const t of tr){ if(t.rule) t.R=(t.x-t.e)/(t.e-t.st1); } return tr; };
window.__SFSH = {
"S1": {"ent":"mkt"},
"S2": {"ent":"lim"},
"S3": {"ent":"mkt","tgt":"r2"},
"S4": {"ent":"mkt","rule":true},
"S5": {"ent":"mkt","stop":"zone"},
"S6": {"ent":"mkt","inZone":true},
"S7": {"ent":"mkt","htf":true}
};
window.__M13 = window.__M13 || {};
window.__M13.fvgLeg = function(b,iB,iEnd){ if(!(iB>=0) || !(iEnd>=iB)) return null; let rh=-Infinity, iRH=-1; for(let i=iB;i<=iEnd;i++){ if(b.H[i]>rh){ rh=b.H[i]; iRH=i; } }
  for(let i=Math.max(iB,1); i<=iRH-1; i++){ if(b.L[i+1]>b.H[i-1]) return 1; } return 0; };
