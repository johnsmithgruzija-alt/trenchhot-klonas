// scalp-lab · Modelių skeneris (Node / GitHub Actions) · BTC, ETH, SOL · 4H / 1D / 1W · 2026-10-22
// Tas pats skeneris, kaip modeliu_skeneris_2026-10-22.js TradingView puslapyje, tik be naršyklės:
// modelių varikliai — varikliai.js (ištrauka iš code_boot) atskirame vm kontekste; duomenys — Binance 1H (data-api.binance.vision).
// Naudojimas:  node skenuoti.js <išvesties.json>                 — parsisiunčia duomenis ir skenuoja
//              node skenuoti.js <išvesties.json> --1h <aplankas> --iki <ms>   — patikrai: 1H iš failų <aplankas>/<PORA>.json, tik žvakės ≤ <ms>
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const VER = 'modeliu_skeneris_2026-10-22';
const API = 'https://data-api.binance.vision/api/v3/';
const COINS = ['BTC', 'ETH', 'SOL'];
const H1 = 3600000, DAY = 86400000;
const TFS = { '4H': { bar: 4 * H1, sub: H1, htf: DAY, shift: 0 }, '1D': { bar: DAY, sub: 6 * H1, htf: 6 * DAY, shift: 0 }, '1W': { bar: 7 * DAY, sub: 42 * H1, htf: 42 * DAY, shift: -4 * DAY } };
const MODELS = [
  { id: '01', tpl: 'tp1', kind: 'ssl', o: { tgt: 'tp1' } },
  { id: '02', tpl: 'V1', kind: 'eql', o: { ent: 'A', tgt: 'rh' } },
  { id: '03', tpl: 'B1', kind: 'bos', o: { ent: 'Lr', tgt: 'rh' } },
  { id: '04', tpl: 'R1', kind: 'gen', sh: '__RLSSH', fn: '__RLS1', m2: '__RLSM2', key: 'tSw' },
  { id: '05', tpl: 'F2', kind: 'gen', sh: '__RHFSH', fn: '__RHF1', m2: '__RHFM2', key: 'tB', post: '__RHFPOST' },
  { id: '08', tpl: 'F7', kind: 'gen', sh: '__RHFSH', fn: '__RHF1', m2: '__RHFM2', key: 'tB', post: '__RHFPOST' },
  { id: '06', tpl: 'G2', kind: 'gen', sh: '__GPSH', fn: '__GP1', m2: '__GPM2', key: 'tH0' },
  { id: '07', tpl: 'P1', kind: 'gen', sh: '__FLSH', fn: '__FL1', m2: '__FLM2', key: 'tB' },
  { id: '09', tpl: 'M1', kind: 'gen', sh: '__MOSH', fn: '__MO1', m2: '__MOM2', key: 'tB' },
  { id: '10', tpl: 'O1', kind: 'gen', sh: '__OBSH', fn: '__OB1', m2: '__OBM2', key: 'tB' },
  { id: '11', tpl: 'A2', kind: 'gen', sh: '__AMSH', fn: '__AM1', m2: '__AMM2', key: 'tB' },
  { id: '12', tpl: 'S1', kind: 'gen', sh: '__SFSH', fn: '__SF1', m2: '__SFM2', key: 'tB', post: '__SFPOST' },
  { id: '13A', tpl: 'F5', kind: 'gen', sh: '__RHFSH', fn: '__RHF1', m2: '__RHFM2', key: 'tB', post: '__RHFPOST' },
  { id: '13B', tpl: 'S7', kind: 'gen', sh: '__SFSH', fn: '__SF1', m2: '__SFM2', key: 'tB', post: '__SFPOST' } ];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(p) { for (let a = 0; a < 6; a++) { try { const c = new AbortController(); const to = setTimeout(() => c.abort(), 20000); const r = await fetch(API + p, { signal: c.signal }); clearTimeout(to);
      if (r.status === 429 || r.status === 418) { await sleep(5000 * (a + 1)); continue; } if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p + ' ' + (await r.text()).slice(0, 200)); return await r.json(); }
    catch (e) { if (a === 5) throw e; await sleep(1500 * (a + 1)); } } }
async function load1h(coin, now) { const sym = coin + 'USDT'; const c = { T: [], O: [], H: [], L: [], C: [], V: [] }; let start = 0, req = 0;
  for (let it = 0; it < 200; it++) { const a = await get('klines?symbol=' + sym + '&interval=1h&limit=1000&startTime=' + start); req++; if (!a.length) break;
    for (const r of a) { if (r[6] >= now) continue; if (c.T.length && r[0] <= c.T[c.T.length - 1]) continue; c.T.push(r[0]); c.O.push(+r[1]); c.H.push(+r[2]); c.L.push(+r[3]); c.C.push(+r[4]); c.V.push(+r[7]); }
    if (a.length < 1000) break; start = a[a.length - 1][0] + H1; }
  return { c, req }; }
function fill1h(c) { const T = [], O = [], H = [], L = [], C = [], V = []; let filled = 0; for (let i = 0; i < c.T.length; i++) { if (i > 0) { let t = c.T[i - 1] + H1; while (t < c.T[i]) { const p = C[C.length - 1]; T.push(t); O.push(p); H.push(p); L.push(p); C.push(p); V.push(0); filled++; t += H1; } }
    T.push(c.T[i]); O.push(c.O[i]); H.push(c.H[i]); L.push(c.L[i]); C.push(c.C[i]); V.push(c.V[i]); } return { T, O, H, L, C, V, filled }; }
function agg(h, start, n, shift) { const o = { T: [], O: [], H: [], L: [], C: [], V: [] }; let i = 0; const N = h.T.length;
  while (i < N) { const s = start(h.T[i]); if (h.T[i] !== s) { i++; continue; } if (i + n > N) break; if (h.T[i + n - 1] !== s + (n - 1) * H1) { i++; continue; }
    let hi = -Infinity, lo = Infinity, v = 0; for (let k = i; k < i + n; k++) { if (h.H[k] > hi) hi = h.H[k]; if (h.L[k] < lo) lo = h.L[k]; v += h.V[k]; }
    o.T.push(s + shift); o.O.push(h.O[i]); o.H.push(hi); o.L.push(lo); o.C.push(h.C[i + n - 1]); o.V.push(v); i += n; }
  return o; }
const wkStart = (t) => { const d = Math.floor(t / DAY); const dow = (new Date(d * DAY).getUTCDay() + 6) % 7; return (d - dow) * DAY; };
function build(h, tf) { const F = TFS[tf];
  if (tf === '4H') { const b = agg(h, (t) => Math.floor(t / (4 * H1)) * 4 * H1, 4, 0); const x = { T: h.T, O: h.O, H: h.H, L: h.L, C: h.C, V: h.V }; const d = agg(h, (t) => Math.floor(t / DAY) * DAY, 24, 0); return { b, x, d }; }
  if (tf === '1D') { const b = agg(h, (t) => Math.floor(t / DAY) * DAY, 24, 0); const x = agg(h, (t) => Math.floor(t / (6 * H1)) * 6 * H1, 6, 0); const d = agg(h, (t) => Math.floor(t / (6 * DAY)) * 6 * DAY, 144, 0); return { b, x, d }; }
  const b = agg(h, wkStart, 168, F.shift); const x = agg(h, (t) => { const w = wkStart(t); return w + Math.floor((t - w) / (42 * H1)) * 42 * H1; }, 42, F.shift);
  const d = { T: [], O: [], H: [], L: [], C: [], V: [] }; for (let i = 0; i + 5 < b.T.length; i++) { if (b.T[i] % (42 * DAY) !== 0) continue; if (b.T[i + 5] !== b.T[i] + 35 * DAY) continue; let hi = -Infinity, lo = Infinity, v = 0; for (let k = i; k < i + 6; k++) { hi = Math.max(hi, b.H[k]); lo = Math.min(lo, b.L[k]); v += b.V[k]; }
    d.T.push(b.T[i]); d.O.push(b.O[i]); d.H.push(hi); d.L.push(lo); d.C.push(b.C[i + 5]); d.V.push(v); }
  return { b, x, d }; }

// ---------- varikliai atskirame kontekste + užpildymo apvalkalai (laukiantys orderiai) ----------
const W = { console }; W.window = W; vm.createContext(W);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'varikliai.js'), 'utf8'), W, { filename: 'varikliai.js' });
const ST = { pendOn: false, pendLog: [] };
{ const F0 = W.__FILL0, EF = W.__EQLFILL1, BF = W.__BOSFILL1;
  const alive = (b, from, to, tg) => { const BAR = W.__BARMS; for (let z = from; z <= to; z++) { if (z > from && b.T[z] - b.T[z - 1] !== BAR) return false; if (tg != null && b.H[z] >= tg) return false; } return true; };
  const pend = (b, lvl, info) => { const N = b.T.length, BAR = W.__BARMS; ST.pendLog.push(Object.assign({ lvl }, info)); return { mode: 'P', e: lvl, fq: N - 1, fi: -1, tEo: b.T[N - 1] + BAR }; };
  W.__FILL0 = function (b, h, h4i, q0, lvl, tg, win) { const r = F0(b, h, h4i, q0, lvl, tg, win); if (r || !ST.pendOn) return r; const N = b.T.length; if (q0 + win <= N) return null; if (!alive(b, q0, N - 1, tg)) return null; return pend(b, lvl, { tg, from: q0, last: q0 + win - 1 }); };
  W.__EQLFILL1 = function (b, h, h4i, ev) { const r = EF(b, h, h4i, ev); if (r || !ST.pendOn) return r; const N = b.T.length; if (ev.sw + 6 <= N) return null; if (!alive(b, ev.sw, N - 1, null)) return null; return pend(b, ev.top, { tg: null, from: ev.sw, last: ev.sw + 5 }); };
  W.__BOSFILL1 = function (b, h, h4i, q, lvl, tg, retWin) { const r = BF(b, h, h4i, q, lvl, tg, retWin); if (r || !ST.pendOn) return r; const N = b.T.length; if (q + 1 + retWin <= N) return null; if (q + 1 <= N - 1 && !alive(b, q + 1, N - 1, tg)) return null; return pend(b, lvl, { tg, from: q + 1, last: q + retWin }); }; }
function env(coin, tf, S) { const F = TFS[tf]; W.__BARMS = F.bar; W.__SUBMS = F.sub; W.__DAYMS = F.htf; W.__D19 = 1;
  W.__B4 = { [coin]: S.b }; W.__B1 = { [coin]: S.x }; W.__DD = { [coin]: S.d }; W.__DDA = {}; W.__B4S = {}; W.__B1S = {}; W.__B4ORIG = W.__B4; W.__B1ORIG = W.__B1;
  const t0 = Math.floor(S.b.T[0] / F.htf) * F.htf - 2 * F.htf; W.__M = { T: [t0] }; const n = Math.ceil((S.b.T[S.b.T.length - 1] - t0) / F.htf) + 10; const set = new Set([coin]); const U = []; for (let i = 0; i < n; i++) U.push(set); return U; }
const exp = (t, shift) => { const o = {}; for (const [k, v] of Object.entries(t)) { if (typeof v === 'function' || (typeof v === 'object' && v !== null)) continue; o[k] = (typeof v === 'number' && k[0] === 't' && v > 1e11) ? v - shift : v; } return o; };
function capture(m2) { const cap = {}; const wrap = { init: (b, o, api) => { const s = m2.init.call(m2, b, o, api); cap.api = api; cap.s = s; return s; }, onBar: (q, s, api) => m2.onBar.call(m2, q, s, api) };
  if (m2.reset) wrap.reset = (s) => m2.reset.call(m2, s); if (m2.preBar) wrap.preBar = (q, s, api) => m2.preBar.call(m2, q, s, api); if (m2.exit) wrap.exit = (p, q, s) => m2.exit.call(m2, p, q, s); return { wrap, cap }; }
function runSet(coin, tf, S) { const w = W, F = TFS[tf], U = env(coin, tf, S), b = S.b, N = b.T.length, A = w.__ATR4(b, 14), sh = F.shift; const res = {};
  const toReal = (t) => t - sh; const iOf = (t) => Math.round((t - b.T[0]) / F.bar);
  for (const M of MODELS) { const r = { tpl: M.tpl }; try {
      ST.pendLog = []; ST.pendOn = true; let a, b2, cmp, cap = null;
      if (M.kind === 'ssl') { a = w.__SSLRUN(U, M.o); ST.pendOn = false; b2 = w.__SSLRUN2(U, M.o); }
      else if (M.kind === 'eql') { a = w.__EQLRUN1(U, M.o); ST.pendOn = false; b2 = w.__EQLRUN2(U, M.o); }
      else if (M.kind === 'bos') { a = w.__BOSRUN1(U, M.o); ST.pendOn = false; b2 = w.__BOSRUN2(U, M.o); }
      else { const o = Object.assign({}, w[M.sh][M.tpl]); a = w.__RUN1(U, o, w[M.fn]); ST.pendOn = false; const c = capture(w[M.m2]); b2 = w.__SX(coin, U, Object.assign({}, o), c.wrap); cap = c.cap; if (M.post) { a = w[M.post](a); b2 = w[M.post](b2); } }
      ST.pendOn = false; const lastT = b.T[N - 1]; const isP = (t) => t.tEo != null && t.tEo > lastT; const real = a.filter((t) => !isP(t)), pnd = a.filter(isP);
      if (M.kind === 'ssl') cmp = w.__SSLCMP(real, b2); else if (M.kind === 'eql') cmp = w.__EQLCMP(real, b2); else if (M.kind === 'bos') cmp = w.__BOSCMP(real, b2); else cmp = w.__CMP(real, b2, M.key);
      r.cmp = { n1: real.length, n2: b2.length, same: cmp.same, bad: cmp.bad };
      if (M.id === '13B') { for (const t of real.concat(pnd)) { const iB = iOf(t.tB), iR = t.tR != null ? iOf(t.tR) : N; t.fvg = w.__M13.fvgLeg(b, iB, Math.min(iR, N) - 1); } }
      r.trades = real.map((t) => exp(t, sh));
      r.pend = pnd.map((t) => { const L = ST.pendLog.find((p) => p.lvl === t.e) || ST.pendLog.find((p) => Math.abs(p.lvl - t.e) < 1e-9 * t.e) || {}; const o = exp(t, sh); o.lvl = t.e;
        o.validFrom = L.from != null ? toReal(b.T[Math.min(L.from, N - 1)] + (L.from > N - 1 ? (L.from - (N - 1)) * F.bar : 0)) : null; o.validTo = L.last != null ? toReal(b.T[N - 1] + (L.last - (N - 1)) * F.bar + F.bar) : null;
        delete o.x; delete o.why; delete o.R; delete o.tX; delete o.tE; delete o.tEo; return o; });
      if (cap) { const api = cap.api, s = cap.s; const arm = (api.armed || []).filter((x) => x.until > N - 1 && !(x.actFn && !x.act)); r.armed = arm.map((x) => ({ lvl: x.lvl, st: x.st, tg: x.tg, validTo: toReal(b.T[N - 1] + (x.until - (N - 1)) * F.bar) }));
        const sleepA = (api.armed || []).filter((x) => x.actFn && !x.act); const Wt = [];
        if (M.id === '04') for (const x of sleepA) Wt.push({ type: 'laukia_nusl', RL: x.lvlRL, zoneBot: x.zoneBot, tap: x.tapLvl, st: x.st, RH: x.RH, tP1: toReal(b.T[x.P1]), tP2: toReal(b.T[x.P2]), validTo: toReal(b.T[x.P2] + 120 * F.bar) });
        if (M.id === '05' || M.id === '13A') for (const x of (s.sets || [])) Wt.push({ type: x.phase === 1 ? 'laukia_atsitraukimo' : 'laukia_aukstumos', RH: x.RH, tB: toReal(b.T[x.B]), atr: x.atr, L1: x.L1 != null && x.L1 >= 0 ? b.L[x.L1] : null, legHi: x.legHi != null ? x.legHi : null });
        if (M.id === '09') for (const x of (s.ev || [])) Wt.push({ type: 'laukia_atsitraukimo', L: x.L, tHs: toReal(b.T[x.Hs]), tB: toReal(b.T[x.B]), atr: x.atr });
        if (M.id === '11' && s.E) Wt.push({ type: 'laukia_atgavimo', RL: s.E.RL, RH: s.E.RH, mLow: s.E.mLow, tS: toReal(b.T[s.E.S]), atr: s.E.atr });
        if (M.id === '12' || M.id === '13B') { const up = 1.0, rtWin = 60, dropMin = 1.5, brkWin = 120;
          for (const E of (s.ev || [])) { if (N - 1 >= E.B + rtWin) continue; Wt.push({ type: 'laukia_retesto', zTop: E.zTop, zBot: E.zBot, tHs: toReal(b.T[E.Hs]), tB: toReal(b.T[E.B]), recHi: E.recHi, need: E.zTop + up * E.atr, upOK: E.recHi >= E.zTop + up * E.atr, validTo: toReal(b.T[E.B] + (rtWin + 1) * F.bar), fvg: M.id === '13B' ? w.__M13.fvgLeg(b, E.B, N - 1) : undefined }); }
          const c = b.C[N - 1]; for (const P of (s.sup || [])) { if (N - 1 >= P.Hs + brkWin) continue; const ok = P.minLow <= P.zBot - dropMin * A[P.Hs]; if (!ok) continue; if (P.zTop > c + 3 * A[N - 1]) continue;
            Wt.push({ type: 'laukia_pramusimo', zTop: P.zTop, zBot: P.zBot, tHs: toReal(b.T[P.Hs]), validTo: toReal(b.T[P.Hs] + brkWin * F.bar) }); } }
        r.watch = Wt; }
    } catch (e) { r.err = String(e && e.stack || e).slice(0, 400); } res[M.id] = r; }
  ST.pendOn = false; return res; }

(async () => {
  const outF = process.argv[2]; const ai = process.argv.indexOf('--1h'), ii = process.argv.indexOf('--iki');
  const now = Date.now(); const out = { ver: VER, scanT: now, varikliai: fs.statSync(path.join(__dirname, 'varikliai.js')).size, coins: {} };
  for (const coin of COINS) { let c, req = 0;
    if (ai > 0) { const x = JSON.parse(fs.readFileSync(path.join(process.argv[ai + 1], coin + 'USDT.json'), 'utf8')); const iki = ii > 0 ? +process.argv[ii + 1] : Infinity;
      c = { T: [], O: [], H: [], L: [], C: [], V: [] }; for (let i = 0; i < x.T.length; i++) { if (x.T[i] > iki) break; for (const k of ['T', 'O', 'H', 'L', 'C', 'V']) c[k].push(x[k][i]); } }
    else ({ c, req } = await load1h(coin, now));
    const h = fill1h(c); console.log(coin, '1H', h.T.length, 'užpildyta', h.filled, 'užklausų', req, new Date(h.T[0]).toISOString(), '→', new Date(h.T[h.T.length - 1]).toISOString());
    out.coins[coin] = { first1h: h.T[0], last1h: h.T[h.T.length - 1], n1h: h.T.length, filled: h.filled, added: c.T.length, tf: {} };
    for (const tf of Object.keys(TFS)) { const S = build(h, tf); const F = TFS[tf]; const res = runSet(coin, tf, S);
      const bad = Object.values(res).filter((r) => r.err || r.cmp.bad || r.cmp.n1 !== r.cmp.n2).length;
      console.log(' ', coin, tf, 'žvakių', S.b.T.length, 'modelių su nesutapimu / klaida', bad);
      out.coins[coin].tf[tf] = { bar: F.bar, T0: S.b.T[0] - F.shift, n: S.b.T.length, lastT: S.b.T[S.b.T.length - 1] - F.shift, O: S.b.O, H: S.b.H, L: S.b.L, C: S.b.C, models: res }; } }
  fs.writeFileSync(outF, JSON.stringify(out)); console.log('įrašyta', outF);
})().catch((e) => { console.error('KLAIDA', e && e.stack || e); process.exit(1); });
