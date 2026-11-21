// Data loader: runs at build time (npm run dev / npm run build), not in the browser.
// Reduces the full CDC VSRR file (~88k rows) to the national monthly series.
import {readFileSync} from "node:fs";
import {csvParse} from "d3-dsv";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const toNumber = (s) => (s == null || s === "" ? NaN : +String(s).replace(/,/g, ""));

const text = readFileSync("data/VSRR_Provisional_Drug_Overdose_Death_Counts.csv", "utf8").replace(/^﻿/, "");

const rows = csvParse(text)
  .filter((d) => d.State === "US" && d.Indicator === "Number of Drug Overdose Deaths")
  .map((d) => {
    const reported = toNumber(d["Data Value"]);
    const predicted = toNumber(d["Predicted Value"]);
    return {
      date: `${d.Year}-${String(MONTHS.indexOf(d.Month) + 1).padStart(2, "0")}-01`,
      // Predicted values adjust for reporting delays; fall back to reported if missing.
      deaths: Number.isFinite(predicted) ? predicted : reported,
      reported: Number.isFinite(reported) ? reported : null,
      pctPending: toNumber(d["Percent Pending Investigation"])
    };
  })
  .sort((a, b) => (a.date < b.date ? -1 : 1));

process.stdout.write(JSON.stringify(rows));
