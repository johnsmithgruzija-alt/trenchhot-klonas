// Patikra Nr. 2: musu variklis (Python, be F1) PRIES nepriklausoma etalona __LPB
// is scalp-lab/swing-t20/lenteles_patikra_variklis_2026-10-03.js. Tie patys Binance duomenys.
//   node palygink_etalona.js /tmp/t20_patikra2
const fs = require("fs");
const kelias = process.argv[2] || "/tmp/t20_patikra2";
const ETALONAS = "/Users/jeff/Desktop/claude playground/scalp-lab/swing-t20/lenteles_patikra_variklis_2026-10-03.js";

global.window = {};
global.DAY = 864e5;
eval(fs.readFileSync(ETALONAS, "utf8"));
const LPB = window.__LPB;

const D = JSON.parse(fs.readFileSync(kelias + "/duomenys.json", "utf8"));
const MUSU = JSON.parse(fs.readFileSync(kelias + "/musu_ivykiai.json", "utf8"));
const today0 = Math.floor(Date.now() / DAY) * DAY;

let visoM = 0, visoE = 0, blogai = 0;
const eil = [];
for (const m of Object.keys(MUSU)) {
  const mus = MUSU[m];
  const et = LPB(D, m, today0);
  visoM += mus.length; visoE += et.length;
  let kl = [];
  if (mus.length !== et.length) kl.push("kiekis " + mus.length + " vs " + et.length);
  const n = Math.min(mus.length, et.length);
  for (let i = 0; i < n; i++) {
    if (mus[i].d !== et[i].d) { kl.push("#" + i + " diena " + mus[i].d + " vs " + et[i].d); break; }
    if (mus[i].k[0] !== et[i].k[0]) { kl.push("#" + i + " tipas " + mus[i].k + " vs " + et[i].k); break; }
    if (mus[i].k === "E" && Math.abs(mus[i].st / et[i].st - 1) > 1e-9) {
      kl.push("#" + i + " stopas " + mus[i].st + " vs " + et[i].st); break;
    }
  }
  if (kl.length) blogai++;
  eil.push([m, mus.length, et.length, kl.length ? kl.join("; ") : "1:1"]);
}
console.log("\n" + "moneta".padEnd(8) + "mes".padStart(5) + "etalonas".padStart(10) + "  verdiktas");
for (const r of eil) console.log(String(r[0]).padEnd(8) + String(r[1]).padStart(5) + String(r[2]).padStart(10) + "  " + r[3]);
console.log("\nIS VISO: musu ivykiu " + visoM + ", etalono " + visoE + ", monetu su nesutapimais: " + blogai);
