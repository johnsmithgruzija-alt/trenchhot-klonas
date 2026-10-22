#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
signalai.py — Swing T20 lentelė Apkasų svetainei.

Logika 1:1 iš /Users/jeff/Desktop/claude playground/scalp-lab/swing_t20_signalai.pine
(v3.4, funkcija f() ir lentelės kodas). Taisyklių čia NEKEIČIAM ir „negerinam" —
jos keičiamos tik scalp-lab projekte, po testo.

  python3 signalai.py [isvestis] [--iki YYYY-MM-DD]

  isvestis   aplankas, i kuri rasomi signalai.json, signalai.md (numatyta: isvestis)
  --iki      busena tos UZDARYTOS dienos (patikrai; be jo - paskutine uzdaryta diena)

Tik standartine biblioteka, jokiu raktu: Binance viesi dienos duomenys.
"""
import json, os, sys, time
import urllib.request, urllib.error
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://data-api.binance.vision/api/v3/klines"
PRADZIA = 1500000000000          # 2017-07, anksciau Binance nera
DAYMS = 86400000
UA = {"User-Agent": "Mozilla/5.0 apkasai-t20/1.0"}

# --- T20 v2 parametrai (Pine: sys == "T20 v2") ------------------------------
NE = 20          # ieiti: uzdarymas virs N d. uzdarymu maksimumo
NX = 10          # iseiti: uzdarymas zemiau N d. uzdarymu minimumo
ATR_M = 2.0      # pradinis stopas: ATR(20) kartai
ATR_N = 20
USE_CS = False   # T20 v2: stipraus uzdarymo salygos NERA
USE_BTC = True   # ieiti tik kai BTC > SMA
BTC_LEN = 50
USE_F1 = True    # BTC < SMA -> parduoti visas (patvirtinta 2026-10-21)
SISTEMA = "T20 v2 + F1"

zurnalas = []


def sakyk(*a):
    t = " ".join(str(x) for x in a)
    print(t, flush=True)
    zurnalas.append(t)


# ---------------------------------------------------------------------------
# Binance
# ---------------------------------------------------------------------------
def gauk(url, bandymai=4):
    for b in range(bandymai):
        try:
            r = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(r, timeout=30) as f:
                return json.loads(f.read().decode())
        except Exception as e:
            if b == bandymai - 1:
                raise
            time.sleep(1.5 * (b + 1))
    return None


def dienos(simbolis, iki_ms):
    """Visos dienos zvakes nuo listingo. Grazina tik UZDARYTAS (closeTime <= iki_ms)."""
    out = []
    nuo = PRADZIA
    while True:
        d = gauk("%s?symbol=%s&interval=1d&startTime=%d&limit=1000" % (API, simbolis, nuo))
        if not d:
            break
        out.extend(d)
        if len(d) < 1000:
            break
        nuo = d[-1][0] + DAYMS
        if nuo > iki_ms:
            break
        time.sleep(0.12)
    # tik uzdarytos dienos; closeTime yra [6]
    out = [k for k in out if k[6] <= iki_ms]
    # Binance kartais grazina dublikatus per puslapiu sandura
    matyti, svarus = set(), []
    for k in out:
        if k[0] in matyti:
            continue
        matyti.add(k[0])
        svarus.append(k)
    svarus.sort(key=lambda k: k[0])
    return svarus


# ---------------------------------------------------------------------------
# Indikatoriai (Pine atitikmenys)
# ---------------------------------------------------------------------------
def atr_wilder(C, H, L, n=ATR_N):
    """Pine ta.atr(n): Wilder RMA is True Range. Etalonas - scalp-lab eng2.py."""
    N = len(C)
    out = [None] * N
    c = 0
    v = 0.0
    for t in range(N):
        if t > 0:
            tr = max(H[t], C[t - 1]) - min(L[t], C[t - 1])
        else:
            tr = H[t] - L[t]
        c += 1
        if c <= n:
            v += tr
            if c == n:
                v = v / n
                out[t] = v
        else:
            v = v + (tr - v) / n
            out[t] = v
    return out


def sma(vals, n):
    out = [None] * len(vals)
    s = 0.0
    for i, v in enumerate(vals):
        s += v
        if i >= n:
            s -= vals[i - n]
        if i >= n - 1:
            out[i] = s / n
    return out


# ---------------------------------------------------------------------------
# Vienos monetos busenos masina (Pine f())
# ---------------------------------------------------------------------------
def busena(K, btc_pagal_laika):
    """K - dienos zvakes. Grazina paskutines UZDARYTOS dienos busena arba None."""
    if len(K) < max(NE, ATR_N) + 2:
        return None
    T = [k[0] for k in K]
    O = [float(k[1]) for k in K]
    H = [float(k[2]) for k in K]
    L = [float(k[3]) for k in K]
    C = [float(k[4]) for k in K]
    A = atr_wilder(C, H, L)

    inPos = False
    ent = stp = entT = None
    pask = None
    for i in range(len(K)):
        bc_bs = btc_pagal_laika.get(T[i])
        if bc_bs is None:
            continue                      # tos dienos BTC nera - diena praleidziam
        bC, bS = bc_bs
        if bS is None:
            continue                      # BTC SMA50 dar nesusiformavo
        bOk = bC > bS
        btcOk = (not USE_BTC) or bOk
        f1 = USE_F1 and USE_BTC and (bC < bS)

        hh1 = max(C[i - NE:i]) if i >= NE else None      # hh[1]: NE ankstesniu uzdarymu
        ll1 = min(C[i - NX:i]) if i >= NX else None      # ll[1]
        a = A[i]

        ex = False
        exF1 = False
        if inPos and (L[i] <= stp or (ll1 is not None and C[i] < ll1)):
            inPos = False
            ex = True
        elif inPos and f1:
            inPos = False
            ex = True
            exF1 = True

        ne = False
        if USE_CS:
            csOk = H[i] > L[i] and (C[i] - L[i]) >= 0.7 * (H[i] - L[i])
        else:
            csOk = True
        brk = (a is not None) and (hh1 is not None) and (C[i] > hh1) and csOk
        blk = (not inPos) and brk and (not btcOk)
        if (not inPos) and brk and btcOk:
            inPos = True
            ent = C[i]
            stp = C[i] - ATR_M * a
            entT = T[i]
            ne = True

        pask = {"t": T[i], "c": C[i], "inPos": inPos, "ne": ne, "ex": ex, "exF1": exF1,
                "ent": ent, "stp": stp, "ll": ll1, "hh": hh1, "blk": blk,
                "btcOk": btcOk, "entT": entT, "bC": bC, "bS": bS}
    return pask


# ---------------------------------------------------------------------------
def main():
    arg = [a for a in sys.argv[1:]]
    iki = None
    if "--iki" in arg:
        i = arg.index("--iki")
        iki = arg[i + 1]
        del arg[i:i + 2]
    isvestis = arg[0] if arg else "isvestis"
    os.makedirs(isvestis, exist_ok=True)

    if iki:
        d0 = datetime.strptime(iki, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        iki_ms = int(d0.timestamp() * 1000) + DAYMS - 1
        sakyk("Busena uzdarytai dienai %s" % iki)
    else:
        iki_ms = int(time.time() * 1000)

    with open(os.path.join(HERE, "monetos.json"), encoding="utf-8") as f:
        monetos = json.load(f)["monetos"]

    sakyk("Imam BTC (filtrui SMA%d)..." % BTC_LEN)
    btcK = dienos("BTCUSDT", iki_ms)
    btcC = [float(k[4]) for k in btcK]
    btcS = sma(btcC, BTC_LEN)
    btc_pagal_laika = {btcK[i][0]: (btcC[i], btcS[i]) for i in range(len(btcK))}
    sakyk("  BTC zvakiu: %d, paskutine %s" %
          (len(btcK), datetime.fromtimestamp(btcK[-1][0] / 1000, timezone.utc).strftime("%Y-%m-%d")))

    eil = []
    pastabos = []
    for nr, sim in enumerate(monetos):
        try:
            K = btcK if sim == "BTCUSDT" else dienos(sim, iki_ms)
        except Exception as e:
            pastabos.append("%s: duomenu gauti nepavyko (%s)" % (sim, str(e)[:60]))
            sakyk("  !! %s - %s" % (sim, str(e)[:60]))
            continue
        b = busena(K, btc_pagal_laika)
        if b is None:
            pastabos.append("%s: per mazai dienu (%d)" % (sim, len(K)))
            sakyk("  !! %s - per mazai dienu (%d)" % (sim, len(K)))
            continue
        # Pine: 0 PIRKTI, 1 LAIKYTI, 2 PARDUOTI, 3 PARDUOTI·BTC, 4 BTC blokuoja, 5 —
        kodas = 0 if b["ne"] else 3 if b["exF1"] else 2 if b["ex"] else 1 if b["inPos"] else 4 if b["blk"] else 5
        rodyti_poz = b["inPos"] or kodas in (2, 3)
        dienu = int(round((b["t"] - b["entT"]) / DAYMS)) if b["entT"] is not None else -1
        c, e_, st = b["c"], b["ent"], b["stp"]
        eil.append({
            "nr": nr + 1,
            "moneta": sim.replace("USDT", ""),
            "simbolis": sim,
            "kodas": kodas,
            "uzdarymas": c,
            "iejimas": e_ if rodyti_poz else None,
            "iejimo_diena": (datetime.fromtimestamp(b["entT"] / 1000, timezone.utc).strftime("%Y-%m-%d")
                             if (rodyti_poz and b["entT"]) else None),
            "stopas": st if rodyti_poz else None,
            "stopas_pct": ((st / c - 1) * 100) if (rodyti_poz and c > 0 and st is not None) else None,
            "iseiti_jei_maziau": b["ll"] if b["inPos"] else None,
            "pirkti_jei_daugiau": None if b["inPos"] else b["hh"],
            "iki_iejimo_pct": ((b["hh"] / c - 1) * 100) if (not b["inPos"] and b["hh"] and c > 0) else None,
            "dienu": dienu if (rodyti_poz and dienu >= 0) else None,
            "r_dabar": ((c - e_) / (e_ - st)) if (rodyti_poz and e_ is not None and st is not None and e_ > st) else None,
        })
        sakyk("  %-5s %s" % (sim.replace("USDT", ""),
                             ["PIRKTI", "LAIKYTI", "PARDUOTI", "PARDUOTI·BTC", "BTC blokuoja", "—"][kodas]))

    # rikiavimas: Pine key = kodas * 100 + eiles nr.
    eil.sort(key=lambda r: r["kodas"] * 100 + (r["nr"] - 1))
    nB = nH = nS = 0
    for r in eil:
        if r["kodas"] == 0:
            nB += 1
            r["signalas"] = "%d. PIRKTI" % nB
        elif r["kodas"] == 1:
            nH += 1
            r["signalas"] = "LAIKYTI"
        elif r["kodas"] == 2:
            nS += 1
            r["signalas"] = "PARDUOTI"
        elif r["kodas"] == 3:
            nS += 1
            r["signalas"] = "PARDUOTI · BTC"
        elif r["kodas"] == 4:
            r["signalas"] = "BTC blokuoja"
        else:
            r["signalas"] = "—"

    bC = btcC[-1]
    bS = btcS[-1]
    diena = datetime.fromtimestamp(btcK[-1][0] / 1000, timezone.utc).strftime("%Y-%m-%d")
    data = {
        "diena": diena,
        "sugeneruota": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sistema": SISTEMA,
        "btc": {"uzdarymas": bC, "sma50": bS,
                "skirtumas_pct": (bC / bS - 1) * 100 if bS else None,
                "virs_sma": bool(bS and bC > bS),
                "f1": bool(USE_F1 and USE_BTC and bS and bC < bS)},
        "monetos": eil,
        "suvestine": {"pirkti": nB, "laikyti": nH, "parduoti": nS},
        "pastabos": pastabos,
    }
    with open(os.path.join(isvestis, "signalai.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    with open(os.path.join(isvestis, "signalai.md"), "w", encoding="utf-8") as f:
        f.write("# Swing T20 · uždaryta diena %s\n\n" % diena)
        f.write("%s · BTC %.1f %s SMA50 %.1f (%+.1f %%) · PIRKTI %d · LAIKYTI %d · PARDUOTI %d\n\n"
                % (SISTEMA, bC, ">" if bC > bS else "<", bS, (bC / bS - 1) * 100, nB, nH, nS))
        if data["btc"]["f1"]:
            f.write("**BTC < SMA50 → PARDUOTI VISAS POZICIJAS · naujų įėjimų nėra**\n\n")
        f.write("| Moneta | Signalas | Uždarymas | Įėjimas | Stopas | Išeiti jei < | Pirkti jei > | Iki įėjimo | Dienų | R dabar |\n")
        f.write("|---|---|---|---|---|---|---|---|---|---|\n")
        for r in eil:
            g = lambda v, z="%.8g": "—" if v is None else z % v
            f.write("| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |\n" % (
                r["moneta"], r["signalas"], g(r["uzdarymas"]), g(r["iejimas"]), g(r["stopas"]),
                g(r["iseiti_jei_maziau"]), g(r["pirkti_jei_daugiau"]),
                "—" if r["iki_iejimo_pct"] is None else "%.1f %%" % r["iki_iejimo_pct"],
                "—" if r["dienu"] is None else str(r["dienu"]),
                "—" if r["r_dabar"] is None else "%+.2fR" % r["r_dabar"]))
        f.write("\nTai ne finansinė rekomendacija.\n")

    sakyk("PIRKTI %d · LAIKYTI %d · PARDUOTI %d · diena %s" % (nB, nH, nS, diena))
    with open(os.path.join(isvestis, "zurnalas.txt"), "a", encoding="utf-8") as f:
        f.write("\n".join(zurnalas) + "\n")


if __name__ == "__main__":
    main()
