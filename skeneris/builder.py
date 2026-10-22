# scalp-lab · Modelių skeneris · svetainės duomenų sudarymas (GitHub Actions) · 2026-10-22
# Naudojimas:  python3 builder.py <eksportas.json> <išvesties aplankas>
# Skaito skenuoti.js eksportą ir ankstesnę būseną (<aplankas>/busena.json), rašo į aplanką
# serijos.json, dabar.json, atvejai.json, modeliai.json, skenavimas.json (LT ir EN tekstai), dabar.md ir busena.json.
# Skaito skenerio eksportą (modeliu_skeneris_2026-10-22.js → __MS.EXPORT()), ankstesnę būseną (busena.json),
# rašo dash/serijos.json, dash/dabar.json, dash/atvejai.json, dash/info.json, dabar.md ir atnaujina busena.json.
# Spausdina santrauką ir NAUJI: … eilutes (kas atsirado nuo ankstesnio skenavimo). „Nauja" puslapyje — per paskutines 24 val.
import json, sys, os, datetime as dt

VER = 'skeneris_builder_2026-10-22'
EXP = sys.argv[1]
BASE = os.path.abspath(sys.argv[2]); os.makedirs(BASE, exist_ok=True)
DASH = BASE
d = json.load(open(EXP))
assert d['ver'] == 'modeliu_skeneris_2026-10-22', d.get('ver')

def iso(t, h=True):
    return dt.datetime.fromtimestamp(t/1000, dt.timezone.utc).strftime('%Y-%m-%d %H:%M' if h else '%Y-%m-%d')
def rp(x):
    if x is None: return None
    if not isinstance(x, (int, float)) or x != x: return None
    a = abs(x)
    return round(x, 2 if a >= 100 else 4 if a >= 1 else 6)

# Modeliai: pavadinimas, ką žiūrėti, 4H testo verdiktas (katalogas-2026-10-16.md, 13-30d-aukstumos-flip/).
MODELS = {
 '01': ('Sell-Side Liquidity', 'Ilga apatinė dagtis (≥ 1 ATR) palieka žemumą; vėliau kaina ją nušlavia ir per 3 žvakes užsidaro virš jos — įėjimas uždarymu, stopas po nušlavimo dugnu, tikslas — artimiausia aukštuma.', 'neveikia (4H: 2019–24 +0,08R, 2025–26 −0,16R)'),
 '02': ('Equal Lows Sweep', 'Du ar daugiau lygių dugnų (EQL), kaina juos nušlavė; limit ties order bloko (paskutinės raudonos žvakės) viršumi, stopas po bloku, tikslas — diapazono viršus.', 'neveikia (4H top-20 −0,05R)'),
 '03': ('Break of Structure', 'Žemesnė aukštuma (weak high) prie diapazono dugno pramušama uždarymu; limit ties dugnu prieš pramušimą (Lr), stopas po deviacija, tikslas — diapazono viršus.', 'neveikia pagal taisyklę (B2 su 2R — kandidatas, lūžta 2025)'),
 '04': ('Range Low Sweep', 'Dvigubas range low su deviacija žemiau; antras nušlavimas → limit deviacijos zonos viršuje (RL − ¼ zonos), stopas po zona, tikslas — paskutinė aukštuma (supply).', 'neveikia, blogiau už atsitiktinį'),
 '05': ('Range High Flip', 'Uždarymas virš 30 d. (180 žv.) aukštumos (RH), atsitraukimas prie RH, nauja aukštuma; limit ties atsitraukimo dugnu, išėjimas po 2 uždarymų žemiau RH.', 'neveikia (F5 limit ties RH — kandidatas = 13A)'),
 '06': ('Golden Pocket + Imbalance', 'Impulsas ≥ 5 ATR su FVG; limit ties 0,618 atsitraukimu, kai golden pocket (0,618–0,706) kertasi su FVG; stopas po 0,79, tikslas 0,382.', 'neveikia top-60 (G1 — kandidatas 61–150)'),
 '07': ('Patternai po S/R flip', 'Pramuštas S/R lygis, po jo „pole" (≥ 2 ATR kilimas); limit ties pramuštu lygiu, stopas 1 ATR žemiau, tikslas — pole viršus.', 'neveikia top-60 (P1 — kandidatas 61–150)'),
 '08': ('Failed Auction (05 filtras)', 'Tas pats 05 setup\'as, bet virš RH per metus yra nepramuštas 1D pivot aukštumas (HTF supply) — trader\'io įspėjimas.', 'filtras nepadeda (+0,12 → +0,07R)'),
 '09': ('Momentum', 'Swing aukštumos lygis pramuštas uždarymu; pirmas 2/2 atsitraukimo dugnas virš lygio = order blokas; limit ties OB, stopas po lygiu, tikslas — nauja aukštuma.', 'neveikia (+ tik iš „tik palietė")'),
 '10': ('OB virš OB', 'HTF (1D) order blokas, kaina į jį grįžta ir atšoka; LTF order blokas HTF bloko viduje — limit ties juo, stopas po HTF bloku, tikslas — likvidumas viršuje.', 'neveikia (top-20 +0,19R, bet per mažai)'),
 '11': ('AMD / PO3', 'Akumuliacija (siauras diapazonas) diapazono apačioje, manipuliacija žemiau 30 d. RL, atgavimas uždarymu virš RL — įėjimas uždarymu, tikslas RH.', 'neveikia, blogiau už atsitiktinį'),
 '12': ('Supply Flip', 'Pivot aukštuma (supply zona), po jos kritimas ≥ 1,5 ATR, pramušimas uždarymu virš zonos, retestas iš viršaus — įėjimas retesto uždarymu, stopas po retesto low, tikslas — aukščiausia kaina po pramušimo.', 'trader\'io taisyklė neveikia (S7 — kandidatas = 13B); savaitiniame BTC dažnas (+1,80R, kontrolė 70)'),
 '13A': ('30 d. aukštumos flip · limit', 'Kaip 05, bet limit ties pačiu RH; išėjimas po 2 uždarymų žemiau RH, kietas stopas 1,5R. Projekto žurnale — vietos 1–60.', 'kandidatas top-60 (+0,61R, 149), lūžta 2025; popierinis žurnalas'),
 '13B': ('30 d. aukštumos flip · retestas', 'Kaip 12, bet supply = 30 d. (180 žv.) aukštuma. Projekto žurnale — vietos 61–150; FVG pramušimo kojoje — šešėlinė žymė.', 'kandidatas 61–150 (+0,20R, 1 434), laikosi 2025–26; popierinis žurnalas'),
}
MODELS_EN = {
 '01': ('Sell-Side Liquidity', 'A long lower wick (≥ 1 ATR) leaves a low; later price sweeps it and closes back above within 3 candles — enter on that close, stop below the sweep low, target the nearest high.', 'does not work (4H: 2019–24 +0.08R, 2025–26 −0.16R)'),
 '02': ('Equal Lows Sweep', 'Two or more equal lows (EQL) get swept; limit at the top of the order block (last red candle), stop below the block, target the range high.', 'does not work (4H top-20 −0.05R)'),
 '03': ('Break of Structure', 'A lower high near the range low is broken by a close; limit at the low before the break (Lr), stop below the deviation, target the range high.', 'does not work as written (B2 with a 2R target — candidate, breaks down in 2025)'),
 '04': ('Range Low Sweep', 'Double range low with a deviation below; the second sweep → limit at the top of the deviation zone (RL − ¼ of the zone), stop below the zone, target the last high (supply).', 'does not work, worse than random'),
 '05': ('Range High Flip', 'Close above the 30-day (180-candle) high (RH), pullback to RH, new high; limit at the pullback low, exit after 2 closes below RH.', 'does not work (F5 limit at RH — candidate = 13A)'),
 '06': ('Golden Pocket + Imbalance', 'Impulse ≥ 5 ATR with an FVG; limit at the 0.618 retracement where the golden pocket (0.618–0.706) overlaps the FVG; stop below 0.79, target 0.382.', 'does not work on top-60 (G1 — candidate for ranks 61–150)'),
 '07': ('Patterns after S/R flip', 'A broken S/R level followed by a pole (≥ 2 ATR rally); limit at the broken level, stop 1 ATR below, target the pole high.', 'does not work on top-60 (P1 — candidate for ranks 61–150)'),
 '08': ('Failed Auction (05 filter)', 'The same 05 setup, but an unbroken 1D pivot high (HTF supply) sits above RH within a year — the trader\'s warning.', 'the filter does not help (+0.12 → +0.07R)'),
 '09': ('Momentum', 'A swing-high level is broken by a close; the first 2/2 pullback low above the level is the order block; limit at the OB, stop below the level, target a new high.', 'does not work (profit only from "just touched" fills)'),
 '10': ('OB on OB', 'HTF (1D) order block; price returns to it and bounces; the LTF order block inside the HTF block — limit there, stop below the HTF block, target the liquidity above.', 'does not work (top-20 +0.19R, but too few trades)'),
 '11': ('AMD / PO3', 'Accumulation (narrow range) near the range low, manipulation below the 30-day RL, reclaim with a close above RL — enter on that close, target RH.', 'does not work, worse than random'),
 '12': ('Supply Flip', 'Pivot high (supply zone), then a drop ≥ 1.5 ATR, a breakout close above the zone, a retest from above — enter on the retest close, stop below the retest low, target the highest price after the breakout.', 'the trader\'s rule does not work (S7 — candidate = 13B); frequent on weekly BTC (+1.80R, control 70)'),
 '13A': ('30-day high flip · limit', 'Like 05, but the limit sits at RH itself; exit after 2 closes below RH, hard stop 1.5R. In the project journal — ranks 1–60.', 'candidate for top-60 (+0.61R, 149), breaks down in 2025; paper journal'),
 '13B': ('30-day high flip · retest', 'Like 12, but the supply is the 30-day (180-candle) high. In the project journal — ranks 61–150; an FVG in the breakout leg is a shadow tag.', 'candidate for ranks 61–150 (+0.20R, 1,434), holds in 2025–26; paper journal'),
}
STATUS_EN = {'atviras':'Open trade', 'laukia_limit':'Limit order waiting', 'laukia_retesto':'Waiting for retest', 'laukia_nusl':'Waiting for sweep',
          'laukia_atsitraukimo':'Waiting for pullback', 'laukia_aukstumos':'Waiting for new high', 'laukia_atgavimo':'Waiting for reclaim', 'laukia_pramusimo':'Waiting for breakout',
          'naujas_iejimas':'New entry', 'naujai_uzbaigtas':'Just closed'}
STATUS = {'atviras':'Atviras sandoris', 'laukia_limit':'Laukia limit užpildymo', 'laukia_retesto':'Laukia retesto', 'laukia_nusl':'Laukia nušlavimo',
          'laukia_atsitraukimo':'Laukia atsitraukimo', 'laukia_aukstumos':'Laukia naujos aukštumos', 'laukia_atgavimo':'Laukia atgavimo', 'laukia_pramusimo':'Laukia pramušimo',
          'naujas_iejimas':'Naujas įėjimas', 'naujai_uzbaigtas':'Naujai užbaigtas'}
PRIO = {'atviras':0, 'naujas_iejimas':1, 'laukia_limit':2, 'laukia_retesto':2, 'laukia_atgavimo':2, 'laukia_nusl':3, 'laukia_atsitraukimo':3, 'laukia_aukstumos':3, 'laukia_pramusimo':3, 'naujai_uzbaigtas':4}
# Lygiai, kuriuos piešti kiekvienam modeliui (iš sandorio meta).
LV = {'02':['lvl'], '03':['lvl'], '04':['RL','lvl'], '05':['RH','ZT'], '08':['RH','ZT'], '06':['lvl'], '07':['L','poleHi'], '09':['L','ob'], '10':['zTop','zBot','obTop'],
      '11':['RL','RH','mLow'], '12':['zTop','zBot'], '13A':['RH'], '13B':['zTop','zBot']}
SETUPT = {'01':'tS','02':'tSw','03':'tQ','04':'tSw','05':'tQ','08':'tQ','06':'tQ','07':'tQ','09':'tQ','10':'tQ','11':'tQ','12':'tR','13A':'tQ','13B':'tR'}
KEYT = {'01':'tS','02':'tSw','03':'tQ','04':'tSw','05':'tB','08':'tB','06':'tH0','07':'tB','09':'tB','10':'tB','11':'tB','12':'tB','13A':'tB','13B':'tB'}

prev = {}
PREVF = os.path.join(BASE, 'busena.json')
if os.path.exists(PREVF):
    try: prev = json.load(open(PREVF))
    except Exception: prev = {}
prevKeys = set(prev.get('dabar_keys', [])); prevTrades = set(prev.get('trade_keys', []))
firstRun = not prev
# „Nauja" — įrašas pirmą kartą pasirodė per paskutines 24 val. ir nuo tada nedingo (skenuojama kas valandą).
T_NOW = d['scanT']; LANGAS = 24 * 3600 * 1000
pirmaPrev = prev.get('pirma', {})        # „Dabar" raktas -> kada pirmą kartą matytas (tik ne senesni nei 24 val.)
uzbPirmaPrev = prev.get('uzb_pirma', {}) # užbaigto sandorio raktas -> kada pirmą kartą matytas užbaigtas
if 'uzb_keys' in prev:
    prevClosed = set(prev['uzb_keys'])
else:  # senas busena.json formatas: trade_keys turėjo ir atvirus sandorius
    _k4 = lambda k: (lambda a: (a[0], a[1], a[2], a[-1]))(k.split('|'))
    _atv = {_k4(k) for k in prevKeys if k.split('|')[3] == 'atviras'}
    prevClosed = {k for k in prevTrades if _k4(k) not in _atv}
uzb_keys = []; uzbPirma = {}

series = {}; cases = []; now = []; stats = {}; cmp = {}; errs = []; trade_keys = []
for coin, C in d['coins'].items():
    series[coin] = {}
    for tf, S in C['tf'].items():
        bar, T0, n = S['bar'], S['T0'], S['n']
        iOf = lambda t, T0=T0, bar=bar: int((t - T0) // bar)
        lastT = S['lastT']; lastC = S['C'][-1]
        series[coin][tf] = {'T0': T0, 'bar': bar, 'n': n, 'O': [rp(x) for x in S['O']], 'H': [rp(x) for x in S['H']], 'L': [rp(x) for x in S['L']], 'C': [rp(x) for x in S['C']]}
        f08 = {t.get('tB') for t in S['models'].get('08', {}).get('trades', [])}
        f08p = {p.get('tB') for p in S['models'].get('08', {}).get('pend', [])}
        for mid, M in S['models'].items():
            if M.get('err'): errs.append(f'{coin} {tf} {mid}: {M["err"][:160]}'); continue
            cmp[f'{coin}|{tf}|{mid}'] = M['cmp']
            if mid == '08':  # 08 — žymė ant 05 setup'ų, atskirai nerodoma
                continue
            st = stats.setdefault(mid, {}).setdefault(f'{coin}|{tf}', {'n': 0, 'win': 0, 'sumR': 0.0})
            for t in M['trades']:
                key = f"{coin}|{tf}|{mid}|{t.get(KEYT[mid], t.get('tE'))}|{t['tE']}"
                trade_keys.append(key)
                open_ = t['why'] == 'eod'
                if not open_: uzb_keys.append(key)
                if not open_:
                    st['n'] += 1; st['win'] += 1 if t['R'] > 0 else 0; st['sumR'] += t['R']
                iE = iOf(t['tE'] - (0 if t.get('tEo') == t['tE'] else bar)) if mid != '01' else iOf(t['tE'] - bar)
                iS = iE if mid == '01' else iOf(t.get(SETUPT[mid], t.get('tE')))
                c = {'id': len(cases), 'coin': coin, 'tf': tf, 'm': mid, 'tpl': M['tpl'],
                     'iS': iS, 'iE': iE,
                     'iX': min(n - 1, iOf(t['tX'] - 1)), 'tE': t['tE'], 'tX': t['tX'],
                     'e': rp(t['e']), 'st': rp(t['st']), 'tg': rp(t['tg']), 'x': rp(t['x']), 'R': round(t['R'], 3), 'why': t['why'],
                     'lv': {k: rp(t[k]) for k in LV.get(mid, []) if t.get(k) is not None}}
                if 'st1' in t and t.get('rule'): c['st1'] = rp(t['st1'])
                if mid == '13B' and 'fvg' in t: c['fvg'] = t['fvg']
                if mid == '05': c['f08'] = 0 if t.get('tB') in f08 else 1
                cases.append(c)
                if open_:
                    cur = (lastC - t['e']) / (t['e'] - (t.get('st1') if t.get('rule') else t['st']))
                    now.append({'status': 'atviras', 'coin': coin, 'tf': tf, 'm': mid, 'case': c['id'], 'e': c['e'], 'st': c['st'], 'tg': c['tg'], 'Rnow': round(cur, 2), 'since': t['tE'], 'lv': c['lv'],
                                'key': f"{coin}|{tf}|{mid}|atviras|{t['tE']}"})
                elif not firstRun and (fs := (T_NOW if key not in prevClosed else uzbPirmaPrev.get(key))) is not None and T_NOW - fs < LANGAS:
                    uzbPirma[key] = fs
                    now.append({'status': 'naujai_uzbaigtas', 'coin': coin, 'tf': tf, 'm': mid, 'case': c['id'], 'e': c['e'], 'st': c['st'], 'tg': c['tg'], 'R': c['R'], 'why': t['why'], 'since': t['tX'], 'lv': c['lv'],
                                'key': f"{coin}|{tf}|{mid}|uzb|{t['tE']}"})
            for p in M.get('pend', []):
                it = {'status': 'laukia_limit', 'coin': coin, 'tf': tf, 'm': mid, 'lvl': rp(p['lvl']), 'st': rp(p['st']), 'tg': rp(p['tg']), 'validTo': p.get('validTo'), 'validFrom': p.get('validFrom'),
                      'iS': iOf(p.get(SETUPT[mid], p.get('tQ', lastT))) if p.get(SETUPT[mid], p.get('tQ')) else n - 1, 'lv': {k: rp(p[k]) for k in LV.get(mid, []) if p.get(k) is not None},
                      'key': f"{coin}|{tf}|{mid}|limit|{rp(p['lvl'])}"}
                if mid == '05': it['f08'] = 0 if p.get('tB') in f08p else 1
                now.append(it)
            for wtch in M.get('watch', []):
                typ = wtch['type']
                it = {'status': typ, 'coin': coin, 'tf': tf, 'm': mid}
                for k, v in wtch.items():
                    if k == 'type': continue
                    it[k] = rp(v) if isinstance(v, float) else v
                lvl = wtch.get('zTop', wtch.get('RL', wtch.get('RH', wtch.get('L'))))
                it['key'] = f"{coin}|{tf}|{mid}|{typ}|{rp(lvl)}"
                now.append(it)

# dublikatai (tas pats orderis iš kelių įvykių) ir 12 / 13B „laukia pramušimo" — tik artimiausia zona
seen = set(); ded = []; near = {}
for it in now:
    if it['key'] in seen: continue
    seen.add(it['key'])
    if it['status'] == 'laukia_pramusimo':
        g = f"{it['coin']}|{it['tf']}|{it['m']}"
        if g in near and near[g]['zTop'] <= it['zTop']: continue
        near[g] = it; continue
    ded.append(it)
now = ded + list(near.values())
pirma = {}
for it in now:
    fs = None if firstRun else (T_NOW if it['key'] not in prevKeys else pirmaPrev.get(it['key']))
    it['new'] = fs is not None and T_NOW - fs < LANGAS   # nauja per 24 val.
    it['ka_tik'] = fs is not None and fs == T_NOW        # atsirado būtent šiame skenavime (NAUJI: eilutės)
    if it['new']:
        pirma[it['key']] = fs
        if it['status'] == 'atviras': it['status'] = 'naujas_iejimas'
    it['name'] = MODELS[it['m']][0]
now.sort(key=lambda x: (PRIO.get(x['status'], 9), ['4H', '1D', '1W'].index(x['tf']), x['coin'], x['m']))

statsOut = {}
for mid, per in stats.items():
    tot = {'n': 0, 'win': 0, 'sumR': 0.0}
    for k, v in per.items():
        for f in tot: tot[f] += v[f]
    statsOut[mid] = {'all': {'n': tot['n'], 'win': tot['win'], 'avgR': round(tot['sumR'] / tot['n'], 3) if tot['n'] else None},
                     'by': {k: {'n': v['n'], 'win': v['win'], 'avgR': round(v['sumR'] / v['n'], 3) if v['n'] else None} for k, v in per.items()}}
bad = {k: v for k, v in cmp.items() if v['bad'] or v['n1'] != v['n2']}
info = {'ver': VER, 'scanT': d['scanT'], 'scan': iso(d['scanT']), 'coins': list(d['coins'].keys()),
        'lastT': {f'{c}|{tf}': S['lastT'] for c, C in d['coins'].items() for tf, S in C['tf'].items()},
        'lastIso': {f'{c}|{tf}': iso(S['lastT'] + S['bar']) for c, C in d['coins'].items() for tf, S in C['tf'].items()},
        'models': {k: {'name': v[0], 'look': v[1], 'verdict': v[2]} for k, v in MODELS.items() if k != '08'}, 'model08': {'name': MODELS['08'][0], 'look': MODELS['08'][1], 'verdict': MODELS['08'][2]},
        'stats': statsOut, 'status': STATUS, 'check': {'sets': len(cmp), 'mismatch': len(bad), 'bad': bad, 'errors': errs}, 'nCases': len(cases), 'nNow': len(now)}

# Puslapio duomenys — eilučių masyvai (Dashboard tipas: JSON = eilučių objektų masyvas; sąrašai — JSON tekstas langelyje).
J = lambda x: json.dumps(x, separators=(',', ':'), ensure_ascii=False)
GRP = {'atviras': 'atviri', 'naujas_iejimas': 'atviri', 'laukia_limit': 'laukia', 'laukia_retesto': 'laukia', 'laukia_atgavimo': 'laukia',
       'laukia_nusl': 'formuojasi', 'laukia_atsitraukimo': 'formuojasi', 'laukia_aukstumos': 'formuojasi', 'laukia_pramusimo': 'formuojasi', 'naujai_uzbaigtas': 'uzbaigti'}
FIELDS = ['lvl', 'e', 'st', 'tg', 'Rnow', 'R', 'why', 'zTop', 'zBot', 'RL', 'RH', 'L', 'tap', 'need', 'recHi', 'upOK', 'legHi', 'mLow', 'zoneBot', 'L1', 'fvg', 'f08',
          'since', 'validTo', 'validFrom', 'tB', 'tHs', 'tP1', 'tP2', 'tS', 'iS', 'case']
rows_now = []
for it in now:
    r = {'id': it['key'], 'grupe': GRP.get(it['status'], 'kita'), 'status': it['status'], 'statusas': STATUS.get(it['status'], it['status']), 'coin': it['coin'], 'tf': it['tf'], 'm': it['m'],
         'modelis': MODELS[it['m']][0], 'modelis_en': MODELS_EN[it['m']][0], 'statusas_en': STATUS_EN.get(it['status'], it['status']), 'nauja': bool(it['new'])}
    for f in FIELDS: r[f] = it.get(f)
    r['lv'] = J(it.get('lv') or {})
    fmt = (lambda t: iso(t, it['tf'] == '4H')) 
    r['nuo'] = fmt(it['since']) if it.get('since') else (fmt(it['tB']) if it.get('tB') else (fmt(it['tP2']) if it.get('tP2') else (fmt(it['tS']) if it.get('tS') else None)))
    r['galioja_iki'] = fmt(it['validTo']) if it.get('validTo') else None
    rows_now.append(r)
rows_ser = [{'id': f'{c}|{tf}', 'coin': c, 'tf': tf, 'T0': S['T0'], 'bar': S['bar'], 'n': S['n'], 'O': J(S['O']), 'H': J(S['H']), 'L': J(S['L']), 'C': J(S['C'])}
            for c, X in series.items() for tf, S in X.items()]
rows_cases = [dict({k: v for k, v in c.items() if k != 'lv'}, lv=J(c['lv']), iejimas=iso(c['tE'], c['tf'] == '4H'), isejimas=iso(c['tX'], c['tf'] == '4H')) for c in cases]
rows_mod = []
for k, v in MODELS.items():
    if k == '08': continue
    st_ = statsOut.get(k, {'all': {'n': 0, 'win': 0, 'avgR': None}, 'by': {}})
    rows_mod.append({'id': k, 'pavadinimas': v[0], 'ka_ziureti': v[1], 'testas': v[2], 'pavadinimas_en': MODELS_EN[k][0], 'ka_ziureti_en': MODELS_EN[k][1], 'testas_en': MODELS_EN[k][2],
                     'n': st_['all']['n'], 'laimeta': st_['all']['win'],
                     'laimeta_proc': round(100 * st_['all']['win'] / st_['all']['n']) if st_['all']['n'] else None, 'vid_R': st_['all']['avgR'], 'pagal': J(st_['by'])})
rows_scan = []
for c, C in d['coins'].items():
    for tf, S in C['tf'].items():
        ks = [f'{c}|{tf}|{m}' for m in S['models']]
        ok = sum(1 for k_ in ks if k_ in cmp and cmp[k_]['bad'] == 0 and cmp[k_]['n1'] == cmp[k_]['n2'])
        rows_scan.append({'id': f'{c}|{tf}', 'coin': c, 'tf': tf, 'skenuota': iso(d['scanT']), 'iki': iso(S['lastT'] + S['bar']), 'zvakiu': S['n'],
                          'varikliai_sutampa': ok, 'rinkiniu': len(ks), 'atveju': sum(1 for x in cases if x['coin'] == c and x['tf'] == tf)})
for name, rows in [('serijos', rows_ser), ('dabar', rows_now), ('atvejai', rows_cases), ('modeliai', rows_mod), ('skenavimas', rows_scan)]:
    json.dump(rows, open(os.path.join(DASH, name + '.json'), 'w'), separators=(',', ':'), ensure_ascii=False)

# dabar.md — žmogui skaityti
L = [f"# Modelių skeneris — {iso(d['scanT'])} UTC", '', f"Duomenys iki: " + ', '.join(f"{k} {v}" for k, v in info['lastIso'].items()), '']
for it in now:
    lv = ', '.join(f"{k} {v}" for k, v in it.items() if k in ('lvl', 'st', 'tg', 'zTop', 'zBot', 'RL', 'RH', 'L', 'tap', 'e', 'need') and v is not None)
    L.append(f"- {'NAUJA · ' if it['new'] else ''}{it['coin']} {it['tf']} · {it['m']} {it['name']} · {STATUS.get(it['status'], it['status'])} · {lv}")
L += ['', f"Varikliai 1:1: {len(cmp) - len(bad)} / {len(cmp)} rinkinių" + (f"; klaidos: {len(errs)}" if errs else ''), '', 'Ne finansinė rekomendacija.']
open(os.path.join(BASE, 'dabar.md'), 'w').write('\n'.join(L) + '\n')

json.dump({'scanT': d['scanT'], 'lastT': info['lastT'], 'dabar_keys': [x['key'] for x in now], 'pirma': pirma, 'uzb_keys': uzb_keys, 'uzb_pirma': uzbPirma}, open(PREVF, 'w'))
print(f"skenavimas {iso(d['scanT'])} · atvejų {len(cases)} · dabar {len(now)} · 1:1 {len(cmp) - len(bad)}/{len(cmp)} · klaidų {len(errs)}")
for it in now:
    if it['ka_tik'] and it['status'] in ('naujas_iejimas', 'laukia_limit', 'laukia_retesto', 'laukia_atgavimo', 'naujai_uzbaigtas'):
        lv = ', '.join(f"{k} {v}" for k, v in it.items() if k in ('lvl', 'st', 'tg', 'zTop', 'zBot', 'RL', 'e', 'R') and v is not None)
        print(f"NAUJI: {it['coin']} {it['tf']} · {it['m']} {it['name']} · {STATUS[it['status']]} · {lv}")
for e in errs: print('KLAIDA:', e)
