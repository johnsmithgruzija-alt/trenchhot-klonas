#!/usr/bin/env python3
"""Antros bangos kolektorius — sukasi GitHub Actions'uose, be jokiu raktu.

Vienas paleidimas = vienas ciklas. Busena tarp ciklu gyvena sakoje "antra-banga"
(workflow ja atkuria pries pradedant ir irraso po to).

Aptikimo ir pulu dalis perkelta is m1-radaras/m1_radaras.py su visais jos
pataisymais (zr. komentarus prie GET, gauk_pump ir poolai). Praleista visa
signalu, busenos masinos ir ekrano dalis — cia jos nereikia.

Keliai imami nuo ANTRA_BANGA_DIR, jei jis nustatytas; kitaip — salia skripto.
"""
import json, os, sys, time, urllib.request, urllib.error

HERE = os.environ.get("ANTRA_BANGA_DIR") or os.path.dirname(os.path.abspath(__file__))
F_BUSENA = os.path.join(HERE, "busena.json")
F_ISVES  = os.path.join(HERE, "antra_banga.json")
F_CIKLAI = os.path.join(HERE, "ciklai.json")

PUMP = "https://frontend-api-v3.pump.fun/coins"
DEX  = "https://api.dexscreener.com/latest/dex/tokens/"
UA   = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) antrabanga/1.0"}

PEAK_MIN   = float(os.environ.get("PEAK_MIN", "1000000"))
MC_GRINDYS = float(os.environ.get("MC_GRINDYS", "200000"))   # kol kur skenuoti pump.fun
SCAN_PAGES = int(os.environ.get("SCAN_PAGES", "40"))
BATCH      = int(os.environ.get("BATCH", "25"))
PAPILD_MAX = int(os.environ.get("PAPILD_MAX", "150"))
TIMEOUT    = float(os.environ.get("TIMEOUT", "8"))
TRIES      = int(os.environ.get("TRIES", "2"))
CIKLO_RIBA = float(os.environ.get("CIKLO_RIBA", "420"))      # GitHub darbui duota 12 min.
SLEEP      = 0.25
PAMIRSTI_D = float(os.environ.get("PAMIRSTI_D", "7"))        # po tiek parų be duomenu — lauk
MAX_SEKAMU = int(os.environ.get("MAX_SEKAMU", "2500"))

STAT = {"viso": 0, "nepavyko": 0}


def log(t):
    sys.stdout.write(t); sys.stdout.flush()


def get(url, tries=TRIES):
    """TIMEOUT=8 ir TRIES=2 nekeisti i daugiau. Su senais (25/4, be bendros ribos)
    vienas uzsikirtes prasymas kainuodavo iki 107 s, per 67 val. buvo 21 uzstrigimas
    ir radaras nemate 38 % laiko. Geriau trukstama moneta nei valandos aklumo."""
    STAT["viso"] += 1
    for a in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(1 + a); continue
            STAT["nepavyko"] += 1
            return None
        except Exception:
            time.sleep(1 + a)
    STAT["nepavyko"] += 1
    return None


# 2026-10-15: pump.fun uz Cloudflare. urllib gauna 403 nepriklausomai nuo antrasciu —
# Cloudflare atpazista TLS parasa, ne antrastes. curl_cffi mimikuoja Chrome ir praeina.
try:
    from curl_cffi import requests as _cr
except Exception:
    _cr = None

PUMP_BUDAS = {"kuo": "curl_cffi" if _cr else "urllib (curl_cffi neideta)"}


def gauk_pump(url):
    if _cr is not None:
        for a in range(TRIES):
            try:
                r = _cr.get(url, impersonate="chrome", timeout=TIMEOUT + 4)
                if r.status_code == 200:
                    PUMP_BUDAS["kuo"] = "curl_cffi"
                    return r.json()
                if r.status_code in (429, 500, 502, 503, 504):
                    time.sleep(1 + a); continue
                PUMP_BUDAS["kuo"] = "curl_cffi -> HTTP %s" % r.status_code
                break
            except Exception as e:
                PUMP_BUDAS["kuo"] = "curl_cffi -> %s" % type(e).__name__
                time.sleep(1 + a)
    d = get(url)
    if d is not None:
        PUMP_BUDAS["kuo"] = "urllib"
    return d


def f(d, *path):
    cur = d
    for k in path:
        if not isinstance(cur, dict):
            return 0.0
        cur = cur.get(k)
        if cur is None:
            return 0.0
    try:
        return float(cur)
    except Exception:
        return 0.0


def atranka():
    """Visos pump.fun monetos, kuriu pikas bent karta virsijo PEAK_MIN."""
    rasti, seen = [], set()
    log("  pump.fun ")
    for p in range(SCAN_PAGES):
        log(".")
        d = gauk_pump("%s?sort=market_cap&order=DESC&limit=50&offset=%d&includeNsfw=false"
                      % (PUMP, p * 50))
        if not d:
            break
        if isinstance(d, dict):
            d = d.get("coins") or []
        if not d:
            break
        zemiausias = 1e18
        for c in d:
            mint = c.get("mint")
            if not mint:
                continue
            mc = f(c, "usd_market_cap")
            if mc > 0:
                zemiausias = min(zemiausias, mc)
            if mint in seen:
                continue
            ath = f(c, "ath_market_cap")
            if ath > mc * 100 and mc > 0:        # sugadintas ATH (Fartcoin tipo)
                ath = mc
            if max(mc, ath) < PEAK_MIN:
                continue
            seen.add(mint)
            rasti.append({"mint": mint, "symbol": str(c.get("symbol") or "?"),
                          "name": (c.get("name") or "")[:24], "ath": ath, "mc": mc,
                          "creator": c.get("creator", "")})
        time.sleep(SLEEP)
        if zemiausias < MC_GRINDYS:              # sarasas rikiuotas mazejanciai
            break
    log(" %d kada nors buvo virs $%,.0f".replace(",", "") % (len(rasti), PEAK_MIN))
    log("" if rasti else "  [%s]" % PUMP_BUDAS["kuo"])
    log("\n")
    return rasti


def poolai(mintai, pabaiga):
    """DexScreener: iki ~30 adresu vienoje uzklausoje. Grazina {mint: geriausias poolas}."""
    out, papild, nutraukta = {}, 0, False
    blokai = [mintai[i:i + BATCH] for i in range(0, len(mintai), BATCH)]
    for n, blokas in enumerate(blokai, 1):
        if time.time() > pabaiga:
            nutraukta = True
            break
        log("\r  dexscreener: %d/%d   " % (n, len(blokai)))
        d = get(DEX + ",".join(blokas))
        time.sleep(SLEEP)
        pairs = (d or {}).get("pairs") or []
        if not pairs and len(blokas) > 1:
            for m in blokas:
                d1 = get(DEX + m); time.sleep(SLEEP)
                pairs += (d1 or {}).get("pairs") or []
        # SAUGIKLIS: jei pakete truksta monetu (DexScreener riboja atsakymo dydi),
        # paklausiam ju atskirai, bet ne daugiau PAPILD_MAX per cikla.
        gauta = set((pr.get("baseToken") or {}).get("address") for pr in pairs)
        for m in blokas:
            if m in gauta or papild >= PAPILD_MAX or time.time() > pabaiga:
                continue
            papild += 1
            d1 = get(DEX + m); time.sleep(SLEEP)
            pairs += (d1 or {}).get("pairs") or []
        pagal = {}
        for pr in pairs:
            if pr.get("chainId") != "solana":
                continue
            a = (pr.get("baseToken") or {}).get("address")
            if not a:
                continue
            pagal.setdefault(a, []).append(pr)
        for a, lst in pagal.items():
            lst.sort(key=lambda x: f(x, "liquidity", "usd"), reverse=True)
            best = dict(lst[0])
            best["_liq"] = sum(f(x, "liquidity", "usd")
                               for x in lst if f(x, "liquidity", "usd") >= 1000)
            out[a] = best
    rasta = sum(1 for m in mintai if m in out)   # skaiciuojam tik tai, ko patys klausem
    log("\r  dexscreener: rasta %d is %d | po viena %d%s | nepavyko %d is %d%s   \n"
        % (rasta, len(mintai), papild, " (RIBA ISNAUDOTA)" if papild >= PAPILD_MAX else "",
           STAT["nepavyko"], STAT["viso"],
           " | LAIKAS BAIGESI" if nutraukta else ""))
    return out


def skaityk_busena():
    if not os.path.exists(F_BUSENA):
        return {}
    try:
        with open(F_BUSENA, encoding="utf-8") as fh:
            d = json.load(fh)
        if not isinstance(d, dict):
            return {}
        # Busenoje pasitaiko irasu, kurie nera zodynai (realiame m1 faile toks yra
        # vienas is 619). Be sito valymo ciklas luzta ties sorted(... .get("mates")).
        svarus = {m: e for m, e in d.items() if isinstance(e, dict)}
        if len(svarus) != len(d):
            log("  busenoje praleista %d netinkamo formato irasu\n" % (len(d) - len(svarus)))
        return svarus
    except Exception as e:
        log("  busenos failas sugadintas (%s) - pradedam nuo nulio\n" % type(e).__name__)
        return {}


def ciklas():
    t0 = time.time()
    pabaiga = t0 + CIKLO_RIBA
    bus = skaityk_busena()
    log("  busena: %d monetos\n" % len(bus))

    # 1. nauji radiniai is pump.fun
    nauji = 0
    for c in atranka():
        e = bus.get(c["mint"])
        if e is None:
            bus[c["mint"]] = {"symbol": c["symbol"], "name": c["name"],
                              "pikas": c["ath"], "mc": c["mc"], "liq": 0.0,
                              "creator": c.get("creator", ""),
                              "pirma": time.time(), "mates": 0}
            nauji += 1
        else:
            if c["ath"] > float(e.get("pikas") or 0):
                e["pikas"] = c["ath"]
            e["symbol"] = c["symbol"] or e.get("symbol")
            e["name"] = c["name"] or e.get("name")
    log("  naujos: %d\n" % nauji)

    # 2. DexScreener visoms sekamoms; seniausiai matytos pirmos, kad ribos atveju
    #    nebutu visada tos pacios praleidziamos
    mintai = sorted(bus, key=lambda m: float(bus[m].get("mates") or 0))[:MAX_SEKAMU]
    pls = poolai(mintai, pabaiga) if mintai else {}

    dabar = time.time()
    for m, pr in pls.items():
        e = bus.get(m)
        if e is None:
            continue
        mc = f(pr, "marketCap") or f(pr, "fdv")
        liq = float(pr.get("_liq") or 0)
        if mc > 0:
            e["mc"] = mc
            if mc > float(e.get("pikas") or 0):      # pats pamatem auksciau nei pump.fun
                e["pikas"] = mc
        e["liq"] = liq
        e["mates"] = dabar
        bt = pr.get("baseToken") or {}
        if bt.get("symbol"):
            e["symbol"] = str(bt["symbol"])[:16]

    # 3. pamirstam tai, ko DexScreener nebeturi
    riba = dabar - PAMIRSTI_D * 86400
    ismesti = [m for m, e in bus.items()
               if float(e.get("mates") or 0) < riba and float(e.get("pirma") or 0) < riba]
    for m in ismesti:
        bus.pop(m, None)
    log("  pamirsta (be duomenu > %.0f parų): %d\n" % (PAMIRSTI_D, len(ismesti)))

    with open(F_BUSENA, "w", encoding="utf-8") as fh:
        json.dump(bus, fh, ensure_ascii=False, separators=(",", ":"))

    # 4. puslapio failas
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from builder import surink
    r = surink(F_BUSENA, None)
    with open(F_ISVES, "w", encoding="utf-8") as fh:
        json.dump(r, fh, ensure_ascii=False, separators=(",", ":"))

    s = r["suvestine"]
    log("  tikri %d | nupiesti %d | seni %d | be skaiciu %d\n"
        % (s["tikri"], s["nupiesti"], s.get("seni", 0), s["be_skaiciu"]))
    log("  " + " | ".join("%s %d" % (e["lt"], e["n"]) for e in r["etapai"]) + "\n")

    c = []
    if os.path.exists(F_CIKLAI):
        try:
            c = json.load(open(F_CIKLAI, encoding="utf-8")) or []
        except Exception:
            c = []
    c.append({"laikas": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
              "sekama": len(bus), "tikri": s["tikri"], "naujos": nauji,
              "trukme_s": round(time.time() - t0, 1),
              "nepavyko": STAT["nepavyko"], "uzklausu": STAT["viso"]})
    with open(F_CIKLAI, "w", encoding="utf-8") as fh:
        json.dump(c[-300:], fh, ensure_ascii=False, separators=(",", ":"))
    log("  ciklas %.0f s\n" % (time.time() - t0))


if __name__ == "__main__":
    os.makedirs(HERE, exist_ok=True)
    ciklas()
