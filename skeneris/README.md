# Modelių skeneris (GitHub Actions)

12 prekybos modelių ir 13 modelio raštų paieška BTC, ETH ir SOL grafikuose (4H, 1D, 1W). Rezultatus rodo puslapis `skeneris.html` (Apkasai svetainėje, skirtukas „Modeliai").

- `varikliai.js` — modelių varikliai: ištrauka iš projekto `code_boot` (tik 12 modelių ir 13 modelio funkcijos; vienintelis pakeitimas — laiko konstantos per `window.__BARMS / __SUBMS / __DAYMS / __D19`).
- `skenuoti.js` — skeneris: Binance 1H (data-api.binance.vision) → 4H (vykdymas 1H), 1D (vykdymas 6H), 1W (vykdymas 42 val.); kiekvienam modeliui atviri sandoriai, laukiantys orderiai, retestai, kas formuojasi ir visa istorija.
- `builder.py` — eksportas → `dabar.json`, `atvejai.json`, `serijos.json`, `modeliai.json`, `skenavimas.json` (LT ir EN), `dabar.md`, `busena.json`.
- `.github/workflows/skeneris.yml` — kas 4 val. (UTC :17); rezultatai — šakoje `skeneris-duomenys` (perrašoma kiekvieną kartą; `zurnalas.txt` — paskutinio paleidimo išvestis). Apkasai kolektoriaus šakos `duomenys` neliečia.

Patikra (2026-10-22): Node skeneris su `varikliai.js` tais pačiais duomenimis atkartoja TradingView skenavimą 954 / 954 (žvakės, sandoriai, laukiantys orderiai, stebimi setup'ai); abu varikliai 1:1 visuose 126 rinkiniuose; 4H atkartoja projekto backtest'ą.

Tai atpažinimo įrankis, ne prekybos signalai. Ne finansinė rekomendacija.
