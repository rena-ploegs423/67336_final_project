// Builds src/data/state_2024_demand_supply_cleaned.csv: one row per state (50 states + DC).
// Demand = NSDUH 2023-2024 small-area state estimates (SAMHSA).
// Supply = N-SUMHSS 2024 facility records.
// Usage: node scripts/clean-2024-state-demand-supply.mjs src/data/raw/2024-nsduh-sae-excels src/data/raw/NSUMHSS_2024_PUF_CSV.csv src/data/state_2024_demand_supply_cleaned.csv

import {readFileSync, writeFileSync} from "node:fs";
import {csvParse, csvParseRows, csvFormat} from "d3-dsv";

const [saeDirectory, facilityFile, outputFile] = process.argv.slice(2);

if (!saeDirectory || !facilityFile || !outputFile) {
  throw new Error("Usage: node scripts/clean-2024-state-demand-supply.mjs <SAE folder> <N-SUMHSS PUF> <output csv>");
}

// 1. State reference data
const STATES = {Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",Connecticut:"CT",Delaware:"DE","District of Columbia":"DC",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",Virginia:"VA",Washington:"WA","West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY"};

// 2. Cleaning helpers
// Convert "75.74%" to 75.74; return null for blank or suppressed values.
const pct = (s) => {
  const m = /^\s*(-?\d+(\.\d+)?)\s*%?\s*$/.exec(s ?? "");
  return m ? +m[1] : null;
};

// 3. Read NSDUH demand estimates
// For one SAE table, keep the adults 18+ estimate and 95% confidence interval by state.
function readTable(n) {
  const file = `${saeDirectory}/2024-nsduh-sae-excel-tab${String(n).padStart(2, "0")}.csv`;
  const rows = csvParseRows(readFileSync(file, "latin1"));
  const h = rows.findIndex((r) => r[0] === "Order");
  const head = rows[h].map((c) => c.replace(/\s+/g, " ").trim());
  const col = (name) => head.indexOf(name);
  const [e, lo, hi] = ["18+ Estimate", "18+ 95% CI (Lower)", "18+ 95% CI (Upper)"].map(col);
  if ([e, lo, hi].some((i) => i < 0)) throw new Error(`Table ${n}: 18+ columns not found`);
  const out = new Map();
  for (const r of rows.slice(h + 1)) {
    const abbr = STATES[r[1]?.trim()];
    if (abbr) out.set(abbr, {est: pct(r[e]), lo: pct(r[lo]), hi: pct(r[hi])});
  }
  return out;
}

// Map each cleaned demand measure to its NSDUH SAE table (all adults 18+).
const TABLES = {
  ami: 33,   // any mental illness, past year (2023-24)
  sud: 24,   // substance use disorder (drug or alcohol), past year (2023-24)
  cooc: 35   // co-occurring substance use disorder and any mental illness, past year (2023-24)
};
const demand = Object.fromEntries(Object.entries(TABLES).map(([k, n]) => [k, readTable(n)]));

// 4. Read and filter N-SUMHSS supply facilities
const puf = csvParse(readFileSync(facilityFile, "utf8"));
const num = (v) => (v === "" || v == null || isNaN(+v) ? null : +v);
const supply = new Map();
for (const f of puf) {
  const st = f.LOCATIONSTATE;
  if (!Object.values(STATES).includes(st)) continue;  // drops PR, other jurisdictions ("ZZ")
  if (num(f.TREATMT_SU) !== 1) continue;  // facilities that offer substance use treatment
  const s = supply.get(st) ?? {su_facilities: 0, cooc_resp: 0, cooc_yes: 0};
  s.su_facilities++;
  const c = num(f.SMISEDSUD_SU);
  if (c !== null) { s.cooc_resp++; s.cooc_yes += c === 1; }
  supply.set(st, s);
}

// 5. Build one cleaned row per state
const names = Object.fromEntries(Object.entries(STATES).map(([n, a]) => [a, n]));
const rows = Object.values(STATES).map((st) => {
  const o = {state: names[st], state_abbr: st};
  for (const k of Object.keys(TABLES)) {
    const d = demand[k].get(st);
    o[`${k}_pct`] = d?.est ?? null; o[`${k}_lo`] = d?.lo ?? null; o[`${k}_hi`] = d?.hi ?? null;
  }
  const s = supply.get(st);
  o.su_facilities = s?.su_facilities ?? 0;
  o.cooc_facilities = s?.cooc_yes ?? 0;
  o.cooc_facilities_pct = s?.cooc_resp ? +(100 * s.cooc_yes / s.cooc_resp).toFixed(1) : null;
  return o;
});

// 6. Data quality checks and export
const bad = rows.filter((r) => Object.values(r).some((v) => v === null));
console.log(`states: ${rows.length}; rows with missing values: ${bad.length}`, bad.map((r) => r.state));
console.log("total SU-treatment facilities (50 states + DC):", d3sum(rows, "su_facilities"));
function d3sum(a, k) { return a.reduce((t, r) => t + r[k], 0); }
writeFileSync(outputFile, csvFormat(rows));
console.log("wrote", outputFile);