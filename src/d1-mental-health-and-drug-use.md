---
title: Treatment Gap in the U.S.
toc: false
---

# Treatment Gap in the U.S.

```js
// Load data
const data = await FileAttachment("data/nsduh_2025_cleaned.csv").csv({typed: true});
```

```js
// Color scheme
const colors = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neutral: "#D4D6D8",
  text: "#222222"
};
```

## Q1 & Q2: How common is mental illness among adults in the U.S.? How common are drug use disorders among adults in the U.S.?

<style>
  /* Text on the left, chart on the right */
  .scrolly {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }

  .step {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Keep the chart in place while scrolling */
  .sticky-chart {
    position: sticky;
    top: 20vh;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .sticky-chart svg {
    width: 100%;
    height: auto;
  }

  .statistic {
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 700;
    line-height: 1;
    margin-bottom: 16px;
  }

  .chart-caption {
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.7;
    margin-top: 16px;
  }

  /* Adjust for smaller screens */
  @media (max-width: 700px) {
    .scrolly {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .sticky-chart {
      grid-row: 1;
      position: sticky;
      top: 0;
      min-height: auto;
      padding: 24px 0;
      background: var(--theme-background);
      z-index: 1;
    }

    .step {
      min-height: 80vh;
    }
  }
</style>

```js
// Estimate total adult population using survey weights
const totalAdults = d3.sum(
  data,
  d => d.survey_weight
);

// How many adults have a mental illness?
const totalMentalIllness = d3.sum(
  data.filter(d => d.mental_illness === 1),
  d => d.survey_weight
);

// How many adults have a drug use disorder?
const totalDrugUseDisorder = d3.sum(
  data.filter(d => d.drug_use_disorder === 1),
  d => d.survey_weight
);

// Convert to percentages
const mentalIllnessPercent = (totalMentalIllness / totalAdults) * 100;
const drugUseDisorderPercent = (totalDrugUseDisorder / totalAdults) * 100;
```

```js
// Create 10 dots
const dots = d3.range(10).map(i => ({
  index: i,
  x: i,
  y: 0
}));
```

```js
// Three stages of the visualization
const stages = [
  {
    label: "All U.S. adults",
    description: "Ten dots representing the U.S. adult population.",
    percent: 0,
    color: colors.neutral
  },
  {
    label: "Mental illness",
    description: `${mentalIllnessPercent.toFixed(1)}% of U.S. adults experienced mental illness in the past year.`,
    percent: mentalIllnessPercent,
    color: colors.mental
  },
  {
    label: "Drug use disorder",
    description: `${drugUseDisorderPercent.toFixed(1)}% of U.S. adults had a drug use disorder in the past year.`,
    percent: drugUseDisorderPercent,
    color: colors.drug
  }
];
```

```js
// Chart container
const chartContainer = html`<div id="population-chart"></div>`;
```

```js
// Text for each stage
const narrative = html`
  <div class="narrative">

    <div class="step" data-stage="0">

      <h2>Start with 10 U.S. adults.</h2>

      <p>Together, these dots represent the entire U.S. adult population.</p>

    </div>

    <div class="step" data-stage="1">

      <div class="statistic" style="color: ${colors.mental}">
        ${mentalIllnessPercent.toFixed(1)}%
      </div>

      <h2>Of U.S. adults experienced mental illness in the past year.</h2>

      <p>That represents approximately ${(totalMentalIllness / 1000000).toFixed(1)} million adults.</p>

    </div>

    <div class="step" data-stage="2">

      <div class="statistic" style="color: ${colors.drug}">
        ${drugUseDisorderPercent.toFixed(1)}% </div>

      <h2>Of U.S. adults had a drug use disorder in the past year.</h2>

      <p>That represents approximately ${(totalDrugUseDisorder / 1000000).toFixed(1)} million adults.</p>

    </div>

  </div>
`;
```

<div class="scrolly">
  ${narrative}
  <div class="sticky-chart">
    ${chartContainer}
    <p class="chart-caption">
      Each dot represents 10% of U.S. adults.
      Highlighted proportions are rounded to the nearest dot.
    </p>
  </div>
</div>


```js
// Create the initial chart
const populationChart = Plot.plot({
  width: 500,
  height: 70,
  margin: 25,

  x: {axis: null, domain: [0, 9]},
  y: {axis: null, domain: [-1, 1]},

  ariaLabel: stages[0].description,

  marks: [
    Plot.dot(dots, {
      x: "x",
      y: "y",
      r: 19,
      fill: colors.neutral,
      stroke: "none"
    })
  ]
});

chartContainer.replaceChildren(populationChart);

// Grab the dots and narrative sections
const populationDots = d3.select(populationChart)
  .selectAll("circle");

const narrativeSteps = narrative.querySelectorAll(".step");

// Change the colors without rebuilding the chart
function renderPopulation(stageIndex) {

  const currentStage = stages[stageIndex];

  populationChart.setAttribute(
    "aria-label",
    currentStage.description
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  populationDots
    .interrupt()
    .transition()
    .duration(reducedMotion ? 0 : 400)
    .ease(d3.easeCubicInOut)
    .attr("fill", (d, i) =>
      i < Math.round(currentStage.percent / 10)
        ? currentStage.color
        : colors.neutral
    );
}

// Figure out which section is closest to the middle of the screen
function updatePopulation() {

  const screenMiddle = window.innerHeight / 2;
  let closestStep = 0;
  let closestDistance = Infinity;

  narrativeSteps.forEach(step => {

    const bounds = step.getBoundingClientRect();
    const stepMiddle = bounds.top + bounds.height / 2;
    const distance = Math.abs(stepMiddle - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStep = Number(step.dataset.stage);
    }

  });

  return closestStep;
}

let activeStage = 0;

// Update the chart as the reader scrolls
function handleScroll() {

  if (!narrative.isConnected || !chartContainer.isConnected) {
    return;
  }

  const nextStage = updatePopulation();

  if (nextStage !== activeStage) {
    activeStage = nextStage;
    renderPopulation(activeStage);
  }

}

window.addEventListener("scroll", handleScroll, {passive: true});
window.addEventListener("resize", handleScroll);

const initialFrame = requestAnimationFrame(handleScroll);

// Clean up if Observable reruns the code
invalidation.then(() => {
  cancelAnimationFrame(initialFrame);
  populationDots.interrupt();
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleScroll);
});
```
*Source: 2025 National Survey on Drug Use and Health (NSDUH). Estimates are survey weighted and restricted to adults aged 18 and older.*


## When the Conditions Overlap
```js
// Q3: Among adults with a drug use disorder, how many also have mental illness?
// Adults with a drug use disorder
const adultsWithDrugUseDisorder = data.filter(d =>
  d.drug_use_disorder === 1
);

// Of those adults, how many also have mental illness?
const adultsWithBothConditions = adultsWithDrugUseDisorder.filter(d =>
  d.mental_illness === 1
);

// Use survey weights to calculate the percentage
const totalWithDrugUseDisorder = d3.sum(
  adultsWithDrugUseDisorder,
  d => d.survey_weight
);

const totalWithBothConditions = d3.sum(
  adultsWithBothConditions,
  d => d.survey_weight
);

const overlapPercent = (totalWithBothConditions / totalWithDrugUseDisorder) * 100;

```

More than half of adults with a drug use disorder also experienced mental illness in the past year.

```js
// Split adults with drug use disorders into two groups
const overlapResults = [
  {
    category: "Both conditions",
    percent: overlapPercent,
    color: colors.both
  },
  {
    category: "Drug use disorder only",
    percent: 100 - overlapPercent,
    color: colors.drug
  }
];
```

```js
// Show how the population is divided
Plot.plot({
  width: 700,
  height: 100,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 0,
  marginRight: 0,

  x: {axis: null, domain: [0, 100]},
  y: {axis: null},

  marks: [
    Plot.rectX(overlapResults, {
      x1: d => d.category === "Both conditions" ? 0 : overlapPercent,
      x2: d => d.category === "Both conditions" ? overlapPercent : 100,
      y1: 0,
      y2: 1,
      fill: "color",
      stroke: "white",
      strokeWidth: 2,
      tip: true
    })
  ]
})
```

**${overlapPercent.toFixed(1)}%** also experienced mental illness, representing approximately **${(totalWithBothConditions / 1000000).toFixed(1)} million adults**.

*The remaining ${(100 - overlapPercent).toFixed(1)}% had a drug use disorder without past-year mental illness.*