#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
patikra.py — privaloma patikra prieš publikavimą (žr. README).

Atsiunčia Binance dienos žvakes VIENĄ kartą, išsaugo jas, ir iš tų pačių duomenų:
  1) suskaičiuoja visus įėjimus / išėjimus mūsų varikliu (be F1 — kad būtų lyginama
     su etalonu, kuris F1 neturi) ir su F1;
  2) įrašo `duomenys.json` Node etalonui `__LPB`
     (scalp-lab/lenteles_patikra_variklis_2026-10-03.js).

  python3 patikra.py [aplankas]     (numatyta /tmp/t20_patikra2)
"""
import json, os, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import signalai as S


def ivykiai(K, btc_map, su_f1):
    """Tas pats kaip signalai.busena, tik grąžina VISUS įvykius (E = įėjimas, X = išėjimas)."""
    T = [k[0] for k in K]
    H = [float(k[2]) for k in K]
    L = [float(k[3]) for k in K]
    C = [float(k[4]) for k in K]
    A = S.atr_wilder(C, H, L)
    ev = []
    inPos = False
    stp = 0.0
    for i in range(len(K)):
        bc = btc_map.get(T[i])
        if bc is None or bc[1] is None:
            continue
        bC, bS = bc
        btcOk = bC > bS
        f1 = su_f1 and (bC < bS)
        hh1 = max(C[i - S.NE:i]) if i >= S.NE else None
        ll1 = min(C[i - S.NX:i]) if i >= S.NX else None
        a = A[i]
        if inPos and (L[i] <= stp or (ll1 is not None and C[i] < ll1)):
            inPos = False
            ev.append({"d": T[i] // 86400000, "k": "X"})
        elif inPos and f1:
            inPos = False
            ev.append({"d": T[i] // 86400000, "k": "XF1"})
        if (not inPos) and (a is not None) and (hh1 is not None) and C[i] > hh1 and btcOk:
            inPos = True
            stp = C[i] - S.ATR_M * a
            ev.append({"d": T[i] // 86400000, "k": "E", "st": stp, "e": C[i]})
    return ev


def main():
    isv = sys.argv[1] if len(sys.argv) > 1 else "/tmp/t20_patikra2"
    os.makedirs(isv, exist_ok=True)
    import time
    iki_ms = int(time.time() * 1000)
    with open(os.path.join(HERE, "monetos.json"), encoding="utf-8") as f:
        monetos = json.load(f)["monetos"]

    kesas = os.path.join(isv, "zvakes.json")
    if os.path.exists(kesas):
        print("naudojam issaugotas zvakes:", kesas)
        with open(kesas, encoding="utf-8") as f:
            visos = json.load(f)
    else:
        visos = {}
        for sim in ["BTCUSDT"] + [m for m in monetos if m != "BTCUSDT"]:
            print("  siunciam", sim, flush=True)
            visos[sim] = S.dienos(sim, iki_ms)
        with open(kesas, "w") as f:
            json.dump(visos, f)
        print("issaugota:", kesas)

    btcK = visos["BTCUSDT"]
    btcC = [float(k[4]) for k in btcK]
    btcS = S.sma(btcC, S.BTC_LEN)
    btc_map = {btcK[i][0]: (btcC[i], btcS[i]) for i in range(len(btcK))}

    # Node etalonui: D[sym] = {T,O,H,L,C}; BTC raktas - "BTC"
    D = {}
    for sim, K in visos.items():
        D[sim.replace("USDT", "")] = {
            "T": [k[0] for k in K], "O": [float(k[1]) for k in K],
            "H": [float(k[2]) for k in K], "L": [float(k[3]) for k in K],
            "C": [float(k[4]) for k in K]}
    with open(os.path.join(isv, "duomenys.json"), "w") as f:
        json.dump(D, f)

    mus = {}
    f1kiek = 0
    for sim in monetos:
        K = visos.get(sim) or []
        if not K:
            continue
        m = sim.replace("USDT", "")
        mus[m] = ivykiai(K, btc_map, su_f1=False)
        su = ivykiai(K, btc_map, su_f1=True)
        f1kiek += sum(1 for e in su if e["k"] == "XF1")
    with open(os.path.join(isv, "musu_ivykiai.json"), "w") as f:
        json.dump(mus, f)
    print("musu ivykiu (be F1): %d" % sum(len(v) for v in mus.values()))
    print("F1 iseijimu (su F1): %d" % f1kiek)
    print("irasyta i", isv)


if __name__ == "__main__":
    main()
