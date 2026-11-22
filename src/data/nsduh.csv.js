import {readFileSync} from "node:fs";

// Read the original dataset
const raw = readFileSync("data/nsduh_2025_raw.csv", "utf8");

// Output the CSV
process.stdout.write(raw);