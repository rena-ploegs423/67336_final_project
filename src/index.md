---
title: Introduction
toc: false
---

# Drug Addiction in America

<img src="./image/addiction.jpg" alt="A glass of liquor on a dark wooden table surrounded by pills, syringes, a medicine vial, cigarettes and an ashtray" style="width: 100%; max-width: 640px; border-radius: 8px; margin-top: 0.75rem;">

Drug overdoses are one of the most serious public health crises in the United States. According to provisional counts from the CDC, more than 111,000 people died from a drug overdose in the 12 months ending June 2023. That was the highest toll on record, and roughly double the yearly total in 2015. Although Deaths have fallen since then, tens of thousands of Americans still die from overdoses each year, and many of those deaths are preventable. This dashboard looks at how the crisis has changed over time and examines how drug use disorders, mental illness and access to treatment are connected. 


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

<div class="card" style="max-width: 640px; box-sizing: border-box;">
  <h1 style="max-width: none; font-size: 1.2rem;">Drug overdose deaths in the U.S., 12-month rolling total</h1>
  <h2 style="max-width: none;">Figures from ${fmtMonthLocal(provisionalStart)} onward (dashed) are provisional and still being updated as death records come in</h2>
  ${resize((width) => overdoseChart(width))}
</div>

```js
function overdoseChart(width) {
  const xEnd = d3.timeMonth.offset(last.date, 1);
  return Plot.plot({
    width,
    height: 340,
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
