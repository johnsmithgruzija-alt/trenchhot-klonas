# Antra banga — etapų taisyklės

Užrašyta **prieš** rašant kodą, 2026-10-23. Keisti tik su nauja priežastimi ir nauja data.

## Ką rodom

Monetas, kurios kada nors buvo virš **$1M** rinkos kapitalizacijos, surikiuotas pagal tai,
kur jos dabar yra savo pačios istorijoje.

## Kodėl ne dolerių juosta

Pirmas sumanymas buvo juosta „$200–300k". Atmesta: ji reiškia skirtingus dalykus skirtingo
dydžio monetoms. Monetai, kuri buvo $1,2M, tai −75 %; tai, kuri buvo $50M — −99,4 %.

Patikrinta ant gyvų duomenų (2026-10-23, 409 tikros monetos): jei etapą skaičiuotume
doleriais („≥ $1M = kyla"), **22 monetos pakliūtų į „kyla", nukritusios 85–96 % nuo piko** —
CHILLHOUSE nuo $27,2M iki $1,0M, Jimothy nuo $47,5M iki $2,3M. Vadinti jas kylančiomis būtų melas.

Todėl ašis — **procentas nuo piko**. Ji veikia bet kokio dydžio monetai ir nereikalauja
perstatinėti ribų rinkai pasikeitus.

## Etapai

| Etapas | Riba | Kiek buvo 2026-10-23 |
|---|---|---|
| Pike | 0 … −25 % | 148 |
| Atsitraukė | −25 … −70 % | 86 |
| Giliai | −70 … −90 % | 120 |
| Labai giliai | −90 % ir žemiau | 55 |

Ribos apvalios tyčia: tikslesnės ribos sudarytų įspūdį, kad jos išmatuotos. Jos nėra —
tai skaitymo patogumas, ne radinys.

## Privalomi filtrai

1. **Pikas ≥ $1M.** Žemiau — ne šio sąrašo moneta.
2. **Pikas ≤ 100 × likvidumas** matavimo metu. Plonam pului keli doleriai pakelia kainą
   tūkstančius kartų, ir žvakė tai užfiksuoja kaip faktą. 2026-10-23 šis filtras iš 618
   monetų paliko 409 — t. y. **trečdalis „milijoninių" pikų yra nupiešti**.
   Apyvarta tam netinka: ties 42:1 santykiu yra ir tikra moneta, ir skemas.
3. Įrašai be `mc` arba be `pikas` praleidžiami tylomis.

## Ko NERODOM ir kodėl

**Atsitraukimo gylio kaip signalo.** Patikrinta 2026-10-23 ant 87 monetų, kurių signalus
sekėm iki galo (viena moneta = vienas matavimas):

| Atsitraukimas | n | ≥ +50 % | ≥ +100 % | pelnas pirmas | dabar pliuse |
|---|---|---|---|---|---|
| −50…70 % | 42 | 48 % | 33 % | 43 % | 17 % |
| −70…85 % | 25 | 52 % | 28 % | 48 % | 12 % |
| −85…95 % | 15 | 67 % | 33 % | 60 % | 7 % |
| −95 %+ | 5 | 40 % | 20 % | 60 % | 0 % |

Pagal „ar atšoko +50 %" gilesnis atsitraukimas atrodo geriau; pagal „ar atšoko +100 %" —
vienodai; pagal „ar dabar pliuse" — **priešingai**. Verdiktas apsiverčia pakeitus baigties
apibrėžimą, vadinasi tai triukšmas. Etapas puslapyje yra **būsenos žymė, ne prognozė**.

**Rodom** vietoj to bendrą skaičių, kuris nesikeičia tarp apibrėžimų:
iš 87 sektų monetų **52 % kada nors atšoko +50 %**, 31 % atšoko +100 %, bet
**tik 13 % liko pliuse**; mediana po visko −80 %.

## Duomenų šaltinis

`m1-radaras/sekamos.json` — 619 įrašų, tarp jų ir monetos virš $1M (jos į `m1_sekamos.csv`
nepatenka, žr. CLAUDE.md). Laukai: `mc`, `pikas`, `liq`, `symbol`, `name`, `ath_ts`, `pirma_ts`.
Reikšmės yra **eilutės**, ne skaičiai; vienas įrašas failo gale gali būti ne žodynas.

Pool amžiaus šiame faile nėra — jei prireiks, imti iš `m1_sekamos.csv` (`pool_h`)
arba iš DexScreener `pairCreatedAt`.

## Atviras klausimas

Kur šis ruošėjas suksis: GitHub Actions su perkelta radaro logika (A) ar esamas kolektorius,
pratęstas iki 30 parų (B). Ruošėjas parašytas taip, kad nuo to nepriklausytų — jam reikia tik
failo su `mc`, `pikas`, `liq`.
