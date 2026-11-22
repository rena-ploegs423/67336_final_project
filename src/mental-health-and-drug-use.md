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
// Give the chart somewhere to live
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


## Q4: Among adults who have both a mental illness and a drug use disorder, how many receive treatment for both conditions, for only one, or for neither? 
## The Treatment Gap

```js
// Adults experiencing both conditions
const bothConditions = data.filter(d =>
  d.mental_illness === 1 &&
  d.drug_use_disorder === 1
);

const totalBothConditions = d3.sum(bothConditions, d => d.survey_weight);

// Sort everyone by the treatment they received
function getTreatmentCategory(d) {
  const mental = d.mental_health_treatment;
  const drug = d.drug_treatment;

  if (mental === 1 && drug === 1) return "Both treatments";
  if (mental === 1 && drug === 0) return "Mental health only";
  if (mental === 0 && drug === 1) return "Drug treatment only";
  if (mental === 0 && drug === 0) return "Neither";
  return "Unspecified";
}

const treatmentCategories = [
  {category: "Both treatments", color: colors.both},
  {category: "Mental health only", color: colors.mental},
  {category: "Drug treatment only", color: colors.drug},
  {category: "Neither", color: colors.neutral},
  {category: "Unspecified", color: "#FFFFFF"}
];

// Calculate percentages using survey weights
const treatmentResults = treatmentCategories.map(group => {
  const weight = d3.sum(
    bothConditions.filter(d => getTreatmentCategory(d) === group.category),
    d => d.survey_weight
  );

  return {
    ...group,
    percent: weight / totalBothConditions * 100
  };
});

const bothTreatmentPercent = treatmentResults[0].percent;
const mentalOnlyPercent = treatmentResults[1].percent;
const drugOnlyPercent = treatmentResults[2].percent;
const neitherPercent = treatmentResults[3].percent;
```

```js
// Build the stacked bar
// Draw the treatment bar using the actual percentages
const treatmentBar = d3.create("svg")
  .attr("viewBox", "0 0 1000 70")
  .attr("width", "100%")
  .attr("height", 70)
  .attr("role", "img")
  .attr("aria-label", "Treatment received among adults with both conditions")
  .node();

// Figure out where each section starts
let barPosition = 0;

const treatmentBarData = treatmentResults.map(d => {
  const result = {
    ...d,
    start: barPosition
  };

  barPosition += d.percent;
  return result;
});

// Add the colored sections
d3.select(treatmentBar)
  .selectAll("rect")
  .data(treatmentBarData)
  .join("rect")
  .attr("class", "treatment-segment")
  .attr("data-category", d => d.category)
  .attr("x", d => d.start * 10)
  .attr("y", 0)
  .attr("width", d => d.percent * 10)
  .attr("height", 70)
  .attr("fill", d => d.color)
  .attr("stroke", "#888")
  .attr("stroke-width", 1);

const treatmentChart = html`
  <div class="treatment-visual">
    ${treatmentBar}

    <div class="treatment-axis">
      <span>0%</span>
      <span>100%</span>
    </div>

    <div class="treatment-legend">
      ${treatmentResults.map(d => html`
        <div class="treatment-legend-item" data-category="${d.category}">
          <span class="treatment-swatch"
            style="background: ${d.color};"></span>
          <span>${d.category}</span>
          <strong>${d.percent.toFixed(1)}%</strong>
        </div>
      `)}
    </div>

    <p class="chart-caption">
      Among U.S. adults experiencing both conditions, 2025.
      Percentages are survey-weighted.
    </p>
  </div>
`;
```

```js
// Text that appears as we scroll
const treatmentNarrative = html`
  <div class="narrative">

    <div class="step" data-stage="0">
      <h2>What happens when someone experiences both conditions?</h2>
      <p>How many receive treatment for both, only one, or neither?</p>
    </div>

    <div class="step" data-stage="1">
      <div class="statistic" style="color: ${colors.both}">
        ${bothTreatmentPercent.toFixed(1)}%
      </div>
      <h2>Received treatment for both conditions.</h2>
    </div>

    <div class="step" data-stage="2">
      <div class="statistic" style="color: ${colors.mental}">
        ${mentalOnlyPercent.toFixed(1)}%
      </div>
      <h2>Received mental health treatment only.</h2>
      <p>Compared with ${drugOnlyPercent.toFixed(1)}% who received drug treatment only.</p>
    </div>

    <div class="step" data-stage="3">
      <div class="statistic" style="color: ${colors.text}">
        ${neitherPercent.toFixed(1)}%
      </div>
      <h2>Received neither type of treatment.</h2>
    </div>

    <div class="step" data-stage="4">
      <h2>Most adults with both conditions did not receive both types of treatment.</h2>
      <p>Here's how treatment was distributed across the population.</p>
    </div>

  </div>
`;
```

<style>
  .treatment-bar {
    display: flex;
    height: 72px;
    width: 100%;
    overflow: hidden;
  }

  .treatment-segment {
    box-sizing: border-box;
    height: 100%;
    border-right: 2px solid var(--theme-background);
    transition: opacity 400ms ease;
  }

  .treatment-axis {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--theme-foreground-muted);
    margin-top: 8px;
  }

  .treatment-legend {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }

  .treatment-legend-item {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    transition: opacity 400ms ease;
  }

  .treatment-swatch {
    width: 12px;
    height: 12px;
    border: 1px solid #888;
    box-sizing: border-box;
  }

  @media (prefers-reduced-motion: reduce) {
    .treatment-segment,
    .treatment-legend-item {
      transition: none;
    }
  }
</style>

<div class="scrolly">
  ${treatmentNarrative}

  <div class="sticky-chart">
    ${treatmentChart}
  </div>
</div>

```js
// Highlight the relevant categories as we scroll
const treatmentSteps = treatmentNarrative.querySelectorAll(".step");
const treatmentSegments = treatmentChart.querySelectorAll(".treatment-segment");
const treatmentLegendItems = treatmentChart.querySelectorAll(".treatment-legend-item");

const treatmentHighlights = [
  [],
  ["Both treatments"],
  ["Mental health only", "Drug treatment only"],
  ["Neither"],
  []
];

function renderTreatment(stageIndex) {
  const highlighted = treatmentHighlights[stageIndex];
  const showAll = highlighted.length === 0;

  treatmentSegments.forEach(segment => {
    segment.style.opacity =
      showAll || highlighted.includes(segment.dataset.category) ? "1" : "0.25";
  });

  treatmentLegendItems.forEach(item => {
    item.style.opacity =
      showAll || highlighted.includes(item.dataset.category) ? "1" : "0.4";
  });
}

function getTreatmentStage() {
  const screenMiddle = window.innerHeight / 2;
  let closestStage = 0;
  let closestDistance = Infinity;

  treatmentSteps.forEach(step => {
    const bounds = step.getBoundingClientRect();
    const distance = Math.abs(bounds.top + bounds.height / 2 - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStage = Number(step.dataset.stage);
    }
  });

  return closestStage;
}

let activeTreatmentStage = 0;

function handleTreatmentScroll() {
  if (!treatmentNarrative.isConnected || !treatmentChart.isConnected) return;

  const nextStage = getTreatmentStage();

  if (nextStage !== activeTreatmentStage) {
    activeTreatmentStage = nextStage;
    renderTreatment(activeTreatmentStage);
  }
}

renderTreatment(0);

window.addEventListener("scroll", handleTreatmentScroll, {passive: true});
window.addEventListener("resize", handleTreatmentScroll);

const treatmentFrame = requestAnimationFrame(handleTreatmentScroll);

invalidation.then(() => {
  cancelAnimationFrame(treatmentFrame);
  window.removeEventListener("scroll", handleTreatmentScroll);
  window.removeEventListener("resize", handleTreatmentScroll);
});
```

*Source: SAMHSA, 2025 National Survey on Drug Use and Health. Treatment refers to care reported in the past year. Receiving both types of treatment does not necessarily mean receiving coordinated care. Unspecified treatment responses are shown separately.*