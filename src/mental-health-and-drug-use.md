---
title: Treatment Gap in the U.S.
toc: false
---

```js
// Load data
const data = await FileAttachment("data/nsduh_2025_cleaned.csv").csv({typed: true});
```

```js
// Color scheme (blue + pink = purple for both)
const colors = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neutral: "#D4D6D8",
  text: "#222222"
};
```

<style>
  /* Text on the left, chart on the right */
  .scrolly {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }

  /* Give each section some breathing room */
  .step {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Keep the chart in place while the text scrolls */
  .sticky-chart {
    position: sticky;
    top: 20vh;
  }

  /* Adjust for smaller screens */
  @media (max-width: 700px) {
    .scrolly {
      grid-template-columns: 1fr;
    }

    .sticky-chart {
      grid-row: 1;
      position: sticky;
      top: 0;
      background: var(--theme-background);
      z-index: 1;
    }

    .sticky-chart svg {
      max-height: 35vh;
      width: auto;
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

// Convert population estimates into percentages
const mentalIllnessPercent = (totalMentalIllness / totalAdults) * 100;
const drugUseDisorderPercent = (totalDrugUseDisorder / totalAdults) * 100;
```

```js
// Create our 100 dots (10 rows of 10)
const dots = d3.range(100).map(i => ({
  index: i,
  x: i % 10,
  y: Math.floor(i / 10)
}));
```

```js
// What should the chart look like at each point in the story?
const stages = [
  {
    label: "All U.S. adults",
    headline: "Start with 100 American adults.",
    description: "Each dot represents approximately 1% of the U.S. adult population.",
    percent: 0,
    color: colors.neutral
  },
  {
    label: "Mental illness",
    headline: "How common is mental illness?",
    description: `${mentalIllnessPercent.toFixed(1)}% of U.S. adults experienced mental illness in the past year.`,
    percent: mentalIllnessPercent,
    color: colors.mental
  },
  {
    label: "Drug use disorder",
    headline: "How common are drug use disorders?",
    description: `${drugUseDisorderPercent.toFixed(1)}% of U.S. adults had a drug use disorder in the past year.`,
    percent: drugUseDisorderPercent,
    color: colors.drug
  }
];
```

```js
// Create a home for the chart
const chartContainer = html`<div id="population-chart"></div>`;
```

```js
// Create the three sections of text
const narrative = html`
  <div class="narrative">

    <div class="step" data-stage="0">
      <h2>Start with 100 American adults.</h2>

      <p>Each dot represents approximately 1% of the U.S. adult population.</p>
    </div>

    <div class="step" data-stage="1">
      <h1>${mentalIllnessPercent.toFixed(1)}%</h1>

      <h2>Of U.S. adults experienced mental illness in the past year.</h2>

      <p>That represents approximately ${(totalMentalIllness / 1000000).toFixed(1)} million adults.</p>
    </div>

    <div class="step" data-stage="2">
      <h1>${drugUseDisorderPercent.toFixed(1)}%</h1>

      <h2>Of U.S. adults had a drug use disorder in the past year.</h2>

      <p>That represents approximately ${(totalDrugUseDisorder / 1000000).toFixed(1)} million adults.</p>
    </div>

  </div>
`;
```

## Chapter 1: The Scale

<div class="scrolly">
  ${narrative}
  <div class="sticky-chart">
    ${chartContainer}
    <p>Each dot represents approximately 1% of U.S. adults.</p>
  </div>
</div>

```js
// Grab the three sections of text
const narrativeSteps = narrative.querySelectorAll(".step");

// Update the same chart instead of making three separate ones
function renderPopulation(stageIndex) {

  // Figure out which stage we're on
  const currentStage = stages[stageIndex];

  const chart = Plot.plot({
    width: 320,
    height: 320,
    margin: 15,

    // No need for axes since this is just a grid
    x: {axis: null, domain: [0, 9]},
    y: {axis: null, domain: [0, 9], reverse: true},

    ariaLabel: currentStage.description,

    marks: [
      Plot.dot(dots, {
        x: "x",
        y: "y",

        // Keep all dots the same size
        r: 12,

        // Color in the relevant dots and leave the rest gray
        fill: d => d.index < Math.round(currentStage.percent)
          ? currentStage.color
          : colors.neutral
      })
    ]
  });

  // Replace the old chart so we don't end up with multiple charts
  chartContainer.replaceChildren(chart);
}

// Start with everyone in gray
renderPopulation(0);

// Figure out which section the reader is looking at
function updatePopulation() {

  const screenMiddle = window.innerHeight / 2;
  let closestStep = 0;
  let closestDistance = Infinity;

  narrativeSteps.forEach(step => {

    // Find the middle of each section
    const bounds = step.getBoundingClientRect();
    const stepMiddle = bounds.top + bounds.height / 2;

    // How close is this section to the middle of the screen?
    const distance = Math.abs(stepMiddle - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStep = Number(step.dataset.stage);
    }

  });

  return closestStep;
}

// Keep track of where we are in the story
let activeStage = 0;

// Update the chart as the reader scrolls
function handleScroll() {

  // Make sure everything is actually on the page first
  if (!narrative.isConnected || !chartContainer.isConnected) {
    return;
  }

  const nextStage = updatePopulation();

  // Only redraw if something actually changed
  if (nextStage !== activeStage) {
    activeStage = nextStage;
    renderPopulation(activeStage);
  }

}

// Listen for scrolling
window.addEventListener("scroll", handleScroll, {passive: true});

// Account for changes in window size too
window.addEventListener("resize", handleScroll);

// Check the current stage once the page has rendered
const initialFrame = requestAnimationFrame(handleScroll);

// Clean up if Observable reruns the code
invalidation.then(() => {
  cancelAnimationFrame(initialFrame);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleScroll);
});
```

*Source: 2025 National Survey on Drug Use and Health (NSDUH). Estimates are survey weighted.*