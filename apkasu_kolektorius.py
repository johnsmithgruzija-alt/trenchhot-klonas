#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apkasu_kolektorius.py - pump.fun graduavimu statistika (trenchhot.app analogas).

Ka renka:
  1. VISATA  - pump.fun frontend-api-v3 ?complete=true (visos graduavusios, be rakto).
  2. LAIKAS  - DexScreener pairCreatedAt = PumpSwap pulo sukurimas = graduavimo momentas.
  3. TIESA   - GeckoTerminal zvakes (5 min. ir 15 min., USD, be rakto):
               "islaike $250k 10 min.", "gyva po 24 h", kopetetes, mirties valanda.

Kodel zvakes, o ne pump.fun ath_market_cap: 2026-10-16 matavimas parode, kad
18 monetu is 1000 turi ath > $100M (viena $2 mlrd., kai dabartine MC $2 840).
ATH eina TIK I ARCHYVA kaip diagnostika. Visi puslapio skaiciai - is zvakiu.

Failai rasomi salia skripto:
  monetos.json   - gyva busena (monetos, kurioms dar reikia matavimu)
  istorija.csv   - viena moneta = viena eilute, kai baigti visi matavimai
  data.json      - agregatai puslapiui (30 dienu)
  ekranas.txt    - per `tee`, kad Claude matytu

Paleidimas (vartotojo Terminale, ATSKIRAME skirtuke):
  caffeinate -i python3 -u ".../apkasu_kolektorius.py" --watch 5 2>&1 | tee -a ".../ekranas.txt"
"""

import os, sys, json, csv, time, math, shutil
import urllib.request, urllib.error
from datetime import datetime, timezone, timedelta

# ---- keliai ----------------------------------------------------------------
# Numatytai - salia skripto (kaip m1/RH radaruose). APKASAI_DIR leidzia nurodyti
# kita duomenu aplanka: to reikia GitHub Actions, kur kodas ir duomenys yra
# skirtingose sakose (kodas - main, duomenys - saka "duomenys").
HERE = os.environ.get("APKASAI_DIR") or os.path.dirname(os.path.abspath(__file__))
os.makedirs(HERE, exist_ok=True)
F_BUSENA = os.path.join(HERE, "monetos.json")
F_ISTOR  = os.path.join(HERE, "istorija.csv")
F_DATA   = os.path.join(HERE, "data.json")
F_START  = os.path.join(HERE, "startas.json")
F_CIKLAI = os.path.join(HERE, "ciklai.json")

# ---- API -------------------------------------------------------------------
PUMP = "https://frontend-api-v3.pump.fun/coins"
DEX  = "https://api.dexscreener.com/latest/dex/tokens/"
GT   = "https://api.geckoterminal.com/api/v2/networks/solana/pools/"
UA   = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) apkasai/1.0"}

# ---- slenksciai ------------------------------------------------------------
# TIEKIMAS NEVIENODAS. "pump.fun moneta = 1e9 tokenu" yra tik tipinis atvejis:
# 2026-10-16 matavimas (DexScreener marketCap / priceUsd) rode nuo 0,68e9 (XShop)
# iki 2,07e9 (DON'T). Prie $250k ribos tai jau 3x skirtumas, todel tiekimas imamas
# KIEKVIENAI monetai atskirai, o 1e9 lieka tik atsarginis variantas.
SUPPLY     = 1_000_000_000          # atsarginis, kai DexScreener neturi pulo
LYGIAI     = [250_000, 500_000, 1_000_000, 5_000_000]
HOLD_LYGIS = 250_000                # "islaike" lygis
HOLD_MIN   = 2                      # kiek 5 min. zvakiu is eiles (2 = 10 min.)
# "25% graduavimo kainos" ATMESTA 2026-10-16: pirmos zvakes open nera graduavimo kaina.
# DOPE atvejis: graduavo 12:26:59 uz ~$42k, bet pirmos 5 min. zvakes open = $2,5M,
# nes pirmas sandoris pule buvo sniperio pirkimas. Graduavimo kainos be Helius neturim,
# todel gyvumas matuojamas ABSOLIUCIAIS grindimis (jos ir yra ~25% tipinio $42k graduavimo).
GYVA_MC    = float(os.environ.get("GYVA_MC", "10000"))    # gyva = MC >= $10k
GYVA_APYV  = float(os.environ.get("GYVA_APYV", "100"))    # ir zvake su >= $100 apyvarta
VOL_MIN    = float(os.environ.get("VOL_MIN", "1000"))     # lygis "realus", jei zvakes apyvarta >= tiek
# ISGYVENUSIUJU ATRANKA - sio projekto pagrindine rizika. Lango skenas
# (created_timestamp DESC + complete) yra PILNAS surasas: jame lieka ir negyvos
# monetos, todel monetos buvimas jame nepriklauso nuo to, ar ji isgyveno.
# last_trade skenas - NE: jame lieka tik tos, kurios dar prekiaujamos. Jis reikalingas
# tik velyviems graduavimams (moneta sukurta seniau nei langas), todel is jo imam
# TIK ka tik graduavusias. 2026-10-16 bandymas be sio skirtumo rode "islaike 250k"
# 11/14 (79%) vietoj ~23% - visa imtis buvo isgyvenusios monetos.
SENA_RIBA  = float(os.environ.get("SENA_RIBA", "2"))      # last_trade skenui: max val. po graduavimo
LANGO_RIBA = float(os.environ.get("LANGO_RIBA", "30"))    # lango skenui: lango plotis + atsarga
GYVA_NUO   = 20.0                   # tikrinam langa 20-24 h po graduavimo
GYVA_IKI   = 24.0
LANGAS_24  = 24.0                   # po tiek valandu matuojam "24 h" rodiklius
LANGAS_72  = 72.0                   # po tiek valandu matuojam kopeteles
ATIDEK_24  = 24.5                   # kada moneta patenka i 24 h eile
ATIDEK_72  = 72.5
ISMESK_H   = 240.0                  # po tiek valandu moneta ismetam is busenos

PUMP_PAGES = int(os.environ.get("PUMP_PAGES", "20"))   # 20 x 50 = 1000 (API riba)
PUMP_SVIEZI = int(os.environ.get("PUMP_SVIEZI", "4"))  # papildomai pagal last_trade
GT_RIBA    = int(os.environ.get("GT_RIBA", "20"))      # kiek GT kvietimu per cikla
GT_PAUZE   = float(os.environ.get("GT_PAUZE", "2.2"))  # GT limitas 30/min
DEX_BATCH  = 25
TIMEOUT    = float(os.environ.get("TIMEOUT", "10"))
TRIES      = int(os.environ.get("TRIES", "2"))
CIKLO_RIBA = float(os.environ.get("CIKLO_RIBA", "200"))
DIENU      = 30                     # kiek dienu rodo puslapis
CIKLU_DIENA = 288                   # kiek ciklu per para prie --watch 5
CIKLU_MIN  = 0.80                   # tiek ciklu dienai butina, kad diena skaitytusi pilna
TIEK_SPEJ_H = float(os.environ.get("TIEK_SPEJ_H", "36"))  # po tiek val. matuojam ir be dex tiekimo
DIENOS_MIN = int(os.environ.get("DIENOS_MIN", "100"))                     # ir tiek graduavimu (tikra diena ~1000)
SHRINK_K   = 20                     # plonos dienos traukiamos i menesio vidurki

CSV_STULP = [
    "mint", "simbolis", "pavadinimas", "grad_laikas", "grad_src", "pool",
    "rado_po_h", "mc_rado", "likv_rado", "supply", "supply_src",
    "ath_pump", "ath_pump_laikas",
    "kaina_grad", "langas_ok", "z24_n", "mc_pikas_5m", "apyv_24h",
    "islaike_250k", "islaike_250k_v", "gyva_24h", "mc_24h",
    "z72_n", "mc_pikas_15m",
    "l_250k", "l_500k", "l_1m", "l_5m",
    "lv_250k", "lv_500k", "lv_1m", "lv_5m",
    "mirties_h", "paskutinis_h",
]
LYG_K = ["250k", "500k", "1m", "5m"]

# ---------------------------------------------------------------------------
# tinklas
# ---------------------------------------------------------------------------
try:
    from curl_cffi import requests as cffi      # pump.fun uz Cloudflare
except Exception:
    cffi = None


def gauk_pump(url):
    """pump.fun - tik per curl_cffi (urllib gauna 403)."""
    if cffi is None:
        return None
    for _ in range(TRIES):
        try:
            r = cffi.get(url, impersonate="chrome", timeout=TIMEOUT)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        time.sleep(0.4)
    return None


def gauk_json(url):
    """DexScreener ir GeckoTerminal - paprastas urllib, be rakto."""
    for _ in range(TRIES):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except Exception:
            time.sleep(0.4)
    return None


# ---------------------------------------------------------------------------
# laikas
# ---------------------------------------------------------------------------
def dabar():
    return datetime.now(timezone.utc)


def iso(dt):
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def is_iso(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def val_nuo(dt):
    return (dabar() - dt).total_seconds() / 3600.0


# ---------------------------------------------------------------------------
# 1. VISATA: kokios monetos graduavo
# ---------------------------------------------------------------------------
def skenuok_pump():
    """Grazina {mint: (irasas, "langas"|"last_trade")}."""
    rasta = {}
    for p in range(PUMP_PAGES):
        url = ("%s?offset=%d&limit=50&sort=created_timestamp&order=DESC"
               "&complete=true&includeNsfw=true" % (PUMP, p * 50))
        d = gauk_pump(url)
        if not d:
            break
        for c in d:
            if c.get("mint"):
                rasta[c["mint"]] = (c, "langas")
        if len(d) < 50:
            break
    # tinklelis velyviems graduavimams: moneta, sukurta seniau nei langas,
    # bet graduavusi siandien, pagal created_timestamp butu per giliai
    for p in range(PUMP_SVIEZI):
        url = ("%s?offset=%d&limit=50&sort=last_trade_timestamp&order=DESC"
               "&complete=true&includeNsfw=true" % (PUMP, p * 50))
        d = gauk_pump(url)
        if not d:
            break
        for c in d:
            if c.get("mint"):
                rasta.setdefault(c["mint"], (c, "last_trade"))
    return rasta


# ---------------------------------------------------------------------------
# 2. LAIKAS: graduavimo momentas is DexScreener
# ---------------------------------------------------------------------------
def dex_pulai(mintai):
    """{mint: {pairCreatedAt, likv, pair}} - po 25 vienoje uzklausoje."""
    out = {}
    for i in range(0, len(mintai), DEX_BATCH):
        grupe = mintai[i:i + DEX_BATCH]
        d = gauk_json(DEX + ",".join(grupe))
        if not d:
            continue
        for p in (d.get("pairs") or []):
            # Solanos adresai yra base58 - raidziu registras REIKSMINGAS ir abu API
            # grazina ta pati. (.lower() cia buvo klaida: taisykle del DIDZIUJU yra
            # Robinhood/EVM hex adresams, ne Solanai. Del jos 2026-10-16 pirmas
            # bandymas nerado NE VIENO pulo ir visos monetos gavo src=pump_created.)
            base = ((p.get("baseToken") or {}).get("address") or "")
            if not base:
                continue
            ankstesnis = out.get(base)
            kaina = 0.0
            try:
                kaina = float(p.get("priceUsd") or 0)
            except Exception:
                kaina = 0.0
            mc = p.get("marketCap") or p.get("fdv") or 0
            yra = {
                "pair": p.get("pairAddress", ""),
                "dex": p.get("dexId", ""),
                "sukurtas": p.get("pairCreatedAt"),
                "likv": ((p.get("liquidity") or {}).get("usd") or 0),
                "mc": mc,
                "supply": (mc / kaina) if (kaina > 0 and mc) else 0,
            }
            # imam ankstyviausia pumpswap pula
            if ankstesnis is None:
                out[base] = yra
            else:
                a, b = ankstesnis.get("sukurtas") or 0, yra.get("sukurtas") or 0
                if yra["dex"] == "pumpswap" and (ankstesnis["dex"] != "pumpswap" or b < a):
                    out[base] = yra
        time.sleep(0.25)
    return out


# ---------------------------------------------------------------------------
# 3. TIESA: zvakes
# ---------------------------------------------------------------------------
def zvakes(pool, agregatas, limitas):
    """Grazina [[ts, o, h, l, c, v], ...] senesne pirma. Tik su sandoriais."""
    url = ("%s%s/ohlcv/minute?aggregate=%d&limit=%d&currency=usd&token=base"
           % (GT, pool, agregatas, limitas))
    d = gauk_json(url)
    if not d:
        return None
    L = (((d.get("data") or {}).get("attributes") or {}).get("ohlcv_list")) or []
    return sorted([x for x in L if x and len(x) >= 5], key=lambda x: x[0])


def matuok_24h(zv, grad_ts, supply=SUPPLY):
    """Is 5 min. zvakiu: pikas, apyvarta, islaike $250k, gyva po 24 h."""
    S = supply or SUPPLY
    r = {"z24_n": len(zv), "kaina_grad": "", "langas_ok": "", "mc_pikas_5m": "",
         "apyv_24h": "", "islaike_250k": "", "islaike_250k_v": "",
         "gyva_24h": "", "mc_24h": ""}
    langas = [x for x in zv if grad_ts - 600 <= x[0] <= grad_ts + LANGAS_24 * 3600]
    if not langas:
        # pule nebuvo sandoriu = neislaike ir negyva. Tai matavimas, ne klaida;
        # z24_n=0 lieka archyve, kad matytume, kiek tokiu atveju.
        r.update({"islaike_250k": 0, "islaike_250k_v": 0, "gyva_24h": 0,
                  "langas_ok": 1 if zv else 0, "apyv_24h": 0})
        return r
    # ar zvakiu langas tikrai pasiekia graduavima (limitas 1000 galejo nukirsti)
    r["langas_ok"] = 1 if langas[0][0] <= grad_ts + 900 else 0
    r["kaina_grad"] = round(langas[0][1] * S, 2)      # TIK diagnostika (sniperiai!)
    r["mc_pikas_5m"] = round(max(x[4] for x in langas) * S, 2)
    r["apyv_24h"] = round(sum(x[5] for x in langas), 2)

    # islaike: HOLD_MIN gretimu 5 min. zvakiu (po 300 s) uzsidare virs lygio
    def eile_virs(apyv_min):
        eile, pries = 0, None
        for x in langas:
            virs = x[4] * S >= HOLD_LYGIS and x[5] >= apyv_min
            gretima = pries is not None and abs(x[0] - pries - 300) <= 1
            eile = (eile + 1) if (virs and gretima) else (1 if virs else 0)
            pries = x[0]
            if eile >= HOLD_MIN:
                return 1
        return 0
    r["islaike_250k"] = eile_virs(0)            # kaip trenchhot (be apyvartos salygos)
    r["islaike_250k_v"] = eile_virs(VOL_MIN)    # TIK I ARCHYVA: ar buvo su kuo iseiti

    # gyva: lange 20-24 h yra zvake su MC >= GYVA_MC ir apyvarta >= GYVA_APYV
    vel = [x for x in zv if grad_ts + GYVA_NUO * 3600 <= x[0] <= grad_ts + GYVA_IKI * 3600]
    r["gyva_24h"] = 1 if any(x[4] * S >= GYVA_MC and x[5] >= GYVA_APYV
                             for x in vel) else 0
    if vel:
        r["mc_24h"] = round(vel[-1][4] * S, 2)
    return r


def matuok_72h(zv, grad_ts, supply=SUPPLY):
    """Is 15 min. zvakiu: kopeteles (zvake uzsidare virs lygio) ir mirties valanda."""
    S = supply or SUPPLY
    r = {"z72_n": len(zv), "mc_pikas_15m": "", "mirties_h": "", "paskutinis_h": ""}
    for k in LYG_K:
        r["l_" + k] = ""
        r["lv_" + k] = ""
    langas = [x for x in zv if grad_ts - 900 <= x[0] <= grad_ts + LANGAS_72 * 3600]
    if not langas:
        for k in LYG_K:
            r["l_" + k] = 0
            r["lv_" + k] = 0
        r["mirties_h"] = 0.0
        r["paskutinis_h"] = 0.0
        return r
    pikas = max(x[4] for x in langas) * S
    pikas_v = max([x[4] * S for x in langas if x[5] >= VOL_MIN] or [0])
    r["mc_pikas_15m"] = round(pikas, 2)
    for L, k in zip(LYGIAI, LYG_K):
        r["l_" + k] = 1 if pikas >= L else 0        # kaip trenchhot
        r["lv_" + k] = 1 if pikas_v >= L else 0     # TIK I ARCHYVA: su apyvarta

    # mirtis: paskutine zvake, kuri dar virs grindu ir su apyvarta
    gyvos = [x for x in langas if x[4] * S >= GYVA_MC and x[5] >= GYVA_APYV]
    r["paskutinis_h"] = round((langas[-1][0] - grad_ts) / 3600.0, 2)
    r["mirties_h"] = round((gyvos[-1][0] - grad_ts) / 3600.0, 2) if gyvos else 0.0
    return r


# ---------------------------------------------------------------------------
# busena ir istorija
# ---------------------------------------------------------------------------
def krauk_busena():
    if not os.path.exists(F_BUSENA):
        return {}
    try:
        with open(F_BUSENA, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def rasyk_busena(b):
    tmp = F_BUSENA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(b, f, separators=(",", ":"))
    os.replace(tmp, F_BUSENA)


def istorijos_antraste_ok():
    """Pasikeitus stulpeliams - palieka kopija (kaip m1 radare)."""
    if not os.path.exists(F_ISTOR):
        with open(F_ISTOR, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(CSV_STULP)
        return
    with open(F_ISTOR, "r", newline="", encoding="utf-8") as f:
        sena = next(csv.reader(f), [])
    if sena == CSV_STULP:
        return
    kopija = F_ISTOR.replace(".csv", ".pries_%s.csv" % dabar().strftime("%Y-%m-%d"))
    shutil.copy2(F_ISTOR, kopija)
    with open(F_ISTOR, "r", newline="", encoding="utf-8") as f:
        senos = list(csv.DictReader(f))
    with open(F_ISTOR, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_STULP, extrasaction="ignore")
        w.writeheader()
        for e in senos:                      # perkeliam PAGAL STULPELIU VARDUS
            w.writerow({k: e.get(k, "") for k in CSV_STULP})
    print("   antraste pasikeite, kopija: %s" % os.path.basename(kopija))


def rasyk_istorija(irasai):
    if not irasai:
        return
    with open(F_ISTOR, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_STULP, extrasaction="ignore")
        for e in irasai:
            w.writerow({k: e.get(k, "") for k in CSV_STULP})


def skaityk_istorija(dienu=35):
    riba = dabar() - timedelta(days=dienu)
    out = []
    if not os.path.exists(F_ISTOR):
        return out
    with open(F_ISTOR, "r", newline="", encoding="utf-8") as f:
        for e in csv.DictReader(f):
            g = is_iso(e.get("grad_laikas"))
            if g and g >= riba:
                out.append(e)
    return out


# ---------------------------------------------------------------------------
# agregatai puslapiui
# ---------------------------------------------------------------------------
def sk(v):
    try:
        return float(v)
    except Exception:
        return None


def diena(dt):
    return dt.strftime("%Y-%m-%d")


def shrink(hits, n, pooled):
    if n <= 0:
        return None
    return (hits + SHRINK_K * pooled) / (n + SHRINK_K)


def percentilis(reiksme, imtis):
    imtis = [x for x in imtis if x is not None]
    if not imtis:
        return 0.5
    zemiau = sum(1 for x in imtis if x < reiksme)
    return zemiau / len(imtis)


def ciklai_plius():
    """Suskaiciuojam, kiek ciklu ivyko kiekviena diena. Diena su skyle (radaras buvo
    isjungtas) negali gauti balo: graduavimu skaicius butu per mazas ne del rinkos."""
    d = {}
    if os.path.exists(F_CIKLAI):
        try:
            with open(F_CIKLAI, encoding="utf-8") as f:
                d = json.load(f)
        except Exception:
            d = {}
    k = dabar().strftime("%Y-%m-%d")
    d[k] = d.get(k, 0) + 1
    # laikom tik 40 dienu
    for x in sorted(d.keys())[:-40]:
        d.pop(x, None)
    with open(F_CIKLAI, "w", encoding="utf-8") as f:
        json.dump(d, f)
    return d


def ciklai_skaityk():
    if not os.path.exists(F_CIKLAI):
        return {}
    try:
        with open(F_CIKLAI, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def startas():
    """Pirmo ciklo laikas. Pirma PILNA diena = starto diena + 1 (anksciau langas
    apima tik dalį dienos, todėl tų dienų graduavimu skaicius butu per mazas)."""
    if os.path.exists(F_START):
        try:
            with open(F_START, encoding="utf-8") as f:
                return is_iso(json.load(f).get("pradeta"))
        except Exception:
            pass
    t = dabar()
    with open(F_START, "w", encoding="utf-8") as f:
        json.dump({"pradeta": iso(t)}, f)
    return t


def daryk_data(busena):
    """Suskaiciuoja data.json is istorijos + busenos."""
    eil = skaityk_istorija()
    # busenos monetos, kurios jau turi 24 h matavima, irgi skaitosi
    for m, e in busena.items():
        if e.get("gyva_24h") in (0, 1) and not e.get("baigta"):
            eil.append(e)

    po_dienu = {}
    for e in eil:
        g = is_iso(e.get("grad_laikas"))
        if not g:
            continue
        d = po_dienu.setdefault(diena(g), {"n": 0, "hold_n": 0, "hold": 0,
                                           "gyv_n": 0, "gyv": 0})
        d["n"] += 1
        h, gy = e.get("islaike_250k"), e.get("gyva_24h")
        if h in (0, 1, "0", "1"):
            d["hold_n"] += 1
            d["hold"] += int(h)
        if gy in (0, 1, "0", "1"):
            d["gyv_n"] += 1
            d["gyv"] += int(gy)

    # menesio bendros dalys (i jas traukiam plonas dienas)
    vH = sum(d["hold"] for d in po_dienu.values())
    nH = sum(d["hold_n"] for d in po_dienu.values())
    vG = sum(d["gyv"] for d in po_dienu.values())
    nG = sum(d["gyv_n"] for d in po_dienu.values())
    pool_h = (vH / nH) if nH else 0.0
    pool_g = (vG / nG) if nG else 0.0

    dienos = []
    siandien = dabar().date()
    for i in range(DIENU, -1, -1):
        d = siandien - timedelta(days=i)
        k = d.strftime("%Y-%m-%d")
        x = po_dienu.get(k, {"n": 0, "hold_n": 0, "hold": 0, "gyv_n": 0, "gyv": 0})
        dienos.append({
            "data": k, "n": x["n"],
            "hold": shrink(x["hold"], x["hold_n"], pool_h),
            "hold_n": x["hold_n"],
            "gyva": shrink(x["gyv"], x["gyv_n"], pool_g),
            "gyva_n": x["gyv_n"],
        })

    # 3 dienu vidurkiai
    def vid3(i, laukas):
        v = [dienos[j][laukas] for j in range(max(0, i - 2), i + 1)
             if dienos[j][laukas] is not None]
        return (sum(v) / len(v)) if v else None

    for i, d in enumerate(dienos):
        d["ga3"] = vid3(i, "n")
        d["hold3"] = vid3(i, "hold")
        d["gyva3"] = vid3(i, "gyva")

    # balas: trys percentiliai pries paskutines 30 dienu
    def pasibaige(k):
        # dienos pradzia + 48 h: tada ir velyviausia tos dienos moneta turi 24 h
        d0 = datetime.strptime(k, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        return dabar() >= d0 + timedelta(hours=48)

    t_pradeta = startas()
    pirma_ok = (t_pradeta + timedelta(days=1)).strftime("%Y-%m-%d")

    ciklai = ciklai_skaityk()

    def pilna_diena(k):
        if k < pirma_ok or not pasibaige(k):
            return False
        return ciklai.get(k, 0) >= CIKLU_DIENA * CIKLU_MIN

    pilnos = [d for d in dienos if d["n"] >= DIENOS_MIN and pilna_diena(d["data"])]
    for d in dienos:
        d["ciklai"] = ciklai.get(d["data"], 0)
        if d["n"] < DIENOS_MIN or d["hold3"] is None or not pilna_diena(d["data"]):
            d["balas"] = None
            continue
        p1 = percentilis(d["ga3"], [x["ga3"] for x in pilnos])
        p2 = percentilis(d["hold3"], [x["hold3"] for x in pilnos])
        p3 = percentilis(d["gyva3"], [x["gyva3"] for x in pilnos])
        d["pr"] = {"ga": round(p1, 3), "hold": round(p2, 3), "gyva": round(p3, 3)}
        d["balas"] = int(round(100 * (p1 + p2 + p3) / 3.0))

    # kopeteles (tik baigtos monetos: 72 h matavimas)
    baigtos = [e for e in skaityk_istorija() if e.get("l_250k") in ("0", "1", 0, 1)]
    def pasieke(e, k):
        return str(e.get("l_" + k, "")) == "1"
    kopetes = []
    nuo_sarasai = [("grad", lambda e: True), ("250k", lambda e: pasieke(e, "250k")),
                   ("500k", lambda e: pasieke(e, "500k")), ("1m", lambda e: pasieke(e, "1m"))]
    for vardas, filtras in nuo_sarasai:
        imtis = [e for e in baigtos if filtras(e)]
        if not imtis:
            continue
        kopetes.append({
            "nuo": vardas, "n": len(imtis),
            "i": {k: round(sum(1 for e in imtis if pasieke(e, k)) / len(imtis), 4)
                  for k in ["250k", "500k", "1m", "5m"]},
        })

    # gyvumo kreive (96 valandos)
    mirtys = [sk(e.get("mirties_h")) for e in baigtos]
    mirtys = [m for m in mirtys if m is not None]
    kreive = []
    if mirtys:
        kreive = [round(sum(1 for m in mirtys if m >= h) / len(mirtys), 4)
                  for h in range(0, 97)]
    mediana = None
    if mirtys:
        s = sorted(mirtys)
        mediana = round(s[len(s) // 2], 1)

    t_start = startas()
    pirma_pilna = (t_start + timedelta(days=1)).strftime("%Y-%m-%d")
    data = {
        "atnaujinta": iso(dabar()),
        "pradeta": iso(t_start),
        "pirma_pilna_diena": pirma_pilna,
        "sukurta_ts": int(time.time()),
        "nuo": dienos[0]["data"] if dienos else None,
        "seka": sum(1 for e in busena.values() if not e.get("sena")),
        "baigta": len(baigtos),
        "dienos": [{"data": d["data"], "n": d["n"],
                    "hold": None if d["hold"] is None else round(d["hold"], 4),
                    "hold_n": d["hold_n"],
                    "gyva": None if d["gyva"] is None else round(d["gyva"], 4),
                    "gyva_n": d["gyva_n"],
                    "ga3": None if d["ga3"] is None else round(d["ga3"], 1),
                    "hold3": None if d["hold3"] is None else round(d["hold3"], 4),
                    "gyva3": None if d["gyva3"] is None else round(d["gyva3"], 4),
                    "balas": d["balas"], "pr": d.get("pr"),
                    "ciklai": d.get("ciklai", 0)} for d in dienos],
        "kopetes": kopetes,
        "gyvumas": {"n": len(mirtys), "mediana_h": mediana, "kreive": kreive},
        "eile": {},
    }
    return data


# ---------------------------------------------------------------------------
# ciklas
# ---------------------------------------------------------------------------
def ciklas():
    t0 = time.time()
    print("\n=== %s UTC ===" % iso(dabar()))
    istorijos_antraste_ok()
    busena = krauk_busena()

    # --- 1. visata -----------------------------------------------------------
    rasta = skenuok_pump()
    if rasta is None or not rasta:
        print("!! pump.fun neatsake - tesiam tik su matavimais")
        rasta = {}
    if rasta:
        ciklai_plius()
    nauji = [m for m in rasta if m not in busena]
    # monetos, kurioms DexScreener dar neturejo pulo: per kelis ciklus patikslinam laika
    laikini = [m for m, e in busena.items()
               if e.get("laikinas") == 1 and (is_iso(e.get("grad_laikas")) is None
                                              or val_nuo(is_iso(e["grad_laikas"])) < 6)]
    # monetos be tikro tiekimo (dar nematuotos) - uzpildom po truputi, 10 grupiu per cikla
    be_supply = sorted(
        [m for m, e in busena.items()
         if not e.get("sena") and e.get("supply_src") != "dex"
         and e.get("gyva_24h") in (None, "")],
        key=lambda m: busena[m].get("grad_laikas") or "")[:10 * DEX_BATCH]
    print("   pump.fun: %d graduavusiu, %d nauju, %d laiko tiksl., %d tiekimo tiksl."
          % (len(rasta), len(nauji), len(laikini), len(be_supply)))

    # --- 2. graduavimo laikas naujiems --------------------------------------
    if nauji or laikini or be_supply:
        pulai = dex_pulai(nauji + laikini + be_supply)
        for m in be_supply:
            dx = pulai.get(m)
            if dx and (dx.get("supply") or 0) > 0:
                e = busena[m]
                e["supply"] = round(dx["supply"])
                e["supply_src"] = "dex"
                if not e.get("likv_rado"):
                    e["likv_rado"] = round(dx.get("likv") or 0, 2)
        for m in laikini:
            dx = pulai.get(m)
            if dx and dx.get("sukurtas"):
                e = busena[m]
                e["grad_laikas"] = iso(datetime.fromtimestamp(dx["sukurtas"] / 1000.0, timezone.utc))
                e["grad_src"] = "dex"
                e["laikinas"] = 0
                e["likv_rado"] = round(dx.get("likv") or 0, 2)
                e["pool"] = e.get("pool") or dx.get("pair") or ""
                if (dx.get("supply") or 0) > 0:
                    e["supply"] = round(dx["supply"])
                    e["supply_src"] = "dex"
        sena_n = 0
        for m in nauji:
            c, skenas = rasta[m]
            dx = pulai.get(m) or {}
            ts = dx.get("sukurtas")
            if ts:
                g = datetime.fromtimestamp(ts / 1000.0, timezone.utc)
                src = "dex"
            else:
                # be DexScreener: imam monetos sukurima arba dabar - kas velesnis
                ct = c.get("created_timestamp")
                g = datetime.fromtimestamp(ct / 1000.0, timezone.utc) if ct else dabar()
                src = "pump_created"
            rado_po = val_nuo(g)
            riba = LANGO_RIBA if skenas == "langas" else SENA_RIBA
            if rado_po > riba:
                # last_trade tinklelis isvelka ir senas, vis dar prekiaujamas monetas.
                # I statistika jos NEGALI eiti: isliko tik tos, kurios gyvos ->
                # isgyvenusiuju atranka pasuktu praeitu dienu skaicius. Zymim ir
                # daugiau neklausiam (kitaip DexScreener uzklaustume kas cikla).
                busena[m] = {"mint": m, "sena": 1, "grad_laikas": iso(g)}
                sena_n += 1
                continue
            busena[m] = {
                "rado_po_h": round(rado_po, 2),
                "skenas": skenas,
                # be DexScreener pulo graduavimo laikas netikslus -> tikslinam kitais ciklais
                "laikinas": 0 if src == "dex" else 1,
                "mint": m,
                "simbolis": (c.get("symbol") or "")[:20],
                "pavadinimas": (c.get("name") or "")[:40],
                "grad_laikas": iso(g), "grad_src": src,
                "pool": c.get("pump_swap_pool") or dx.get("pair") or "",
                "mc_rado": round(c.get("usd_market_cap") or 0, 2),
                "likv_rado": round(dx.get("likv") or 0, 2),
                "supply": round(dx.get("supply") or 0) or SUPPLY,
                "supply_src": "dex" if (dx.get("supply") or 0) > 0 else "spejimas",
                "ath_pump": round(c.get("ath_market_cap") or 0, 2),
                "ath_pump_laikas": (iso(datetime.fromtimestamp(
                    c["ath_market_cap_timestamp"] / 1000.0, timezone.utc))
                    if c.get("ath_market_cap_timestamp") else ""),
            }
        rado = sum(1 for m in nauji if m in pulai)
        if not nauji:
            sena_n = 0
        print("   DexScreener: graduavimo laikas %d/%d, senu praleista %d"
              % (rado, len(nauji), sena_n))

    # --- 3. zvakiu eiles -----------------------------------------------------
    eile24, eile72 = [], []
    for m, e in busena.items():
        if e.get("sena"):
            continue
        g = is_iso(e.get("grad_laikas"))
        if not g or not e.get("pool"):
            continue
        amzius = val_nuo(g)
        # be tikro tiekimo MC butu neteisingas (tiekimas svyruoja 0,84e9-3,3e9),
        # todel laukiam DexScreener. Jei nesulaukiam per TIEK_SPEJ_H - matuojam su
        # atsarginiu 1e9 ir pasizymim supply_src="spejimas".
        if not (e.get("supply") or 0) > 0:
            if amzius >= TIEK_SPEJ_H:
                e["supply"] = SUPPLY
                e["supply_src"] = "spejimas"
            else:
                continue
        if e.get("gyva_24h") in (None, "") and amzius >= ATIDEK_24:
            eile24.append((amzius, m))
        elif e.get("l_250k") in (None, "") and amzius >= ATIDEK_72 and e.get("gyva_24h") not in (None, ""):
            eile72.append((amzius, m))
    # seniausios pirmos: 5 min. zvakiu langas (1000) pasiekia graduavima tik ~83 h,
    # todel velintis su senomis monetomis = pamesti matavima
    eile24.sort(reverse=True)
    eile72.sort(reverse=True)
    print("   eiles: 24h=%d  72h=%d  (GT riba %d/cikl.)" % (len(eile24), len(eile72), GT_RIBA))

    gt = 0
    for amzius, m in eile24:
        if gt >= GT_RIBA or time.time() - t0 > CIKLO_RIBA:
            break
        e = busena[m]
        grad_ts = int(is_iso(e["grad_laikas"]).timestamp())
        zv = zvakes(e["pool"], 5, 1000)                # 1000 x 5 min = iki 83 h
        gt += 1
        time.sleep(GT_PAUZE)
        if zv is None:
            continue
        e.update(matuok_24h(zv, grad_ts, e.get("supply")))

    for amzius, m in eile72:
        if gt >= GT_RIBA or time.time() - t0 > CIKLO_RIBA:
            break
        e = busena[m]
        grad_ts = int(is_iso(e["grad_laikas"]).timestamp())
        zv = zvakes(e["pool"], 15, 1000)               # 1000 x 15 min = iki 250 h
        gt += 1
        time.sleep(GT_PAUZE)
        if zv is None:
            continue
        e.update(matuok_72h(zv, grad_ts, e.get("supply")))
        e["baigta"] = 1

    # --- 4. baigtos -> istorija, senos -> is busenos --------------------------
    i_istorija, ismesti = [], []
    for m, e in list(busena.items()):
        if e.get("sena"):
            continue
        g = is_iso(e.get("grad_laikas"))
        if not g:
            continue
        if e.get("baigta") == 1:
            i_istorija.append(e)
            ismesti.append(m)
        elif val_nuo(g) > ISMESK_H:
            # nepavyko ismatuoti per 10 dienu - vis tiek i istorija, su tuo, kas yra
            i_istorija.append(e)
            ismesti.append(m)
    rasyk_istorija(i_istorija)
    for m in ismesti:
        busena.pop(m, None)
    rasyk_busena(busena)

    # --- 5. data.json --------------------------------------------------------
    data = daryk_data(busena)
    data["eile"] = {"e24": len(eile24), "e72": len(eile72), "gt": gt}
    with open(F_DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)

    sd = [d for d in data["dienos"] if d["balas"] is not None]
    balas = sd[-1]["balas"] if sd else None
    vakar = sd[-2] if len(sd) >= 2 else None
    gyvos = sum(1 for e in busena.values() if not e.get("sena"))
    print("   GT kvietimu: %d   i istorija: %d   sekam: %d (+%d senu zymiu)"
          % (gt, len(i_istorija), gyvos, len(busena) - gyvos))
    print("   BALAS: %s   (vakar %s)  |  baigtu monetu: %d" % (
        balas, vakar["balas"] if vakar else "-", data["baigta"]))
    if vakar:
        print("   vakar: %d graduavimu, islaike250k %s, gyva24h %s" % (
            vakar["n"],
            "-" if vakar["hold"] is None else "%.0f%%" % (100 * vakar["hold"]),
            "-" if vakar["gyva"] is None else "%.1f%%" % (100 * vakar["gyva"])))
    print("   ciklas %.1f s" % (time.time() - t0))


def main():
    watch = 0.0
    if "--watch" in sys.argv:
        i = sys.argv.index("--watch")
        watch = float(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 5.0
    if cffi is None:
        print("!! curl_cffi nerastas - pump.fun bus neprieinamas.")
        print("   pip3 install --user curl_cffi")
    while True:
        try:
            ciklas()
        except KeyboardInterrupt:
            print("\nsustabdyta.")
            return
        except Exception as ex:
            import traceback
            print("!! ciklo klaida: %s" % ex)
            traceback.print_exc()
        if watch <= 0:
            return
        time.sleep(watch * 60)


if __name__ == "__main__":
    main()
