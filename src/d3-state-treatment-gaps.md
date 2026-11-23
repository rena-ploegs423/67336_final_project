---
title: Geographic Treatment Gaps
toc: false
theme: [air, wide]
---

# Geographic Treatment Gaps

```js
import * as d3 from "npm:d3";
import {
  COLORS,
  ramp,
  REGIONS,
  stateMap,
  supplyDots,
  demandSupplyScatter
} from "./components/state.js";

const states = await FileAttachment("data/state_2024_demand_supply_cleaned.csv").csv({typed: true});
const us = await fetch(import.meta.resolve("npm:us-atlas/states-10m.json")).then((response) => response.json());

const [amiLow, amiHigh] = d3.extent(states, (d) => d.ami_pct);
const [sudLow, sudHigh] = d3.extent(states, (d) => d.sud_pct);
const [demandRangeLow, demandRangeHigh] = d3.extent(states, (d) => d.cooc_pct);

const amiLowest = d3.least(states, (d) => d.ami_pct);
const amiHighest = d3.greatest(states, (d) => d.ami_pct);
const sudLowest = d3.least(states, (d) => d.sud_pct);
const sudHighest = d3.greatest(states, (d) => d.sud_pct);
const demandLowest = d3.least(states, (d) => d.cooc_pct);
const demandHighest = d3.greatest(states, (d) => d.cooc_pct);

const supplyLow = d3.least(states, (d) => d.cooc_facilities_pct);
const supplyHigh = d3.greatest(states, (d) => d.cooc_facilities_pct);
const medianDemand = d3.median(states, (d) => d.cooc_pct);
const medianSupply = d3.median(states, (d) => d.cooc_facilities_pct);
```

<style>
  #observablehq-main {
    max-width: none !important;
    width: 100%;
    box-sizing: border-box;
    padding-left: clamp(24px, 3vw, 64px);
    padding-right: clamp(24px, 3vw, 64px);
  }

  .state-intro {
    max-width: 820px;
    margin: 28px 0 44px;
  }

  .state-intro h2 {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(28px, 2.8vw, 42px);
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin: 0 0 14px;
  }

  .state-intro p {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(16px, 1.2vw, 19px);
    line-height: 1.55;
    color: var(--theme-foreground-muted);
  }

  .state-section {
    width: 100%;
    padding: 28px 0 56px;
  }

  .state-section + .state-section {
    border-top: 1px solid #E5E7EB;
  }

  .state-section h2 {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(25px, 2.2vw, 36px);
    font-weight: 650;
    line-height: 1.25;
    letter-spacing: -0.015em;
    margin: 0 0 12px;
  }

  .state-section-description {
    max-width: 760px;
    margin: 0 0 22px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(15px, 1.1vw, 18px);
    line-height: 1.55;
    color: var(--theme-foreground-muted);
  }

  .state-map-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .state-card {
    min-width: 0;
  }

  .state-card h3,
  .state-card h4 {
    font-family: "Helvetica Neue", Arial, sans-serif;
  }

  .region-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .state-year-note {
    max-width: 820px;
    margin: 0 0 36px;
    padding: 14px 16px;
    border-left: 4px solid #754387;
    background: color-mix(in srgb, #754387 7%, var(--theme-background));
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.55;
  }

  .state-key-insight {
    max-width: 760px;
    margin: 10px 0 8px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: var(--theme-foreground-muted);
  }

  .state-source {
    margin-top: 28px;
    max-width: 900px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--theme-foreground-muted);
  }

  @media (max-width: 700px) {
    #observablehq-main {
      padding-left: 16px;
      padding-right: 16px;
    }

    .region-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

```js
const intro = html`
  <div class="state-intro">
    <h2>Where demand and supply diverge</h2>
    <p>
      This dashboard combines 2023–2024 state demand estimates with 2024 facility supply data.
      It compares mental illness, substance use disorders, co-occurring conditions, and the
      availability of integrated care across the 50 states and the District of Columbia.
    </p>
  </div>
`;

display(intro);

const yearNote = html`
  <div class="state-year-note">
    <b>About the years.</b> State demand estimates use the 2023–2024 NSDUH state estimates.
    State estimates from the 2025 National Survey on Drug Use and Health are not expected until early 2027.
    Facility supply uses the 2024 National Substance Use and Mental Health Services Survey.
    These figures do not represent 2025 state conditions and should not be compared directly with the 2025 national data analysis.
  </div>
`;

display(yearNote);
```

<section class="state-section">

## Demand across states

<p class="state-section-description">
Across states, ${amiLow.toFixed(0)}–${amiHigh.toFixed(0)}% of adults had a mental illness,
${sudLow.toFixed(0)}–${sudHigh.toFixed(0)}% had a substance use disorder, and
${demandRangeLow.toFixed(0)}–${demandRangeHigh.toFixed(0)}% had both. Blue represents mental illness,
pink represents substance use disorder, and purple represents co-occurring demand.
</p>

```js
const demandMaps = html`
  <div class="state-map-grid">
    <div class="card state-card">
      <h3>Any mental illness</h3>
      ${resize((width) => stateMap(us, states, {
        value: "ami_pct",
        range: ramp(COLORS.mental),
        width,
        domain: [0, 35],
        label: "% of adults",
        detail: (row) => `${row.state}\n${row.ami_pct.toFixed(1)}% of adults had a mental illness in the past year\n95% interval: ${row.ami_lo.toFixed(1)}%–${row.ami_hi.toFixed(1)}%`
      }))}
      <p class="state-key-insight">
        <b>Key insight:</b> ${amiLowest.state} is lowest at ${amiLowest.ami_pct.toFixed(1)}%;
        ${amiHighest.state} is highest at ${amiHighest.ami_pct.toFixed(1)}%.
      </p>
    </div>

    <div class="card state-card">
      <h3>Substance use disorder</h3>
      ${resize((width) => stateMap(us, states, {
        value: "sud_pct",
        range: ramp(COLORS.drug),
        width,
        domain: [0, 25],
        label: "% of adults",
        detail: (row) => `${row.state}\n${row.sud_pct.toFixed(1)}% of adults had a substance use disorder in the past year\n95% interval: ${row.sud_lo.toFixed(1)}%–${row.sud_hi.toFixed(1)}%`
      }))}
      <p class="state-key-insight">
        <b>Key insight:</b> ${sudLowest.state} is lowest at ${sudLowest.sud_pct.toFixed(1)}%;
        ${sudHighest.state} is highest at ${sudHighest.sud_pct.toFixed(1)}%.
      </p>
    </div>

    <div class="card state-card">
      <h3>Both conditions</h3>
      ${resize((width) => stateMap(us, states, {
        value: "cooc_pct",
        range: ramp(COLORS.demand),
        width,
        domain: [0, 12],
        label: "% of adults",
        detail: (row) => `${row.state}\n${row.cooc_pct.toFixed(1)}% of adults had both a substance use disorder and a mental illness\n95% interval: ${row.cooc_lo.toFixed(1)}%–${row.cooc_hi.toFixed(1)}%`
      }))}
      <p class="state-key-insight">
        <b>Key insight:</b> ${demandLowest.state} is lowest at ${demandLowest.cooc_pct.toFixed(1)}%;
        ${demandHighest.state} is highest at ${demandHighest.cooc_pct.toFixed(1)}%.
      </p>
    </div>
  </div>
`;

display(demandMaps);
```

</section>

<section class="state-section">

## Supply of integrated care

<p class="state-section-description">
The availability of integrated care (that is, the share of substance use treatment facilities that also offer care for serious mental illness) differs significantly across states and across regions. Purple is used because this supply serves people with both substance use and mental health conditions.
</p>

```js
const integratedSupplyMap = html`
  <div class="card state-card">
    <h3>Facilities offering co-occurring care</h3>
    ${resize((width) => stateMap(us, states, {
      value: "cooc_facilities_pct",
      range: ramp(COLORS.supply),
      width,
      domain: [0, 100],
      label: "% of substance use treatment facilities",
      detail: (row) => `${row.state}\n${row.cooc_facilities_pct.toFixed(0)}% of substance use treatment facilities offer care for co-occurring serious mental illness\n(${row.cooc_facilities.toLocaleString()} of ${row.su_facilities.toLocaleString()} facilities)`
    }))}
    <p class="state-key-insight">
      <b>Key insight:</b> ${supplyLow.state} has the lowest share at ${supplyLow.cooc_facilities_pct.toFixed(1)}%;
      ${supplyHigh.state} has the highest share at ${supplyHigh.cooc_facilities_pct.toFixed(1)}%.
    </p>
  </div>
`;

display(integratedSupplyMap);
```

```js
const regionalSupplyCharts = html`
  <div class="region-grid">
    ${REGIONS.map((region) => html`
      <div class="card state-card">
        <h4>${region}</h4>
        ${resize((width) => supplyDots(states, region, {width}))}
      </div>
    `)}
  </div>
`;

display(regionalSupplyCharts);
```

</section>

<section class="state-section">

## Demand meets supply

```js
const scatter = demandSupplyScatter(states, {width: 640});
const highDemandLowSupply = scatter.clear.map((row) => row.state);

const formatStateList = (names) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
};
```

<h3>
${highDemandLowSupply.length
  ? `${formatStateList(highDemandLowSupply)} ${highDemandLowSupply.length === 1 ? "has" : "have"} clearly above-median demand with clearly below-median integrated-care supply`
  : "No state has the highest-confidence combination of above-median demand and below-median supply"}
</h3>

<p class="state-section-description">
Each dot represents a state. The horizontal line for each dot shows the 95% confidence interval for the share of adults with both conditions. Dashed lines show medians across states (${medianDemand.toFixed(1)}% co-occurring demand and ${medianSupply.toFixed(1)}% integrated-care supply). Highlighted states are clearly above-median point-estimate demand and below-median integrated-care supply.
</p>

```js
display(html`
  <div class="card state-card">
    ${resize((width) => demandSupplyScatter(states, {width}))}
  </div>
`);
```

<p class="state-source">
<b>Notes.</b> Demand: SAMHSA NSDUH model-based state estimates, adults 18+, 95% intervals.
Substance use disorder means a drug or alcohol use disorder; co-occurring demand means that disorder
plus any mental illness. Supply: SAMHSA N-SUMHSS 2024 facility file. “Co-occurring” means the facility
reports offering treatment for co-occurring serious mental illness or serious emotional disturbance
and substance use disorder. Facility shares describe reported services, not treatment capacity.
District of Columbia is included separately from the state map. Puerto Rico and other territories are not included.
<br><b>Sources:</b> SAMHSA, 2023–2024 NSDUH state estimates; SAMHSA, 2024 N-SUMHSS.
</p>

</section>
