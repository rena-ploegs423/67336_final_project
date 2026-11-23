import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import * as topojson from "npm:topojson-client";

// blue = mental illness, pink = substance use disorder, purple = both conditions.
export const COLORS = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neutral: "#D4D6D8",
  text: "#222222",
  muted: "#777D85"
};

// Short aliases keep chart calls readable while preserving a single source of truth.
COLORS.mi = COLORS.mental;
COLORS.dud = COLORS.drug;
COLORS.demand = COLORS.both;
COLORS.supply = COLORS.both;
// light-to-dark color range for one hue (for choropleths that should match a fixed brand color)
export const ramp = (c) => [d3.interpolateRgb("white", c)(0.12), d3.color(c).darker(0.4).formatHex()];

export const REGIONS = ["Northeast", "Midwest", "South", "West"];
const REGION_STATES = {
  Northeast: "CT ME MA NH RI VT NJ NY PA",
  Midwest: "IL IN MI OH WI IA KS MN MO NE ND SD",
  South: "DE DC FL GA MD NC SC VA WV AL KY MS TN AR LA OK TX",
  West: "AZ CO ID MT NV NM UT WY AK CA HI OR WA"
};
export const regionOf = Object.fromEntries(
  Object.entries(REGION_STATES).flatMap(([region, list]) => list.split(" ").map((abbr) => [abbr, region]))
);

// Choropleth of one percentage measure. Default scale is a fixed 0-100 so color differences are honest; pass domain for rare measures.
export function stateMap(us, rows, {value, scheme, range, label, width, detail, domain = [0, 100]}) {
  const byName = new Map(rows.map((r) => [r.state, r]));
  // keep the 50 states + DC; drop territories (no data, and they sit outside the map frame)
  const states = topojson.feature(us, us.objects.states).features.filter((f) => byName.has(f.properties.name));
  const borders = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  return Plot.plot({
    width,
    height: Math.round(width * 0.62),
    projection: "albers-usa",
    color: {type: "linear", domain, ...(range ? {range} : {scheme}), label, legend: true, unknown: "#d9d9d9", tickFormat: (d) => d + "%"},
    marks: [
      Plot.geo(states, {
        fill: (d) => byName.get(d.properties.name)?.[value],
        tip: true,
        title: (d) => {
          const r = byName.get(d.properties.name);
          return detail(r);
        }
      }),
      Plot.geo(borders, {stroke: "white", strokeOpacity: 0.8, strokeWidth: 0.7})
    ]
  });
}

// Sorted dot chart of the supply measure for one region (dots + thin stem from 0). No interval: it is a count of facilities, not a survey estimate.
export function supplyDots(rows, region, {width}) {
  const data = rows.filter((r) => regionOf[r.state_abbr] === region).sort((a, b) => b.cooc_facilities_pct - a.cooc_facilities_pct);
  const all = 100 * d3.sum(rows, (r) => r.cooc_facilities) / d3.sum(rows, (r) => r.su_facilities);
  return Plot.plot({
    width,
    marginLeft: 120,
    marginTop: 22,
    height: 22 * data.length + 70,
    x: {domain: [0, 100], label: "Substance use treatment facilities offering co-occurring mental illness care (%)", tickFormat: (d) => d + "%", grid: false},
    y: {label: null, domain: data.map((d) => d.state)},
    marks: [
      Plot.ruleX([all], {strokeDasharray: "3,3", strokeOpacity: 0.6}),
      Plot.text([`All states ${all.toFixed(0)}%`], {x: all, frameAnchor: "top", dy: -16, fontSize: 11}),
      Plot.ruleY(data, {y: "state", x1: 0, x2: "cooc_facilities_pct", stroke: COLORS.supply, strokeOpacity: 0.35, strokeWidth: 2}),
      Plot.dot(data, {
        x: "cooc_facilities_pct", y: "state", fill: COLORS.supply, r: 4, tip: true,
        title: (d) => `${d.state}\n${d.cooc_facilities_pct.toFixed(0)}% of substance use treatment facilities offer care for co-occurring serious mental illness\n(${d.cooc_facilities.toLocaleString()} of ${d.su_facilities.toLocaleString()} facilities)`
      })
    ]
  });
}

// Demand for integrated care (x) vs. facilities offering it (y). Dashed lines = medians across states.
export function demandSupplyScatter(rows, {width}) {
  const medX = d3.median(rows, (d) => d.cooc_pct);
  const medY = d3.median(rows, (d) => d.cooc_facilities_pct);
  // Highlight states clearly above-median on co-occurring demand and clearly below-median on integrated-care supply.
  const demandThreshold = medX + 0.5;
  const supplyThreshold = medY - 5;
  const flag = (d) => d.cooc_pct >= demandThreshold && d.cooc_facilities_pct <= supplyThreshold;
  const clear = rows.filter(flag);
  const chart = Plot.plot({
    width,
    height: Math.round(Math.min(560, width * 0.7)),
    marginLeft: 60,
    x: {domain: [5, 13], label: "Adults with both a substance use disorder and a mental illness (%)", tickFormat: (d) => d + "%", grid: false},
    y: {domain: [0, 100], label: "Substance use treatment facilities offering co-occurring care (%)", tickFormat: (d) => d + "%", grid: false},
    marks: [
      Plot.ruleX([medX], {strokeDasharray: "3,3", strokeOpacity: 0.5}),
      Plot.ruleY([medY], {strokeDasharray: "3,3", strokeOpacity: 0.5}),
      Plot.ruleY(rows, {y: "cooc_facilities_pct", x1: "cooc_lo", x2: "cooc_hi", stroke: (d) => (flag(d) ? COLORS.demand : COLORS.muted), strokeOpacity: 0.3}),
      Plot.dot(rows, {
        x: "cooc_pct", y: "cooc_facilities_pct", r: 4.5, fill: (d) => (flag(d) ? COLORS.demand : COLORS.muted), fillOpacity: (d) => (flag(d) ? 1 : 0.6), tip: true,
        title: (d) =>
          `${d.state}\n${d.cooc_pct.toFixed(1)}% of adults have both a substance use disorder and a mental illness\n(95% interval: ${d.cooc_lo.toFixed(1)}%–${d.cooc_hi.toFixed(1)}%)\n${d.cooc_facilities_pct.toFixed(0)}% of substance use treatment facilities offer co-occurring care`
      }),
      Plot.text(clear, {x: "cooc_pct", y: "cooc_facilities_pct", text: "state", dy: -10, fill: COLORS.demand, fontWeight: "bold"}),
      Plot.text(["Higher demand, fewer facilities offering integrated care"], {frameAnchor: "bottom-right", dx: -8, dy: -8, fill: COLORS.demand, fontWeight: "bold"})
    ]
  });
  return Object.assign(chart, {clear});
}