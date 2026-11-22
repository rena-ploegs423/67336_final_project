---
title: National Overdose Deaths
toc: false
theme: [air, wide]
---

# Drug Overdose Deaths in the U.S.

```js
const data = (await FileAttachment("data/us-overdose-deaths.json").json())
  .map(d => ({
    ...d,
    date: new Date(`${d.date}T00:00:00`),
    deaths: Number(d.deaths),
    pctPending: d.pctPending == null || d.pctPending === ""
      ? null
      : Number(d.pctPending)
  }))
  .filter(d =>
    Number.isFinite(d.date.getTime()) &&
    Number.isFinite(d.deaths)
  )
  .sort((a, b) => d3.ascending(a.date, b.date));

if (data.length < 13) {
  throw new Error("At least 13 monthly observations are required.");
}

const first = data[0];
const last = data.at(-1);

const peak = data.reduce((a, b) =>
  b.deaths > a.deaths ? b : a
);

// The latest 12 observations are treated as provisional.
// Confirm this cutoff against the CDC release for your dataset.
const provisionalStart = data.at(-12).date;

const historical = data.filter(d =>
  d.date < provisionalStart
);

// Include the preceding observation to connect the dashed line.
const provisional = [
  historical.at(-1),
  ...data.filter(d => d.date >= provisionalStart)
];

// Divide the historical line at the peak for highlighting.
const beforePeak = historical.filter(d =>
  d.date <= peak.date
);

const afterPeak = historical.filter(d =>
  d.date >= peak.date
);

const changeSincePeak =
  (last.deaths - peak.deaths) / peak.deaths * 100;

const fmtMonth = d3.timeFormat("%b %Y");
const fmtYear = d3.timeFormat("%Y");
const fmtNum = d3.format(",");

const colors = {
  blue: "#2468A2",
  lightBlue: "#C5D6E8",
  band: "#F0F1F3",
  muted: "#777D85"
};
```

<style>
  #observablehq-main {
    max-width: none !important;
    width: 100%;
    box-sizing: border-box;
    padding-left: clamp(20px, 3vw, 60px);
    padding-right: clamp(20px, 3vw, 60px);
  }

  .overdose-scrolly {
    position: relative;
    width: 100%;
    height: 400vh;
    margin-top: 20px;
  }

  .overdose-sticky {
    position: sticky;
    top: 3vh;
    height: 94vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-width: 0;
    background: var(--theme-background);
  }

  .overdose-heading {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 12px;
  }

  .overdose-stat {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(36px, 4vw, 62px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
    color: #2468A2;
    margin: 0 0 7px;
  }

  .overdose-title {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(22px, 2vw, 30px);
    font-weight: 650;
    line-height: 1.2;
    letter-spacing: -0.015em;
    margin: 0 0 8px;
    max-width: none;
  }

  .overdose-description {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(14px, 1.1vw, 17px);
    line-height: 1.5;
    color: var(--theme-foreground-muted);
    margin: 0;
  }

  .overdose-graphic {
    width: 100%;
    min-width: 0;
  }

  .overdose-graphic svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
    max-height: 67vh;
  }

  .overdose-caption {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: var(--theme-foreground-muted);
    margin-top: 12px;
  }

  .overdose-scroll-track {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .overdose-scroll-step {
    height: 100vh;
  }

  .overdose-data {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #E5E7EB;
  }

  .overdose-data summary {
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
  }

  @media (max-width: 700px) {
    #observablehq-main {
      padding-left: 16px;
      padding-right: 16px;
    }

    .overdose-heading {
      min-height: 140px;
    }

    .overdose-stat {
      font-size: clamp(36px, 9vw, 55px);
    }

    .overdose-title {
      font-size: 23px;
    }

    .overdose-description {
      font-size: 14px;
    }

    .overdose-graphic svg {
      max-height: 55vh;
    }

    .overdose-caption {
      font-size: 12px;
    }
  }
</style>

```js
const overdoseStories = [
  {
    statistic: "",
    title: "How has the overdose crisis changed?",
    description:
      `U.S. drug overdose deaths, ${fmtYear(first.date)}–${fmtYear(last.date)}.`
  },

  {
    statistic: fmtNum(peak.deaths),
    title: "overdose deaths at the peak.",
    description:
      `The highest rolling 12-month total was recorded in ${fmtMonth(peak.date)}.`
  },

  {
    statistic: `${Math.abs(changeSincePeak).toFixed(1)}%`,
    title: changeSincePeak < 0
      ? "fewer deaths than at the peak."
      : changeSincePeak > 0
        ? "more deaths than at the earlier peak."
        : "change from the peak.",
    description:
      `Comparing ${fmtMonth(peak.date)} with ${fmtMonth(last.date)}.`
  },

  {
    statistic: fmtNum(last.deaths),
    title: "deaths in the latest 12-month period.",
    description:
      `12 months ending ${fmtMonth(last.date)}. These figures are provisional.`
  }
];
```

```js
function overdoseChart(width) {
  const xEnd = d3.timeMonth.offset(last.date, 1);

  const yMax = Math.max(
    125000,
    Math.ceil(d3.max(data, d => d.deaths) / 25000) * 25000
  );

  return Plot.plot({
    width,
    height: Math.max(420, Math.min(610, width * 0.52)),

    marginTop: 48,
    marginRight: 40,
    marginBottom: 50,
    marginLeft: 75,

    style: {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      fontSize: 17,
      background: "transparent"
    },

    x: {
      type: "time",
      domain: [first.date, xEnd],
      ticks: d3.timeYear.every(1),
      tickFormat: "%Y",
      label: null
    },

    y: {
      domain: [0, yMax],
      nice: false,
      grid: true,
      label: null,
      tickFormat: d =>
        d === 0 ? "0" : `${d / 1000}k`
    },

    marks: [
      // Shaded provisional period.
      Plot.rectX(
        [{x1: provisionalStart, x2: xEnd}],
        {
          x1: "x1",
          x2: "x2",
          fill: colors.band,
          className: "overdose-band"
        }
      ),

      Plot.ruleY([0]),

      // Historical trend before the peak.
      Plot.line(beforePeak, {
        x: "date",
        y: "deaths",
        stroke: colors.blue,
        strokeWidth: 3,
        className: "overdose-before"
      }),

      // Historical trend after the peak.
      Plot.line(afterPeak, {
        x: "date",
        y: "deaths",
        stroke: colors.blue,
        strokeWidth: 3,
        className: "overdose-after"
      }),

      // Dashed provisional tail.
      Plot.line(provisional, {
        x: "date",
        y: "deaths",
        stroke: colors.blue,
        strokeWidth: 3,
        strokeDasharray: "7,5",
        className: "overdose-provisional"
      }),

      // Peak marker.
      Plot.dot([peak], {
        x: "date",
        y: "deaths",
        r: 6,
        fill: colors.blue,
        stroke: "var(--theme-background)",
        strokeWidth: 2,
        className: "overdose-peak-marker"
      }),

      // Larger peak annotation.
      Plot.text([peak], {
        x: "date",
        y: "deaths",
        dy: -22,
        text: d => `Peak ${fmtNum(d.deaths)}`,
        fill: "currentColor",
        fontSize: 20,
        fontWeight: 700,
        textAnchor: "middle",
        className: "overdose-peak-label"
      }),

      // Latest marker.
      Plot.dot([last], {
        x: "date",
        y: "deaths",
        r: 6,
        fill: colors.blue,
        stroke: "var(--theme-background)",
        strokeWidth: 2,
        className: "overdose-latest-marker"
      }),

      // Larger latest-value annotation.
      Plot.text([last], {
        x: "date",
        y: "deaths",
        dy: 26,
        dx: -5,
        textAnchor: "end",
        text: d => `${fmtNum(d.deaths)}*`,
        fill: "currentColor",
        fontSize: 20,
        fontWeight: 700,
        className: "overdose-latest-label"
      }),

      // Hover crosshair.
      Plot.ruleX(
        data,
        Plot.pointerX({
          x: "date",
          stroke: colors.muted,
          strokeOpacity: 0.45
        })
      ),

      // Hover point.
      Plot.dot(
        data,
        Plot.pointerX({
          x: "date",
          y: "deaths",
          r: 5,
          fill: colors.blue,
          stroke: "var(--theme-background)",
          strokeWidth: 2
        })
      ),

      // Hover tooltip.
      Plot.tip(
        data,
        Plot.pointerX({
          x: "date",
          y: "deaths",
          title: d => [
            `12 months ending ${fmtMonth(d.date)}`,
            `Deaths: ${fmtNum(d.deaths)}`,
            d.date >= provisionalStart
              ? "Provisional estimate"
              : null
          ].filter(Boolean).join("\n")
        })
      )
    ]
  });
}
```

```js
// Create the Observable Plot chart once.
// Scroll animations change the appearance of its existing marks.
const chartContainer = html`
  <div class="overdose-graphic"></div>
`;

const chartWidth = 1100;
const plot = overdoseChart(chartWidth);

chartContainer.append(plot);

const plotSvg = d3.select(plot);

// Reveal animation.
const clipId =
  `overdose-reveal-${Math.random().toString(36).slice(2)}`;

const revealRect = plotSvg.append("defs")
  .append("clipPath")
  .attr("id", clipId)
  .append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 0)
  .attr("height", 1000);

const lineMarks = plotSvg.selectAll(
  ".overdose-before, .overdose-after, .overdose-provisional"
);

lineMarks.attr("clip-path", `url(#${clipId})`);

const beforeMark =
  plotSvg.selectAll(".overdose-before");

const afterMark =
  plotSvg.selectAll(".overdose-after");

const provisionalMark =
  plotSvg.selectAll(".overdose-provisional");

const bandMark =
  plotSvg.selectAll(".overdose-band");

const peakMarks = plotSvg.selectAll(
  ".overdose-peak-marker, .overdose-peak-label"
);

const latestMarks = plotSvg.selectAll(
  ".overdose-latest-marker, .overdose-latest-label"
);

bandMark.attr("opacity", 0);
peakMarks.attr("opacity", 0);
latestMarks.attr("opacity", 0);
```

```js
const overdoseHeading = html`
  <div class="overdose-heading" aria-live="polite">
    <div class="overdose-stat"></div>
    <h2 class="overdose-title"></h2>
    <p class="overdose-description"></p>
  </div>
`;

const overdoseGraphic = html`
  <div>
    ${chartContainer}

    <div class="overdose-caption">
      Rolling 12-month overdose deaths.
      Dashed values are provisional.
    </div>
  </div>
`;

const overdoseScrollTrack = html`
  <div class="overdose-scroll-track" aria-hidden="true">
    ${overdoseStories.map((story, i) => html`
      <div
        class="overdose-scroll-step"
        data-stage="${i}"
      ></div>
    `)}
  </div>
`;

const overdoseSection = html`
  <div class="overdose-scrolly">

    <div class="overdose-sticky">
      ${overdoseHeading}
      ${overdoseGraphic}
    </div>

    ${overdoseScrollTrack}

  </div>
`;
```

${overdoseSection}

```js
const statElement =
  overdoseHeading.querySelector(".overdose-stat");

const titleElement =
  overdoseHeading.querySelector(".overdose-title");

const descriptionElement =
  overdoseHeading.querySelector(".overdose-description");

let activeOverdoseStage = -1;

function renderOverdose(stageIndex) {
  const story = overdoseStories[stageIndex];

  statElement.textContent = story.statistic;
  titleElement.textContent = story.title;
  descriptionElement.textContent = story.description;

  statElement.style.display =
    story.statistic ? "block" : "none";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const duration = reducedMotion ? 0 : 1200;
  const fade = reducedMotion ? 0 : 500;

  // Stage 0: reveal the complete line.
  revealRect
    .interrupt()
    .transition()
    .duration(stageIndex === 0 ? duration * 1.6 : duration)
    .ease(d3.easeCubicInOut)
    .attr("width", chartWidth);

  // Stage 1: emphasize the peak.
  peakMarks
    .interrupt()
    .transition()
    .duration(fade)
    .attr("opacity", stageIndex === 1 ? 1 : 0);

  // Stage 2: highlight the decline.
  beforeMark
    .interrupt()
    .transition()
    .duration(fade)
    .attr(
      "stroke",
      stageIndex === 2 ? colors.lightBlue : colors.blue
    );

  afterMark
    .interrupt()
    .transition()
    .duration(fade)
    .attr("stroke", colors.blue);

  provisionalMark
    .interrupt()
    .transition()
    .duration(fade)
    .attr("stroke", colors.blue);

  // Stage 3: show provisional shading and latest value.
  bandMark
    .interrupt()
    .transition()
    .duration(fade)
    .attr("opacity", stageIndex === 3 ? 1 : 0);

  latestMarks
    .interrupt()
    .transition()
    .duration(fade)
    .attr("opacity", stageIndex === 3 ? 1 : 0);
}

function getOverdoseStage() {
  const bounds = overdoseSection.getBoundingClientRect();

  const position =
    (window.innerHeight * 0.5 - bounds.top) /
    window.innerHeight;

  return Math.max(
    0,
    Math.min(
      overdoseStories.length - 1,
      Math.floor(position)
    )
  );
}

function handleOverdoseScroll() {
  if (!overdoseSection.isConnected) return;

  const nextStage = getOverdoseStage();

  if (nextStage !== activeOverdoseStage) {
    activeOverdoseStage = nextStage;
    renderOverdose(nextStage);
  }
}

window.addEventListener(
  "scroll",
  handleOverdoseScroll,
  {passive: true}
);

window.addEventListener(
  "resize",
  handleOverdoseScroll
);

const overdoseFrame =
  requestAnimationFrame(handleOverdoseScroll);

invalidation.then(() => {
  cancelAnimationFrame(overdoseFrame);

  revealRect.interrupt();
  beforeMark.interrupt();
  afterMark.interrupt();
  provisionalMark.interrupt();
  bandMark.interrupt();
  peakMarks.interrupt();
  latestMarks.interrupt();

  window.removeEventListener(
    "scroll",
    handleOverdoseScroll
  );

  window.removeEventListener(
    "resize",
    handleOverdoseScroll
  );
});
```

*Source: CDC National Center for Health Statistics, Vital Statistics Rapid Release (VSRR), Provisional Drug Overdose Death Counts. Figures are rolling 12-month totals rather than individual calendar-year counts.*

<details class="overdose-data">
<summary>View data table</summary>

```js
Inputs.table(data.slice().reverse(), {
  columns: ["date", "deaths", "pctPending"],

  header: {
    date: "12 months ending",
    deaths: "Deaths",
    pctPending: "% pending investigation"
  },

  format: {
    date: fmtMonth,
    deaths: fmtNum,
    pctPending: d =>
      d == null ? "—" : `${d.toFixed(2)}%`
  },

  rows: 12
})
```

</details>