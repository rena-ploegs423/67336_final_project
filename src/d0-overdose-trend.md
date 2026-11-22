---
title: National Overdose Deaths
toc: false
theme: [air, wide]
---

# U.S. drug overdose deaths, 2015–2026

Reported 12-month-ending totals, CDC NCHS (VSRR provisional counts). The most recent 12 months are dashed because those figures are provisional and are likely to change.

```js
const data = (await FileAttachment("data/us-overdose-deaths.json").json())
  .map((d) => ({...d, date: new Date(d.date + "T00:00")}));

// The last 12 months of data are treated as provisional.
const last = data.at(-1);
const provisionalStart = data.at(-12).date;                  // Jul 2025 for the current file
const solid = data.filter((d) => d.date < provisionalStart);
const dashed = data.filter((d) => d.date >= solid.at(-1).date); // overlaps one point so the line connects

const peak = data.reduce((a, b) => (b.deaths > a.deaths ? b : a));
const fmtMonthLocal = d3.timeFormat("%b %Y");
const fmtNum = d3.format(",");
```

```js
// Light/dark tokens (Framework's built-in `dark` updates when the theme changes).
const ink = {
  series: dark ? "#3987e5" : "#2a78d6",
  band: dark ? "#2a2a28" : "#f0efec",
  muted: dark ? "#c3c2b7" : "#52514e"
};
```

<div class="card">
  <h1 style="max-width: none;">Drug overdose deaths in the U.S., 12-month rolling total</h1>
  <h2 style="max-width: none;">Figures from ${fmtMonthLocal(provisionalStart)} onward (dashed) are provisional and still being updated as death records come in</h2>
  ${resize((width) => overdoseChart(width))}
</div>

```js
function overdoseChart(width) {
  const xEnd = d3.timeMonth.offset(last.date, 1);
  return Plot.plot({
    width,
    height: 420,
    marginLeft: 56,
    marginRight: 24,
    marginTop: 16,
    x: {type: "time", label: null, ticks: d3.timeYear.every(1), tickFormat: "%Y", domain: [data[0].date, xEnd]},
    y: {
      domain: [0, 125000],          // y-axis starts at zero
      grid: true,
      label: null,
      tickFormat: (d) => (d === 0 ? "0" : `${d / 1000}k`)
    },
    marks: [
      // Shaded provisional period
      Plot.rectX([{x1: provisionalStart, x2: xEnd}], {x1: "x1", x2: "x2", fill: ink.band}),
      Plot.ruleY([0]),

      // Final-ish data: solid line
      Plot.line(solid, {x: "date", y: "deaths", stroke: ink.series, strokeWidth: 2}),
      // Provisional data: dashed line
      Plot.line(dashed, {x: "date", y: "deaths", stroke: ink.series, strokeWidth: 2, strokeDasharray: "5,4"}),

      // Selective direct labels: the peak and the latest value
      Plot.dot([peak, last], {x: "date", y: "deaths", r: 4, fill: ink.series, stroke: "var(--theme-background)", strokeWidth: 2}),
      Plot.text([peak], {x: "date", y: "deaths", dy: -12, text: (d) => `Peak ${fmtNum(d.deaths)}`, fill: "currentColor"}),
      Plot.text([last], {x: "date", y: "deaths", dy: 16, dx: -2, textAnchor: "end", text: (d) => `${fmtNum(d.deaths)}*`, fill: "currentColor"}),

      // Hover: crosshair + tooltip
      Plot.ruleX(data, Plot.pointerX({x: "date", stroke: ink.muted, strokeOpacity: 0.5})),
      Plot.dot(data, Plot.pointerX({x: "date", y: "deaths", r: 4, fill: ink.series, stroke: "var(--theme-background)", strokeWidth: 2})),
      Plot.tip(data, Plot.pointerX({
        x: "date",
        y: "deaths",
        title: (d) => [
          `12 months ending ${fmtMonthLocal(d.date)}`,
          `Deaths: ${fmtNum(d.deaths)}`,
          d.date >= provisionalStart ? "Provisional: likely to be revised" : null
        ].filter(Boolean).join("\n")
      }))
    ]
  });
}
```

<small class="muted">* Data from ${fmtMonthLocal(provisionalStart)} onward is provisional and may be revised as more death records are reported. Source: CDC National Center for Health Statistics, Vital Statistics Rapid Release, Provisional Drug Overdose Death Counts.</small>

To show how serious drug-related harm is in the U.S., our dashboard starts with a line chart of national overdose deaths from 2015 to 2026. For visual encoding, years are on the x-axis and deaths on the y-axis. Position is the channel viewers judge most accurately, and a line shows change over time at a glance. Because deaths are ratio data with a true zero, the y-axis starts at zero so changes are not overstated. Provisional figures from July 2025 onward are drawn as a dashed line on a shaded background. To keep the data-ink ratio high and avoid chart junk, we use a single hue, faint gridlines, no legend, and no decorative effects, and exact values appear in a hover tooltip.

<details>
<summary>View data table</summary>

```js
Inputs.table(data.slice().reverse(), {
  columns: ["date", "deaths", "pctPending"],
  header: {date: "12 months ending", deaths: "Deaths", pctPending: "% pending investigation"},
  format: {date: fmtMonthLocal, pctPending: (d) => d.toFixed(2) + "%"},
  rows: 12
})
```

</details>
