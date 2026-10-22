# Swing T20 — lentelė Apkasų svetainėje

Kas rytą po Binance dienos uždarymo (00:00 UTC) GitHub Actions perskaičiuoja 20 monetų
swing signalus ir įrašo juos į šaką `t20-duomenys`. Puslapis `swing.html` (skirtukas
„Swing T20") juos parodo.

**Logika — 1:1 iš `scalp-lab/pine/swing_t20_signalai.pine` (v3.4), funkcija `f()`.**
Taisyklės čia nekeičiamos ir „negerinamos": jos keičiamos tik `scalp-lab` projekte,
po testo, ir tik tada perkeliamos čia. `scalp-lab` failai iš čia neliečiami.

## Failai

| Failas | Kas |
|---|---|
| `signalai.py` | skaičiuoklė: Binance dienos žvakės → `signalai.json`, `signalai.md` |
| `monetos.json` | 20 monetų, **ta pati tvarka kaip Pine inputai s01–s20**; keičiama tik ranka ir tik kartu su Pine |
| `t20.yml` | GitHub Actions, kas valandą UTC :20 (į repo keliama kaip `.github/workflows/t20.yml`) |
| `patikra.py` | patikrai: atsiunčia žvakes vieną kartą ir paruošia duomenis abiem varikliams |
| `palygink_etalona.js` | patikrai: palyginimas su nepriklausomu etalonu (Node) |

## Taisyklės (T20 v2 + F1)

- Įėjimas: uždarymas > ankstesnių **20** dienų uždarymų maksimumo **ir** BTC > SMA50.
- Stopas: įėjimo uždarymas − **2 × ATR(20)** (Wilder). Nejudinamas.
- Išėjimas: `low ≤ stopas` **arba** uždarymas < ankstesnių **10** dienų uždarymų minimumo.
- **F1:** BTC uždarymas < SMA50 → parduodamos visos pozicijos, naujų įėjimų nėra.
- Dydis skaičiuojamas naršyklėje: rizika 1 % sąskaitos, pozicija ne daugiau 50 % sąskaitos.
- Lentelė nežino tikrų pozicijų — kiekviena moneta skaičiuojama atskirai, tarsi vieta būtų laisva.
- Skaičiuojama tik iš **uždarytų** dienų; neuždaryta diena išmetama.

## Patikra prieš publikavimą (atlikta 2026-10-22)

**1. Prieš TradingView lentelę** (`python3 signalai.py <aplankas> --iki 2026-10-21`):

- BTC 84 093,4 > SMA50 81 742,7 (+2,9 %) — sutampa.
- PEPE LAIKYTI · uždarymas 0,00000463 · įėjimas 0,00000456 (2026-10-20) ·
  stopas 0,0000039199 (−15,3 %) · išeiti jei < 0,00000388 · 1 d. · +0,11R — sutampa.
- Visos kitos 19 — „—"; visi „pirkti jei uždarys >" ir „iki įėjimo %" sutampa.
- **LINK skiriasi žinomai:** mes 14,386 (15,1 %), TradingView 14,278 (14,2 %) — skiriasi
  istorinė LINK žvakė TradingView pusėje, ne logika. Buvo įspėta iš anksto prompte.

**2. Visa istorija prieš nepriklausomą etaloną** `scalp-lab/swing-t20/lenteles_patikra_variklis_2026-10-03.js`
(`__LPB` — savas ATR, savi max/min, be F1), tie patys Binance duomenys:

```
python3 patikra.py /tmp/t20_patikra2
node palygink_etalona.js /tmp/t20_patikra2
```

- **1 585 įvykiai prieš 1 585 · nesutapimų 0** (visos 20 monetų po lygiai).
- Mūsų variklis patikrai leidžiamas **be F1**, nes etalonas F1 neturi. Su F1 prisideda
  **187 išėjimai** (atskirai suskaičiuota, Pine `else if` tvarka).

## Paleidimas

Automatiškai: **kas valandą** (UTC :20), kaip ir modelių skeneris. Lentelė keičiasi
kartą per parą — skaičiuojama tik iš uždarytų dienų — bet dažnas paleidimas reiškia,
kad nepavykęs naktinis ciklas atsitaiso per valandą, o ne per parą. Skriptas idempotentus:
perrašo tos pačios dienos JSON.

Ranka: GitHub → **Actions** → **swing t20** → **Run workflow**.

## Ko nedaryti

- Nekeisti parametrų (20 / 10 d., 2 × ATR20, SMA50, 1 %, 50 %) ir monetų sąrašo be Pine.
- Neliesti šakų `duomenys` (Apkasų kolektorius) ir `skeneris-duomenys` (modelių skeneris).
- Nepridėti naujų signalų ar „patobulinimų" — tai `scalp-lab` projekto tyrimų klausimas.

Tai ne finansinė rekomendacija.
