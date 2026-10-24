#!/usr/bin/env python3
"""Antra banga: is radaro busenos failo padaro JSON puslapiui.

Taisykles - TAISYKLES-2026-10-23.md. Kodas nuo duomenu saltinio nepriklauso:
jam reikia tik irasu su 'mc', 'pikas', 'liq' (reiksmes gali buti eilutes).

Paleisti:
    python3 ".../antra-banga/builder.py"                      # numatytas m1 radaras
    python3 ".../antra-banga/builder.py" <busena.json> <isvestis.json>

Nieko nekeicia: tik skaito. Radaro failu neliecia.
"""
import json, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # claude playground
BUSENA  = os.path.join(ROOT, "m1-radaras", "sekamos.json")
BAIGTYS = os.path.join(ROOT, "m1-radaras", "baigtys.csv")
ISVESTIS = os.path.join(HERE, "antra_banga.json")

ATH_MIN   = 1_000_000      # pikas turi buti bent toks
SKEMO_RIBA = 100           # pikas > 100x likvidumo = nupiesta kaina
PER_ETAPA = 60             # kiek monetu rodom viename etape
SVIEZI_H  = 168            # "sviezia" = poolas jaunesnis nei tiek valandu (7 paros)
SENA_H    = 24             # matavimas senesnis nei tiek valandu - tai ne "dabar"

# (raktas, LT, EN, apatine kritimo riba %) - nuo virsaus zemyn
ETAPAI = [
    ("pike",   "Pike",         "At peak",   -25.0),
    ("atsi",   "Atsitraukė",   "Pulled back", -70.0),
    ("giliai", "Giliai",       "Deep",        -90.0),
    ("labai",  "Labai giliai", "Very deep",  -1e9),
]


def sk(x):
    """Skaicius is bet ko; None, jei nepavyksta."""
    try:
        v = float(x)
        return v if v == v and abs(v) != float("inf") else None
    except (TypeError, ValueError):
        return None


def etapas(kritimas):
    for raktas, _, _, riba in ETAPAI:
        if kritimas > riba:
            return raktas
    return ETAPAI[-1][0]


# Islikimo daznis, israsytas 2026-10-23 is 87 iki galo sektu monetu
# (viena moneta = vienas matavimas). Actions'uose baigtys.csv nera, todel
# reiksmes israsytos; vietoje, kai failas yra, perskaiciuojamos is naujo.
BAZINE_2026_10_23 = {"n": 87, "atsoko_50": 52, "atsoko_100": 31,
                     "liko_pliuse": 13, "mediana_dabar": -80, "matuota": "2026-10-23"}


def bazine_statistika(kelias):
    """Is baigtys.csv: kiek atsokdavo ir kiek islikdavo. Viena moneta = vienas matavimas."""
    if not kelias or not os.path.exists(kelias):
        return dict(BAZINE_2026_10_23)
    import csv
    vienas = {}
    with open(kelias, newline="", encoding="utf-8") as fh:
        for r in sorted(csv.DictReader(fh), key=lambda r: r.get("signalo_laikas") or ""):
            if sk(r.get("max_pct")) is not None:
                vienas.setdefault(r["simbolis"], r)
    eil = list(vienas.values())
    if not eil:
        return dict(BAZINE_2026_10_23)
    mx = [sk(r["max_pct"]) for r in eil]
    db = [sk(r["dabar_pct"]) for r in eil if sk(r["dabar_pct"]) is not None]
    db.sort()
    return {
        "n": len(eil),
        "atsoko_50": round(sum(1 for x in mx if x >= 50) / len(mx) * 100),
        "atsoko_100": round(sum(1 for x in mx if x >= 100) / len(mx) * 100),
        "liko_pliuse": round(sum(1 for x in db if x > 0) / len(db) * 100) if db else None,
        "mediana_dabar": round(db[len(db) // 2]) if db else None,
        "matuota": time.strftime("%Y-%m-%d"),
    }


def surink(busena_kelias, baigtys_kelias=BAIGTYS):
    with open(busena_kelias, encoding="utf-8") as fh:
        d = json.load(fh)

    viso = len(d)
    be_skaiciu = nupiesti = seni = 0
    monetos = []
    dabar = time.time()

    for mint, e in d.items():
        if not isinstance(e, dict):
            be_skaiciu += 1
            continue
        P, M, L = sk(e.get("pikas")), sk(e.get("mc")), sk(e.get("liq"))
        if P is None or M is None or P <= 0:
            be_skaiciu += 1
            continue
        if P < ATH_MIN:
            continue
        if not L or L <= 0 or P / L > SKEMO_RIBA:
            nupiesti += 1
            continue
        # "dabar" turi reiksti dabar: jei DexScreener monetos negrazino jau para,
        # jos mc ir likvidumas yra senas irasas, ne dabartine busena.
        mates = sk(e.get("mates"))
        amzius_h = (dabar - mates) / 3600.0 if mates and mates > 1e9 else None
        if amzius_h is not None and amzius_h > SENA_H:
            seni += 1
            continue
        kritimas = min(0.0, (M / P - 1) * 100)
        # tikras amzius is DexScreener pairCreatedAt (ms); "pirma" yra tik "kada MES pamatem"
        pool_ts = sk(e.get("pool_ts"))
        amz_h = round((dabar - pool_ts / 1000.0) / 3600.0, 1) if pool_ts and pool_ts > 1e11 else None
        ath_ts = sk(e.get("ath_ts"))
        pikas_pries_h = round((dabar - ath_ts / 1000.0) / 3600.0, 1) if ath_ts and ath_ts > 1e11 else None
        monetos.append({
            "mint": mint,
            "s": e.get("symbol") or "?",
            "p": e.get("name") or "",
            "mc": round(M),
            "ath": round(P),
            "likv": round(L),
            "kr": round(kritimas, 1),
            "x": round(P / L, 1),
            "sen": round(amzius_h, 1) if amzius_h is not None else None,
            "is": e.get("pikas_is") or "?",
            "amz": amz_h,                      # monetos amzius valandomis
            "pikas_h": pikas_pries_h,          # pries kiek valandu buvo pikas
            "xd": sk(e.get("x_dug")),          # X nuo 24 h dugno
            "xmax": sk(e.get("x_max")),        # didziausias X, koki buvo pasieke
            "xmax_h": (round((dabar - sk(e.get("x_max_ts"))) / 3600.0, 1)
                       if sk(e.get("x_max_ts")) else None),
            "dug_h": sk(e.get("dug_h")),       # kiek valandu nuo dugno
            "v24": sk(e.get("v24")),           # vieta 24 h diapazone, 0-100
            "sviezia": 1 if (amz_h is not None and amz_h <= SVIEZI_H) else 0,
            "e": etapas(kritimas),
        })

    monetos.sort(key=lambda c: -c["mc"])
    sk_etapu = {r: 0 for r, _, _, _ in ETAPAI}
    for c in monetos:
        sk_etapu[c["e"]] += 1

    # Sviezios monetos i sarasa patenka VISADA, net jei ju etapas jau pilnas:
    # butent ju vartotojas ieskojo, o etapo riba (PER_ETAPA) nukirsdavo jauniausias,
    # nes rikiuojama pagal kapitalizacija. Be sito kortele rode 63, o sarasas 45.
    rodom, kiek = [], {r: 0 for r in sk_etapu}
    for c in monetos:
        if c["sviezia"] or kiek[c["e"]] < PER_ETAPA:
            kiek[c["e"]] += 1
            rodom.append(c)

    return {
        "atnaujinta": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "saltinio_laikas": time.strftime("%Y-%m-%dT%H:%M:%SZ",
                                         time.gmtime(os.path.getmtime(busena_kelias))),
        "taisykles": {"ath_min": ATH_MIN, "skemo_riba": SKEMO_RIBA, "sviezi_h": SVIEZI_H,
                      "ribos": [[r, riba] for r, _, _, riba in ETAPAI if riba > -1e8]},
        "etapai": [{"r": r, "lt": lt, "en": en, "n": sk_etapu[r]} for r, lt, en, _ in ETAPAI],
        "suvestine": {"viso_sekama": viso, "be_skaiciu": be_skaiciu,
                      "nupiesti": nupiesti, "seni": seni, "tikri": len(monetos),
                      "sviezios": sum(1 for c in monetos if c["sviezia"]),
                      "su_x": sum(1 for c in monetos if c["xd"]),
                      "su_xmax": sum(1 for c in monetos if c["xmax"])},
        "bazine": bazine_statistika(baigtys_kelias),
        "monetos": rodom,
    }


def main():
    busena = sys.argv[1] if len(sys.argv) > 1 else BUSENA
    isvestis = sys.argv[2] if len(sys.argv) > 2 else ISVESTIS
    if not os.path.exists(busena):
        sys.exit("NERA busenos failo: " + busena)
    r = surink(busena)
    with open(isvestis, "w", encoding="utf-8") as fh:
        json.dump(r, fh, ensure_ascii=False, separators=(",", ":"))
    s = r["suvestine"]
    print("%s  ->  %s  (%d kB)" % (os.path.basename(busena), os.path.basename(isvestis),
                                   os.path.getsize(isvestis) // 1024))
    print("  sekama %d | be skaiciu %d | nupiesti %d | seni %d | tikri %d"
          % (s["viso_sekama"], s["be_skaiciu"], s["nupiesti"], s["seni"], s["tikri"]))
    print("  sviezios (<= %d h): %d | su X nuo dugno: %d | su max X: %d"
          % (SVIEZI_H, s.get("sviezios", 0), s.get("su_x", 0), s.get("su_xmax", 0)))
    for e in r["etapai"]:
        print("  %-14s %3d" % (e["lt"], e["n"]))
    if r["bazine"]:
        b = r["bazine"]
        print("  bazine (n=%d): atsoko +50%% %d%% | +100%% %d%% | liko pliuse %d%% | mediana %d%%"
              % (b["n"], b["atsoko_50"], b["atsoko_100"], b["liko_pliuse"], b["mediana_dabar"]))


if __name__ == "__main__":
    main()
