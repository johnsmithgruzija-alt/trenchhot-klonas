# trenchhot-klonas — „ar šiandien verta lįsti į apkasus"

pump.fun graduavusių monetų statistika: kiek jų graduoja, kiek nuvažiuoja toliau,
kiek gyvos po paros. [trenchhot.app](https://trenchhot.app) analogas, bet be jokio API rakto
ir be imties ribojimo.

- Originalo išnarstymas ir visi API variantai: `ANALIZE-2026-10-16.md`
- Kolektorius: `apkasu_kolektorius.py` (veikia nuo 2026-10-16)
- Puslapis: dar nepadarytas

## Paleidimas

Vartotojo Terminale, **atskirame skirtuke** nuo m1 ir Robinhood radarų. `-u` ir `tee` būtini —
be jų Claude nemato ekrano. Sustabdyti: Control+C.

```
caffeinate -i python3 -u ".../trenchhot-klonas/apkasu_kolektorius.py" --watch 5 2>&1 | tee -a ".../trenchhot-klonas/ekranas.txt"
```

Be `--watch` — vienas ciklas ir baigia.

## Iš kur duomenys (visi be rakto)

| Šaltinis | Ką duoda | Kiek užklausų per ciklą |
|---|---|---|
| **pump.fun** `frontend-api-v3/coins?complete=true` | visatą: kurios monetos graduavo, `pump_swap_pool`, `ath_market_cap` | 24 (20 lango + 4 last_trade) |
| **DexScreener** `/latest/dex/tokens/<25 mint>` | `pairCreatedAt` = graduavimo momentas, likvidumą | 1–2 (starte 45) |
| **GeckoTerminal** `/pools/<pool>/ohlcv/minute` | 5 min. ir 15 min. žvakes USD — iš jų visi skaičiai | ≤ 20 (vidutiniškai ~7) |

pump.fun yra už Cloudflare, todėl eina tik per `curl_cffi` (`pip3 install --user curl_cffi`).
GeckoTerminal limitas 30 kviet./min, todėl tarp kvietimų 2,2 s pauzė.

## Kaip skaičiuojami rodikliai

- **Graduavimų per dieną** — kiek monetų su tos dienos graduavimo momentu.
- **Išlaikė $250k** (`islaike_250k`) — dvi gretimos 5 min. žvakės užsidarė ≥ $250k MC
  per pirmas 24 h. Tas pats apibrėžimas kaip originale (kad botų smailės nesiskaitytų).
- **Gyva po 24 h** (`gyva_24h`) — lange 20–24 h po graduavimo buvo bent viena 5 min.
  žvakė su MC ≥ $10 000 **ir** apyvarta ≥ $100.
- **Kopėtėlės** (`l_250k` … `l_5m`) — 15 min. žvakė užsidarė ≥ lygio per 72 h.
- **Mirties valanda** (`mirties_h`) — paskutinė žvakė, kuri dar atitiko gyvumo sąlygą.
- **Balas 0–100** — trys signalai (graduavimai, išlaikė, gyva), kiekvienas 3 dienų
  vidurkis, surikiuotas percentiliu prieš paskutines 30 dienų, sudėti ir padalinti iš 3.
  Plonos dienos traukiamos į mėnesio bendrą dalį (`SHRINK_K=20`), kad viena diena su
  5 monetomis nenusvertų.

MC = kaina × **tos monetos** tiekimas. Tiekimas imamas iš DexScreener
(`marketCap / priceUsd`) ir rašomas į `supply`; `supply_src` rodo `dex` ar `spejimas`.

## Kuri kopija tikroji

Kad niekada nekiltų klausimo, kurį failą keisti:

| Vieta | Kas tai |
|---|---|
| `index.html`, `apkasu_kolektorius.py` projekto šaknyje | **tikrieji**. Keičiami tik jie |
| `netlify-puslapis/` | vienintelis `index.html`, paruoštas nuvilkti į Netlify. Kopija |
| `github-ikelti/` | kolektorius ir dokumentai, paruošti įkelti į GitHub. Kopijos |

Kopijos atnaujinamos iš tikrųjų failų prieš kiekvieną įkėlimą. Puslapis į GitHub
nekeliamas — jis gyvena Netlify, o duomenis ima iš GitHub.

## Failai

| Failas | Kas |
|---|---|
| `monetos.json` | gyva būsena: monetos, kurioms dar reikia matavimų (~4 000) |
| `istorija.csv` | **viena moneta = viena eilutė**, įrašoma kai baigti visi matavimai |
| `data.json` | agregatai puslapiui (31 diena, kopėtėlės, gyvumo kreivė) |
| `startas.json` | pirmo ciklo laikas → pirma pilna diena |
| `bandymas.txt` | pirmų bandomųjų ciklų išvestis |
| `ciklai.json` | kiek ciklų įvyko kiekvieną dieną (dienos pilnumo patikra) |
| `ekranas.txt` | per `tee`, kad Claude matytų |
| `archyvas/` | senos kodo ir duomenų kopijos |

## Griežtos taisyklės (neatsukti atgal)

1. **Išgyvenusiųjų atranka — pagrindinė šio projekto rizika.** Monetos imamos iš
   **lango skeno** (`created_timestamp` DESC + `complete=true`) — tame sąraše lieka ir
   negyvos monetos, todėl buvimas jame nepriklauso nuo išgyvenimo. `last_trade` skenas
   lieka tik vėlyviems graduavimams ir iš jo imamos **tik ką tik graduavusios** (≤ 2 h).
   *Kodėl:* be šio skirtumo 2026-10-16 bandymas rodė „išlaikė $250k" 11/14 = 79%
   vietoj ~23%. Visa imtis buvo išgyvenusios monetos.
2. **Graduavimo kaina iš pirmos žvakės — NETINKA.** DOPE graduavo 12:26:59 už ~$42k,
   bet pirmos 5 min. žvakės `open` = $2,5M, nes pirmas sandoris pule buvo sniperio
   pirkimas. Todėl gyvumas matuojamas absoliučiais grindimis ($10k), o ne „25% graduavimo
   kainos" kaip originale. `kaina_grad` lieka archyve tik kaip diagnostika.
3. **Solanos adresai — raidžių registras REIKŠMINGAS.** `.lower()` (taisyklė iš
   Robinhood/EVM hex adresų) čia yra klaida: dėl jos pirmas bandymas nerado nė vieno
   pulo ir visos monetos gavo `grad_src=pump_created`.
4. **Žvakių limitas 1000, ne 400.** Su 400 langas nepasiekdavo graduavimo ir
   `kaina_grad` būdavo paimta 10 val. po jo.
5. **Tiekimas NĖRA visada 1e9.** 2026-10-16 matavimas (455 monetos): 37% skiriasi nuo
   1e9 daugiau kaip 5%, diapazonas 0,84e9–3,28e9. Prie $250k ribos tai lemia, ar moneta
   įskaitoma. Todėl moneta **nematuojama, kol neatėjo jos tiekimas** iš DexScreener
   (po 36 val. matuojama su atsarginiu 1e9 ir pažymima `supply_src=spejimas`).
6. **Nauji rodikliai — tik į archyvą.** `islaike_250k_v` ir `lv_*` (su apyvartos
   sąlyga ≥ $1 000) rašomi šalia originalių, bet puslapyje kol kas nenaudojami,
   kol archyvas neparodys, ar jie atskiria gerą nuo blogo.
7. **Diena su skyle balo negauna.** `ciklai.json` skaičiuoja, kiek ciklų įvyko kiekvieną
   dieną; dienai reikia ≥ 80% iš 288 (prie `--watch 5`) ir ≥ 100 graduavimų. Kitaip
   išjungtas radaras atrodytų kaip „mirusi rinka".
8. **Pirma pilna diena** = starto diena + 1. Ankstesnių dienų graduavimų skaičius
   per mažas (langas apėmė tik dalį dienos), todėl jos balo negauna.
9. Kol kolektorius veikia — jo gyvų failų neperkelti ir nepervadinti.

## Kas jau patikrinta (kad nebūtų tikrinama antrą kartą)

| Idėja | Verdiktas |
|---|---|
| `ath_market_cap` iš pump.fun kaip pikas | **Neverifikuotas.** Dalis didžiulių reikšmių tikros (UDR $267M su $1,4M likvidumo), dalis ne ($2 mlrd. prie dabartinių $2 840). Lieka archyve kaip prefiltras |
| Viešas Solana RPC vietoj Helius | **Neveikia** — 403 Access forbidden |
| GeckoTerminal `new_pools` kaip graduavimų srautas | **Netinka** — tik 200 naujausių visoje Solanoje, be filtro pagal DEX |
| pump.fun `/candlesticks`, `swap-api`, `advanced-api-v2` | **Neveikia** — 404 / DNS miręs |
| `offset` > 1000 pump.fun sąraše | **Neveikia** — tuščia. 1000 = paskutinės ~24,5 h |

## Kaip skaityti ekraną

Skaityti nebūtina — Claude pats perskaito `ekranas.txt`. Bet jeigu žiūri, eilutės reiškia:

```
=== 2026-10-16T13:33:37Z UTC ===                  ciklo pradžia (UTC, ne vietos laikas)
pump.fun: 1121 graduavusiu, 37 nauju,             1121 — langas (~24 h); 37 — dar nematytos
          7 laiko tiksl., 250 tiekimo tiksl.      kiek monetų tikslinam šį ciklą
DexScreener: graduavimo laikas 26/37,             kiek naujų gavo tikslų graduavimo laiką
             senu praleista 36                    atmesta kaip per senos (išgyvenusiųjų atranka)
eiles: 24h=7  72h=0  (GT riba 20/cikl.)           kiek monetų laukia žvakių matavimo
GT kvietimu: 7   i istorija: 0                    kiek išmatuota; kiek nukeliavo į istorija.csv
sekam: 1010 (+292 senu zymiu)                     kiek monetų stebime
BALAS: None   (vakar -)                           dienos balas 0–100 (None = dar per mažai duomenų)
ciklas 58.4 s                                     kiek užtruko
```

Normalu: ciklas 30–60 s, `senu praleista` 30–50, `BALAS: None` pirmas dvi dienas.
Blogai: `!! pump.fun neatsake` kiekvieną ciklą, ciklas > 150 s, `sekam` nebeauga.

## Kaip atsikratyti Terminalo

Terminalas reikalingas **ne todėl, kad API blokuojami** (pump.fun, DexScreener ir
GeckoTerminal visi atsako), o todėl, kad kažkas turi kviesti juos kas 5 min. visą parą.
Taigi reikia ne kito duomenų šaltinio, o kito **tvarkdario**.

### Ką patikrinom 2026-10-16

| Variantas | Verdiktas |
|---|---|
| **Dune** | **Netinka nemokamai.** Jų dokumentacija: nemokamas planas yra „view-only", API reikia trial arba mokamo plano. Vertė lieka viena: **30 dienų istorijos užpildymas** vienu užklausimu (to mūsų kolektorius negali) — jei kada norėsis grafiko iš karto pilno |
| **Bitquery** | Nemokamas planas duoda **10 eilučių per užklausą** — 1 000 monetų per dieną taip nesurinksi |
| **Moralis** | Turi gatavą „graduated tokens" endpointą, bet su dienos kvota ir be istorijos gylio; tvarkdario vis tiek reikėtų |
| **Val Town** (nemokamas) | cron **tik kas 15 min.** ir **1 min. vykdymo riba** — mūsų ciklas 30–60 s, per ankšta |
| **Cloudflare Worker** (nemokamas) | cron iki 1 min., 100k užklausų per dieną, viskas tvarkoma naršyklėje. Bet reikia perrašyti į JS, o pump.fun iš Cloudflare tinklo greičiausiai neatsakys |
| **GitHub Actions** (nemokamas vieši repo) | **Geriausias variantas.** Tas pats Python kodas, `curl_cffi` veikia, cron kas 5 min., `data.json` komitinamas šalia puslapio |

### Svarbus radinys: graduavimų sąrašą galima gauti ir be pump.fun

GeckoTerminal `/networks/solana/new_pools` (10 puslapių = 200 pulų) apima **~13 min.**
ir tarp jų `pumpswap` pulai — tai ir yra graduavimai (~1 per minutę, ≈1 480/dieną;
matuota 2026-10-16). Vadinasi galima visai nenaudoti pump.fun — tada visa krūva
(GeckoTerminal + DexScreener) veikia bet kur, be Cloudflare ir be `curl_cffi`.

**Bet:** tas langas tik 13 min. Jei ciklas vėluoja (GitHub Actions cron piko metu
vėluoja 5–15 min.), graduavimai **negrįžtamai pametami**. pump.fun langas yra 24 h,
todėl jis vėlavimą atleidžia. Todėl teisinga tvarka: pump.fun — pagrindinis,
GeckoTerminal `new_pools` — atsarginis.

### Ko nežinom, kol nepabandėm

Ar pump.fun atsako iš GitHub serverių (jų IP yra duomenų centre, Cloudflare gali
neprileisti). Patikrinimas paprastas: paleisti abu — Terminale ir GitHub'e — vieną dieną
ir sulyginti monetų skaičius.

## Būklė 2026-10-16

Kolektorius paleistas 16:22 (vietos laiku), ciklas 30–60 s, seka ~1010 monetų.
Startinė imtis — 1121 monetos langas, iš jo 1010 paimta (111 atmesta kaip per senos).
Pirmi 24 h matavimai jau eina; **kopėtėlės ir gyvumo kreivė užsipildys po 72 val.**,
pirmas tikras balas — 2026-10-18.

## Ko netikrinom

- `wss://pumpportal.fun/api/data` (nemokamas migracijų srautas) iš Terminalo.
- Ar `rado_po_h` (kiek vėluojam pamatyti monetą) turi įtakos skaičiams.
- Ar `grad_src=pump_created` monetos (~8%, DexScreener dar neturėjo pulo) elgiasi
  kitaip nei `dex`.
- Kiek dažnai `langas_ok=0` (žvakių langas nepasiekė graduavimo).

Ne finansinė rekomendacija.
