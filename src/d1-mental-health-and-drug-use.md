---
title: Mental Illness & Drug Use
toc: false
theme: [air, wide]
---

# Mental Illness & Drug Use

```js
const data = await FileAttachment("data/nsduh_2025_cleaned.csv").csv({typed: true});

const colors = {
  mental: "#2468A2",
  drug: "#E58A9D",
  both: "#754387",
  neutral: "#D4D6D8",
  text: "#222222"
};

const totalAdults = d3.sum(data, d => d.survey_weight);

const totalMentalIllness = d3.sum(
  data.filter(d => d.mental_illness === 1),
  d => d.survey_weight
);

const totalDrugUseDisorder = d3.sum(
  data.filter(d => d.drug_use_disorder === 1),
  d => d.survey_weight
);

const mentalIllnessPercent =
  totalMentalIllness / totalAdults * 100;

const drugUseDisorderPercent =
  totalDrugUseDisorder / totalAdults * 100;

const adultsWithDrugUseDisorder = data.filter(
  d => d.drug_use_disorder === 1
);

const adultsWithBothConditions = adultsWithDrugUseDisorder.filter(
  d => d.mental_illness === 1
);

const totalWithBothConditions = d3.sum(
  adultsWithBothConditions,
  d => d.survey_weight
);

const bothConditionsPercent =
  totalWithBothConditions / totalAdults * 100;

const overlapPercent =
  totalWithBothConditions / totalDrugUseDisorder * 100;

const withoutMentalIllnessPercent =
  100 - overlapPercent;

const mentalOnlyPercent =
  mentalIllnessPercent - bothConditionsPercent;

const overlapMillions =
  (totalWithBothConditions / 1000000).toFixed(1);
```

<style>
  #observablehq-main {
    max-width: none !important;
    width: 100%;
    box-sizing: border-box;
    padding-left: clamp(24px, 3vw, 64px);
    padding-right: clamp(24px, 3vw, 64px);
  }

  /* DEFINITIONS */

  .condition-definitions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 42px;
    margin: 28px 0 40px;
    padding-bottom: 28px;
    border-bottom: 1px solid #E5E7EB;
  }

  .condition-definition {
    display: flex;
    align-items: flex-start;
    gap: 13px;
  }

  .definition-color {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    margin-top: 6px;
  }

  .condition-definition strong {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 17px;
  }

  .condition-definition p {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 15px;
    line-height: 1.55;
    color: var(--theme-foreground-muted);
    margin: 7px 0 0;
    max-width: 600px;
  }

  /* SCROLLYTELLING LAYOUT */

  .scrolly,
  .intersection-scrolly {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
    column-gap: clamp(28px, 3vw, 60px);
    align-items: start;
    width: 100%;
    margin-top: 20px;
  }

  .scrolly-text,
  .intersection-text {
    min-width: 0;
  }

  .step,
  .intersection-step {
    min-height: 82vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 30px 0;
    box-sizing: border-box;
  }

  .step h2,
  .intersection-step h2 {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(26px, 2.2vw, 36px);
    font-weight: 650;
    line-height: 1.25;
    letter-spacing: -0.015em;
    margin: 0 0 14px;
    max-width: 490px;
  }

  .step p,
  .intersection-step p {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(16px, 1.2vw, 18px);
    line-height: 1.55;
    margin: 0;
    max-width: 440px;
  }

  .statistic {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: clamp(60px, 5.3vw, 92px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
    margin-bottom: 18px;
  }

  .supporting-text {
    font-size: clamp(15px, 1.1vw, 17px) !important;
    color: var(--theme-foreground-muted);
    margin-top: 15px !important;
  }

  /* STICKY VISUALIZATIONS */

  .sticky-chart,
  .intersection-sticky {
    position: sticky;
    top: 10vh;
    height: 80vh;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }

  .sticky-chart svg,
  .intersection-graphic svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: none;
  }

  .chart-caption,
  .intersection-note {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: var(--theme-foreground-muted);
    margin-top: 16px;
    max-width: 700px;
  }

  /* OVERLAPPING BARS */

  .intersection-graphic {
    width: 100%;
    min-width: 0;
  }

  .intersection-context {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 14px;
    min-height: 23px;
  }

  .intersection-context:empty {
    visibility: hidden;
  }

  .intersection-graphic .bar-label {
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-weight: 700;
    letter-spacing: -0.025em;
    fill: #FFFFFF;
    stroke: none;
    pointer-events: none;
  }

  .intersection-legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 22px;
    margin-top: 18px;
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
  }

  .intersection-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .intersection-swatch {
    display: inline-block;
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  .section-source {
    font-size: 13px;
    line-height: 1.6;
    color: var(--theme-foreground-muted);
    margin-top: 14px;
  }

  /* RESPONSIVE LAYOUT */

  @media (max-width: 900px) {
    .scrolly,
    .intersection-scrolly {
      grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
      column-gap: 24px;
    }

    .step h2,
    .intersection-step h2 {
      font-size: 27px;
    }

    .statistic {
      font-size: 62px;
    }
  }

  @media (max-width: 700px) {
    #observablehq-main {
      padding-left: 16px;
      padding-right: 16px;
    }

    .condition-definitions {
      grid-template-columns: 1fr;
      gap: 22px;
    }

    .scrolly,
    .intersection-scrolly {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .scrolly-text,
    .intersection-text {
      width: 100%;
    }

    .sticky-chart,
    .intersection-sticky {
      order: -1;
      align-self: stretch;
      position: sticky;
      top: 0;
      height: auto;
      min-height: 200px;
      background: var(--theme-background);
      z-index: 2;
      padding: 20px 0;
    }

    .step,
    .intersection-step {
      min-height: 72vh;
      padding: 24px 0;
    }

    .statistic {
      font-size: clamp(54px, 12vw, 78px);
    }

    .intersection-context {
      font-size: 14px;
    }

    .intersection-legend {
      font-size: 12px;
      gap: 8px 14px;
    }

    .chart-caption,
    .intersection-note {
      font-size: 12px;
    }
  }
</style>

```js
const definitions = html`
  <div class="condition-definitions">

    <div class="condition-definition">
      <div
        class="definition-color"
        style="background: ${colors.mental}"
      ></div>

      <div>
        <strong>Mental illness</strong>

        <p>
          A mental, behavioral, or emotional disorder, such as
          depression or anxiety. The NSDUH measure excludes
          developmental and substance use disorders.
        </p>
      </div>
    </div>

    <div class="condition-definition">
      <div
        class="definition-color"
        style="background: ${colors.drug}"
      ></div>

      <div>
        <strong>Drug use disorder</strong>

        <p>
          A condition in which drug use meets clinical criteria for
          a substance use disorder, including disorders involving
          cannabis, opioids, or stimulants. Drug use alone
          does not necessarily indicate a disorder.
        </p>
      </div>
    </div>

  </div>
`;
```

${definitions}

## How common are mental illness and drug use disorders?

```js
const dots = d3.range(10).map(index => ({
  index,
  x: 30 + index * 58,
  y: 53
}));

const populationStages = [
  {
    percent: 0,
    color: colors.neutral,
    description: "Ten circles representing the U.S. adult population."
  },
  {
    percent: mentalIllnessPercent,
    color: colors.mental,
    description: `${mentalIllnessPercent.toFixed(1)}% of U.S. adults experienced mental illness in the past year.`
  },
  {
    percent: drugUseDisorderPercent,
    color: colors.drug,
    description: `${drugUseDisorderPercent.toFixed(1)}% of U.S. adults had a drug use disorder in the past year.`
  }
];
```

```js
const populationNarrative = html`
  <div class="scrolly-text">

    <div class="step" data-stage="0">
      <h2>
        How common are mental illness and drug use disorders?
      </h2>

      <p>
        Let's look at each condition before exploring where they overlap.
      </p>
    </div>

    <div class="step" data-stage="1">
      <div
        class="statistic"
        style="color: ${colors.mental}"
      >
        ${mentalIllnessPercent.toFixed(1)}%
      </div>

      <h2>
        of U.S. adults experienced mental illness in the past year.
      </h2>

      <p class="supporting-text">
        Approximately
        ${(totalMentalIllness / 1000000).toFixed(1)}
        million people.
      </p>
    </div>

    <div class="step" data-stage="2">
      <div
        class="statistic"
        style="color: ${colors.drug}"
      >
        ${drugUseDisorderPercent.toFixed(1)}%
      </div>

      <h2>
        of U.S. adults had a drug use disorder in the past year.
      </h2>

      <p class="supporting-text">
        Approximately
        ${(totalDrugUseDisorder / 1000000).toFixed(1)}
        million people.
      </p>
    </div>

  </div>
`;
```

```js
const populationChart = d3.create("svg")
  .attr("viewBox", "0 0 590 106")
  .attr("role", "img")
  .attr("aria-label", populationStages[0].description);

const dotRadius = 24;
const dotDiameter = dotRadius * 2;

const clipPrefix =
  `population-${Math.random().toString(36).slice(2)}`;

const populationDefs = populationChart.append("defs");

populationDefs.selectAll("clipPath")
  .data(dots)
  .join("clipPath")
  .attr("id", d => `${clipPrefix}-${d.index}`)
  .append("circle")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", dotRadius);

populationChart.selectAll(".background-dot")
  .data(dots)
  .join("circle")
  .attr("class", "background-dot")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", dotRadius)
  .attr("fill", colors.neutral);

const coloredDotFills = populationChart.selectAll(".colored-dot")
  .data(dots)
  .join("rect")
  .attr("class", "colored-dot")
  .attr("x", d => d.x - dotRadius)
  .attr("y", d => d.y - dotRadius)
  .attr("width", 0)
  .attr("height", dotDiameter)
  .attr("fill", colors.mental)
  .attr("clip-path", d => `url(#${clipPrefix}-${d.index})`);

const populationSvg = populationChart.node();
```

```js
// Fill each circle proportionally by area.
function circleFillWidth(fraction, radius) {
  if (fraction <= 0) return 0;
  if (fraction >= 1) return radius * 2;

  let lower = -1;
  let upper = 1;

  for (let i = 0; i < 40; i++) {
    const middle = (lower + upper) / 2;

    const areaFraction = (
      Math.acos(-middle) +
      middle * Math.sqrt(Math.max(0, 1 - middle * middle))
    ) / Math.PI;

    if (areaFraction < fraction) {
      lower = middle;
    } else {
      upper = middle;
    }
  }

  return radius * (1 + (lower + upper) / 2);
}

function renderPopulation(stageIndex) {
  const currentStage = populationStages[stageIndex];

  populationSvg.setAttribute(
    "aria-label",
    currentStage.description
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  coloredDotFills
    .interrupt()
    .attr("fill", currentStage.color)
    .transition()
    .duration(reducedMotion ? 0 : 650)
    .ease(d3.easeCubicInOut)
    .attr("width", d => {
      const fraction = Math.max(
        0,
        Math.min(1, (currentStage.percent - d.index * 10) / 10)
      );

      return circleFillWidth(fraction, dotRadius);
    });
}
```

```js
const populationSection = html`
  <div class="scrolly">

    ${populationNarrative}

    <div class="sticky-chart">

      ${populationSvg}

      <div class="chart-caption">
        Each circle represents 10% of U.S. adults.
        Partial fills show survey-weighted proportions.
      </div>

    </div>

  </div>
`;
```

${populationSection}

```js
const populationSteps =
  populationNarrative.querySelectorAll(".step");

function getPopulationStage() {
  const screenMiddle = window.innerHeight / 2;

  let closestStage = 0;
  let closestDistance = Infinity;

  populationSteps.forEach(step => {
    const bounds = step.getBoundingClientRect();
    const middle = bounds.top + bounds.height / 2;
    const distance = Math.abs(middle - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStage = Number(step.dataset.stage);
    }
  });

  return closestStage;
}

let activePopulationStage = -1;

function handlePopulationScroll() {
  if (!populationSection.isConnected) return;

  const nextStage = getPopulationStage();

  if (nextStage !== activePopulationStage) {
    activePopulationStage = nextStage;
    renderPopulation(nextStage);
  }
}

window.addEventListener(
  "scroll",
  handlePopulationScroll,
  {passive: true}
);

window.addEventListener(
  "resize",
  handlePopulationScroll
);

const populationFrame =
  requestAnimationFrame(handlePopulationScroll);

invalidation.then(() => {
  cancelAnimationFrame(populationFrame);

  coloredDotFills.interrupt();

  window.removeEventListener(
    "scroll",
    handlePopulationScroll
  );

  window.removeEventListener(
    "resize",
    handlePopulationScroll
  );
});
```

<div class="section-source">
Source: SAMHSA, 2025 National Survey on Drug Use and Health (NSDUH). Survey-weighted estimates for U.S. adults aged 18 and older.
</div>

---

## How often do these conditions overlap?

```js
// Initial bars use all U.S. adults as their denominator.
const intersectionLeft = 20;
const intersectionScale = 700 / 30;

const mentalBarWidth =
  mentalIllnessPercent * intersectionScale;

const drugBarWidth =
  drugUseDisorderPercent * intersectionScale;

const combinedDrugX =
  intersectionLeft + mentalOnlyPercent * intersectionScale;

const intersectionWidth =
  bothConditionsPercent * intersectionScale;

// Final bar uses adults with a drug use disorder.
const zoomBarWidth = 700;

const zoomOverlapWidth =
  zoomBarWidth * overlapPercent / 100;

// Taller bars.
const originalHeight = 110;
const finalHeight = 130;

const initialBlueY = 20;
const initialPinkY = 165;
const zoomY = 75;

const originalLabelY =
  initialBlueY + originalHeight / 2;

const zoomLabelY =
  zoomY + finalHeight / 2;
```

```js
const intersectionGraphic = html`
  <div class="intersection-graphic">

    <div class="intersection-context"></div>

    <svg
      viewBox="0 0 760 300"
      role="img"
      aria-label="${overlapMillions} million adults experienced both conditions. ${overlapPercent.toFixed(1)} percent of adults with a drug use disorder also experienced mental illness."
    >

      <rect
        class="intersection-mental"
        x="${intersectionLeft}"
        y="${initialBlueY}"
        width="${mentalBarWidth}"
        height="${originalHeight}"
        fill="${colors.mental}"
      />

      <rect
        class="intersection-drug"
        x="${intersectionLeft}"
        y="${initialPinkY}"
        width="${drugBarWidth}"
        height="${originalHeight}"
        fill="${colors.drug}"
      />

      <rect
        class="intersection-purple"
        x="${combinedDrugX}"
        y="${initialBlueY}"
        width="${intersectionWidth}"
        height="${originalHeight}"
        fill="${colors.both}"
        opacity="0"
      />

      <text
        class="intersection-overlap-label bar-label"
        x="${combinedDrugX + intersectionWidth / 2}"
        y="${originalLabelY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="26"
        opacity="0"
      >${overlapMillions}M</text>

      <text
        class="intersection-zoom-purple-label bar-label"
        x="${intersectionLeft + zoomOverlapWidth / 2}"
        y="${zoomLabelY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="37"
        opacity="0"
      >${overlapPercent.toFixed(1)}%</text>

      <text
        class="intersection-zoom-pink-label bar-label"
        x="${intersectionLeft + zoomOverlapWidth + (zoomBarWidth - zoomOverlapWidth) / 2}"
        y="${zoomLabelY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="37"
        opacity="0"
      >${withoutMentalIllnessPercent.toFixed(1)}%</text>

    </svg>

    <div class="intersection-legend">

      <div class="intersection-legend-item" data-legend="mental">
        <span
          class="intersection-swatch"
          style="background: ${colors.mental}"
        ></span>
        Mental illness
      </div>

      <div class="intersection-legend-item" data-legend="drug">
        <span
          class="intersection-swatch"
          style="background: ${colors.drug}"
        ></span>
        <span class="drug-legend-label">
          Drug use disorder
        </span>
      </div>

      <div class="intersection-legend-item" data-legend="both">
        <span
          class="intersection-swatch"
          style="background: ${colors.both}"
        ></span>
        Both conditions
      </div>

    </div>

    <div class="intersection-note"></div>

  </div>
`;
```

```js
const intersectionNarrative = html`
  <div class="intersection-text">

    <div class="intersection-step" data-stage="0">
      <h2>But these groups overlap.</h2>

      <p>
        Some adults experience both conditions.
      </p>
    </div>

    <div class="intersection-step" data-stage="1">
      <h2>Two conditions. Some of the same people.</h2>

      <p>
        Purple represents adults who experienced both.
      </p>
    </div>

    <div class="intersection-step" data-stage="2">
      <div
        class="statistic"
        style="color: ${colors.both}"
      >
        ${overlapMillions} million
      </div>

      <h2>
        adults experienced both conditions in the past year.
      </h2>
    </div>

    <div class="intersection-step" data-stage="3">
      <h2>
        Now focus on adults with a drug use disorder.
      </h2>

      <p>
        What happens when we look only at this group?
      </p>
    </div>

    <div class="intersection-step" data-stage="4">
      <h2>Let's zoom in.</h2>

      <p>
        The full bar now represents all adults with
        a drug use disorder.
      </p>
    </div>

    <div class="intersection-step" data-stage="5">
      <div
        class="statistic"
        style="color: ${colors.both}"
      >
        ${overlapPercent.toFixed(1)}%
      </div>

      <h2>
        of adults with a drug use disorder also experienced mental illness.
      </h2>
    </div>

  </div>
`;
```

```js
const intersectionSection = html`
  <div class="intersection-scrolly">

    ${intersectionNarrative}

    <div class="intersection-sticky">
      ${intersectionGraphic}
    </div>

  </div>
`;
```

${intersectionSection}

```js
const intersectionSteps =
  intersectionNarrative.querySelectorAll(".intersection-step");

const mentalBar =
  d3.select(intersectionGraphic).select(".intersection-mental");

const drugBar =
  d3.select(intersectionGraphic).select(".intersection-drug");

const purpleBar =
  d3.select(intersectionGraphic).select(".intersection-purple");

const overlapLabel =
  d3.select(intersectionGraphic).select(".intersection-overlap-label");

const zoomPurpleLabel =
  d3.select(intersectionGraphic).select(".intersection-zoom-purple-label");

const zoomPinkLabel =
  d3.select(intersectionGraphic).select(".intersection-zoom-pink-label");

const intersectionContext =
  intersectionGraphic.querySelector(".intersection-context");

const intersectionNote =
  intersectionGraphic.querySelector(".intersection-note");

const mentalLegend =
  intersectionGraphic.querySelector('[data-legend="mental"]');

const drugLegendLabel =
  intersectionGraphic.querySelector(".drug-legend-label");
```

```js
function renderIntersection(stageIndex) {
  const combined = stageIndex >= 1 && stageIndex <= 3;
  const zoomed = stageIndex >= 4;
  const reveal = stageIndex === 5;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const duration = reducedMotion ? 0 : 1400;
  const fadeDuration = reducedMotion ? 0 : 450;
  const zoomDelay = zoomed ? fadeDuration : 0;

  intersectionContext.textContent = zoomed
    ? "Among adults with a drug use disorder"
    : "";

  mentalLegend.style.display =
    stageIndex >= 3 ? "none" : "inline-flex";

  drugLegendLabel.textContent = zoomed
    ? "Drug use disorder only"
    : "Drug use disorder";

  intersectionNote.textContent = zoomed
    ? "The full bar represents adults with a drug use disorder."
    : "";

  // Fade blue before expanding the drug-use-disorder bar.
  mentalBar
    .interrupt()
    .transition()
    .duration(fadeDuration)
    .attr("opacity", stageIndex >= 3 ? 0 : 1);

  // Move pink into the overlap, then expand it.
  drugBar
    .interrupt()
    .transition()
    .delay(zoomDelay)
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr(
      "x",
      zoomed
        ? intersectionLeft
        : combined
          ? combinedDrugX
          : intersectionLeft
    )
    .attr(
      "y",
      zoomed
        ? zoomY
        : combined
          ? initialBlueY
          : initialPinkY
    )
    .attr(
      "width",
      zoomed ? zoomBarWidth : drugBarWidth
    )
    .attr(
      "height",
      zoomed ? finalHeight : originalHeight
    );

  // Purple represents adults experiencing both conditions.
  purpleBar
    .interrupt()
    .transition()
    .delay(zoomDelay)
    .duration(duration)
    .ease(d3.easeCubicInOut)
    .attr(
      "x",
      zoomed ? intersectionLeft : combinedDrugX
    )
    .attr(
      "y",
      zoomed ? zoomY : initialBlueY
    )
    .attr(
      "width",
      zoomed ? zoomOverlapWidth : intersectionWidth
    )
    .attr(
      "height",
      zoomed ? finalHeight : originalHeight
    )
    .attr(
      "opacity",
      stageIndex >= 1 ? 1 : 0
    );

  // Show the number of adults with both conditions.
  overlapLabel
    .interrupt()
    .transition()
    .duration(fadeDuration)
    .attr("opacity", stageIndex === 2 ? 1 : 0);

  // Show both percentages at the final stage.
  zoomPurpleLabel
    .interrupt()
    .transition()
    .delay(reveal ? fadeDuration : 0)
    .duration(fadeDuration)
    .attr("opacity", reveal ? 1 : 0);

  zoomPinkLabel
    .interrupt()
    .transition()
    .delay(reveal ? fadeDuration : 0)
    .duration(fadeDuration)
    .attr("opacity", reveal ? 1 : 0);
}
```

```js
function getIntersectionStage() {
  const screenMiddle = window.innerHeight / 2;

  let closestStage = 0;
  let closestDistance = Infinity;

  intersectionSteps.forEach(step => {
    const bounds = step.getBoundingClientRect();
    const middle = bounds.top + bounds.height / 2;
    const distance = Math.abs(middle - screenMiddle);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStage = Number(step.dataset.stage);
    }
  });

  return closestStage;
}

let activeIntersectionStage = -1;

function handleIntersectionScroll() {
  if (!intersectionSection.isConnected) return;

  const nextStage = getIntersectionStage();

  if (nextStage !== activeIntersectionStage) {
    activeIntersectionStage = nextStage;
    renderIntersection(nextStage);
  }
}

window.addEventListener(
  "scroll",
  handleIntersectionScroll,
  {passive: true}
);

window.addEventListener(
  "resize",
  handleIntersectionScroll
);

const intersectionFrame =
  requestAnimationFrame(handleIntersectionScroll);

invalidation.then(() => {
  cancelAnimationFrame(intersectionFrame);

  mentalBar.interrupt();
  drugBar.interrupt();
  purpleBar.interrupt();
  overlapLabel.interrupt();
  zoomPurpleLabel.interrupt();
  zoomPinkLabel.interrupt();

  window.removeEventListener(
    "scroll",
    handleIntersectionScroll
  );

  window.removeEventListener(
    "resize",
    handleIntersectionScroll
  );
});
```

<div class="section-source">
Source: SAMHSA, 2025 National Survey on Drug Use and Health (NSDUH). Survey-weighted estimates for U.S. adults aged 18 and older.
</div>